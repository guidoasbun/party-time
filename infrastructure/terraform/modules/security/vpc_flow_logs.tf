# Security Module - VPC Flow Logs
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 5 - Security
#
# Creates:
# - VPC Flow Logs to CloudWatch
# - IAM role for Flow Logs
# - CloudWatch Log Group

#------------------------------------------------------------------------------
# CloudWatch Log Group for VPC Flow Logs
#------------------------------------------------------------------------------
resource "aws_cloudwatch_log_group" "vpc_flow_logs" {
  name              = "/aws/vpc/${var.project_name}-${var.environment}-flow-logs"
  retention_in_days = var.flow_log_retention_days

  tags = {
    Name        = "${var.project_name}-${var.environment}-vpc-flow-logs"
    Project     = var.project_name
    Environment = var.environment
    Service     = "security"
    ManagedBy   = "terraform"
  }
}

#------------------------------------------------------------------------------
# IAM Role for VPC Flow Logs
#------------------------------------------------------------------------------
resource "aws_iam_role" "vpc_flow_logs" {
  name = "${var.project_name}-${var.environment}-vpc-flow-logs"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "vpc-flow-logs.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-${var.environment}-vpc-flow-logs"
    Project     = var.project_name
    Environment = var.environment
    Service     = "security"
    ManagedBy   = "terraform"
  }
}

resource "aws_iam_role_policy" "vpc_flow_logs" {
  name = "${var.project_name}-${var.environment}-vpc-flow-logs"
  role = aws_iam_role.vpc_flow_logs.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams"
        ]
        Resource = "*"
      }
    ]
  })
}

#------------------------------------------------------------------------------
# VPC Flow Logs
# Captures network traffic information for security analysis
#------------------------------------------------------------------------------
resource "aws_flow_log" "main" {
  vpc_id                   = var.vpc_id
  traffic_type             = "ALL"
  log_destination_type     = "cloud-watch-logs"
  log_destination          = aws_cloudwatch_log_group.vpc_flow_logs.arn
  iam_role_arn             = aws_iam_role.vpc_flow_logs.arn
  max_aggregation_interval = 60 # 1 minute (minimum for detailed analysis)

  tags = {
    Name        = "${var.project_name}-${var.environment}-vpc-flow-logs"
    Project     = var.project_name
    Environment = var.environment
    Service     = "security"
    ManagedBy   = "terraform"
  }
}
