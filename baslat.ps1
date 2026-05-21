# Dijital Kart Platformu - Başlangıç Scripti
# PowerShell ile çalıştır: .\baslat.ps1

$pgBin = "$env:USERPROFILE\scoop\apps\postgresql\current\bin"
$pgData = "$env:USERPROFILE\scoop\apps\postgresql\current\data"
$env:PATH = "C:\Program Files\nodejs;$env:USERPROFILE\scoop\shims;$pgBin;" + $env:PATH
$env:DATABASE_URL = "postgresql://postgres@localhost:5432/dijital_kart_db"

Write-Host "=== Dijital Kart Platformu ===" -ForegroundColor Cyan

# 1. PostgreSQL başlat
Write-Host "`n[1/4] PostgreSQL baslatiliyor..." -ForegroundColor Yellow
& "$pgBin\pg_ctl.exe" start -D $pgData -l "$env:USERPROFILE\scoop\apps\postgresql\current\pg.log" 2>&1 | Out-Null
Start-Sleep -Seconds 2
$pgCheck = & "$pgBin\psql.exe" -U postgres -c "SELECT 1;" 2>&1
if ($pgCheck -match "1 row") {
    Write-Host "   PostgreSQL calisIyor!" -ForegroundColor Green
} else {
    Write-Host "   PostgreSQL HATA!" -ForegroundColor Red
}

# 2. Redis başlat (yeni pencerede)
Write-Host "[2/4] Redis baslatiliyor..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command `"& redis-server`"" -WindowStyle Normal
Start-Sleep -Seconds 2
Write-Host "   Redis penceresi acildi." -ForegroundColor Green

# 3. API başlat (yeni pencerede)
Write-Host "[3/4] API baslatiliyor (port 3001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command `"Set-Location 'c:\Users\HP\Desktop\projem\dijital-kart-platformu\apps\api'; `$env:PATH = 'C:\Program Files\nodejs;' + `$env:PATH; npx ts-node-dev --respawn --transpile-only src/index.ts`"" -WindowStyle Normal
Start-Sleep -Seconds 5

# 4. Dashboard başlat (yeni pencerede)
Write-Host "[4/4] Dashboard baslatiliyor (port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command `"Set-Location 'c:\Users\HP\Desktop\projem\dijital-kart-platformu\apps\web'; `$env:PATH = 'C:\Program Files\nodejs;' + `$env:PATH; npm run dev`"" -WindowStyle Normal

Write-Host "`n=== Tum servisler baslatildi ===" -ForegroundColor Cyan
Write-Host "Dashboard : http://localhost:3000" -ForegroundColor White
Write-Host "API       : http://localhost:3001" -ForegroundColor White
Write-Host "Public    : http://localhost:3002  (ayri pencerede npm run dev yapmaniz gerekir)" -ForegroundColor White
Write-Host "`nTest hesaplari:" -ForegroundColor Yellow
Write-Host "  Admin    : superadmin / Admin1234!" -ForegroundColor White
Write-Host "  Musteri  : ahmetdemir / Musteri123!" -ForegroundColor White
