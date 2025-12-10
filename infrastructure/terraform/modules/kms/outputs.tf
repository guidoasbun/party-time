# KMS Module Outputs
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 2 - Data Layer

output "key_id" {
  description = "KMS key ID"
  value       = aws_kms_key.main.key_id
}

output "key_arn" {
  description = "KMS key ARN"
  value       = aws_kms_key.main.arn
}

output "alias_arn" {
  description = "KMS key alias ARN"
  value       = aws_kms_alias.main.arn
}

output "alias_name" {
  description = "KMS key alias name"
  value       = aws_kms_alias.main.name
}
