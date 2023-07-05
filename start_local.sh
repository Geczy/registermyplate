#!/bin/bash

source .env

CONTAINER_NAME="plates"

# Check if the container already exists
if [[ $(docker ps -aq -f name=$CONTAINER_NAME) ]]; then
  # Stop the existing container
  docker stop $CONTAINER_NAME

  # Remove the existing container
  docker rm $CONTAINER_NAME
fi

docker build --platform linux/amd64 \
  --build-arg POSTGRES_URL="$POSTGRES_URL" \
  -t $CONTAINER_NAME .

docker run -p 3000:3000 -d --name $CONTAINER_NAME $CONTAINER_NAME
