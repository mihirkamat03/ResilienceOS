/**
 * ResilienceOS Compliance Intelligence Engine
 * 
 * Maps technical security controls and evidence to regulatory frameworks:
 * - NIST CSF 2.0 (National Institute of Standards and Technology)
 * - ISO/IEC 27001:2022 (Information Security Management)
 * - RBI Master Direction on Information Technology & Cyber Security (Banking)
 * - SEBI CSCRF (Cybersecurity and Cyber Resilience Framework for Market Infrastructure)
 * 
 * Note: Control coverage metrics provide operational decision support and evidence tracking,
 * not legal certification.
 */

export const FRAMEWORKS = [
  {
    id: 'FW-NIST',
    name: 'NIST CSF 2.0',
    shortName: 'NIST CSF 2.0',
    domain: 'National Cybersecurity Framework',
    authority: 'NIST / US Dept of Commerce',
    targetScore: 90,
    description: 'Core framework organizing cybersecurity activities across Govern, Identify, Protect, Detect, Respond, and Recover.'
  },
  {
    id: 'FW-ISO',
    name: 'ISO/IEC 27001:2022',
    shortName: 'ISO 27001',
    domain: 'Information Security Management System (ISMS)',
    authority: 'International Organization for Standardization',
    targetScore: 90,
    description: 'Standard for establishing, implementing, maintaining, and continually improving an information security management system.'
  },
  {
    id: 'FW-RBI',
    name: 'RBI Master Direction',
    shortName: 'RBI Cyber Security',
    domain: 'Banking IT Governance & Cyber Resilience',
    authority: 'Reserve Bank of India',
    targetScore: 100,
    description: 'Mandatory technical controls, baseline cyber security standards, and board-level risk reporting for banking entities.'
  },
  {
    id: 'FW-SEBI',
    name: 'SEBI CSCRF',
    shortName: 'SEBI CSCRF',
    domain: 'Securities Market Cyber Resilience',
    authority: 'Securities and Exchange Board of India',
    targetScore: 90,
    description: 'Mandatory cybersecurity and cyber resilience framework for regulated securities entities and payment systems.'
  }
];

/**
 * Calculates dynamic framework coverage summaries based on unified control statuses and evidence.
 * 
 * Weighting Methodology:
 * - Implemented = 100%
 * - Partially Implemented = 50%
 * - Not Implemented = 0%
 * - Not Assessed = 0% (tracked separately as unassessed)
 * 
 * @param {Array} controls - Unified controls list
 * @param {Array} evidenceList - Evidence records
 * @returns {Array} Framework summaries with dynamic coverage, implemented counts, and gap counts
 */
export function calculateFrameworkSummaries(controls = [], evidenceList = []) {
  return FRAMEWORKS.map(fw => {
    // Find all controls that have a mapping for this framework
    const mappedControls = controls.filter(c => 
      c.frameworkMappings && c.frameworkMappings.some(m => m.framework === fw.name || m.framework === fw.shortName)
    );

    if (mappedControls.length === 0) {
      return {
        ...fw,
        currentScore: 0,
        totalControls: 0,
        implementedCount: 0,
        partialCount: 0,
        notImplementedCount: 0,
        notAssessedCount: 0,
        reviewRequiredCount: 0,
        gapCount: 0,
        status: 'Not Assessed'
      };
    }

    let totalWeightedScore = 0;
    let implementedCount = 0;
    let partialCount = 0;
    let notImplementedCount = 0;
    let notAssessedCount = 0;
    let reviewRequiredCount = 0;

    mappedControls.forEach(ctrl => {
      // Check evidence freshness for this control
      const ctrlEvidence = (evidenceList || []).filter(e => e.controlId === ctrl.id);
      const hasExpiredEvidence = ctrlEvidence.some(e => e.status === 'Expired');
      const hasMissingEvidence = ctrlEvidence.length === 0 || ctrlEvidence.some(e => e.status === 'Missing');
      const isReviewReq = hasExpiredEvidence || hasMissingEvidence || ctrl.evidenceStatus === 'Expired' || ctrl.evidenceStatus === 'Missing' || ctrl.evidenceStatus === 'Pending Review';
      
      if (isReviewReq) {
        reviewRequiredCount += 1;
      }

      if (ctrl.status === 'Implemented') {
        totalWeightedScore += 100;
        implementedCount += 1;
      } else if (ctrl.status === 'Partially Implemented') {
        totalWeightedScore += 50;
        partialCount += 1;
      } else if (ctrl.status === 'Not Implemented') {
        totalWeightedScore += 0;
        notImplementedCount += 1;
      } else {
        // Not Assessed
        totalWeightedScore += 0;
        notAssessedCount += 1;
      }
    });

    const currentScore = Math.round(totalWeightedScore / mappedControls.length);
    const gapCount = partialCount + notImplementedCount;

    return {
      ...fw,
      currentScore,
      totalControls: mappedControls.length,
      implementedCount,
      partialCount,
      notImplementedCount,
      notAssessedCount,
      reviewRequiredCount,
      gapCount,
      status: currentScore >= fw.targetScore ? 'Target Met' : currentScore >= 70 ? 'Satisfactory' : 'Gaps Identified'
    };
  });
}

