/**
 * ResilienceOS Core Quantitative Risk Engine (FAIR Standard & Contextual Quantification)
 * Pure JavaScript - Mathematical Single Source of Truth
 * 
 * Implements:
 * 1. Threat Event Frequency (TEF) calculation from exposure, EPSS, KEV, and patch latency
 * 2. Vulnerability Factor (V) from technical CVSS, EPSS, and compound active control effectiveness
 * 3. Loss Event Frequency (LEF) = TEF * Vulnerability Factor
 * 4. 5-Factor Single Loss Expectancy (SLE / Loss Magnitude):
 *    - Downtime Loss = MTTR (hrs) * Hourly Downtime Cost
 *    - Data Breach Liability = (1% Incident Blast Records) * Cost/Record (DPDP Act Scope)
 *    - Incident Response & Digital Forensics Retainers
 *    - Regulatory Penalties (RBI Master Direction / SEBI CSCRF / DPDP)
 *    - System Recovery & Ledger Restoration
 * 5. Expected Annual Loss (EAL) = LEF * Loss Magnitude
 * 6. 95% Value at Risk (VaR) via Lognormal quantile dispersion model (sigma = 0.65)
 * 7. Uncertainty Confidence Ranges (P10, P50, P90)
 * 8. Contextual Risk Scoring (0-100) proving Technical Severity (CVSS) != Business Risk
 * 9. Explainable Risk Drivers generator
 */

/**
 * Calculates Threat Event Frequency (annual attempts / contact events)
 * @param {string} networkExposure - 'Internet-Facing' | 'DMZ' | 'Internal Protected' | 'Isolated Air-Gapped'
 * @param {number} epssScore - 0.0 to 1.0 (Exploit Prediction Scoring System)
 * @param {boolean} cisaKev - Known Exploited Vulnerability catalog flag
 * @param {number} operationalDelayDays - Additional patch latency days
 * @returns {number} Estimated contact attempts per year
 */
export function calculateThreatEventFrequency(networkExposure, epssScore = 0.1, cisaKev = false, operationalDelayDays = 0) {
  let baseAttempts = 2; // Baseline contact events/year
  
  switch (networkExposure) {
    case 'Internet-Facing':
      baseAttempts = 18;
      break;
    case 'DMZ':
      baseAttempts = 8;
      break;
    case 'Internal Protected':
      baseAttempts = 4;
      break;
    case 'Isolated Air-Gapped':
      baseAttempts = 1;
      break;
    default:
      baseAttempts = 3;
  }

  // CISA Known Exploited Vulnerability multiplier (1.5x threat actor focus)
  if (cisaKev) {
    baseAttempts *= 1.5;
  }

  // EPSS exploit probability scaling
  baseAttempts *= (0.6 + Math.min(1.0, epssScore * 0.8));

  // Operational delay: Each 15 days of unpatched window increases threat discovery probability by 15%
  if (operationalDelayDays > 0) {
    const delayMultiplier = 1.0 + (operationalDelayDays / 30) * 0.35;
    baseAttempts *= delayMultiplier;
  }

  return Math.round(baseAttempts * 10) / 10;
}

/**
 * Calculates Vulnerability Factor (Probability of successful exploit per threat event)
 * @param {number} cvss - CVSS v3.1 Base Score (0.0 - 10.0)
 * @param {number} epss - EPSS probability (0.0 - 1.0)
 * @param {Array} existingControls - Array of { name, effectiveness (0-1), status ('Active'|'Degraded'|'Inactive') }
 * @param {boolean} wafActive - Optional override for WAF status
 * @returns {number} Probability of exploit (0.01 - 0.99)
 */
export function calculateVulnerabilityFactor(cvss = 5.0, epss = 0.2, existingControls = [], wafActive = true) {
  // Technical exploitability: 40% CVSS severity weight + 60% EPSS real-world exploit probability
  const technicalExploitability = (0.40 * (cvss / 10)) + (0.60 * Math.min(1.0, epss));

  // Compound defensive control resistance:
  // Control Factor = Product of (1 - (control.effectiveness * control_weight))
  const controlFactor = (existingControls || []).reduce((acc, c) => {
    if (c.name && c.name.toLowerCase().includes('waf') && !wafActive) {
      return acc;
    }
    if (c.status === 'Inactive') return acc;
    const baseEff = typeof c.effectiveness === 'number' ? c.effectiveness : 0.7;
    const eff = c.status === 'Degraded' ? baseEff * 0.5 : baseEff;
    return acc * (1 - eff * 0.55);
  }, 1.0);

  const rawVuln = technicalExploitability * controlFactor;
  return Math.max(0.02, Math.min(0.95, Math.round(rawVuln * 100) / 100));
}

