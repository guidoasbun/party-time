# ElastiCache Module - Redis Cluster
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 2 - Data Layer

#------------------------------------------------------------------------------
# ElastiCache Parameter Group
# Redis 7 optimized settings
#------------------------------------------------------------------------------
resource "aws_elasticache_parameter_group" "main" {
  family = "redis7"
  name   = "${var.project_name}-${var.environment}-redis7"

  parameter {
    name  = "maxmemory-policy"
    value = "volatile-lru"
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-redis7"
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

#------------------------------------------------------------------------------
# ElastiCache Replication Group (Redis Cluster)
# Single node for staging, replication for production
#------------------------------------------------------------------------------
resource "aws_elasticache_replication_group" "main" {
  replication_group_id = "${var.project_name}-${var.environment}-redis"
  description          = "Redis cluster for ${var.project_name} ${var.environment}"

  # Engine configuration
  engine         = "redis"
  engine_version = "7.1"
  node_type      = var.node_type
  port           = 6379

  # Cluster configuration
  num_cache_clusters = var.num_cache_clusters

  # Network configuration
  subnet_group_name  = var.elasticache_subnet_group_name
  security_group_ids = [var.redis_security_group_id]

  # Parameter group
  parameter_group_name = aws_elasticache_parameter_group.main.name

  # Encryption in transit (TLS)
  transit_encryption_enabled = true

  # Encryption at rest
  at_rest_encryption_enabled = true
  kms_key_id                 = var.kms_key_arn

  # Maintenance
  maintenance_window = "sun:05:00-sun:06:00"

  # Snapshot configuration
  snapshot_retention_limit = var.snapshot_retention_limit
  snapshot_window          = "02:00-03:00"

  # Auto minor version upgrade
  auto_minor_version_upgrade = true

  # Automatic failover (only available with multi-node)
  automatic_failover_enabled = var.num_cache_clusters > 1 ? true : false

  tags = {
    Name        = "${var.project_name}-${var.environment}-redis"
    Project     = var.project_name
    Environment = var.environment
    Service     = "cache"
    ManagedBy   = "terraform"
  }
}
