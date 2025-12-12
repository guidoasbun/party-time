# ECS Module - Outputs
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 3 - Application Layer

#------------------------------------------------------------------------------
# Cluster Outputs
#------------------------------------------------------------------------------
output "cluster_id" {
  description = "ECS cluster ID"
  value       = aws_ecs_cluster.main.id
}

output "cluster_arn" {
  description = "ECS cluster ARN"
  value       = aws_ecs_cluster.main.arn
}

output "cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

#------------------------------------------------------------------------------
# Service Outputs
#------------------------------------------------------------------------------
output "frontend_service_id" {
  description = "Frontend ECS service ID"
  value       = aws_ecs_service.frontend.id
}

output "frontend_service_name" {
  description = "Frontend ECS service name"
  value       = aws_ecs_service.frontend.name
}

output "backend_service_id" {
  description = "Backend ECS service ID"
  value       = aws_ecs_service.backend.id
}

output "backend_service_name" {
  description = "Backend ECS service name"
  value       = aws_ecs_service.backend.name
}

output "celery_worker_service_id" {
  description = "Celery worker ECS service ID"
  value       = aws_ecs_service.celery_worker.id
}

output "celery_worker_service_name" {
  description = "Celery worker ECS service name"
  value       = aws_ecs_service.celery_worker.name
}

output "celery_beat_service_id" {
  description = "Celery beat ECS service ID"
  value       = aws_ecs_service.celery_beat.id
}

output "celery_beat_service_name" {
  description = "Celery beat ECS service name"
  value       = aws_ecs_service.celery_beat.name
}

#------------------------------------------------------------------------------
# Task Definition Outputs
#------------------------------------------------------------------------------
output "frontend_task_definition_arn" {
  description = "Frontend task definition ARN"
  value       = aws_ecs_task_definition.frontend.arn
}

output "backend_task_definition_arn" {
  description = "Backend task definition ARN"
  value       = aws_ecs_task_definition.backend.arn
}

output "celery_worker_task_definition_arn" {
  description = "Celery worker task definition ARN"
  value       = aws_ecs_task_definition.celery_worker.arn
}

output "celery_beat_task_definition_arn" {
  description = "Celery beat task definition ARN"
  value       = aws_ecs_task_definition.celery_beat.arn
}

#------------------------------------------------------------------------------
# Log Group Outputs
#------------------------------------------------------------------------------
output "frontend_log_group_name" {
  description = "Frontend CloudWatch log group name"
  value       = aws_cloudwatch_log_group.frontend.name
}

output "backend_log_group_name" {
  description = "Backend CloudWatch log group name"
  value       = aws_cloudwatch_log_group.backend.name
}

output "celery_worker_log_group_name" {
  description = "Celery worker CloudWatch log group name"
  value       = aws_cloudwatch_log_group.celery_worker.name
}

output "celery_beat_log_group_name" {
  description = "Celery beat CloudWatch log group name"
  value       = aws_cloudwatch_log_group.celery_beat.name
}
