@echo off
REM Usage: double-click or run like:  rebuild-restart.cmd 3010 blue-moon-crm
set PORT=%1
if "%PORT%"=="" set PORT=3010
set APP=%2
if "%APP%"=="" set APP=blue-moon-crm
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0rebuild-restart.ps1" -Port %PORT% -AppName "%APP%"
pause
