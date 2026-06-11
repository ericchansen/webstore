// Main Bicep template for Webstore infrastructure
// Deploys: Container Apps Environment, Container App, PostgreSQL, Container Registry, Key Vault

targetScope = 'resourceGroup'

@description('Environment name (dev, prod)')
@allowed(['dev', 'prod'])
param environment string = 'dev'

@description('Azure region for resources')
param location string = resourceGroup().location

@description('Base name for resources')
param baseName string = 'webstore'

@description('PostgreSQL administrator login')
param postgresAdminLogin string = 'webstoreAdmin'

@secure()
@description('PostgreSQL administrator password')
param postgresAdminPassword string

@description('Container image to deploy (full path with tag)')
param containerImage string = ''

@description('Enable PostgreSQL private endpoint and private DNS integration.')
param enablePostgresPrivateEndpoint bool = environment == 'prod'

@description('Enable managed virtual network resources for Container Apps and private endpoint connectivity.')
param enableNetworkIsolation bool = environment == 'prod'

@description('Address space for the managed virtual network.')
param virtualNetworkAddressPrefix string = '10.50.0.0/16'

@description('CIDR for Container Apps infrastructure subnet. Must be /23 or larger.')
param containerAppsInfrastructureSubnetPrefix string = '10.50.0.0/23'

@description('CIDR for private endpoint subnet.')
param privateEndpointSubnetPrefix string = '10.50.2.0/27'

@description('PostgreSQL public network access mode.')
@allowed([
  'Enabled'
  'Disabled'
])
param postgresPublicNetworkAccess string = environment == 'prod' ? 'Disabled' : 'Enabled'

@description('Number of days before Key Vault-managed secrets expire.')
@minValue(1)
param secretValidityDays int = 90

@description('Maximum secret validity period (days) enforced via Azure Policy.')
@minValue(1)
param keyVaultMaxSecretValidityDays int = 90

@description('Deployment timestamp used for deterministic secret-expiry computation.')
param deploymentUtc string = utcNow('u')

// Naming convention
var resourceSuffix = '${baseName}-${environment}'
var acrName = replace('acr${baseName}${environment}', '-', '')
var kvUniqueSuffix = substring(uniqueString(resourceGroup().id), 0, 6)
var kvName = 'kv-${baseName}-${environment}-${kvUniqueSuffix}'
var deployManagedNetwork = enableNetworkIsolation || enablePostgresPrivateEndpoint
var postgresSecretExpirationEpoch = dateTimeToEpoch(dateTimeAdd(deploymentUtc, 'P${secretValidityDays}D'))
var commonTags = {
  environment: environment
  project: baseName
  managedBy: 'bicep'
}
var postgresOpsTags = union(commonTags, {
  CostControl: environment == 'prod' ? 'Ignore' : 'Managed'
  AvailabilityOwner: 'AzureNative'
})

// Log Analytics Workspace (required for Container Apps)
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: 'log-${resourceSuffix}'
  location: location
  tags: commonTags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

// Application Insights (backed by Log Analytics workspace)
resource applicationInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: 'appi-${resourceSuffix}'
  location: location
  kind: 'web'
  tags: commonTags
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
  }
}

// Container Registry
resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: acrName
  location: location
  tags: commonTags
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
  }
}

resource virtualNetwork 'Microsoft.Network/virtualNetworks@2023-09-01' = if (deployManagedNetwork) {
  name: 'vnet-${resourceSuffix}'
  location: location
  tags: commonTags
  properties: {
    addressSpace: {
      addressPrefixes: [
        virtualNetworkAddressPrefix
      ]
    }
  }
}

resource containerAppsInfrastructureSubnet 'Microsoft.Network/virtualNetworks/subnets@2023-09-01' = if (deployManagedNetwork) {
  parent: virtualNetwork
  name: 'snet-containerapps-infra'
  properties: {
    addressPrefix: containerAppsInfrastructureSubnetPrefix
    delegations: [
      {
        name: 'containerAppsDelegation'
        properties: {
          serviceName: 'Microsoft.App/environments'
        }
      }
    ]
  }
}

resource privateEndpointSubnet 'Microsoft.Network/virtualNetworks/subnets@2023-09-01' = if (deployManagedNetwork) {
  parent: virtualNetwork
  name: 'snet-private-endpoints'
  properties: {
    addressPrefix: privateEndpointSubnetPrefix
    privateEndpointNetworkPolicies: 'Disabled'
  }
}

// Container Apps Environment
resource containerAppsEnv 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: 'cae-${resourceSuffix}'
  location: location
  tags: commonTags
  properties: {
    ...union({
      appLogsConfiguration: {
        destination: 'log-analytics'
        logAnalyticsConfiguration: {
          customerId: logAnalytics.properties.customerId
          sharedKey: logAnalytics.listKeys().primarySharedKey
        }
      }
    }, deployManagedNetwork ? {
      vnetConfiguration: {
        infrastructureSubnetId: containerAppsInfrastructureSubnet.id
        internal: false
      }
    } : {})
  }
}

// PostgreSQL Flexible Server
resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-03-01-preview' = {
  name: 'psql-${resourceSuffix}'
  location: location
  tags: postgresOpsTags
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    version: '15'
    administratorLogin: postgresAdminLogin
    administratorLoginPassword: postgresAdminPassword
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

resource postgresPublicNetworkAccessConfiguration 'Microsoft.DBforPostgreSQL/flexibleServers/configurations@2023-03-01-preview' = {
  parent: postgresServer
  name: 'public_network_access'
  properties: {
    value: toLower(postgresPublicNetworkAccess)
    source: 'user-override'
  }
}

