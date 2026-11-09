@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0.."
node tools\install.mjs %*
if errorlevel 1 (
  echo.
  echo 安装未通过，见上方错误。
  pause
  exit /b 1
)
echo.
pause
endlocal
