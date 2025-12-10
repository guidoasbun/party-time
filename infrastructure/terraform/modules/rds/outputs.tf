# RDS Module Outputs
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 2 - Data Layer

output "endpoint" {
  description = "RDS instance endpoint (host:port)"
  value       = aws_db_instance.main.endpoint
}

output "address" {
  description = "RDS instance address (hostname only)"
  value       = aws_db_instance.main.address
}

output "port" {
  description = "RDS instance port"
  value       = aws_db_instance.main.port
}

output "database_name" {
  description = "Database name"
  value       = aws_db_instance.main.db_name
}

output "username" {
  description = "Master username"
  value       = aws_db_instance.main.username
}

output "password" {
  description = "Master password"
  value       = random_password.master.result
  sensitive   = true
}

output "arn" {
  description = "RDS instance ARN"
  value       = aws_db_instance.main.arn
}

output "id" {
  description = "RDS instance ID"
  value       = aws_db_instance.main.id
}

output "connection_url" {
  description = "PostgreSQL connection URL (without password - for reference)"
  value       = "postgresql://${aws_db_instance.main.username}:PASSWORD@${aws_db_instance.main.endpoint}/${aws_db_instance.main.db_name}"
}
