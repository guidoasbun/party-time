# ECS Module - Task Definitions
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 3 - Application Layer
#
# Creates task definitions for:
# - Frontend (Next.js)
# - Backend (FastAPI)
# - Celery Worker
# - Celery Beat (Scheduler)
#
# All tasks use ARM64 architecture for Graviton2 cost savings

#------------------------------------------------------------------------------
# Frontend Task Definition (Next.js)
#------------------------------------------------------------------------------
resource "aws_ecs_task_definition" "frontend" {
  family                   = "${var.project_name}-${var.environment}-frontend"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.frontend_cpu
  memory                   = var.frontend_memory
  execution_role_arn       = var.ecs_task_execution_role_arn
  task_role_arn            = var.ecs_task_role_arn

  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "ARM64"
  }

  container_definitions = jsonencode([
    {
      name      = "frontend"
      image     = "${var.frontend_repository_url}:latest"
      essential = true

      portMappings = [
        {
          containerPort = 3000
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "NEXT_PUBLIC_API_URL"
          value = var.api_url
        },
        {
          name  = "NEXT_PUBLIC_APP_URL"
          value = var.app_url
        },
        {
          name  = "NEXTAUTH_URL"
          value = var.app_url
        }
      ]

      secrets = [
        # NextAuth secret for session encryption
        {
          name      = "NEXTAUTH_SECRET"
          valueFrom = "${var.app_secret_arn}:NEXTAUTH_SECRET::"
        },
        # Cognito OAuth provider
        {
          name      = "COGNITO_CLIENT_ID"
          valueFrom = "${var.cognito_secret_arn}:COGNITO_CLIENT_ID::"
        },
        {
          name      = "COGNITO_CLIENT_SECRET"
          valueFrom = "${var.cognito_secret_arn}:COGNITO_CLIENT_SECRET::"
        },
        {
          name      = "COGNITO_ISSUER"
          valueFrom = "${var.cognito_secret_arn}:COGNITO_ISSUER::"
        },
        # Google OAuth provider
        {
          name      = "GOOGLE_CLIENT_ID"
          valueFrom = "${var.api_keys_secret_arn}:GOOGLE_CLIENT_ID::"
        },
        {
          name      = "GOOGLE_CLIENT_SECRET"
          valueFrom = "${var.api_keys_secret_arn}:GOOGLE_CLIENT_SECRET::"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.frontend.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "frontend"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "wget -q -O /dev/null http://localhost:3000/ || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])

  tags = {
    Name        = "${var.project_name}-${var.environment}-frontend-task"
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

#------------------------------------------------------------------------------
# Backend Task Definition (FastAPI)
#------------------------------------------------------------------------------
resource "aws_ecs_task_definition" "backend" {
  family                   = "${var.project_name}-${var.environment}-backend"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.backend_cpu
  memory                   = var.backend_memory
  execution_role_arn       = var.ecs_task_execution_role_arn
  task_role_arn            = var.ecs_task_role_arn

  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "ARM64"
  }

  container_definitions = jsonencode([
    {
      name      = "backend"
      image     = "${var.backend_repository_url}:latest"
      essential = true

      portMappings = [
        {
          containerPort = 8000
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "ENVIRONMENT"
          value = var.environment
        },
        {
          name  = "AWS_REGION"
          value = var.aws_region
        },
        {
          name  = "FRONTEND_URL"
          value = var.app_url
        },
        {
          name  = "CORS_ORIGINS"
          value = jsonencode([var.app_url, "http://localhost:3000"])
        }
      ]

      secrets = [
        # Database secrets
        {
          name      = "DATABASE_URL"
          valueFrom = "${var.database_secret_arn}:DATABASE_URL::"
        },
        # Redis secrets
        {
          name      = "REDIS_URL"
          valueFrom = "${var.redis_secret_arn}:REDIS_URL::"
        },
        {
          name      = "CELERY_BROKER_URL"
          valueFrom = "${var.redis_secret_arn}:CELERY_BROKER_URL::"
        },
        {
          name      = "CELERY_RESULT_BACKEND"
          valueFrom = "${var.redis_secret_arn}:CELERY_RESULT_BACKEND::"
        },
        # App secrets
        {
          name      = "SECRET_KEY"
          valueFrom = "${var.app_secret_arn}:SECRET_KEY::"
        },
        {
          name      = "JWT_SECRET_KEY"
          valueFrom = "${var.app_secret_arn}:JWT_SECRET_KEY::"
        },
        # Cognito secrets
        {
          name      = "COGNITO_USER_POOL_ID"
          valueFrom = "${var.cognito_secret_arn}:COGNITO_USER_POOL_ID::"
        },
        {
          name      = "COGNITO_CLIENT_ID"
          valueFrom = "${var.cognito_secret_arn}:COGNITO_CLIENT_ID::"
        },
        {
          name      = "COGNITO_CLIENT_SECRET"
          valueFrom = "${var.cognito_secret_arn}:COGNITO_CLIENT_SECRET::"
        },
        # API keys
        {
          name      = "GOOGLE_PLACES_API_KEY"
          valueFrom = "${var.api_keys_secret_arn}:GOOGLE_PLACES_API_KEY::"
        },
        {
          name      = "GOOGLE_CLIENT_ID"
          valueFrom = "${var.api_keys_secret_arn}:GOOGLE_CLIENT_ID::"
        },
        {
          name      = "GOOGLE_CLIENT_SECRET"
          valueFrom = "${var.api_keys_secret_arn}:GOOGLE_CLIENT_SECRET::"
        },
        {
          name      = "SES_FROM_EMAIL"
          valueFrom = "${var.api_keys_secret_arn}:SES_FROM_EMAIL::"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.backend.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "backend"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:8000/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])

  tags = {
    Name        = "${var.project_name}-${var.environment}-backend-task"
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

#------------------------------------------------------------------------------
# Celery Worker Task Definition
#------------------------------------------------------------------------------
resource "aws_ecs_task_definition" "celery_worker" {
  family                   = "${var.project_name}-${var.environment}-celery-worker"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.celery_worker_cpu
  memory                   = var.celery_worker_memory
  execution_role_arn       = var.ecs_task_execution_role_arn
  task_role_arn            = var.ecs_task_role_arn

  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "ARM64"
  }

  container_definitions = jsonencode([
    {
      name      = "celery-worker"
      image     = "${var.backend_repository_url}:latest"
      essential = true

      # Override CMD for Celery worker
      command = ["celery", "-A", "app.core.celery_app:celery_app", "worker", "--loglevel=info", "--queues=emails"]

      environment = [
        {
          name  = "ENVIRONMENT"
          value = var.environment
        },
        {
          name  = "AWS_REGION"
          value = var.aws_region
        },
        {
          name  = "FRONTEND_URL"
          value = var.app_url
        }
      ]

      secrets = [
        # Database secrets (for ORM access)
        {
          name      = "DATABASE_URL"
          valueFrom = "${var.database_secret_arn}:DATABASE_URL::"
        },
        # Redis secrets
        {
          name      = "REDIS_URL"
          valueFrom = "${var.redis_secret_arn}:REDIS_URL::"
        },
        {
          name      = "CELERY_BROKER_URL"
          valueFrom = "${var.redis_secret_arn}:CELERY_BROKER_URL::"
        },
        {
          name      = "CELERY_RESULT_BACKEND"
          valueFrom = "${var.redis_secret_arn}:CELERY_RESULT_BACKEND::"
        },
        # App secrets
        {
          name      = "SECRET_KEY"
          valueFrom = "${var.app_secret_arn}:SECRET_KEY::"
        },
        {
          name      = "JWT_SECRET_KEY"
          valueFrom = "${var.app_secret_arn}:JWT_SECRET_KEY::"
        },
        # SES for email sending
        {
          name      = "SES_FROM_EMAIL"
          valueFrom = "${var.api_keys_secret_arn}:SES_FROM_EMAIL::"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.celery_worker.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "celery-worker"
        }
      }
    }
  ])

  tags = {
    Name        = "${var.project_name}-${var.environment}-celery-worker-task"
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

#------------------------------------------------------------------------------
# Celery Beat Task Definition (Scheduler - Singleton)
#------------------------------------------------------------------------------
resource "aws_ecs_task_definition" "celery_beat" {
  family                   = "${var.project_name}-${var.environment}-celery-beat"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.celery_beat_cpu
  memory                   = var.celery_beat_memory
  execution_role_arn       = var.ecs_task_execution_role_arn
  task_role_arn            = var.ecs_task_role_arn

  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "ARM64"
  }

  container_definitions = jsonencode([
    {
      name      = "celery-beat"
      image     = "${var.backend_repository_url}:latest"
      essential = true

      # Override CMD for Celery beat scheduler
      command = ["celery", "-A", "app.core.celery_app:celery_app", "beat", "--loglevel=info"]

      environment = [
        {
          name  = "ENVIRONMENT"
          value = var.environment
        },
        {
          name  = "AWS_REGION"
          value = var.aws_region
        }
      ]

      secrets = [
        # Redis secrets (for broker)
        {
          name      = "REDIS_URL"
          valueFrom = "${var.redis_secret_arn}:REDIS_URL::"
        },
        {
          name      = "CELERY_BROKER_URL"
          valueFrom = "${var.redis_secret_arn}:CELERY_BROKER_URL::"
        },
        {
          name      = "CELERY_RESULT_BACKEND"
          valueFrom = "${var.redis_secret_arn}:CELERY_RESULT_BACKEND::"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.celery_beat.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "celery-beat"
        }
      }
    }
  ])

  tags = {
    Name        = "${var.project_name}-${var.environment}-celery-beat-task"
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
