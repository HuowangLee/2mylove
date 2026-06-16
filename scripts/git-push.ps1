# Git Auto Commit and Push Script
# Usage: .\scripts\git-push.ps1 "commit message"
# If no message provided, will use default message with timestamp

param(
    [string]$Message = "Auto commit at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
)

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Git Auto Push Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if in git repository
if (-not (Test-Path (Join-Path $RepoRoot '.git'))) {
    Write-Host "Error: Not a Git repository!" -ForegroundColor Red
    exit 1
}

# Show current status
Write-Host ">> Checking status..." -ForegroundColor Yellow
git -C $RepoRoot status --short

# Add all changes
Write-Host ""
Write-Host ">> Adding all changes (git add .)..." -ForegroundColor Yellow
git -C $RepoRoot add .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: git add failed!" -ForegroundColor Red
    exit 1
}

# Check if there are changes to commit
$status = git -C $RepoRoot status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host ""
    Write-Host "No changes to commit!" -ForegroundColor Green
    exit 0
}

# Commit changes
Write-Host ""
Write-Host ">> Committing changes..." -ForegroundColor Yellow
Write-Host "   Commit message: $Message" -ForegroundColor Gray
git -C $RepoRoot commit -m "$Message"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: git commit failed!" -ForegroundColor Red
    exit 1
}

# Push to remote
Write-Host ""
Write-Host ">> Pushing to remote..." -ForegroundColor Yellow
git -C $RepoRoot push

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Error: git push failed!" -ForegroundColor Red
    Write-Host "Tip: You may need to set upstream branch first" -ForegroundColor Yellow
    exit 1
}

# Success
Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "Successfully completed!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
