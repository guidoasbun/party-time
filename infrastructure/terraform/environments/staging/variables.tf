# Staging Environment Variables
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 1 - Foundation

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