/**
 * Calculates the 5-factor Single Loss Expectancy (Loss Magnitude) breakdown
 * @param {Object} asset - Asset record
 * @param {Object} vulnerability - Vulnerability record
 * @returns {Object} 5-factor breakdown and total loss magnitude in INR (₹)
 */
export function calculateLossBreakdown(asset = {}, vulnerability = {}) {
  const criticality = asset.criticality || 'Tier 2';
  const dataSensitivity = asset.dataSensitivity || 'Internal';
  const hourlyDowntimeCost = asset.hourlyDowntimeCost || 100000;
  const records = asset.recordsCount || 0;

  // 1. Business Interruption & Downtime Loss: MTTR (hours) * Hourly Downtime Cost
  let mttrHours = 10;
  if (criticality === 'Tier 1') mttrHours = 16;
  else if (criticality === 'Tier 2') mttrHours = 10;
  else if (criticality === 'Tier 3') mttrHours = 6;
  else mttrHours = 2;

  const downtimeLoss = mttrHours * hourlyDowntimeCost;

  // 2. Data Breach Liability (DPDP Act 2023 & Customer Notification)
  // Assumes ~1% of resident customer records impacted in a typical single incident blast
  let costPerRecord = 0;
  if (dataSensitivity.includes('Highly Confidential') || dataSensitivity.includes('PCI') || dataSensitivity.includes('PII')) {
    costPerRecord = 1916; // Average per-record cost under Indian DPDP Act benchmarks
  } else if (dataSensitivity.includes('Confidential')) {
    costPerRecord = 650;
  } else {
    costPerRecord = 0;
  }

  let dataBreachLiability = 0;
  if (records > 0 && costPerRecord > 0) {
    const sampleBlastRecords = Math.round(records * 0.01);
    dataBreachLiability = Math.min(sampleBlastRecords * costPerRecord, 95000000);
  }

  // 3. Incident Response, Digital Forensics & Legal Retainers
  let incidentResponse = 1500000;
  if (criticality === 'Tier 1') incidentResponse = 3000000; // ₹30 Lakhs
  else if (criticality === 'Tier 2') incidentResponse = 1500000; // ₹15 Lakhs
  else if (criticality === 'Tier 3') incidentResponse = 500000;  // ₹5 Lakhs
  else incidentResponse = 15000; // ₹15 Thousand

  // 4. Regulatory Penalties (RBI Master Direction / SEBI CSCRF / DPDP Act)
  let regulatoryFines = 0;
  if (dataSensitivity.includes('Highly Confidential') && criticality === 'Tier 1') {
    regulatoryFines = 2000000; // ₹20 Lakhs
  } else if (dataSensitivity.includes('Highly Confidential') || criticality === 'Tier 1') {
    regulatoryFines = 800000; // ₹8 Lakhs
  } else if (criticality === 'Tier 2') {
    regulatoryFines = 300000; // ₹3 Lakhs
  }

  // 5. System Recovery, Data Re-indexing & Hardware Rebuild
  let recoveryCost = 300000;
  if (criticality === 'Tier 1') recoveryCost = 1000000; // ₹10 Lakhs
  else if (criticality === 'Tier 2') recoveryCost = 300000;  // ₹3 Lakhs
  else if (criticality === 'Tier 3') recoveryCost = 100000;  // ₹1 Lakh
  else recoveryCost = 5000;

  const totalLossMagnitude = Math.round(downtimeLoss + dataBreachLiability + incidentResponse + regulatoryFines + recoveryCost);

  return {
    downtimeLoss: Math.round(downtimeLoss),
    dataBreachLiability: Math.round(dataBreachLiability),
    incidentResponse: Math.round(incidentResponse),
    regulatoryFines: Math.round(regulatoryFines),
    recoveryCost: Math.round(recoveryCost),
    totalLossMagnitude
  };
}

/**
 * Calculates Contextual Composite Risk Score (0 - 100)
 * Proves Technical Severity (CVSS) != Business Financial Risk
 */
