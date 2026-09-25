#!/bin/bash
set -e

echo "=== Chat Web Deploy Script Starting ==="

REQUIRED_VARS=(
    "DOCKERHUB_USER"
    "DOCKERHUB_TOKEN"
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

IMAGE_NAME="${DOCKERHUB_USER}/personalwebapss:myaichat-angular"
CONTAINER_NAME="myaichat-angular"
LOCALPORT=3051
DOCKERPORT=80

echo "${DOCKERHUB_TOKEN}" | docker login --username "${DOCKERHUB_USER}" --password-stdin

OLD_CONTAINER_ID=$(docker ps -aq --filter "name=^/${CONTAINER_NAME}$" || true)

echo "Pulling image ${IMAGE_NAME}..."
docker pull "${IMAGE_NAME}"

if [ -n "${OLD_CONTAINER_ID}" ]; then
    echo "Stopping container ${CONTAINER_NAME}..."
    docker stop "${CONTAINER_NAME}" || true
    echo "Removing container ${CONTAINER_NAME}..."
    docker rm "${CONTAINER_NAME}" || true
fi

echo "Running new container ${CONTAINER_NAME}..."
docker run -d \
    -p "${LOCALPORT}:${DOCKERPORT}" \
    --name "${CONTAINER_NAME}" \
    "${IMAGE_NAME}"

echo "✓ Chat Web deployed successfully on port ${LOCALPORT}"
