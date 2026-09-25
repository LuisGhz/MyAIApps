#!/bin/bash
set -e

echo "=== English API Deploy Script Starting ==="

REQUIRED_VARS=(
    "DOCKERHUB_USER"
    "DOCKERHUB_TOKEN"
    "NODE_ENV"
    "DB_HOST"
    "DB_PORT"
    "DB_USERNAME"
    "DB_PASSWORD"
    "DB_NAME"
    "OPENAI_API_KEY"
    "AUTH0_DOMAIN"
    "AUTH0_AUDIENCE"
    "FRONTEND_URL"
)

echo "Validating environment variables..."
MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo "Error: The following environment variables are not set:"
    printf '  - %s\n' "${MISSING_VARS[@]}"
    exit 1
fi
echo "✓ All environment variables are set"

IMAGE_NAME="${DOCKERHUB_USER}/personalwebapss:myaienglish-api-nestjs"
CONTAINER_NAME="myaienglish-api"
LOCAL_PORT=3003
DOCKER_PORT=3000

echo "${DOCKERHUB_TOKEN}" | docker login --username "${DOCKERHUB_USER}" --password-stdin

OLD_CONTAINER_ID=$(docker ps -aq --filter "name=^/${CONTAINER_NAME}$" || true)

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
    -e OPENAI_API_KEY="${OPENAI_API_KEY}" \
    -e AUTH0_DOMAIN="${AUTH0_DOMAIN}" \
    -e AUTH0_AUDIENCE="${AUTH0_AUDIENCE}" \
    -e FRONTEND_URL="${FRONTEND_URL}" \
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
    -e DB_HOST="${DB_HOST}" \
    -e DB_PORT="${DB_PORT}" \
    -e DB_USERNAME="${DB_USERNAME}" \
    -e DB_PASSWORD="${DB_PASSWORD}" \
    -e DB_NAME="${DB_NAME}" \
    -e OPENAI_API_KEY="${OPENAI_API_KEY}" \
    -e AUTH0_DOMAIN="${AUTH0_DOMAIN}" \
    -e AUTH0_AUDIENCE="${AUTH0_AUDIENCE}" \
    -e FRONTEND_URL="${FRONTEND_URL}" \
    -p "${LOCAL_PORT}:${DOCKER_PORT}" \
    --network dbs \
    --name "${CONTAINER_NAME}" \
    "${IMAGE_NAME}"

echo "✓ English API deployed successfully on port ${LOCAL_PORT}"
