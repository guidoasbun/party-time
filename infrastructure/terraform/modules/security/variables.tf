# Security Module - Variables
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 5 - Security

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name (staging, production)"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID for Flow Logs"
  type        = string
}

variable "kms_key_arn" {
  description = "KMS key ARN for encryption"
  type        = string
}

#------------------------------------------------------------------------------
# WAF Configuration
#------------------------------------------------------------------------------
variable "rate_limit" {
  description = "Rate limit (requests per 5 minutes per IP)"
  type        = number
  default     = 2000
}

variable "enable_waf_logging" {
  description = "Enable WAF logging to CloudWatch"
  type        = bool
  default     = true
}

variable "waf_log_retention_days" {
  description = "WAF log retention in days"
  type        = number
  default     = 30
}

#------------------------------------------------------------------------------
# GuardDuty Configuration
#------------------------------------------------------------------------------
variable "guardduty_finding_frequency" {
  description = "GuardDuty finding publishing frequency (FIFTEEN_MINUTES, ONE_HOUR, SIX_HOURS)"
  type        = string
  default     = "SIX_HOURS" # Cost optimization for staging
}

#------------------------------------------------------------------------------
# VPC Flow Logs Configuration
#------------------------------------------------------------------------------
variable "flow_log_retention_days" {
  description = "VPC Flow Logs retention in days"
  type        = number
  default     = 30
}

#------------------------------------------------------------------------------
# CloudTrail Configuration
#------------------------------------------------------------------------------
variable "enable_cloudtrail_cloudwatch" {
  description = "Enable CloudTrail logs to CloudWatch (for real-time monitoring)"
  type        = bool
  default     = false # Disabled by default for cost savings
}

variable "cloudtrail_log_retention_days" {
  description = "CloudTrail CloudWatch log retention in days"
  type        = number
  default     = 30
}
