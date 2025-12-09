# IAM Module Variables

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

variable "github_org" {
  description = "GitHub organization/user for OIDC authentication"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository name for OIDC authentication"
  type        = string
}

variable "ecr_repository_arns" {
  description = "List of ECR repository ARNs for IAM policies"
  type        = list(string)
}
