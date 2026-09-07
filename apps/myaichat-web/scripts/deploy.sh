#!/bin/bash

REQUIRED_VARS=(
    "DOCKERHUB_USER"
    "DOCKERHUB_TOKEN"
)

# Validate all required environment variables
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

IMAGE_NAME="luisghtz/personalwebapss:myaichat-angular"
CONTAINER_NAME="myaichat-angular"
LOCALPORT=3051
DOCKERPORT=80

# Login to Docker Hub using the access token from the OS environment variable
echo "$DOCKERHUB_TOKEN" | docker login --username "$DOCKERHUB_USER" --password-stdin
OLD_CONTAINER_ID=$(docker ps -aq --filter "name=${CONTAINER_NAME}" || true)
if [ -n "${OLD_CONTAINER_ID}" ]; then
    echo "Found existing container ${CONTAINER_NAME} (ID: ${OLD_CONTAINER_ID}) — it will be left running until migrations succeed"
else
    echo "No existing container named ${CONTAINER_NAME} found"
fi

# Pull the new image from Docker Hub
echo "Pulling image ${IMAGE_NAME}..."
docker pull ${IMAGE_NAME}
PULL_EXIT_CODE=$?
if [ $PULL_EXIT_CODE -ne 0 ]; then
    echo "Error: Failed to pull image ${IMAGE_NAME} (exit code $PULL_EXIT_CODE)"
    exit 1
fi

if [ -n "${OLD_CONTAINER_ID}" ]; then
    echo "Stopping container ${CONTAINER_NAME}..."
    docker stop ${CONTAINER_NAME}
    echo "Removing container ${CONTAINER_NAME}..."
    docker rm ${CONTAINER_NAME}
fi

echo "Running new container ${CONTAINER_NAME}..."
docker run -d \
    -p ${LOCALPORT}:${DOCKERPORT} \
    --name ${CONTAINER_NAME} \
    ${IMAGE_NAME}
