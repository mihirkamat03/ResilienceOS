import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import {
  INITIAL_ASSETS,
  INITIAL_RISKS,
  INITIAL_VULNERABILITIES,
  INITIAL_INVESTMENTS,
  INITIAL_REMEDIATIONS,
  INITIAL_UNIFIED_CONTROLS,
  INITIAL_EVIDENCE_RECORDS,
  INITIAL_HISTORICAL_SNAPSHOTS
} from '../data/initialData';
import {
  computeFAIRRiskMetrics,
  recalculateRisk,
  formatINR
} from '../core/riskEngine';
import { solveSecurityBudgetOptimization } from '../core/optimizerEngine';
import {
  TELEMETRY_FEEDS_CONFIG,
  PRESET_TELEMETRY_EVENTS,
  processTelemetryEvent
} from '../core/telemetryEngine';
import {
  calculateFrameworkSummaries,
  getPrioritizedComplianceGaps
} from '../core/complianceEngine';

const RiskStoreContext = createContext(undefined);

export const RiskStoreProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeRole, setActiveRole] = useState('CISO');
  
  // Core Entities State (Single Source of Truth)
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [risks, setRisks] = useState(INITIAL_RISKS);
  const [vulnerabilities, setVulnerabilities] = useState(INITIAL_VULNERABILITIES);
  const [investments, setInvestments] = useState(INITIAL_INVESTMENTS);
  const [remediations, setRemediations] = useState(INITIAL_REMEDIATIONS);
  const [unifiedControls, setUnifiedControls] = useState(INITIAL_UNIFIED_CONTROLS);
  const [evidenceRecords, setEvidenceRecords] = useState(INITIAL_EVIDENCE_RECORDS);
  const [historicalSnapshots, setHistoricalSnapshots] = useState(INITIAL_HISTORICAL_SNAPSHOTS);
  const [telemetryFeeds, setTelemetryFeeds] = useState(TELEMETRY_FEEDS_CONFIG);
  
  // Interactive UI Selection States
  const [selectedRiskId, setSelectedRiskId] = useState(null);
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [selectedControlId, setSelectedControlId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isCopilotDrawerOpen, setIsCopilotDrawerOpen] = useState(false);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(true);
  
  // Optimizer & Financial State
  const [budget, setBudget] = useState(3000000); // Default ₹30 Lakhs
  const [monthToDateReduction, setMonthToDateReduction] = useState(14200000); // ₹1.42 Cr
  const [lastRecalculatedTime, setLastRecalculatedTime] = useState('Just now');
  const [lastTelemetryEventNotice, setLastTelemetryEventNotice] = useState(null);
  
  // Immutable Audit Event Trail
  const [auditLogs, setAuditLogs] = useState([
    {
      id: 'AUD-001',
      timestamp: 'Today, 15:42 IST',
      type: 'TELEMETRY_SYNC',
      description: 'Automated Qualys VMDR scan completed. 2,514 records parsed. Vulnerability index synchronized.'
    },
    {
      id: 'AUD-002',
      timestamp: 'Today, 14:10 IST',
      type: 'REMEDIATION_VERIFIED',
      description: 'IAM MFA enforcement verified for DevOps staging cluster. Risk reduced by ₹14.2L.',
      deltaExposureINR: -1420000
    }
  ]);

  // Aggregate Metrics computed dynamically from active risks
  const totalEstimatedExposure = useMemo(() => {
    return risks
      .filter(r => r.status !== 'Remediated')
      .reduce((sum, r) => sum + (r.fairMetrics ? r.fairMetrics.expectedAnnualLoss : 0), 0);
  }, [risks]);

  const criticalExposure = useMemo(() => {
    return risks
      .filter(r => r.status !== 'Remediated' && (r.technicalSeverity === 'CRITICAL' || r.contextualPriority === 'P1 - Immediate'))
      .reduce((sum, r) => sum + (r.fairMetrics ? r.fairMetrics.expectedAnnualLoss : 0), 0);
  }, [risks]);

  const openCriticalRisksCount = useMemo(() => {
    return risks.filter(r => r.status !== 'Remediated' && (r.technicalSeverity === 'CRITICAL' || r.contextualPriority === 'P1 - Immediate')).length;
  }, [risks]);

  const valueAtRisk95Total = useMemo(() => {
    return risks
      .filter(r => r.status !== 'Remediated')
      .reduce((sum, r) => sum + (r.fairMetrics ? r.fairMetrics.valueAtRisk95 : 0), 0);
  }, [risks]);

  // Dynamic 0/1 Knapsack Optimization Result with Overlap Checks
  const optimizationResult = useMemo(() => {
    return solveSecurityBudgetOptimization(investments, budget, risks);
  }, [investments, budget, risks]);

  // Dynamic Exposure by Business Unit
  const exposureByBusinessUnit = useMemo(() => {
    const buMap = {};
    assets.forEach(asset => {
      const bu = asset.businessUnit || 'Other';
      if (!buMap[bu]) {
        buMap[bu] = { name: bu, exposure: 0, assetCount: 0 };
      }
      buMap[bu].assetCount += 1;
    });

    risks.filter(r => r.status !== 'Remediated').forEach(r => {
      const asset = assets.find(a => a.id === r.assetId);
      const bu = asset ? asset.businessUnit : 'Other';
      if (!buMap[bu]) {
        buMap[bu] = { name: bu, exposure: 0, assetCount: 1 };
      }
      buMap[bu].exposure += (r.fairMetrics ? r.fairMetrics.expectedAnnualLoss : 0);
    });

    const colors = ['#ef4444', '#f97316', '#64748b', '#475569', '#3b82f6'];
    return Object.values(buMap)
      .sort((a, b) => b.exposure - a.exposure)
      .map((item, idx) => ({
        name: item.name,
        exposure: Math.round((item.exposure / 10000000) * 100) / 100, // in Cr for charts
        exposureRaw: item.exposure,
        color: colors[idx % colors.length]
      }));
  }, [risks, assets]);

  // Dynamic Exposure Trend Timeline
  const exposureTrendTimeline = useMemo(() => {
    const currentExposureCr = Math.round((totalEstimatedExposure / 10000000) * 100) / 100;
    const projectedReductionCr = Math.round((optimizationResult.totalRiskReduction / 10000000) * 100) / 100;
    const projectedExposureCr = Math.max(0.1, Math.round((currentExposureCr - projectedReductionCr) * 100) / 100);

    const history = historicalSnapshots.map(h => ({
      month: h.month,
      actual: h.exposureCr,
      projected: null,
      event: h.event
    }));

    return [
      ...history,
      {
        month: 'Current State',
        actual: currentExposureCr,
        projected: currentExposureCr,
        event: `Live Model State (${risks.filter(r => r.status !== 'Remediated').length} open risks)`
      },
      {
        month: 'Optimized Target',
        actual: null,
        projected: projectedExposureCr,
        event: `Projected after deploying ₹${(budget / 100000).toFixed(0)}L optimal portfolio`
      }
    ];
  }, [historicalSnapshots, totalEstimatedExposure, optimizationResult, risks, budget]);

  // Dynamic Framework Compliance Summary (Calculated live from unified controls & evidence)
  const complianceSummary = useMemo(() => {
    return calculateFrameworkSummaries(unifiedControls, evidenceRecords);
  }, [unifiedControls, evidenceRecords]);

  // Dynamic Prioritized Compliance Gaps (Risk-weighted with FAIR financial exposure)
  const complianceGaps = useMemo(() => {
    return getPrioritizedComplianceGaps(unifiedControls, risks, assets, evidenceRecords, remediations);
  }, [unifiedControls, risks, assets, evidenceRecords, remediations]);

  // Action: Trigger Preset Telemetry Event (Event A, B, C, D)
  const triggerPresetTelemetryEvent = useCallback((presetKey) => {
    const event = PRESET_TELEMETRY_EVENTS[presetKey];
    if (!event) return;

    const currentState = {
      assets,
      vulnerabilities,
      risks,
      remediations,
      unifiedControls,
      evidenceRecords,
      auditLogs,
      historicalSnapshots
    };

    const result = processTelemetryEvent(event, currentState);

    setAssets(result.updatedAssets);
    setVulnerabilities(result.updatedVulnerabilities);
    setRisks(result.updatedRisks);
    if (result.updatedControls && result.updatedControls.length > 0) {
      setUnifiedControls(result.updatedControls);
    }
    if (result.updatedEvidence && result.updatedEvidence.length > 0) {
      setEvidenceRecords(result.updatedEvidence);
    }
    setAuditLogs(prev => [result.newAuditLog, ...prev]);
    setHistoricalSnapshots(prev => [...prev, result.newSnapshot]);
    setLastRecalculatedTime(result.nowTime);
    setLastTelemetryEventNotice({
      title: event.title,
      feed: event.sourceFeed,
      delta: result.deltaExposureINR,
      time: result.nowTime
    });
  }, [assets, vulnerabilities, risks, remediations, unifiedControls, evidenceRecords, auditLogs, historicalSnapshots]);

  // Action: Modify Asset Criticality
  const updateAssetCriticality = useCallback((assetId, newCriticality, newScore, newHourlyCost) => {
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST';

    let updatedAssetObj = null;

    setAssets(prevAssets =>
      prevAssets.map(a => {
        if (a.id === assetId) {
          const updated = {
            ...a,
            criticality: newCriticality !== undefined ? newCriticality : a.criticality,
            criticalityScore: newScore !== undefined ? newScore : a.criticalityScore,
            hourlyDowntimeCost: newHourlyCost !== undefined ? newHourlyCost : a.hourlyDowntimeCost
          };
          updatedAssetObj = updated;
          return updated;
        }
        return a;
      })
    );

    setRisks(prevRisks =>
      prevRisks.map(r => {
        if (r.assetId === assetId) {
          const targetAsset = updatedAssetObj || assets.find(a => a.id === assetId) || {};
          const linkedVuln = vulnerabilities.find(v => v.id === r.vulnId) || {};
          return recalculateRisk(r, targetAsset, linkedVuln);
        }
        return r;
      })
    );

    setLastRecalculatedTime(now);
    setAuditLogs(prev => [
      {
        id: `AUD-${Date.now()}`,
        timestamp: `Today, ${now}`,
        type: 'ASSET_MODIFIED',
        description: `Asset ${assetId} criticality adjusted to ${newCriticality || 'updated tier'}. Risk & financial exposure re-quantified.`
      },
      ...prev
    ]);
  }, [assets, vulnerabilities]);

  // Action: Update Unified Compliance Control Status (Implemented, Partially Implemented, Not Implemented, Not Assessed)
  const updateControlStatus = useCallback((controlId, newStatus) => {
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST';
    const targetCtrl = unifiedControls.find(c => c.id === controlId);
    if (!targetCtrl) return;

    // 1. Update unified controls
    setUnifiedControls(prev =>
      prev.map(c => (c.id === controlId ? { ...c, status: newStatus, lastReviewed: new Date().toISOString().split('T')[0] } : c))
    );

    // 2. Map control change to linked asset defensive controls
    const isDegraded = newStatus === 'Partially Implemented';
    const isInactive = newStatus === 'Not Implemented';
    const isActive = newStatus === 'Implemented';
    const mappedAssetStatus = isActive ? 'Active' : isDegraded ? 'Degraded' : 'Inactive';
    const mappedEffectiveness = isActive ? 0.85 : isDegraded ? 0.35 : 0.05;

    let updatedAssetsList = assets;
    if (targetCtrl.relatedAssets && targetCtrl.relatedAssets.length > 0) {
      updatedAssetsList = assets.map(a => {
        if (targetCtrl.relatedAssets.includes(a.id)) {
          const updatedControls = a.existingControls.map(c => {
            if (
              (targetCtrl.id === 'CTRL-MFA-01' && c.name.includes('Multi-Factor')) ||
              (targetCtrl.id === 'CTRL-PAM-01' && c.name.includes('PAM')) ||
              (targetCtrl.id === 'CTRL-BACKUP-01' && c.name.includes('Backup')) ||
              (targetCtrl.id === 'CTRL-WAF-01' && c.name.includes('WAF')) ||
              (targetCtrl.id === 'CTRL-ENC-01' && c.name.includes('Encryption'))
            ) {
              return { ...c, status: mappedAssetStatus, effectiveness: mappedEffectiveness };
            }
            return c;
          });
          return { ...a, existingControls: updatedControls };
        }
        return a;
      });
      setAssets(updatedAssetsList);
    }

    // 3. Recalculate affected risks
    if (targetCtrl.relatedRisks && targetCtrl.relatedRisks.length > 0) {
      setRisks(prevRisks =>
        prevRisks.map(r => {
          if (targetCtrl.relatedRisks.includes(r.id) && r.status !== 'Remediated') {
            const asset = updatedAssetsList.find(a => a.id === r.assetId) || {};
            const vuln = vulnerabilities.find(v => v.id === r.vulnId) || {};
            return recalculateRisk(r, asset, vuln);
          }
          return r;
        })
      );
    }

    setLastRecalculatedTime(now);
    setAuditLogs(prev => [
      {
        id: `AUD-${Date.now()}`,
        timestamp: `Today, ${now}`,
        type: 'CONTROL_MUTATED',
        description: `Control '${targetCtrl.name}' updated to '${newStatus}'. Compliance coverage and FAIR risk re-quantified.`
      },
      ...prev
    ]);
  }, [unifiedControls, assets, vulnerabilities]);

  // Action: Update Evidence Record Status (Verified, Available, Missing, Expired, Pending Review)
  const updateEvidenceStatus = useCallback((evidenceId, newStatus) => {
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST';
    const evRecord = evidenceRecords.find(e => e.id === evidenceId);
    if (!evRecord) return;

    setEvidenceRecords(prev =>
      prev.map(e => (e.id === evidenceId ? { ...e, status: newStatus } : e))
    );

    // Sync status to parent control
    setUnifiedControls(prev =>
      prev.map(c => (c.id === evRecord.controlId ? { ...c, evidenceStatus: newStatus } : c))
    );

    setLastRecalculatedTime(now);
    setAuditLogs(prev => [
      {
        id: `AUD-${Date.now()}`,
        timestamp: `Today, ${now}`,
        type: 'EVIDENCE_AUDITED',
        description: `Evidence '${evRecord.title}' marked as '${newStatus}'. Compliance review status updated.`
      },
      ...prev
    ]);
  }, [evidenceRecords]);

  // Action: Toggle Defensive Control on an Asset (e.g. Enable MFA)
  const toggleControlStatus = useCallback((assetId, controlName, newStatus, newEffectiveness) => {
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST';

    const currentAsset = assets.find(a => a.id === assetId);
    if (!currentAsset) return;

    const updatedControls = currentAsset.existingControls.map(c => {
      if (c.name === controlName) {
        const nextStatus = newStatus !== undefined 
          ? newStatus 
          : (c.status === 'Active' ? 'Degraded' : 'Active');
        
        let nextEff = newEffectiveness !== undefined ? newEffectiveness : c.effectiveness;
        if (newEffectiveness === undefined) {
          nextEff = nextStatus === 'Active' ? Math.max(0.90, c.effectiveness) : Math.min(0.40, c.effectiveness);
        }

        return {
          ...c,
          status: nextStatus,
          effectiveness: nextEff
        };
      }
      return c;
    });

    const updatedAssetObj = { ...currentAsset, existingControls: updatedControls };

    setAssets(prevAssets =>
      prevAssets.map(a => (a.id === assetId ? updatedAssetObj : a))
    );

    setRisks(prevRisks =>
      prevRisks.map(r => {
        if (r.assetId === assetId) {
          const linkedVuln = vulnerabilities.find(v => v.id === r.vulnId) || {};
          return recalculateRisk(r, updatedAssetObj, linkedVuln);
        }
        return r;
      })
    );

    // Sync to Unified Controls
    if (controlName.includes('Multi-Factor')) {
      const isAct = updatedControls.some(c => c.name.includes('Multi-Factor') && c.status === 'Active');
      setUnifiedControls(prev =>
        prev.map(c =>
          c.id === 'CTRL-MFA-01'
            ? { ...c, status: isAct ? 'Implemented' : 'Partially Implemented' }
            : c
        )
      );
    }

    setLastRecalculatedTime(now);
    setAuditLogs(prev => [
      {
        id: `AUD-${Date.now()}`,
        timestamp: `Today, ${now}`,
        type: 'CONTROL_MUTATED',
        description: `Control '${controlName}' on ${assetId} updated. Model state recalculated.`
      },
      ...prev
    ]);
  }, [assets, vulnerabilities]);

  // Action: Update Remediation Task Status
  const updateRemediationStatus = useCallback((taskId, newStatus) => {
    setRemediations(prev =>
      prev.map(task => (task.id === taskId ? { ...task, status: newStatus } : task))
    );
  }, []);

  // Action: Closed-Loop Remediation Verification & State Recalculation
  const verifyAndRecalculate = useCallback((taskId) => {
    const task = remediations.find(t => t.id === taskId);
    if (!task) return;

    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST';
    const reducedAmount = task.riskReduction || 2400000;

    // 1. Mark task verified
    setRemediations(prev =>
      prev.map(t =>
        t.id === taskId
          ? {
              ...t,
              status: 'Verified',
              verifiedTimestamp: now,
              rescanAuditLog: `Synthetic Qualys VMDR Rescan: 0 active findings. Control verified with 95% confidence.`
            }
          : t
      )
    );

    // 2. Reduce the linked risk's EAL and change status
    setRisks(prev =>
      prev.map(r => {
        if (r.id === task.riskId) {
          const newEAL = Math.max(0, r.fairMetrics.expectedAnnualLoss - reducedAmount);
          const newVaR = Math.max(0, r.fairMetrics.valueAtRisk95 - Math.round(reducedAmount * 1.5));
          return {
            ...r,
            status: 'Remediated',
            riskScore: Math.max(10, r.riskScore - 60),
            fairMetrics: {
              ...r.fairMetrics,
              expectedAnnualLoss: newEAL,
              valueAtRisk95: newVaR,
              lossEventFrequency: Math.max(0.01, Math.round(r.fairMetrics.lossEventFrequency * 0.15 * 100) / 100),
              confidenceRange: {
                p10: Math.round(newEAL * 0.48),
                p50: newEAL,
                p90: Math.round(newEAL * 1.96)
              }
            }
          };
        }
        return r;
      })
    );

    // 3. Update Asset Controls and Financial Exposure
    setAssets(prev =>
      prev.map(a => {
        if (a.id === task.assetId) {
          return {
            ...a,
            activeVulnerabilitiesCount: Math.max(0, a.activeVulnerabilitiesCount - 1),
            financialExposure: Math.max(0, a.financialExposure - reducedAmount),
            existingControls: a.existingControls.map(c => ({
              ...c,
              status: 'Active',
              effectiveness: Math.min(0.98, Math.round((c.effectiveness + 0.3) * 100) / 100)
            }))
          };
        }
        return a;
      })
    );

    // 4. Update Unified Compliance Controls and Evidence to Implemented / Verified
    setUnifiedControls(prev =>
      prev.map(c => {
        if (
          (c.relatedRemediationTasks && c.relatedRemediationTasks.includes(taskId)) ||
          (c.relatedRisks && c.relatedRisks.includes(task.riskId)) ||
          (c.relatedAssets && c.relatedAssets.includes(task.assetId))
        ) {
          return {
            ...c,
            status: 'Implemented',
            evidenceStatus: 'Verified',
            lastReviewed: new Date().toISOString().split('T')[0]
          };
        }
        return c;
      })
    );

    setEvidenceRecords(prev =>
      prev.map(e => {
        const matchingCtrl = unifiedControls.find(
          c =>
            c.id === e.controlId &&
            ((c.relatedRemediationTasks && c.relatedRemediationTasks.includes(taskId)) ||
              (c.relatedRisks && c.relatedRisks.includes(task.riskId)))
        );
        return matchingCtrl ? { ...e, status: 'Verified', collectedAt: `Today, ${now}` } : e;
      })
    );
    // 5. Update MTD Reduction and Recalculated Timestamp
    setMonthToDateReduction(prev => prev + reducedAmount);
    setLastRecalculatedTime(now);

    // 6. Append to Audit Log
    setAuditLogs(prev => [
      {
        id: `AUD-${Date.now()}`,
        timestamp: `Today, ${now}`,
        type: 'REMEDIATION_VERIFIED',
        description: `Verified '${task.title}' on ${task.assetId}. Exposure recalculated: -${formatINR(reducedAmount)}.`,
        deltaExposureINR: -reducedAmount
      },
      ...prev
    ]);
  }, [remediations, unifiedControls]);

  // Action: Refresh Telemetry Sync
  const simulateTelemetrySync = useCallback(() => {
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST';
    setTelemetryFeeds(prev =>
      prev.map(feed => ({
        ...feed,
        lastSync: 'Just now',
        dataFreshnessMinutes: 0,
        recordsIngested: feed.recordsIngested + Math.floor(Math.random() * 40) + 15
      }))
    );
    setLastRecalculatedTime(now);
    setAuditLogs(prev => [
      {
        id: `AUD-${Date.now()}`,
        timestamp: `Today, ${now}`,
        type: 'TELEMETRY_SYNC',
        description: 'Synchronized telemetry across 4 ingestion feeds (Qualys, Wiz, Okta, Splunk). Model state validated.'
      },
      ...prev
    ]);
  }, []);

  // Action: Reset Demo State to Pristine Baseline (Essential for Hackathon Live Demo)
  const resetDemoState = useCallback(() => {
    setAssets(JSON.parse(JSON.stringify(INITIAL_ASSETS)));
    setRisks(JSON.parse(JSON.stringify(INITIAL_RISKS)));
    setVulnerabilities(JSON.parse(JSON.stringify(INITIAL_VULNERABILITIES)));
    setInvestments(JSON.parse(JSON.stringify(INITIAL_INVESTMENTS)));
    setRemediations(JSON.parse(JSON.stringify(INITIAL_REMEDIATIONS)));
    setUnifiedControls(JSON.parse(JSON.stringify(INITIAL_UNIFIED_CONTROLS)));
    setEvidenceRecords(JSON.parse(JSON.stringify(INITIAL_EVIDENCE_RECORDS)));
    setHistoricalSnapshots(JSON.parse(JSON.stringify(INITIAL_HISTORICAL_SNAPSHOTS)));
    setBudget(3000000);
    setMonthToDateReduction(14200000);
    setSelectedRiskId(null);
    setSelectedAssetId(null);
    setSelectedControlId(null);
    setLastRecalculatedTime('Just now');
    setLastTelemetryEventNotice(null);
    setAuditLogs([
      {
        id: `AUD-${Date.now()}`,
        timestamp: 'Just now',
        type: 'DEMO_RESET',
        description: 'Demo state restored to pristine canonical baseline.'
      }
    ]);
  }, []);

  // Action: Deploy Optimized Portfolio Directly to Remediation Center
  const deployOptimizedPortfolioToRemediation = useCallback(() => {
    const newTasks = optimizationResult.selectedInvestments.map((inv, idx) => ({
      id: `REM-AUTO-${Date.now()}-${idx}`,
      title: `Deploy: ${inv.name}`,
      riskId: inv.targetRiskIds[0] || 'RSK-001',
      assetId: inv.targetAssetIds[0] || 'AST-DB-01',
      investmentId: inv.id,
      owner: 'SecOps Automation Team',
      priority: 'High',
      cost: inv.cost,
      riskReduction: inv.effectiveReduction || inv.riskReductionEAL,
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: 'Assigned'
    }));

    setRemediations(prev => [...newTasks, ...prev]);
    setActiveTab('remediation');
  }, [optimizationResult, setActiveTab]);

  return (
    <RiskStoreContext.Provider
      value={{
        activeTab,
        setActiveTab,
        activeRole,
        setActiveRole,
        assets,
        risks,
        vulnerabilities,
        investments,
        remediations,
        unifiedControls,
        complianceControls: unifiedControls, // Backward compatibility alias
        evidenceRecords,
        historicalSnapshots,
        telemetryFeeds,
        auditLogs,
        selectedRiskId,
        setSelectedRiskId,
        selectedAssetId,
        setSelectedAssetId,
        selectedControlId,
        setSelectedControlId,
        searchQuery,
        setSearchQuery,
        isSearchModalOpen,
        setIsSearchModalOpen,
        isCopilotDrawerOpen,
        setIsCopilotDrawerOpen,
        isWalkthroughOpen,
        setIsWalkthroughOpen,
        budget,
        setBudget,
        optimizationResult,
        totalEstimatedExposure,
        criticalExposure,
        openCriticalRisksCount,
        monthToDateReduction,
        valueAtRisk95Total,
        exposureByBusinessUnit,
        exposureTrendTimeline,
        complianceSummary,
        complianceGaps,
        lastRecalculatedTime,
        lastTelemetryEventNotice,
        triggerPresetTelemetryEvent,
        updateAssetCriticality,
        toggleControlStatus,
        updateControlStatus,
        updateEvidenceStatus,
        updateRemediationStatus,
        verifyAndRecalculate,
        simulateTelemetrySync,
        resetDemoState,
        deployOptimizedPortfolioToRemediation
      }}
    >
      {children}
    </RiskStoreContext.Provider>
  );
};

export const useRiskStore = () => {
  const context = useContext(RiskStoreContext);
  if (!context) {
    throw new Error('useRiskStore must be used within a RiskStoreProvider');
  }
  return context;
};
