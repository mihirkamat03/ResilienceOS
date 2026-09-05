/**
 * ResilienceOS Initial Demonstration Dataset
 * Synthetic Enterprise Environment: "FintechCore Systems India"
 * 
 * Demonstrates relational mappings across:
 * Assets -> Vulnerabilities -> Defensive Controls -> FAIR Risks -> Investments -> Remediations -> Compliance -> Telemetry
 */

export const INITIAL_ASSETS = [
  {
    id: 'AST-DB-01',
    name: 'Core Banking PostgreSQL Cluster',
    type: 'Database',
    businessUnit: 'Retail Banking',
    criticality: 'Tier 1',
    criticalityScore: 9.8,
    dataSensitivity: 'Highly Confidential (PCI/PII)',
    networkExposure: 'Internal Protected',
    ipAddress: '10.240.12.44',
    ownerTeam: 'Database Reliability Engineering',
    hourlyDowntimeCost: 550000, // ₹5.5 Lakhs / hr
    recordsCount: 480000,
    upstreamDependencies: ['AST-API-01', 'AST-AUTH-01'],
    downstreamDependencies: ['AST-S3-01'],
    activeVulnerabilitiesCount: 1,
    financialExposure: 24000000, // ₹2.40 Cr Single Loss Expectancy
    existingControls: [
      { name: 'Database Activity Monitoring (DAM)', effectiveness: 0.85, status: 'Active' },
      { name: 'TLS 1.3 Encryption at Rest & Transit', effectiveness: 0.95, status: 'Active' },
      { name: 'Privileged Access Management (PAM)', effectiveness: 0.30, status: 'Degraded' },
      { name: 'Immutable Air-Gapped Backups', effectiveness: 0.40, status: 'Degraded' }
    ]
  },
  {
    id: 'AST-API-01',
    name: 'Unified Payment Gateway & UPI Switch',
    type: 'API Gateway',
    businessUnit: 'Payments & UPI',
    criticality: 'Tier 1',
    criticalityScore: 9.5,
    dataSensitivity: 'Highly Confidential (PCI/PII)',
    networkExposure: 'Internet-Facing',
    ipAddress: '203.0.113.88',
    ownerTeam: 'Payments Infra Core',
    hourlyDowntimeCost: 800000, // ₹8.0 Lakhs / hr
    recordsCount: 1200000,
    upstreamDependencies: ['AST-GW-01'],
    downstreamDependencies: ['AST-DB-01', 'AST-AUTH-01'],
    activeVulnerabilitiesCount: 1,
    financialExposure: 14500000, // ₹1.45 Cr
    existingControls: [
      { name: 'Cloud Web Application Firewall (WAF)', effectiveness: 0.80, status: 'Active' },
      { name: 'API Rate Limiting & Schema Validation', effectiveness: 0.75, status: 'Active' },
      { name: 'mTLS Authentication', effectiveness: 0.60, status: 'Degraded' }
    ]
  },
  {
    id: 'AST-GW-01',
    name: 'Edge Perimeter Firewall & VPN Gateway',
    type: 'Firewall',
    businessUnit: 'Identity & Core Platform',
    criticality: 'Tier 2',
    criticalityScore: 8.2,
    dataSensitivity: 'Internal',
    networkExposure: 'Internet-Facing',
    ipAddress: '198.51.100.1',
    ownerTeam: 'Network Operations',
    hourlyDowntimeCost: 200000, // ₹2.0 Lakhs / hr
    recordsCount: 0,
    upstreamDependencies: [],
    downstreamDependencies: ['AST-API-01', 'AST-AUTH-01', 'AST-K8S-01'],
    activeVulnerabilitiesCount: 1,
    financialExposure: 6500000, // ₹65 Lakhs
    existingControls: [
      { name: 'Geo-IP Blocking & IPS Signatures', effectiveness: 0.70, status: 'Active' },
      { name: 'FIDO2 Multi-Factor Authentication', effectiveness: 0.85, status: 'Active' }
    ]
  },
  {
    id: 'AST-AUTH-01',
    name: 'Customer Authentication & OAuth2 Cluster',
    type: 'Auth Service',
    businessUnit: 'Identity & Core Platform',
    criticality: 'Tier 1',
    criticalityScore: 9.0,
    dataSensitivity: 'Highly Confidential (PCI/PII)',
    networkExposure: 'DMZ',
    ipAddress: '10.240.10.15',
    ownerTeam: 'IAM Security',
    hourlyDowntimeCost: 400000, // ₹4.0 Lakhs / hr
    recordsCount: 850000,
    upstreamDependencies: ['AST-GW-01'],
    downstreamDependencies: ['AST-DB-01'],
    activeVulnerabilitiesCount: 1,
    financialExposure: 2500000, // ₹25 Lakhs
    existingControls: [
      { name: 'Adaptive Risk-Based MFA', effectiveness: 0.65, status: 'Degraded' },
      { name: 'Session Token Encryption', effectiveness: 0.90, status: 'Active' }
    ]
  },
  {
    id: 'AST-S3-01',
    name: 'AWS S3 Compliance & KYC Data Lake',
    type: 'Cloud Storage',
    businessUnit: 'Data & Analytics',
    criticality: 'Tier 2',
    criticalityScore: 7.8,
    dataSensitivity: 'Highly Confidential (PCI/PII)',
    networkExposure: 'Internal Protected',
    ipAddress: 's3.ap-south-1.amazonaws.com/fintechcore-kyc',
    ownerTeam: 'Data Engineering',
    hourlyDowntimeCost: 100000,
    recordsCount: 2400000,
    upstreamDependencies: ['AST-DB-01'],
    downstreamDependencies: [],
    activeVulnerabilitiesCount: 0,
    financialExposure: 800000,
    existingControls: [
      { name: 'KMS Customer Managed Key Encryption', effectiveness: 0.95, status: 'Active' },
      { name: 'S3 Object Lock Compliance Mode', effectiveness: 0.50, status: 'Degraded' }
    ]
  },
  {
    id: 'AST-K8S-01',
    name: 'Production EKS Kubernetes Microservices',
    type: 'Kubernetes Cluster',
    businessUnit: 'Retail Banking',
    criticality: 'Tier 2',
    criticalityScore: 8.0,
    dataSensitivity: 'Confidential',
    networkExposure: 'DMZ',
    ipAddress: '10.240.30.0/24',
    ownerTeam: 'Platform DevOps',
    hourlyDowntimeCost: 350000,
    recordsCount: 0,
    upstreamDependencies: ['AST-GW-01'],
    downstreamDependencies: ['AST-DB-01', 'AST-API-01'],
    activeVulnerabilitiesCount: 1,
    financialExposure: 1200000,
    existingControls: [
      { name: 'Kubernetes Network Policies', effectiveness: 0.60, status: 'Degraded' },
      { name: 'Container Runtime Security (Falco)', effectiveness: 0.80, status: 'Active' }
    ]
  },
  {
    id: 'AST-DEV-01',
    name: 'Isolated Developer Sandbox VM',
    type: 'Web App',
    businessUnit: 'Data & Analytics',
    criticality: 'Tier 4',
    criticalityScore: 2.1,
    dataSensitivity: 'Internal',
    networkExposure: 'Isolated Air-Gapped',
    ipAddress: '172.16.99.12',
    ownerTeam: 'R&D Labs',
    hourlyDowntimeCost: 5000,
    recordsCount: 0,
    upstreamDependencies: [],
    downstreamDependencies: [],
    activeVulnerabilitiesCount: 1,
    financialExposure: 30000, // ₹30,000 (Low exposure despite CVSS 9.8!)
    existingControls: [
      { name: 'VPC Isolation & No Internet Route', effectiveness: 0.95, status: 'Active' }
    ]
  }
];

