# ACM Module - Variables
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
  description = "Primary domain name for the certificate (e.g., celebration-time.com)"
  type        = string
}

variable "zone_id" {
  description = "Route53 hosted zone ID for DNS validation records"
  type        = string
}
