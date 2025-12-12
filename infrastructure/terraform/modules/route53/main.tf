# Route53 Module - DNS Records
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 4 - DNS & CDN
#
# Creates:
# - Data source for existing hosted zone
# - A and AAAA alias records to CloudFront

#------------------------------------------------------------------------------
# Data Source - Existing Hosted Zone
# The domain is already registered in Route53
#------------------------------------------------------------------------------
data "aws_route53_zone" "main" {
  name         = "${var.domain_name}."
  private_zone = false
}

#------------------------------------------------------------------------------
# A Record - IPv4 Alias to CloudFront
#------------------------------------------------------------------------------
resource "aws_route53_record" "cloudfront_a" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.subdomain != "" ? "${var.subdomain}.${var.domain_name}" : var.domain_name
  type    = "A"

  alias {
    name                   = var.cloudfront_domain_name
    zone_id                = var.cloudfront_hosted_zone_id
    evaluate_target_health = false
  }
}

#------------------------------------------------------------------------------
# AAAA Record - IPv6 Alias to CloudFront
#------------------------------------------------------------------------------
resource "aws_route53_record" "cloudfront_aaaa" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.subdomain != "" ? "${var.subdomain}.${var.domain_name}" : var.domain_name
  type    = "AAAA"

  alias {
    name                   = var.cloudfront_domain_name
    zone_id                = var.cloudfront_hosted_zone_id
    evaluate_target_health = false
  }
}
