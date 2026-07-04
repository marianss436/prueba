@echo off
title Control de Gastos del Hogar - Servidor Local
color 0B

echo ===================================================
echo     Control de Gastos del Hogar - Servidor Local
echo ===================================================
echo.

:: Verificar si Node.js esta instalado
node -v >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js no esta instalado o no se encuentra en el PATH.
    echo Por favor, instala Node.js desde https://nodejs.org/ antes de continuar.
    echo.
    pause
    exit /b
)

:: Verificar si existe la carpeta node_modules
if not exist node_modules (
    echo [INFO] No se encontro la carpeta "node_modules". Instalando dependencias...
    echo Esto puede tardar unos minutos. Por favor, espera...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo.
        echo [ERROR] Hubo un problema al instalar las dependencias con "npm install".
        echo Intenta ejecutar "npm install" manualmente desde el Command Prompt (cmd.exe).
        echo.
        pause
        exit /b
    )
    echo.
    echo [OK] Dependencias instaladas con exito.
    echo.
)

echo [INFO] Iniciando el servidor de desarrollo local...
echo Abre tu navegador en: http://localhost:3000
echo.
echo Presiona Ctrl + C en esta ventana de comando para detener el servidor.
echo ---------------------------------------------------
echo.

call npm run dev

pause
