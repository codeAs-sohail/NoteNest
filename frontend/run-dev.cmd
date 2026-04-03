@echo off
setlocal
set "PORTABLE=%~dp0..\.nodejs"
if exist "%PORTABLE%\npm.cmd" (
  set "PATH=%PORTABLE%;%PATH%"
  goto run
)
set "NODE_DIR=C:\Program Files\nodejs"
if exist "%NODE_DIR%\npm.cmd" (
  set "PATH=%NODE_DIR%;%PATH%"
  goto run
)
echo.
echo Node.js not found. Either:
echo   1^) Run:  powershell -ExecutionPolicy Bypass -File "%~dp0scripts\ensure-node.ps1"
echo   2^) Or install from https://nodejs.org
echo.
pause
exit /b 1

:run
cd /d "%~dp0"
call npm install
call npm run dev
