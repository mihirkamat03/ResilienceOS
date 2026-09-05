/**
 * ResilienceOS Telemetry Ingestion & Event Processing Engine
 * Pure JavaScript - Deterministic Business Logic Layer for Continuous Telemetry
 * 
 * Implements:
 * 1. Telemetry Feeds Configuration (Qualys VMDR, Splunk SIEM, Okta IAM, Wiz CSPM, CrowdStrike Falcon)
 * 2. 4 Deterministic Simulation Events (Event A: Critical Vuln, Event B: MFA Weakened, Event C: Vuln Patched, Event D: Exposure Drift)
 * 3. processTelemetryEvent(event, currentState) pipeline updating Assets, Vulnerabilities, Controls, Risks, Audit Logs, and Snapshots
 */

import { computeFAIRRiskMetrics, recalculateRisk, formatINR } from './riskEngine.js';

export const TELEMETRY_FEEDS_CONFIG = [
  {
    id: 'FEED-001',
    name: 'Qualys VMDR Infrastructure Scanner',
    type: 'Vulnerability Scanner',
    vendor: 'Qualys Inc.',
    lastSync: '1 minute ago',
    recordsIngested: 2514,
    status: 'Healthy',
    dataFreshnessMinutes: 1,
    activeFindingsCount: 4,
    sourceDescription: 'Continuous agentless host & container image vulnerability assessment'
  },
  {
    id: 'FEED-002',
    name: 'Wiz Cloud Security Posture (CSPM)',
    type: 'Cloud Posture (CSPM)',
    vendor: 'Wiz.io',
    lastSync: '8 minutes ago',
    recordsIngested: 962,
    status: 'Healthy',
    dataFreshnessMinutes: 8,
    activeFindingsCount: 2,
    sourceDescription: 'Agentless AWS VPC network path analysis and IAM entitlement drift'
  },
  {
    id: 'FEED-003',
    name: 'Okta Identity Cloud & AD Telemetry',
    type: 'Identity & IAM',
    vendor: 'Okta Identity',
    lastSync: '30 seconds ago',
    recordsIngested: 5180,
    status: 'Healthy',
    dataFreshnessMinutes: 1,
    activeFindingsCount: 1,
    sourceDescription: 'Real-time adaptive authentication, MFA step-up logs, and token issuance'
  },
  {
    id: 'FEED-004',
    name: 'Splunk Enterprise Security SIEM',
    type: 'SIEM / XDR',
    vendor: 'Splunk Inc.',
    lastSync: '15 seconds ago',
    recordsIngested: 152400,
    status: 'Healthy',
    dataFreshnessMinutes: 1,
    activeFindingsCount: 3,
    sourceDescription: 'Central correlation engine analyzing perimeter firewall and audit logs'
  }
];

export const PRESET_TELEMETRY_EVENTS = {
  EVENT_A_CRITICAL_VULN: {
    id: 'EVT-CRITICAL-VULN',
    title: 'Critical Vulnerability Detected (CVE-2024-4577)',
    sourceFeed: 'Qualys VMDR',
    category: 'VULNERABILITY_DISCOVERY',
    affectedAssetId: 'AST-API-01',
    description: 'Qualys scanner detected Apache PHP-CGI Argument Injection RCE (CVSS 9.8, CISA KEV active) on Payment Gateway ingress.',
    payload: {
      vulnId: 'VULN-2024-4577',
      cveId: 'CVE-2024-4577',
      title: 'Apache PHP-CGI Argument Injection Remote Code Execution',
      cvssV3: 9.8,
      epssScore: 0.89,
      cisaKev: true,
      vector: 'Network / Zero Complexity / Unauthenticated'
    }
  },
  EVENT_B_MFA_DEGRADED: {
    id: 'EVT-MFA-DEGRADED',
    title: 'Privileged MFA Enforcement Weakened',
    sourceFeed: 'Okta Identity Cloud',
    category: 'CONTROL_DEGRADATION',
    affectedAssetId: 'AST-GW-01',
    description: 'Okta flagged anomalous legacy protocol bypass disabling hardware FIDO2 MFA enforcement on PAN-OS VPN Gateway.',
    payload: {
      controlName: 'FIDO2 Multi-Factor Authentication',
      newStatus: 'Degraded',
      newEffectiveness: 0.25
    }
  },
  EVENT_C_VULN_PATCHED: {
    id: 'EVT-VULN-PATCHED',
    title: 'Critical Vulnerability Remediated (PAN-OS Hotfix Verified)',
    sourceFeed: 'Qualys VMDR',
    category: 'VULNERABILITY_PATCHED',
    affectedAssetId: 'AST-GW-01',
    description: 'Automated post-patch rescan confirmed Palo Alto PAN-OS 11.1.2 hotfix applied; CVE-2024-3400 is no longer exploitable.',
    payload: {
      targetRiskId: 'RSK-003',
      vulnId: 'VULN-2024-3400'
    }
  },
  EVENT_D_INTERNET_EXPOSURE_DRIFT: {
    id: 'EVT-EXPOSURE-DRIFT',
    title: 'New Internet Ingress Exposure Detected',
    sourceFeed: 'Wiz CSPM',
    category: 'CONFIGURATION_DRIFT',
    affectedAssetId: 'AST-K8S-01',
    description: 'Wiz CSPM identified AWS Security Group drift: EKS worker node ingress port 6443 opened directly to 0.0.0.0/0.',
    payload: {
      newNetworkExposure: 'Internet-Facing'
    }
  }
};

