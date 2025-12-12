# CloudFront Module - CDN Distribution
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 4 - DNS & CDN
#
# Creates:
# - CloudFront Distribution with ALB origin
# - Response Headers Policy for security headers
# - Cache behaviors for static/dynamic content

#------------------------------------------------------------------------------
# Security Headers Policy
# Adds HSTS, CSP, X-Frame-Options, etc. without Lambda@Edge
#------------------------------------------------------------------------------
resource "aws_cloudfront_response_headers_policy" "security_headers" {
  name    = "${var.project_name}-${var.environment}-security-headers"
  comment = "Security headers for ${var.project_name} ${var.environment}"

  # Strict-Transport-Security (HSTS)
  security_headers_config {
    strict_transport_security {
      access_control_max_age_sec = 31536000 # 1 year
      include_subdomains         = true
      preload                    = true
      override                   = true
    }

    # X-Content-Type-Options
    content_type_options {
      override = true
    }

    # X-Frame-Options
    frame_options {
      frame_option = "DENY"
      override     = true
    }

    # X-XSS-Protection (legacy but still useful)
    xss_protection {
      mode_block = true
      protection = true
      override   = true
    }

    # Referrer-Policy
    referrer_policy {
      referrer_policy = "strict-origin-when-cross-origin"
      override        = true
    }

    # Content-Security-Policy
    content_security_policy {
      content_security_policy = join("; ", [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.googleapis.com *.gstatic.com",
        "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
        "img-src 'self' data: https: maps.googleapis.com maps.gstatic.com *.googleusercontent.com",
        "connect-src 'self' *.googleapis.com *.amazoncognito.com cognito-idp.${var.aws_region}.amazonaws.com",
        "font-src 'self' fonts.gstatic.com",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'"
      ])
      override = true
    }
  }

  # Custom headers
  custom_headers_config {
    items {
      header   = "Permissions-Policy"
      value    = "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()"
      override = true
    }
  }
}

#------------------------------------------------------------------------------
# Cache Policy for API (No Caching)
# Used for /api/*, /health, /docs, /openapi.json
# Note: When caching is disabled, headers must be "none"
#------------------------------------------------------------------------------
resource "aws_cloudfront_cache_policy" "api_no_cache" {
  name        = "${var.project_name}-${var.environment}-api-no-cache"
  comment     = "No caching for API requests"
  default_ttl = 0
  max_ttl     = 0
  min_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }
    headers_config {
      header_behavior = "none"
    }
    query_strings_config {
      query_string_behavior = "none"
    }
  }
}

#------------------------------------------------------------------------------
# Cache Policy for Next.js Dynamic Routes
# Includes RSC header in cache key to prevent HTML/RSC payload mismatch
# Short TTL to allow caching but ensure fresh content
#------------------------------------------------------------------------------
resource "aws_cloudfront_cache_policy" "nextjs_dynamic" {
  name        = "${var.project_name}-${var.environment}-nextjs-dynamic"
  comment     = "Cache policy for Next.js dynamic routes - includes RSC header"
  default_ttl = 1      # 1 second default
  max_ttl     = 60     # 1 minute max
  min_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }
    headers_config {
      header_behavior = "whitelist"
      headers {
        items = ["RSC", "Next-Router-Prefetch", "Next-Router-State-Tree"]
      }
    }
    query_strings_config {
      query_string_behavior = "all"
    }
  }
}

#------------------------------------------------------------------------------
# Origin Request Policy for API
# Forwards all necessary headers/cookies to origin
#------------------------------------------------------------------------------
resource "aws_cloudfront_origin_request_policy" "api_all_viewer" {
  name    = "${var.project_name}-${var.environment}-api-all-viewer"
  comment = "Forward all viewer headers to API origin"

  cookies_config {
    cookie_behavior = "all"
  }
  headers_config {
    header_behavior = "allViewerAndWhitelistCloudFront"
    headers {
      items = ["CloudFront-Forwarded-Proto"]
    }
  }
  query_strings_config {
    query_string_behavior = "all"
  }
}

