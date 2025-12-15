# Monitoring Module - ElastiCache Redis Alarms
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 7 - Monitoring
#
# Creates alarms for ElastiCache Redis:
# - CPU utilization
# - Memory usage percentage
# - Evictions (cache items being removed)
# - Cache hit rate (calculated metric)

#------------------------------------------------------------------------------
# CPU Utilization Alarm
# Warning: Redis under high CPU load
#------------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "redis_cpu_high" {
  alarm_name          = "${local.alarm_prefix}-redis-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ElastiCache"
  period              = 60
  statistic           = "Average"
  threshold           = var.alarm_thresholds.elasticache_cpu_percent
  alarm_description   = "Redis CPU utilization > ${var.alarm_thresholds.elasticache_cpu_percent}% for 3 minutes"
  treat_missing_data  = "notBreaching"

  dimensions = {
    CacheClusterId = "${var.elasticache_cluster_id}-001"
  }

  alarm_actions = [aws_sns_topic.warning.arn]
  ok_actions    = [aws_sns_topic.info.arn]

  tags = merge(local.common_tags, {
    Name    = "${local.alarm_prefix}-redis-cpu-high"
    Service = "cache"
    Metric  = "cpu"
  })
}

#------------------------------------------------------------------------------
# Memory Usage Alarm
# Critical: Redis memory usage too high (risk of evictions or OOM)
#------------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "redis_memory_high" {
  alarm_name          = "${local.alarm_prefix}-redis-memory-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "DatabaseMemoryUsagePercentage"
  namespace           = "AWS/ElastiCache"
  period              = 60
  statistic           = "Average"
  threshold           = var.alarm_thresholds.elasticache_memory_percent
  alarm_description   = "Redis memory usage > ${var.alarm_thresholds.elasticache_memory_percent}% for 3 minutes"
  treat_missing_data  = "notBreaching"

  dimensions = {
    CacheClusterId = "${var.elasticache_cluster_id}-001"
  }

  alarm_actions = [aws_sns_topic.critical.arn]
  ok_actions    = [aws_sns_topic.info.arn]

  tags = merge(local.common_tags, {
    Name    = "${local.alarm_prefix}-redis-memory-high"
    Service = "cache"
    Metric  = "memory"
  })
}

#------------------------------------------------------------------------------
# Evictions Alarm
# Warning: Cache items being evicted (memory pressure or misconfiguration)
#------------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "redis_evictions_high" {
  alarm_name          = "${local.alarm_prefix}-redis-evictions-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "Evictions"
  namespace           = "AWS/ElastiCache"
  period              = 300 # 5 minutes
  statistic           = "Sum"
  threshold           = var.alarm_thresholds.elasticache_evictions
  alarm_description   = "Redis evictions > ${var.alarm_thresholds.elasticache_evictions} in 5 minutes (consider scaling)"
  treat_missing_data  = "notBreaching"

  dimensions = {
    CacheClusterId = "${var.elasticache_cluster_id}-001"
  }

  alarm_actions = [aws_sns_topic.warning.arn]
  ok_actions    = [aws_sns_topic.info.arn]

  tags = merge(local.common_tags, {
    Name    = "${local.alarm_prefix}-redis-evictions-high"
    Service = "cache"
    Metric  = "evictions"
  })
}

#------------------------------------------------------------------------------
# Cache Hit Rate Alarm (Calculated Metric)
# Warning: Low hit rate indicates caching issues or ineffective cache strategy
#------------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "redis_hit_rate_low" {
  alarm_name          = "${local.alarm_prefix}-redis-hit-rate-low"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 5
  threshold           = 80 # Below 80% hit rate

  metric_query {
    id          = "hit_rate"
    expression  = "IF(hits+misses > 0, (hits / (hits + misses)) * 100, 100)"
    label       = "Cache Hit Rate"
    return_data = true
  }

  metric_query {
    id = "hits"
    metric {
      metric_name = "CacheHits"
      namespace   = "AWS/ElastiCache"
      period      = 300
      stat        = "Sum"
      dimensions = {
        CacheClusterId = "${var.elasticache_cluster_id}-001"
      }
    }
  }

  metric_query {
    id = "misses"
    metric {
      metric_name = "CacheMisses"
      namespace   = "AWS/ElastiCache"
      period      = 300
      stat        = "Sum"
      dimensions = {
        CacheClusterId = "${var.elasticache_cluster_id}-001"
      }
    }
  }

  alarm_description  = "Redis cache hit rate < 80% for 25 minutes"
  treat_missing_data = "notBreaching"

  alarm_actions = [aws_sns_topic.warning.arn]
  ok_actions    = [aws_sns_topic.info.arn]

  tags = merge(local.common_tags, {
    Name    = "${local.alarm_prefix}-redis-hit-rate-low"
    Service = "cache"
    Metric  = "hit-rate"
  })
}