export const INITIAL_VULNERABILITIES = [
  {
    id: 'VULN-2023-39417',
    cveId: 'CVE-2023-39417',
    title: 'PostgreSQL Extension Script Command Injection & Auth Bypass',
    assetId: 'AST-DB-01',
    cvssV3: 7.5,
    epssScore: 0.74,
    cisaKev: true,
    vector: 'Network / Low Complexity / Low Privileges Required',
    description: 'Flaw in extension script execution allows an authenticated lower-privileged user to inject SQL commands and escalate to superuser on Core Banking PostgreSQL.',
    discoveredDate: '2026-08-28',
    sourceFeed: 'Qualys VMDR',
    status: 'Active'
  },
  {
    id: 'VULN-2024-3400',
    cveId: 'CVE-2024-3400',
    title: 'Palo Alto PAN-OS GlobalProtect Unauthenticated Command Injection',
    assetId: 'AST-GW-01',
    cvssV3: 10.0,
    epssScore: 0.92,
    cisaKev: true,
    vector: 'Network / Zero Complexity / Unauthenticated',
    description: 'Critical command injection vulnerability in the GlobalProtect feature of PAN-OS software allows an unauthenticated attacker to execute arbitrary OS commands with root privileges.',
    discoveredDate: '2026-09-01',
    sourceFeed: 'Tenable.io',
    status: 'Active'
  },
  {
    id: 'VULN-OWASP-API1',
    cveId: 'CVE-2024-21626',
    title: 'Payment Gateway Container Escape & Broken Object Level Authorization',
    assetId: 'AST-API-01',
    cvssV3: 8.6,
    epssScore: 0.68,
    cisaKev: false,
    vector: 'Network / Medium Complexity / Privileges Required',
    description: 'Improper validation of transaction object IDs combined with runc file descriptor leak allows lateral container boundary escape and unauthorized ledger read/write access.',
    discoveredDate: '2026-08-30',
    sourceFeed: 'Wiz CSPM',
    status: 'Active'
  },
  {
    id: 'VULN-2023-48795',
    cveId: 'CVE-2023-48795',
    title: 'SSH & OAuth Key Exchange Protocol Prefix Truncation (Terrapin Attack)',
    assetId: 'AST-AUTH-01',
    cvssV3: 5.9,
    epssScore: 0.32,
    cisaKev: false,
    vector: 'Network / High Complexity / Man-in-the-Middle',
    description: 'Flaw in BOSH/ChaCha20-Poly1305 handshakes enables an on-path attacker to truncate initial extension negotiation packets without sequence number detection.',
    discoveredDate: '2026-08-15',
    sourceFeed: 'Qualys VMDR',
    status: 'Active'
  },
  {
    id: 'VULN-2023-5043',
    cveId: 'CVE-2023-5043',
    title: 'Kubernetes Ingress-NGINX Arbitrary Command Injection via Annotations',
    assetId: 'AST-K8S-01',
    cvssV3: 7.6,
    epssScore: 0.45,
    cisaKev: false,
    vector: 'Network / Low Complexity / Low Privileges',
    description: 'Ingress-NGINX controller fails to sanitize configuration snippet annotations, enabling execution of arbitrary commands within the controller pod context.',
    discoveredDate: '2026-08-20',
    sourceFeed: 'AWS Security Hub',
    status: 'Active'
  },
  {
    id: 'VULN-2024-6387',
    cveId: 'CVE-2024-6387',
    title: 'OpenSSH regreSSHion Remote Unauthenticated Code Execution',
    assetId: 'AST-DEV-01',
    cvssV3: 9.8,
    epssScore: 0.81,
    cisaKev: false,
    vector: 'Network / High Complexity / Unauthenticated Race Condition',
    description: 'Signal handler race condition in OpenSSH server (sshd) allows unauthenticated RCE as root in glibc-based systems (Demonstrated in Isolated Sandbox Lab).',
    discoveredDate: '2026-09-02',
    sourceFeed: 'Qualys VMDR',
    status: 'Active'
  }
];

