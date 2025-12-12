# Staging Environment Variables
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 1 - Foundation
# Infrastructure Phase 2 - Data Layer
# Infrastructure Phase 3 - Application Layer
# Infrastructure Phase 4 - DNS & CDN

#------------------------------------------------------------------------------
# General Configuration
#------------------------------------------------------------------------------
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "staging"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "party-time"
}

#------------------------------------------------------------------------------
# VPC Configuration
#------------------------------------------------------------------------------
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones for multi-AZ deployment"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets (ALB, NAT Gateway)"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets (ECS tasks)"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "database_subnet_cidrs" {
  description = "CIDR blocks for database subnets (RDS, ElastiCache)"
  type        = list(string)
  default     = ["10.0.20.0/24", "10.0.21.0/24"]
}

#------------------------------------------------------------------------------
# GitHub OIDC Configuration
# Update these values to match your GitHub organization/repository
#------------------------------------------------------------------------------
variable "github_org" {
  description = "GitHub organization or username for OIDC authentication"
  type        = string
  default     = "guidoasbun"
}

variable "github_repo" {
  description = "GitHub repository name for OIDC authentication"
  type        = string
  default     = "party-time"
}

#------------------------------------------------------------------------------
# Phase 2: Cognito Configuration (existing setup)
# Provide via terraform.tfvars or TF_VAR_ environment variables
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
# Phase 2: Third-Party API Keys
# Provide via terraform.tfvars or TF_VAR_ environment variables
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

#------------------------------------------------------------------------------
# Phase 4: DNS & CDN Configuration
#------------------------------------------------------------------------------
variable "domain_name" {
  description = "Root domain name (e.g., celebration-time.com)"
  type        = string
  default     = "celebration-time.com"
}

variable "subdomain" {
  description = "Subdomain prefix for this environment (e.g., 'staging' for staging.celebration-time.com)"
  type        = string
  default     = "staging"
}

variable "cloudfront_origin_header" {
  description = "Secret header value for CloudFront origin verification"
  type        = string
  default     = "party-time-cloudfront-origin-2024"
  sensitive   = true
}
