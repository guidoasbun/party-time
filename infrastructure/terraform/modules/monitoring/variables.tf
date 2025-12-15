# Monitoring Module - Variables
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 7 - Monitoring

#------------------------------------------------------------------------------
# Core Configuration
#------------------------------------------------------------------------------
variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name (staging, production)"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

#------------------------------------------------------------------------------
# SNS Configuration
#------------------------------------------------------------------------------
variable "alert_email" {
  description = "Email address for alert notifications"
  type        = string
}

variable "enable_email_subscription" {
  description = "Enable email subscription (requires manual confirmation)"
  type        = bool
  default     = true
}

#------------------------------------------------------------------------------
# ECS Configuration
#------------------------------------------------------------------------------
variable "ecs_cluster_name" {
  description = "ECS cluster name"
  type        = string
}

variable "ecs_services" {
  description = "Map of ECS service names"
  type = object({
    frontend      = string
    backend       = string
    celery_worker = string
    celery_beat   = string
  })
}

#------------------------------------------------------------------------------
# ALB Configuration
#------------------------------------------------------------------------------
variable "alb_arn_suffix" {
  description = "ALB ARN suffix (for CloudWatch metrics dimensions)"
  type        = string
}

variable "frontend_target_group_arn_suffix" {
  description = "Frontend target group ARN suffix"
  type        = string
}

variable "backend_target_group_arn_suffix" {
  description = "Backend target group ARN suffix"
  type        = string
}

#------------------------------------------------------------------------------
# RDS Configuration
#------------------------------------------------------------------------------
variable "rds_instance_identifier" {
  description = "RDS instance identifier"
  type        = string
}

variable "rds_max_connections" {
  description = "Maximum database connections (for percentage calculation)"
  type        = number
  default     = 87 # db.t3.micro default
}

variable "rds_allocated_storage_gb" {
  description = "RDS allocated storage in GB (for percentage calculation)"
  type        = number
  default     = 20
}

#------------------------------------------------------------------------------
# ElastiCache Configuration
#------------------------------------------------------------------------------
variable "elasticache_cluster_id" {
  description = "ElastiCache replication group ID"
  type        = string
}

#------------------------------------------------------------------------------
# Application URLs
#------------------------------------------------------------------------------
variable "app_url" {
  description = "Application URL (e.g., https://staging.celebration-time.com)"
  type        = string
}

variable "health_check_path" {
  description = "Health check endpoint path"
  type        = string
  default     = "/health"
}

#------------------------------------------------------------------------------
# X-Ray Configuration
#------------------------------------------------------------------------------
variable "xray_sampling_rate" {
  description = "X-Ray sampling rate (0.0 to 1.0). Use 1.0 for staging, 0.05 for production"
  type        = number
  default     = 1.0
}

variable "enable_xray" {
  description = "Enable X-Ray sampling rules"
  type        = bool
  default     = true
}

#------------------------------------------------------------------------------
# Synthetics Configuration
#------------------------------------------------------------------------------
variable "enable_synthetics" {
  description = "Enable Synthetics canaries (incurs additional costs ~$0.0012 per run)"
  type        = bool
  default     = true
}

variable "synthetics_rate_minutes" {
  description = "How often to run canaries (in minutes)"
  type        = number
  default     = 5
}

#------------------------------------------------------------------------------
# Alarm Thresholds (configurable per environment)
#------------------------------------------------------------------------------
variable "alarm_thresholds" {
  description = "Alarm threshold configuration"
  type = object({
    ecs_cpu_percent            = number
    ecs_memory_percent         = number
    alb_5xx_count              = number
    alb_unhealthy_hosts        = number
    alb_latency_p95_seconds    = number
    rds_cpu_percent            = number
    rds_connections_percent    = number
    rds_free_storage_gb        = number
    rds_freeable_memory_mb     = number
    rds_read_latency_seconds   = number
    elasticache_cpu_percent    = number
    elasticache_memory_percent = number
    elasticache_evictions      = number
  })
  default = {
    ecs_cpu_percent            = 80
    ecs_memory_percent         = 85
    alb_5xx_count              = 10
    alb_unhealthy_hosts        = 0
    alb_latency_p95_seconds    = 2
    rds_cpu_percent            = 80
    rds_connections_percent    = 80
    rds_free_storage_gb        = 4
    rds_freeable_memory_mb     = 100
    rds_read_latency_seconds   = 0.02
    elasticache_cpu_percent    = 75
    elasticache_memory_percent = 80
    elasticache_evictions      = 100
  }
}
