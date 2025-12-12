# ECS Module - Services
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 3 - Application Layer
#
# Creates ECS services for:
# - Frontend (with ALB)
# - Backend (with ALB)
# - Celery Worker (no ALB)
# - Celery Beat (no ALB, singleton)

#------------------------------------------------------------------------------
# Frontend Service
#------------------------------------------------------------------------------
resource "aws_ecs_service" "frontend" {
  name            = "${var.project_name}-${var.environment}-frontend"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.frontend.arn
  desired_count   = var.frontend_desired_count
  launch_type     = "FARGATE"

  # Deployment settings
  deployment_maximum_percent         = 200
  deployment_minimum_healthy_percent = 100

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.ecs_security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = var.frontend_target_group_arn
    container_name   = "frontend"
    container_port   = 3000
  }

  # Enable deployment circuit breaker
  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  # Wait for target group to be healthy
  health_check_grace_period_seconds = 60

  tags = {
    Name        = "${var.project_name}-${var.environment}-frontend-service"
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }

  lifecycle {
    ignore_changes = [desired_count] # Allow auto-scaling to manage
  }
}

#------------------------------------------------------------------------------
# Backend Service
#------------------------------------------------------------------------------
resource "aws_ecs_service" "backend" {
  name            = "${var.project_name}-${var.environment}-backend"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = var.backend_desired_count
  launch_type     = "FARGATE"

  # Deployment settings
  deployment_maximum_percent         = 200
  deployment_minimum_healthy_percent = 100

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.ecs_security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = var.backend_target_group_arn
    container_name   = "backend"
    container_port   = 8000
  }

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  health_check_grace_period_seconds = 60

  tags = {
    Name        = "${var.project_name}-${var.environment}-backend-service"
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }

  lifecycle {
    ignore_changes = [desired_count]
  }
}

#------------------------------------------------------------------------------
# Celery Worker Service
#------------------------------------------------------------------------------
resource "aws_ecs_service" "celery_worker" {
  name            = "${var.project_name}-${var.environment}-celery-worker"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.celery_worker.arn
  desired_count   = var.celery_worker_desired_count
  launch_type     = "FARGATE"

  # Deployment settings
  deployment_maximum_percent         = 200
  deployment_minimum_healthy_percent = 100

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.ecs_security_group_id]
    assign_public_ip = false
  }

  # No load balancer - internal service only

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-celery-worker-service"
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }

  lifecycle {
    ignore_changes = [desired_count]
  }
}

#------------------------------------------------------------------------------
# Celery Beat Service (Singleton - exactly 1 task)
#------------------------------------------------------------------------------
resource "aws_ecs_service" "celery_beat" {
  name            = "${var.project_name}-${var.environment}-celery-beat"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.celery_beat.arn
  desired_count   = 1 # Always exactly 1 (singleton scheduler)
  launch_type     = "FARGATE"

  # Deployment settings - singleton pattern
  deployment_maximum_percent         = 100 # No more than 1 at a time
  deployment_minimum_healthy_percent = 0   # Allow 0 during deploy to prevent duplicates

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.ecs_security_group_id]
    assign_public_ip = false
  }

  # No load balancer - internal service only

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-celery-beat-service"
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }

  # Never change desired_count - must stay at 1
}
