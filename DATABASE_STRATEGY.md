# Database Architecture Strategy: Development vs Production

## Overview

The Party-Time project uses a **two-tier database strategy** to optimize development efficiency while ensuring production reliability.

## Development Environment (Weeks 1-10)

### PostgreSQL Docker Container
- **Image**: `postgres:16-alpine`
- **Container Name**: `party-time-db`
- **Access**: `localhost:5432`
- **Credentials**: `party_admin` / `party_secure_2024`
- **Database**: `party_time`

### Benefits of Docker for Development:
✅ **Zero AWS costs** during development  
✅ **Instant setup** - one command to start  
✅ **Consistent environment** across team members  
✅ **Safe to reset** - no production data at risk  
✅ **Fast iteration** - immediate schema changes  
✅ **Offline development** - works without internet  

### Development Data:
```sql
-- Sample data for testing:
3 users (admin, planner, guest)
3 events (wedding, corporate, birthday)
8 guests with various RSVP statuses  
Multiple budget categories and expenses
Vendor relationships
```

## Production Environment (Week 11+)

### AWS RDS PostgreSQL
- **Service**: AWS RDS (Relational Database Service)
- **Version**: PostgreSQL 16 (same as development)
- **Instance Class**: `db.t3.micro` (initial) → scalable
- **Storage**: 20GB GP2 SSD (initial) → auto-scaling available

### Production Features:
✅ **Automated backups** (7-day retention minimum)  
✅ **High availability** with Multi-AZ deployment option  
✅ **Automatic security patches** managed by AWS  
✅ **VPC isolation** with security groups  
✅ **SSL/TLS encryption** in transit and at rest  
✅ **Connection pooling** with RDS Proxy (if needed)  
✅ **Monitoring** with CloudWatch metrics  

### Estimated Costs:
- **db.t3.micro**: ~$15/month
- **db.t3.small**: ~$30/month  
- **Storage**: ~$2.30/month per 20GB
- **Backup storage**: First 20GB free, then ~$0.095/GB

## Migration Timeline

### Week 1-10: Development Phase
```bash
# Use Docker PostgreSQL
docker-compose up -d postgres

# Develop with local database
DATABASE_URL=postgresql://party_admin:party_secure_2024@localhost:5432/party_time
```

### Week 11: Production Deployment
```bash
# Terraform provisions RDS
terraform apply

# Environment switches to RDS
DATABASE_URL=postgresql://prod_user:secure_password@party-time-prod.xxx.rds.amazonaws.com:5432/party_time

# Schema deployment via Alembic
alembic upgrade head
```

### Post-Production: Dual Environment
```bash
# Local development (continues using Docker)
docker-compose up -d postgres

# Production (AWS RDS)
# Managed via Terraform and CI/CD pipeline
```

## Schema Consistency

Both environments use **identical** PostgreSQL 16 with same:
- Table structures
- ENUM types  
- Constraints and indexes
- Trigger functions
- Extensions (uuid-ossp, pgcrypto)

**Migration tool**: Alembic ensures schema consistency between dev and production.

## Security Considerations

### Development (Relaxed):
- Simple password authentication
- No encryption requirements  
- Local network access only
- Sample data (no real user information)

### Production (Strict):
- AWS Secrets Manager for credentials
- VPC private subnets
- Security group restrictions
- SSL/TLS required
- Audit logging enabled
- GDPR compliance features

## Backup Strategy

### Development:
- **No backups needed** (disposable data)
- Version controlled schema in Git
- Easy to recreate with Docker + SQL scripts

### Production:
- **Automated daily backups** (7-day retention minimum)
- **Point-in-time recovery** available
- **Cross-region backup** replication for disaster recovery
- **Schema versioning** through Alembic migrations

## Performance Optimization

### Development:
- Basic indexing for common queries
- No performance tuning needed (small dataset)

### Production:
- **Connection pooling** (RDS Proxy if high traffic)
- **Read replicas** for reporting/analytics
- **Performance Insights** monitoring
- **Query optimization** based on real usage patterns

## Why This Strategy Works

1. **Cost-Effective**: No AWS charges during 10 weeks of development
2. **Risk-Free**: Development mistakes can't impact production  
3. **Fast Development**: No network latency, instant database resets
4. **Production-Ready**: Same PostgreSQL version ensures compatibility
5. **Scalable**: RDS can grow with application needs
6. **Professional**: Industry standard practice for staging/production separation

This approach follows **infrastructure best practices** while optimizing for your 13-week development timeline and budget constraints.