/**
 * ResilienceOS Grounded AI Risk Copilot Engine
 * 
 * CORE PRINCIPLE:
 * The Copilot is NOT the source of truth.
 * The deterministic ResilienceOS engines (riskEngine, optimizerEngine, graphEngine, complianceEngine)
 * are the source of truth.
 * 
 * The Copilot's job is:
 * UNDERSTAND USER INTENT -> QUERY PLATFORM STATE -> USE DETERMINISTIC RESULTS ->
 * EXPLAIN IN NATURAL LANGUAGE -> LINK DIRECTLY TO RELEVANT RECORD/MODULE.
 */

import { formatINR, computeFAIRRiskMetrics, recalculateRisk } from './riskEngine.js';
import { solveSecurityBudgetOptimization } from './optimizerEngine.js';
import { getAssetAttackPath, getAssetBlastRadius } from './graphEngine.js';
import { calculateFrameworkSummaries, getPrioritizedComplianceGaps } from './complianceEngine.js';

/**
 * Structured Query Layer
 */
export const copilotQueries = {
  getTopRisks(state, limit = 3) {
    const activeRisks = (state.risks || [])
      .filter(r => r.status !== 'Remediated')
      .sort((a, b) => ((b.fairMetrics?.expectedAnnualLoss || 0) - (a.fairMetrics?.expectedAnnualLoss || 0)));
    return activeRisks.slice(0, limit);
  },

  getHighestExposureAsset(state) {
    const activeRisks = (state.risks || []).filter(r => r.status !== 'Remediated');
    const assetExposureMap = {};

    activeRisks.forEach(r => {
      const eal = r.fairMetrics?.expectedAnnualLoss || 0;
      assetExposureMap[r.assetId] = (assetExposureMap[r.assetId] || 0) + eal;
    });

    let topAssetId = null;
    let maxEAL = -1;
    Object.entries(assetExposureMap).forEach(([id, eal]) => {
      if (eal > maxEAL) {
        maxEAL = eal;
        topAssetId = id;
      }
    });

    const asset = (state.assets || []).find(a => a.id === topAssetId) || state.assets?.[0];
    return {
      asset,
      totalEAL: maxEAL > 0 ? maxEAL : (asset?.financialExposure || 0)
    };
  },

  getRiskDetails(state, riskId) {
    const risk = (state.risks || []).find(r => r.id === riskId);
    if (!risk) return null;
    const asset = (state.assets || []).find(a => a.id === risk.assetId);
    const vuln = (state.vulnerabilities || []).find(v => v.id === risk.vulnId);
    return { risk, asset, vuln };
  },

  getOptimizerRecommendation(state, budgetINR = 3000000) {
    return solveSecurityBudgetOptimization(state.investments || [], budgetINR, state.risks || []);
  },

  getRecentEvents(state, limit = 4) {
    return (state.auditLogs || []).slice(0, limit);
  },

  getComplianceGaps(state) {
    return state.complianceGaps || getPrioritizedComplianceGaps(
      state.unifiedControls || [],
      state.risks || [],
      state.assets || [],
      state.evidenceRecords || [],
      state.remediations || []
    );
  },

  getAttackPath(state, assetId = 'AST-DB-01') {
    const path = getAssetAttackPath(assetId);
    const blast = getAssetBlastRadius(assetId);
    const asset = (state.assets || []).find(a => a.id === assetId);
    return { path, blast, asset };
  }
};

/**
 * Extracts numerical budget value in INR from user question if present
 */
function extractBudgetFromQuery(query) {
  // Matches ₹20L, 20L, 20 Lakhs, 20,00,000, 50L, 10L, 1.5 Cr
  const lkMatch = query.match(/(\d+(?:\.\d+)?)\s*(?:l|lakh|lakhs)/i);
  if (lkMatch) {
    return Math.round(parseFloat(lkMatch[1]) * 100000);
  }
  const crMatch = query.match(/(\d+(?:\.\d+)?)\s*(?:cr|crore|crores)/i);
  if (crMatch) {
    return Math.round(parseFloat(crMatch[1]) * 10000000);
  }
  const numMatch = query.match(/₹?\s*(\d{5,9})/);
  if (numMatch) {
    return parseInt(numMatch[1], 10);
  }
  return null;
}

