# Auto-fix all formatting and linting issues
# PowerShell Script

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "AutoFix Backend - Code Formatter & Linter" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Format code
Write-Host "Step 1: Formatting code with Prettier..." -ForegroundColor Yellow
npm run format

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Code formatted successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Formatting failed" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Run ESLint auto-fix
Write-Host "Step 2: Running ESLint auto-fix..." -ForegroundColor Yellow
npm run lint:fix

Write-Host ""

# Step 3: Build
Write-Host "Step 3: Building application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Build successful" -ForegroundColor Green
} else {
    Write-Host "✗ Build failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "✅ All checks passed!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "You can now commit your changes:"
Write-Host "  git add ."
Write-Host "  git commit -m `"Fix formatting and linting`""
Write-Host "  git push origin production"
