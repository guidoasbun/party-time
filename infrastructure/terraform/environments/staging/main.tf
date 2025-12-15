# Party-Time Staging Environment
# FR-22: The system shall be deployed on AWS Infrastructure.
# Phase 1: Foundation - Networking, ECR, and IAM
# Phase 2: Data Layer - KMS, S3, RDS, ElastiCache, Secrets
# Phase 3: Application Layer - ALB, ECS
# Phase 4: DNS & CDN - Route53, ACM, CloudFront

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
# Updated in Phase 4 to include HTTPS listener
#------------------------------------------------------------------------------
module "alb" {
  source = "../../modules/alb"

  project_name          = var.project_name
  environment           = var.environment
  vpc_id                = module.networking.vpc_id
  public_subnet_ids     = module.networking.public_subnet_ids
  alb_security_group_id = module.networking.alb_security_group_id

  # Phase 4: HTTPS support
  enable_https    = true
  certificate_arn = module.acm.certificate_arn
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

  # Application URLs (Phase 4: use custom domain with HTTPS)
  api_url = "https://${var.subdomain}.${var.domain_name}"
  app_url = "https://${var.subdomain}.${var.domain_name}"

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

#------------------------------------------------------------------------------
# PHASE 4: DNS & CDN
#------------------------------------------------------------------------------

#------------------------------------------------------------------------------
# ACM Module
# Creates SSL/TLS certificate with DNS validation
#------------------------------------------------------------------------------
module "acm" {
  source = "../../modules/acm"

  project_name = var.project_name
  environment  = var.environment
  domain_name  = var.domain_name
  zone_id      = module.route53.zone_id
}

#------------------------------------------------------------------------------
# CloudFront Module
# Creates CDN distribution with security headers
#------------------------------------------------------------------------------
module "cloudfront" {
  source = "../../modules/cloudfront"

  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region

  # Origin configuration
  alb_dns_name    = module.alb.alb_dns_name
  certificate_arn = module.acm.certificate_arn
  domain_aliases  = ["${var.subdomain}.${var.domain_name}"]

  # Origin verification (optional security header)
  origin_shield_header = var.cloudfront_origin_header

  # Phase 5: WAF attachment
  waf_web_acl_arn = module.security.waf_web_acl_arn
}

#------------------------------------------------------------------------------
# Route53 Module
# Creates DNS records pointing to CloudFront
#------------------------------------------------------------------------------
module "route53" {
  source = "../../modules/route53"

  project_name = var.project_name
  environment  = var.environment
  domain_name  = var.domain_name
  subdomain    = var.subdomain

  # CloudFront distribution info
  cloudfront_domain_name    = module.cloudfront.domain_name
  cloudfront_hosted_zone_id = module.cloudfront.hosted_zone_id
}

#------------------------------------------------------------------------------
# PHASE 5: SECURITY
#------------------------------------------------------------------------------

#------------------------------------------------------------------------------
# Security Module
# Creates WAF, GuardDuty, Security Hub, VPC Flow Logs, CloudTrail
#------------------------------------------------------------------------------
module "security" {
  source = "../../modules/security"

  project_name = var.project_name
  environment  = var.environment

  # VPC for Flow Logs
  vpc_id = module.networking.vpc_id

  # KMS for encryption
  kms_key_arn = module.kms.key_arn

  # WAF configuration
  rate_limit             = 2000 # Requests per 5 minutes per IP
  enable_waf_logging     = true
  waf_log_retention_days = 30

  # GuardDuty configuration (staging: 6 hours for cost savings)
  guardduty_finding_frequency = "SIX_HOURS"

  # VPC Flow Logs configuration
  flow_log_retention_days = 30

  # CloudTrail configuration (disable CloudWatch for staging cost savings)
  enable_cloudtrail_cloudwatch  = false
  cloudtrail_log_retention_days = 30
}

#------------------------------------------------------------------------------
# PHASE 7: MONITORING
#------------------------------------------------------------------------------

#------------------------------------------------------------------------------
# Monitoring Module
# Creates CloudWatch dashboards, alarms, SNS topics, X-Ray, and Synthetics
#------------------------------------------------------------------------------
module "monitoring" {
  source = "../../modules/monitoring"

  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region

  # SNS Configuration
  alert_email               = "guido@asbun.io"
  enable_email_subscription = true

  # ECS Configuration
  ecs_cluster_name = module.ecs.cluster_name
  ecs_services = {
    frontend      = module.ecs.frontend_service_name
    backend       = module.ecs.backend_service_name
    celery_worker = module.ecs.celery_worker_service_name
    celery_beat   = module.ecs.celery_beat_service_name
  }

  # ALB Configuration
  alb_arn_suffix                   = module.alb.alb_arn_suffix
  frontend_target_group_arn_suffix = module.alb.frontend_target_group_arn_suffix
  backend_target_group_arn_suffix  = module.alb.backend_target_group_arn_suffix

  # RDS Configuration
  rds_instance_identifier  = module.rds.identifier
  rds_max_connections      = 87 # db.t3.micro default
  rds_allocated_storage_gb = 20

  # ElastiCache Configuration
  elasticache_cluster_id = module.elasticache.replication_group_id

  # Application URLs
  app_url           = "https://${var.subdomain}.${var.domain_name}"
  health_check_path = "/health"

  # X-Ray Configuration (100% sampling for staging)
  enable_xray        = true
  xray_sampling_rate = 1.0

  # Synthetics Configuration (enable for uptime monitoring)
  enable_synthetics       = true
  synthetics_rate_minutes = 5

  # Alarm Thresholds (staging defaults)
  alarm_thresholds = {
    ecs_cpu_percent            = 80
    ecs_memory_percent         = 85
    alb_5xx_count              = 10
    alb_unhealthy_hosts        = 0
    alb_latency_p95_seconds    = 2
    rds_cpu_percent            = 80
    rds_connections_percent    = 80
    rds_free_storage_gb        = 4
    rds_freeable_memory_mb     = 100
    rds_read_latency_seconds   = 0.02
    elasticache_cpu_percent    = 75
    elasticache_memory_percent = 80
    elasticache_evictions      = 100
  }
}
