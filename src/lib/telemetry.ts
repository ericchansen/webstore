import { useAzureMonitor } from "@azure/monitor-opentelemetry";

let initialized = false;

export function initTelemetry() {
  if (initialized) return;
  initialized = true;

  const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
  if (!connectionString) {
    console.log(
      "Telemetry: APPLICATIONINSIGHTS_CONNECTION_STRING not set — skipping Application Insights"
    );
    return;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks -- not a React hook; Azure SDK naming convention
  useAzureMonitor({
    azureMonitorExporterOptions: { connectionString },
  });

  console.log("Telemetry: Azure Monitor OpenTelemetry initialized");
}
