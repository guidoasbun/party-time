# Monitoring Module - ALB Alarms
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 7 - Monitoring
#
# Creates alarms for Application Load Balancer:
# - 5xx error rates (ALB and target)
# - Unhealthy host counts
# - Response latency

#------------------------------------------------------------------------------
# ALB 5xx Error Rate Alarm
# Critical: ALB itself returning 5xx errors (infrastructure issue)
#------------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "alb_5xx_errors" {
  alarm_name          = "${local.alarm_prefix}-alb-5xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "HTTPCode_ELB_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 300 # 5 minutes
  statistic           = "Sum"
  threshold           = var.alarm_thresholds.alb_5xx_count
  alarm_description   = "ALB 5xx errors > ${var.alarm_thresholds.alb_5xx_count} in 5 minutes"
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
  }

  alarm_actions = [aws_sns_topic.critical.arn]
  ok_actions    = [aws_sns_topic.info.arn]

  tags = merge(local.common_tags, {
    Name   = "${local.alarm_prefix}-alb-5xx-errors"
    Metric = "alb-errors"
  })
}

#------------------------------------------------------------------------------
# Backend Target 5xx Errors (Application errors)
# Critical: Backend returning 5xx errors
#------------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "backend_target_5xx_errors" {
  alarm_name          = "${local.alarm_prefix}-backend-5xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 300
  statistic           = "Sum"
  threshold           = var.alarm_thresholds.alb_5xx_count
  alarm_description   = "Backend 5xx errors > ${var.alarm_thresholds.alb_5xx_count} in 5 minutes"
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
    TargetGroup  = var.backend_target_group_arn_suffix
  }

  alarm_actions = [aws_sns_topic.critical.arn]
  ok_actions    = [aws_sns_topic.info.arn]

  tags = merge(local.common_tags, {
    Name    = "${local.alarm_prefix}-backend-5xx-errors"
    Service = "backend"
    Metric  = "target-errors"
  })
}

#------------------------------------------------------------------------------
# Unhealthy Host Count Alarm (Frontend)
# Critical: Frontend service has unhealthy hosts
#------------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "frontend_unhealthy_hosts" {
  alarm_name          = "${local.alarm_prefix}-frontend-unhealthy-hosts"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "UnHealthyHostCount"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Average"
  threshold           = var.alarm_thresholds.alb_unhealthy_hosts
  alarm_description   = "Frontend has unhealthy hosts"
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
    TargetGroup  = var.frontend_target_group_arn_suffix
  }

  alarm_actions = [aws_sns_topic.critical.arn]
  ok_actions    = [aws_sns_topic.info.arn]

  tags = merge(local.common_tags, {
    Name    = "${local.alarm_prefix}-frontend-unhealthy-hosts"
    Service = "frontend"
    Metric  = "health"
  })
}

#------------------------------------------------------------------------------
# Unhealthy Host Count Alarm (Backend)
# Critical: Backend service has unhealthy hosts
#------------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "backend_unhealthy_hosts" {
  alarm_name          = "${local.alarm_prefix}-backend-unhealthy-hosts"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "UnHealthyHostCount"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Average"
  threshold           = var.alarm_thresholds.alb_unhealthy_hosts
  alarm_description   = "Backend has unhealthy hosts"
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
    TargetGroup  = var.backend_target_group_arn_suffix
  }

  alarm_actions = [aws_sns_topic.critical.arn]
  ok_actions    = [aws_sns_topic.info.arn]

  tags = merge(local.common_tags, {
    Name    = "${local.alarm_prefix}-backend-unhealthy-hosts"
    Service = "backend"
    Metric  = "health"
  })
}

#------------------------------------------------------------------------------
# High Response Time Alarm
# Warning: p95 latency exceeds threshold
#------------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "alb_high_latency" {
  alarm_name          = "${local.alarm_prefix}-alb-high-latency"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  extended_statistic  = "p95"
  threshold           = var.alarm_thresholds.alb_latency_p95_seconds
  alarm_description   = "ALB p95 response time > ${var.alarm_thresholds.alb_latency_p95_seconds} seconds for 3 minutes"
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
  }

  alarm_actions = [aws_sns_topic.warning.arn]
  ok_actions    = [aws_sns_topic.info.arn]

  tags = merge(local.common_tags, {
    Name   = "${local.alarm_prefix}-alb-high-latency"
    Metric = "latency"
  })
}
