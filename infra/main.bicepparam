using './main.bicep'

param environment = 'dev'
param baseName = 'webstore'
param postgresAdminLogin = 'webstoreAdmin'
// postgresAdminPassword must be provided at deployment time
// param containerImage = '' // Omit for initial infra deployment
