# Monitoring Module - CloudWatch Dashboards
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 7 - Monitoring
#
# Creates three dashboards:
# - Application Overview: ECS metrics, ALB requests/errors, healthy hosts
# - Database Health: RDS and Redis metrics
# - Email/SES: Email sending metrics and reputation

#------------------------------------------------------------------------------
# Application Overview Dashboard
# Shows ECS service health, ALB traffic, and errors
#------------------------------------------------------------------------------
resource "aws_cloudwatch_dashboard" "overview" {
  dashboard_name = "${var.project_name}-${var.environment}-overview"

  dashboard_body = jsonencode({
    widgets = [
      # Row 1: ECS Service Health
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          title   = "ECS CPU Utilization"
          region  = local.region
          metrics = [
            ["AWS/ECS", "CPUUtilization", "ClusterName", var.ecs_cluster_name, "ServiceName", var.ecs_services.frontend, { label = "Frontend", color = "#2ca02c" }],
            ["...", var.ecs_services.backend, { label = "Backend", color = "#1f77b4" }],
            ["...", var.ecs_services.celery_worker, { label = "Celery Worker", color = "#ff7f0e" }],
            ["...", var.ecs_services.celery_beat, { label = "Celery Beat", color = "#9467bd" }]
          ]
          period = 60
          stat   = "Average"
          view   = "timeSeries"
          annotations = {
            horizontal = [
              { value = var.alarm_thresholds.ecs_cpu_percent, label = "Alarm", color = "#d62728" }
            ]
          }
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6
        properties = {
          title   = "ECS Memory Utilization"
          region  = local.region
          metrics = [
            ["AWS/ECS", "MemoryUtilization", "ClusterName", var.ecs_cluster_name, "ServiceName", var.ecs_services.frontend, { label = "Frontend", color = "#2ca02c" }],
            ["...", var.ecs_services.backend, { label = "Backend", color = "#1f77b4" }],
            ["...", var.ecs_services.celery_worker, { label = "Celery Worker", color = "#ff7f0e" }],
            ["...", var.ecs_services.celery_beat, { label = "Celery Beat", color = "#9467bd" }]
          ]
          period = 60
          stat   = "Average"
          view   = "timeSeries"
          annotations = {
            horizontal = [
              { value = var.alarm_thresholds.ecs_memory_percent, label = "Alarm", color = "#d62728" }
            ]
          }
        }
      },

      # Row 2: ALB Metrics
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 8
        height = 6
        properties = {
          title   = "ALB Request Count"
          region  = local.region
          metrics = [
            ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", var.alb_arn_suffix, { color = "#1f77b4" }]
          ]
          period = 60
          stat   = "Sum"
          view   = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 8
        y      = 6
        width  = 8
        height = 6
        properties = {
          title   = "ALB Response Time"
          region  = local.region
          metrics = [
            ["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", var.alb_arn_suffix, { stat = "p95", label = "p95", color = "#d62728" }],
            ["...", { stat = "p50", label = "p50", color = "#ff7f0e" }],
            ["...", { stat = "Average", label = "Average", color = "#2ca02c" }]
          ]
          period = 60
          view   = "timeSeries"
          annotations = {
            horizontal = [
              { value = var.alarm_thresholds.alb_latency_p95_seconds, label = "Alarm", color = "#d62728" }
            ]
          }
        }
      },
      {
        type   = "metric"
        x      = 16
        y      = 6
        width  = 8
        height = 6
        properties = {
          title   = "ALB Error Rates"
          region  = local.region
          metrics = [
            ["AWS/ApplicationELB", "HTTPCode_ELB_5XX_Count", "LoadBalancer", var.alb_arn_suffix, { label = "ALB 5xx", color = "#d62728" }],
            [".", "HTTPCode_Target_5XX_Count", ".", ".", { label = "Target 5xx", color = "#ff7f0e" }],
            [".", "HTTPCode_Target_4XX_Count", ".", ".", { label = "Target 4xx", color = "#ffbb78" }]
          ]
          period = 60
          stat   = "Sum"
          view   = "timeSeries"
        }
      },

      # Row 3: Target Health
      {
        type   = "metric"
        x      = 0
        y      = 12
        width  = 12
        height = 6
        properties = {
          title   = "Healthy Host Count"
          region  = local.region
          metrics = [
            ["AWS/ApplicationELB", "HealthyHostCount", "LoadBalancer", var.alb_arn_suffix, "TargetGroup", var.frontend_target_group_arn_suffix, { label = "Frontend", color = "#2ca02c" }],
            ["...", var.backend_target_group_arn_suffix, { label = "Backend", color = "#1f77b4" }]
          ]
          period = 60
          stat   = "Average"
          view   = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 12
        width  = 12
        height = 6
        properties = {
          title   = "Unhealthy Host Count"
          region  = local.region
          metrics = [
            ["AWS/ApplicationELB", "UnHealthyHostCount", "LoadBalancer", var.alb_arn_suffix, "TargetGroup", var.frontend_target_group_arn_suffix, { label = "Frontend", color = "#d62728" }],
            ["...", var.backend_target_group_arn_suffix, { label = "Backend", color = "#ff7f0e" }]
          ]
          period = 60
          stat   = "Average"
          view   = "timeSeries"
        }
      },

      # Row 4: Alarm Status
      {
        type   = "alarm"
        x      = 0
        y      = 18
        width  = 24
        height = 4
        properties = {
          title  = "Alarm Status"
          alarms = [
            aws_cloudwatch_metric_alarm.frontend_cpu_high.arn,
            aws_cloudwatch_metric_alarm.backend_cpu_high.arn,
            aws_cloudwatch_metric_alarm.alb_5xx_errors.arn,
            aws_cloudwatch_metric_alarm.backend_unhealthy_hosts.arn,
            aws_cloudwatch_metric_alarm.rds_cpu_high.arn,
            aws_cloudwatch_metric_alarm.redis_memory_high.arn
          ]
        }
      }
    ]
  })
}

