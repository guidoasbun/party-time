# Party-Time Staging Environment
# FR-22: The system shall be deployed on AWS Infrastructure.
# Phase 1: Foundation - Networking, ECR, and IAM

#------------------------------------------------------------------------------
# Networking Module
# Creates VPC, subnets, NAT Gateway, security groups, and VPC endpoints
#------------------------------------------------------------------------------
module "networking" {
  source = "../../modules/networking"

  project_name       = var.project_name
  environment        = var.environment
  aws_region         = var.aws_region
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones

  # Subnet CIDRs
  public_subnet_cidrs   = var.public_subnet_cidrs
  private_subnet_cidrs  = var.private_subnet_cidrs
  database_subnet_cidrs = var.database_subnet_cidrs

  # Cost optimization: single NAT Gateway for staging
  single_nat_gateway = true
}

#------------------------------------------------------------------------------
# ECR Module
# Creates container repositories for frontend, backend, and celery
#------------------------------------------------------------------------------
module "ecr" {
  source = "../../modules/ecr"

  project_name = var.project_name
  environment  = var.environment
}

#------------------------------------------------------------------------------
# IAM Module
# Creates ECS roles and GitHub Actions OIDC authentication
#------------------------------------------------------------------------------
module "iam" {
  source = "../../modules/iam"

  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region
  github_org   = var.github_org
  github_repo  = var.github_repo

  # Pass ECR ARNs for IAM policies
  ecr_repository_arns = module.ecr.repository_arns
}
