# Security Module - Security Hub
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 5 - Security
#
# Creates:
# - Security Hub with CIS AWS Foundations Benchmark
# - Automatic findings import from GuardDuty

#------------------------------------------------------------------------------
# Security Hub
# Centralized security findings and compliance checks
#------------------------------------------------------------------------------
resource "aws_securityhub_account" "main" {
  enable_default_standards = false # We'll enable specific standards

  # Auto-enable Security Hub for new member accounts (if using Organizations)
  auto_enable_controls = true

  # Control finding generator (matches on identifiers)
  control_finding_generator = "SECURITY_CONTROL"
}

#------------------------------------------------------------------------------
# Enable CIS AWS Foundations Benchmark
# Industry standard security configuration checks
#------------------------------------------------------------------------------
resource "aws_securityhub_standards_subscription" "cis" {
  depends_on    = [aws_securityhub_account.main]
  standards_arn = "arn:aws:securityhub:${data.aws_region.current.name}::standards/cis-aws-foundations-benchmark/v/1.4.0"
}

#------------------------------------------------------------------------------
# Enable AWS Foundational Security Best Practices
# AWS-specific security recommendations
#------------------------------------------------------------------------------
resource "aws_securityhub_standards_subscription" "aws_foundational" {
  depends_on    = [aws_securityhub_account.main]
  standards_arn = "arn:aws:securityhub:${data.aws_region.current.name}::standards/aws-foundational-security-best-practices/v/1.0.0"
}

#------------------------------------------------------------------------------
# Enable GuardDuty Integration with Security Hub
# Automatically import GuardDuty findings
#------------------------------------------------------------------------------
resource "aws_securityhub_product_subscription" "guardduty" {
  depends_on  = [aws_securityhub_account.main]
  product_arn = "arn:aws:securityhub:${data.aws_region.current.name}::product/aws/guardduty"
}
