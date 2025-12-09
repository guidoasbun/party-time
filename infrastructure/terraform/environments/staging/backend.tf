# Terraform Backend Configuration
# S3 bucket and DynamoDB table must be created by running bootstrap.sh first
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 1 - Foundation
terraform {
  backend "s3" {
    bucket         = "party-time-terraform-state-412381751532"
    key            = "staging/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "party-time-terraform-locks"
    encrypt        = true
  }
}