export const INITIAL_RISKS = [
  {
    id: 'RSK-001',
    title: 'Core Banking DB Compromise & Data Exfiltration',
    vulnId: 'VULN-2023-39417',
    assetId: 'AST-DB-01',
    technicalSeverity: 'HIGH',
    contextualPriority: 'P1 - Immediate',
    riskScore: 94,
    fairMetrics: {
      threatEventFrequency: 14,
      vulnerabilityFactor: 0.48,
      lossEventFrequency: 0.35,
      lossBreakdown: {
        downtimeLoss: 8800000,       // ₹88 Lakhs (16 hrs * ₹5.5L)
        dataBreachLiability: 9200000, // ₹92 Lakhs (48K records * ₹1,916/rec)
        incidentResponse: 3000000,   // ₹30 Lakhs (Retainer & forensics)
        regulatoryFines: 2000000,    // ₹20 Lakhs (RBI compliance penalty tier)
        recoveryCost: 1000000,       // ₹10 Lakhs
        totalLossMagnitude: 24000000 // ₹2.40 Cr Single Loss Expectancy
      },
      expectedAnnualLoss: 8400000,   // ₹84.0 Lakhs EAL (0.35 * ₹2.40 Cr)
      valueAtRisk95: 24000000,       // ₹2.40 Cr VaR
      confidenceRange: {
        p10: 4200000,  // ₹42 Lakhs
        p50: 8400000,  // ₹84 Lakhs
        p90: 16500000  // ₹1.65 Cr
      },
      assumptions: [
        'Asset holds 480K Tier-1 customer financial records subject to DPDP Act',
        'Average restoration MTTR is 16 hours with redundant warm standby replication',
        'Active DAM alerts reduce breach dwell time to under 48 hours'
      ]
    },
    status: 'Open',
    keyDrivers: [
      'Tier 1 Mission Critical Asset (Criticality 9.8)',
      'Known Exploited Vulnerability (CISA KEV active)',
      'Privileged Access Management (PAM) controls currently degraded',
      'High blast radius downstream to KYC archive'
    ],
    recommendedActionId: 'INV-001'
  },
  {
    id: 'RSK-002',
    title: 'UPI Payment Switch Transaction Tampering',
    vulnId: 'VULN-OWASP-API1',
    assetId: 'AST-API-01',
    contextualPriority: 'P1 - Immediate',
    technicalSeverity: 'HIGH',
    riskScore: 89,
    fairMetrics: {
      threatEventFrequency: 18,
      vulnerabilityFactor: 0.38,
      lossEventFrequency: 0.28,
      lossBreakdown: {
        downtimeLoss: 6400000,       // ₹64 Lakhs (8 hrs * ₹8L)
        dataBreachLiability: 4500000,// ₹45 Lakhs
        incidentResponse: 2000000,   // ₹20 Lakhs
        regulatoryFines: 1200000,    // ₹12 Lakhs
        recoveryCost: 400000,        // ₹4 Lakhs
        totalLossMagnitude: 14500000 // ₹1.45 Cr
      },
      expectedAnnualLoss: 4060000,   // ₹40.6 Lakhs EAL
      valueAtRisk95: 14500000,
      confidenceRange: {
        p10: 2200000,
        p50: 4060000,
        p90: 8900000
      },
      assumptions: [
        'Internet-facing ingress point handling 3.2M daily UPI calls',
        'Hourly downtime loss estimated at ₹8.0 Lakhs during peak trading hours'
      ]
    },
    status: 'Open',
    keyDrivers: [
      'Internet-Facing Entry Point',
      'Direct upstream communication channel to Core Banking DB',
      'High volume UPI transaction pipeline'
    ],
    recommendedActionId: 'INV-002'
  },
  {
    id: 'RSK-003',
    title: 'Perimeter Gateway Remote Code Execution via PAN-OS',
    vulnId: 'VULN-2024-3400',
    assetId: 'AST-GW-01',
    technicalSeverity: 'CRITICAL',
    contextualPriority: 'P1 - Immediate',
    riskScore: 92,
    fairMetrics: {
      threatEventFrequency: 25,
      vulnerabilityFactor: 0.65,
      lossEventFrequency: 0.42,
      lossBreakdown: {
        downtimeLoss: 2400000,       // ₹24 Lakhs (12 hrs * ₹2L)
        dataBreachLiability: 1500000,// ₹15 Lakhs
        incidentResponse: 1500000,   // ₹15 Lakhs
        regulatoryFines: 800000,     // ₹8 Lakhs
        recoveryCost: 300000,        // ₹3 Lakhs
        totalLossMagnitude: 6500000  // ₹65 Lakhs
      },
      expectedAnnualLoss: 2730000,   // ₹27.3 Lakhs EAL
      valueAtRisk95: 6500000,
      confidenceRange: {
        p10: 1300000,
        p50: 2730000,
        p90: 5100000
      },
      assumptions: [
        'Edge firewall acts as the initial perimeter choke point for all internal VPCs',
        'Unauthenticated exploitation allows full lateral traversal into DMZ'
      ]
    },
    status: 'Open',
    keyDrivers: [
      'CVSS 10.0 Unauthenticated RCE',
      'Edge Perimeter Exposure',
      'Active in-the-wild exploitation campaigns (CISA KEV)'
    ],
    recommendedActionId: 'INV-003'
  },
  {
    id: 'RSK-004',
    title: 'OAuth Credential Interception on Auth Cluster',
    vulnId: 'VULN-2023-48795',
    assetId: 'AST-AUTH-01',
    technicalSeverity: 'MEDIUM',
    contextualPriority: 'P2 - High',
    riskScore: 68,
    fairMetrics: {
      threatEventFrequency: 8,
      vulnerabilityFactor: 0.20,
      lossEventFrequency: 0.12,
      lossBreakdown: {
        downtimeLoss: 800000,
        dataBreachLiability: 1000000,
        incidentResponse: 500000,
        regulatoryFines: 150000,
        recoveryCost: 50000,
        totalLossMagnitude: 2500000
      },
      expectedAnnualLoss: 300000, // ₹3.0 Lakhs
      valueAtRisk95: 2500000,
      confidenceRange: {
        p10: 120000,
        p50: 300000,
        p90: 680000
      },
      assumptions: [
        'Requires Man-in-the-Middle network vantage point to execute'
      ]
    },
    status: 'Open',
    keyDrivers: [
      'Tier 1 Identity Infrastructure',
      'Weak prefix truncation validation in legacy handshake'
    ],
    recommendedActionId: 'INV-004'
  },
  {
    id: 'RSK-005',
    title: 'Kubernetes Controller RCE via Ingress Annotations',
    vulnId: 'VULN-2023-5043',
    assetId: 'AST-K8S-01',
    technicalSeverity: 'HIGH',
    contextualPriority: 'P2 - High',
    riskScore: 62,
    fairMetrics: {
      threatEventFrequency: 6,
      vulnerabilityFactor: 0.25,
      lossEventFrequency: 0.15,
      lossBreakdown: {
        downtimeLoss: 700000,
        dataBreachLiability: 200000,
        incidentResponse: 200000,
        regulatoryFines: 50000,
        recoveryCost: 50000,
        totalLossMagnitude: 1200000
      },
      expectedAnnualLoss: 180000, // ₹1.8 Lakhs
      valueAtRisk95: 1200000,
      confidenceRange: {
        p10: 80000,
        p50: 180000,
        p90: 390000
      },
      assumptions: [
        'Falco runtime daemon alerts on namespace escape within 15 seconds'
      ]
    },
    status: 'Open',
    keyDrivers: [
      'Multi-tenant pod orchestration host',
      'Annotation injection flaw in ingress controller'
    ],
    recommendedActionId: 'INV-005'
  },
  {
    id: 'RSK-006',
    title: 'OpenSSH Race Condition on Sandbox VM',
    vulnId: 'VULN-2024-6387',
    assetId: 'AST-DEV-01',
    technicalSeverity: 'CRITICAL', // CVSS 9.8!
    contextualPriority: 'P4 - Low', // Contextual Priority is LOW because of isolated asset!
    riskScore: 24,
    fairMetrics: {
      threatEventFrequency: 2,
      vulnerabilityFactor: 0.05,
      lossEventFrequency: 0.01,
      lossBreakdown: {
        downtimeLoss: 10000,
        dataBreachLiability: 0,
        incidentResponse: 15000,
        regulatoryFines: 0,
        recoveryCost: 5000,
        totalLossMagnitude: 30000 // Only ₹30,000!
      },
      expectedAnnualLoss: 300, // ₹300 EAL
      valueAtRisk95: 30000,
      confidenceRange: {
        p10: 100,
        p50: 300,
        p90: 800
      },
      assumptions: [
        'Asset is completely isolated from production networks',
        'Contains zero customer PII or transaction keys'
      ]
    },
    status: 'Open',
    keyDrivers: [
      'High Technical CVSS (9.8)',
      'BUT: Tier 4 Non-Critical Asset & Zero Business Data Exposure'
    ],
    recommendedActionId: 'INV-006'
  }
];

