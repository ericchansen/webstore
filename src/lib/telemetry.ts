import { useAzureMonitor } from "@azure/monitor-opentelemetry";

let initialized = false;

export function initTelemetry() {
  if (initialized) return;

  const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
  if (!connectionString) {
    console.log(
      "Telemetry: APPLICATIONINSIGHTS_CONNECTION_STRING not set — skipping Application Insights"
    );
    return;
  }

  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- not a React hook; Azure SDK naming convention
    useAzureMonitor({
      azureMonitorExporterOptions: { connectionString },
    });
    initialized = true;
    console.log("Telemetry: Azure Monitor OpenTelemetry initialized");
  } catch (error) {
    console.error("Telemetry: Failed to initialize Azure Monitor —", error);
  }
}
