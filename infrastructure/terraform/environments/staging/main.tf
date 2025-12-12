# Party-Time Staging Environment
# FR-22: The system shall be deployed on AWS Infrastructure.
# Phase 1: Foundation - Networking, ECR, and IAM
# Phase 2: Data Layer - KMS, S3, RDS, ElastiCache, Secrets

#------------------------------------------------------------------------------
# Networking Module
# Creates VPC, subnets, NAT Gateway, security groups, and VPC endpoints
#------------------------------------------------------------------------------
module "networking" {
  source = "../../modules/networking"

  project_name       = var.project_name
  environment        = var.environment
  aws_region         = var.aws_region
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones

  # Subnet CIDRs
  public_subnet_cidrs   = var.public_subnet_cidrs
  private_subnet_cidrs  = var.private_subnet_cidrs
  database_subnet_cidrs = var.database_subnet_cidrs

  # Cost optimization: single NAT Gateway for staging
  single_nat_gateway = true
}

#------------------------------------------------------------------------------
# ECR Module
# Creates container repositories for frontend, backend, and celery
#------------------------------------------------------------------------------
module "ecr" {
  source = "../../modules/ecr"

  project_name = var.project_name
  environment  = var.environment
}

#------------------------------------------------------------------------------
# IAM Module
# Creates ECS roles and GitHub Actions OIDC authentication
#------------------------------------------------------------------------------
module "iam" {
  source = "../../modules/iam"

  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region
  github_org   = var.github_org
  github_repo  = var.github_repo

  # Pass ECR ARNs for IAM policies
  ecr_repository_arns = module.ecr.repository_arns
}

#------------------------------------------------------------------------------
# PHASE 2: DATA LAYER
#------------------------------------------------------------------------------

#------------------------------------------------------------------------------
# KMS Module
# Creates customer-managed encryption keys for all data layer resources
#------------------------------------------------------------------------------
module "kms" {
  source = "../../modules/kms"

  project_name            = var.project_name
  environment             = var.environment
  deletion_window_in_days = 7
}

#------------------------------------------------------------------------------
# S3 Module
# Creates storage buckets for assets and uploads
#------------------------------------------------------------------------------
module "s3" {
  source = "../../modules/s3"

  project_name    = var.project_name
  environment     = var.environment
  kms_key_arn     = module.kms.key_arn
  allowed_origins = ["https://staging.celebration-time.com", "http://localhost:3000"]
}

#------------------------------------------------------------------------------
# RDS Module
# Creates PostgreSQL 16 database
#------------------------------------------------------------------------------
module "rds" {
  source = "../../modules/rds"

  project_name = var.project_name
  environment  = var.environment

  # Instance configuration (staging optimized)
  instance_class        = "db.t3.micro"
  allocated_storage     = 20
  max_allocated_storage = 100
  multi_az              = false
  deletion_protection   = false

  # Network configuration (from Phase 1)
  db_subnet_group_name  = module.networking.db_subnet_group_name
  rds_security_group_id = module.networking.rds_security_group_id

  # Encryption
  kms_key_arn = module.kms.key_arn

  # Backup configuration
  backup_retention_period = 7
}

#------------------------------------------------------------------------------
# ElastiCache Module
# Creates Redis 7 cluster for caching and Celery
#------------------------------------------------------------------------------
module "elasticache" {
  source = "../../modules/elasticache"

  project_name = var.project_name
  environment  = var.environment

  # Instance configuration (staging optimized)
  node_type          = "cache.t3.micro"
  num_cache_clusters = 1

  # Network configuration (from Phase 1)
  elasticache_subnet_group_name = module.networking.elasticache_subnet_group_name
  redis_security_group_id       = module.networking.redis_security_group_id

  # Encryption
  kms_key_arn = module.kms.key_arn

  # Backup configuration
  snapshot_retention_limit = 7
}

