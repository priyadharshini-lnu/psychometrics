#!/bin/bash
set -e

MAXMIND_URL="https://download.maxmind.com/geoip/databases/GeoLite2-Country/download?suffix=tar.gz"
DB_FILE="db/GeoLite2-Country.mmdb"
TEMP_DIR="/tmp/maxmind_update"
TEMP_TAR="/tmp/maxmind_geolite2.tar.gz"

if [ -z "$MAXMIND_ACCOUNT_ID" ] || [ -z "$MAXMIND_LICENSE_KEY" ]; then
  echo "MaxMind credentials not configured"
  exit 1
fi

get_remote_date() {
  curl -I -L -u "$MAXMIND_ACCOUNT_ID:$MAXMIND_LICENSE_KEY" "$MAXMIND_URL" 2>/dev/null | \
    grep -i "last-modified:" | \
    cut -d' ' -f2- | \
    tr -d '\r'
}

get_local_date() {
  if [ -f "$DB_FILE" ]; then
    date -u -r "$DB_FILE" "+%a, %d %b %Y %H:%M:%S GMT"
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
    echo "Could not get remote database date"
    return 1
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
    echo "Download failed"
    return 1
  fi

  echo "Extracting database file..."
  cd "$TEMP_DIR"
  tar -xzf "$TEMP_TAR"

  MMDB_FILE=$(find . -name "*.mmdb" -type f | head -1)

  if [ -z "$MMDB_FILE" ]; then
    echo "Could not find .mmdb file in archive"
    cd "$current_dir"
    return 1
  fi

  cd "$current_dir"
  mkdir -p "$(dirname "$DB_FILE")"
  cp "$TEMP_DIR/$MMDB_FILE" "$DB_FILE"

  rm -rf "$TEMP_DIR" "$TEMP_TAR"

  echo "Database updated successfully"
  return 0
}

main() {
  if check_update_needed; then
    BRANCH_NAME="chore/update-maxmind-$(date +%Y%m%d)"
    git checkout -b "$BRANCH_NAME"

    if download_and_extract; then
      git add "$DB_FILE"

      NEW_DATE=$(get_local_date)

      git commit -m "chore: update MaxMind GeoLite2 database"

      git push -u origin "$BRANCH_NAME"

      gh pr create \
        --title "chore: update MaxMind GeoLite2 database" \
        --body "Automated MaxMind Database Update

This PR contains an automated update to the MaxMind GeoLite2 database.

## Description
- This update was automatically triggered by CircleCI
- Updated \`db/GeoLite2-Country.mmdb\`. Database is updated when MaxMind releases a new version
- Database date: $NEW_DATE

This is a routine database update with no breaking changes expected." \
        --base develop \
        --head "$BRANCH_NAME"

      echo "Pull request created successfully"
    else
      echo "Failed to update database"
      exit 1
    fi
  else
    echo "No update needed"
  fi
}

main