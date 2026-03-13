#!/bin/bash

# Configuration
SOURCE="/Users/kenneth/.gemini/antigravity/scratch/NinjagoGameApp"
REMOTE="gdrive"
DEST_FOLDER="NinjagoGameApp_Backup"
ARCHIVE_FOLDER="NinjagoGameApp_Archive/$(date +%Y-%m-%d_%H-%M-%S)"

echo "Starting backup at $(date)"

# Sync command with safety net
# --backup-dir: Any file that would be deleted or overwritten is moved here instead
/usr/local/bin/rclone sync "$SOURCE" "$REMOTE:$DEST_FOLDER" \
    --backup-dir "$REMOTE:$ARCHIVE_FOLDER" \
    --exclude "/node_modules/**" \
    --exclude "/.git/**" \
    --exclude "/dist/**" \
    --exclude "/.next/**" \
    --exclude "*.log" \
    --exclude ".DS_Store" \
    --verbose

echo "Backup completed at $(date)"
echo "Safety Archive (if any) created at: $REMOTE:$ARCHIVE_FOLDER"
