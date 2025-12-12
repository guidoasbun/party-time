#!/bin/bash
# infrastructure/scripts/rollback.sh
# Rollback ECS service to previous task definition
#
# Usage: ./rollback.sh <cluster> <service> [revision]
# Example: ./rollback.sh party-time-staging-cluster party-time-staging-frontend
# Example: ./rollback.sh party-time-staging-cluster party-time-staging-frontend 5

set -e

CLUSTER=$1
SERVICE=$2
REVISION=${3:-""}  # Optional: specific revision

if [ -z "$CLUSTER" ] || [ -z "$SERVICE" ]; then
    echo "Usage: $0 <cluster> <service> [revision]"
    echo "Example: $0 party-time-staging-cluster party-time-staging-frontend"
    echo "Example: $0 party-time-staging-cluster party-time-staging-frontend 5"
    exit 1
fi

# Validate AWS_REGION is set
if [ -z "$AWS_REGION" ]; then
    echo "Error: AWS_REGION environment variable is not set"
    exit 1
fi

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query 'Account' --output text)

echo "Rollback initiated for service: $SERVICE"
echo "Cluster: $CLUSTER"
echo ""

# Get current task definition
CURRENT_TD=$(aws ecs describe-services \
    --cluster "$CLUSTER" \
    --services "$SERVICE" \
    --query 'services[0].taskDefinition' \
    --output text)

echo "Current task definition: $CURRENT_TD"

# Extract family and current revision
FAMILY=$(echo "$CURRENT_TD" | sed 's/.*task-definition\///' | cut -d':' -f1)
CURRENT_REV=$(echo "$CURRENT_TD" | rev | cut -d':' -f1 | rev)

echo "Task family: $FAMILY"
echo "Current revision: $CURRENT_REV"

# Determine target revision
if [ -z "$REVISION" ]; then
    REVISION=$((CURRENT_REV - 1))
    echo "Rolling back to previous revision: $REVISION"
else
    echo "Rolling back to specified revision: $REVISION"
fi

# Validate target revision exists
TARGET_TD="arn:aws:ecs:${AWS_REGION}:${AWS_ACCOUNT_ID}:task-definition/${FAMILY}:${REVISION}"

echo ""
echo "Target task definition: $TARGET_TD"

# Check if target revision exists
aws ecs describe-task-definition \
    --task-definition "${FAMILY}:${REVISION}" \
    --query 'taskDefinition.taskDefinitionArn' \
    --output text > /dev/null 2>&1 || {
    echo "Error: Task definition revision $REVISION does not exist"
    exit 1
}

echo ""
echo "Updating service to use revision $REVISION..."

aws ecs update-service \
    --cluster "$CLUSTER" \
    --service "$SERVICE" \
    --task-definition "$TARGET_TD" \
    --query 'service.serviceName' \
    --output text

echo ""
echo "Waiting for service to stabilize..."

aws ecs wait services-stable \
    --cluster "$CLUSTER" \
    --services "$SERVICE"

echo ""
echo "Rollback complete!"
echo "Service $SERVICE is now running revision $REVISION"
