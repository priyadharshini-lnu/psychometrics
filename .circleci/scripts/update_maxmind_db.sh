#!/bin/bash
set -e

MAXMIND_URL="https://download.maxmind.com/geoip/databases/GeoLite2-Country/download?suffix=tar.gz"
DB_FILE="db/maxmind/GeoLite2-Country.mmdb"
METADATA_FILE="db/maxmind/GeoLite2-Country.meta"
TEMP_DIR="/tmp/maxmind_update"
TEMP_TAR="/tmp/maxmind_geolite2.tar.gz"

if [ -z "$MAXMIND_ACCOUNT_ID" ] || [ -z "$MAXMIND_LICENSE_KEY" ]; then
  error_msg="MaxMind credentials not configured"
  echo "$error_msg"
  create_failure_issue "$error_msg"
  exit 1
fi

get_remote_date() {
  curl -I -L -u "$MAXMIND_ACCOUNT_ID:$MAXMIND_LICENSE_KEY" "$MAXMIND_URL" 2>/dev/null | \
    grep -i "last-modified:" | \
    cut -d' ' -f2- | \
    tr -d '\r'
}

get_local_date() {
  if [ -f "$METADATA_FILE" ]; then
    grep "^last_modified=" "$METADATA_FILE" | cut -d'=' -f2-
  else
    echo ""
  fi
}

date_to_timestamp() {
  date -d "$1" +%s
}

check_update_needed() {
  local remote_date=$(get_remote_date)
  local local_date=$(get_local_date)

  echo "Remote database date: $remote_date"
  echo "Local database date: $local_date"

  if [ -z "$remote_date" ]; then
    error_msg="Could not get remote database date"
    echo "$error_msg"
    create_failure_issue "$error_msg"
    exit 1
  fi

  if [ -z "$local_date" ]; then
    echo "No local database found, update needed"
    return 0
  fi

  local remote_ts=$(date_to_timestamp "$remote_date")
  local local_ts=$(date_to_timestamp "$local_date")

  if [ "$remote_ts" -gt "$local_ts" ]; then
    echo "Remote database is newer, update needed"
    return 0
  else
    echo "Local database is up to date"
    return 1
  fi
}

download_and_extract() {
  echo "Downloading MaxMind database..."
  local current_dir=$(pwd)

  mkdir -p "$TEMP_DIR"

  if curl -o "$TEMP_TAR" -L -u "$MAXMIND_ACCOUNT_ID:$MAXMIND_LICENSE_KEY" "$MAXMIND_URL"; then
    echo "Download successful"
  else
    error_msg="Download failed"
    echo "$error_msg"
    create_failure_issue "$error_msg"
    exit 1
  fi

  echo "Extracting database file..."
  cd "$TEMP_DIR"
  tar -xzf "$TEMP_TAR"

  MMDB_FILE=$(find . -name "*.mmdb" -type f | head -1)

  if [ -z "$MMDB_FILE" ]; then
    error_msg="Could not find .mmdb file in archive"
    echo "$error_msg"
    cd "$current_dir"
    create_failure_issue "$error_msg"
    exit 1
  fi

  cd "$current_dir"
  mkdir -p "$(dirname "$DB_FILE")"
  cp "$TEMP_DIR/$MMDB_FILE" "$DB_FILE"

  # Store the remote date in metadata file
  echo "last_modified=$(get_remote_date)" > "$METADATA_FILE"

  rm -rf "$TEMP_DIR" "$TEMP_TAR"

  echo "Database updated successfully"
  return 0
}

create_failure_issue() {
  local error_msg="$1"
  local ci_url="${CIRCLE_BUILD_URL:-N/A}"

  gh issue create \
    --title "MaxMind database update failed" \
    --body "## MaxMind Database Update Failure

The automated MaxMind database update failed during the scheduled run.

### Error Details
\`\`\`
$error_msg
\`\`\`

### CI Build
$ci_url

### Next Steps
- Check the CI logs for detailed error information

**Date**: $(date -u '+%Y-%m-%d %H:%M:%S UTC')" \
    --label "bug,automated"

  echo "GitHub issue created for failure notification"
}

main() {
  if check_update_needed; then
    BRANCH_NAME="chore/update-maxmind-$(date +%Y%m%d)"
    git checkout -b "$BRANCH_NAME"

    download_and_extract

    git add "$DB_FILE" "$METADATA_FILE"
    NEW_DATE=$(get_local_date)
    git commit -m "chore: update MaxMind GeoLite2 database"
    git push -u origin "$BRANCH_NAME"

    gh pr create \
      --title "chore: update MaxMind GeoLite2 database" \
      --body "Automated MaxMind Database Update

This PR contains an automated update to the MaxMind GeoLite2 database.

## Description
- This update was automatically triggered by CircleCI
- Updated \`db/maxmind/GeoLite2-Country.mmdb\`. Database is updated when MaxMind releases a new version
- Database date: $NEW_DATE

This is a routine database update with no breaking changes expected." \
      --base develop \
      --head "$BRANCH_NAME"

    echo "Pull request created successfully"
  else
    echo "No update needed"
  fi
}

main