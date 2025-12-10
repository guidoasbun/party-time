# S3 Module Outputs
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 2 - Data Layer

#------------------------------------------------------------------------------
# Assets Bucket Outputs
#------------------------------------------------------------------------------
output "assets_bucket_id" {
  description = "Assets bucket ID"
  value       = aws_s3_bucket.assets.id
}

output "assets_bucket_arn" {
  description = "Assets bucket ARN"
  value       = aws_s3_bucket.assets.arn
}

output "assets_bucket_domain_name" {
  description = "Assets bucket regional domain name"
  value       = aws_s3_bucket.assets.bucket_regional_domain_name
}

#------------------------------------------------------------------------------
# Uploads Bucket Outputs
#------------------------------------------------------------------------------
output "uploads_bucket_id" {
  description = "Uploads bucket ID"
  value       = aws_s3_bucket.uploads.id
}

output "uploads_bucket_arn" {
  description = "Uploads bucket ARN"
  value       = aws_s3_bucket.uploads.arn
}

output "uploads_bucket_domain_name" {
  description = "Uploads bucket regional domain name"
  value       = aws_s3_bucket.uploads.bucket_regional_domain_name
}
