# Staging Environment Outputs
# All values needed for subsequent infrastructure phases and CI/CD
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 1 - Foundation
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
