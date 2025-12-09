# ECR Module - Container Repositories
# Creates ECR repositories for frontend, backend, and celery worker images
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 1 - Foundation
#------------------------------------------------------------------------------
# Frontend Repository (Next.js)
#------------------------------------------------------------------------------
resource "aws_ecr_repository" "frontend" {
  name                 = "${var.project_name}-${var.environment}-frontend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = {
    Name    = "${var.project_name}-${var.environment}-frontend"
    Service = "frontend"
  }
}

#------------------------------------------------------------------------------
# Backend Repository (FastAPI)
#------------------------------------------------------------------------------
resource "aws_ecr_repository" "backend" {
  name                 = "${var.project_name}-${var.environment}-backend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = {
    Name    = "${var.project_name}-${var.environment}-backend"
    Service = "backend"
  }
}

#------------------------------------------------------------------------------
# Celery Worker Repository
#------------------------------------------------------------------------------
resource "aws_ecr_repository" "celery" {
  name                 = "${var.project_name}-${var.environment}-celery"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = {
    Name    = "${var.project_name}-${var.environment}-celery"
    Service = "celery"
  }
}
