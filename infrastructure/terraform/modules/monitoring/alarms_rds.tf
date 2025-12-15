# Monitoring Module - RDS PostgreSQL Alarms
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 7 - Monitoring
#
# Creates alarms for RDS PostgreSQL:
# - CPU utilization
# - Database connections
# - Free storage space
# - Freeable memory
# - Read latency

#------------------------------------------------------------------------------
# CPU Utilization Alarm
# Warning: Database under high CPU load
#------------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "rds_cpu_high" {
  alarm_name          = "${local.alarm_prefix}-rds-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 60
  statistic           = "Average"
  threshold           = var.alarm_thresholds.rds_cpu_percent
  alarm_description   = "RDS CPU utilization > ${var.alarm_thresholds.rds_cpu_percent}% for 3 minutes"
  treat_missing_data  = "breaching"

  dimensions = {
    DBInstanceIdentifier = var.rds_instance_identifier
  }

  alarm_actions = [aws_sns_topic.warning.arn]
  ok_actions    = [aws_sns_topic.info.arn]

  tags = merge(local.common_tags, {
    Name    = "${local.alarm_prefix}-rds-cpu-high"
    Service = "database"
    Metric  = "cpu"
  })
}

#------------------------------------------------------------------------------
# Database Connections Alarm
# Warning: Approaching connection limit
#------------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "rds_connections_high" {
  alarm_name          = "${local.alarm_prefix}-rds-connections-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = 60
  statistic           = "Average"
  threshold           = floor(var.rds_max_connections * (var.alarm_thresholds.rds_connections_percent / 100))
  alarm_description   = "RDS connections > ${var.alarm_thresholds.rds_connections_percent}% of max (${var.rds_max_connections})"
  treat_missing_data  = "breaching"

  dimensions = {
    DBInstanceIdentifier = var.rds_instance_identifier
  }

  alarm_actions = [aws_sns_topic.warning.arn]
  ok_actions    = [aws_sns_topic.info.arn]

  tags = merge(local.common_tags, {
    Name    = "${local.alarm_prefix}-rds-connections-high"
    Service = "database"
    Metric  = "connections"
  })
}

#------------------------------------------------------------------------------
# Free Storage Space Alarm
# Critical: Running low on disk space
#------------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "rds_storage_low" {
  alarm_name          = "${local.alarm_prefix}-rds-storage-low"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  metric_name         = "FreeStorageSpace"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  # Convert GB to bytes
  threshold           = var.alarm_thresholds.rds_free_storage_gb * 1024 * 1024 * 1024
  alarm_description   = "RDS free storage < ${var.alarm_thresholds.rds_free_storage_gb}GB"
  treat_missing_data  = "breaching"

  dimensions = {
    DBInstanceIdentifier = var.rds_instance_identifier
  }

  alarm_actions = [aws_sns_topic.critical.arn]
  ok_actions    = [aws_sns_topic.info.arn]

  tags = merge(local.common_tags, {
    Name    = "${local.alarm_prefix}-rds-storage-low"
    Service = "database"
    Metric  = "storage"
  })
}

#------------------------------------------------------------------------------
# Freeable Memory Alarm
# Critical: Database running low on available memory
#------------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "rds_memory_low" {
  alarm_name          = "${local.alarm_prefix}-rds-memory-low"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 3
  metric_name         = "FreeableMemory"
  namespace           = "AWS/RDS"
  period              = 60
  statistic           = "Average"
  # Convert MB to bytes
  threshold           = var.alarm_thresholds.rds_freeable_memory_mb * 1024 * 1024
  alarm_description   = "RDS freeable memory < ${var.alarm_thresholds.rds_freeable_memory_mb}MB"
  treat_missing_data  = "breaching"

  dimensions = {
    DBInstanceIdentifier = var.rds_instance_identifier
  }

  alarm_actions = [aws_sns_topic.critical.arn]
  ok_actions    = [aws_sns_topic.info.arn]

  tags = merge(local.common_tags, {
    Name    = "${local.alarm_prefix}-rds-memory-low"
    Service = "database"
    Metric  = "memory"
  })
}

#------------------------------------------------------------------------------
# Read Latency Alarm
# Warning: Database read operations are slow
#------------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "rds_read_latency_high" {
  alarm_name          = "${local.alarm_prefix}-rds-read-latency-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "ReadLatency"
  namespace           = "AWS/RDS"
  period              = 60
  statistic           = "Average"
  threshold           = var.alarm_thresholds.rds_read_latency_seconds
  alarm_description   = "RDS read latency > ${var.alarm_thresholds.rds_read_latency_seconds * 1000}ms for 3 minutes"
  treat_missing_data  = "notBreaching"

  dimensions = {
    DBInstanceIdentifier = var.rds_instance_identifier
  }

  alarm_actions = [aws_sns_topic.warning.arn]
  ok_actions    = [aws_sns_topic.info.arn]

  tags = merge(local.common_tags, {
    Name    = "${local.alarm_prefix}-rds-read-latency-high"
    Service = "database"
    Metric  = "latency"
  })
}