#------------------------------------------------------------------------------
# Secrets Manager Module
# Stores all application secrets
#------------------------------------------------------------------------------
module "secrets" {
  source = "../../modules/secrets"

  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region
  kms_key_arn  = module.kms.key_arn

  # Database configuration (from RDS module)
  database_endpoint = module.rds.endpoint
  database_host     = module.rds.address
  database_port     = module.rds.port
  database_name     = module.rds.database_name
  database_username = module.rds.username
  database_password = module.rds.password

  # Redis configuration (from ElastiCache module)
  redis_url                 = module.elasticache.redis_url
  celery_broker_url         = module.elasticache.redis_url
  celery_result_backend_url = module.elasticache.celery_result_backend_url

  # Cognito configuration (from existing setup - provide via variables or tfvars)
  cognito_user_pool_id  = var.cognito_user_pool_id
  cognito_client_id     = var.cognito_client_id
  cognito_client_secret = var.cognito_client_secret

  # Third-party API keys (provide via variables or tfvars)
  google_places_api_key = var.google_places_api_key
  google_client_id      = var.google_client_id
  google_client_secret  = var.google_client_secret
  ses_from_email        = var.ses_from_email
}

#------------------------------------------------------------------------------
# PHASE 3: APPLICATION LAYER
#------------------------------------------------------------------------------

#------------------------------------------------------------------------------
# ALB Module
# Creates Application Load Balancer with path-based routing
#------------------------------------------------------------------------------
module "alb" {
  source = "../../modules/alb"

  project_name          = var.project_name
  environment           = var.environment
  vpc_id                = module.networking.vpc_id
  public_subnet_ids     = module.networking.public_subnet_ids
  alb_security_group_id = module.networking.alb_security_group_id
}

#------------------------------------------------------------------------------
# ECS Module
# Creates ECS cluster, task definitions, services, and auto-scaling
#------------------------------------------------------------------------------
module "ecs" {
  source = "../../modules/ecs"

  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region

  # Networking
  vpc_id                = module.networking.vpc_id
  private_subnet_ids    = module.networking.private_subnet_ids
  ecs_security_group_id = module.networking.ecs_security_group_id

  # IAM Roles
  ecs_task_execution_role_arn = module.iam.ecs_task_execution_role_arn
  ecs_task_role_arn           = module.iam.ecs_task_role_arn

  # ECR Repositories
  frontend_repository_url = module.ecr.frontend_repository_url
  backend_repository_url  = module.ecr.backend_repository_url

  # Target Groups (from ALB module)
  frontend_target_group_arn = module.alb.frontend_target_group_arn
  backend_target_group_arn  = module.alb.backend_target_group_arn

  # Secrets
  database_secret_arn = module.secrets.database_secret_arn
  redis_secret_arn    = module.secrets.redis_secret_arn
  app_secret_arn      = module.secrets.app_secret_arn
  cognito_secret_arn  = module.secrets.cognito_secret_arn
  api_keys_secret_arn = module.secrets.api_keys_secret_arn

  # Application URLs (use ALB DNS initially, update to custom domain in Phase 4)
  api_url = "http://${module.alb.alb_dns_name}"
  app_url = "http://${module.alb.alb_dns_name}"

  # Staging scaling configuration (minimal for cost savings)
  frontend_desired_count      = 1
  frontend_min_count          = 1
  frontend_max_count          = 4
  backend_desired_count       = 1
  backend_min_count           = 1
  backend_max_count           = 4
  celery_worker_desired_count = 1
  celery_worker_min_count     = 1
  celery_worker_max_count     = 3

  # Staging resource sizing (minimal)
  frontend_cpu         = 256
  frontend_memory      = 512
  backend_cpu          = 512
  backend_memory       = 1024
  celery_worker_cpu    = 256
  celery_worker_memory = 512
  celery_beat_cpu      = 256
  celery_beat_memory   = 512

  # Log retention
  log_retention_days = 30
}
