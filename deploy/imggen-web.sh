#!/bin/bash
set -e

REQUIRED_VARS=("DOCKERHUB_USER" "DOCKERHUB_TOKEN")
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

IMAGE_NAME="${DOCKERHUB_USER}/personalwebapss:myaiimg"
CONTAINER_NAME="myaiimg"
LOCAL_PORT=3054
DOCKER_PORT=80

echo "${DOCKERHUB_TOKEN}" | docker login --username "${DOCKERHUB_USER}" --password-stdin
OLD_CONTAINER_ID=$(docker ps -aq --filter "name=^/${CONTAINER_NAME}$" || true)

echo "Pulling image ${IMAGE_NAME}..."
docker pull "${IMAGE_NAME}"

if [ -n "${OLD_CONTAINER_ID}" ]; then
    docker stop "${CONTAINER_NAME}" || true
    docker rm "${CONTAINER_NAME}" || true
fi

docker run -d \
    -p "${LOCAL_PORT}:${DOCKER_PORT}" \
    --name "${CONTAINER_NAME}" \
    "${IMAGE_NAME}"

echo "Image Generator Web deployed successfully on port ${LOCAL_PORT}"