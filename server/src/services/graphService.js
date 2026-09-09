import {
  computeGraphState,
  getAssetAttackPath,
  getAssetBlastRadius,
  CANONICAL_GRAPH_EDGES,
  GRAPH_NODE_COORDINATES
} from '../../../src/core/graphEngine.js';

import {
  INITIAL_ASSETS,
  INITIAL_RISKS
} from '../../../src/data/initialData.js';

/**
 * Graph & Attack Path Traversal Service
 */
export class GraphService {
  /**
   * Computes dynamic attack graph topology, node vulnerabilities, and active lateral paths
   * @param {Object} params - { assets?: Array, risks?: Array }
   */
  static getAttackPaths(params = {}) {
    const assets = Array.isArray(params.assets) && params.assets.length > 0
      ? params.assets
      : INITIAL_ASSETS;
    const risks = Array.isArray(params.risks) && params.risks.length > 0
      ? params.risks
      : INITIAL_RISKS;

    const { nodes, edges } = computeGraphState(assets, risks);

    // Map complete paths for each asset in topology
    const pathsByAsset = {};
    assets.forEach(asset => {
      pathsByAsset[asset.id] = {
        assetId: asset.id,
        assetName: asset.name,
        attackPath: getAssetAttackPath(asset.id),
        blastRadius: getAssetBlastRadius(asset.id)
      };
    });

    const activeVulnerablePaths = edges.filter(e => e.isVulnerablePath);

    return {
      topologySummary: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        vulnerableEdgeCount: activeVulnerablePaths.length,
        entryPointsCount: nodes.filter(n => n.isEntryPoint).length
      },
      nodes,
      edges,
      pathsByAsset,
      vulnerablePaths: activeVulnerablePaths,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Computes critical enterprise chokepoints and blast radius analyses
   */
  static getChokepoints(params = {}) {
    const assets = Array.isArray(params.assets) && params.assets.length > 0
      ? params.assets
      : INITIAL_ASSETS;

    const chokepoints = assets.map(asset => {
      const blastRadius = getAssetBlastRadius(asset.id);
      const attackPath = getAssetAttackPath(asset.id);

      // Determine choke point criticality score
      let chokeScore = 0;
      if (asset.networkExposure === 'Internet-Facing') chokeScore += 40;
      if (blastRadius.severity === 'CRITICAL') chokeScore += 50;
      else if (blastRadius.severity === 'HIGH') chokeScore += 35;
      else if (blastRadius.severity === 'MODERATE') chokeScore += 20;

      if (asset.criticality === 'Tier 1') chokeScore += 30;
      else if (asset.criticality === 'Tier 2') chokeScore += 20;

      return {
        assetId: asset.id,
        assetName: asset.name,
        criticality: asset.criticality,
        networkExposure: asset.networkExposure,
        blastRadius,
        attackPathLength: attackPath.length,
        attackPath,
        chokeScore: Math.min(100, chokeScore),
        isPrimaryChokepoint: asset.id === 'AST-GW-01' || asset.id === 'AST-API-01'
      };
    }).sort((a, b) => b.chokeScore - a.chokeScore);

    return {
      primaryChokepoint: chokepoints[0] || null,
      chokepoints,
      timestamp: new Date().toISOString()
    };
  }
}
