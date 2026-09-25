#!/bin/bash
set -e

echo "=== Image Generator API Deploy Script Starting ==="

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

IMAGE_NAME="${DOCKERHUB_USER}/personalwebapss:myaiimg-api"
CONTAINER_NAME="myaiimg-api"
LOCAL_PORT=3004
DOCKER_PORT=3000

echo "${DOCKERHUB_TOKEN}" | docker login --username "${DOCKERHUB_USER}" --password-stdin
OLD_CONTAINER_ID=$(docker ps -aq --filter "name=^/${CONTAINER_NAME}$" || true)

echo "Pulling image ${IMAGE_NAME}..."
docker pull "${IMAGE_NAME}"

echo "Running database migrations using Bun..."
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

if [ -n "${OLD_CONTAINER_ID}" ]; then
    docker stop "${CONTAINER_NAME}" || true
    docker rm "${CONTAINER_NAME}" || true
fi

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
    -p "${LOCAL_PORT}:${DOCKER_PORT}" \
    --network dbs \
    --name "${CONTAINER_NAME}" \
    "${IMAGE_NAME}"

echo "Image Generator API deployed successfully on port ${LOCAL_PORT}"