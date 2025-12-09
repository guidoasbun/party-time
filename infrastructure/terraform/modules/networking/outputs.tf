# Networking Module Outputs

#------------------------------------------------------------------------------
# VPC Outputs
#------------------------------------------------------------------------------
output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "vpc_cidr" {
  description = "VPC CIDR block"
  value       = aws_vpc.main.cidr_block
}

#------------------------------------------------------------------------------
# Subnet Outputs
#------------------------------------------------------------------------------
output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "database_subnet_ids" {
  description = "Database subnet IDs"
  value       = aws_subnet.database[*].id
}

#------------------------------------------------------------------------------
# Subnet Group Outputs
#------------------------------------------------------------------------------
output "db_subnet_group_name" {
  description = "Database subnet group name for RDS"
  value       = aws_db_subnet_group.main.name
}

output "elasticache_subnet_group_name" {
  description = "ElastiCache subnet group name"
  value       = aws_elasticache_subnet_group.main.name
}

#------------------------------------------------------------------------------
# Security Group Outputs
#------------------------------------------------------------------------------
output "alb_security_group_id" {
  description = "ALB security group ID"
  value       = aws_security_group.alb.id
}

output "ecs_security_group_id" {
  description = "ECS tasks security group ID"
  value       = aws_security_group.ecs.id
}

output "rds_security_group_id" {
  description = "RDS security group ID"
  value       = aws_security_group.rds.id
}

output "redis_security_group_id" {
  description = "Redis security group ID"
  value       = aws_security_group.redis.id
}

output "vpc_endpoints_security_group_id" {
  description = "VPC endpoints security group ID"
  value       = aws_security_group.vpc_endpoints.id
}

#------------------------------------------------------------------------------
# Gateway Outputs
#------------------------------------------------------------------------------
output "nat_gateway_ids" {
  description = "NAT Gateway IDs"
  value       = aws_nat_gateway.main[*].id
}

output "internet_gateway_id" {
  description = "Internet Gateway ID"
  value       = aws_internet_gateway.main.id
}

#------------------------------------------------------------------------------
# VPC Endpoint Outputs
#------------------------------------------------------------------------------
output "s3_endpoint_id" {
  description = "S3 VPC endpoint ID"
  value       = aws_vpc_endpoint.s3.id
}

output "ecr_api_endpoint_id" {
  description = "ECR API VPC endpoint ID"
  value       = aws_vpc_endpoint.ecr_api.id
}

output "ecr_dkr_endpoint_id" {
  description = "ECR DKR VPC endpoint ID"
  value       = aws_vpc_endpoint.ecr_dkr.id
}

output "secrets_manager_endpoint_id" {
  description = "Secrets Manager VPC endpoint ID"
  value       = aws_vpc_endpoint.secrets_manager.id
}

output "logs_endpoint_id" {
  description = "CloudWatch Logs VPC endpoint ID"
  value       = aws_vpc_endpoint.logs.id
}
