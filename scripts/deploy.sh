#!/bin/bash
# deploy.sh — Automated deploy script for AI Writing Assistant
set -euo pipefail

PROJECT_NAME="ai-writing-assistant"
BUILD_ENV=${1:-docker}

echo "🚀 Deploying ${PROJECT_NAME} (${BUILD_ENV})..."

if [ "${BUILD_ENV}" = "railway" ]; then
  echo "Building and deploying to Railway..."
  npm ci
  npm run build
  npm run build:server
  railway up --detach
  echo "✅ Deployed to Railway"

elif [ "${BUILD_ENV}" = "docker" ]; then
  TAG="${DOCKER_TAG:-${PROJECT_NAME}:latest}"
  echo "Building Docker image: ${TAG}..."
  docker build -t "${TAG}" .
  echo "Running smoke test..."
  CONTAINER_ID=$(docker run -d -p 3001:3000 "${TAG}")
  sleep 5
  if curl -sf http://localhost:3001/health > /dev/null; then
    echo "✅ Smoke test passed"
  else
    echo "❌ Smoke test failed"
    docker stop "${CONTAINER_ID}" 2>/dev/null || true
    exit 1
  fi
  docker stop "${CONTAINER_ID}" 2>/dev/null || true
  echo "📦 Image ready: ${TAG}"

else
  echo "Unknown: ${BUILD_ENV}. Use 'railway' or 'docker'."
  exit 1
fi
