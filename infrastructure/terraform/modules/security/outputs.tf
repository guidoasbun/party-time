# Security Module - Outputs
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 5 - Security

#------------------------------------------------------------------------------
# WAF Outputs
#------------------------------------------------------------------------------
output "waf_web_acl_arn" {
  description = "WAF Web ACL ARN (for CloudFront attachment)"
  value       = aws_wafv2_web_acl.main.arn
}

output "waf_web_acl_id" {
  description = "WAF Web ACL ID"
  value       = aws_wafv2_web_acl.main.id
}

output "waf_web_acl_name" {
  description = "WAF Web ACL name"
  value       = aws_wafv2_web_acl.main.name
}

#------------------------------------------------------------------------------
# GuardDuty Outputs
#------------------------------------------------------------------------------
output "guardduty_detector_id" {
  description = "GuardDuty detector ID"
  value       = aws_guardduty_detector.main.id
}

#------------------------------------------------------------------------------
# Security Hub Outputs
#------------------------------------------------------------------------------
output "securityhub_account_id" {
  description = "Security Hub account ID"
  value       = aws_securityhub_account.main.id
}

#------------------------------------------------------------------------------
# VPC Flow Logs Outputs
#------------------------------------------------------------------------------
output "vpc_flow_log_id" {
  description = "VPC Flow Log ID"
  value       = aws_flow_log.main.id
}

output "vpc_flow_log_group_name" {
  description = "VPC Flow Logs CloudWatch Log Group name"
  value       = aws_cloudwatch_log_group.vpc_flow_logs.name
}

output "vpc_flow_log_group_arn" {
  description = "VPC Flow Logs CloudWatch Log Group ARN"
  value       = aws_cloudwatch_log_group.vpc_flow_logs.arn
}

#------------------------------------------------------------------------------
# CloudTrail Outputs
#------------------------------------------------------------------------------
output "cloudtrail_arn" {
  description = "CloudTrail ARN"
  value       = aws_cloudtrail.main.arn
}

output "cloudtrail_s3_bucket_id" {
  description = "CloudTrail S3 bucket ID"
  value       = aws_s3_bucket.cloudtrail.id
}

output "cloudtrail_s3_bucket_arn" {
  description = "CloudTrail S3 bucket ARN"
  value       = aws_s3_bucket.cloudtrail.arn
}