export const INITIAL_INVESTMENTS = [
  {
    id: 'INV-001',
    name: 'Privileged Access Management (PAM) & DB Vaulting',
    category: 'IAM',
    cost: 800000, // ₹8.0 Lakhs
    annualizedOpEx: 150000,
    targetRiskIds: ['RSK-001'],
    targetAssetIds: ['AST-DB-01'],
    riskReductionEAL: 6200000, // Reduces DB EAL by ₹62 Lakhs!
    rosiPercent: 675,
    implementationDays: 14,
    effort: 'Medium',
    description: 'Deploy CyberArk/HashiCorp dynamic session rotation and just-in-time PostgreSQL credential brokering to eliminate extension injection vectors.',
    frameworkMappings: ['NIST CSF PR.AC-1', 'RBI Sec 4.2', 'ISO 27001 A.9.2']
  },
  {
    id: 'INV-002',
    name: 'API Security Mesh & Runtime Schema Validation',
    category: 'Application Security',
    cost: 650000, // ₹6.5 Lakhs
    annualizedOpEx: 120000,
    targetRiskIds: ['RSK-002'],
    targetAssetIds: ['AST-API-01'],
    riskReductionEAL: 3100000, // Reduces API EAL by ₹31 Lakhs
    rosiPercent: 376,
    implementationDays: 10,
    effort: 'Low',
    description: 'Enforce strict OpenAPI schema validation and container boundary seccomp profiles on the UPI gateway ingress tier.',
    frameworkMappings: ['NIST CSF PR.DS-5', 'SEBI CSCRF Sec 7', 'OWASP API Top 10']
  },
  {
    id: 'INV-003',
    name: 'Zero-Trust Perimeter & FIDO2 Hardware MFA',
    category: 'IAM',
    cost: 1200000, // ₹12.0 Lakhs
    annualizedOpEx: 250000,
    targetRiskIds: ['RSK-003', 'RSK-004'],
    targetAssetIds: ['AST-GW-01', 'AST-AUTH-01'],
    riskReductionEAL: 2400000, // Reduces Gateway/Auth EAL by ₹24 Lakhs
    rosiPercent: 100,
    implementationDays: 21,
    effort: 'High',
    description: 'Upgrade PAN-OS edge clusters to patched firmware and mandate hardware security keys for all VPN and administrative gateway ingress.',
    frameworkMappings: ['NIST CSF PR.AC-7', 'RBI Sec 3.1', 'ISO 27001 A.9.4']
  },
  {
    id: 'INV-004',
    name: 'Immutable Air-Gapped Backup Vaulting & Rapid DR',
    category: 'Data Protection',
    cost: 700000, // ₹7.0 Lakhs
    annualizedOpEx: 100000,
    targetRiskIds: ['RSK-001'],
    targetAssetIds: ['AST-DB-01', 'AST-S3-01'],
    riskReductionEAL: 1800000, // Reduces downtime loss component by 65%
    rosiPercent: 157,
    implementationDays: 12,
    effort: 'Medium',
    description: 'Establish write-once-read-many (WORM) AWS S3 Glacier vaulting with automated hourly snapshot integrity verification.',
    frameworkMappings: ['NIST CSF PR.IP-4', 'RBI Sec 8.1', 'ISO 27001 A.12.3']
  },
  {
    id: 'INV-005',
    name: 'Kubernetes Cilium eBPF Microsegmentation',
    category: 'Cloud Security',
    cost: 500000, // ₹5.0 Lakhs
    annualizedOpEx: 80000,
    targetRiskIds: ['RSK-005'],
    targetAssetIds: ['AST-K8S-01'],
    riskReductionEAL: 140000, // Reduces K8s EAL by ₹1.4 Lakhs
    rosiPercent: -72,
    implementationDays: 8,
    effort: 'Low',
    description: 'Replace standard kube-proxy with Cilium eBPF network security policies for L7 ingress filtering and pod lateral movement lockdown.',
    frameworkMappings: ['NIST CSF PR.PT-4', 'SEBI CSCRF Sec 12']
  },
  {
    id: 'INV-006',
    name: 'Automated Dev Sandbox Ephemeral Containerization',
    category: 'Application Security',
    cost: 150000, // ₹1.5 Lakhs
    annualizedOpEx: 20000,
    targetRiskIds: ['RSK-006'],
    targetAssetIds: ['AST-DEV-01'],
    riskReductionEAL: 250,
    rosiPercent: -99,
    implementationDays: 3,
    effort: 'Low',
    description: 'Migrate static developer VMs to disposable Docker sandboxes with 4-hour time-to-live expiration.',
    frameworkMappings: ['NIST CSF PR.IP-1']
  }
];

