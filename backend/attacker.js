import axios from 'axios';

// --- CONFIGURATION ---
const TARGET_SERVER_IP = 'localhost'; // Change to PC 1's IP for second PC demo
const API_BASE = `http://${TARGET_SERVER_IP}:3001/api`;

// --- HELPER: GENERATE RANDOM BOTNET IP ---
const getRandomIP = () => `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;

async function startExploit() {
    try {
        // 1. Fetch available targets
        const res = await axios.get(`${API_BASE}/websites`);
        const sites = res.data;

        if (sites.length === 0) {
            console.log("❌ No websites found. Add one on the dashboard first!");
            return;
        }

        // 2. Select a target (For demo, we'll pick the first one, or you can hardcode an ID)
        const targetSite = sites[0]; 
        console.log(`\n🏴‍☠️  [BOTNET INITIALIZED]`);
        console.log(`🎯  TARGETING: ${targetSite.name} (ID: ${targetSite.id})`);
        console.log(`🚀  FLOODING WITH RANDOMIZED IPs...`);

        // 3. The Attack Loop
        setInterval(async () => {
            const fakeIP = getRandomIP(); // Use a unique IP for every "packet"
            
            try {
                await axios.post(`${API_BASE}/traffic-log`, {
                    websiteId: targetSite.id,
                    name: targetSite.name,
                    requests: 4500 + Math.floor(Math.random() * 500), // Massive spike
                    errorRate: 0.35 + (Math.random() * 0.15),       // High errors
                    latency: 900 + Math.floor(Math.random() * 300),  // Huge lag
                    sourceIP: fakeIP // This makes it look like a real Botnet
                });
                process.stdout.write(`⚡ Packet Sent from Bot IP: ${fakeIP}\r`);
            } catch (e) {
                // Server is overwhelmed
            }
        }, 100); // Send 10 "packets" per second

    } catch (err) {
        console.error("❌ Connection Failed. Is the server running?");
    }
}

startExploit();