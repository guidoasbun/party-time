# ElastiCache Module Outputs
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 2 - Data Layer

output "primary_endpoint" {
  description = "Redis primary endpoint address"
  value       = aws_elasticache_replication_group.main.primary_endpoint_address
}

output "reader_endpoint" {
  description = "Redis reader endpoint address"
  value       = aws_elasticache_replication_group.main.reader_endpoint_address
}

output "port" {
  description = "Redis port"
  value       = 6379
}

output "arn" {
  description = "ElastiCache replication group ARN"
  value       = aws_elasticache_replication_group.main.arn
}

output "id" {
  description = "ElastiCache replication group ID"
  value       = aws_elasticache_replication_group.main.id
}

# Connection URLs use rediss:// scheme for TLS-enabled Redis
# ssl_cert_reqs=CERT_REQUIRED is required for Celery to work with SSL Redis
output "redis_url" {
  description = "Redis connection URL for Celery broker (database 0, TLS enabled)"
  value       = "rediss://${aws_elasticache_replication_group.main.primary_endpoint_address}:6379/0?ssl_cert_reqs=CERT_REQUIRED"
}

output "celery_result_backend_url" {
  description = "Redis connection URL for Celery result backend (database 1, TLS enabled)"
  value       = "rediss://${aws_elasticache_replication_group.main.primary_endpoint_address}:6379/1?ssl_cert_reqs=CERT_REQUIRED"
}