// Firewall rule to allow Azure services
resource postgresFirewall 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2023-03-01-preview' = if (postgresPublicNetworkAccess == 'Enabled') {
  parent: postgresServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

resource postgresPrivateDnsZone 'Microsoft.Network/privateDnsZones@2020-06-01' = if (enablePostgresPrivateEndpoint) {
  name: 'privatelink.postgres.database.azure.com'
  location: 'global'
  tags: commonTags
}

resource postgresPrivateDnsZoneLink 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2020-06-01' = if (enablePostgresPrivateEndpoint) {
  parent: postgresPrivateDnsZone
  name: 'link-vnet-${resourceSuffix}'
  location: 'global'
  properties: {
    virtualNetwork: {
      id: virtualNetwork.id
    }
    registrationEnabled: false
  }
}

resource postgresPrivateEndpoint 'Microsoft.Network/privateEndpoints@2023-09-01' = if (enablePostgresPrivateEndpoint) {
  name: 'pep-psql-${resourceSuffix}'
  location: location
  tags: commonTags
  properties: {
    subnet: {
      id: privateEndpointSubnet.id
    }
    privateLinkServiceConnections: [
      {
        name: 'postgresConnection'
        properties: {
          privateLinkServiceId: postgresServer.id
          groupIds: [
            'postgresqlServer'
          ]
        }
      }
    ]
  }
}

resource postgresPrivateDnsZoneGroup 'Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2023-09-01' = if (enablePostgresPrivateEndpoint) {
  parent: postgresPrivateEndpoint
  name: 'postgres-dns-zone-group'
  properties: {
    privateDnsZoneConfigs: [
      {
        name: 'postgres-zone-config'
        properties: {
          privateDnsZoneId: postgresPrivateDnsZone.id
        }
      }
    ]
  }
}

// Key Vault for secrets
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: kvName
  location: location
  tags: commonTags
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 7
  }
}

// Store database connection string in Key Vault
resource dbConnectionSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'DATABASE-URL'
  properties: {
    value: 'postgresql://${postgresAdminLogin}:${postgresAdminPassword}@${postgresServer.properties.fullyQualifiedDomainName}:5432/webstore?sslmode=require'
    attributes: {
      exp: postgresSecretExpirationEpoch
    }
  }
}

resource keyVaultSecretsExpiryPolicyAssignment 'Microsoft.Authorization/policyAssignments@2024-04-01' = {
  name: 'pa-kv-secrets-expiration-${resourceSuffix}'
  properties: {
    displayName: 'Key Vault secrets must have expiration'
    policyDefinitionId: subscriptionResourceId('Microsoft.Authorization/policyDefinitions', '98728c90-32c7-4049-8429-847dc0f4fe37')
    enforcementMode: 'Default'
  }
}

resource keyVaultSecretsValidityPolicyAssignment 'Microsoft.Authorization/policyAssignments@2024-04-01' = {
  name: 'pa-kv-secrets-validity-${resourceSuffix}'
  properties: {
    displayName: 'Key Vault secrets maximum validity period'
    policyDefinitionId: subscriptionResourceId('Microsoft.Authorization/policyDefinitions', '342e8053-e12e-4c44-be01-c3c2f318400f')
    enforcementMode: 'Default'
    parameters: {
      maximumValidityInDays: {
        value: keyVaultMaxSecretValidityDays
      }
    }
  }
}

// Container App (only deploy if image is provided)
resource containerApp 'Microsoft.App/containerApps@2023-05-01' = if (!empty(containerImage)) {
  name: 'ca-${resourceSuffix}'
  location: location
  properties: {
    managedEnvironmentId: containerAppsEnv.id
    configuration: {
      ingress: {
        external: true
        targetPort: 3000
        transport: 'http'
        allowInsecure: false
      }
      registries: [
        {
          server: containerRegistry.properties.loginServer
          username: containerRegistry.listCredentials().username
          passwordSecretRef: 'acr-password'
        }
      ]
      secrets: [
        {
          name: 'acr-password'
          value: containerRegistry.listCredentials().passwords[0].value
        }
        {
          name: 'database-url'
          value: 'postgresql://${postgresAdminLogin}:${postgresAdminPassword}@${postgresServer.properties.fullyQualifiedDomainName}:5432/webstore?sslmode=require'
        }
        {
          name: 'appinsights-connection-string'
          value: applicationInsights.properties.ConnectionString
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'webstore'
          image: containerImage
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            {
              name: 'DATABASE_URL'
              secretRef: 'database-url'
            }
            {
              name: 'NODE_ENV'
              value: 'production'
            }
            {
              name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
              secretRef: 'appinsights-connection-string'
            }
          ]
        }
      ]
      scale: {
        minReplicas: environment == 'prod' ? 1 : 0
        maxReplicas: environment == 'prod' ? 3 : 1
      }
    }
  }
}

// Outputs
output containerRegistryLoginServer string = containerRegistry.properties.loginServer
output containerRegistryName string = containerRegistry.name
output containerAppsEnvironmentId string = containerAppsEnv.id
output containerAppUrl string = !empty(containerImage) ? 'https://${containerApp!.properties.configuration.ingress.fqdn}' : ''
output postgresServerFqdn string = postgresServer.properties.fullyQualifiedDomainName
output keyVaultUri string = keyVault.properties.vaultUri
output applicationInsightsAppId string = applicationInsights.properties.AppId
output postgresPublicNetworkAccessMode string = postgresPublicNetworkAccess
output postgresPrivateEndpointEnabled bool = enablePostgresPrivateEndpoint
