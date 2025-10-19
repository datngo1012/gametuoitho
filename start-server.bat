@echo off
echo ========================================
echo   Website Game Tuoi Tho - FreeJ2ME
echo ========================================
echo.
echo Dang khoi dong web server...
echo.

cd web

REM Kiem tra Python
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Dang chay tren Python...
    echo Truy cap: http://localhost:8080
    echo.
    python -m http.server 8080
) else (
    echo Python khong duoc cai dat!
    echo Vui long cai dat Python hoac dung web server khac.
    pause
)
