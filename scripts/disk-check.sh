#!/bin/sh
# Exit 1 when free space on the data volume is below MIN GB (default 15).
MIN=${1:-15}
FREE=$(df -g /System/Volumes/Data | awk 'NR==2{print $4}')
if [ "$FREE" -lt "$MIN" ]; then echo "LOW DISK: ${FREE} GB free (< ${MIN})"; exit 1; fi
echo "disk ok: ${FREE} GB free"