export const INITIAL_REMEDIATIONS = [
  {
    id: 'REM-101',
    title: 'PostgreSQL Patch 15.4 Upgrade & Extension Whitelist',
    riskId: 'RSK-001',
    assetId: 'AST-DB-01',
    investmentId: 'INV-001',
    owner: 'Arjun Mehta (DBA Lead)',
    priority: 'Critical',
    cost: 800000,
    riskReduction: 6200000,
    dueDate: '2026-09-12',
    status: 'In Progress'
  },
  {
    id: 'REM-102',
    title: 'UPI Gateway Ingress Schema Validation Deployment',
    riskId: 'RSK-002',
    assetId: 'AST-API-01',
    investmentId: 'INV-002',
    owner: 'Pooja Sharma (API Lead)',
    priority: 'High',
    cost: 650000,
    riskReduction: 3100000,
    dueDate: '2026-09-15',
    status: 'Assigned'
  },
  {
    id: 'REM-103',
    title: 'Emergency PAN-OS 11.1.2 Hotfix Application on Edge Gateway',
    riskId: 'RSK-003',
    assetId: 'AST-GW-01',
    investmentId: 'INV-003',
    owner: 'Vikram Joshi (SecOps Lead)',
    priority: 'Critical',
    cost: 1200000,
    riskReduction: 2400000,
    dueDate: '2026-09-08',
    status: 'Identified'
  },
  {
    id: 'REM-104',
    title: 'S3 KYC Bucket Policy Enforcement & Object Lock',
    riskId: 'RSK-004',
    assetId: 'AST-S3-01',
    investmentId: 'INV-004',
    owner: 'Sanjay Nair (Cloud Architect)',
    priority: 'Medium',
    cost: 700000,
    riskReduction: 1800000,
    dueDate: '2026-09-20',
    status: 'Assigned'
  }
];