#------------------------------------------------------------------------------
# Database Health Dashboard
# Shows RDS and Redis metrics
#------------------------------------------------------------------------------
resource "aws_cloudwatch_dashboard" "database" {
  dashboard_name = "${var.project_name}-${var.environment}-database"

  dashboard_body = jsonencode({
    widgets = [
      # Row 1: RDS Core Metrics
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 8
        height = 6
        properties = {
          title   = "RDS CPU Utilization"
          region  = local.region
          metrics = [
            ["AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", var.rds_instance_identifier, { color = "#1f77b4" }]
          ]
          period = 60
          stat   = "Average"
          view   = "timeSeries"
          annotations = {
            horizontal = [
              { value = var.alarm_thresholds.rds_cpu_percent, label = "Alarm", color = "#d62728" }
            ]
          }
        }
      },
      {
        type   = "metric"
        x      = 8
        y      = 0
        width  = 8
        height = 6
        properties = {
          title   = "Database Connections"
          region  = local.region
          metrics = [
            ["AWS/RDS", "DatabaseConnections", "DBInstanceIdentifier", var.rds_instance_identifier, { color = "#ff7f0e" }]
          ]
          period = 60
          stat   = "Average"
          view   = "timeSeries"
          annotations = {
            horizontal = [
              { value = floor(var.rds_max_connections * 0.8), label = "80% Limit", color = "#d62728" }
            ]
          }
        }
      },
      {
        type   = "metric"
        x      = 16
        y      = 0
        width  = 8
        height = 6
        properties = {
          title   = "Freeable Memory (MB)"
          region  = local.region
          metrics = [
            ["AWS/RDS", "FreeableMemory", "DBInstanceIdentifier", var.rds_instance_identifier, { color = "#2ca02c" }]
          ]
          period = 60
          stat   = "Average"
          view   = "timeSeries"
          yAxis = {
            left = {
              label     = "Bytes"
              showUnits = false
            }
          }
        }
      },

      # Row 2: RDS Storage and Latency
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 8
        height = 6
        properties = {
          title   = "Free Storage Space (GB)"
          region  = local.region
          metrics = [
            ["AWS/RDS", "FreeStorageSpace", "DBInstanceIdentifier", var.rds_instance_identifier, { color = "#9467bd" }]
          ]
          period = 300
          stat   = "Average"
          view   = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 8
        y      = 6
        width  = 8
        height = 6
        properties = {
          title   = "Read/Write Latency (seconds)"
          region  = local.region
          metrics = [
            ["AWS/RDS", "ReadLatency", "DBInstanceIdentifier", var.rds_instance_identifier, { label = "Read", color = "#1f77b4" }],
            [".", "WriteLatency", ".", ".", { label = "Write", color = "#ff7f0e" }]
          ]
          period = 60
          stat   = "Average"
          view   = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 16
        y      = 6
        width  = 8
        height = 6
        properties = {
          title   = "Read/Write IOPS"
          region  = local.region
          metrics = [
            ["AWS/RDS", "ReadIOPS", "DBInstanceIdentifier", var.rds_instance_identifier, { label = "Read", color = "#1f77b4" }],
            [".", "WriteIOPS", ".", ".", { label = "Write", color = "#ff7f0e" }]
          ]
          period = 60
          stat   = "Average"
          view   = "timeSeries"
        }
      },

      # Row 3: Redis Metrics
      {
        type   = "metric"
        x      = 0
        y      = 12
        width  = 8
        height = 6
        properties = {
          title   = "Redis CPU Utilization"
          region  = local.region
          metrics = [
            ["AWS/ElastiCache", "CPUUtilization", "CacheClusterId", "${var.elasticache_cluster_id}-001", { color = "#d62728" }]
          ]
          period = 60
          stat   = "Average"
          view   = "timeSeries"
          annotations = {
            horizontal = [
              { value = var.alarm_thresholds.elasticache_cpu_percent, label = "Alarm", color = "#d62728" }
            ]
          }
        }
      },
      {
        type   = "metric"
        x      = 8
        y      = 12
        width  = 8
        height = 6
        properties = {
          title   = "Redis Memory Usage (%)"
          region  = local.region
          metrics = [
            ["AWS/ElastiCache", "DatabaseMemoryUsagePercentage", "CacheClusterId", "${var.elasticache_cluster_id}-001", { color = "#ff7f0e" }]
          ]
          period = 60
          stat   = "Average"
          view   = "timeSeries"
          annotations = {
            horizontal = [
              { value = var.alarm_thresholds.elasticache_memory_percent, label = "Alarm", color = "#d62728" }
            ]
          }
        }
      },
      {
        type   = "metric"
        x      = 16
        y      = 12
        width  = 8
        height = 6
        properties = {
          title   = "Redis Cache Hit/Miss"
          region  = local.region
          metrics = [
            ["AWS/ElastiCache", "CacheHits", "CacheClusterId", "${var.elasticache_cluster_id}-001", { label = "Hits", color = "#2ca02c" }],
            [".", "CacheMisses", ".", ".", { label = "Misses", color = "#d62728" }]
          ]
          period = 60
          stat   = "Sum"
          view   = "timeSeries"
        }
      },

      # Row 4: Redis Additional Metrics
      {
        type   = "metric"
        x      = 0
        y      = 18
        width  = 12
        height = 6
        properties = {
          title   = "Redis Current Connections"
          region  = local.region
          metrics = [
            ["AWS/ElastiCache", "CurrConnections", "CacheClusterId", "${var.elasticache_cluster_id}-001", { color = "#1f77b4" }]
          ]
          period = 60
          stat   = "Average"
          view   = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 18
        width  = 12
        height = 6
        properties = {
          title   = "Redis Evictions"
          region  = local.region
          metrics = [
            ["AWS/ElastiCache", "Evictions", "CacheClusterId", "${var.elasticache_cluster_id}-001", { color = "#d62728" }]
          ]
          period = 300
          stat   = "Sum"
          view   = "timeSeries"
        }
      }
    ]
  })
}

#------------------------------------------------------------------------------
# Email/SES Dashboard
# Shows email sending metrics and reputation
#------------------------------------------------------------------------------
resource "aws_cloudwatch_dashboard" "email" {
  dashboard_name = "${var.project_name}-${var.environment}-email"

  dashboard_body = jsonencode({
    widgets = [
      # Row 1: SES Sending Metrics
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 8
        height = 6
        properties = {
          title   = "Emails Sent"
          region  = local.region
          metrics = [
            ["AWS/SES", "Send", { color = "#1f77b4" }]
          ]
          period = 3600
          stat   = "Sum"
          view   = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 8
        y      = 0
        width  = 8
        height = 6
        properties = {
          title   = "Delivery Count"
          region  = local.region
          metrics = [
            ["AWS/SES", "Delivery", { color = "#2ca02c" }]
          ]
          period = 3600
          stat   = "Sum"
          view   = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 16
        y      = 0
        width  = 8
        height = 6
        properties = {
          title   = "Open Count"
          region  = local.region
          metrics = [
            ["AWS/SES", "Open", { color = "#ff7f0e" }]
          ]
          period = 3600
          stat   = "Sum"
          view   = "timeSeries"
        }
      },

      # Row 2: Reputation Metrics
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6
        properties = {
          title   = "Bounce Rate (%)"
          region  = local.region
          metrics = [
            ["AWS/SES", "Reputation.BounceRate", { color = "#d62728" }]
          ]
          period = 3600
          stat   = "Average"
          view   = "timeSeries"
          annotations = {
            horizontal = [
              { value = 0.05, label = "5% Threshold", color = "#d62728" }
            ]
          }
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 6
        width  = 12
        height = 6
        properties = {
          title   = "Complaint Rate (%)"
          region  = local.region
          metrics = [
            ["AWS/SES", "Reputation.ComplaintRate", { color = "#ff7f0e" }]
          ]
          period = 3600
          stat   = "Average"
          view   = "timeSeries"
          annotations = {
            horizontal = [
              { value = 0.001, label = "0.1% Threshold", color = "#d62728" }
            ]
          }
        }
      },

      # Row 3: Bounce/Complaint Counts
      {
        type   = "metric"
        x      = 0
        y      = 12
        width  = 12
        height = 6
        properties = {
          title   = "Bounce Count"
          region  = local.region
          metrics = [
            ["AWS/SES", "Bounce", { color = "#d62728" }]
          ]
          period = 3600
          stat   = "Sum"
          view   = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 12
        width  = 12
        height = 6
        properties = {
          title   = "Complaint Count"
          region  = local.region
          metrics = [
            ["AWS/SES", "Complaint", { color = "#ff7f0e" }]
          ]
          period = 3600
          stat   = "Sum"
          view   = "timeSeries"
        }
      },

      # Row 4: Info text
      {
        type   = "text"
        x      = 0
        y      = 18
        width  = 24
        height = 3
        properties = {
          markdown = "## SES Reputation Thresholds\n- **Bounce Rate**: AWS suspends accounts at 5%+\n- **Complaint Rate**: AWS suspends accounts at 0.1%+\n\n*Note: Metrics may not appear until SES is out of sandbox mode and sending emails.*"
        }
      }
    ]
  })
}
