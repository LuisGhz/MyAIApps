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
    "DB_HOST"
    "DB_PORT"
    "DB_USERNAME"
    "DB_PASSWORD"
    "DB_NAME"
    "JWT_SECRET"
    "JWT_EXPIRES_IN"
    "REFRESH_TOKEN_LENGTH"
    "REFRESH_TOKEN_EXPIRES_IN"
    "OPENAI_API_KEY"
    "GEMINI_API_KEY"
    "GITHUB_CLIENT_ID"
    "GITHUB_CLIENT_SECRET"
    "GITHUB_CALLBACK_URL"
    "FRONTEND_URL"
    "MAX_SESSIONS_PER_USER"
    "CDN_DOMAIN"
    "S3_ACCESS_KEY"
    "S3_SECRET_KEY"
    "S3_BUCKET_NAME"
    "THROTTLE_TTL"
    "THROTTLE_LIMIT"
    "REDIS_HOST"
    "CACHE_SHORT_TTL"
    "CACHE_TTL"
    "CACHE_LONG_TTL"
)

# Validate all required environment variables
echo "Validating environment variables..."
echo "DEBUG: DOCKERHUB_USER=$DOCKERHUB_USER"
echo "DEBUG: IMAGE_NAME will be: luisghtz/personalwebapss:myaichat-nest"
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

IMAGE_NAME="luisghtz/personalwebapss:myaichat-nest"
export IMAGE_NAME
CONTAINER_NAME="myaichat-nest"
LOCALPORT=3001
DOCKERPORT=3000

# Debug: Print the exact values we'll use
echo "DEBUG: IMAGE_NAME='${IMAGE_NAME}'"
echo "DEBUG: CONTAINER_NAME='${CONTAINER_NAME}'"
echo "DEBUG: LOCALPORT='${LOCALPORT}'"
echo "DEBUG: DOCKERPORT='${DOCKERPORT}'"

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
    -e DB_HOST="${DB_HOST}" \
    -e DB_PORT="${DB_PORT}" \
    -e DB_USERNAME="${DB_USERNAME}" \
    -e DB_PASSWORD="${DB_PASSWORD}" \
    -e DB_NAME="${DB_NAME}" \
    --network dbs \
    "${IMAGE_NAME}" \
    npm run migration:run:prod

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
    -e DB_HOST="${DB_HOST}" \
    -e DB_PORT="${DB_PORT}" \
    -e DB_USERNAME="${DB_USERNAME}" \
    -e DB_PASSWORD="${DB_PASSWORD}" \
    -e DB_NAME="${DB_NAME}" \
    -e JWT_SECRET="${JWT_SECRET}" \
    -e JWT_EXPIRES_IN="${JWT_EXPIRES_IN}" \
    -e REFRESH_TOKEN_LENGTH="${REFRESH_TOKEN_LENGTH}" \
    -e REFRESH_TOKEN_EXPIRES_IN="${REFRESH_TOKEN_EXPIRES_IN}" \
    -e OPENAI_API_KEY="${OPENAI_API_KEY}" \
    -e GEMINI_API_KEY="${GEMINI_API_KEY}" \
    -e GITHUB_CLIENT_ID="${GITHUB_CLIENT_ID}" \
    -e GITHUB_CLIENT_SECRET="${GITHUB_CLIENT_SECRET}" \
    -e GITHUB_CALLBACK_URL="${GITHUB_CALLBACK_URL}" \
    -e FRONTEND_URL="${FRONTEND_URL}" \
    -e MAX_SESSIONS_PER_USER="${MAX_SESSIONS_PER_USER}" \
    -e CDN_DOMAIN="${CDN_DOMAIN}" \
    -e S3_ACCESS_KEY="${S3_ACCESS_KEY}" \
    -e S3_SECRET_KEY="${S3_SECRET_KEY}" \
    -e S3_BUCKET_NAME="${S3_BUCKET_NAME}" \
    -e THROTTLE_TTL="${THROTTLE_TTL}" \
    -e THROTTLE_LIMIT="${THROTTLE_LIMIT}" \
    -e REDIS_HOST="${REDIS_HOST}" \
    -e CACHE_SHORT_TTL="${CACHE_SHORT_TTL}" \
    -e CACHE_TTL="${CACHE_TTL}" \
    -e CACHE_LONG_TTL="${CACHE_LONG_TTL}" \
    -p "${LOCALPORT}:${DOCKERPORT}" \
    --network dbs \
    --network redis \
    --name "${CONTAINER_NAME}" \
    "${IMAGE_NAME}"