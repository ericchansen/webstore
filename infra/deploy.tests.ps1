$ErrorActionPreference = "Stop"
$counter = [pscustomobject]@{ Calls = 0 }

function az {
    $counter.Calls++
    throw "Azure stub reached"
}

$password = ConvertTo-SecureString "test-only" -AsPlainText -Force
$retiredError = "*Deployment to prod or rg-webstore-prod is blocked.*"
$cases = @(
    @{ Environment = "prod"; ResourceGroup = "rg-webstore-prod"; ExpectedError = $retiredError; AzureCalls = 0 },
    @{ Environment = "prod"; ResourceGroup = "rg-other"; ExpectedError = $retiredError; AzureCalls = 0 },
    @{ Environment = "dev"; ResourceGroup = "RG-WEBSTORE-PROD"; ExpectedError = $retiredError; AzureCalls = 0 },
    @{ Environment = "PROD"; ResourceGroup = "rg-other"; ExpectedError = $retiredError; AzureCalls = 0 },
    @{ Environment = "dev"; ResourceGroup = "rg-webstore-dev"; ExpectedError = "Azure stub reached"; AzureCalls = 1 },
    @{ Environment = "staging"; ResourceGroup = "rg-webstore-staging"; ExpectedError = "*ValidateSet*"; AzureCalls = 0 }
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
    if ($message -notlike $case.ExpectedError -or $counter.Calls -ne $case.AzureCalls) {
        throw "Unexpected deployment guard result for $($case.Environment), $($case.ResourceGroup): $message (Azure calls: $($counter.Calls))"
    }
}

Write-Host "All six deployment retirement checks passed without Azure access."
