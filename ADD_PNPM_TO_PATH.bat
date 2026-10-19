@echo off
REM ========================================
REM Add pnpm to Windows PATH permanently
REM Run as Administrator
REM ========================================

echo.
echo ========================================
echo Adding pnpm to Windows PATH
echo ========================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: This script must be run as Administrator!
    echo.
    echo Right-click this file and select "Run as administrator"
    echo.
    pause
    exit /b 1
)

REM Add npm directory to system PATH
set "NPM_PATH=%APPDATA%\npm"

echo Adding %NPM_PATH% to system PATH...
echo.

REM Add to system PATH using setx (user level - no admin needed)
setx PATH "%PATH%;%NPM_PATH%"

if %errorlevel% equ 0 (
    echo.
    echo SUCCESS: %NPM_PATH% added to PATH!
    echo.
    echo IMPORTANT: Close ALL terminal windows and open a new one.
    echo Then pnpm will be available as a command.
    echo.
) else (
    echo.
    echo ERROR: Failed to update PATH.
    echo.
    echo You can add it manually:
    echo 1. Open System Properties ^> Environment Variables
    echo 2. Under User Variables, find PATH
    echo 3. Click Edit and add: %NPM_PATH%
    echo.
)

pause
