@echo off
setlocal enabledelayedexpansion

echo === MyChat Clean Repository Setup ===
echo This script will set up a clean git repository without history.
echo Are you sure you want to proceed? This will remove all commit history.
choice /C YN /M "Press Y for Yes or N for No"

if errorlevel 2 goto :cancel
if errorlevel 1 goto :continue

:cancel
echo Operation cancelled.
exit /b 0

:continue
REM Make sure we're in a git repository
if not exist .git (
  echo Error: Not a git repository. Make sure you're in the project root directory.
  exit /b 1
)

REM Get current remote URL if it exists
for /f "tokens=*" %%a in ('git config --get remote.origin.url') do set remote_url=%%a

echo === Creating orphan branch ===
REM Create an orphan branch
git checkout --orphan new-clean-branch

REM Add all files
echo === Adding all files to new branch ===
git add -A

REM Create initial commit
echo === Creating initial commit ===
git commit -m "Initial commit - Clean history"

REM Rename branch to main
echo === Renaming branch to main ===
git branch -m main

REM Delete the old branch
echo === Removing old branch ===
git branch -D master 2>nul || git branch -D main 2>nul || echo No old branches to delete

REM If there was a remote, set it up again
if not "!remote_url!" == "" (
  echo === Setting up remote origin ===
  git remote add origin "!remote_url!"
  
  echo === To push to remote, use: ===
  echo git push -f origin main
) else (
  echo === No remote URL found ===
  echo To add a remote repository, use:
  echo git remote add origin YOUR_REPO_URL
  echo git push -f origin main
)

echo.
echo === Done! ===
echo New clean repository has been set up with a single commit.
echo All previous history has been removed.

endlocal 