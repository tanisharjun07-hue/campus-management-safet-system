@echo off
title CampusShield Emergency Response System
echo =========================================================
echo   CampusShield - Smart Campus Emergency Response System
echo =========================================================
echo.
echo Starting Node.js Backend & WebSocket Server on port 3000...
echo.

cd /d "%~dp0"
node server.js

pause
