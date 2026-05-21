@echo off
title Dijital Kart Platformu - Baslatici
set PATH=C:\Program Files\nodejs;%APPDATA%\npm;%USERPROFILE%\scoop\shims;%USERPROFILE%\scoop\apps\postgresql\current\bin;%PATH%

echo === Dijital Kart Platformu ===
echo.

echo [1/4] PostgreSQL baslatiliyor...
pg_ctl start -D "%USERPROFILE%\scoop\apps\postgresql\current\data" -l "%USERPROFILE%\scoop\apps\postgresql\current\pg.log" 2>nul
timeout /t 4 /nobreak >nul
netstat -ano | findstr ":5432" >nul 2>&1
if errorlevel 1 (
    echo [HATA] PostgreSQL baslanamadi! pg.log dosyasini kontrol edin.
    echo Log: %USERPROFILE%\scoop\apps\postgresql\current\pg.log
    pause
    exit /b 1
) else (
    echo PostgreSQL calisıyor - port 5432 OK
)

echo [2/4] Redis baslatiliyor...
start /min "" "%USERPROFILE%\scoop\apps\redis\current\redis-server.exe" 2>nul
timeout /t 2 /nobreak >nul

echo [3/4] PM2 servisleri baslatiliyor...
pm2 delete all 2>nul
pm2 start "%~dp0apps\api\ecosystem.config.js"
timeout /t 3 /nobreak >nul
pm2 start "%~dp0ecosystem.config.js"
timeout /t 8 /nobreak >nul
pm2 list

echo.
echo === HAZIR ===
echo Dashboard  : http://localhost:3000
echo API        : http://localhost:3001
echo Public     : http://localhost:3002/u/ahmetdemir
echo.
echo Test hesaplari:
echo   Admin   : superadmin / Admin1234!
echo   Musteri : ahmetdemir / Musteri123!
echo.
echo [4/4] Tarayicinizi acin: http://localhost:3000
echo.
echo NOT: Bu pencereyi kapatirsaniz servisler pm2 ile calismaya devam eder.
echo      Durdurmak icin: pm2 delete all
pause
