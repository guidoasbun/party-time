# ACM Module - SSL/TLS Certificate
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 4 - DNS & CDN
#
# Creates:
# - ACM Certificate for domain + wildcard
# - DNS validation records in Route53
# - Certificate validation waiter

#------------------------------------------------------------------------------
# ACM Certificate
# Request a certificate for the apex domain and wildcard
#------------------------------------------------------------------------------
resource "aws_acm_certificate" "main" {
  domain_name       = var.domain_name
  validation_method = "DNS"

  # Include wildcard and staging subdomain
  subject_alternative_names = [
    "*.${var.domain_name}"
  ]

  # Ensure new certificate is created before destroying old one
  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-cert"
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

#------------------------------------------------------------------------------
# DNS Validation Records
# Create CNAME records in Route53 for certificate validation
#------------------------------------------------------------------------------
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.main.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = var.zone_id
}

#------------------------------------------------------------------------------
# Certificate Validation
# Wait for DNS validation to complete
#------------------------------------------------------------------------------
resource "aws_acm_certificate_validation" "main" {
  certificate_arn         = aws_acm_certificate.main.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]

  timeouts {
    create = "10m"
  }
}
