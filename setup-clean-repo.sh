#!/bin/bash

# MyChat - Clean Repository Setup Script
# 
# This script creates a clean git repository without any history
# from an existing repository, using git's --orphan option.
#
# Usage: ./setup-clean-repo.sh

echo "=== MyChat Clean Repository Setup ==="
echo "This script will set up a clean git repository without history."
echo "Are you sure you want to proceed? This will remove all commit history. (y/n)"
read -r confirm

if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "Operation cancelled."
  exit 0
fi

# Make sure we're in a git repository
if [ ! -d .git ]; then
  echo "Error: Not a git repository. Make sure you're in the project root directory."
  exit 1
fi

# Get current remote URL if it exists
remote_url=$(git config --get remote.origin.url)

echo "=== Creating orphan branch ==="
# Create an orphan branch
git checkout --orphan new-clean-branch

# Add all files
echo "=== Adding all files to new branch ==="
git add -A

# Create initial commit
echo "=== Creating initial commit ==="
git commit -m "Initial commit - Clean history"

# Rename branch to main
echo "=== Renaming branch to main ==="
git branch -m main

# Delete the old branch
echo "=== Removing old branch ==="
git branch -D master || git branch -D main || echo "No old branches to delete"

# If there was a remote, set it up again
if [ -n "$remote_url" ]; then
  echo "=== Setting up remote origin ==="
  git remote add origin "$remote_url"
  
  echo "=== To push to remote, use: ==="
  echo "git push -f origin main"
else
  echo "=== No remote URL found ==="
  echo "To add a remote repository, use:"
  echo "git remote add origin YOUR_REPO_URL"
  echo "git push -f origin main"
fi

echo ""
echo "=== Done! ==="
echo "New clean repository has been set up with a single commit."
echo "All previous history has been removed." 