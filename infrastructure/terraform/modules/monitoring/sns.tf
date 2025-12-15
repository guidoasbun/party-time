# Monitoring Module - SNS Topics for Alert Notifications
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 7 - Monitoring
#
# Creates three tiers of SNS topics:
# - Critical: Immediate action required (service down, high error rates)
# - Warning: Attention needed (high CPU, approaching limits)
# - Info: Notifications (deployments, recoveries)

#------------------------------------------------------------------------------
# Critical Alerts SNS Topic
# For immediate action: service down, high error rates, database issues
#------------------------------------------------------------------------------
resource "aws_sns_topic" "critical" {
  name         = "${var.project_name}-${var.environment}-critical-alerts"
  display_name = "Party-Time ${title(var.environment)} Critical Alerts"

  tags = merge(local.common_tags, {
    Name     = "${var.project_name}-${var.environment}-critical-alerts"
    Severity = "critical"
  })
}

resource "aws_sns_topic_subscription" "critical_email" {
  count     = var.enable_email_subscription ? 1 : 0
  topic_arn = aws_sns_topic.critical.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

#------------------------------------------------------------------------------
# Warning Alerts SNS Topic
# For attention needed: high CPU, approaching limits
#------------------------------------------------------------------------------
resource "aws_sns_topic" "warning" {
  name         = "${var.project_name}-${var.environment}-warning-alerts"
  display_name = "Party-Time ${title(var.environment)} Warning Alerts"

  tags = merge(local.common_tags, {
    Name     = "${var.project_name}-${var.environment}-warning-alerts"
    Severity = "warning"
  })
}

resource "aws_sns_topic_subscription" "warning_email" {
  count     = var.enable_email_subscription ? 1 : 0
  topic_arn = aws_sns_topic.warning.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

#------------------------------------------------------------------------------
# Info/Deployment SNS Topic
# For notifications: deployments, scheduled events, alarm recoveries
#------------------------------------------------------------------------------
resource "aws_sns_topic" "info" {
  name         = "${var.project_name}-${var.environment}-info-alerts"
  display_name = "Party-Time ${title(var.environment)} Info Notifications"

  tags = merge(local.common_tags, {
    Name     = "${var.project_name}-${var.environment}-info-alerts"
    Severity = "info"
  })
}

resource "aws_sns_topic_subscription" "info_email" {
  count     = var.enable_email_subscription ? 1 : 0
  topic_arn = aws_sns_topic.info.arn
  protocol  = "email"
  endpoint  = var.alert_email
}
