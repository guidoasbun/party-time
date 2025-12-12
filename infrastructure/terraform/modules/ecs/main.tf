# ECS Module - Fargate Cluster and CloudWatch Log Groups
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 3 - Application Layer
#
# Creates:
# - ECS Cluster with Container Insights
# - CloudWatch Log Groups for all services

#------------------------------------------------------------------------------
# ECS Cluster
#------------------------------------------------------------------------------
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-${var.environment}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-cluster"
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

#------------------------------------------------------------------------------
# ECS Cluster Capacity Providers (Fargate)
#------------------------------------------------------------------------------
resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name = aws_ecs_cluster.main.name

  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    base              = 1
    weight            = 100
    capacity_provider = "FARGATE"
  }
}

#------------------------------------------------------------------------------
# CloudWatch Log Groups
#------------------------------------------------------------------------------
resource "aws_cloudwatch_log_group" "frontend" {
  name              = "/ecs/${var.project_name}/${var.environment}/frontend"
  retention_in_days = var.log_retention_days

  tags = {
    Name        = "${var.project_name}-${var.environment}-frontend-logs"
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/${var.project_name}/${var.environment}/backend"
  retention_in_days = var.log_retention_days

  tags = {
    Name        = "${var.project_name}-${var.environment}-backend-logs"
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_cloudwatch_log_group" "celery_worker" {
  name              = "/ecs/${var.project_name}/${var.environment}/celery-worker"
  retention_in_days = var.log_retention_days

  tags = {
    Name        = "${var.project_name}-${var.environment}-celery-worker-logs"
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_cloudwatch_log_group" "celery_beat" {
  name              = "/ecs/${var.project_name}/${var.environment}/celery-beat"
  retention_in_days = var.log_retention_days

  tags = {
    Name        = "${var.project_name}-${var.environment}-celery-beat-logs"
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
