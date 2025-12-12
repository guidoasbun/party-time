# Route53 Module - Outputs
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 4 - DNS & CDN

output "zone_id" {
  description = "Route53 hosted zone ID"
  value       = data.aws_route53_zone.main.zone_id
}

output "zone_name" {
  description = "Route53 hosted zone name"
  value       = data.aws_route53_zone.main.name
}

output "nameservers" {
  description = "Route53 hosted zone nameservers"
  value       = data.aws_route53_zone.main.name_servers
}

output "fqdn" {
  description = "Fully qualified domain name for the record"
  value       = aws_route53_record.cloudfront_a.fqdn
}

output "record_name" {
  description = "DNS record name"
  value       = aws_route53_record.cloudfront_a.name
}
