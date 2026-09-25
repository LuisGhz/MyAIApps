#!/bin/bash
set -e

echo "=== Chat API Deploy Script Starting ==="
echo "Current shell: $SHELL"
echo "Current user: $(whoami)"
echo "Current directory: $(pwd)"

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
    "AWS_ACCESS_KEY_ID"
    "AWS_SECRET_ACCESS_KEY"
    "S3_BUCKET_NAME"
    "THROTTLE_TTL"
    "THROTTLE_LIMIT"
    "REDIS_HOST"
    "CACHE_SHORT_TTL"
    "CACHE_TTL"
    "CACHE_LONG_TTL"
)

echo "Validating environment variables..."
MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
        echo "Missing variable: $var"
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo "Error: The following environment variables are not set:"
    printf '  - %s\n' "${MISSING_VARS[@]}"
    exit 1
fi
echo "✓ All environment variables are set"

IMAGE_NAME="${DOCKERHUB_USER}/personalwebapss:myaichat-nest"
CONTAINER_NAME="myaichat-nest"
LOCALPORT=3001
DOCKERPORT=3000

echo "Logging in to Docker Hub as '${DOCKERHUB_USER}'..."
echo "${DOCKERHUB_TOKEN}" | docker login --username "${DOCKERHUB_USER}" --password-stdin

OLD_CONTAINER_ID=$(docker ps -aq --filter "name=^/${CONTAINER_NAME}$" || true)
if [ -n "${OLD_CONTAINER_ID}" ]; then
    echo "Found existing container ${CONTAINER_NAME} (${OLD_CONTAINER_ID}) — keeping active until migrations succeed"
else
    echo "No existing container named ${CONTAINER_NAME} found"
fi

echo "Pulling image ${IMAGE_NAME}..."
docker pull "${IMAGE_NAME}"

echo "Running database migrations using Bun..."
docker run --rm \
    -e NODE_ENV="${NODE_ENV}" \
    -e DB_HOST="${DB_HOST}" \
    -e DB_PORT="${DB_PORT}" \
    -e DB_USERNAME="${DB_USERNAME}" \
    -e DB_PASSWORD="${DB_PASSWORD}" \
    -e DB_NAME="${DB_NAME}" \
    --network dbs \
    "${IMAGE_NAME}" \
    bun run migration:run:prod

echo "✓ Database migrations completed successfully"

if [ -n "${OLD_CONTAINER_ID}" ]; then
    echo "Stopping container ${CONTAINER_NAME}..."
    docker stop "${CONTAINER_NAME}" || true
    echo "Removing container ${CONTAINER_NAME}..."
    docker rm "${CONTAINER_NAME}" || true
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
    -e S3_ACCESS_KEY="${AWS_ACCESS_KEY_ID}" \
    -e S3_SECRET_KEY="${AWS_SECRET_ACCESS_KEY}" \
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

echo "✓ Chat API deployed successfully on port ${LOCALPORT}"