/**
 * Identifies and prioritizes compliance gaps by linking controls to FAIR risk financial exposure (EAL),
 * asset criticality, and evidence freshness.
 * 
 * @param {Array} controls - Unified controls
 * @param {Array} risks - FAIR risk records
 * @param {Array} assets - Asset records
 * @param {Array} evidenceList - Evidence records
 * @param {Array} remediations - Remediation tasks
 * @returns {Array} Prioritized compliance gaps sorted by business & financial impact
 */
export function getPrioritizedComplianceGaps(controls = [], risks = [], assets = [], evidenceList = [], remediations = []) {
  const gaps = [];

  (controls || []).forEach(ctrl => {
    const isControlDeficient = ctrl.status === 'Partially Implemented' || ctrl.status === 'Not Implemented';
    const ctrlEvidence = (evidenceList || []).filter(e => e.controlId === ctrl.id);
    const hasExpiredEvidence = ctrlEvidence.some(e => e.status === 'Expired');
    const hasMissingEvidence = ctrlEvidence.length === 0 || ctrlEvidence.some(e => e.status === 'Missing');
    const isReviewRequired = hasExpiredEvidence || hasMissingEvidence || ctrl.evidenceStatus === 'Expired' || ctrl.evidenceStatus === 'Missing' || ctrl.evidenceStatus === 'Pending Review';

    // If control is not fully implemented or requires evidence review, flag as a gap/attention item
    if (isControlDeficient || isReviewRequired) {
      // Find related risks (active only)
      const linkedRisks = (risks || []).filter(r => (ctrl.relatedRisks || []).includes(r.id) && r.status !== 'Remediated');
      const totalRelatedEAL = linkedRisks.reduce((sum, r) => sum + (r.fairMetrics ? r.fairMetrics.expectedAnnualLoss : 0), 0);

      // Find related assets
      const linkedAssets = (assets || []).filter(a => (ctrl.relatedAssets || []).includes(a.id));
      const maxAssetCriticality = linkedAssets.reduce((max, a) => Math.max(max, a.criticalityScore || 0), 0);
      const hasTier1Asset = linkedAssets.some(a => a.criticality === 'Tier 1');

      // Find related remediations
      const linkedRemediations = (remediations || []).filter(rem => (ctrl.relatedRemediationTasks || []).includes(rem.id));

      // Calculate Priority:
      // P1 - Urgent: High EAL (>= ₹50L) OR Tier 1 asset OR Not Implemented
      // P2 - High: Partially Implemented with moderate EAL or Expired Evidence on Tier 2
      // P3 - Medium: Review required or low risk exposure
      let priority = 'P3 - Medium';
      let priorityScore = 0;

      if (totalRelatedEAL >= 5000000 || (hasTier1Asset && ctrl.status === 'Not Implemented') || ctrl.status === 'Not Implemented') {
        priority = 'P1 - Urgent';
        priorityScore = 300 + Math.round(totalRelatedEAL / 100000);
      } else if (ctrl.status === 'Partially Implemented' || totalRelatedEAL > 0 || hasTier1Asset) {
        priority = 'P2 - High';
        priorityScore = 200 + Math.round(totalRelatedEAL / 100000);
      } else {
        priority = 'P3 - Medium';
        priorityScore = 100;
      }

      // If evidence is expired, add urgency flag
      if (hasExpiredEvidence) {
        priorityScore += 25;
      }

      // Add an entry for each mapped framework requirement
      (ctrl.frameworkMappings || []).forEach(mapping => {
        gaps.push({
          id: `GAP-${ctrl.id}-${mapping.code.replace(/[^a-zA-Z0-9]/g, '')}`,
          controlId: ctrl.id,
          controlName: ctrl.name,
          category: ctrl.category,
          framework: mapping.framework,
          requirementCode: mapping.code,
          requirementTitle: mapping.requirement,
          currentStatus: ctrl.status,
          evidenceStatus: hasExpiredEvidence ? 'Expired' : hasMissingEvidence ? 'Missing' : ctrl.evidenceStatus || 'Available',
          isReviewRequired,
          owner: ctrl.owner,
          lastReviewed: ctrl.lastReviewed,
          linkedRisks,
          totalRelatedEAL,
          linkedAssets,
          maxAssetCriticality,
          hasTier1Asset,
          linkedRemediations,
          recommendedAction: ctrl.recommendedAction || (linkedRemediations[0] ? linkedRemediations[0].title : 'Conduct technical remediation & verify controls.'),
          priority,
          priorityScore
        });
      });
    }
  });

  // Sort descending by priorityScore (highest financial exposure & asset criticality first)
  return gaps.sort((a, b) => b.priorityScore - a.priorityScore);
}
