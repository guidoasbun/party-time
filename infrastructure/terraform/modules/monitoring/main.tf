# Monitoring Module - Main Configuration
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 7 - Monitoring
#
# Creates common resources, data sources, and local variables
# for CloudWatch dashboards, alarms, SNS topics, X-Ray, and Synthetics

#------------------------------------------------------------------------------
# Data Sources
#------------------------------------------------------------------------------
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

#------------------------------------------------------------------------------
# Local Variables
#------------------------------------------------------------------------------
locals {
  account_id = data.aws_caller_identity.current.account_id
  region     = data.aws_region.current.name

  # Standard tags for all monitoring resources
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    Service     = "monitoring"
    ManagedBy   = "terraform"
    Phase       = "7"
  }

  # Alarm name prefix for consistent naming
  alarm_prefix = "${var.project_name}-${var.environment}"
}
