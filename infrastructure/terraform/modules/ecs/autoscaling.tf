# ECS Module - Auto-Scaling
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 3 - Application Layer
#
# Creates auto-scaling policies for:
# - Frontend (CPU-based)
# - Backend (CPU-based)
# - Celery Worker (CPU-based)
# Note: Celery Beat does NOT get auto-scaling (singleton)

#------------------------------------------------------------------------------
# Auto-Scaling for Frontend
#------------------------------------------------------------------------------
resource "aws_appautoscaling_target" "frontend" {
  max_capacity       = var.frontend_max_count
  min_capacity       = var.frontend_min_count
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.frontend.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "frontend_cpu" {
  name               = "${var.project_name}-${var.environment}-frontend-cpu"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.frontend.resource_id
  scalable_dimension = aws_appautoscaling_target.frontend.scalable_dimension
  service_namespace  = aws_appautoscaling_target.frontend.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = 70.0
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}

#------------------------------------------------------------------------------
# Auto-Scaling for Backend
#------------------------------------------------------------------------------
resource "aws_appautoscaling_target" "backend" {
  max_capacity       = var.backend_max_count
  min_capacity       = var.backend_min_count
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.backend.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "backend_cpu" {
  name               = "${var.project_name}-${var.environment}-backend-cpu"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.backend.resource_id
  scalable_dimension = aws_appautoscaling_target.backend.scalable_dimension
  service_namespace  = aws_appautoscaling_target.backend.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = 70.0
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}

#------------------------------------------------------------------------------
# Auto-Scaling for Celery Worker
#------------------------------------------------------------------------------
resource "aws_appautoscaling_target" "celery_worker" {
  max_capacity       = var.celery_worker_max_count
  min_capacity       = var.celery_worker_min_count
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.celery_worker.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "celery_worker_cpu" {
  name               = "${var.project_name}-${var.environment}-celery-worker-cpu"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.celery_worker.resource_id
  scalable_dimension = aws_appautoscaling_target.celery_worker.scalable_dimension
  service_namespace  = aws_appautoscaling_target.celery_worker.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = 70.0
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}

# Note: Celery Beat does NOT get auto-scaling - it's a singleton scheduler