/**
 * Deterministic Event Processing Pipeline
 * @param {Object} event - One of PRESET_TELEMETRY_EVENTS or custom event
 * @param {Object} state - Current store state { assets, vulnerabilities, risks, remediations, auditLogs, historicalSnapshots }
 * @returns {Object} Updated state objects, audit log, historical snapshot, and delta exposure
 */
export function processTelemetryEvent(event, state) {
  const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST';
  const nowDate = new Date().toISOString().split('T')[0];

  let updatedAssets = [...state.assets];
  let updatedVulnerabilities = [...state.vulnerabilities];
  let updatedRisks = [...state.risks];
  let updatedControls = state.unifiedControls ? [...state.unifiedControls] : (state.complianceControls ? [...state.complianceControls] : []);
  let updatedEvidence = state.evidenceRecords ? [...state.evidenceRecords] : [];
  let deltaExposureINR = 0;
  let logDescription = '';

  const assetId = event.affectedAssetId;
  const targetAsset = updatedAssets.find(a => a.id === assetId);

  switch (event.category) {
    case 'VULNERABILITY_DISCOVERY': {
      const payload = event.payload;
      const existingVulnIndex = updatedVulnerabilities.findIndex(v => v.cveId === payload.cveId);

      const newVuln = {
        id: payload.vulnId || `VULN-${Date.now().toString().slice(-4)}`,
        cveId: payload.cveId,
        title: payload.title,
        assetId: assetId,
        cvssV3: payload.cvssV3,
        epssScore: payload.epssScore,
        cisaKev: payload.cisaKev,
        vector: payload.vector,
        discoveredDate: nowDate,
        sourceFeed: event.sourceFeed,
        status: 'Active'
      };

      if (existingVulnIndex >= 0) {
        updatedVulnerabilities[existingVulnIndex] = newVuln;
      } else {
        updatedVulnerabilities = [newVuln, ...updatedVulnerabilities];
      }

      // Update Asset vuln count
      updatedAssets = updatedAssets.map(a =>
        a.id === assetId
          ? { ...a, activeVulnerabilitiesCount: a.activeVulnerabilitiesCount + 1 }
          : a
      );

      // Quantify New FAIR Risk
      const refreshedAsset = updatedAssets.find(a => a.id === assetId);
      const fairMetrics = computeFAIRRiskMetrics(refreshedAsset, newVuln);

      const newRisk = {
        id: `RSK-${payload.cveId.replace(/[^a-zA-Z0-9]/g, '')}`,
        title: `Payment API RCE via ${payload.cveId}`,
        vulnId: newVuln.id,
        assetId: assetId,
        technicalSeverity: payload.cvssV3 >= 9.0 ? 'CRITICAL' : 'HIGH',
        contextualPriority: 'P1 - Immediate',
        riskScore: 91,
        fairMetrics,
        status: 'Open',
        keyDrivers: [
          `New high-severity telemetry alert from ${event.sourceFeed}`,
          `Known Exploited Vulnerability (CISA KEV active)`,
          `Direct upstream route to Core Banking PostgreSQL`
        ],
        recommendedActionId: 'INV-002'
      };

      updatedRisks = [newRisk, ...updatedRisks];
      deltaExposureINR = fairMetrics.expectedAnnualLoss;
      logDescription = `Ingested ${payload.cveId} on ${refreshedAsset.name}. Risk quantified: +${formatINR(deltaExposureINR)} EAL.`;

      // Update Patching Control
      updatedControls = updatedControls.map(c =>
        c.id === 'CTRL-PATCH-01'
          ? { ...c, status: 'Partially Implemented', evidenceStatus: 'Pending Review' }
          : c
      );
      break;
    }

    case 'CONTROL_DEGRADATION': {
      const payload = event.payload;
      updatedAssets = updatedAssets.map(a => {
        if (a.id === assetId) {
          const controls = a.existingControls.map(c =>
            c.name.includes('Multi-Factor') || c.name === payload.controlName
              ? { ...c, status: payload.newStatus, effectiveness: payload.newEffectiveness }
              : c
          );
          return { ...a, existingControls: controls };
        }
        return a;
      });

      const refreshedAsset = updatedAssets.find(a => a.id === assetId);

      // Recalculate affected risks
      let oldEALSum = 0;
      let newEALSum = 0;

      updatedRisks = updatedRisks.map(r => {
        if (r.assetId === assetId && r.status !== 'Remediated') {
          oldEALSum += r.fairMetrics.expectedAnnualLoss;
          const vuln = updatedVulnerabilities.find(v => v.id === r.vulnId) || {};
          const recalculated = recalculateRisk(r, refreshedAsset, vuln);
          newEALSum += recalculated.fairMetrics.expectedAnnualLoss;
          return recalculated;
        }
        return r;
      });

      deltaExposureINR = newEALSum - oldEALSum;
      logDescription = `Okta IAM: MFA degraded on ${refreshedAsset.name}. Vulnerability factor rose. Exposure changed by +${formatINR(deltaExposureINR)}.`;

      // Synchronize Unified Compliance Control & Evidence
      updatedControls = updatedControls.map(c =>
        c.id === 'CTRL-MFA-01'
          ? { ...c, status: 'Partially Implemented', evidenceStatus: 'Pending Review' }
          : c
      );
      updatedEvidence = updatedEvidence.map(e =>
        e.controlId === 'CTRL-MFA-01'
          ? { ...e, status: 'Pending Review', description: 'Okta anomaly flagged legacy protocol bypass; review required.' }
          : e
      );
      break;
    }

    case 'VULNERABILITY_PATCHED': {
      const payload = event.payload;
      let reducedAmount = 0;

      updatedRisks = updatedRisks.map(r => {
        if (r.id === payload.targetRiskId || r.vulnId === payload.vulnId) {
          reducedAmount = r.fairMetrics.expectedAnnualLoss;
          return {
            ...r,
            status: 'Remediated',
            riskScore: 10,
            fairMetrics: {
              ...r.fairMetrics,
              expectedAnnualLoss: 0,
              valueAtRisk95: 0,
              lossEventFrequency: 0.01
            }
          };
        }
        return r;
      });

      updatedAssets = updatedAssets.map(a =>
        a.id === assetId
          ? {
              ...a,
              activeVulnerabilitiesCount: Math.max(0, a.activeVulnerabilitiesCount - 1),
              financialExposure: Math.max(0, a.financialExposure - reducedAmount)
            }
          : a
      );

      deltaExposureINR = -reducedAmount;
      logDescription = `Qualys VMDR verified PAN-OS hotfix on ${targetAsset ? targetAsset.name : assetId}. Risk eliminated: -${formatINR(reducedAmount)}.`;

      // Synchronize Unified Compliance Control & Evidence
      updatedControls = updatedControls.map(c =>
        c.id === 'CTRL-PATCH-01'
          ? { ...c, status: 'Implemented', evidenceStatus: 'Verified' }
          : c
      );
      updatedEvidence = updatedEvidence.map(e =>
        e.controlId === 'CTRL-PATCH-01'
          ? { ...e, status: 'Verified', description: 'Qualys rescan report verified CVE-2024-3400 remediated.' }
          : e
      );
      break;
    }

    case 'CONFIGURATION_DRIFT': {
      const payload = event.payload;
      updatedAssets = updatedAssets.map(a =>
        a.id === assetId
          ? { ...a, networkExposure: payload.newNetworkExposure }
          : a
      );

      const refreshedAsset = updatedAssets.find(a => a.id === assetId);

      let oldEAL = 0;
      let newEAL = 0;

      updatedRisks = updatedRisks.map(r => {
        if (r.assetId === assetId && r.status !== 'Remediated') {
          oldEAL += r.fairMetrics.expectedAnnualLoss;
          const vuln = updatedVulnerabilities.find(v => v.id === r.vulnId) || {};
          const recalculated = recalculateRisk(r, refreshedAsset, vuln);
          newEAL += recalculated.fairMetrics.expectedAnnualLoss;
          return recalculated;
        }
        return r;
      });

      deltaExposureINR = newEAL - oldEAL;
      logDescription = `Wiz CSPM detected internet exposure on ${refreshedAsset.name}. TEF jumped to 20/yr. Exposure changed by +${formatINR(deltaExposureINR)}.`;

      // Synchronize Unified Segmentation Control
      updatedControls = updatedControls.map(c =>
        c.id === 'CTRL-SEG-01'
          ? { ...c, status: 'Partially Implemented', evidenceStatus: 'Pending Review' }
          : c
      );
      break;
    }

    default:
      logDescription = event.description || 'Simulated telemetry event parsed.';
  }

  // Calculate new total portfolio exposure
  const newTotalEAL = updatedRisks
    .filter(r => r.status !== 'Remediated')
    .reduce((sum, r) => sum + (r.fairMetrics ? r.fairMetrics.expectedAnnualLoss : 0), 0);

  const newSnapshot = {
    month: `Today, ${nowTime}`,
    exposureCr: Math.round((newTotalEAL / 10000000) * 100) / 100,
    event: event.title,
    timestamp: new Date().toISOString()
  };

  const newAuditLog = {
    id: `AUD-${Date.now()}`,
    timestamp: `Today, ${nowTime}`,
    type: event.category,
    description: logDescription,
    deltaExposureINR
  };

  return {
    updatedAssets,
    updatedVulnerabilities,
    updatedRisks,
    updatedControls,
    updatedEvidence,
    newAuditLog,
    newSnapshot,
    deltaExposureINR,
    nowTime
  };
}
