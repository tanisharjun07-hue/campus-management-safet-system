const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// Campus Master Data & Initial State
// ==========================================
const CAMPUS_BUILDINGS = [
  { id: 'bld_quad', name: 'Main Academic Quad', code: 'ACAD-01', x: 460, y: 230, category: 'Academic', floors: 4, zones: ['Ground Foyer', 'Lecture Hall 101-105', 'Dean Office', 'Auditorium'] },
  { id: 'bld_science', name: 'Science & Chemistry Research Lab', code: 'SCI-02', x: 690, y: 190, category: 'Laboratory', floors: 3, zones: ['Organic Chem Lab', 'Biohazard Storage', 'Physics Wing', 'Basement Utility'] },
  { id: 'bld_eng', name: 'Engineering & Robotics Complex', code: 'ENG-03', x: 740, y: 390, category: 'Engineering', floors: 5, zones: ['Robotics Arena', 'Server Farm', 'High Voltage Lab', 'CAD Studios'] },
  { id: 'bld_library', name: 'Central University Library', code: 'LIB-04', x: 300, y: 330, category: 'Study', floors: 3, zones: ['Quiet Reading Zone', 'Digital Archive', 'Night Study Wing', 'East Exit'] },
  { id: 'bld_hostel_a', name: 'Student Hostel Block A (Boys)', code: 'HST-A', x: 170, y: 150, category: 'Residential', floors: 6, zones: ['Block A Reception', 'Floor 2 Common Room', 'Rooftop', 'Dining Hall'] },
  { id: 'bld_hostel_b', name: 'Student Hostel Block B (Girls)', code: 'HST-B', x: 170, y: 330, category: 'Residential', floors: 6, zones: ['Block B Security Gate', 'Floor 3 Study Lounge', 'Courtyard', 'Visitors Lobby'] },
  { id: 'bld_cafeteria', name: 'Student Center & Cafeteria', code: 'CAFE-07', x: 470, y: 440, category: 'Recreation', floors: 2, zones: ['Food Court', 'Student Union Office', 'Terrace Patio', 'Kitchen Area'] },
  { id: 'bld_sports', name: 'Indoor Sports Arena & Gym', code: 'SPT-08', x: 820, y: 550, category: 'Sports', floors: 2, zones: ['Basketball Court', 'Olympic Pool Deck', 'Fitness Center', 'Bleachers'] },
  { id: 'bld_parking_n', name: 'North Parking Lot & Transit Bay', code: 'PRK-N', x: 420, y: 65, category: 'Transit', floors: 1, zones: ['Shuttle Stop 1', 'EV Charging Station', 'North Perimeter Fence', 'Bike Shed'] },
  { id: 'bld_med_center', name: 'Campus Health & Medical Center', code: 'MED-10', x: 260, y: 540, category: 'Medical', floors: 2, zones: ['Emergency Triage', 'Ambulance Bay', 'Pharmacy', 'Observation Ward'] }
];

const INITIAL_RESPONDERS = [
  { id: 'resp_1', name: 'Officer Rajesh Kumar', badge: 'SEC-101', role: 'Patrol Lead (Alpha Unit)', phone: '+91 98765 43210', status: 'available', assignedIncidentId: null, x: 440, y: 210 },
  { id: 'resp_2', name: 'Officer Priya Sharma', badge: 'SEC-104', role: 'Quick Response Bike 2', phone: '+91 98765 43211', status: 'available', assignedIncidentId: null, x: 200, y: 200 },
  { id: 'resp_3', name: 'Dr. Ananya Sen & EMT Team', badge: 'MED-201', role: 'Campus Rapid Medic Van', phone: '+91 98765 43212', status: 'available', assignedIncidentId: null, x: 280, y: 520 },
  { id: 'resp_4', name: 'Officer David Miller', badge: 'SEC-109', role: 'Tech & CCTV Dispatch Officer', phone: '+91 98765 43213', status: 'available', assignedIncidentId: null, x: 460, y: 250 }
];

// In-Memory Database
let incidents = [];
let responders = JSON.parse(JSON.stringify(INITIAL_RESPONDERS));
let broadcasts = [];
let walkSafeSessions = [];

