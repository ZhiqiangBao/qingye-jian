@echo off
chcp 65001 >nul
title 青叶笺桌面版
cd /d "%~dp0"

REM 优先用系统 Python（已装 pywebview）；依次回退
where py >nul 2>nul
if %errorlevel%==0 (
    py desktop.py
    goto :end
)
if exist "D:\python\python.exe" (
    "D:\python\python.exe" desktop.py
    goto :end
)
python desktop.py

:end
echo.
echo 青叶笺已退出。
timeout /t 2 >nul
