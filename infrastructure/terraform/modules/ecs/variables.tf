# ECS Module - Variables
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 3 - Application Layer

#------------------------------------------------------------------------------
# General Configuration
#------------------------------------------------------------------------------
variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name (staging, production)"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

#------------------------------------------------------------------------------
# Networking
#------------------------------------------------------------------------------
variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for ECS tasks"
  type        = list(string)
}

variable "ecs_security_group_id" {
  description = "Security group ID for ECS tasks"
  type        = string
}

#------------------------------------------------------------------------------
# IAM Roles
#------------------------------------------------------------------------------
variable "ecs_task_execution_role_arn" {
  description = "ECS task execution role ARN (for pulling images, writing logs)"
  type        = string
}

variable "ecs_task_role_arn" {
  description = "ECS task role ARN (for application permissions)"
  type        = string
}

#------------------------------------------------------------------------------
# ECR Repositories
#------------------------------------------------------------------------------
variable "frontend_repository_url" {
  description = "Frontend ECR repository URL"
  type        = string
}

variable "backend_repository_url" {
  description = "Backend ECR repository URL"
  type        = string
}

#------------------------------------------------------------------------------
# Target Groups (from ALB module)
#------------------------------------------------------------------------------
variable "frontend_target_group_arn" {
  description = "Frontend target group ARN"
  type        = string
}

variable "backend_target_group_arn" {
  description = "Backend target group ARN"
  type        = string
}

#------------------------------------------------------------------------------
# Secrets ARNs
#------------------------------------------------------------------------------
variable "database_secret_arn" {
  description = "Database credentials secret ARN"
  type        = string
}

variable "redis_secret_arn" {
  description = "Redis credentials secret ARN"
  type        = string
}

variable "app_secret_arn" {
  description = "Application secrets ARN"
  type        = string
}

variable "cognito_secret_arn" {
  description = "Cognito configuration secret ARN"
  type        = string
}

variable "api_keys_secret_arn" {
  description = "API keys secret ARN"
  type        = string
}

#------------------------------------------------------------------------------
# Application URLs
#------------------------------------------------------------------------------
variable "api_url" {
  description = "API URL for frontend to connect to backend"
  type        = string
}

variable "app_url" {
  description = "Application URL (frontend URL)"
  type        = string
}

#------------------------------------------------------------------------------
# Logging
#------------------------------------------------------------------------------
variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 30
}

#------------------------------------------------------------------------------
# Frontend Task Configuration
#------------------------------------------------------------------------------
variable "frontend_cpu" {
  description = "Frontend task CPU units"
  type        = number
  default     = 256
}

variable "frontend_memory" {
  description = "Frontend task memory (MB)"
  type        = number
  default     = 512
}

variable "frontend_desired_count" {
  description = "Frontend desired task count"
  type        = number
  default     = 1
}

variable "frontend_min_count" {
  description = "Frontend minimum task count for auto-scaling"
  type        = number
  default     = 1
}

variable "frontend_max_count" {
  description = "Frontend maximum task count for auto-scaling"
  type        = number
  default     = 4
}

#------------------------------------------------------------------------------
# Backend Task Configuration
#------------------------------------------------------------------------------
variable "backend_cpu" {
  description = "Backend task CPU units"
  type        = number
  default     = 512
}

variable "backend_memory" {
  description = "Backend task memory (MB)"
  type        = number
  default     = 1024
}

variable "backend_desired_count" {
  description = "Backend desired task count"
  type        = number
  default     = 1
}

variable "backend_min_count" {
  description = "Backend minimum task count for auto-scaling"
  type        = number
  default     = 1
}

variable "backend_max_count" {
  description = "Backend maximum task count for auto-scaling"
  type        = number
  default     = 4
}

#------------------------------------------------------------------------------
# Celery Worker Task Configuration
#------------------------------------------------------------------------------
variable "celery_worker_cpu" {
  description = "Celery worker task CPU units"
  type        = number
  default     = 256
}

variable "celery_worker_memory" {
  description = "Celery worker task memory (MB)"
  type        = number
  default     = 512
}

variable "celery_worker_desired_count" {
  description = "Celery worker desired task count"
  type        = number
  default     = 1
}

variable "celery_worker_min_count" {
  description = "Celery worker minimum task count for auto-scaling"
  type        = number
  default     = 1
}

variable "celery_worker_max_count" {
  description = "Celery worker maximum task count for auto-scaling"
  type        = number
  default     = 3
}

#------------------------------------------------------------------------------
# Celery Beat Task Configuration
#------------------------------------------------------------------------------
variable "celery_beat_cpu" {
  description = "Celery beat task CPU units"
  type        = number
  default     = 256
}

variable "celery_beat_memory" {
  description = "Celery beat task memory (MB)"
  type        = number
  default     = 512
}
