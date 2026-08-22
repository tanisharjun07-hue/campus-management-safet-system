# 🛡️ CampusShield: Real-Time Smart Campus Emergency Response System

> **Next-Generation Incident Management, 1-Tap SOS Dispatch, Tactical GIS Radar, and Mass Broadcast Grid for College Campuses.**

---

## 📌 Problem Overview
Emergency situations on college campuses (such as medical collapses, lab fires, harassment, intruders, or facility failures) frequently suffer from delayed reporting and disorganized communication. Relying on phone calls or manual security reporting causes vital delays in response times.

**CampusShield** solves this by providing an end-to-end, ultra-fast real-time software ecosystem connecting students, faculty, and campus security dispatchers with sub-second bi-directional WebSocket communication.

---

## 🚀 Key Modules & Capabilities

### 1. 📱 Student & Faculty Mobile Safety Portal (`student.html`)
- **1-Tap Emergency SOS**: Instant panic alert with a 3-second abort guard to eliminate false alarms.
- **🕶️ Stealth / Calculator Disguise**: Disguises the screen into a functional scientific calculator; entering `911=` secretly dispatches an untraceable emergency distress signal.
- **Detailed Incident Reporter**: Categorized reporting (Medical, Fire, Threat/Violence, Hazard) with GPS location marker, photo upload, voice memo memo recorder, and anonymous submission toggles.
- **Live Dispatch Tracker & ETA**: Real-time status progression bar (*Reported -> Acknowledged -> Dispatched -> On Scene -> Resolved*) with assigned officer badge and countdown ETA.
- **Direct 2-Way Emergency Chat**: Secure line directly between the student and responding security officer.
- **"Walk Me Safe" Companion**: Safety watchdog for late-night campus transit between library and hostels with automatic overdue panic escalation.
- **Offline First-Aid Guides**: Interactive emergency protocols for CPR, bleeding, burns, and panic attacks.

### 2. 🖥️ Security Command Center & Dispatch HQ (`command-center.html`)
- **🗺️ Tactical Vector Campus GIS Radar**: Scalable vector campus layout with dynamic radar sweep, building inspect cards, live incident shockwave pins, and patrol movements.
- **Real-Time Incident Stream**: Instant push notifications, priority filtering (Code Red, High, Active, Resolved), and audio-visual sirens.
- **1-Click Triage & Unit Dispatch**: Assign specific security patrol units or medical vans, update incident logs, and monitor SLA response metrics.
- **📢 Campus Mass Broadcast System**: Dispatch campus-wide emergency lockdown banners and push sirens across all connected student devices simultaneously.
- **Safety Analytics HUD**: Live SLA response time tracker, critical alert counters, and incident categorization.

### 3. ⚡ Master Unified Simulator & Showcase (`index.html`)
- Split-screen live preview showing the Student Mobile App and Security Command Center side-by-side with live WebSocket synchronization.
- 1-Click quick scenario trigger buttons (*Chemical Lab Fire, Dorm Cardiac Collapse, Parking Stealth Alert*) for live demonstrations in front of event judges.

### 4. 🔊 Zero-Dependency Web Audio API Sound Synthesizer (`js/audio.js`)
- Synthesizes dual-tone emergency sirens, radio walkie-talkie chirps, and countdown metronomes directly through browser audio hardware without external media dependencies.

---

## 🛠️ Technology Stack
- **Backend**: Node.js, Express, WebSocket (`ws`), CORS
- **Frontend**: HTML5, Vanilla Modern JavaScript, Glassmorphism CSS Design System
- **Audio**: Web Audio API (Native sound synthesis)
- **Mapping**: Interactive SVG Vector GIS & Canvas Radar Engine

---

## 🏃 How to Run the System

### Option 1: 1-Click Windows Batch Script
Double-click `start_system.bat` in the project root directory.

### Option 2: Terminal / Command Prompt
```bash
cd campus_emergency_system
npm install
node server.js
```

### 🌐 Accessing the Application:
- **Master Unified Hub & Split Simulator**: [http://localhost:3000/](http://localhost:3000/)
- **Student Safety Mobile App**: [http://localhost:3000/student.html](http://localhost:3000/student.html)
- **Security Command Center**: [http://localhost:3000/command-center.html](http://localhost:3000/command-center.html)
