# IAM Module - Data Sources
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 1 - Foundation
# Current AWS Account ID
data "aws_caller_identity" "current" {}

# Current AWS Region
data "aws_region" "current" {}
