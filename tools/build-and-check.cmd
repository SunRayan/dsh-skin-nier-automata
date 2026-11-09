@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0.."
echo [NieR Automata Skin] 构建 + 校验
echo ----------------------------------------
echo [1/3] 构建客户端 (内联角色图)...
python tools\build-client.py
if errorlevel 1 ( echo 构建失败 & exit /b 1 )
echo [2/3] 令牌门禁 (verify-tokens)...
node tools\verify-tokens.mjs
if errorlevel 1 ( echo 令牌门禁未通过 & exit /b 1 )
echo [3/3] 语法校验 + 打包...
node --check lib\client.js && echo SYNTAX_OK
npm pack
echo ----------------------------------------
echo 完成。产物: dsh-skin-nier-automata-*.tgz
endlocal
