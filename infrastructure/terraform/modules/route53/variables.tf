# Route53 Module - Variables
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

variable "domain_name" {
  description = "Root domain name (e.g., celebration-time.com)"
  type        = string
}

variable "subdomain" {
  description = "Subdomain prefix (e.g., 'staging' for staging.celebration-time.com). Empty for apex domain."
  type        = string
  default     = ""
}

variable "cloudfront_domain_name" {
  description = "CloudFront distribution domain name (*.cloudfront.net)"
  type        = string
}

variable "cloudfront_hosted_zone_id" {
  description = "CloudFront distribution hosted zone ID"
  type        = string
}