// Seed Initial Realistic Demonstration Data
function seedDemoData() {
  const now = Date.now();
  incidents = [
    {
      id: 'INC-' + (now - 140000).toString().slice(-4),
      type: 'medical',
      title: 'Severe Asthma Collapse during Finals Prep',
      description: 'Student experiencing acute respiratory distress, breathing difficulty near study cubicle 14.',
      buildingId: 'bld_library',
      buildingName: 'Central University Library',
      locationDetails: '2nd Floor Quiet Study Wing, Desk 14',
      coordinates: { x: 310, y: 340 },
      severity: 'high', // low, medium, high, critical
      status: 'dispatched', // reported, acknowledged, dispatched, on_scene, resolved
      reporter: {
        name: 'Aarav Patel',
        role: 'Student (Roll #CS22094)',
        phone: '+91 91234 56789',
        isAnonymous: false
      },
      assignedResponderId: 'resp_3',
      assignedResponderName: 'Dr. Ananya Sen & EMT Team',
      etaMinutes: 2,
      createdAt: new Date(now - 140000).toISOString(),
      updatedAt: new Date(now - 40000).toISOString(),
      chat: [
        { id: 'msg_1', sender: 'Aarav Patel (Student)', text: 'He collapsed suddenly, he has an inhaler but cannot speak!', timestamp: new Date(now - 130000).toLocaleTimeString() },
        { id: 'msg_2', sender: 'Security Dispatch HQ', text: 'Dr. Ananya Medic Van has been dispatched! Keep him sitting upright. ETA is 2 minutes.', timestamp: new Date(now - 80000).toLocaleTimeString() }
      ],
      evidence: {
        hasPhoto: true,
        photoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect width="100%" height="100%" fill="%231e293b"/><text x="50%" y="45%" fill="%23ef4444" font-size="20" font-family="sans-serif" font-weight="bold" text-anchor="middle">MEDICAL ASSISTANCE REQUIRED</text><text x="50%" y="60%" fill="%2394a3b8" font-size="14" font-family="sans-serif" text-anchor="middle">Central Library - 2nd Floor Study Desk 14</text></svg>',
        voiceNoteDuration: '0:14'
      }
    },
    {
      id: 'INC-' + (now - 600000).toString().slice(-4),
      type: 'hazard',
      title: 'Power Line Sparking & Water Pipe Leak',
      description: 'Overhead conduit sparked after heavy rain near electric vehicle charging bays.',
      buildingId: 'bld_parking_n',
      buildingName: 'North Parking Lot & Transit Bay',
      locationDetails: 'Bays 12-16 near North Perimeter',
      coordinates: { x: 410, y: 70 },
      severity: 'medium',
      status: 'on_scene',
      reporter: {
        name: 'Prof. S. Nambiar',
        role: 'Faculty (Dept of EE)',
        phone: '+91 99887 76655',
        isAnonymous: false
      },
      assignedResponderId: 'resp_1',
      assignedResponderName: 'Officer Rajesh Kumar',
      etaMinutes: 0,
      createdAt: new Date(now - 600000).toISOString(),
      updatedAt: new Date(now - 200000).toISOString(),
      chat: [
        { id: 'msg_1', sender: 'Prof. S. Nambiar', text: 'Hazard taped off temporarily. Maintenance needed ASAP.', timestamp: new Date(now - 550000).toLocaleTimeString() },
        { id: 'msg_2', sender: 'Officer Rajesh Kumar', text: 'Unit Alpha on scene. Electrical mains isolated for section.', timestamp: new Date(now - 200000).toLocaleTimeString() }
      ],
      evidence: { hasPhoto: false }
    }
  ];

  broadcasts = [
    {
      id: 'BC-001',
      type: 'alert',
      level: 'warning',
      title: 'Flash Weather Advisory: Heavy Thunderstorm & High Winds',
      message: 'Campus administration advises students to remain indoors. Shuttle services temporarily rerouted via South Boulevard.',
      targetAudience: 'All Campus (Students, Faculty, Staff)',
      issuedBy: 'Campus Emergency Management Bureau',
      active: true,
      timestamp: new Date(now - 1200000).toISOString()
    }
  ];
}

seedDemoData();

// ==========================================
// WebSocket Real-Time Event Hub
// ==========================================
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

