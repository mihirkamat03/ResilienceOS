import {
  TELEMETRY_FEEDS_CONFIG,
  PRESET_TELEMETRY_EVENTS,
  processTelemetryEvent
} from '../../../src/core/telemetryEngine.js';
import { formatINR } from '../../../src/core/riskEngine.js';

import {
  INITIAL_ASSETS,
  INITIAL_VULNERABILITIES,
  INITIAL_RISKS,
  INITIAL_COMPLIANCE_CONTROLS,
  INITIAL_EVIDENCE_RECORDS
} from '../../../src/data/initialData.js';

/**
 * Authoritative Telemetry Ingestion Service
 */
export class TelemetryService {
  /**
   * Returns list of configured external SIEM/EDR/CSPM telemetry feeds
   */
  static getFeeds() {
    return TELEMETRY_FEEDS_CONFIG;
  }

  /**
   * Returns pre-configured telemetry event templates (Events A, B, C, D)
   */
  static getPresetEvents() {
    return PRESET_TELEMETRY_EVENTS;
  }

  /**
   * Processes an incoming telemetry event through the authoritative event processing pipeline
   * @param {Object} params - { eventKey?: string, event?: Object, state?: Object }
   */
  static ingestEvent(params = {}) {
    const { eventKey, event, state } = params;

    // Resolve event: either from key (e.g. EVENT_A_CRITICAL_VULN) or custom payload
    let targetEvent = event;
    if (!targetEvent && eventKey && PRESET_TELEMETRY_EVENTS[eventKey]) {
      targetEvent = PRESET_TELEMETRY_EVENTS[eventKey];
    }

    if (!targetEvent) {
      targetEvent = PRESET_TELEMETRY_EVENTS.EVENT_A_CRITICAL_VULN;
    }

    // Resolve state: use provided state or initialize from baseline
    const currentState = state && state.assets ? state : {
      assets: INITIAL_ASSETS,
      vulnerabilities: INITIAL_VULNERABILITIES,
      risks: INITIAL_RISKS,
      complianceControls: INITIAL_COMPLIANCE_CONTROLS,
      evidenceRecords: INITIAL_EVIDENCE_RECORDS,
      auditLogs: [],
      historicalSnapshots: []
    };

    const processingResult = processTelemetryEvent(targetEvent, currentState);

    return {
      processed: true,
      event: {
        id: targetEvent.id,
        title: targetEvent.title,
        category: targetEvent.category,
        sourceFeed: targetEvent.sourceFeed,
        affectedAssetId: targetEvent.affectedAssetId
      },
      deltaExposureINR: processingResult.deltaExposureINR,
      formattedDeltaExposure: formatINR(processingResult.deltaExposureINR),
      logDescription: processingResult.logDescription,
      affectedAsset: processingResult.updatedAssets.find(a => a.id === targetEvent.affectedAssetId),
      activeRisksCount: processingResult.updatedRisks.length,
      timestamp: new Date().toISOString()
    };
  }
}
