# Iniciar el sistema de Control de Gastos del Hogar de forma automática
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "    Control de Gastos del Hogar - Servidor Local" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si Node.js está instalado
try {
    $nodeVersion = node -v
    Write-Host "[OK] Node.js detectado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js no está instalado o no se encuentra en el PATH de Windows." -ForegroundColor Red
    Write-Host "Por favor, descarga e instala Node.js desde https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
    exit
}

# Verificar carpeta node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "[INFO] No se encontró la carpeta 'node_modules'. Instalando dependencias..." -ForegroundColor Yellow
    Write-Host "Esto puede tardar un momento. Por favor, espera..."
    & npm.cmd install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Hubo un problema al instalar las dependencias." -ForegroundColor Red
        Read-Host "Presiona Enter para salir"
        exit
    }
    Write-Host "[OK] Dependencias instaladas con éxito." -ForegroundColor Green
}

Write-Host ""
Write-Host "[INFO] Iniciando el servidor de desarrollo..." -ForegroundColor Cyan
Write-Host "Abre tu navegador en: http://localhost:3000" -ForegroundColor Green
Write-Host "Para detener el servidor, cierra esta ventana o presiona Ctrl + C." -ForegroundColor Yellow
Write-Host "---------------------------------------------------"
Write-Host ""

& npm.cmd run dev
