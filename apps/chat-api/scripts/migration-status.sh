#!/bin/bash

# Migration Status Check Script
# Use this script to check the status of migrations in production

IMAGE_NAME="luisghtz/personalwebapss:myaichat-nest"
CONTAINER_NAME="myaichat-nest"

echo "Checking migration status..."
echo ""

# Try to use the running container first
if docker ps --filter "name=${CONTAINER_NAME}" | grep -q "${CONTAINER_NAME}"; then
    echo "Using running container ${CONTAINER_NAME}..."
    docker exec ${CONTAINER_NAME} npm run migration:show:prod
else
    # Use a temporary container if main container is not running
    echo "Main container not running. Using temporary container..."
    
    # Required environment variables for database connection
    if [ -z "$DB_HOST" ] || [ -z "$DB_USERNAME" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ]; then
        echo "Error: Required database environment variables are not set."
        echo "Please set: DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME"
        exit 1
    fi
    
    docker run --rm \
        -e NODE_ENV=${NODE_ENV:-production} \
        -e DB_HOST=${DB_HOST} \
        -e DB_PORT=${DB_PORT:-5432} \
        -e DB_USERNAME=${DB_USERNAME} \
        -e DB_PASSWORD=${DB_PASSWORD} \
        -e DB_NAME=${DB_NAME} \
        --network pdfgen \
        ${IMAGE_NAME} \
        npm run migration:show:prod
fi

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo "✓ Migration status retrieved successfully"
else
    echo "Error: Failed to retrieve migration status (exit code: $EXIT_CODE)"
    exit 1
fi
