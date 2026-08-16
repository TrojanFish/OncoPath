#!/bin/bash
# ==============================================================================
# OncoPath PostgreSQL Automated Daily Backup Script
# Retention policy: Keeps the last 30 daily backup snapshots.
# Usage:
#   chmod +x scripts/backup-db.sh
#   Add to crontab: 0 3 * * * /path/to/lung/scripts/backup-db.sh >> /var/log/oncopath_backup.log 2>&1
# ==============================================================================

set -e

BACKUP_DIR="${BACKUP_DIR:-/var/backups/oncopath}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/oncopath_backup_${TIMESTAMP}.sql.gz"
CONTAINER_NAME="${CONTAINER_NAME:-oncopath-prod-db}"
DB_USER="${POSTGRES_USER:-oncopath_admin}"
DB_NAME="${POSTGRES_DB:-oncopath_production}"
RETENTION_DAYS=30

mkdir -p "${BACKUP_DIR}"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting OncoPath database backup..."

# Dump PostgreSQL database directly from Docker container and compress with gzip
docker exec -t "${CONTAINER_NAME}" pg_dump -U "${DB_USER}" "${DB_NAME}" | gzip > "${BACKUP_FILE}"

# Verify backup file size is greater than zero
if [ -s "${BACKUP_FILE}" ]; then
  FILE_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup successfully created: ${BACKUP_FILE} (Size: ${FILE_SIZE})"
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Backup file is empty!" >&2
  exit 1
fi

# Clean up backups older than RETENTION_DAYS
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Purging backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "oncopath_backup_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup job finished cleanly."
