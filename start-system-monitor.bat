@echo off
echo ===================================================
echo           系统监控助手 - 启动程序
echo ===================================================
echo.

:: 设置颜色
color 0A

:: 检查是否存在可执行文件
if exist "%~dp0system-monitor.exe" (
    echo 正在启动系统监控助手...
    start "" "%~dp0system-monitor.exe"
    exit /B 0
)

:: 检查是否存在安装版本
if exist "%LOCALAPPDATA%\Programs\system-monitor\system-monitor.exe" (
    echo 正在启动已安装的系统监控助手...
    start "" "%LOCALAPPDATA%\Programs\system-monitor\system-monitor.exe"
    exit /B 0
)

:: 如果都不存在，提示用户下载
echo 未找到系统监控助手程序。
echo.
echo 请访问以下地址下载最新版本：
echo https://github.com/your-username/system-monitor/releases
echo.
echo 或者联系管理员获取安装包。
echo.
pause