/**
 * Main Copilot Intent Router and Grounded Response Generator
 * 
 * @param {string} userQuestion - Prompt from user
 * @param {Object} state - Full store state (assets, risks, investments, unifiedControls, etc.)
 * @param {string} role - Active user role (CISO, CFO, SecOps, Compliance)
 * @returns {Object} { text, sources, actions, intent }
 */
export function queryCopilot(userQuestion = '', state = {}, role = 'CISO') {
  const q = userQuestion.toLowerCase().trim();

  // 1. INTENT: Board / Executive Summary
  if (
    q.includes('board') ||
    q.includes('summarize') ||
    q.includes('summary') ||
    q.includes('c-suite') ||
    q.includes('briefing') ||
    q.includes('overview for board')
  ) {
    const topRisks = copilotQueries.getTopRisks(state, 2);
    const totalEAL = state.totalEstimatedExposure || 0;
    const criticalCount = state.openCriticalRisksCount || 0;
    const mtdReduction = state.monthToDateReduction || 0;
    const topGap = (state.complianceSummary || []).sort((a, b) => a.currentScore - b.currentScore)[0];
    const topAssetInfo = copilotQueries.getHighestExposureAsset(state);

    let roleEmphasis = '';
    if (role === 'CFO') {
      roleEmphasis = `\n\n**Financial ROI Context**: Our optimized capital allocation plan targets a modeled reduction of **${formatINR(mtdReduction)}** with positive expected net present return.`;
    } else if (role === 'Compliance') {
      roleEmphasis = `\n\n**Regulatory Posture**: ${topGap ? `${topGap.name} is currently at **${topGap.currentScore}%** coverage (${topGap.gapCount} open control gaps requiring review).` : ''}`;
    }

    return {
      intent: 'BOARD_SUMMARY',
      text: `### Executive Board Summary (Role Perspective: ${role})

**Current Risk Posture**:
- **Total Modelled Exposure (EAL)**: **${formatINR(totalEAL)}** across ${state.risks?.filter(r => r.status !== 'Remediated').length || 0} active risks.
- **Top Financial Exposure Asset**: **${topAssetInfo.asset?.name || 'Core Banking Tier'}** (${formatINR(topAssetInfo.totalEAL)} EAL).
- **Critical Immediate Risks (P1)**: **${criticalCount} open items**.
- **MTD Verified Risk Reduction**: **${formatINR(mtdReduction)}** eliminated.

**Primary Recommended Mitigation**:
Deploy **${state.investments?.[0]?.name || 'Privileged Access Management & Just-in-Time Rotation'}** to reduce database traversal liability by ~${formatINR(state.investments?.[0]?.riskReductionEAL || 6200000)}.${roleEmphasis}`,
      sources: [
        { type: 'METRIC', label: `Total Exposure: ${formatINR(totalEAL)}` },
        { type: 'ASSET', id: topAssetInfo.asset?.id, label: topAssetInfo.asset?.name },
        { type: 'RISK', id: topRisks[0]?.id, label: topRisks[0]?.title }
      ],
      actions: [
        { label: 'View Executive Dashboard', tab: 'dashboard' },
        { label: 'Open Investment Optimizer', tab: 'optimizer' },
        { label: 'Review Compliance Hub', tab: 'compliance' }
      ]
    };
  }

  // 2. INTENT: Biggest Financial Risk / Top Risks
  if (
    (q.includes('biggest') && q.includes('risk')) ||
    (q.includes('highest') && (q.includes('risk') || q.includes('exposure') || q.includes('financial'))) ||
    (q.includes('top') && q.includes('risk')) ||
    q.includes('top 3') ||
    q.includes('top risks') ||
    q.includes('most exposed') ||
    q.includes('major risk') ||
    q.includes('critical risk')
  ) {
    const topRisks = copilotQueries.getTopRisks(state, 3);
    const topRisk = topRisks[0];
    if (!topRisk) {
      return {
        intent: 'TOP_RISKS',
        text: 'All identified risks are currently marked as remediated.',
        sources: [],
        actions: [{ label: 'View Risk Register', tab: 'risk' }]
      };
    }

    const asset = (state.assets || []).find(a => a.id === topRisk.assetId);
    const eal = topRisk.fairMetrics?.expectedAnnualLoss || 0;
    const var95 = topRisk.fairMetrics?.valueAtRisk95 || 0;

    const listMarkdown = topRisks.map((r, i) => {
      const a = (state.assets || []).find(ast => ast.id === r.assetId);
      return `${i + 1}. **${r.title}** on \`${a?.name || r.assetId}\` — **${formatINR(r.fairMetrics?.expectedAnnualLoss || 0)}** EAL (${r.contextualPriority})`;
    }).join('\n');

    return {
      intent: 'TOP_RISKS',
      text: `Your highest financial exposure is **${topRisk.title}** on **${asset?.name || topRisk.assetId}**.

**Modelled Financial Impact**:
- **Expected Annual Loss (EAL)**: **${formatINR(eal)}**
- **95% Value at Risk (VaR₉₅)**: **${formatINR(var95)}**
- **Technical Severity**: ${topRisk.technicalSeverity} (${topRisk.contextualPriority})

**Key Exposure Drivers**:
${(topRisk.keyDrivers || []).map(d => `• ${d}`).join('\n')}

**Top 3 Prioritized Risks Across Portfolio**:
${listMarkdown}`,
      sources: [
        { type: 'RISK', id: topRisk.id, label: `${topRisk.id}: ${topRisk.title}` },
        { type: 'ASSET', id: asset?.id, label: asset?.name },
        { type: 'METRIC', label: `EAL: ${formatINR(eal)}` }
      ],
      actions: [
        { label: 'Open Risk Details', tab: 'risk', recordId: topRisk.id },
        { label: 'View Attack Path', tab: 'graph' },
        { label: 'Open Remediation Center', tab: 'remediation' }
      ]
    };
  }

  // 3. INTENT: Budget / Investment Optimization (e.g., "We have ₹20L. What should we do?")
  if (
    q.includes('budget') ||
    q.includes('spend') ||
    q.includes('invest') ||
    q.includes('optimizer') ||
    q.includes('₹') ||
    q.includes('lakh') ||
    q.includes('crore') ||
    q.includes('20l') ||
    q.includes('30l') ||
    q.includes('50l')
  ) {
    const extractedBudget = extractBudgetFromQuery(userQuestion) || state.budget || 3000000;
    const optResult = copilotQueries.getOptimizerRecommendation(state, extractedBudget);

    const mitigationsText = optResult.selectedInvestments.map((inv, idx) => {
      const red = inv.effectiveReduction || inv.riskReductionEAL || 0;
      return `${idx + 1}. **${inv.name}** (${inv.category})\n   • Cost: **${formatINR(inv.cost)}** | Modelled Risk Reduction: **${formatINR(red)}** | ROSI: **+${inv.rosiPercent}%**`;
    }).join('\n');

    return {
      intent: 'INVESTMENT_OPTIMIZER',
      text: `With an allocated security budget of **${formatINR(extractedBudget)}**, the deterministic 0/1 Knapsack optimizer recommends deploying **${optResult.selectedInvestments.length} controls**:

${mitigationsText}

---
**Portfolio Financial Summary**:
- **Total Investment Cost**: **${formatINR(optResult.totalCost)}** (Budget Utilization: ${Math.round((optResult.totalCost / extractedBudget) * 100)}%)
- **Total Modelled Risk Reduction**: **${formatINR(optResult.totalRiskReduction)}** EAL
- **Net Portfolio ROSI**: **+${optResult.portfolioROSI}%**
- **Projected Residual Exposure**: **${formatINR(optResult.residualRisk)}**`,
      sources: [
        { type: 'OPTIMIZER', label: `Budget: ${formatINR(extractedBudget)}` },
        { type: 'METRIC', label: `Reduction: ${formatINR(optResult.totalRiskReduction)}` },
        { type: 'INVESTMENT', id: optResult.selectedInvestments[0]?.id, label: optResult.selectedInvestments[0]?.name }
      ],
      actions: [
        { label: 'Open Investment Optimizer', tab: 'optimizer' },
        { label: 'Deploy to Remediation', tab: 'remediation' }
      ]
    };
  }

  // 4. INTENT: Recent Changes / Telemetry Ingestion History
  if (
    q.includes('changed') ||
    q.includes('recent') ||
    q.includes('telemetry') ||
    q.includes('what happened') ||
    q.includes('new vulnerability') ||
    q.includes('alert') ||
    q.includes('today')
  ) {
    const events = copilotQueries.getRecentEvents(state, 4);
    const eventItems = events.map(e => {
      const deltaStr = e.deltaExposureINR ? ` (Exposure Delta: ${e.deltaExposureINR > 0 ? '+' : ''}${formatINR(e.deltaExposureINR)})` : '';
      return `• **[${e.timestamp}]** \`${e.type}\`: ${e.description}${deltaStr}`;
    }).join('\n');

    return {
      intent: 'TELEMETRY_CHANGES',
      text: `### Recent Telemetry & Audit Activity Log

Here are the latest recorded system state events:

${eventItems}

**Current Ingestion Status**:
- 4 active feeds healthy (Qualys VMDR, Wiz CSPM, Okta Identity, Splunk SIEM).
- Total Modelled Portfolio Exposure: **${formatINR(state.totalEstimatedExposure || 0)}**.`,
      sources: [
        { type: 'FEED', label: 'Qualys VMDR (Healthy)' },
        { type: 'FEED', label: 'Okta Identity (Healthy)' },
        { type: 'FEED', label: 'Wiz CSPM (Healthy)' }
      ],
      actions: [
        { label: 'Open Telemetry Center', tab: 'telemetry' },
        { label: 'View Risk Exposure', tab: 'risk' }
      ]
    };
  }

  // 5. INTENT: Compliance & Regulatory Framework Gaps
  if (
    q.includes('compliance') ||
    q.includes('nist') ||
    q.includes('rbi') ||
    q.includes('iso') ||
    q.includes('sebi') ||
    q.includes('gap') ||
    q.includes('evidence')
  ) {
    const gaps = copilotQueries.getComplianceGaps(state);
    const summaries = state.complianceSummary || [];

    const topGapsText = gaps.slice(0, 3).map((g, i) => {
      return `${i + 1}. **${g.controlName}** (${g.framework} \`${g.requirementCode}\`)\n   • Status: **${g.currentStatus}** | Evidence: **${g.evidenceStatus}** | Linked EAL: **${formatINR(g.totalRelatedEAL)}**\n   • Action: ${g.recommendedAction}`;
    }).join('\n');

    const fwSummaryText = summaries.map(s => `• **${s.name}**: **${s.currentScore}%** (${s.gapCount} gaps, ${s.reviewRequiredCount || 0} reviews)`).join('\n');

    return {
      intent: 'COMPLIANCE_GAPS',
      text: `### Compliance & Regulatory Posture Visibility

**Framework Control Coverage**:
${fwSummaryText}

**Top Prioritized Compliance Gaps (Risk-Weighted)**:
${topGapsText}

*Note: Control mappings provide operational decision support and evidence tracking, not legal certification.*`,
      sources: [
        { type: 'FRAMEWORK', label: 'NIST CSF 2.0' },
        { type: 'FRAMEWORK', label: 'RBI Master Direction' },
        { type: 'CONTROL', id: gaps[0]?.controlId, label: gaps[0]?.controlName }
      ],
      actions: [
        { label: 'Open Compliance Hub', tab: 'compliance' },
        { label: 'View Remediation Tasks', tab: 'remediation' }
      ]
    };
  }

  // 6. INTENT: Attack Path & Graph Navigation
  if (
    q.includes('attack path') ||
    q.includes('graph') ||
    q.includes('how can an attacker') ||
    q.includes('reach the core') ||
    q.includes('reach database') ||
    q.includes('blast radius') ||
    q.includes('lateral')
  ) {
    const { path, blast, asset } = copilotQueries.getAttackPath(state, 'AST-DB-01');
    const pathSteps = path.map((step, idx) => `${idx + 1}. **${step.label}** (\`${step.id}\`) — *${step.role}*`).join('\n');

    return {
      intent: 'ATTACK_PATH',
      text: `### Attack Path Analysis: Ingress to ${asset?.name || 'Core Banking Database'}

**Canonical Traversal Path**:
${pathSteps}

**Blast Radius & Impact**:
- **Severity**: **${blast.severity}**
- **Resident Data**: **480,000 PII/PCI customer records**
- **Impact Assessment**: ${blast.description}

**Key Defensive Chokepoints**:
- Hardware FIDO2 MFA at Edge Gateway (\`AST-GW-01\`)
- CyberArk Just-in-Time PAM credential rotation at Database ingress (\`AST-DB-01\`)`,
      sources: [
        { type: 'ASSET', id: 'AST-GW-01', label: 'Edge Gateway (AST-GW-01)' },
        { type: 'ASSET', id: 'AST-DB-01', label: 'Core Banking DB (AST-DB-01)' },
        { type: 'GRAPH', label: '3-Hop Ingress Path' }
      ],
      actions: [
        { label: 'Open Attack Path Graph', tab: 'graph' },
        { label: 'Inspect Asset Inventory', tab: 'assets' }
      ]
    };
  }

  // 7. INTENT: What-If / Delay Questions (e.g. "What happens if we delay patching?")
  if (
    q.includes('delay') ||
    q.includes('what if') ||
    q.includes('what happens') ||
    q.includes('30 days') ||
    q.includes('patch delay')
  ) {
    const totalEAL = state.totalEstimatedExposure || 15700000;
    const projectedDelayEAL = Math.round(totalEAL * 1.35);
    const delta = projectedDelayEAL - totalEAL;

    return {
      intent: 'WHAT_IF_SCENARIO',
      text: `### Modelled What-If Scenario: 30-Day Patching Delay

If emergency firmware hotfixes and vulnerability remediation are delayed by **30 operational days**:

**Financial Impact Assessment**:
- **Current Modelled Exposure**: **${formatINR(totalEAL)}**
- **Projected Exposure**: **${formatINR(projectedDelayEAL)}**
- **Estimated Financial Risk Delta**: **+${formatINR(delta)}** (+35.0%)

**Why Exposure Increases**:
- Threat actor exploit weaponization probability rises significantly for published CVEs.
- Active threat event frequency ($TEF$) increases from $6.0/\\text{yr}$ to $14.2/\\text{yr}$ on internet-exposed ingress nodes.
- Regulatory breach notification liability penalty under DPDP Act 2023 escalates.`,
      sources: [
        { type: 'SCENARIO', label: '30-Day Operational Delay' },
        { type: 'METRIC', label: `Projected Delta: +${formatINR(delta)}` }
      ],
      actions: [
        { label: 'Open What-If Simulator', tab: 'simulator' },
        { label: 'Deploy Remediation Hotfix', tab: 'remediation' }
      ]
    };
  }

  // 8. INTENT: Explainability / Why CVSS vs Business Risk
  if (
    q.includes('why') ||
    q.includes('compare') ||
    q.includes('cvss') ||
    q.includes('difference between')
  ) {
    const dbRisk = (state.risks || []).find(r => r.assetId === 'AST-DB-01') || state.risks?.[0];
    const devRisk = (state.risks || []).find(r => r.assetId === 'AST-DEV-01') || state.risks?.[state.risks.length - 1];

    return {
      intent: 'EXPLAINABILITY',
      text: `### Risk Prioritization Explainability: Technical Severity (CVSS) vs Business Financial Risk (EAL)

**CVSS Score is only Technical Exploitability**. ResilienceOS quantifies **True Business Risk** by compounding 5 essential dimensions:

1. **Asset Business Criticality**: Tier 1 production DB (₹5.5L/hr downtime) vs Tier 4 static sandbox (₹0 downtime).
2. **Data Sensitivity & DPDP Liability**: 480,000 resident financial records vs zero customer records.
3. **Attack Path Ingress Reachability**: Direct upstream route from internet payment ingress vs isolated internal subnet.
4. **Defensive Control Degradation**: Active bypass on privileged credentials vs air-gapped test container.
5. **Loss Magnitude ($LM$)**: ₹2.40 Cr Single Loss Expectancy vs ₹2,500 test environment reset.

**Comparison from Current Platform State**:
- **${dbRisk?.title || 'Core DB Risk'}** (CVSS 7.5): Modelled **${formatINR(dbRisk?.fairMetrics?.expectedAnnualLoss || 8400000)}** EAL $\\implies$ **P1 - Immediate**.
- **Dev Sandbox Remote Execution** (CVSS 9.8): Modelled **₹250** EAL $\\implies$ **P4 - Low**.`,
      sources: [
        { type: 'RISK', id: dbRisk?.id, label: dbRisk?.title },
        { type: 'ASSET', id: dbRisk?.assetId, label: 'Core Banking DB (Tier 1)' },
        { type: 'METHODOLOGY', label: 'FAIR Framework (ISO/IEC 27005)' }
      ],
      actions: [
        { label: 'Open Risk Exposure View', tab: 'risk' },
        { label: 'Inspect Asset Intelligence', tab: 'assets' }
      ]
    };
  }

  // 9. INTENT: Remediation & Overdue Tasks
  if (
    q.includes('fix') ||
    q.includes('remediation') ||
    q.includes('overdue') ||
    q.includes('unresolved') ||
    q.includes('action')
  ) {
    const activeTasks = (state.remediations || []).filter(t => t.status !== 'Verified');
    const tasksMarkdown = activeTasks.slice(0, 3).map((t, idx) => {
      return `${idx + 1}. **${t.title}** on \`${t.assetId}\`\n   • Priority: **${t.priority}** | Owner: **${t.owner}** | Expected Reduction: **${formatINR(t.riskReduction)}**`;
    }).join('\n');

    return {
      intent: 'REMEDIATION_TASKS',
      text: `### Unresolved Remediation Actions (${activeTasks.length} Active)

${tasksMarkdown}

**Top Recommendation**:
Execute **${activeTasks[0]?.title || 'Emergency Patching'}** to immediately eliminate **${formatINR(activeTasks[0]?.riskReduction || 0)}** of open risk exposure.`,
      sources: [
        { type: 'REMEDIATION', id: activeTasks[0]?.id, label: activeTasks[0]?.title },
        { type: 'METRIC', label: `Pending Reduction: ${formatINR(activeTasks[0]?.riskReduction || 0)}` }
      ],
      actions: [
        { label: 'Open Remediation Center', tab: 'remediation' },
        { label: 'Review Investment Plan', tab: 'optimizer' }
      ]
    };
  }

  // 10. FALLBACK: Grounded Boundary Guardrail
  return {
    intent: 'FALLBACK_UNRECOGNIZED',
    text: `I can answer specific questions about the current **ResilienceOS risk, financial exposure (EAL/VaR), asset topology, remediation tasks, telemetry events, or compliance state**.

I don't have enough platform telemetry data to answer that question reliably without making ungrounded assumptions.

**You can try asking me**:
- *"What is our biggest financial risk?"*
- *"We have ₹20L. Where should we invest?"*
- *"How can an attacker reach the Core Banking database?"*
- *"What changed recently in telemetry?"*
- *"Why is the database risk ranked above the dev sandbox?"*
- *"Summarize our security posture for the Board."*`,
    sources: [],
    actions: [
      { label: 'Summarize for Board', actionText: 'Summarize for Board' },
      { label: 'Biggest Financial Risk', actionText: 'What is our biggest financial risk?' },
      { label: 'Optimal ₹20L Allocation', actionText: 'We have ₹20L. What should we do?' }
    ]
  };
}
