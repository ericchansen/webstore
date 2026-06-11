using './main.bicep'

param environment = 'dev'
param baseName = 'webstore'
param postgresAdminLogin = 'webstoreAdmin'
param enablePostgresPrivateEndpoint = false
param enableNetworkIsolation = false
param postgresPublicNetworkAccess = 'Enabled'
param secretValidityDays = 90
param keyVaultMaxSecretValidityDays = 90
// postgresAdminPassword must be provided at deployment time
// param containerImage = '' // Omit for initial infra deployment