export const INITIAL_UNIFIED_CONTROLS = [
  {
    id: 'CTRL-MFA-01',
    name: 'Phishing-Resistant FIDO2 Multi-Factor Authentication',
    description: 'Enforce hardware security keys (FIDO2/WebAuthn) and adaptive MFA across all perimeter ingress gateways and administrative consoles.',
    category: 'IAM & Access Governance',
    status: 'Implemented',
    owner: 'IAM Security (Vikram Joshi)',
    evidenceStatus: 'Verified',
    lastReviewed: '2026-09-01',
    relatedAssets: ['AST-GW-01', 'AST-AUTH-01'],
    relatedRisks: ['RSK-003', 'RSK-004'],
    relatedRemediationTasks: ['REM-103'],
    recommendedAction: 'Maintain strict WebAuthn token requirement; block legacy NTLM/basic auth protocols.',
    frameworkMappings: [
      { framework: 'NIST CSF 2.0', code: 'PR.AC-7', requirement: 'Users, devices, and other assets are authenticated (e.g., MFA, single sign-on).' },
      { framework: 'ISO/IEC 27001:2022', code: 'A.9.4.2', requirement: 'Secure log-on procedures and multi-factor authentication for sensitive access.' },
      { framework: 'RBI Master Direction', code: 'Sec 3.1.2', requirement: 'Mandatory two-factor authentication with dynamic/hardware tokens for perimeter and admin logins.' },
      { framework: 'SEBI CSCRF', code: 'Sec 4.1', requirement: 'Mandatory phishing-resistant MFA across all market infrastructure access gateways.' }
    ]
  },
  {
    id: 'CTRL-PAM-01',
    name: 'Privileged Access Management & Just-in-Time Rotation',
    description: 'Dynamic session brokering and zero standing privileges for core database clusters and payment ledger mutations.',
    category: 'IAM & Access Governance',
    status: 'Partially Implemented',
    owner: 'Database Reliability (Arjun Mehta)',
    evidenceStatus: 'Available',
    lastReviewed: '2026-08-20',
    relatedAssets: ['AST-DB-01', 'AST-AUTH-01'],
    relatedRisks: ['RSK-001'],
    relatedRemediationTasks: ['REM-101'],
    recommendedAction: 'Deploy CyberArk/HashiCorp dynamic session rotation to eliminate direct root DB access.',
    frameworkMappings: [
      { framework: 'NIST CSF 2.0', code: 'PR.AC-1', requirement: 'Identities and credentials are managed for authorized devices, users, and processes.' },
      { framework: 'ISO/IEC 27001:2022', code: 'A.9.2.3', requirement: 'Management of privileged access rights is strictly restricted and controlled.' },
      { framework: 'RBI Master Direction', code: 'Sec 4.2.1', requirement: 'Mandates database direct query restriction and JIT privilege elevation for banking ledgers.' },
      { framework: 'SEBI CSCRF', code: 'Sec 4.2', requirement: 'Privileged credentials for market core components must enforce automated periodic rotation.' }
    ]
  },
  {
    id: 'CTRL-PATCH-01',
    name: 'Continuous Ingress Vulnerability Remediation & SLA',
    description: 'Automated continuous vulnerability scanning and mandatory 48-hour SLA for public ingress vulnerabilities (CVSS >= 9.0 or CISA KEV active).',
    category: 'Vulnerability Management',
    status: 'Partially Implemented',
    owner: 'SecOps Lead (Vikram Joshi)',
    evidenceStatus: 'Pending Review',
    lastReviewed: '2026-09-04',
    relatedAssets: ['AST-GW-01', 'AST-API-01'],
    relatedRisks: ['RSK-003', 'RSK-002'],
    relatedRemediationTasks: ['REM-103', 'REM-102'],
    recommendedAction: 'Apply PAN-OS 11.1.2 hotfix to clear open CVE-2024-3400 finding and restore compliance SLA.',
    frameworkMappings: [
      { framework: 'NIST CSF 2.0', code: 'ID.RA-1', requirement: 'Asset vulnerabilities are identified, validated, and documented continuously.' },
      { framework: 'ISO/IEC 27001:2022', code: 'A.12.6.1', requirement: 'Management of technical vulnerabilities is performed within defined timeframes.' },
      { framework: 'RBI Master Direction', code: 'Sec 3.1.4', requirement: 'Critical vulnerabilities on internet-facing assets must be remediated within 48 hours.' },
      { framework: 'SEBI CSCRF', code: 'Sec 8.2', requirement: 'Continuous automated vulnerability scanning across all external interfaces.' }
    ]
  },
  {
    id: 'CTRL-WAF-01',
    name: 'API Security Gateway & Strict Payload Schema Validation',
    description: 'Cloud WAF L7 inspection, mTLS authentication, and strict OpenAPI schema validation on public transaction ingress endpoints.',
    category: 'Application Security',
    status: 'Implemented',
    owner: 'API Platform Core (Pooja Sharma)',
    evidenceStatus: 'Verified',
    lastReviewed: '2026-08-25',
    relatedAssets: ['AST-API-01'],
    relatedRisks: ['RSK-002'],
    relatedRemediationTasks: ['REM-102'],
    recommendedAction: 'Enforce strict schema validation and rate limiting on UPI transaction ingress.',
    frameworkMappings: [
      { framework: 'NIST CSF 2.0', code: 'PR.DS-5', requirement: 'Protections against data leaks are implemented across API endpoints and databases.' },
      { framework: 'ISO/IEC 27001:2022', code: 'A.14.1.2', requirement: 'Securing application services on public networks.' },
      { framework: 'RBI Master Direction', code: 'Sec 5.3.1', requirement: 'Web Application Firewall and API schema validation on public transaction switches.' },
      { framework: 'SEBI CSCRF', code: 'Sec 7.3', requirement: 'All public APIs interacting with payment infrastructure must enforce payload validation and mTLS.' }
    ]
  },
  {
    id: 'CTRL-BACKUP-01',
    name: 'Immutable Air-Gapped Backup Vaulting & Disaster Recovery',
    description: 'Write-once-read-many (WORM) AWS S3 Glacier vaulting with automated hourly snapshot integrity and periodic recovery drills.',
    category: 'Data Protection & Resilience',
    status: 'Partially Implemented',
    owner: 'Cloud Storage & DR (Sanjay Nair)',
    evidenceStatus: 'Expired',
    lastReviewed: '2026-07-15',
    relatedAssets: ['AST-DB-01', 'AST-S3-01'],
    relatedRisks: ['RSK-001', 'RSK-004'],
    relatedRemediationTasks: ['REM-104'],
    recommendedAction: 'Conduct quarterly recovery test drill and update WORM vault compliance evidence verification.',
    frameworkMappings: [
      { framework: 'NIST CSF 2.0', code: 'PR.IP-4', requirement: 'Backups of information are conducted, maintained, and tested.' },
      { framework: 'ISO/IEC 27001:2022', code: 'A.12.3.1', requirement: 'Information backup copies shall be taken and tested regularly.' },
      { framework: 'RBI Master Direction', code: 'Sec 8.1.3', requirement: 'Immutable WORM backups with periodic automated recovery drills for financial ledger data.' },
      { framework: 'SEBI CSCRF', code: 'Sec 11.2', requirement: 'Near-real-time backup replication with immutable air-gap controls.' }
    ]
  },
  {
    id: 'CTRL-SEG-01',
    name: 'Kubernetes Microsegmentation & Boundary Ingress Filtering',
    description: 'Cilium eBPF network security policies enforcing default-deny between namespaces and isolating application clusters.',
    category: 'Network Security',
    status: 'Implemented',
    owner: 'Platform Engineering',
    evidenceStatus: 'Verified',
    lastReviewed: '2026-08-28',
    relatedAssets: ['AST-K8S-01'],
    relatedRisks: ['RSK-005'],
    relatedRemediationTasks: [],
    recommendedAction: 'Maintain strict eBPF L7 filtering rules between worker nodes and ingress.',
    frameworkMappings: [
      { framework: 'NIST CSF 2.0', code: 'PR.AC-5', requirement: 'Network integrity is protected (e.g., network segmentation, boundary protection).' },
      { framework: 'ISO/IEC 27001:2022', code: 'A.13.1.3', requirement: 'Segregation in networks to separate information services and systems.' },
      { framework: 'RBI Master Direction', code: 'Sec 3.2.1', requirement: 'Strict zone segregation between DMZ, application tier, and core database clusters.' },
      { framework: 'SEBI CSCRF', code: 'Sec 6.1', requirement: 'Network microsegmentation isolating critical transaction processing clusters.' }
    ]
  },
  {
    id: 'CTRL-ENC-01',
    name: 'Cryptographic Key Management & Data Encryption (At-Rest & Transit)',
    description: 'Mandatory AES-256 KMS customer-managed key encryption and TLS 1.3 enforcement across all sensitive databases and storage lakes.',
    category: 'Cryptography & Data Protection',
    status: 'Implemented',
    owner: 'Infra Security Lead',
    evidenceStatus: 'Verified',
    lastReviewed: '2026-08-22',
    relatedAssets: ['AST-DB-01', 'AST-S3-01', 'AST-AUTH-01'],
    relatedRisks: ['RSK-001', 'RSK-004'],
    relatedRemediationTasks: [],
    recommendedAction: 'Maintain automated 90-day AWS KMS customer key rotation cycles.',
    frameworkMappings: [
      { framework: 'NIST CSF 2.0', code: 'PR.DS-1', requirement: 'Data-at-rest and data-in-transit are protected using approved cryptography.' },
      { framework: 'ISO/IEC 27001:2022', code: 'A.10.1.1', requirement: 'Policy on the use of cryptographic controls for information protection.' },
      { framework: 'RBI Master Direction', code: 'Sec 6.1.1', requirement: 'Mandatory AES-256 and TLS 1.3 encryption across all customer financial data storage.' },
      { framework: 'SEBI CSCRF', code: 'Sec 5.2', requirement: 'Hardware Security Module (HSM) key storage and TLS 1.3 enforcement.' }
    ]
  }
];

