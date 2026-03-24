<#
.SYNOPSIS
    Deploy Webstore infrastructure to Azure using Bicep

.PARAMETER Environment
    Target environment: dev, staging, or prod

.PARAMETER ResourceGroup
    Name of the Azure resource group (will be created if it doesn't exist)

.PARAMETER Location
    Azure region for resources (default: eastus)

.PARAMETER PostgresPassword
    Password for PostgreSQL admin user

.PARAMETER ContainerImage
    (Optional) Container image to deploy. If omitted, only infrastructure is deployed.

.EXAMPLE
    ./deploy.ps1 -Environment dev -ResourceGroup rg-webstore-dev -PostgresPassword "SecureP@ss123!"

.EXAMPLE
    ./deploy.ps1 -Environment prod -ResourceGroup rg-webstore-prod -PostgresPassword "SecureP@ss123!" -ContainerImage "acrwebstoreprod.azurecr.io/webstore:v1.0.0"
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("dev", "staging", "prod")]
    [string]$Environment,

    [Parameter(Mandatory=$false)]
    [string]$ResourceGroup = "rg-webstore-$Environment",

    [Parameter(Mandatory=$false)]
    [string]$Location = "eastus",

    [Parameter(Mandatory=$true)]
    [SecureString]$PostgresPassword,

    [Parameter(Mandatory=$false)]
    [string]$ContainerImage = ""
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Deploying Webstore infrastructure to Azure..." -ForegroundColor Cyan
Write-Host "   Environment: $Environment" -ForegroundColor Gray
Write-Host "   Resource Group: $ResourceGroup" -ForegroundColor Gray
Write-Host "   Location: $Location" -ForegroundColor Gray

# Check if logged in to Azure
$account = az account show 2>$null | ConvertFrom-Json
if (-not $account) {
    Write-Host "❌ Not logged in to Azure. Run 'az login' first." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Logged in as: $($account.user.name)" -ForegroundColor Green

# Create resource group if it doesn't exist
$rgExists = az group exists --name $ResourceGroup
if ($rgExists -eq "false") {
    Write-Host "📦 Creating resource group: $ResourceGroup..." -ForegroundColor Yellow
    az group create --name $ResourceGroup --location $Location | Out-Null
}
Write-Host "✅ Resource group ready: $ResourceGroup" -ForegroundColor Green

# Convert secure string to plain text for Azure CLI
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($PostgresPassword)
$PlainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Build deployment parameters
$deployParams = @(
    "--resource-group", $ResourceGroup,
    "--template-file", "$PSScriptRoot\main.bicep",
    "--parameters", "environment=$Environment",
    "--parameters", "postgresAdminPassword=$PlainPassword"
)

if ($ContainerImage) {
    $deployParams += "--parameters"
    $deployParams += "containerImage=$ContainerImage"
}

# Deploy
Write-Host "🔨 Deploying Bicep template..." -ForegroundColor Yellow
$deployment = az deployment group create @deployParams --query "properties.outputs" -o json | ConvertFrom-Json

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Deployment successful!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Outputs:" -ForegroundColor Cyan
Write-Host "   Container Registry: $($deployment.containerRegistryLoginServer.value)" -ForegroundColor Gray
Write-Host "   PostgreSQL Server:  $($deployment.postgresServerFqdn.value)" -ForegroundColor Gray
Write-Host "   Key Vault:          $($deployment.keyVaultUri.value)" -ForegroundColor Gray
Write-Host "   App Insights:       $($deployment.applicationInsightsAppId.value)" -ForegroundColor Gray

if ($deployment.containerAppUrl.value) {
    Write-Host "   App URL:            $($deployment.containerAppUrl.value)" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Done!" -ForegroundColor Green
