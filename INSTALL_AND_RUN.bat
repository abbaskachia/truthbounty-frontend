@echo off
REM ========================================
REM Install pnpm and run CI checks
REM ========================================

echo.
echo ========================================
echo Installing pnpm package manager...
echo ========================================
echo.

REM Check if pnpm is already installed
where pnpm >nul 2>nul
if %errorlevel% equ 0 (
    echo pnpm is already installed!
    pnpm --version
    echo.
    goto :run_checks
)

echo pnpm not found. Installing via npm...
echo.

npm install -g pnpm

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install pnpm!
    echo.
    echo Please try manually:
    echo   npm install -g pnpm
    echo.
    echo Or use PowerShell as Administrator:
    echo   iwr https://get.pnpm.io/install.ps1 -useb ^| iex
    echo.
    pause
    exit /b 1
)

echo.
echo SUCCESS: pnpm installed!
echo.
echo Refreshing PATH to include pnpm...
echo.

REM Add common pnpm locations to PATH for current session
set "PATH=%PATH%;%APPDATA%\npm"
set "PATH=%PATH%;%LOCALAPPDATA%\pnpm"
set "PATH=%PATH%;%USERPROFILE%\AppData\Local\pnpm"
set "PATH=%PATH%;%USERPROFILE%\.local\share\pnpm"

REM Verify pnpm is now accessible
where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo WARNING: pnpm installed but not in PATH yet.
    echo Please CLOSE this window and run RUN_CI_CHECKS.bat in a NEW terminal.
    echo.
    pause
    exit /b 0
)

echo pnpm is now available!
pnpm --version
echo.

:run_checks

echo.
echo ========================================
echo Running CI checks...
echo ========================================
echo.

cd /d "%~dp0"

call RUN_CI_CHECKS.bat

