/**
 * ResilienceOS Graph & Attack Path Analysis Engine
 * Pure JavaScript - Single Source of Truth for Topology & Lateral Propagation
 * 
 * Maps enterprise asset dependencies, entry vectors, and blast radiuses:
 * Internet -> Edge VPN Gateway -> Payment API -> Customer Auth -> Core DB -> S3 KYC Lake
 */

export const CANONICAL_GRAPH_EDGES = [
  {
    id: 'EDGE-01',
    from: 'INTERNET',
    to: 'AST-GW-01',
    relationship: 'exposes',
    protocol: 'HTTPS (Port 443)',
    port: 443,
    description: 'Public ingress to perimeter Palo Alto PAN-OS gateway'
  },
  {
    id: 'EDGE-02',
    from: 'AST-GW-01',
    to: 'AST-API-01',
    relationship: 'connectsTo',
    protocol: 'mTLS Ingress',
    port: 8443,
    description: 'Reverse proxy traversal from perimeter to payment switch'
  },
  {
    id: 'EDGE-03',
    from: 'AST-GW-01',
    to: 'AST-AUTH-01',
    relationship: 'connectsTo',
    protocol: 'OAuth2 / TLS',
    port: 443,
    description: 'Direct authentication handshake for gateway administrative sessions'
  },
  {
    id: 'EDGE-04',
    from: 'AST-GW-01',
    to: 'AST-K8S-01',
    relationship: 'connectsTo',
    protocol: 'Kube-API Ingress',
    port: 6443,
    description: 'Management ingress into production EKS microservices'
  },
  {
    id: 'EDGE-05',
    from: 'AST-API-01',
    to: 'AST-DB-01',
    relationship: 'dependsOn',
    protocol: 'PostgreSQL TCP 5432',
    port: 5432,
    description: 'Synchronous transaction ledger write / query channel'
  },
  {
    id: 'EDGE-06',
    from: 'AST-AUTH-01',
    to: 'AST-DB-01',
    relationship: 'dependsOn',
    protocol: 'SQL User Auth',
    port: 5432,
    description: 'Credential validation and IAM role lookup query channel'
  },
  {
    id: 'EDGE-07',
    from: 'AST-K8S-01',
    to: 'AST-API-01',
    relationship: 'connectsTo',
    protocol: 'gRPC Internal Mesh',
    port: 9090,
    description: 'Service mesh orchestration of retail banking backend services'
  },
  {
    id: 'EDGE-08',
    from: 'AST-DB-01',
    to: 'AST-S3-01',
    relationship: 'connectsTo',
    protocol: 'IAM Sync Sink / WORM',
    port: 443,
    description: 'Nightly asynchronous customer KYC compliance replication'
  }
];

export const GRAPH_NODE_COORDINATES = {
  INTERNET: { x: 70, y: 190, tier: 'Perimeter' },
  'AST-GW-01': { x: 260, y: 190, tier: 'Perimeter' },
  'AST-API-01': { x: 480, y: 100, tier: 'DMZ' },
  'AST-AUTH-01': { x: 480, y: 280, tier: 'DMZ' },
  'AST-K8S-01': { x: 480, y: 360, tier: 'DMZ' },
  'AST-DB-01': { x: 720, y: 190, tier: 'Core' },
  'AST-S3-01': { x: 930, y: 190, tier: 'Storage' },
  'AST-DEV-01': { x: 720, y: 340, tier: 'Isolated' }
};

/**
 * Computes active attack paths based on current vulnerability & exposure state
 * An edge is considered vulnerable if its source or target asset has active unmitigated vulnerabilities
 */