function broadcastWs(eventType, payload) {
  const message = JSON.stringify({ type: eventType, data: payload, timestamp: new Date().toISOString() });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

wss.on('connection', (ws) => {
  // Send current state on connect
  ws.send(JSON.stringify({
    type: 'INIT_STATE',
    data: {
      incidents,
      responders,
      broadcasts,
      buildings: CAMPUS_BUILDINGS,
      stats: computeStats()
    }
  }));

  ws.on('message', (messageRaw) => {
    try {
      const parsed = JSON.parse(messageRaw);
      handleWsMessage(parsed, ws);
    } catch (err) {
      console.error('Error parsing WebSocket message:', err);
    }
  });
});

function handleWsMessage(msg, senderWs) {
  switch (msg.type) {
    case 'TRIGGER_SOS':
      handleSosCreation(msg.data);
      break;
    case 'SEND_CHAT':
      handleChatMessage(msg.data);
      break;
    case 'UPDATE_INCIDENT_STATUS':
      handleStatusUpdate(msg.data);
      break;
    case 'TRIGGER_BROADCAST':
      handleBroadcastCreation(msg.data);
      break;
    case 'UPDATE_WALK_SAFE':
      handleWalkSafeUpdate(msg.data);
      break;
    default:
      console.log('Unknown WS event:', msg.type);
  }
}

// Helpers
function computeStats() {
  const total = incidents.length;
  const active = incidents.filter(i => i.status !== 'resolved').length;
  const critical = incidents.filter(i => (i.severity === 'critical' || i.severity === 'high') && i.status !== 'resolved').length;
  const resolved = incidents.filter(i => i.status === 'resolved').length;
  const avgResponseTime = '1.8 min';

  const typeCounts = {
    medical: incidents.filter(i => i.type === 'medical').length,
    fire: incidents.filter(i => i.type === 'fire').length,
    harassment: incidents.filter(i => i.type === 'harassment').length,
    threat: incidents.filter(i => i.type === 'threat').length,
    hazard: incidents.filter(i => i.type === 'hazard').length,
    other: incidents.filter(i => !['medical', 'fire', 'harassment', 'threat', 'hazard'].includes(i.type)).length
  };

  return { total, active, critical, resolved, avgResponseTime, typeCounts };
}

function handleSosCreation(data) {
  const building = CAMPUS_BUILDINGS.find(b => b.id === data.buildingId) || CAMPUS_BUILDINGS[0];
  const newIncident = {
    id: 'INC-' + Date.now().toString().slice(-5),
    type: data.type || 'sos_panic',
    title: data.title || (data.type === 'stealth' ? 'SILENT DISTRESS / STEALTH SOS' : 'URGENT 1-TAP SOS ALERT'),
    description: data.description || 'Emergency SOS triggered via Student Safety App. Immediate response required.',
    buildingId: building.id,
    buildingName: building.name,
    locationDetails: data.locationDetails || `${building.name} (Live GPS coordinates locked)`,
    coordinates: data.coordinates || { x: building.x + (Math.random() * 20 - 10), y: building.y + (Math.random() * 20 - 10) },
    severity: data.severity || 'critical',
    status: 'reported',
    reporter: {
      name: data.reporterName || 'Student (App User)',
      role: data.reporterRole || 'Undergraduate Student',
      phone: data.reporterPhone || '+91 98765 00000',
      isAnonymous: data.isAnonymous || false
    },
    assignedResponderId: null,
    assignedResponderName: null,
    etaMinutes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    chat: [
      {
        id: 'msg_' + Date.now(),
        sender: 'Campus Security HQ',
        text: 'SOS received. Campus emergency dispatch center has been notified and is assigning nearest responders.',
        timestamp: new Date().toLocaleTimeString()
      }
    ],
    evidence: {
      hasPhoto: !!data.photoUrl,
      photoUrl: data.photoUrl || null,
      voiceNoteDuration: data.voiceNoteDuration || null
    },
    isStealth: !!data.isStealth
  };

  incidents.unshift(newIncident);
  broadcastWs('NEW_INCIDENT', { incident: newIncident, stats: computeStats() });
  return newIncident;
}

function handleChatMessage(data) {
  const incident = incidents.find(i => i.id === data.incidentId);
  if (!incident) return;

  const newMsg = {
    id: 'msg_' + Date.now(),
    sender: data.sender || 'Reporter',
    text: data.text,
    timestamp: new Date().toLocaleTimeString()
  };

  incident.chat.push(newMsg);
  incident.updatedAt = new Date().toISOString();

  broadcastWs('NEW_CHAT_MESSAGE', { incidentId: incident.id, message: newMsg, incident });
}

function handleStatusUpdate(data) {
  const incident = incidents.find(i => i.id === data.incidentId);
  if (!incident) return;

  if (data.status) incident.status = data.status;
  if (data.severity) incident.severity = data.severity;

  if (data.assignedResponderId) {
    const responder = responders.find(r => r.id === data.assignedResponderId);
    if (responder) {
      incident.assignedResponderId = responder.id;
      incident.assignedResponderName = responder.name;
      incident.etaMinutes = data.etaMinutes || 3;
      responder.status = 'dispatched';
      responder.assignedIncidentId = incident.id;
    }
  }

  if (data.status === 'resolved' && incident.assignedResponderId) {
    const responder = responders.find(r => r.id === incident.assignedResponderId);
    if (responder) {
      responder.status = 'available';
      responder.assignedIncidentId = null;
    }
    incident.etaMinutes = 0;
  }

  incident.updatedAt = new Date().toISOString();

  broadcastWs('INCIDENT_UPDATED', {
    incident,
    responders,
    stats: computeStats()
  });
}

function handleBroadcastCreation(data) {
  const newBroadcast = {
    id: 'BC-' + Date.now().toString().slice(-4),
    type: data.type || 'critical_alert',
    level: data.level || 'danger', // danger, warning, info
    title: data.title || 'CAMPUS-WIDE EMERGENCY ALERT',
    message: data.message || 'Please follow security officer directives immediately.',
    targetAudience: data.targetAudience || 'All Campus Buildings & Hostels',
    issuedBy: data.issuedBy || 'Campus Safety Directorate',
    active: true,
    sirenAlert: !!data.sirenAlert,
    timestamp: new Date().toISOString()
  };

  broadcasts.unshift(newBroadcast);
  broadcastWs('MASS_BROADCAST', { broadcast: newBroadcast });
  return newBroadcast;
}

function handleWalkSafeUpdate(data) {
  let session = walkSafeSessions.find(s => s.id === data.sessionId);
  if (!session) {
    session = {
      id: 'WS-' + Date.now().toString().slice(-4),
      studentName: data.studentName || 'Student',
      fromBuilding: data.fromBuilding || 'Central Library',
      toBuilding: data.toBuilding || 'Hostel Block B',
      durationMinutes: data.durationMinutes || 10,
      startedAt: Date.now(),
      status: 'in_transit',
      lastPing: Date.now()
    };
    walkSafeSessions.push(session);
  }

  if (data.action === 'checkin_safe') {
    session.status = 'completed_safe';
  } else if (data.action === 'trigger_panic' || data.action === 'overdue_panic') {
    session.status = 'alert_triggered';
    // Auto-spawn critical incident
    handleSosCreation({
      type: 'walk_safe_overdue',
      title: `WALK-SAFE PANIC ALERT: ${session.studentName}`,
      description: `Student failed to check in on route from ${session.fromBuilding} to ${session.toBuilding}. Emergency contact & dispatch activated.`,
      buildingId: 'bld_hostel_b',
      severity: 'critical'
    });
  }

  broadcastWs('WALK_SAFE_UPDATE', { session });
}

// ==========================================
// REST API Endpoints
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'active', time: new Date().toISOString(), connectedClients: wss.clients.size });
});

