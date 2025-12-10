# Secrets Manager Module Variables
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 2 - Data Layer

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
  default     = "us-east-1"
}

variable "kms_key_arn" {
  description = "KMS key ARN for secrets encryption"
  type        = string
}

#------------------------------------------------------------------------------
# Database Variables (from RDS module outputs)
#------------------------------------------------------------------------------
variable "database_endpoint" {
  description = "RDS instance endpoint (host:port)"
  type        = string
}

variable "database_host" {
  description = "RDS instance hostname"
  type        = string
}

variable "database_port" {
  description = "RDS instance port"
  type        = number
  default     = 5432
}

variable "database_name" {
  description = "Database name"
  type        = string
}

variable "database_username" {
  description = "Database master username"
  type        = string
}

variable "database_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}

#------------------------------------------------------------------------------
# Redis Variables (from ElastiCache module outputs)
#------------------------------------------------------------------------------
variable "redis_url" {
  description = "Redis connection URL"
  type        = string
}

variable "celery_broker_url" {
  description = "Celery broker URL (Redis database 0)"
  type        = string
}

variable "celery_result_backend_url" {
  description = "Celery result backend URL (Redis database 1)"
  type        = string
}

#------------------------------------------------------------------------------
# Cognito Variables (existing configuration)
#------------------------------------------------------------------------------
variable "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  type        = string
  default     = ""
}

variable "cognito_client_id" {
  description = "Cognito Client ID"
  type        = string
  default     = ""
}

variable "cognito_client_secret" {
  description = "Cognito Client Secret"
  type        = string
  default     = ""
  sensitive   = true
}

#------------------------------------------------------------------------------
# Third-Party API Keys
#------------------------------------------------------------------------------
variable "google_places_api_key" {
  description = "Google Places API Key"
  type        = string
  default     = ""
  sensitive   = true
}

variable "google_client_id" {
  description = "Google OAuth Client ID"
  type        = string
  default     = ""
}

variable "google_client_secret" {
  description = "Google OAuth Client Secret"
  type        = string
  default     = ""
  sensitive   = true
}

variable "ses_from_email" {
  description = "SES verified email for sending"
  type        = string
  default     = "noreply@celebration-time.com"
}
