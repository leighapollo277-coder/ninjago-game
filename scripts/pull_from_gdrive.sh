#!/bin/bash

# Configuration
SCRATCH_ROOT="/Users/kenneth/.gemini/antigravity/scratch"
REMOTE="gdrive"
DEST_ROOT="Antigravity"
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)

echo "Starting multi-workspace pull from $REMOTE:$DEST_ROOT at $(date)"

# Standard exclusions
EXCLUDES=(
    --exclude "/node_modules/**"
    --exclude "/.git/**"
    --exclude "/dist/**"
    --exclude "/.next/**"
    --exclude "/.vercel/**"
    --exclude "*.log"
    --exclude ".DS_Store"
    --exclude "rclone*"
)

# Loop through each directory in scratch
for WORKSPACE_PATH in "$SCRATCH_ROOT"/*; do
    if [ -d "$WORKSPACE_PATH" ] && [[ ! "$WORKSPACE_PATH" == *"_Archive"* ]]; then
        WORKSPACE_NAME=$(basename "$WORKSPACE_PATH")
        echo "------------------------------------------------------------"
        echo "Checking updates for workspace: $WORKSPACE_NAME"
        
        echo "Dry-running pull for $WORKSPACE_NAME to identify changes..."
        rclone copy --update "$REMOTE:$DEST_ROOT/${WORKSPACE_NAME}_Backup" "$WORKSPACE_PATH" \
            --backup-dir "$WORKSPACE_PATH/../${WORKSPACE_NAME}_Archive/$TIMESTAMP" \
            "${EXCLUDES[@]}" \
            --verbose --dry-run
        
        echo ""
        read -p "Do you want to proceed with pulling these files from Google Drive? (y/n): " confirm
        if [[ "$confirm" == [yY] || "$confirm" == [yY][eE][sS] ]]; then
            echo "Proceeding with pull..."
            rclone copy --update "$REMOTE:$DEST_ROOT/${WORKSPACE_NAME}_Backup" "$WORKSPACE_PATH" \
                --backup-dir "$WORKSPACE_PATH/../${WORKSPACE_NAME}_Archive/$TIMESTAMP" \
                "${EXCLUDES[@]}" \
                --verbose
        else
            echo "Skipping pull for $WORKSPACE_NAME."
        fi
    fi
done

echo "------------------------------------------------------------"
echo "Multi-workspace pull completed at $(date)"
