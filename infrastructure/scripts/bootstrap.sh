#!/bin/bash
#
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 1 - Foundation
# Bootstrap script for Party-Time Terraform state management
# Creates S3 bucket and DynamoDB table for remote state storage
#
# Usage: ./bootstrap.sh
#
set -e

# Configuration
AWS_REGION="us-east-1"
PROJECT_NAME="party-time"

# Get AWS Account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
if [ -z "$ACCOUNT_ID" ]; then
    echo "Error: Could not retrieve AWS Account ID. Ensure AWS CLI is configured."
    exit 1
fi

# Resource names
STATE_BUCKET="${PROJECT_NAME}-terraform-state-${ACCOUNT_ID}"
DYNAMODB_TABLE="${PROJECT_NAME}-terraform-locks"

echo "============================================"
echo "Party-Time Terraform Bootstrap"
echo "============================================"
echo "AWS Account ID: ${ACCOUNT_ID}"
echo "AWS Region: ${AWS_REGION}"
echo "S3 Bucket: ${STATE_BUCKET}"
echo "DynamoDB Table: ${DYNAMODB_TABLE}"
echo "============================================"
echo ""

# Check if S3 bucket already exists
if aws s3api head-bucket --bucket "${STATE_BUCKET}" 2>/dev/null; then
    echo "S3 bucket '${STATE_BUCKET}' already exists. Skipping creation."
else
    echo "Creating S3 bucket for Terraform state: ${STATE_BUCKET}"

    # Create bucket (us-east-1 doesn't need LocationConstraint)
    if [ "$AWS_REGION" = "us-east-1" ]; then
        aws s3api create-bucket \
            --bucket "${STATE_BUCKET}" \
            --region "${AWS_REGION}"
    else
        aws s3api create-bucket \
            --bucket "${STATE_BUCKET}" \
            --region "${AWS_REGION}" \
            --create-bucket-configuration LocationConstraint="${AWS_REGION}"
    fi

    # Enable versioning
    echo "Enabling versioning on S3 bucket..."
    aws s3api put-bucket-versioning \
        --bucket "${STATE_BUCKET}" \
        --versioning-configuration Status=Enabled

    # Enable encryption
    echo "Enabling encryption on S3 bucket..."
    aws s3api put-bucket-encryption \
        --bucket "${STATE_BUCKET}" \
        --server-side-encryption-configuration '{
            "Rules": [{
                "ApplyServerSideEncryptionByDefault": {
                    "SSEAlgorithm": "AES256"
                },
                "BucketKeyEnabled": true
            }]
        }'

    # Block public access
    echo "Blocking public access on S3 bucket..."
    aws s3api put-public-access-block \
        --bucket "${STATE_BUCKET}" \
        --public-access-block-configuration \
            "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

    echo "S3 bucket created successfully."
fi

echo ""

# Check if DynamoDB table already exists
if aws dynamodb describe-table --table-name "${DYNAMODB_TABLE}" --region "${AWS_REGION}" 2>/dev/null; then
    echo "DynamoDB table '${DYNAMODB_TABLE}' already exists. Skipping creation."
else
    echo "Creating DynamoDB table for state locking: ${DYNAMODB_TABLE}"
    aws dynamodb create-table \
        --table-name "${DYNAMODB_TABLE}" \
        --attribute-definitions AttributeName=LockID,AttributeType=S \
        --key-schema AttributeName=LockID,KeyType=HASH \
        --billing-mode PAY_PER_REQUEST \
        --region "${AWS_REGION}" \
        --tags Key=Project,Value="${PROJECT_NAME}" Key=ManagedBy,Value=terraform

    echo "Waiting for DynamoDB table to be active..."
    aws dynamodb wait table-exists --table-name "${DYNAMODB_TABLE}" --region "${AWS_REGION}"
    echo "DynamoDB table created successfully."
fi

echo ""
echo "============================================"
echo "Bootstrap Complete!"
echo "============================================"
echo ""
echo "Add the following to your backend.tf:"
echo ""
echo "terraform {"
echo "  backend \"s3\" {"
echo "    bucket         = \"${STATE_BUCKET}\""
echo "    key            = \"staging/terraform.tfstate\""
echo "    region         = \"${AWS_REGION}\""
echo "    dynamodb_table = \"${DYNAMODB_TABLE}\""
echo "    encrypt        = true"
echo "  }"
echo "}"
echo ""
echo "============================================"
