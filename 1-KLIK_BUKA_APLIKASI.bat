@echo off
title Membuka Pencatatan Glow...
cd /d "C:\Users\MSI Modern 14\rapiusaha"
echo ===================================================
echo             MEMBUKA APLIKASI PENCATATAN GLOW
echo ===================================================
echo [1/2] Memeriksa server aplikasi...
curl -s http://localhost:4173 >nul 2>&1
if %errorlevel% equ 0 (
    echo Server aktif. Membuka browser...
    start http://localhost:4173
    exit
)

echo [2/2] Menyalakan backend dan frontend...
start "" /b cmd /c "node server/index.mjs"
timeout /t 1 >nul
start "" /b cmd /c "npm run preview -- --port 4173 --host"
timeout /t 2 >nul
start http://localhost:4173
exit
