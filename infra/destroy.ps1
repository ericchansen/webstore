<#
.SYNOPSIS
    Destroy Webstore infrastructure in Azure

.PARAMETER Environment
    Target environment: dev, staging, or prod

.PARAMETER ResourceGroup
    Name of the Azure resource group to delete

.PARAMETER Force
    Skip confirmation prompt

.EXAMPLE
    ./destroy.ps1 -Environment dev

.EXAMPLE
    ./destroy.ps1 -Environment prod -Force
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("dev", "staging", "prod")]
    [string]$Environment,

    [Parameter(Mandatory=$false)]
    [string]$ResourceGroup = "rg-webstore-$Environment",

    [Parameter(Mandatory=$false)]
    [switch]$Force
)

$ErrorActionPreference = "Stop"

Write-Host "⚠️  WARNING: This will delete ALL resources in resource group: $ResourceGroup" -ForegroundColor Red
Write-Host ""

# Check if logged in to Azure
$account = az account show 2>$null | ConvertFrom-Json
if (-not $account) {
    Write-Host "❌ Not logged in to Azure. Run 'az login' first." -ForegroundColor Red
    exit 1
}
Write-Host "Logged in as: $($account.user.name)" -ForegroundColor Gray

# Check if resource group exists
$rgExists = az group exists --name $ResourceGroup
if ($rgExists -eq "false") {
    Write-Host "✅ Resource group '$ResourceGroup' does not exist. Nothing to delete." -ForegroundColor Green
    exit 0
}

# List resources that will be deleted
Write-Host "📋 Resources that will be deleted:" -ForegroundColor Yellow
az resource list --resource-group $ResourceGroup --query "[].{Name:name, Type:type}" -o table

Write-Host ""

# Confirmation
if (-not $Force) {
    $confirmation = Read-Host "Are you sure you want to delete all these resources? Type 'yes' to confirm"
    if ($confirmation -ne "yes") {
        Write-Host "❌ Cancelled." -ForegroundColor Yellow
        exit 0
    }
}

# Delete resource group
Write-Host "🗑️  Deleting resource group: $ResourceGroup..." -ForegroundColor Yellow
az group delete --name $ResourceGroup --yes --no-wait

Write-Host ""
Write-Host "✅ Deletion initiated. Resources are being deleted in the background." -ForegroundColor Green
Write-Host "   Run 'az group show -n $ResourceGroup' to check status." -ForegroundColor Gray
Write-Host ""
Write-Host "🎉 Done!" -ForegroundColor Green
