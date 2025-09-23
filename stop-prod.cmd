@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0stop-prod.ps1" %*
pause