export function computeGraphState(assets = [], risks = []) {
  const assetMap = {};
  assets.forEach(a => {
    assetMap[a.id] = a;
  });

  const activeRisksByAsset = {};
  risks.filter(r => r.status !== 'Remediated').forEach(r => {
    if (!activeRisksByAsset[r.assetId]) {
      activeRisksByAsset[r.assetId] = [];
    }
    activeRisksByAsset[r.assetId].push(r);
  });

  // Evaluate dynamic node status
  const nodes = Object.keys(GRAPH_NODE_COORDINATES).map(nodeId => {
    const coords = GRAPH_NODE_COORDINATES[nodeId];
    if (nodeId === 'INTERNET') {
      return {
        id: 'INTERNET',
        name: 'Public Internet',
        type: 'Entry Vector',
        tier: coords.tier,
        x: coords.x,
        y: coords.y,
        criticality: 'Tier 4',
        criticalityScore: 1.0,
        activeVulnCount: 0,
        financialExposure: 0,
        nodeEAL: 0,
        isVulnerable: false,
        isEntryPoint: true
      };
    }

    const asset = assetMap[nodeId] || {
      id: nodeId,
      name: nodeId,
      type: 'Asset',
      criticality: 'Tier 2',
      criticalityScore: 7.0,
      activeVulnerabilitiesCount: 0,
      financialExposure: 0
    };

    const nodeRisks = activeRisksByAsset[nodeId] || [];
    const nodeEAL = nodeRisks.reduce((sum, r) => sum + (r.fairMetrics ? r.fairMetrics.expectedAnnualLoss : 0), 0);
    const isVulnerable = asset.activeVulnerabilitiesCount > 0 || nodeRisks.length > 0;

    return {
      id: asset.id,
      name: asset.name,
      type: asset.type,
      tier: coords.tier,
      x: coords.x,
      y: coords.y,
      criticality: asset.criticality,
      criticalityScore: asset.criticalityScore,
      businessUnit: asset.businessUnit,
      hourlyDowntimeCost: asset.hourlyDowntimeCost,
      activeVulnCount: asset.activeVulnerabilitiesCount,
      financialExposure: asset.financialExposure,
      nodeEAL,
      isVulnerable,
      isEntryPoint: asset.networkExposure === 'Internet-Facing',
      existingControls: asset.existingControls || []
    };
  });

  // Evaluate dynamic edge states & propagation paths
  const edges = CANONICAL_GRAPH_EDGES.map(edge => {
    const sourceNode = nodes.find(n => n.id === edge.from);
    const targetNode = nodes.find(n => n.id === edge.to);

    // Edge is active high-risk path if source is entry or vulnerable AND target is vulnerable or critical
    const isVulnerablePath = Boolean(
      (sourceNode && (sourceNode.isEntryPoint || sourceNode.isVulnerable)) &&
      (targetNode && (targetNode.isVulnerable || targetNode.criticality === 'Tier 1'))
    );

    return {
      ...edge,
      isVulnerablePath
    };
  });

  return { nodes, edges };
}

/**
 * Traces the canonical upstream and downstream attack path sequence for an asset
 * @param {string} assetId
 * @returns {Array<string>} Sequence of asset names / IDs from entry to destination
 */
export function getAssetAttackPath(assetId) {
  const pathMap = {
    'AST-GW-01': [
      { id: 'INTERNET', label: 'Public Internet (Port 443)' },
      { id: 'AST-GW-01', label: 'Edge VPN Gateway (PAN-OS GlobalProtect)' }
    ],
    'AST-API-01': [
      { id: 'INTERNET', label: 'Public Internet' },
      { id: 'AST-GW-01', label: 'Edge VPN Gateway' },
      { id: 'AST-API-01', label: 'Unified Payment Gateway & UPI Switch' }
    ],
    'AST-AUTH-01': [
      { id: 'INTERNET', label: 'Public Internet' },
      { id: 'AST-GW-01', label: 'Edge VPN Gateway' },
      { id: 'AST-AUTH-01', label: 'Customer Auth / OAuth2 Cluster' }
    ],
    'AST-K8S-01': [
      { id: 'INTERNET', label: 'Public Internet' },
      { id: 'AST-GW-01', label: 'Edge VPN Gateway' },
      { id: 'AST-K8S-01', label: 'Production EKS Kubernetes Pods' }
    ],
    'AST-DB-01': [
      { id: 'INTERNET', label: 'Public Internet' },
      { id: 'AST-GW-01', label: 'Edge VPN Gateway' },
      { id: 'AST-API-01', label: 'Payment Gateway API' },
      { id: 'AST-DB-01', label: 'Core Banking PostgreSQL Cluster (Ledger Target)' }
    ],
    'AST-S3-01': [
      { id: 'INTERNET', label: 'Public Internet' },
      { id: 'AST-GW-01', label: 'Edge VPN Gateway' },
      { id: 'AST-API-01', label: 'Payment Gateway API' },
      { id: 'AST-DB-01', label: 'Core Banking PostgreSQL' },
      { id: 'AST-S3-01', label: 'AWS S3 KYC Data Lake (Archive Sink)' }
    ],
    'AST-DEV-01': [
      { id: 'AST-DEV-01', label: 'Isolated Developer Sandbox VM (Air-Gapped)' }
    ]
  };

  return pathMap[assetId] || [{ id: assetId, label: assetId }];
}

/**
 * Computes blast radius indicator for an asset based on downstream critical nodes
 */
export function getAssetBlastRadius(assetId) {
  if (assetId === 'AST-DB-01' || assetId === 'AST-API-01') {
    return {
      severity: 'HIGH',
      description: 'Direct upstream communication path into Core Banking Ledger & KYC Data Lake (480K records)',
      downstreamCount: 2
    };
  }
  if (assetId === 'AST-GW-01') {
    return {
      severity: 'CRITICAL',
      description: 'Perimeter choke point controlling ingress routing to Payment API, Auth Cluster, and Kubernetes pods',
      downstreamCount: 4
    };
  }
  if (assetId === 'AST-DEV-01') {
    return {
      severity: 'NONE',
      description: 'Zero downstream dependencies; isolated within non-routable developer subnet',
      downstreamCount: 0
    };
  }
  return {
    severity: 'MODERATE',
    description: 'Internal service connectivity with bounded lateral escalation boundaries',
    downstreamCount: 1
  };
}
