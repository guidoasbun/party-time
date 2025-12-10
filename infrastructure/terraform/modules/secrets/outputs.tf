# Secrets Manager Module Outputs
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 2 - Data Layer

#------------------------------------------------------------------------------
# Database Secret Outputs
#------------------------------------------------------------------------------
output "database_secret_arn" {
  description = "Database credentials secret ARN"
  value       = aws_secretsmanager_secret.database.arn
}

output "database_secret_name" {
  description = "Database credentials secret name"
  value       = aws_secretsmanager_secret.database.name
}

#------------------------------------------------------------------------------
# Redis Secret Outputs
#------------------------------------------------------------------------------
output "redis_secret_arn" {
  description = "Redis credentials secret ARN"
  value       = aws_secretsmanager_secret.redis.arn
}

output "redis_secret_name" {
  description = "Redis credentials secret name"
  value       = aws_secretsmanager_secret.redis.name
}

#------------------------------------------------------------------------------
# Application Secret Outputs
#------------------------------------------------------------------------------
output "app_secret_arn" {
  description = "Application secrets ARN"
  value       = aws_secretsmanager_secret.app.arn
}

output "app_secret_name" {
  description = "Application secrets name"
  value       = aws_secretsmanager_secret.app.name
}

#------------------------------------------------------------------------------
# Cognito Secret Outputs
#------------------------------------------------------------------------------
output "cognito_secret_arn" {
  description = "Cognito configuration secret ARN"
  value       = aws_secretsmanager_secret.cognito.arn
}

output "cognito_secret_name" {
  description = "Cognito configuration secret name"
  value       = aws_secretsmanager_secret.cognito.name
}

#------------------------------------------------------------------------------
# API Keys Secret Outputs
#------------------------------------------------------------------------------
output "api_keys_secret_arn" {
  description = "API keys secret ARN"
  value       = aws_secretsmanager_secret.api_keys.arn
}

output "api_keys_secret_name" {
  description = "API keys secret name"
  value       = aws_secretsmanager_secret.api_keys.name
}

#------------------------------------------------------------------------------
# Combined Outputs for ECS Task Definition
#------------------------------------------------------------------------------
output "all_secret_arns" {
  description = "List of all secret ARNs for ECS task definitions"
  value = [
    aws_secretsmanager_secret.database.arn,
    aws_secretsmanager_secret.redis.arn,
    aws_secretsmanager_secret.app.arn,
    aws_secretsmanager_secret.cognito.arn,
    aws_secretsmanager_secret.api_keys.arn
  ]
}
