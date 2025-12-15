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

#------------------------------------------------------------------------------
# PHASE 3: APPLICATION LAYER OUTPUTS
#------------------------------------------------------------------------------

#------------------------------------------------------------------------------
# ALB Outputs
#------------------------------------------------------------------------------
output "alb_dns_name" {
  description = "ALB DNS name (use this to access the application)"
  value       = module.alb.alb_dns_name
}

output "alb_arn" {
  description = "ALB ARN"
  value       = module.alb.alb_arn
}

output "alb_zone_id" {
  description = "ALB Route 53 zone ID (for DNS alias records)"
  value       = module.alb.alb_zone_id
}

output "frontend_target_group_arn" {
  description = "Frontend target group ARN"
  value       = module.alb.frontend_target_group_arn
}

output "backend_target_group_arn" {
  description = "Backend target group ARN"
  value       = module.alb.backend_target_group_arn
}

#------------------------------------------------------------------------------
# ECS Outputs
#------------------------------------------------------------------------------
output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = module.ecs.cluster_name
}

output "ecs_cluster_arn" {
  description = "ECS cluster ARN"
  value       = module.ecs.cluster_arn
}

output "frontend_service_name" {
  description = "Frontend ECS service name"
  value       = module.ecs.frontend_service_name
}

output "backend_service_name" {
  description = "Backend ECS service name"
  value       = module.ecs.backend_service_name
}

output "celery_worker_service_name" {
  description = "Celery worker ECS service name"
  value       = module.ecs.celery_worker_service_name
}

output "celery_beat_service_name" {
  description = "Celery beat ECS service name"
  value       = module.ecs.celery_beat_service_name
}

#------------------------------------------------------------------------------
# Application URLs
#------------------------------------------------------------------------------
output "application_url" {
  description = "Application URL (use this to access the app)"
  value       = "http://${module.alb.alb_dns_name}"
}

output "api_url" {
  description = "API URL (use this for API requests)"
  value       = "http://${module.alb.alb_dns_name}/api"
}

output "api_docs_url" {
  description = "API documentation URL (Swagger UI)"
  value       = "https://${var.subdomain}.${var.domain_name}/docs"
}

#------------------------------------------------------------------------------
# PHASE 4: DNS & CDN OUTPUTS
#------------------------------------------------------------------------------

#------------------------------------------------------------------------------
# ACM Outputs
#------------------------------------------------------------------------------
output "certificate_arn" {
  description = "ACM certificate ARN"
  value       = module.acm.certificate_arn
}

output "certificate_domain_name" {
  description = "ACM certificate primary domain"
  value       = module.acm.certificate_domain_name
}

#------------------------------------------------------------------------------
# CloudFront Outputs
#------------------------------------------------------------------------------
output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = module.cloudfront.distribution_id
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name (*.cloudfront.net)"
  value       = module.cloudfront.domain_name
}

output "cloudfront_status" {
  description = "CloudFront distribution status"
  value       = module.cloudfront.status
}

#------------------------------------------------------------------------------
# Route53 Outputs
#------------------------------------------------------------------------------
output "route53_zone_id" {
  description = "Route53 hosted zone ID"
  value       = module.route53.zone_id
}

output "staging_fqdn" {
  description = "Fully qualified domain name for staging"
  value       = module.route53.fqdn
}

#------------------------------------------------------------------------------
# Updated Application URLs (HTTPS)
#------------------------------------------------------------------------------
output "staging_url" {
  description = "Staging environment URL (HTTPS)"
  value       = "https://${var.subdomain}.${var.domain_name}"
}

output "staging_api_url" {
  description = "Staging API URL (HTTPS)"
  value       = "https://${var.subdomain}.${var.domain_name}/api"
}

#------------------------------------------------------------------------------
# PHASE 5: SECURITY OUTPUTS
#------------------------------------------------------------------------------

#------------------------------------------------------------------------------
# WAF Outputs
#------------------------------------------------------------------------------
output "waf_web_acl_arn" {
  description = "WAF Web ACL ARN"
  value       = module.security.waf_web_acl_arn
}

output "waf_web_acl_id" {
  description = "WAF Web ACL ID"
  value       = module.security.waf_web_acl_id
}

#------------------------------------------------------------------------------
# GuardDuty Outputs
#------------------------------------------------------------------------------
output "guardduty_detector_id" {
  description = "GuardDuty detector ID"
  value       = module.security.guardduty_detector_id
}

#------------------------------------------------------------------------------
# VPC Flow Logs Outputs
#------------------------------------------------------------------------------
output "vpc_flow_log_id" {
  description = "VPC Flow Log ID"
  value       = module.security.vpc_flow_log_id
}

output "vpc_flow_log_group_name" {
  description = "VPC Flow Logs CloudWatch Log Group name"
  value       = module.security.vpc_flow_log_group_name
}

#------------------------------------------------------------------------------
# CloudTrail Outputs
#------------------------------------------------------------------------------
output "cloudtrail_arn" {
  description = "CloudTrail ARN"
  value       = module.security.cloudtrail_arn
}

output "cloudtrail_s3_bucket_id" {
  description = "CloudTrail S3 bucket ID"
  value       = module.security.cloudtrail_s3_bucket_id
}

#------------------------------------------------------------------------------
# PHASE 7: MONITORING OUTPUTS
#------------------------------------------------------------------------------

#------------------------------------------------------------------------------
# SNS Topic Outputs
#------------------------------------------------------------------------------
output "sns_topic_critical_arn" {
  description = "Critical alerts SNS topic ARN"
  value       = module.monitoring.sns_topic_critical_arn
}

output "sns_topic_warning_arn" {
  description = "Warning alerts SNS topic ARN"
  value       = module.monitoring.sns_topic_warning_arn
}

output "sns_topic_info_arn" {
  description = "Info notifications SNS topic ARN"
  value       = module.monitoring.sns_topic_info_arn
}

#------------------------------------------------------------------------------
# Dashboard Outputs
#------------------------------------------------------------------------------
output "dashboard_overview_name" {
  description = "Application overview dashboard name"
  value       = module.monitoring.dashboard_overview_name
}

output "dashboard_database_name" {
  description = "Database health dashboard name"
  value       = module.monitoring.dashboard_database_name
}

output "dashboard_email_name" {
  description = "Email/SES dashboard name"
  value       = module.monitoring.dashboard_email_name
}

output "dashboard_overview_url" {
  description = "URL to the Application Overview dashboard"
  value       = module.monitoring.dashboard_overview_url
}

#------------------------------------------------------------------------------
# X-Ray Outputs
#------------------------------------------------------------------------------
output "xray_sampling_rule_name" {
  description = "X-Ray sampling rule name"
  value       = module.monitoring.xray_sampling_rule_name
}

#------------------------------------------------------------------------------
# Synthetics Outputs
#------------------------------------------------------------------------------
output "canary_homepage_name" {
  description = "Homepage canary name"
  value       = module.monitoring.canary_homepage_name
}

output "canary_api_health_name" {
  description = "API health canary name"
  value       = module.monitoring.canary_api_health_name
}

#------------------------------------------------------------------------------
# Alarm Summary
#------------------------------------------------------------------------------
output "monitoring_alarm_summary" {
  description = "Summary of monitoring alarms created"
  value       = module.monitoring.alarm_summary
}
