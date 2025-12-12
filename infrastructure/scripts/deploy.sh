#!/bin/bash
# infrastructure/scripts/deploy.sh
# Deploys services to ECS with force-new-deployment
#
# Usage: ./deploy.sh <cluster> <services>
# Example: ./deploy.sh party-time-staging-cluster "frontend,backend,celery-worker,celery-beat"

set -e

CLUSTER=$1
SERVICES=$2  # Comma-separated list

if [ -z "$CLUSTER" ] || [ -z "$SERVICES" ]; then
    echo "Usage: $0 <cluster> <services>"
    echo "Example: $0 party-time-staging-cluster 'frontend,backend'"
    exit 1
fi

echo "Starting deployment to cluster: $CLUSTER"
echo "Services: $SERVICES"
echo ""

# Deploy each service
for SERVICE in ${SERVICES//,/ }; do
    echo "Deploying $SERVICE..."
    aws ecs update-service \
        --cluster "$CLUSTER" \
        --service "$SERVICE" \
        --force-new-deployment \
        --query 'service.serviceName' \
        --output text
    echo "  Deployment initiated for $SERVICE"
done

echo ""
echo "Waiting for services to stabilize..."
echo "This may take several minutes..."

# Wait for all services to stabilize
aws ecs wait services-stable \
    --cluster "$CLUSTER" \
    --services ${SERVICES//,/ }

echo ""
echo "All services are stable!"
echo "Deployment complete."
