/**
 * OpenAPI 3.0 Specification for ResilienceOS Authoritative Decision Engine API
 * Problem Statement 26105 - AI-Powered Continuous Cyber Risk Quantification & Investment Optimization Platform
 */
export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'ResilienceOS Decision Engine API',
    version: '2.4.0',
    description: `
**Problem Statement 26105**: Continuous Quantitative Cyber Risk Intelligence & Capital Investment Optimization Platform.

This API serves as the authoritative backend decision layer for ResilienceOS:
- **Open FAIR Quantitative Modeling**: Calculates Threat Event Frequency (TEF), Vulnerability Exploitability, Single Loss Expectancy (SLE), and Annualized Loss Expectancy (ALE).
- **0/1 Knapsack Budget Optimization**: Computes mathematically optimal control portfolios and Return on Security Investment (ROSI).
- **Attack Graph Traversal**: Maps lateral movement paths and critical chokepoints across banking infrastructure.
- **Deterministic Sensitivity Simulation**: Evaluates what-if operational shifts (patch delays, MFA enforcement).
- **Continuous Telemetry Ingestion**: Processes live SIEM, EDR, and CSPM event streams.
- **Regulatory Framework Compliance**: Tracks automated coverage for NIST CSF 2.0, RBI Master Direction, ISO 27001, and SEBI CSCRF.
    `,
    contact: {
      name: 'Team ByteMe / FintechCore Systems',
      email: 'team@resilienceos.internal'
    }
  },
  servers: [
    {
      url: '/api',
      description: 'Current API Host'
    },
    {
      url: 'http://localhost:5000/api',
      description: 'Local Development Server'
    }
  ],
  tags: [
    { name: 'System', description: 'System health, uptime, and engine diagnostics' },
    { name: 'FAIR Risk Engine', description: 'Open FAIR quantitative risk modeling and financial calculations' },
    { name: 'Investment Optimizer', description: '0/1 Knapsack dynamic programming algorithm for capital allocation' },
    { name: 'Attack Graph', description: 'Topology graph traversal, entry points, lateral movement paths, and chokepoints' },
    { name: 'What-If Simulator', description: 'Deterministic sensitivity analysis for operational and architecture shifts' },
    { name: 'Telemetry Stream', description: 'Real-time SIEM, EDR, and CSPM event ingestion and posture cascade' },
    { name: 'Compliance Intelligence', description: 'Regulatory framework alignment and automated gap prioritization' }
  ],
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'System health and engine readiness check',
        description: 'Returns the health status, uptime, and state of all 6 core mathematical decision engines.',
        responses: {
          '200': {
            description: 'All decision engines are active and healthy',
            content: {
              'application/json': {
                example: {
                  success: true,
                  status: 'healthy',
                  service: 'ResilienceOS Authoritative Decision Engine API',
                  version: '2.4.0',
                  uptimeSeconds: 142,
                  timestamp: '2026-09-09T23:30:00.000Z',
                  engines: {
                    fair: 'Open FAIR Quantitative v2.4 (Active)',
                    optimizer: '0/1 Knapsack Dynamic Programming (Active)',
                    graph: 'DAG Attack Path & Blast Radius (Active)',
                    simulator: 'Deterministic Sensitivity Analysis (Active)',
                    telemetry: 'Stream Ingestion Cascade (Active)',
                    compliance: 'Unified Control Framework (Active)'
                  }
                }
              }
            }
          }
        }
      }
    },
    '/risks': {
      get: {
        tags: ['FAIR Risk Engine'],
        summary: 'Get all active quantified enterprise risks',
        description: 'Returns the complete register of active cybersecurity risks, fully quantified with Open FAIR metrics, loss breakdowns, and risk scores.',
        responses: {
          '200': {
            description: 'Successfully retrieved quantified risks',
            content: {
              'application/json': {
                example: {
                  success: true,
                  count: 6,
                  totalEAL: 15726000,
                  risks: [
                    {
                      id: 'RSK-001',
                      title: 'Core Banking DB Compromise & Data Exfiltration',
                      assetName: 'Core Banking PostgreSQL Cluster',
                      assetCriticality: 'Tier 1',
                      cveId: 'CVE-2023-39417',
                      cvssScore: 9.8,
                      fairMetrics: {
                        threatEventFrequency: 1.2,
                        vulnerabilityFactor: 0.28,
                        lossEventFrequency: 0.35,
                        singleLossExpectancy: 24000000,
                        expectedAnnualLoss: 8400000,
                        valueAtRisk95: 28560000,
                        lossBreakdown: {
                          downtimeLoss: 1600000,
                          dataBreachLiability: 18393600,
                          incidentResponse: 3000000,
                          regulatoryFines: 2000000,
                          recoveryCost: 1000000
                        }
                      },
                      riskScore: 94,
                      formattedEAL: '₹84.00 L',
                      formattedSLE: '₹2.40 Cr'
                    }
                  ]
                }
              }
            }
          }
        }
      }
    },
    '/fair/calculate': {
      post: {
        tags: ['FAIR Risk Engine'],
        summary: 'Execute real-time Open FAIR quantitative risk calculation',
        description: 'Computes Threat Event Frequency (TEF), Vulnerability Exploitability, Loss Magnitude Breakdown, and Annualized Loss Expectancy (ALE/EAL).',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              example: {
                assetId: 'AST-DB-01',
                vulnId: 'VULN-2023-39417',
                modifiers: {
                  patchDelayDays: 0,
                  targetEffectiveness: 0.95
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'FAIR risk calculation completed successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  calculation: {
                    targetAsset: { id: 'AST-DB-01', name: 'Core Banking PostgreSQL Cluster', criticality: 'Tier 1' },
                    targetVulnerability: { id: 'VULN-2023-39417', cveId: 'CVE-2023-39417', cvssV3: 9.8 },
                    fairMetrics: {
                      threatEventFrequency: 1.2,
                      vulnerabilityFactor: 0.28,
                      lossEventFrequency: 0.35,
                      singleLossExpectancy: 24000000,
                      expectedAnnualLoss: 8400000,
                      valueAtRisk95: 28560000
                    },
                    riskScore: 94,
                    formattedEAL: '₹84.00 L',
                    formattedSLE: '₹2.40 Cr'
                  }
                }
              }
            }
          },
          '400': {
            description: 'Invalid calculation parameters',
            content: {
              'application/json': {
                example: { success: false, error: { message: 'Invalid asset or vulnerability configuration' } }
              }
            }
          }
        }
      }
    },
    '/optimizer/solve': {
      post: {
        tags: ['Investment Optimizer'],
        summary: 'Solve 0/1 Knapsack optimal security budget allocation',
        description: 'Applies dynamic programming to select the exact portfolio of security mitigations maximizing risk reduction within a given capital budget limit.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              example: {
                budget: 2000000,
                baselineExposure: 15726000
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Optimal investment portfolio solved',
            content: {
              'application/json': {
                example: {
                  success: true,
                  solution: {
                    budget: 2000000,
                    formattedBudget: '₹20.00 L',
                    baselineExposure: 15726000,
                    selectedCount: 3,
                    selectedControls: [
                      { id: 'INV-001', name: 'FIDO2 Hardware MFA & PAM Vaulting', cost: 800000, riskReduction: 5900000 },
                      { id: 'INV-004', name: 'WORM Immutable DB Backup Replication', cost: 700000, riskReduction: 3400000 },
                      { id: 'INV-003', name: 'Kubernetes Cilium eBPF Microsegmentation', cost: 500000, riskReduction: 1900000 }
                    ],
                    totalCost: 2000000,
                    formattedTotalCost: '₹20.00 L',
                    remainingBudget: 0,
                    totalRiskReduction: 11200000,
                    formattedTotalRiskReduction: '₹1.12 Cr',
                    residualExposure: 4526000,
                    formattedResidualExposure: '₹45.26 L',
                    rosi: 460.0,
                    rosiRatio: 5.6
                  }
                }
              }
            }
          }
        }
      }
    },
    '/graph/attack-paths': {
      get: {
        tags: ['Attack Graph'],
        summary: 'Get enterprise attack graph topology and lateral traversal paths',
        description: 'Computes directed graph nodes, communication edges, perimeter entry points, and active vulnerable lateral attack paths.',
        responses: {
          '200': {
            description: 'Graph topology computed successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  graphData: {
                    topologySummary: { totalNodes: 8, totalEdges: 8, vulnerableEdgeCount: 3, entryPointsCount: 2 },
                    nodes: [{ id: 'INTERNET', name: 'Public Internet', isEntryPoint: true }, { id: 'AST-GW-01', name: 'Edge VPN Gateway' }],
                    edges: [{ id: 'EDGE-01', from: 'INTERNET', to: 'AST-GW-01', isVulnerablePath: true }],
                    vulnerablePaths: [{ id: 'EDGE-01', from: 'INTERNET', to: 'AST-GW-01' }]
                  }
                }
              }
            }
          }
        }
      }
    },
    '/graph/chokepoints': {
      get: {
        tags: ['Attack Graph'],
        summary: 'Identify critical enterprise choke points and blast radius',
        description: 'Analyzes topology bottleneck nodes where targeted defensive controls cut off downstream attack propagation.',
        responses: {
          '200': {
            description: 'Chokepoints evaluated successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  chokepointData: {
                    primaryChokepoint: {
                      assetId: 'AST-GW-01',
                      assetName: 'Edge VPN Gateway',
                      chokeScore: 90,
                      blastRadius: { severity: 'CRITICAL', downstreamCount: 4 }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/simulator/scenarios': {
      get: {
        tags: ['What-If Simulator'],
        summary: 'List pre-configured defensible what-if enterprise scenarios',
        responses: {
          '200': {
            description: 'Retrieved scenarios',
            content: {
              'application/json': {
                example: {
                  success: true,
                  scenarios: [
                    { id: 'SCENARIO_MFA', name: 'Enforce FIDO2 Hardware MFA & PAM on Database' },
                    { id: 'SCENARIO_DELAY_PATCH', name: 'Delay Emergency PAN-OS Patch by 30 Days' }
                  ]
                }
              }
            }
          }
        }
      }
    },
    '/simulator/simulate': {
      post: {
        tags: ['What-If Simulator'],
        summary: 'Run deterministic sensitivity analysis on enterprise posture',
        description: 'Simulates the financial impact of operational delay (patch postponement), control hardening (MFA), or architecture shifts.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              example: {
                scenarioId: 'SCENARIO_DELAY_PATCH',
                customPatchDelayDays: 30,
                totalBaselineExposure: 15726000
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Simulation completed successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  simulation: {
                    scenario: { id: 'SCENARIO_DELAY_PATCH', name: 'Delay Emergency PAN-OS Patch by 30 Days' },
                    baselineMetrics: { expectedAnnualLoss: 2296000, formattedEAL: '₹22.96 L' },
                    simulatedMetrics: { expectedAnnualLoss: 3075000, formattedEAL: '₹30.75 L' },
                    impact: {
                      riskDelta: -779000,
                      formattedRiskDelta: '₹7.79 L',
                      direction: 'INCREASED',
                      projectedTotalExposure: 16505000,
                      formattedProjectedExposure: '₹1.65 Cr'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/telemetry/feeds': {
      get: {
        tags: ['Telemetry Stream'],
        summary: 'List configured telemetry ingestion feeds',
        responses: {
          '200': {
            description: 'Retrieved telemetry feeds',
            content: {
              'application/json': {
                example: {
                  success: true,
                  feeds: [
                    { id: 'FEED-001', name: 'Qualys VMDR Infrastructure Scanner', status: 'Healthy' },
                    { id: 'FEED-004', name: 'Splunk Enterprise Security SIEM', status: 'Healthy' }
                  ]
                }
              }
            }
          }
        }
      }
    },
    '/telemetry/ingest': {
      post: {
        tags: ['Telemetry Stream'],
        summary: 'Ingest real-time SIEM, EDR, or vulnerability scan event',
        description: 'Processes incoming security findings through the deterministic cascade, recalculating affected asset vulnerability and portfolio EAL.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              example: {
                eventKey: 'EVENT_A_CRITICAL_VULN'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Telemetry event ingested and posture recalculated',
            content: {
              'application/json': {
                example: {
                  success: true,
                  result: {
                    processed: true,
                    event: { id: 'EVT-CRITICAL-VULN', title: 'Critical Vulnerability Detected (CVE-2024-4577)' },
                    deltaExposureINR: 18400000,
                    formattedDeltaExposure: '₹1.84 Cr',
                    logDescription: 'Ingested CVE-2024-4577 on Payment Gateway API. Risk quantified: +₹1.84 Cr EAL.'
                  }
                }
              }
            }
          }
        }
      }
    },
    '/compliance/frameworks': {
      get: {
        tags: ['Compliance Intelligence'],
        summary: 'Get regulatory framework coverage metrics and audit gaps',
        description: 'Calculates dynamic compliance coverage across NIST CSF 2.0, RBI Master Direction, ISO/IEC 27001, and SEBI CSCRF.',
        responses: {
          '200': {
            description: 'Compliance metrics calculated',
            content: {
              'application/json': {
                example: {
                  success: true,
                  frameworks: {
                    summaries: {
                      'FW-NIST': { name: 'NIST CSF 2.0', coveragePercentage: 79, auditReadinessScore: 82 },
                      'FW-RBI': { name: 'RBI Master Direction', coveragePercentage: 86, auditReadinessScore: 88 }
                    },
                    totalControlsCount: 7
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};
