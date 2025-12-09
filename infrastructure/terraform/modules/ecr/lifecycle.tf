# ECR Module - Lifecycle Policies
# Automatically expire old images to reduce storage costs
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 1 - Foundation
#------------------------------------------------------------------------------
# Lifecycle Policy JSON
# - Keep last 10 tagged images (v*, latest, staging, production)
# - Expire untagged images after 7 days
#------------------------------------------------------------------------------
locals {
  lifecycle_policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 tagged images"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["v", "latest", "staging", "production"]
          countType     = "imageCountMoreThan"
          countNumber   = 10
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 2
        description  = "Expire untagged images after 7 days"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 7
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

#------------------------------------------------------------------------------
# Apply Lifecycle Policies to All Repositories
#------------------------------------------------------------------------------
resource "aws_ecr_lifecycle_policy" "frontend" {
  repository = aws_ecr_repository.frontend.name
  policy     = local.lifecycle_policy
}

resource "aws_ecr_lifecycle_policy" "backend" {
  repository = aws_ecr_repository.backend.name
  policy     = local.lifecycle_policy
}

resource "aws_ecr_lifecycle_policy" "celery" {
  repository = aws_ecr_repository.celery.name
  policy     = local.lifecycle_policy
}
