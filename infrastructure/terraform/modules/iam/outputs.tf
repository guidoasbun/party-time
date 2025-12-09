# IAM Module Outputs
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 1 - Foundation
#------------------------------------------------------------------------------
# ECS Task Execution Role
#------------------------------------------------------------------------------
output "ecs_task_execution_role_arn" {
  description = "ECS task execution role ARN"
  value       = aws_iam_role.ecs_task_execution.arn
}

output "ecs_task_execution_role_name" {
  description = "ECS task execution role name"
  value       = aws_iam_role.ecs_task_execution.name
}

#------------------------------------------------------------------------------
# ECS Task Role
#------------------------------------------------------------------------------
output "ecs_task_role_arn" {
  description = "ECS task role ARN"
  value       = aws_iam_role.ecs_task.arn
}

output "ecs_task_role_name" {
  description = "ECS task role name"
  value       = aws_iam_role.ecs_task.name
}

#------------------------------------------------------------------------------
# GitHub Actions
#------------------------------------------------------------------------------
output "github_actions_role_arn" {
  description = "GitHub Actions OIDC role ARN"
  value       = aws_iam_role.github_actions.arn
}

output "github_actions_role_name" {
  description = "GitHub Actions OIDC role name"
  value       = aws_iam_role.github_actions.name
}

output "github_oidc_provider_arn" {
  description = "GitHub OIDC provider ARN"
  value       = aws_iam_openid_connect_provider.github.arn
}
