@echo off
title DKP - API (port 3001)
set PATH=C:\Program Files\nodejs;%USERPROFILE%\scoop\shims;%PATH%
set DATABASE_URL=postgresql://postgres@localhost:5432/dijital_kart_db
cd /d "c:\Users\HP\Desktop\projem\dijital-kart-platformu\apps\api"
echo API baslatiliyor...
npx ts-node-dev --respawn --transpile-only src/index.ts
pause
