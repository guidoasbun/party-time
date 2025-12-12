# Security Module - CloudTrail
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 5 - Security
#
# Creates:
# - CloudTrail trail for API call logging
# - CloudWatch Log Group for CloudTrail (optional)

#------------------------------------------------------------------------------
# CloudWatch Log Group for CloudTrail (Optional)
# Enables real-time monitoring of API calls
#------------------------------------------------------------------------------
resource "aws_cloudwatch_log_group" "cloudtrail" {
  count             = var.enable_cloudtrail_cloudwatch ? 1 : 0
  name              = "/aws/cloudtrail/${var.project_name}-${var.environment}"
  retention_in_days = var.cloudtrail_log_retention_days

  tags = {
    Name        = "${var.project_name}-${var.environment}-cloudtrail-logs"
    Project     = var.project_name
    Environment = var.environment
    Service     = "security"
    ManagedBy   = "terraform"
  }
}

#------------------------------------------------------------------------------
# IAM Role for CloudTrail to CloudWatch (Optional)
#------------------------------------------------------------------------------
resource "aws_iam_role" "cloudtrail_cloudwatch" {
  count = var.enable_cloudtrail_cloudwatch ? 1 : 0
  name  = "${var.project_name}-${var.environment}-cloudtrail-cloudwatch"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "cloudtrail.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-${var.environment}-cloudtrail-cloudwatch"
    Project     = var.project_name
    Environment = var.environment
    Service     = "security"
    ManagedBy   = "terraform"
  }
}

resource "aws_iam_role_policy" "cloudtrail_cloudwatch" {
  count = var.enable_cloudtrail_cloudwatch ? 1 : 0
  name  = "${var.project_name}-${var.environment}-cloudtrail-cloudwatch"
  role  = aws_iam_role.cloudtrail_cloudwatch[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "${aws_cloudwatch_log_group.cloudtrail[0].arn}:*"
      }
    ]
  })
}

#------------------------------------------------------------------------------
# CloudTrail Trail
# Captures all management events and optionally data events
#------------------------------------------------------------------------------
resource "aws_cloudtrail" "main" {
  name                          = "${var.project_name}-${var.environment}-trail"
  s3_bucket_name                = aws_s3_bucket.cloudtrail.id
  s3_key_prefix                 = "AWSLogs"
  include_global_service_events = true
  is_multi_region_trail         = false # Single region for staging (cost savings)
  enable_logging                = true

  # KMS encryption for logs (optional - can be enabled for production)
  # Note: Requires specific KMS key policy for CloudTrail
  # kms_key_id = var.kms_key_arn

  # CloudWatch Logs integration (optional)
  cloud_watch_logs_group_arn = var.enable_cloudtrail_cloudwatch ? "${aws_cloudwatch_log_group.cloudtrail[0].arn}:*" : null
  cloud_watch_logs_role_arn  = var.enable_cloudtrail_cloudwatch ? aws_iam_role.cloudtrail_cloudwatch[0].arn : null

  # Enable log file validation for integrity
  enable_log_file_validation = true

  # Event selectors for management events
  event_selector {
    read_write_type           = "All"
    include_management_events = true
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-cloudtrail"
    Project     = var.project_name
    Environment = var.environment
    Service     = "security"
    ManagedBy   = "terraform"
  }

  depends_on = [aws_s3_bucket_policy.cloudtrail]
}
