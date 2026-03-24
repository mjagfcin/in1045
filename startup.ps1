# Sistema de Gerenciamento de Provas - Script de Inicialização
# Este script facilita a inicial do sistema localmente

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║      Sistema de Gerenciamento de Provas - Inicialização    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Configurar PATH para Node.js
$env:Path = "C:\Program Files\nodejs;" + $env:Path

# Cores
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Blue = "Cyan"

# Função para log
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
Log-Message "📋" "Verificando MongoDB..." $Blue
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
        Log-Message "✓" "MongoDB está acessível" $Green
    } else {
        Log-Message "✗" "MongoDB não está acessível" $Red
        Log-Message "ℹ" "Certifique-se de que MongoDB está rodando localmente em docker" $Yellow
        exit 1
    }
} catch {
    Log-Message "✗" "Erro ao verificar MongoDB: $_" $Red
    exit 1
}

Write-Host ""

# 2. Inicializar banco de dados
Log-Message "📋" "Inicializando banco de dados..." $Blue
$scriptPath = Join-Path (Get-Location) "initDatabase.js"
if (Test-Path $scriptPath) {
    $dbOutput = & node $scriptPath 2>&1
    if ($? -eq $true) {
        Log-Message "✓" "Banco de dados inicializado com sucesso" $Green
    } else {
        Log-Message "✗" "Erro ao inicializar banco de dados" $Red
        exit 1
    }
} else {
    Log-Message "✗" "Script initDatabase.js não encontrado" $Red
    exit 1
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║           SISTEMA PRONTO PARA INICIALIZAR                 ║" -ForegroundColor Green
Write-Host "╠════════════════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "║  OPÇÃO 1: Rodar backend e frontend em janelas separadas   ║" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "║  Abra dois terminais PowerShell/CMD e execute:            ║" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "║  Terminal 1 - Backend:                                     ║" -ForegroundColor Green
Write-Host "║    cd .\backend && npm run dev                             ║" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "║  Terminal 2 - Frontend:                                    ║" -ForegroundColor Green
Write-Host "║    cd .\frontend && npm run dev                            ║" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "║  Depois acesse: http://localhost:3000                     ║" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "╠════════════════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║  OPÇÃO 2: Rodar testes de aceitação                       ║" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "║    npm run test:acceptance                                ║" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "║  OPÇÃO 3: Rodar testes unitários                          ║" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "║    npm test                                                ║" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "║  URLs de acesso:                                           ║" -ForegroundColor Green
Write-Host "║    🌐 Frontend:  http://localhost:3000                    ║" -ForegroundColor Green
Write-Host "║    🔌 Backend:   http://localhost:3001                    ║" -ForegroundColor Green
Write-Host "║    💾 MongoDB:   mongodb://localhost:27017                ║" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Log-Message "✓" "Sistema inicializado com sucesso!" $Green
Write-Host ""