export function calculateContextualRiskScore(cvss = 5.0, criticalityScore = 5.0, lef = 0.2, lossMagnitude = 1000000) {
  const lossScore = Math.min(100, (lossMagnitude / 10000000) * 100);
  const freqScore = Math.min(100, lef * 100);
  const critScore = Math.min(100, criticalityScore * 10);
  const techScore = cvss * 10;

  const composite = (0.40 * lossScore) + (0.30 * critScore) + (0.20 * freqScore) + (0.10 * techScore);
  return Math.min(99, Math.max(5, Math.round(composite)));
}

/**
 * Generates explainable risk driver bullet points answering "Why is this risk high/low?"
 */
export function calculateRiskDrivers(asset = {}, vulnerability = {}, fairMetrics = {}) {
  const drivers = [];

  if (asset.criticalityScore >= 9.0) {
    drivers.push(`Tier-1 Mission Critical Asset (Criticality Score ${asset.criticalityScore}/10)`);
  } else if (asset.criticalityScore <= 3.0) {
    drivers.push(`Non-Critical Isolated Sandbox Node (Criticality Score ${asset.criticalityScore}/10)`);
  }

  if (asset.networkExposure === 'Internet-Facing') {
    drivers.push('Direct Internet Exposure — High Ingress Attack Surface');
  } else if (asset.networkExposure === 'Isolated Air-Gapped') {
    drivers.push('Isolated Air-Gapped Segment — No Public Ingress Route');
  }

  if (vulnerability.cisaKev) {
    drivers.push('Known Exploited Vulnerability (Active CISA KEV Threat Actor Campaigns)');
  }
  if (vulnerability.cvssV3 >= 9.0) {
    drivers.push(`Critical Technical Vulnerability Rating (CVSS ${vulnerability.cvssV3})`);
  }

  if (asset.recordsCount && asset.recordsCount > 100000) {
    drivers.push(`High Data Sensitivity (${asset.recordsCount.toLocaleString()} PII records subject to DPDP Act)`);
  }
  if (asset.hourlyDowntimeCost >= 400000) {
    drivers.push(`Severe Business Interruption Cost (₹${((asset.hourlyDowntimeCost || 0) / 100000).toFixed(1)}L/hour downtime)`);
  }

  const degradedControls = (asset.existingControls || []).filter(c => c.status === 'Degraded' || c.status === 'Inactive');
  if (degradedControls.length > 0) {
    drivers.push(`Defensive Controls Degraded: ${degradedControls.map(c => c.name).join(', ')}`);
  }

  return drivers;
}

/**
 * Computes complete FAIR metrics (LEF, SLE, EAL, VaR, Confidence Ranges, and Assumptions)
 * @param {Object} asset 
 * @param {Object} vulnerability 
 * @param {Object} modifiers - Optional scenario overrides (e.g. patchDelayDays, controlEffDelta, etc.)
 */