export const INITIAL_EVIDENCE_RECORDS = [
  {
    id: 'EVD-001',
    controlId: 'CTRL-MFA-01',
    title: 'Okta FIDO2 WebAuthn Policy Export',
    type: 'IAM Policy Snapshot',
    status: 'Verified',
    collectedAt: '2026-09-01 10:30 IST',
    expiresAt: '2026-10-01',
    source: 'Okta Identity Cloud API',
    description: 'Simulated evidence: Policy JSON export confirming hardware token FIDO2 enforcement on admin groups.'
  },
  {
    id: 'EVD-002',
    controlId: 'CTRL-PAM-01',
    title: 'CyberArk JIT Credential Rotation Audit Log',
    type: 'Access Review Record',
    status: 'Available',
    collectedAt: '2026-08-20 14:15 IST',
    expiresAt: '2026-09-20',
    source: 'CyberArk Enterprise Vault',
    description: 'Simulated evidence: Dynamic credential rotation audit report for PostgreSQL root DBA access.'
  },
  {
    id: 'EVD-003',
    controlId: 'CTRL-PATCH-01',
    title: 'Qualys Edge Perimeter Vulnerability Report',
    type: 'Vulnerability Scan Report',
    status: 'Pending Review',
    collectedAt: '2026-09-04 08:00 IST',
    expiresAt: '2026-09-11',
    source: 'Qualys VMDR Scanner',
    description: 'Simulated evidence: Vulnerability scan output highlighting active CVE-2024-3400 finding on PAN-OS edge gateway.'
  },
  {
    id: 'EVD-004',
    controlId: 'CTRL-BACKUP-01',
    title: 'AWS S3 Glacier WORM Vault Recovery Drill Log',
    type: 'Backup Verification Report',
    status: 'Expired',
    collectedAt: '2026-07-15 12:00 IST',
    expiresAt: '2026-08-15',
    source: 'AWS CloudWatch / S3 Audit',
    description: 'Simulated evidence: Disaster recovery simulation drill report (exceeded 30-day freshness SLA; review required).'
  },
  {
    id: 'EVD-005',
    controlId: 'CTRL-WAF-01',
    title: 'Cloudflare WAF & API Schema Enforcement Export',
    type: 'Security Configuration Export',
    status: 'Verified',
    collectedAt: '2026-08-25 18:20 IST',
    expiresAt: '2026-11-25',
    source: 'Cloudflare WAF API',
    description: 'Simulated evidence: Active WAF rule configuration enforcing payload validation and rate limits on payment APIs.'
  },
  {
    id: 'EVD-006',
    controlId: 'CTRL-SEG-01',
    title: 'Cilium eBPF Default-Deny Cluster Network Policy',
    type: 'Container Security Policy',
    status: 'Verified',
    collectedAt: '2026-08-28 09:45 IST',
    expiresAt: '2026-11-28',
    source: 'Kubernetes Cluster Telemetry',
    description: 'Simulated evidence: Cilium L7 policy manifests verifying strict egress/ingress microsegmentation.'
  },
  {
    id: 'EVD-007',
    controlId: 'CTRL-ENC-01',
    title: 'AWS KMS Key Rotation & TLS 1.3 Benchmark',
    type: 'Cryptographic Audit Report',
    status: 'Verified',
    collectedAt: '2026-08-22 11:10 IST',
    expiresAt: '2026-11-22',
    source: 'AWS KMS & Qualys SSL Labs',
    description: 'Simulated evidence: Automated key rotation log and SSL Labs A+ TLS 1.3 verification certificate.'
  }
];

