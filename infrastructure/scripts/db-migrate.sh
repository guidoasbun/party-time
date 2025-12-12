#!/bin/bash
# infrastructure/scripts/db-migrate.sh
# Run Alembic migrations via ECS RunTask
#
# Usage: ./db-migrate.sh <cluster> <task-definition> <subnets> <security-group>
# Example: ./db-migrate.sh party-time-staging-cluster party-time-staging-backend "subnet-xxx,subnet-yyy" "sg-xxx"

set -e

CLUSTER=$1
TASK_DEF=$2
SUBNETS=$3
SECURITY_GROUP=$4

if [ -z "$CLUSTER" ] || [ -z "$TASK_DEF" ] || [ -z "$SUBNETS" ] || [ -z "$SECURITY_GROUP" ]; then
    echo "Usage: $0 <cluster> <task-definition> <subnets> <security-group>"
    echo "Example: $0 party-time-staging-cluster party-time-staging-backend 'subnet-xxx,subnet-yyy' 'sg-xxx'"
    exit 1
fi

echo "Running database migrations..."
echo "Cluster: $CLUSTER"
echo "Task Definition: $TASK_DEF"
echo "Subnets: $SUBNETS"
echo "Security Group: $SECURITY_GROUP"
echo ""

# Run the migration task
TASK_ARN=$(aws ecs run-task \
    --cluster "$CLUSTER" \
    --task-definition "$TASK_DEF" \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[${SUBNETS}],securityGroups=[${SECURITY_GROUP}],assignPublicIp=DISABLED}" \
    --overrides '{
        "containerOverrides": [{
            "name": "backend",
            "command": ["alembic", "upgrade", "head"]
        }]
    }' \
    --query 'tasks[0].taskArn' \
    --output text)

if [ -z "$TASK_ARN" ] || [ "$TASK_ARN" = "None" ]; then
    echo "Error: Failed to start migration task"
    exit 1
fi

echo "Migration task started: $TASK_ARN"
echo ""
echo "Waiting for migration to complete..."

# Wait for the task to stop
aws ecs wait tasks-stopped \
    --cluster "$CLUSTER" \
    --tasks "$TASK_ARN"

echo ""
echo "Task completed. Checking exit code..."

# Get the exit code
EXIT_CODE=$(aws ecs describe-tasks \
    --cluster "$CLUSTER" \
    --tasks "$TASK_ARN" \
    --query 'tasks[0].containers[0].exitCode' \
    --output text)

# Get the stop reason if available
STOP_REASON=$(aws ecs describe-tasks \
    --cluster "$CLUSTER" \
    --tasks "$TASK_ARN" \
    --query 'tasks[0].stoppedReason' \
    --output text)

echo "Exit code: $EXIT_CODE"

if [ "$EXIT_CODE" != "0" ]; then
    echo ""
    echo "Migration FAILED!"
    echo "Stop reason: $STOP_REASON"
    echo ""
    echo "Check CloudWatch logs for details:"
    echo "  Log group: /ecs/party-time/${CLUSTER#party-time-}/backend"
    exit 1
fi

echo ""
echo "Database migrations completed successfully!"