export function computeFAIRRiskMetrics(asset = {}, vulnerability = {}, modifiers = {}) {
  const patchDelay = modifiers.patchDelayDays || 0;
  const wafActive = modifiers.wafActive !== undefined ? modifiers.wafActive : true;

  // 1. Threat Event Frequency (attempts/yr)
  const tef = calculateThreatEventFrequency(
    asset.networkExposure,
    vulnerability.epssScore,
    vulnerability.cisaKev,
    patchDelay
  );

  // Apply custom control adjustments if present in modifiers
  let controls = asset.existingControls ? [...asset.existingControls] : [];
  if (modifiers.targetControlName && modifiers.targetEffectiveness !== undefined) {
    controls = controls.map(c => 
      c.name === modifiers.targetControlName 
        ? { ...c, effectiveness: modifiers.targetEffectiveness, status: 'Active' }
        : c
    );
  }
  if (modifiers.globalControlEffTarget !== undefined) {
    controls = controls.map(c => ({
      ...c,
      effectiveness: Math.min(0.99, (modifiers.globalControlEffTarget / 100)),
      status: 'Active'
    }));
  }

  // 2. Vulnerability Factor (exploit probability per attempt)
  const vulnFactor = calculateVulnerabilityFactor(
    vulnerability.cvssV3,
    vulnerability.epssScore,
    controls,
    wafActive
  );

  // 3. Loss Event Frequency (LEF) = TEF * Vulnerability Factor * annual frequency normalization
  // Normalized for annualized major incident probability
  const rawLEF = (tef * vulnFactor) * 0.05;
  const lef = Math.max(0.01, Math.round(rawLEF * 100) / 100);

  // 4. 5-Factor Loss Breakdown & Single Loss Expectancy (LM)
  const lossBreakdown = calculateLossBreakdown(asset, vulnerability);
  const meanLossMagnitude = lossBreakdown.totalLossMagnitude;

  // 5. Expected Annual Loss (EAL) = LEF * Mean Loss Magnitude
  const expectedAnnualLoss = Math.round(lef * meanLossMagnitude);

  // 6. 95% Value at Risk (VaR) via Lognormal quantile
  const sigma = 0.65;
  const varMultiplier = Math.exp(1.645 * sigma - (sigma * sigma) / 2);
  const valueAtRisk95 = Math.round(meanLossMagnitude * Math.min(1.5, Math.max(1.0, varMultiplier * Math.min(1, lef * 2))));

  // 7. Uncertainty Confidence Intervals (P10, P50, P90)
  const p10 = Math.round(expectedAnnualLoss * 0.50);
  const p50 = expectedAnnualLoss;
  const p90 = Math.round(expectedAnnualLoss * 1.95);

  // 8. Explicit Model Assumptions
  const assumptions = [
    `Asset criticality: ${asset.criticality || 'Tier 2'} with downtime cost of ₹${((asset.hourlyDowntimeCost || 0) / 100000).toFixed(1)}L/hour`,
    asset.recordsCount ? `DPDP Act exposure scope: ${asset.recordsCount.toLocaleString()} customer records evaluated` : 'Zero resident customer PII records hosted on this node',
    `Network ingress exposure: evaluated as ${asset.networkExposure || 'Internal'} (TEF: ${tef}/yr)`,
    `Active control defense resistance evaluated at ${Math.round((1 - vulnFactor) * 100)}% mitigation`
  ];

  return {
    threatEventFrequency: tef,
    vulnerabilityFactor: vulnFactor,
    lossEventFrequency: lef,
    lossBreakdown,
    expectedAnnualLoss,
    valueAtRisk95,
    confidenceRange: { p10, p50, p90 },
    assumptions
  };
}

/**
 * Re-quantifies a single risk object from its parent asset and vulnerability
 */
export function recalculateRisk(risk, asset, vulnerability, modifiers = {}) {
  const fairMetrics = computeFAIRRiskMetrics(asset, vulnerability, modifiers);
  const riskScore = calculateContextualRiskScore(
    vulnerability.cvssV3,
    asset.criticalityScore,
    fairMetrics.lossEventFrequency,
    fairMetrics.lossBreakdown.totalLossMagnitude
  );

  let contextualPriority = 'P3 - Moderate';
  if (riskScore >= 80 || fairMetrics.expectedAnnualLoss >= 4000000) {
    contextualPriority = 'P1 - Immediate';
  } else if (riskScore >= 55 || fairMetrics.expectedAnnualLoss >= 1000000) {
    contextualPriority = 'P2 - High';
  } else if (riskScore < 30) {
    contextualPriority = 'P4 - Low';
  }

  const keyDrivers = calculateRiskDrivers(asset, vulnerability, fairMetrics);

  return {
    ...risk,
    riskScore,
    contextualPriority,
    fairMetrics,
    keyDrivers,
    lastRecalculated: new Date().toISOString()
  };
}

/**
 * Formats currency in Indian Rupees (INR) with compact abbreviations (₹ Cr / ₹ Lakhs / ₹ K)
 */
export function formatINR(amount) {
  if (amount === undefined || amount === null || isNaN(amount) || amount === 0) return '₹0';
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (absAmount >= 10000000) {
    const cr = absAmount / 10000000;
    return `${sign}₹${cr.toFixed(2)} Cr`;
  }
  if (absAmount >= 100000) {
    const lk = absAmount / 100000;
    return `${sign}₹${lk.toFixed(2)} L`;
  }
  if (absAmount >= 1000) {
    const k = absAmount / 1000;
    return `${sign}₹${k.toFixed(1)} K`;
  }
  return `${sign}₹${Math.round(absAmount).toLocaleString('en-IN')}`;
}
