#!/bin/bash

# Configuration
SCRATCH_ROOT="/Users/kenneth/.gemini/antigravity/scratch"
REMOTE="gdrive"
DEST_ROOT="Antigravity"
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)

echo "Starting multi-workspace backup to $REMOTE:$DEST_ROOT at $(date)"

# Standard exclusions
EXCLUDES=(
    --exclude "/node_modules/**"
    --exclude "/.git/**"
    --exclude "/dist/**"
    --exclude "/.next/**"
    --exclude "/.vercel/**"
    --exclude "*.log"
    --exclude ".DS_Store"
)

# Loop through each directory in scratch
for WORKSPACE_PATH in "$SCRATCH_ROOT"/*; do
    if [ -d "$WORKSPACE_PATH" ]; then
        WORKSPACE_NAME=$(basename "$WORKSPACE_PATH")
        echo "------------------------------------------------------------"
        echo "Backing up workspace: $WORKSPACE_NAME"
        
        echo "Dry-running backup for $WORKSPACE_NAME to identify changes..."
        rclone copy --update "$WORKSPACE_PATH" "$REMOTE:$DEST_ROOT/${WORKSPACE_NAME}_Backup" \
            --backup-dir "$REMOTE:$DEST_ROOT/${WORKSPACE_NAME}_Archive/$TIMESTAMP" \
            "${EXCLUDES[@]}" \
            --verbose --dry-run
        
        echo ""
        read -p "Do you want to proceed with backing up these files to Google Drive? (y/n): " confirm
        if [[ "$confirm" == [yY] || "$confirm" == [yY][eE][sS] ]]; then
            echo "Proceeding with backup..."
            rclone copy --update "$WORKSPACE_PATH" "$REMOTE:$DEST_ROOT/${WORKSPACE_NAME}_Backup" \
                --backup-dir "$REMOTE:$DEST_ROOT/${WORKSPACE_NAME}_Archive/$TIMESTAMP" \
                "${EXCLUDES[@]}" \
                --verbose
        else
            echo "Skipping backup for $WORKSPACE_NAME."
        fi
    fi
done

echo "------------------------------------------------------------"
echo "Multi-workspace backup completed at $(date)"
