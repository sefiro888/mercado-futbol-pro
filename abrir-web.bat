@echo off
chcp 65001 >nul
title Mercado Futbol Pro
cd /d "%~dp0"

echo ============================================
echo    MERCADO FUTBOL PRO - Arrancando la web
echo ============================================
echo.

REM Instala las dependencias solo la primera vez.
if not exist "node_modules" (
  echo [1/2] Primera ejecucion: instalando dependencias...
  echo       Esto puede tardar un par de minutos.
  call npm install
  echo.
)

echo [2/2] Iniciando servidor de desarrollo...
echo       Se abrira el navegador automaticamente.
echo       Para DETENER la web: pulsa Ctrl+C y cierra esta ventana.
echo.

REM Vite abre el navegador solo (open: true en vite.config.js).
call npm run dev

REM Si el servidor se cierra, deja la ventana abierta para ver mensajes.
echo.
echo El servidor se ha detenido.
pause
