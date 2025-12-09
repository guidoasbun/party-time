# ECR Module Outputs
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 1 - Foundation
#------------------------------------------------------------------------------
# Repository URLs (for docker push/pull)
#------------------------------------------------------------------------------
output "frontend_repository_url" {
  description = "Frontend ECR repository URL"
  value       = aws_ecr_repository.frontend.repository_url
}

output "backend_repository_url" {
  description = "Backend ECR repository URL"
  value       = aws_ecr_repository.backend.repository_url
}

output "celery_repository_url" {
  description = "Celery ECR repository URL"
  value       = aws_ecr_repository.celery.repository_url
}

#------------------------------------------------------------------------------
# Repository ARNs (for IAM policies)
#------------------------------------------------------------------------------
output "repository_arns" {
  description = "List of all ECR repository ARNs"
  value = [
    aws_ecr_repository.frontend.arn,
    aws_ecr_repository.backend.arn,
    aws_ecr_repository.celery.arn
  ]
}

output "frontend_repository_arn" {
  description = "Frontend ECR repository ARN"
  value       = aws_ecr_repository.frontend.arn
}

output "backend_repository_arn" {
  description = "Backend ECR repository ARN"
  value       = aws_ecr_repository.backend.arn
}

output "celery_repository_arn" {
  description = "Celery ECR repository ARN"
  value       = aws_ecr_repository.celery.arn
}

#------------------------------------------------------------------------------
# Repository Names
#------------------------------------------------------------------------------
output "frontend_repository_name" {
  description = "Frontend ECR repository name"
  value       = aws_ecr_repository.frontend.name
}

output "backend_repository_name" {
  description = "Backend ECR repository name"
  value       = aws_ecr_repository.backend.name
}

output "celery_repository_name" {
  description = "Celery ECR repository name"
  value       = aws_ecr_repository.celery.name
}
