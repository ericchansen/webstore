/* eslint-disable @typescript-eslint/no-require-imports, react-hooks/rules-of-hooks */
// Preload script — initializes Azure Monitor OpenTelemetry before the Next.js server starts.
// Loaded via: node --require ./telemetry-preload.js server.js
const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
if (connectionString) {
  try {
    const { useAzureMonitor } = require("@azure/monitor-opentelemetry");
    useAzureMonitor({
      azureMonitorExporterOptions: { connectionString },
    });
    console.log("Telemetry: Azure Monitor OpenTelemetry initialized");
  } catch (error) {
    console.error("Telemetry: Failed to initialize Azure Monitor —", error);
  }
} else {
  console.log(
    "Telemetry: APPLICATIONINSIGHTS_CONNECTION_STRING not set — skipping"
  );
}