app.get('/api/buildings', (req, res) => {
  res.json({ success: true, buildings: CAMPUS_BUILDINGS });
});

app.get('/api/responders', (req, res) => {
  res.json({ success: true, responders });
});

app.get('/api/incidents', (req, res) => {
  const { status, severity, type } = req.query;
  let filtered = [...incidents];
  if (status) filtered = filtered.filter(i => i.status === status);
  if (severity) filtered = filtered.filter(i => i.severity === severity);
  if (type) filtered = filtered.filter(i => i.type === type);
  res.json({ success: true, count: filtered.length, incidents: filtered });
});

app.get('/api/incidents/:id', (req, res) => {
  const incident = incidents.find(i => i.id === req.params.id);
  if (!incident) return res.status(404).json({ success: false, error: 'Incident not found' });
  res.json({ success: true, incident });
});

app.post('/api/incidents', (req, res) => {
  const incident = handleSosCreation(req.body);
  res.status(201).json({ success: true, incident });
});

app.patch('/api/incidents/:id', (req, res) => {
  const incident = incidents.find(i => i.id === req.params.id);
  if (!incident) return res.status(404).json({ success: false, error: 'Incident not found' });

  handleStatusUpdate({ incidentId: req.params.id, ...req.body });
  res.json({ success: true, incident });
});

app.post('/api/incidents/:id/chat', (req, res) => {
  handleChatMessage({ incidentId: req.params.id, ...req.body });
  res.json({ success: true, message: 'Message sent' });
});

app.get('/api/broadcasts', (req, res) => {
  res.json({ success: true, broadcasts });
});

app.post('/api/broadcast', (req, res) => {
  const broadcast = handleBroadcastCreation(req.body);
  res.status(201).json({ success: true, broadcast });
});

app.get('/api/stats', (req, res) => {
  res.json({ success: true, stats: computeStats() });
});

app.post('/api/demo/seed', (req, res) => {
  seedDemoData();
  responders = JSON.parse(JSON.stringify(INITIAL_RESPONDERS));
  broadcastWs('INIT_STATE', {
    incidents,
    responders,
    broadcasts,
    buildings: CAMPUS_BUILDINGS,
    stats: computeStats()
  });
  res.json({ success: true, message: 'Demo data reseeded' });
});

// Start Server
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` CampusShield Emergency Response System is RUNNING!`);
  console.log(` Portal URL: http://localhost:${PORT}`);
  console.log(` Student SOS App: http://localhost:${PORT}/student.html`);
  console.log(` Security Command Center: http://localhost:${PORT}/command-center.html`);
  console.log(`====================================================`);
});
