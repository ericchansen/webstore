$ErrorActionPreference = "Stop"
$counter = [pscustomobject]@{ Calls = 0 }

function az {
    $counter.Calls++
    throw "Azure stub reached"
}

$password = ConvertTo-SecureString "test-only" -AsPlainText -Force
$cases = @(
    @{ Environment = "prod"; ResourceGroup = "rg-webstore-prod"; Blocked = $true },
    @{ Environment = "prod"; ResourceGroup = "rg-other"; Blocked = $true },
    @{ Environment = "dev"; ResourceGroup = "RG-WEBSTORE-PROD"; Blocked = $true },
    @{ Environment = "staging"; ResourceGroup = "rg-webstore-prod"; Blocked = $true },
    @{ Environment = "dev"; ResourceGroup = "rg-webstore-dev"; Blocked = $false },
    @{ Environment = "staging"; ResourceGroup = "rg-webstore-staging"; Blocked = $false }
)

foreach ($case in $cases) {
    $counter.Calls = 0
    $message = ""
    try {
        & "$PSScriptRoot\deploy.ps1" -Environment $case.Environment `
            -ResourceGroup $case.ResourceGroup -PostgresPassword $password
    } catch {
        $message = $_.Exception.Message
    }
    if ($case.Blocked) {
        if ($message -notlike "*Deployment to prod or rg-webstore-prod is blocked.*" -or $counter.Calls -ne 0) {
            throw "Retired deployment was not blocked before Azure access: $($case.Environment), $($case.ResourceGroup)"
        }
    } elseif ($message -ne "Azure stub reached" -or $counter.Calls -ne 1) {
        throw "Non-retired deployment did not reach the Azure stub: $($case.Environment), $($case.ResourceGroup)"
    }
}

Write-Host "All six deployment retirement checks passed without Azure access."