#------------------------------------------------------------------------------
# CloudFront Distribution
#------------------------------------------------------------------------------
resource "aws_cloudfront_distribution" "main" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${var.project_name}-${var.environment} CDN"
  default_root_object = ""
  http_version        = "http2and3"
  price_class         = "PriceClass_100" # US, Canada, Europe (cost-optimized)

  # WAF Web ACL attachment (Phase 5 - Security)
  web_acl_id = var.waf_web_acl_arn

  # Custom domain aliases
  aliases = var.domain_aliases

  # SSL Certificate
  viewer_certificate {
    acm_certificate_arn      = var.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  # ALB Origin
  # Note: Using HTTP to origin because ALB certificate is for celebration-time.com,
  # not for the ALB DNS name. CloudFront terminates TLS at the edge.
  # Traffic between CloudFront and ALB is over AWS internal network.
  origin {
    domain_name = var.alb_dns_name
    origin_id   = "alb-origin"

    custom_origin_config {
      http_port                = 80
      https_port               = 443
      origin_protocol_policy   = "http-only"
      origin_ssl_protocols     = ["TLSv1.2"]
      origin_keepalive_timeout = 60
      origin_read_timeout      = 60
    }

    # Custom header for origin verification (ALB can check this)
    custom_header {
      name  = "X-Origin-Verify"
      value = var.origin_shield_header
    }
  }

  # Default behavior (Frontend - Next.js dynamic routes)
  # Uses custom policy that includes RSC header to prevent HTML/RSC payload mismatch
  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "alb-origin"

    # Use custom policy that includes RSC header for Next.js App Router compatibility
    cache_policy_id          = aws_cloudfront_cache_policy.nextjs_dynamic.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.all_viewer_except_host.id

    # Security headers
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security_headers.id

    viewer_protocol_policy = "redirect-to-https"
    compress               = true
  }

  # API behavior (No caching)
  ordered_cache_behavior {
    path_pattern     = "/api/*"
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "alb-origin"

    cache_policy_id          = aws_cloudfront_cache_policy.api_no_cache.id
    origin_request_policy_id = aws_cloudfront_origin_request_policy.api_all_viewer.id

    response_headers_policy_id = aws_cloudfront_response_headers_policy.security_headers.id

    viewer_protocol_policy = "redirect-to-https"
    compress               = true
  }

  # Health endpoint (No caching)
  ordered_cache_behavior {
    path_pattern     = "/health"
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "alb-origin"

    cache_policy_id          = aws_cloudfront_cache_policy.api_no_cache.id
    origin_request_policy_id = aws_cloudfront_origin_request_policy.api_all_viewer.id

    response_headers_policy_id = aws_cloudfront_response_headers_policy.security_headers.id

    viewer_protocol_policy = "redirect-to-https"
    compress               = true
  }

  # API docs (No caching)
  ordered_cache_behavior {
    path_pattern     = "/docs"
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "alb-origin"

    cache_policy_id          = aws_cloudfront_cache_policy.api_no_cache.id
    origin_request_policy_id = aws_cloudfront_origin_request_policy.api_all_viewer.id

    response_headers_policy_id = aws_cloudfront_response_headers_policy.security_headers.id

    viewer_protocol_policy = "redirect-to-https"
    compress               = true
  }

  # OpenAPI spec (No caching)
  ordered_cache_behavior {
    path_pattern     = "/openapi.json"
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "alb-origin"

    cache_policy_id          = aws_cloudfront_cache_policy.api_no_cache.id
    origin_request_policy_id = aws_cloudfront_origin_request_policy.api_all_viewer.id

    response_headers_policy_id = aws_cloudfront_response_headers_policy.security_headers.id

    viewer_protocol_policy = "redirect-to-https"
    compress               = true
  }

  # ReDoc (No caching)
  ordered_cache_behavior {
    path_pattern     = "/redoc"
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "alb-origin"

    cache_policy_id          = aws_cloudfront_cache_policy.api_no_cache.id
    origin_request_policy_id = aws_cloudfront_origin_request_policy.api_all_viewer.id

    response_headers_policy_id = aws_cloudfront_response_headers_policy.security_headers.id

    viewer_protocol_policy = "redirect-to-https"
    compress               = true
  }

  # Next.js static assets (Long cache)
  ordered_cache_behavior {
    path_pattern     = "/_next/static/*"
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "alb-origin"

    cache_policy_id          = data.aws_cloudfront_cache_policy.caching_optimized.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.all_viewer_except_host.id

    response_headers_policy_id = aws_cloudfront_response_headers_policy.security_headers.id

    viewer_protocol_policy = "redirect-to-https"
    compress               = true
  }

  # No geo restrictions
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-cdn"
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

#------------------------------------------------------------------------------
# Data Sources - AWS Managed Cache Policies
#------------------------------------------------------------------------------
data "aws_cloudfront_cache_policy" "caching_optimized" {
  name = "Managed-CachingOptimized"
}

data "aws_cloudfront_origin_request_policy" "all_viewer_except_host" {
  name = "Managed-AllViewerExceptHostHeader"
}
