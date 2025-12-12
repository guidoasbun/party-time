# ALB Module - Outputs
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 3 - Application Layer
# Updated in Phase 4 to add HTTPS listener output

output "alb_arn" {
  description = "ALB ARN"
  value       = aws_lb.main.arn
}

output "alb_dns_name" {
  description = "ALB DNS name (use this to access the application)"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "ALB Route 53 zone ID (for DNS alias records)"
  value       = aws_lb.main.zone_id
}

output "frontend_target_group_arn" {
  description = "Frontend target group ARN (for ECS service)"
  value       = aws_lb_target_group.frontend.arn
}

output "backend_target_group_arn" {
  description = "Backend target group ARN (for ECS service)"
  value       = aws_lb_target_group.backend.arn
}

output "http_listener_arn" {
  description = "HTTP listener ARN"
  value       = aws_lb_listener.http.arn
}

output "https_listener_arn" {
  description = "HTTPS listener ARN (only available when certificate_arn is provided)"
  value       = length(aws_lb_listener.https) > 0 ? aws_lb_listener.https[0].arn : null
}
