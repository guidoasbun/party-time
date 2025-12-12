#!/bin/bash
# infrastructure/scripts/health-check.sh
# Verify deployment health by checking multiple endpoints
#
# Usage: ./health-check.sh <base-url> [max-attempts] [sleep-seconds]
# Example: ./health-check.sh https://staging.celebration-time.com 30 10

set -e

BASE_URL=$1
MAX_ATTEMPTS=${2:-30}
SLEEP_SECONDS=${3:-10}

if [ -z "$BASE_URL" ]; then
    echo "Usage: $0 <base-url> [max-attempts] [sleep-seconds]"
    echo "Example: $0 https://staging.celebration-time.com 30 10"
    exit 1
fi

# Remove trailing slash if present
BASE_URL=${BASE_URL%/}

echo "Health Check Configuration:"
echo "  Base URL: $BASE_URL"
echo "  Max Attempts: $MAX_ATTEMPTS"
echo "  Sleep Between Attempts: ${SLEEP_SECONDS}s"
echo ""

# Endpoints to check
declare -a ENDPOINTS=(
    "/health:API Health"
    "/docs:API Documentation"
    "/:Frontend"
)

FAILED=0

for ENDPOINT_CONFIG in "${ENDPOINTS[@]}"; do
    ENDPOINT="${ENDPOINT_CONFIG%%:*}"
    NAME="${ENDPOINT_CONFIG##*:}"
    URL="${BASE_URL}${ENDPOINT}"

    echo "Checking $NAME ($URL)..."

    SUCCESS=0
    for ((i=1; i<=MAX_ATTEMPTS; i++)); do
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$URL" 2>/dev/null || echo "000")

        if [ "$HTTP_CODE" = "200" ]; then
            echo "  OK (HTTP $HTTP_CODE)"
            SUCCESS=1
            break
        fi

        if [ "$i" = "$MAX_ATTEMPTS" ]; then
            echo "  FAILED after $MAX_ATTEMPTS attempts (Last HTTP code: $HTTP_CODE)"
            FAILED=1
        else
            echo "  Attempt $i/$MAX_ATTEMPTS - Got HTTP $HTTP_CODE, retrying in ${SLEEP_SECONDS}s..."
            sleep "$SLEEP_SECONDS"
        fi
    done

    if [ "$SUCCESS" = "0" ]; then
        FAILED=1
    fi

    echo ""
done

if [ "$FAILED" = "1" ]; then
    echo "HEALTH CHECK FAILED!"
    echo "One or more endpoints did not respond with HTTP 200."
    exit 1
fi

echo "ALL HEALTH CHECKS PASSED!"
echo "Deployment is healthy."
