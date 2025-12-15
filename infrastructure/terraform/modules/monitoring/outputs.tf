# Monitoring Module - Outputs
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 7 - Monitoring

#------------------------------------------------------------------------------
# SNS Topic Outputs
#------------------------------------------------------------------------------
output "sns_topic_critical_arn" {
  description = "Critical alerts SNS topic ARN"
  value       = aws_sns_topic.critical.arn
}

output "sns_topic_warning_arn" {
  description = "Warning alerts SNS topic ARN"
  value       = aws_sns_topic.warning.arn
}

output "sns_topic_info_arn" {
  description = "Info notifications SNS topic ARN"
  value       = aws_sns_topic.info.arn
}

#------------------------------------------------------------------------------
# Dashboard Outputs
#------------------------------------------------------------------------------
output "dashboard_overview_name" {
  description = "Application overview dashboard name"
  value       = aws_cloudwatch_dashboard.overview.dashboard_name
}

output "dashboard_database_name" {
  description = "Database health dashboard name"
  value       = aws_cloudwatch_dashboard.database.dashboard_name
}

output "dashboard_email_name" {
  description = "Email/SES dashboard name"
  value       = aws_cloudwatch_dashboard.email.dashboard_name
}

output "dashboard_overview_url" {
  description = "URL to the Application Overview dashboard"
  value       = "https://${local.region}.console.aws.amazon.com/cloudwatch/home?region=${local.region}#dashboards:name=${aws_cloudwatch_dashboard.overview.dashboard_name}"
}

output "dashboard_database_url" {
  description = "URL to the Database Health dashboard"
  value       = "https://${local.region}.console.aws.amazon.com/cloudwatch/home?region=${local.region}#dashboards:name=${aws_cloudwatch_dashboard.database.dashboard_name}"
}

#------------------------------------------------------------------------------
# X-Ray Outputs
#------------------------------------------------------------------------------
output "xray_sampling_rule_name" {
  description = "X-Ray sampling rule name"
  value       = var.enable_xray ? aws_xray_sampling_rule.main[0].rule_name : null
}

#------------------------------------------------------------------------------
# Synthetics Outputs
#------------------------------------------------------------------------------
output "canary_homepage_name" {
  description = "Homepage canary name"
  value       = var.enable_synthetics ? aws_synthetics_canary.homepage[0].name : null
}

output "canary_api_health_name" {
  description = "API health canary name"
  value       = var.enable_synthetics ? aws_synthetics_canary.api_health[0].name : null
}

#------------------------------------------------------------------------------
# Alarm Count Summary
#------------------------------------------------------------------------------
output "alarm_summary" {
  description = "Summary of alarms created"
  value = {
    ecs_alarms         = 6 # CPU + Memory for frontend, backend, celery-worker
    alb_alarms         = 5 # 5xx errors, target 5xx, unhealthy hosts (x2), latency
    rds_alarms         = 5 # CPU, connections, storage, memory, read latency
    elasticache_alarms = 4 # CPU, memory, evictions, hit rate
    synthetics_alarms  = var.enable_synthetics ? 2 : 0
    total              = 20 + (var.enable_synthetics ? 2 : 0)
  }
}
