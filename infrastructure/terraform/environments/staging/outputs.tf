# Staging Environment Outputs
# All values needed for subsequent infrastructure phases and CI/CD
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 1 - Foundation
# Infrastructure Phase 2 - Data Layer
#------------------------------------------------------------------------------
# VPC Outputs
#------------------------------------------------------------------------------
output "vpc_id" {
  description = "VPC ID"
  value       = module.networking.vpc_id
}

output "vpc_cidr" {
  description = "VPC CIDR block"
  value       = module.networking.vpc_cidr
}

#------------------------------------------------------------------------------
# Subnet Outputs
#------------------------------------------------------------------------------
output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = module.networking.public_subnet_ids
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.networking.private_subnet_ids
}

output "database_subnet_ids" {
  description = "Database subnet IDs"
  value       = module.networking.database_subnet_ids
}

output "db_subnet_group_name" {
  description = "Database subnet group name for RDS"
  value       = module.networking.db_subnet_group_name
}

output "elasticache_subnet_group_name" {
  description = "ElastiCache subnet group name"
  value       = module.networking.elasticache_subnet_group_name
}

#------------------------------------------------------------------------------
# Security Group Outputs
#------------------------------------------------------------------------------
output "alb_security_group_id" {
  description = "ALB security group ID"
  value       = module.networking.alb_security_group_id
}

output "ecs_security_group_id" {
  description = "ECS security group ID"
  value       = module.networking.ecs_security_group_id
}

output "rds_security_group_id" {
  description = "RDS security group ID"
  value       = module.networking.rds_security_group_id
}

output "redis_security_group_id" {
  description = "Redis security group ID"
  value       = module.networking.redis_security_group_id
}

#------------------------------------------------------------------------------
# ECR Outputs
#------------------------------------------------------------------------------
output "ecr_frontend_url" {
  description = "Frontend ECR repository URL"
  value       = module.ecr.frontend_repository_url
}

output "ecr_backend_url" {
  description = "Backend ECR repository URL"
  value       = module.ecr.backend_repository_url
}

output "ecr_celery_url" {
  description = "Celery ECR repository URL"
  value       = module.ecr.celery_repository_url
}

output "ecr_frontend_name" {
  description = "Frontend ECR repository name"
  value       = module.ecr.frontend_repository_name
}

output "ecr_backend_name" {
  description = "Backend ECR repository name"
  value       = module.ecr.backend_repository_name
}

output "ecr_celery_name" {
  description = "Celery ECR repository name"
  value       = module.ecr.celery_repository_name
}

#------------------------------------------------------------------------------
# IAM Outputs
#------------------------------------------------------------------------------
output "ecs_task_execution_role_arn" {
  description = "ECS task execution role ARN"
  value       = module.iam.ecs_task_execution_role_arn
}

output "ecs_task_role_arn" {
  description = "ECS task role ARN"
  value       = module.iam.ecs_task_role_arn
}

output "github_actions_role_arn" {
  description = "GitHub Actions OIDC role ARN"
  value       = module.iam.github_actions_role_arn
}

#------------------------------------------------------------------------------
# Gateway Outputs
#------------------------------------------------------------------------------
output "nat_gateway_ids" {
  description = "NAT Gateway IDs"
  value       = module.networking.nat_gateway_ids
}

output "internet_gateway_id" {
  description = "Internet Gateway ID"
  value       = module.networking.internet_gateway_id
}

#------------------------------------------------------------------------------
# PHASE 2: DATA LAYER OUTPUTS
#------------------------------------------------------------------------------

#------------------------------------------------------------------------------
# KMS Outputs
#------------------------------------------------------------------------------
output "kms_key_arn" {
  description = "KMS key ARN for data encryption"
  value       = module.kms.key_arn
}

output "kms_key_id" {
  description = "KMS key ID"
  value       = module.kms.key_id
}

#------------------------------------------------------------------------------
# RDS Outputs
#------------------------------------------------------------------------------
output "rds_endpoint" {
  description = "RDS instance endpoint (host:port)"
  value       = module.rds.endpoint
}

output "rds_address" {
  description = "RDS instance address (hostname)"
  value       = module.rds.address
}

output "rds_port" {
  description = "RDS instance port"
  value       = module.rds.port
}

output "rds_database_name" {
  description = "RDS database name"
  value       = module.rds.database_name
}

output "rds_arn" {
  description = "RDS instance ARN"
  value       = module.rds.arn
}

#------------------------------------------------------------------------------
# ElastiCache Outputs
#------------------------------------------------------------------------------
output "redis_primary_endpoint" {
  description = "Redis primary endpoint"
  value       = module.elasticache.primary_endpoint
}

output "redis_port" {
  description = "Redis port"
  value       = module.elasticache.port
}

output "redis_arn" {
  description = "ElastiCache replication group ARN"
  value       = module.elasticache.arn
}

#------------------------------------------------------------------------------
# S3 Outputs
#------------------------------------------------------------------------------
output "assets_bucket_id" {
  description = "Assets S3 bucket ID"
  value       = module.s3.assets_bucket_id
}

output "assets_bucket_arn" {
  description = "Assets S3 bucket ARN"
  value       = module.s3.assets_bucket_arn
}

output "uploads_bucket_id" {
  description = "Uploads S3 bucket ID"
  value       = module.s3.uploads_bucket_id
}

output "uploads_bucket_arn" {
  description = "Uploads S3 bucket ARN"
  value       = module.s3.uploads_bucket_arn
}

#------------------------------------------------------------------------------
# Secrets Manager Outputs
#------------------------------------------------------------------------------
output "database_secret_arn" {
  description = "Database credentials secret ARN"
  value       = module.secrets.database_secret_arn
}

output "redis_secret_arn" {
  description = "Redis credentials secret ARN"
  value       = module.secrets.redis_secret_arn
}

output "app_secret_arn" {
  description = "Application secrets ARN"
  value       = module.secrets.app_secret_arn
}

output "cognito_secret_arn" {
  description = "Cognito configuration secret ARN"
  value       = module.secrets.cognito_secret_arn
}

output "api_keys_secret_arn" {
  description = "API keys secret ARN"
  value       = module.secrets.api_keys_secret_arn
}

output "all_secret_arns" {
  description = "List of all secret ARNs for ECS task definitions"
  value       = module.secrets.all_secret_arns
}
