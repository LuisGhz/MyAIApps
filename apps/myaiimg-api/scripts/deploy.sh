#!/bin/bash
set -e

echo "=== Deploy Script Starting ==="
echo "Current shell: $SHELL"
echo "Current user: $(whoami)"
echo "Current directory: $(pwd)"

# Array of required environment variables
REQUIRED_VARS=(
    "DOCKERHUB_USER"
    "DOCKERHUB_TOKEN"
    "NODE_ENV"
    "PORT"
    "OPENAI_API_KEY"
    "GEMINI_API_KEY"
    "DB_HOST"
    "DB_PORT"
    "DB_USERNAME"
    "DB_PASSWORD"
    "DB_NAME"
    "AUTH0_DOMAIN"
    "AUTH0_AUDIENCE"
    "AWS_S3_REGION"
    "AWS_S3_BUCKET"
    "AWS_ACCESS_KEY_ID"
    "AWS_SECRET_ACCESS_KEY"
    "CDN_DOMAIN"
)

# Validate all required environment variables
echo "Validating environment variables..."
MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
        echo "DEBUG: Missing variable: $var"
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo "Error: The following environment variables are not set:"
    printf '  - %s\n' "${MISSING_VARS[@]}"
    exit 1
fi
echo "✓ All environment variables are set"

IMAGE_NAME="${DOCKERHUB_USER}/personalwebapss:myaiimg-api"
export IMAGE_NAME
CONTAINER_NAME="myaiimg-api"
LOCAL_PORT=3004
DOCKER_PORT=3000

# Debug: Print the exact values we'll use
echo "DEBUG: IMAGE_NAME='${IMAGE_NAME}'"
echo "DEBUG: CONTAINER_NAME='${CONTAINER_NAME}'"
echo "DEBUG: LOCAL_PORT='${LOCAL_PORT}'"
echo "DEBUG: DOCKER_PORT='${DOCKER_PORT}'"

# Login to Docker Hub using the access token from the OS environment variable
echo "DEBUG: Logging in with DOCKERHUB_USER='${DOCKERHUB_USER}'"
echo "${DOCKERHUB_TOKEN}" | docker login --username "${DOCKERHUB_USER}" --password-stdin

# Detect if an existing container exists. We will NOT stop/remove it until
# migrations on the new image succeed. This allows a safe rollback: if
# migrations fail we leave the previous container running.
OLD_CONTAINER_ID=$(docker ps -aq --filter "name=${CONTAINER_NAME}" || true)
if [ -n "${OLD_CONTAINER_ID}" ]; then
    echo "Found existing container ${CONTAINER_NAME} (ID: ${OLD_CONTAINER_ID}) — it will be left running until migrations succeed"
else
    echo "No existing container named ${CONTAINER_NAME} found"
fi

# Pull the new image from Docker Hub
echo "Pulling image ${IMAGE_NAME}..."
docker pull "${IMAGE_NAME}"
PULL_EXIT_CODE=$?
if [ $PULL_EXIT_CODE -ne 0 ]; then
    echo "Error: Failed to pull image ${IMAGE_NAME} (exit code $PULL_EXIT_CODE)"
    exit 1
fi

echo "Running database migrations using the new image..."
docker run --rm \
    -e NODE_ENV="${NODE_ENV}" \
    -e PORT="${PORT}" \
    -e OPENAI_API_KEY="${OPENAI_API_KEY}" \
    -e GEMINI_API_KEY="${GEMINI_API_KEY}" \
    -e DB_HOST="${DB_HOST}" \
    -e DB_PORT="${DB_PORT}" \
    -e DB_USERNAME="${DB_USERNAME}" \
    -e DB_PASSWORD="${DB_PASSWORD}" \
    -e DB_NAME="${DB_NAME}" \
    -e AUTH0_DOMAIN="${AUTH0_DOMAIN}" \
    -e AUTH0_AUDIENCE="${AUTH0_AUDIENCE}" \
    -e AWS_S3_REGION="${AWS_S3_REGION}" \
    -e AWS_S3_BUCKET="${AWS_S3_BUCKET}" \
    -e AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID}" \
    -e AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY}" \
    -e CDN_DOMAIN="${CDN_DOMAIN}" \
    --network dbs \
    "${IMAGE_NAME}" \
    bun run migration:run:prod

MIGRATION_EXIT_CODE=$?
if [ $MIGRATION_EXIT_CODE -ne 0 ]; then
    echo "Error: Database migrations failed with exit code $MIGRATION_EXIT_CODE"
    echo "Deployment aborted. The previous container (if any) remains running. Please check the migration logs above."
    exit 1
fi
echo "✓ Database migrations completed successfully"

if [ -n "${OLD_CONTAINER_ID}" ]; then
    echo "Stopping container ${CONTAINER_NAME}..."
    docker stop "${CONTAINER_NAME}"
    echo "Removing container ${CONTAINER_NAME}..."
    docker rm "${CONTAINER_NAME}"
fi

echo "Running new container ${CONTAINER_NAME}..."
docker run -d \
    -e NODE_ENV="${NODE_ENV}" \
    -e PORT="${PORT}" \
    -e OPENAI_API_KEY="${OPENAI_API_KEY}" \
    -e GEMINI_API_KEY="${GEMINI_API_KEY}" \
    -e DB_HOST="${DB_HOST}" \
    -e DB_PORT="${DB_PORT}" \
    -e DB_USERNAME="${DB_USERNAME}" \
    -e DB_PASSWORD="${DB_PASSWORD}" \
    -e DB_NAME="${DB_NAME}" \
    -e AUTH0_DOMAIN="${AUTH0_DOMAIN}" \
    -e AUTH0_AUDIENCE="${AUTH0_AUDIENCE}" \
    -e AWS_S3_REGION="${AWS_S3_REGION}" \
    -e AWS_S3_BUCKET="${AWS_S3_BUCKET}" \
    -e AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID}" \
    -e AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY}" \
    -e CDN_DOMAIN="${CDN_DOMAIN}" \
    -p ${LOCAL_PORT}:${DOCKER_PORT} \
    --network dbs \
    --name ${CONTAINER_NAME} \
    ${IMAGE_NAME}

echo "✓ Deployment completed successfully"
echo "Container ${CONTAINER_NAME} is running on port ${LOCAL_PORT}"
