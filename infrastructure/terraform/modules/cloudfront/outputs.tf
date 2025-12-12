# CloudFront Module - Outputs
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 4 - DNS & CDN

output "distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.main.id
}

output "distribution_arn" {
  description = "CloudFront distribution ARN"
  value       = aws_cloudfront_distribution.main.arn
}

output "domain_name" {
  description = "CloudFront distribution domain name (*.cloudfront.net)"
  value       = aws_cloudfront_distribution.main.domain_name
}

output "hosted_zone_id" {
  description = "CloudFront hosted zone ID (for Route53 alias records)"
  value       = aws_cloudfront_distribution.main.hosted_zone_id
}

output "status" {
  description = "CloudFront distribution status"
  value       = aws_cloudfront_distribution.main.status
}
