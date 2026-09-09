process.env.NODE_ENV = 'test';
import http from 'http';
import app from '../src/index.js';

const PORT = 5099;
let server;

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const reqOptions = {
      hostname: '127.0.0.1',
      port: PORT,
      path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, text: data });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runApiTests() {
  console.log('====================================================');
  console.log('RESILIENCEOS BACKEND API VERIFICATION SUITE');
  console.log('====================================================\n');

  server = app.listen(PORT);

  let passed = 0;
  let total = 9;

  try {
    // 1. GET /api/health
    console.log('--- TEST 1: GET /api/health ---');
    const health = await request('/api/health');
    if (health.status === 200 && health.body.success && health.body.status === 'healthy') {
      console.log('✓ TEST 1 PASSED: Health endpoint active. Service:', health.body.service);
      passed++;
    } else {
      console.error('✗ TEST 1 FAILED:', health);
    }

    // 2. GET /api/risks
    console.log('\n--- TEST 2: GET /api/risks ---');
    const risks = await request('/api/risks');
    if (risks.status === 200 && risks.body.count > 0 && risks.body.totalEAL > 0) {
      console.log(`✓ TEST 2 PASSED: Retrieved ${risks.body.count} quantified risks. Total EAL: ₹${(risks.body.totalEAL / 10000000).toFixed(2)} Cr`);
      passed++;
    } else {
      console.error('✗ TEST 2 FAILED:', risks);
    }

    // 3. POST /api/fair/calculate
    console.log('\n--- TEST 3: POST /api/fair/calculate ---');
    const fairCalc = await request('/api/fair/calculate', {
      method: 'POST',
      body: {
        assetId: 'AST-DB-01',
        vulnId: 'VULN-2023-39417',
        modifiers: { patchDelayDays: 15 }
      }
    });
    if (fairCalc.status === 200 && fairCalc.body.calculation.fairMetrics.expectedAnnualLoss > 0) {
      console.log(`✓ TEST 3 PASSED: FAIR calculation executed. EAL: ${fairCalc.body.calculation.formattedEAL}`);
      passed++;
    } else {
      console.error('✗ TEST 3 FAILED:', fairCalc);
    }

    // 4. POST /api/optimizer/solve
    console.log('\n--- TEST 4: POST /api/optimizer/solve ---');
    const optimizer = await request('/api/optimizer/solve', {
      method: 'POST',
      body: { budget: 2000000 }
    });
    if (optimizer.status === 200 && optimizer.body.solution.selectedControls.length > 0) {
      console.log(`✓ TEST 4 PASSED: 0/1 Knapsack optimal controls solved: ${optimizer.body.solution.selectedCount} controls, ROSI: +${optimizer.body.solution.rosi}%`);
      passed++;
    } else {
      console.error('✗ TEST 4 FAILED:', optimizer);
    }

    // 5. GET /api/graph/attack-paths
    console.log('\n--- TEST 5: GET /api/graph/attack-paths ---');
    const graph = await request('/api/graph/attack-paths');
    if (graph.status === 200 && graph.body.graphData.nodes.length > 0) {
      console.log(`✓ TEST 5 PASSED: Attack graph traversal returned ${graph.body.graphData.nodes.length} nodes and ${graph.body.graphData.edges.length} edges.`);
      passed++;
    } else {
      console.error('✗ TEST 5 FAILED:', graph);
    }

    // 6. GET /api/graph/chokepoints
    console.log('\n--- TEST 6: GET /api/graph/chokepoints ---');
    const chokepoints = await request('/api/graph/chokepoints');
    if (chokepoints.status === 200 && chokepoints.body.chokepointData.primaryChokepoint) {
      console.log(`✓ TEST 6 PASSED: Primary chokepoint identified: ${chokepoints.body.chokepointData.primaryChokepoint.assetName} (Choke Score: ${chokepoints.body.chokepointData.primaryChokepoint.chokeScore}/100)`);
      passed++;
    } else {
      console.error('✗ TEST 6 FAILED:', chokepoints);
    }

    // 7. POST /api/simulator/simulate
    console.log('\n--- TEST 7: POST /api/simulator/simulate ---');
    const simulation = await request('/api/simulator/simulate', {
      method: 'POST',
      body: {
        scenarioId: 'SCENARIO_DELAY_PATCH',
        customPatchDelayDays: 30
      }
    });
    if (simulation.status === 200 && simulation.body.simulation.impact.riskDelta !== undefined) {
      console.log(`✓ TEST 7 PASSED: Sensitivity simulation completed. Direction: ${simulation.body.simulation.impact.direction}, Delta: ${simulation.body.simulation.impact.formattedRiskDelta}`);
      passed++;
    } else {
      console.error('✗ TEST 7 FAILED:', simulation);
    }

    // 8. POST /api/telemetry/ingest
    console.log('\n--- TEST 8: POST /api/telemetry/ingest ---');
    const telemetry = await request('/api/telemetry/ingest', {
      method: 'POST',
      body: { eventKey: 'EVENT_A_CRITICAL_VULN' }
    });
    if (telemetry.status === 200 && telemetry.body.result.processed) {
      console.log(`✓ TEST 8 PASSED: Telemetry event processed. Delta Exposure: ${telemetry.body.result.formattedDeltaExposure}`);
      passed++;
    } else {
      console.error('✗ TEST 8 FAILED:', telemetry);
    }

    // 9. GET /api/compliance/frameworks
    console.log('\n--- TEST 9: GET /api/compliance/frameworks ---');
    const compliance = await request('/api/compliance/frameworks');
    if (compliance.status === 200 && compliance.body.frameworks.frameworks.length > 0) {
      console.log(`✓ TEST 9 PASSED: Compliance frameworks evaluated. Framework count: ${compliance.body.frameworks.frameworks.length}`);
      passed++;
    } else {
      console.error('✗ TEST 9 FAILED:', compliance);
    }

    console.log('\n====================================================');
    console.log(`API TEST RESULTS: ${passed} / ${total} SUCCEEDED`);
    console.log('====================================================');

  } finally {
    if (server) server.close();
  }

  if (passed !== total) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runApiTests().catch(err => {
  console.error('API Test Suite Error:', err);
  if (server) server.close();
  process.exit(1);
});
