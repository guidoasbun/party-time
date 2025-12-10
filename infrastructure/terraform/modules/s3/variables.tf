# S3 Module Variables
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

variable "kms_key_arn" {
  description = "KMS key ARN for bucket encryption"
  type        = string
}

variable "allowed_origins" {
  description = "Allowed origins for CORS on uploads bucket"
  type        = list(string)
  default     = ["https://staging.celebration-time.com"]
}
