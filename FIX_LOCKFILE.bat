@echo off
REM ========================================
REM Fix Corrupted Lockfile
REM ========================================

echo.
echo ========================================
echo Fixing Corrupted pnpm Lockfile
echo ========================================
echo.

cd /d "%~dp0"

REM Set the direct path to pnpm
set "PNPM=%APPDATA%\npm\pnpm.cmd"

REM Verify pnpm exists
if not exist "%PNPM%" (
    echo ERROR: pnpm not found at %PNPM%
    pause
    exit /b 1
)

echo Problem: Lockfile has typescript@7.0.2 but package.json has 6.0.3
echo Solution: Regenerate lockfile to match package.json
echo.
echo Running: pnpm install --no-frozen-lockfile
echo.

"%PNPM%" install --no-frozen-lockfile

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to regenerate lockfile!
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS: Lockfile fixed!
echo ========================================
echo.
echo The pnpm-lock.yaml has been regenerated to match package.json
echo.
echo Next step: Run RUN_CI_CHECKS_DIRECT.bat to verify all checks pass
echo.
pause
