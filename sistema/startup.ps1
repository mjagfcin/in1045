# Sistema de Gerenciamento de Provas - Script de Inicializacao
# Este script facilita a initial do sistema localmente

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "   Sistema de Gerenciamento de Provas - Inicializacao    " -ForegroundColor Cyan
Write-Host "========================================================`n" -ForegroundColor Cyan

# Configurar PATH para Node.js
$env:Path = "C:\Program Files\nodejs;" + $env:Path

# Funcao para log
function Log-Message {
    param(
        [string]$Prefix,
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host "$Prefix " -ForegroundColor $Color -NoNewline
    Write-Host $Message
}

# 1. Verificar MongoDB
Log-Message "[*]" "Verificando MongoDB..." "Cyan"
try {
    $mongoCheck = node -e "
    import { MongoClient } from 'mongodb';
    const client = new MongoClient('mongodb://localhost:27017');
    try {
        await client.connect();
        await client.db('admin').command({ ping: 1 });
        console.log('ok');
        await client.close();
    } catch (e) {
        console.log('fail');
    }
    " 2>$null

    if ($mongoCheck -match "ok") {
        Log-Message "[+]" "MongoDB esta acessivel" "Green"
    } else {
        Log-Message "[-]" "MongoDB nao esta acessivel" "Red"
        Log-Message "[i]" "Certifique-se de que MongoDB esta rodando localmente em docker" "Yellow"
        exit 1
    }
} catch {
    Log-Message "[-]" "Erro ao verificar MongoDB: $_" "Red"
    exit 1
}

Write-Host ""

# 2. Inicializar banco de dados
Log-Message "[*]" "Inicializando banco de dados..." "Cyan"
$scriptPath = Join-Path (Get-Location) "initDatabase.js"
if (Test-Path $scriptPath) {
    $dbOutput = & node $scriptPath 2>&1
    if ($? -eq $true) {
        Log-Message "[+]" "Banco de dados inicializado com sucesso" "Green"
    } else {
        Log-Message "[-]" "Erro ao inicializar banco de dados" "Red"
        exit 1
    }
} else {
    Log-Message "[-]" "Script initDatabase.js nao encontrado" "Red"
    exit 1
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "       SISTEMA PRONTO PARA INICIALIZAR                  " -ForegroundColor Green
Write-Host "========================================================`n" -ForegroundColor Green
Write-Host "OPCAO 1: Rodar backend e frontend em janelas separadas  " -ForegroundColor Green
Write-Host ""
Write-Host "Abra dois terminais PowerShell/CMD e execute:           " -ForegroundColor Green
Write-Host ""
Write-Host "Terminal 1 - Backend:                                    " -ForegroundColor Green
Write-Host "  cd .\backend && npm run dev                            " -ForegroundColor Green
Write-Host ""
Write-Host "Terminal 2 - Frontend:                                   " -ForegroundColor Green
Write-Host "  cd .\frontend && npm run dev                           " -ForegroundColor Green
Write-Host ""
Write-Host "Depois acesse: http://localhost:3000                     " -ForegroundColor Green
Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "OPCAO 2: Rodar testes de aceitacao                       " -ForegroundColor Green
Write-Host ""
Write-Host "  npm run test:acceptance                                " -ForegroundColor Green
Write-Host ""
Write-Host "OPCAO 3: Rodar testes unitarios                          " -ForegroundColor Green
Write-Host ""
Write-Host "  npm test                                               " -ForegroundColor Green
Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "URLs de acesso:                                          " -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend:  http://localhost:3000                       " -ForegroundColor Green
Write-Host "  Backend:   http://localhost:3001                       " -ForegroundColor Green
Write-Host "  MongoDB:   mongodb://localhost:27017                   " -ForegroundColor Green
Write-Host ""
Write-Host "========================================================`n" -ForegroundColor Green

Log-Message "[+]" "Sistema inicializado com sucesso!" "Green"
Write-Host ""
