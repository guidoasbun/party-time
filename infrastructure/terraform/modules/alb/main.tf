# ALB Module - Application Load Balancer
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 3 - Application Layer
#
# Creates:
# - Application Load Balancer (internet-facing)
# - Target Groups for frontend and backend
# - HTTP Listener with path-based routing

#------------------------------------------------------------------------------
# Application Load Balancer
#------------------------------------------------------------------------------
resource "aws_lb" "main" {
  name               = "${var.project_name}-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.alb_security_group_id]
  subnets            = var.public_subnet_ids

  enable_deletion_protection = var.environment == "production" ? true : false

  # Enable access logs (optional - can be enabled later)
  # access_logs {
  #   bucket  = var.access_logs_bucket
  #   prefix  = "alb"
  #   enabled = true
  # }

  tags = {
    Name        = "${var.project_name}-${var.environment}-alb"
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

#------------------------------------------------------------------------------
# Frontend Target Group (Next.js - port 3000)
#------------------------------------------------------------------------------
resource "aws_lb_target_group" "frontend" {
  name        = "${var.project_name}-${var.environment}-frontend-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip" # Required for Fargate

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    path                = "/"
    matcher             = "200-399"
    protocol            = "HTTP"
  }

  # Deregistration delay - time to wait before removing unhealthy targets
  deregistration_delay = 30

  tags = {
    Name        = "${var.project_name}-${var.environment}-frontend-tg"
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

#------------------------------------------------------------------------------
# Backend Target Group (FastAPI - port 8000)
#------------------------------------------------------------------------------
resource "aws_lb_target_group" "backend" {
  name        = "${var.project_name}-${var.environment}-backend-tg"
  port        = 8000
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip" # Required for Fargate

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    path                = "/health"
    matcher             = "200"
    protocol            = "HTTP"
  }

  # Deregistration delay
  deregistration_delay = 30

  tags = {
    Name        = "${var.project_name}-${var.environment}-backend-tg"
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

#------------------------------------------------------------------------------
# HTTP Listener (port 80)
# For staging: serves traffic directly
# For production: will redirect to HTTPS (configured in Phase 4 with ACM)
#------------------------------------------------------------------------------
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  # Default action: forward to frontend
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-http-listener"
    Project     = var.project_name
    Environment = var.environment
  }
}

#------------------------------------------------------------------------------
# Listener Rule: API Routes -> Backend
# Routes /api/*, /health, /docs, /openapi.json to backend
#------------------------------------------------------------------------------
resource "aws_lb_listener_rule" "api" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }

  condition {
    path_pattern {
      values = ["/api/*", "/health", "/docs", "/openapi.json", "/redoc"]
    }
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-api-rule"
    Project     = var.project_name
    Environment = var.environment
  }
}
