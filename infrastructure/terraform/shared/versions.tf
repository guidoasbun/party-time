# Terraform and Provider Version Constraints
# Shared across all environments
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 1 - Foundation
terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.30"
    }
  }
}
