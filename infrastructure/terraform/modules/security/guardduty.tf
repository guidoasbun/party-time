# Security Module - GuardDuty
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 5 - Security
#
# Creates:
# - GuardDuty detector for threat detection

#------------------------------------------------------------------------------
# GuardDuty Detector
# Continuous threat detection for AWS accounts
#------------------------------------------------------------------------------
resource "aws_guardduty_detector" "main" {
  enable = true

  # Enable S3 protection for data event analysis
  datasources {
    s3_logs {
      enable = true
    }

    kubernetes {
      audit_logs {
        enable = false # Not using EKS
      }
    }

    malware_protection {
      scan_ec2_instance_with_findings {
        ebs_volumes {
          enable = false # Using Fargate, not EC2
        }
      }
    }
  }

  # Finding publishing frequency (staging: 6 hours, production: 15 minutes)
  finding_publishing_frequency = var.guardduty_finding_frequency

  tags = {
    Name        = "${var.project_name}-${var.environment}-guardduty"
    Project     = var.project_name
    Environment = var.environment
    Service     = "security"
    ManagedBy   = "terraform"
  }
}
