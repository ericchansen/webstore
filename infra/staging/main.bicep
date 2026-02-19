// Staging Bicep template for per-PR webstore environments
// Deploys: ACR (shared), Log Analytics, Container Apps Environment, PostgreSQL
// Container App is created via az CLI after image is built and pushed
// All resources are tagged with pr-number for cleanup

targetScope = 'resourceGroup'

@description('PR number for resource naming and tagging')
param prNumber string

@secure()
@description('PostgreSQL administrator password')
param postgresPassword string

@description('Azure region for resources')
param location string = resourceGroup().location

@description('Azure region for PostgreSQL (some subscriptions have region restrictions)')
param postgresLocation string = location

// Naming convention — all scoped to PR number
var suffix = 'pr${prNumber}'
var acrName = 'acrwebstorestaging'
var tags = {
  'pr-number': prNumber
  environment: 'staging'
  project: 'webstore'
}

// Container Registry (shared across PRs in staging RG)
resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: acrName
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
  }
  tags: {
    environment: 'staging'
    project: 'webstore'
  }
}

// Log Analytics Workspace
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: 'log-${suffix}'
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

// Container Apps Environment
resource containerAppsEnv 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: 'cae-${suffix}'
  location: location
  tags: tags
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
  }
}

// PostgreSQL Flexible Server
resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-03-01-preview' = {
  name: 'psql-${suffix}'
  location: postgresLocation
  tags: tags
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    version: '15'
    administratorLogin: 'webstoreAdmin'
    administratorLoginPassword: postgresPassword
    storage: {
      storageSizeGB: 32
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
  }
}

// PostgreSQL Database
resource postgresDb 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-03-01-preview' = {
  parent: postgresServer
  name: 'webstore'
  properties: {
    charset: 'UTF8'
    collation: 'en_US.utf8'
  }
}

// Firewall rule to allow Azure services
resource postgresFirewall 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2023-03-01-preview' = {
  parent: postgresServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// Outputs for workflow to use when creating Container App via az CLI
output acrLoginServer string = containerRegistry.properties.loginServer
output acrName string = containerRegistry.name
output containerAppsEnvironmentName string = containerAppsEnv.name
output containerAppsEnvironmentId string = containerAppsEnv.id
output containerAppsDefaultDomain string = containerAppsEnv.properties.defaultDomain
output postgresServerFqdn string = postgresServer.properties.fullyQualifiedDomainName
