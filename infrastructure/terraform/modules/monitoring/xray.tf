# Monitoring Module - X-Ray Tracing Configuration
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 7 - Monitoring
#
# Creates X-Ray sampling rules and groups for distributed tracing
# - Sampling rule controls what percentage of requests are traced
# - Groups filter traces for specific patterns (errors, slow requests)

#------------------------------------------------------------------------------
# X-Ray Sampling Rule
# Controls what percentage of requests are traced
# Use 1.0 (100%) for staging, 0.05 (5%) for production
#------------------------------------------------------------------------------
resource "aws_xray_sampling_rule" "main" {
  count = var.enable_xray ? 1 : 0

  rule_name      = "${var.project_name}-${var.environment}"
  priority       = 1000
  version        = 1
  reservoir_size = 5 # Fixed rate of 5 requests per second guaranteed
  fixed_rate     = var.xray_sampling_rate
  url_path       = "*"
  host           = "*"
  http_method    = "*"
  service_type   = "*"
  service_name   = "${var.project_name}-${var.environment}-*"
  resource_arn   = "*"

  attributes = {}

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-xray-sampling"
  })
}

#------------------------------------------------------------------------------
# X-Ray Group for Error Traces
# Filters traces that contain errors for easy investigation
#------------------------------------------------------------------------------
resource "aws_xray_group" "errors" {
  count = var.enable_xray ? 1 : 0

  group_name        = "${var.project_name}-${var.environment}-errors"
  filter_expression = "service(id(name: \"${var.project_name}-${var.environment}-backend\")) AND error = true"

  insights_configuration {
    insights_enabled      = true
    notifications_enabled = false # Can enable SNS notifications later
  }

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-xray-errors"
  })
}

#------------------------------------------------------------------------------
# X-Ray Group for Slow Requests
# Filters traces with response time > 1 second
#------------------------------------------------------------------------------
resource "aws_xray_group" "slow_requests" {
  count = var.enable_xray ? 1 : 0

  group_name        = "${var.project_name}-${var.environment}-slow"
  filter_expression = "service(id(name: \"${var.project_name}-${var.environment}-backend\")) AND responsetime > 1"

  insights_configuration {
    insights_enabled      = true
    notifications_enabled = false
  }

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-xray-slow"
  })
}
