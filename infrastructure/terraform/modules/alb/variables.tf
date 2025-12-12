# ALB Module - Variables
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 3 - Application Layer

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name (staging, production)"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID where ALB will be created"
  type        = string
}

variable "public_subnet_ids" {
  description = "List of public subnet IDs for ALB placement"
  type        = list(string)
}

variable "alb_security_group_id" {
  description = "Security group ID for ALB (allows HTTP/HTTPS inbound)"
  type        = string
}

variable "certificate_arn" {
  description = "ACM certificate ARN for HTTPS listener (optional for staging)"
  type        = string
  default     = ""
}
