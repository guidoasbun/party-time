# Security Module - WAF v2 Web ACL
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 5 - Security
#
# Creates:
# - WAF v2 Web ACL for CloudFront (CLOUDFRONT scope)
# - AWS Managed Rule Groups (OWASP protection)
# - Custom rate limiting rule

#------------------------------------------------------------------------------
# WAF v2 Web ACL
# Attached to CloudFront distribution for edge protection
# Note: WAF for CloudFront must be created in us-east-1
#------------------------------------------------------------------------------
resource "aws_wafv2_web_acl" "main" {
  name        = "${var.project_name}-${var.environment}-waf"
  description = "WAF Web ACL for ${var.project_name} ${var.environment}"
  scope       = "CLOUDFRONT"

  default_action {
    allow {}
  }

  #----------------------------------------------------------------------------
  # Rule 1: AWS Managed Rules - Common Rule Set (OWASP Core)
  # Protects against OWASP Top 10 vulnerabilities
  #----------------------------------------------------------------------------
  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 1

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"

        # Exclude rules that may cause false positives for API traffic
        rule_action_override {
          action_to_use {
            count {}
          }
          name = "SizeRestrictions_BODY"
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.project_name}-${var.environment}-common-rules"
      sampled_requests_enabled   = true
    }
  }

  #----------------------------------------------------------------------------
  # Rule 2: AWS Managed Rules - Known Bad Inputs
  # Blocks requests with known malicious patterns
  #----------------------------------------------------------------------------
  rule {
    name     = "AWSManagedRulesKnownBadInputsRuleSet"
    priority = 2

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.project_name}-${var.environment}-bad-inputs"
      sampled_requests_enabled   = true
    }
  }

  #----------------------------------------------------------------------------
  # Rule 3: AWS Managed Rules - SQL Injection
  # Protects against SQL injection attacks
  #----------------------------------------------------------------------------
  rule {
    name     = "AWSManagedRulesSQLiRuleSet"
    priority = 3

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesSQLiRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.project_name}-${var.environment}-sqli"
      sampled_requests_enabled   = true
    }
  }

  #----------------------------------------------------------------------------
  # Rule 4: Rate Limiting
  # Limits requests to 2000 per 5 minutes per IP address
  #----------------------------------------------------------------------------
  rule {
    name     = "RateLimitRule"
    priority = 4

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = var.rate_limit
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.project_name}-${var.environment}-rate-limit"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${var.project_name}-${var.environment}-waf"
    sampled_requests_enabled   = true
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-waf"
    Project     = var.project_name
    Environment = var.environment
    Service     = "security"
    ManagedBy   = "terraform"
  }
}

#------------------------------------------------------------------------------
# WAF Logging Configuration (Optional - to CloudWatch)
#------------------------------------------------------------------------------
resource "aws_cloudwatch_log_group" "waf" {
  count             = var.enable_waf_logging ? 1 : 0
  name              = "aws-waf-logs-${var.project_name}-${var.environment}"
  retention_in_days = var.waf_log_retention_days

  tags = {
    Name        = "${var.project_name}-${var.environment}-waf-logs"
    Project     = var.project_name
    Environment = var.environment
    Service     = "security"
    ManagedBy   = "terraform"
  }
}

resource "aws_wafv2_web_acl_logging_configuration" "main" {
  count                   = var.enable_waf_logging ? 1 : 0
  log_destination_configs = [aws_cloudwatch_log_group.waf[0].arn]
  resource_arn            = aws_wafv2_web_acl.main.arn

  # Only log blocked requests to reduce costs
  logging_filter {
    default_behavior = "DROP"

    filter {
      behavior = "KEEP"

      condition {
        action_condition {
          action = "BLOCK"
        }
      }

      requirement = "MEETS_ANY"
    }
  }
}
