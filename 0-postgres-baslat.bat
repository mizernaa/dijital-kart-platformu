@echo off
title DKP - PostgreSQL
set PGBIN=%USERPROFILE%\scoop\apps\postgresql\current\bin
set PGDATA=%USERPROFILE%\scoop\apps\postgresql\current\data
set PATH=%PGBIN%;%PATH%
echo PostgreSQL baslatiliyor...
pg_ctl start -D "%PGDATA%" -l "%USERPROFILE%\scoop\apps\postgresql\current\pg.log"
echo.
echo PostgreSQL calisiyor! Bu pencereyi acik birakin.
pause
