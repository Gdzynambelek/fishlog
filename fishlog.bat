@echo off
rem One-click wrappers — double-click these or run from any cmd window.
rem
rem fishlog.bat              -> status
rem fishlog.bat start
rem fishlog.bat stop
rem fishlog.bat restart
rem fishlog.bat logs
rem
rem Bypasses execution policy for this single run (does not change machine settings).

setlocal
set ACTION=%1
if "%ACTION%"=="" set ACTION=status

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0fishlog.ps1" %ACTION%
