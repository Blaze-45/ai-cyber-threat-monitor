import axios from 'axios';

// Matches the Server's Thresholds
const WEBSITES = [
  { id: '1', name: 'amazon-clone.com', limit: 2000 },
  { id: '2', name: 'api.myservice.io', limit: 1000 },
  { id: '3', name: 'blog.techcorp.com', limit: 300 },
  { id: '4', name: 'portal.enterprise.net', limit: 150 },
  { id: '5', name: 'my-portfolio.co', limit: 40 }
];

const SERVER_URL = 'http://localhost:3001/api/traffic-log';

console.log("🚜 Starting Data Farmer... Generating BALANCED Dataset.");
console.log("-------------------------------------------------------");

// We cycle through 4 phases to ensure equal data distribution
const PHASES = ['idle', 'low', 'flash_sale', 'ddos'];
let phaseIndex = 0;

// Switch phase every 15 seconds
setInterval(() => {
  phaseIndex = (phaseIndex + 1) % PHASES.length;
  console.log(`\n⏳ [PHASE CHANGE] Now Generating: ${PHASES[phaseIndex].toUpperCase()}`);
}, 15000); 

function generateTraffic(site) {
  // Fast loop (500ms) to generate data quickly
  setInterval(async () => {
    const phase = PHASES[phaseIndex];
    let requests, errorRate, latency;

    switch (phase) {
      case 'idle':
        // Generate < 10% of limit
        requests = Math.floor(Math.random() * (site.limit * 0.09)); 
        errorRate = 0.005; // 0.5% errors
        latency = 20;
        break;

      case 'low':
        // Generate 10% - 40% of limit
        requests = Math.floor(site.limit * 0.1 + Math.random() * (site.limit * 0.3)); 
        errorRate = 0.01; // 1% errors
        latency = 40;
        break;

      case 'flash_sale': 
        // Moderate/High Traffic (110% - 150%) but LOW Errors
        requests = Math.floor(site.limit * 1.1 + Math.random() * (site.limit * 0.4)); 
        errorRate = 0.015; // 1.5% errors (Legit users)
        latency = 100;     // Slower response time
        break;

      case 'ddos': 
        // High Traffic (120% - 200%) AND HIGH Errors
        requests = Math.floor(site.limit * 1.2 + Math.random() * (site.limit * 0.8)); 
        errorRate = 0.25 + (Math.random() * 0.1); // 25% - 35% errors
        latency = 500;     // Server dying
        break;
    }

    // Send to Server
    try {
      await axios.post(SERVER_URL, {
        websiteId: site.id,
        name: site.name,
        requests,
        errorRate,
        latency
      });
      process.stdout.write("."); // Visual feedback
    } catch (e) {
      // Silent error handling
    }
  }, 500);
}

// Start generators for all 5 sites
WEBSITES.forEach(site => generateTraffic(site));