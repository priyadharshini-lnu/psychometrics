#!/usr/bin/env sh
set -euo pipefail

echo "URL used is ${S3_COMPATIBLE_STORAGE_ENDPOINT}..."

until mc alias set local "${S3_COMPATIBLE_STORAGE_ENDPOINT}" "${S3_COMPATIBLE_STORAGE_ACCESS_KEY_ID}" "${S3_COMPATIBLE_STORAGE_SECRET_ACCESS_KEY}" >/dev/null 2>&1; do
  sleep 2
done

echo "making buckets if missing: ${S3_COMPATIBLE_STORAGE_PUBLIC_BUCKET}, ${S3_COMPATIBLE_STORAGE_PRIVATE_BUCKET}"
mc mb --ignore-existing "local/${S3_COMPATIBLE_STORAGE_PUBLIC_BUCKET}"
mc mb --ignore-existing "local/${S3_COMPATIBLE_STORAGE_PRIVATE_BUCKET}"
mc anonymous set download "local/${S3_COMPATIBLE_STORAGE_PUBLIC_BUCKET}"


echo "Comleted init"
