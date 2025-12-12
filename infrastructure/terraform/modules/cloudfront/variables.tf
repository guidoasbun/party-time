# CloudFront Module - Variables
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 4 - DNS & CDN

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name (staging, production)"
  type        = string
}

variable "aws_region" {
  description = "AWS region (used for Cognito endpoint in CSP)"
  type        = string
}

variable "alb_dns_name" {
  description = "ALB DNS name to use as CloudFront origin"
  type        = string
}

variable "certificate_arn" {
  description = "ACM certificate ARN for HTTPS"
  type        = string
}

variable "domain_aliases" {
  description = "List of domain aliases for CloudFront (e.g., staging.celebration-time.com)"
  type        = list(string)
}

variable "origin_shield_header" {
  description = "Secret header value for origin verification"
  type        = string
  default     = "cloudfront-origin-verification-header"
  sensitive   = true
}
