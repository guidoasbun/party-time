# Secrets Manager Module - Application Secrets
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 2 - Data Layer

#------------------------------------------------------------------------------
# Random Secret Key Generator
#------------------------------------------------------------------------------
resource "random_password" "secret_key" {
  length  = 64
  special = true
}

resource "random_password" "jwt_secret_key" {
  length  = 64
  special = true
}

resource "random_password" "nextauth_secret" {
  length  = 64
  special = true
}

#------------------------------------------------------------------------------
# Database Credentials Secret
#------------------------------------------------------------------------------
resource "aws_secretsmanager_secret" "database" {
  name        = "${var.project_name}/${var.environment}/database"
  description = "Database credentials for ${var.project_name} ${var.environment}"
  kms_key_id  = var.kms_key_arn

  tags = {
    Name        = "${var.project_name}-${var.environment}-database-secret"
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_secretsmanager_secret_version" "database" {
  secret_id = aws_secretsmanager_secret.database.id
  secret_string = jsonencode({
    DATABASE_URL = "postgresql://${var.database_username}:${var.database_password}@${var.database_endpoint}/${var.database_name}"
    DB_HOST      = var.database_host
    DB_PORT      = tostring(var.database_port)
    DB_NAME      = var.database_name
    DB_USER      = var.database_username
    DB_PASSWORD  = var.database_password
  })
}

#------------------------------------------------------------------------------
# Redis/Celery Credentials Secret
#------------------------------------------------------------------------------
resource "aws_secretsmanager_secret" "redis" {
  name        = "${var.project_name}/${var.environment}/redis"
  description = "Redis credentials for ${var.project_name} ${var.environment}"
  kms_key_id  = var.kms_key_arn

  tags = {
    Name        = "${var.project_name}-${var.environment}-redis-secret"
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_secretsmanager_secret_version" "redis" {
  secret_id = aws_secretsmanager_secret.redis.id
  secret_string = jsonencode({
    REDIS_URL             = var.redis_url
    CELERY_BROKER_URL     = var.celery_broker_url
    CELERY_RESULT_BACKEND = var.celery_result_backend_url
  })
}

#------------------------------------------------------------------------------
# Application Secrets (JWT, Secret Keys)
#------------------------------------------------------------------------------
resource "aws_secretsmanager_secret" "app" {
  name        = "${var.project_name}/${var.environment}/app"
  description = "Application secrets for ${var.project_name} ${var.environment}"
  kms_key_id  = var.kms_key_arn

  tags = {
    Name        = "${var.project_name}-${var.environment}-app-secret"
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_secretsmanager_secret_version" "app" {
  secret_id = aws_secretsmanager_secret.app.id
  secret_string = jsonencode({
    SECRET_KEY      = random_password.secret_key.result
    JWT_SECRET_KEY  = random_password.jwt_secret_key.result
    NEXTAUTH_SECRET = random_password.nextauth_secret.result
  })
}

#------------------------------------------------------------------------------
# Cognito Configuration Secret
# Note: These values should be provided as variables from existing Cognito setup
#------------------------------------------------------------------------------
resource "aws_secretsmanager_secret" "cognito" {
  name        = "${var.project_name}/${var.environment}/cognito"
  description = "Cognito configuration for ${var.project_name} ${var.environment}"
  kms_key_id  = var.kms_key_arn

  tags = {
    Name        = "${var.project_name}-${var.environment}-cognito-secret"
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_secretsmanager_secret_version" "cognito" {
  secret_id = aws_secretsmanager_secret.cognito.id
  secret_string = jsonencode({
    COGNITO_USER_POOL_ID  = var.cognito_user_pool_id
    COGNITO_CLIENT_ID     = var.cognito_client_id
    COGNITO_CLIENT_SECRET = var.cognito_client_secret
    COGNITO_REGION        = var.aws_region
    COGNITO_ISSUER        = var.cognito_user_pool_id != "" ? "https://cognito-idp.${var.aws_region}.amazonaws.com/${var.cognito_user_pool_id}" : ""
  })
}

#------------------------------------------------------------------------------
# Third-Party API Keys Secret
#------------------------------------------------------------------------------
resource "aws_secretsmanager_secret" "api_keys" {
  name        = "${var.project_name}/${var.environment}/api-keys"
  description = "Third-party API keys for ${var.project_name} ${var.environment}"
  kms_key_id  = var.kms_key_arn

  tags = {
    Name        = "${var.project_name}-${var.environment}-api-keys-secret"
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_secretsmanager_secret_version" "api_keys" {
  secret_id = aws_secretsmanager_secret.api_keys.id
  secret_string = jsonencode({
    GOOGLE_PLACES_API_KEY = var.google_places_api_key
    GOOGLE_CLIENT_ID      = var.google_client_id
    GOOGLE_CLIENT_SECRET  = var.google_client_secret
    SES_FROM_EMAIL        = var.ses_from_email
  })
}