export const INITIAL_COMPLIANCE_CONTROLS = INITIAL_UNIFIED_CONTROLS;

export const INITIAL_HISTORICAL_SNAPSHOTS = [
  { month: 'Apr 2026', exposureCr: 6.80, event: 'Q1 Baseline Assessment', timestamp: '2026-04-30' },
  { month: 'May 2026', exposureCr: 6.20, event: 'WAF & EDR Rollout across Payments Tier', timestamp: '2026-05-31' },
  { month: 'Jun 2026', exposureCr: 5.90, event: 'Cloud Posture Remediation & S3 Object Lock', timestamp: '2026-06-30' },
  { month: 'Jul 2026', exposureCr: 5.10, event: 'MFA Enforcement on Dev Tier & Identity Mesh', timestamp: '2026-07-31' },
  { month: 'Aug 2026', exposureCr: 4.85, event: 'MTD Verified Remediations (-₹1.42 Cr Reduction)', timestamp: '2026-08-31' }
];

export const INITIAL_TELEMETRY_FEEDS = [
  {
    id: 'FEED-001',
    name: 'Qualys VMDR Infrastructure Scanner',
    type: 'Vulnerability Scanner',
    vendor: 'Qualys Inc.',
    lastSync: '4 minutes ago',
    recordsIngested: 2481,
    status: 'Healthy',
    dataFreshnessMinutes: 4,
    activeFindingsCount: 4
  },
  {
    id: 'FEED-002',
    name: 'Wiz Cloud Security Posture (CSPM)',
    type: 'Cloud Posture (CSPM)',
    vendor: 'Wiz.io',
    lastSync: '12 minutes ago',
    recordsIngested: 940,
    status: 'Healthy',
    dataFreshnessMinutes: 12,
    activeFindingsCount: 2
  },
  {
    id: 'FEED-003',
    name: 'Okta Identity Cloud & AD Telemetry',
    type: 'Identity & IAM',
    vendor: 'Okta Identity',
    lastSync: '1 minute ago',
    recordsIngested: 5120,
    status: 'Healthy',
    dataFreshnessMinutes: 1,
    activeFindingsCount: 1
  },
  {
    id: 'FEED-004',
    name: 'Splunk Enterprise Security SIEM',
    type: 'SIEM / XDR',
    vendor: 'Splunk Inc.',
    lastSync: '30 seconds ago',
    recordsIngested: 148200,
    status: 'Healthy',
    dataFreshnessMinutes: 1,
    activeFindingsCount: 3
  }
];
