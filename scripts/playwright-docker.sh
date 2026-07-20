#!/usr/bin/env bash
set -euo pipefail

readonly ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly IMAGE_NAME="carolyn-portfolio-playwright:1.61.1"
readonly DOCKER_ARCHITECTURE="$(docker info --format '{{.Architecture}}')"

if [[ "${DOCKER_ARCHITECTURE}" != "aarch64" && "${DOCKER_ARCHITECTURE}" != "arm64" ]]; then
	echo "Visual snapshots require an ARM64 Docker engine; found ${DOCKER_ARCHITECTURE}." >&2
	exit 1
fi

docker build --file "${ROOT_DIR}/Dockerfile.playwright" --tag "${IMAGE_NAME}" "${ROOT_DIR}"
docker run --rm --init --ipc=host \
	--env "CI=${CI:-}" \
	--env AMPLIFY_BASE_URL \
	--env AMPLIFY_DEFAULT_ORIGIN \
	--env AMPLIFY_EXPECTED_RELEASE_COMMIT \
	--env EXPECTED_ARTIFACT_MODE \
	--env HERMETIC_ARTIFACT_TEST \
	--mount "type=bind,source=${ROOT_DIR},target=/work" \
	--mount "type=volume,source=carolyn-portfolio-playwright-node-modules,target=/work/node_modules" \
	--mount "type=volume,source=carolyn-portfolio-playwright-output,target=/work/.output" \
	"${IMAGE_NAME}" \
	bash -lc 'PLAYWRIGHT_CONTAINER=true bun install --frozen-lockfile && bunx playwright test "$@"' bash "$@"
