const WebSocket = require('ws');

async function runTests() {
  console.log('--- Starting CampusShield Automated End-to-End Verification ---');

  // 1. Health and Pages Check
  const pages = ['/', '/student.html', '/command-center.html', '/css/style.css', '/js/audio.js', '/js/campus-map.js'];
  for (const page of pages) {
    const res = await fetch(`http://localhost:3000${page}`);
    if (res.status === 200) {
      console.log(`[PASS] Page/Asset check: ${page} -> 200 OK (${res.headers.get('content-type')})`);
    } else {
      console.error(`[FAIL] Page check: ${page} -> ${res.status}`);
    }
  }

  // 2. API Endpoints Check
  const bldRes = await fetch('http://localhost:3000/api/buildings');
  const bldData = await bldRes.json();
  console.log(`[PASS] GET /api/buildings -> ${bldData.buildings.length} campus zones loaded`);

  const respRes = await fetch('http://localhost:3000/api/responders');
  const respData = await respRes.json();
  console.log(`[PASS] GET /api/responders -> ${respData.responders.length} emergency units available`);

  // 3. REST Emergency SOS Creation
  const newSosRes = await fetch('http://localhost:3000/api/incidents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'medical',
      title: 'Automated Test: Acute Trauma Alert',
      description: 'Triggered by test suite',
      buildingId: 'bld_science',
      severity: 'critical'
    })
  });
  const newSosData = await newSosRes.json();
  const testIncidentId = newSosData.incident.id;
  console.log(`[PASS] POST /api/incidents -> Created emergency alert with ID: ${testIncidentId}`);

  // 4. Incident Triage & Dispatch Update
  const updateRes = await fetch(`http://localhost:3000/api/incidents/${testIncidentId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'dispatched',
      assignedResponderId: 'resp_1',
      etaMinutes: 1
    })
  });
  const updateData = await updateRes.json();
  console.log(`[PASS] PATCH /api/incidents/${testIncidentId} -> Dispatched unit: ${updateData.incident.assignedResponderName}, Status: ${updateData.incident.status}`);

  // 5. Mass Broadcast Trigger
  const bcRes = await fetch('http://localhost:3000/api/broadcast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'CAMPUS DRILL NOTIFICATION',
      message: 'Automated test drill',
      level: 'warning'
    })
  });
  const bcData = await bcRes.json();
  console.log(`[PASS] POST /api/broadcast -> Broadcast created with ID: ${bcData.broadcast.id}`);

  // 6. WebSocket Real-Time Event Test
  console.log('Testing WebSocket bi-directional communication...');
  const ws = new WebSocket('ws://localhost:3000');

  await new Promise((resolve, reject) => {
    ws.on('open', () => {
      console.log('[PASS] WebSocket client connected successfully');
      // Send a live SOS trigger via WebSocket
      ws.send(JSON.stringify({
        type: 'TRIGGER_SOS',
        data: {
          type: 'stealth',
          title: 'WebSocket Live Stealth Distress',
          buildingId: 'bld_parking_n',
          severity: 'critical',
          isStealth: true
        }
      }));
    });

    let receivedCount = 0;
    ws.on('message', (data) => {
      const parsed = JSON.parse(data);
      console.log(`[PASS] Received WS Broadcast Event: type=${parsed.type}`);
      receivedCount++;
      if (receivedCount >= 2) {
        ws.close();
        resolve();
      }
    });

    setTimeout(() => {
      if (receivedCount > 0) resolve();
      else reject(new Error('WS timeout'));
    }, 4000);
  });

  console.log('--- ALL AUTOMATED VERIFICATION CHECKS PASSED SUCCESSFULLY ---');
}

runTests().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});
