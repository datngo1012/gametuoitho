@echo off
chcp 65001 > nul
echo ========================================
echo   Auto Generate list.json
echo ========================================
echo.

cd /d "%~dp0"

REM Kiểm tra Python
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Đang chạy Python script...
    python generate-list.py
    goto :end
)

REM Kiểm tra Node.js
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Đang chạy Node.js script...
    node generate-list.js
    goto :end
)

echo.
echo ❌ Không tìm thấy Python hoặc Node.js!
echo.
echo Vui lòng cài đặt một trong hai:
echo - Python: https://www.python.org/downloads/
echo - Node.js: https://nodejs.org/
echo.

:end
echo.
pause
