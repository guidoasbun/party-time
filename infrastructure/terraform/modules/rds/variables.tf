# RDS Module Variables
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

variable "instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro" # Staging default
}

variable "allocated_storage" {
  description = "Initial allocated storage in GB"
  type        = number
  default     = 20
}

variable "max_allocated_storage" {
  description = "Maximum storage for autoscaling in GB"
  type        = number
  default     = 100
}

variable "database_name" {
  description = "Name of the database to create"
  type        = string
  default     = "party_time"
}

variable "database_username" {
  description = "Master database username"
  type        = string
  default     = "party_admin"
}

variable "db_subnet_group_name" {
  description = "Database subnet group name (from networking module)"
  type        = string
}

variable "rds_security_group_id" {
  description = "RDS security group ID (from networking module)"
  type        = string
}

variable "kms_key_arn" {
  description = "KMS key ARN for encryption"
  type        = string
}

variable "multi_az" {
  description = "Enable Multi-AZ deployment"
  type        = bool
  default     = false # Staging default
}

variable "backup_retention_period" {
  description = "Number of days to retain backups"
  type        = number
  default     = 7
}

variable "deletion_protection" {
  description = "Enable deletion protection"
  type        = bool
  default     = false # Staging default
}
