#!/bin/bash

# Rollback Migration Script
# Use this script to revert the last migration in production

# Check if running in production environment
if [ "$NODE_ENV" != "production" ]; then
    echo "Warning: This script is intended for production use."
    read -p "Are you sure you want to continue? (yes/no): " CONFIRM
    if [ "$CONFIRM" != "yes" ]; then
        echo "Rollback cancelled."
        exit 0
    fi
fi

IMAGE_NAME="luisghtz/personalwebapss:myaichat-nest"
CONTAINER_NAME="myaichat-nest"

echo "Starting migration rollback..."

# Option 1: Rollback using the running container (if it exists)
if docker ps --filter "name=${CONTAINER_NAME}" | grep -q "${CONTAINER_NAME}"; then
    echo "Rolling back migration in running container ${CONTAINER_NAME}..."
    docker exec -it ${CONTAINER_NAME} npm run migration:revert:prod
    ROLLBACK_EXIT_CODE=$?

    if [ $ROLLBACK_EXIT_CODE -eq 0 ]; then
        echo "✓ Migration rollback completed successfully"
        echo "Note: You may need to restart the application if schema changes affect running code."
        read -p "Restart the container? (yes/no): " RESTART
        if [ "$RESTART" = "yes" ]; then
            echo "Restarting container ${CONTAINER_NAME}..."
            docker restart ${CONTAINER_NAME}
            echo "✓ Container restarted"
        fi
    else
        echo "Error: Migration rollback failed with exit code $ROLLBACK_EXIT_CODE"
        exit 1
    fi
else
    # Option 2: Rollback using a temporary container (if main container is not running)
    echo "Main container not running. Running rollback in temporary container..."

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
        npm run migration:revert:prod

    ROLLBACK_EXIT_CODE=$?

    if [ $ROLLBACK_EXIT_CODE -eq 0 ]; then
        echo "✓ Migration rollback completed successfully"
    else
        echo "Error: Migration rollback failed with exit code $ROLLBACK_EXIT_CODE"
        exit 1
    fi
fi

echo ""
echo "Rollback completed. You can check the migration status by running:"
echo "  docker exec -it ${CONTAINER_NAME} npm run migration:show:prod"
echo "Or manually with:"
echo "  docker run --rm -e DB_HOST=... ${IMAGE_NAME} npm run migration:show:prod"
