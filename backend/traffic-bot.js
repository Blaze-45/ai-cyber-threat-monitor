import axios from 'axios';

// --- CONFIGURATION ---
const API_BASE = 'http://localhost:3001/api';
const POLL_INTERVAL_MS = 5000; // Check for new/deleted sites every 5 seconds

console.log("🚀 Starting Production-Grade Traffic Simulation...");
console.log("📊 Features: Auto-Discovery | Dynamic Army Size | Persistent Campaigns");

// --- STATE MANAGEMENT ---
const runningSimulations = new Map(); // Map<siteId, intervalId>

// --- HELPERS ---
const getRandomIP = () => `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;

// Creates a fresh "Army" of IPs for a specific attack
const generateBotnet = (size) => Array.from({length: size}, () => getRandomIP());

// --- WORKER: SIMULATES ONE WEBSITE ---
function startSimulation(site) {
  // Prevent duplicate threads
  if (runningSimulations.has(site.id)) return;

  console.log(`   👉 [STARTED] Worker for: ${site.name}`);

  // 1. STATE MACHINE VARIABLES
  let eventMode = 'normal';   // 'normal' | 'ddos' | 'flash_sale'
  let eventTimer = 0;         // How many ticks remaining
  let currentBotnet = [];     // The specific IPs attacking us right now
  let currentAttackerIP = null; // The specific IP used in this second

  const intervalSpeed = Math.floor(Math.random() * 800) + 400;

  const intervalId = setInterval(async () => {
    
    // --- A. EVENT DECISION LOGIC ---
    if (eventMode === 'normal') {
      const rand = Math.random();

      // SCENARIO 1: DDoS Attack (0.5% chance)
      if (rand > 0.995) {
        eventMode = 'ddos';
        eventTimer = Math.floor(Math.random() * 180) + 120; // 2-5 mins
        
        // 🔥 RANDOMIZE ARMY SIZE (Between 10 and 60 IPs)
        const armySize = Math.floor(Math.random() * 50) + 10; 
        currentBotnet = generateBotnet(armySize); 
        currentAttackerIP = currentBotnet[0];
        
        console.log(`🔥 [${site.name}] CAMPAIGN STARTED! Army: ${armySize} IPs. Duration: ${eventTimer} ticks.`);
      }
      
      // SCENARIO 2: Flash Sale (3% chance)
      else if (rand > 0.96) {
        eventMode = 'flash_sale';
        eventTimer = 15; // ~15 seconds
        console.log(`🛍️ [${site.name}] Flash Sale Started.`);
      }
    }

    // --- B. GENERATE TRAFFIC METRICS ---
    let requests = site.baseTraffic;
    let errorRate = Math.random() * 0.02; // Normal: 0-2% errors
    let latency = Math.floor(Math.random() * 50) + 20;
    
    // Default: Traffic comes from random normal users
    let sourceIP = getRandomIP(); 

    // APPLY EVENT MODIFIERS
    if (eventMode === 'ddos') {
      requests = site.baseTraffic * 10;          // Huge Traffic
      errorRate = Math.random() * 0.30 + 0.10;   // 10-40% Errors
      latency = Math.floor(Math.random() * 500) + 200; // Server dying
      
      // BOTNET ROTATOR: 30% chance to switch attacker IP from our specific Army
      if (Math.random() > 0.7) {
         currentAttackerIP = currentBotnet[Math.floor(Math.random() * currentBotnet.length)];
      }
      sourceIP = currentAttackerIP; 
    } 
    else if (eventMode === 'flash_sale') {
      requests = site.baseTraffic * 5; 
      errorRate = Math.random() * 0.04; // Low errors
      latency = 100; // Slower but working
    }

    // --- C. COUNTDOWN TIMER ---
    if (eventTimer > 0) {
      eventTimer--;
      if (eventTimer === 0) {
        console.log(`✅ [${site.name}] Event Ended. Cooling down.`);
        eventMode = 'normal';
        currentBotnet = []; // Clear memory
      }
    }

    // Add natural volatility
    requests += Math.floor(Math.random() * site.volatility) - (site.volatility / 2);
    if (requests < 0) requests = 0;

    // --- D. SEND DATA TO SERVER ---
    try {
      await axios.post(`${API_BASE}/traffic-log`, {
        websiteId: site.id,
        name: site.name,
        requests: Math.floor(requests),
        errorRate: parseFloat(errorRate.toFixed(4)), 
        latency: latency,
        sourceIP: sourceIP, 
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      // IF SERVER SAYS "404 Not Found" (Website Deleted) -> KILL THIS THREAD
      if (e.response && e.response.status === 404) {
          console.log(`🛑 [STOPPED] Website deleted: ${site.name}`);
          clearInterval(intervalId); 
          runningSimulations.delete(site.id); 
      }
    }

  }, intervalSpeed);

  // Track this worker
  runningSimulations.set(site.id, intervalId);
}

// --- MANAGER: POLLING SYSTEM ---
async function syncWebsites() {
  try {
    const response = await axios.get(`${API_BASE}/websites`);
    const serverWebsites = response.data;
    const serverIds = new Set(serverWebsites.map(s => s.id));

    // 1. Start workers for NEW websites
    serverWebsites.forEach(site => startSimulation(site));

    // 2. Stop workers for DELETED websites
    for (const [id, intervalId] of runningSimulations) {
        if (!serverIds.has(id)) {
            console.log(`🗑️ Removing simulation for ID: ${id}`);
            clearInterval(intervalId);
            runningSimulations.delete(id);
        }
    }
  } catch (error) {
    console.log("⚠️ Server sync failed. Is the server running?");
  }
}

// Start the Manager Loop
setInterval(syncWebsites, POLL_INTERVAL_MS);
syncWebsites();