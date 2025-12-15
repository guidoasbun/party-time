# Monitoring Module - ECS Service Alarms
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 7 - Monitoring
#
# Creates CPU and Memory alarms for ECS services:
# - Frontend (Next.js)
# - Backend (FastAPI)
# - Celery Worker

#------------------------------------------------------------------------------
# Frontend Service Alarms
#------------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "frontend_cpu_high" {
  alarm_name          = "${local.alarm_prefix}-frontend-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 60
  statistic           = "Average"
  threshold           = var.alarm_thresholds.ecs_cpu_percent
  alarm_description   = "Frontend service CPU utilization > ${var.alarm_thresholds.ecs_cpu_percent}% for 3 minutes"
  treat_missing_data  = "notBreaching"

  dimensions = {
    ClusterName = var.ecs_cluster_name
    ServiceName = var.ecs_services.frontend
  }

  alarm_actions = [aws_sns_topic.warning.arn]
  ok_actions    = [aws_sns_topic.info.arn]

  tags = merge(local.common_tags, {
    Name    = "${local.alarm_prefix}-frontend-cpu-high"
    Service = "frontend"
    Metric  = "cpu"
  })
}

resource "aws_cloudwatch_metric_alarm" "frontend_memory_high" {
  alarm_name          = "${local.alarm_prefix}-frontend-memory-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = 60
  statistic           = "Average"
  threshold           = var.alarm_thresholds.ecs_memory_percent
  alarm_description   = "Frontend service memory utilization > ${var.alarm_thresholds.ecs_memory_percent}% for 3 minutes"
  treat_missing_data  = "notBreaching"

  dimensions = {
    ClusterName = var.ecs_cluster_name
    ServiceName = var.ecs_services.frontend
  }

  alarm_actions = [aws_sns_topic.warning.arn]
  ok_actions    = [aws_sns_topic.info.arn]

  tags = merge(local.common_tags, {
    Name    = "${local.alarm_prefix}-frontend-memory-high"
    Service = "frontend"
    Metric  = "memory"
  })
}

#------------------------------------------------------------------------------
# Backend Service Alarms
#------------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "backend_cpu_high" {
  alarm_name          = "${local.alarm_prefix}-backend-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 60
  statistic           = "Average"
  threshold           = var.alarm_thresholds.ecs_cpu_percent
  alarm_description   = "Backend service CPU utilization > ${var.alarm_thresholds.ecs_cpu_percent}% for 3 minutes"
  treat_missing_data  = "notBreaching"

  dimensions = {
    ClusterName = var.ecs_cluster_name
    ServiceName = var.ecs_services.backend
  }

  alarm_actions = [aws_sns_topic.warning.arn]
  ok_actions    = [aws_sns_topic.info.arn]

  tags = merge(local.common_tags, {
    Name    = "${local.alarm_prefix}-backend-cpu-high"
    Service = "backend"
    Metric  = "cpu"
  })
}

resource "aws_cloudwatch_metric_alarm" "backend_memory_high" {
  alarm_name          = "${local.alarm_prefix}-backend-memory-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = 60
  statistic           = "Average"
  threshold           = var.alarm_thresholds.ecs_memory_percent
  alarm_description   = "Backend service memory utilization > ${var.alarm_thresholds.ecs_memory_percent}% for 3 minutes"
  treat_missing_data  = "notBreaching"

  dimensions = {
    ClusterName = var.ecs_cluster_name
    ServiceName = var.ecs_services.backend
  }

  alarm_actions = [aws_sns_topic.warning.arn]
  ok_actions    = [aws_sns_topic.info.arn]

  tags = merge(local.common_tags, {
    Name    = "${local.alarm_prefix}-backend-memory-high"
    Service = "backend"
    Metric  = "memory"
  })
}

#------------------------------------------------------------------------------
# Celery Worker Service Alarms
#------------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "celery_worker_cpu_high" {
  alarm_name          = "${local.alarm_prefix}-celery-worker-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 60
  statistic           = "Average"
  threshold           = var.alarm_thresholds.ecs_cpu_percent
  alarm_description   = "Celery worker CPU utilization > ${var.alarm_thresholds.ecs_cpu_percent}% for 3 minutes"
  treat_missing_data  = "notBreaching"

  dimensions = {
    ClusterName = var.ecs_cluster_name
    ServiceName = var.ecs_services.celery_worker
  }

  alarm_actions = [aws_sns_topic.warning.arn]
  ok_actions    = [aws_sns_topic.info.arn]

  tags = merge(local.common_tags, {
    Name    = "${local.alarm_prefix}-celery-worker-cpu-high"
    Service = "celery-worker"
    Metric  = "cpu"
  })
}

resource "aws_cloudwatch_metric_alarm" "celery_worker_memory_high" {
  alarm_name          = "${local.alarm_prefix}-celery-worker-memory-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = 60
  statistic           = "Average"
  threshold           = var.alarm_thresholds.ecs_memory_percent
  alarm_description   = "Celery worker memory utilization > ${var.alarm_thresholds.ecs_memory_percent}% for 3 minutes"
  treat_missing_data  = "notBreaching"

  dimensions = {
    ClusterName = var.ecs_cluster_name
    ServiceName = var.ecs_services.celery_worker
  }

  alarm_actions = [aws_sns_topic.warning.arn]
  ok_actions    = [aws_sns_topic.info.arn]

  tags = merge(local.common_tags, {
    Name    = "${local.alarm_prefix}-celery-worker-memory-high"
    Service = "celery-worker"
    Metric  = "memory"
  })
}
