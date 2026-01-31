import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs'; 
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios'; 
import nodemailer from 'nodemailer'; 

// --- CONFIGURATION ---
const PORT = 3001;
const AI_SERVICE_URL = 'http://127.0.0.1:5000/predict'; // The Python Brain
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, 'websites.json'); 

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: ["http://localhost:5173", "http://localhost:3000"], methods: ["GET", "POST", "DELETE"] }
});

// --- EMAIL CONFIGURATION ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com', // ⚠️ REPLACE THIS
    pass: 'your-app-password'     // ⚠️ REPLACE THIS
  }
});

// --- LOAD DATABASE ---
let registeredWebsites = [];
try {
  const data = fs.readFileSync(DB_FILE, 'utf8');
  registeredWebsites = JSON.parse(data);
  console.log(`📂 Loaded ${registeredWebsites.length} websites from database.`);
} catch (err) {
  console.log("⚠️ No database found, starting empty.");
  registeredWebsites = [];
}

let websiteStats = {};
let alerts = [];

// Initialize Stats for loaded sites
registeredWebsites.forEach(site => {
  websiteStats[site.id] = {
    id: site.id,
    name: site.name,
    category: site.category || 'Blog',
    baseTraffic: site.baseTraffic || 100,
    requests: 0,
    errorRate: 0,
    latency: 20,
    status: 'active',
    threatLevel: 'low',
    lastAction: 'Registered',
    timestamp: new Date()
  };
});

// --- ENDPOINTS ---

// 1. GET ALL WEBSITES
app.get('/api/websites', (req, res) => {
  res.json(registeredWebsites);
});

// 2. ADD WEBSITE
app.post('/api/add-website', (req, res) => {
  const { name, category, baseTraffic } = req.body;
  const newId = Date.now().toString();

  const newConfig = {
    id: newId,
    name: name,
    category: category || 'Blog',
    baseTraffic: baseTraffic || 100,
    volatility: (baseTraffic || 100) * 0.2
  };

  registeredWebsites.push(newConfig);
  fs.writeFileSync(DB_FILE, JSON.stringify(registeredWebsites, null, 2));

  websiteStats[newId] = {
    id: newId,
    name: name,
    category: category || 'Blog',
    baseTraffic: baseTraffic || 100,
    requests: 0,
    errorRate: 0,
    latency: 20,
    status: 'active',
    threatLevel: 'low',
    lastAction: 'Initialized',
    timestamp: new Date()
  };

  io.emit('website-update', websiteStats[newId]);
  res.status(200).json({ success: true, id: newId });
});

// 3. DELETE WEBSITE
app.delete('/api/delete-website/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = registeredWebsites.length;
  
  registeredWebsites = registeredWebsites.filter(w => w.id !== id);
  
  if (registeredWebsites.length < initialLength) {
      fs.writeFileSync(DB_FILE, JSON.stringify(registeredWebsites, null, 2));
      delete websiteStats[id]; 
      io.emit('website-removed', id); 
      res.json({ success: true });
  } else {
      res.status(404).json({ error: "Website not found" });
  }
});

// 4. TRAFFIC LOG (THE AI INTEGRATION)
app.post('/api/traffic-log', async (req, res) => {
  const { websiteId, name, requests, errorRate, latency, sourceIP } = req.body;
  
  const siteConfig = registeredWebsites.find(w => w.id === websiteId);
  if (!siteConfig) return res.sendStatus(404);

  let analysis = { threatLevel: 'low', status: 'active', action: 'Monitor' };

  try {
    const aiResponse = await axios.post(AI_SERVICE_URL, {
      requests,
      errorRate,
      latency
    });
    analysis = aiResponse.data;
  } catch (error) {
    if (requests > 2000) analysis = { threatLevel: 'high', status: 'critical', action: 'Fallback Block' };
  }

  websiteStats[websiteId] = {
    id: websiteId,
    name: name,
    category: siteConfig.category,
    baseTraffic: siteConfig.baseTraffic,
    requests: requests,
    errorRate: errorRate,
    latency: latency,
    status: analysis.status,     
    threatLevel: analysis.threatLevel, 
    lastAction: analysis.action,
    sourceIP: sourceIP, 
    timestamp: new Date()
  };

  if (analysis.status === 'critical') {
    const newAlert = {
      id: Date.now(),
      website: name,
      severity: 'high',
      message: `AI DETECTED ATTACK: ${requests} req/s`,
      action: analysis.action,
      timestamp: new Date().toLocaleTimeString()
    };
    
    if (alerts.length > 50) alerts.pop();
    alerts.unshift(newAlert);
    io.emit('new-alert', newAlert);
  } 

  io.emit('website-update', websiteStats[websiteId]);
  res.sendStatus(200);
});

// 5. SEND EMAIL ALERT ENDPOINT
app.post('/api/send-alert-email', async (req, res) => {
  // Read 'targetEmail' from request body
  const { website, requests, ip, time, targetEmail } = req.body;

  const recipient = targetEmail || 'your-fallback-email@gmail.com'; // Fallback if local storage empty

  const mailOptions = {
    from: '"CyberShield AI" <no-reply@cybershield.com>',
    to: recipient, // DYNAMIC RECIPIENT
    subject: `🚨 CRITICAL ALERT: DDoS Detected on ${website}`,
    html: `
      <div style="font-family: Arial, sans-serif; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; max-width: 600px;">
        <div style="background-color: #ef4444; padding: 20px; color: white;">
          <h2 style="margin: 0;">⚠️ DDoS Attack Detected</h2>
        </div>
        <div style="padding: 20px; background-color: #fff;">
          <p style="font-size: 16px;">An active threat has been detected on your monitored asset.</p>
          
          <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Target Website:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${website}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Traffic Load:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; color: #dc2626;">${requests} req/s</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Source IP:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${ip || 'Distributed Botnet'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Time:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${time}</td>
            </tr>
          </table>

          <div style="margin-top: 20px; padding: 15px; background-color: #ecfdf5; border-radius: 8px; border: 1px solid #10b981;">
            <p style="margin: 0; color: #047857; font-weight: bold;">✅ AI Mitigation Activated</p>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #065f46;">Traffic is being rerouted. Malicious IPs are being blocked automatically.</p>
          </div>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email alert sent for ${website} to ${recipient}`);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Email failed:", error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// --- BACKGROUND TRAFFIC SIMULATOR ---
setInterval(() => {
  registeredWebsites.forEach(site => {
    const currentStat = websiteStats[site.id];
    const isStale = (new Date() - new Date(currentStat?.timestamp || 0)) > 2000;

    if (isStale) {
      const volatility = (site.baseTraffic || 100) * 0.2;
      const noise = Math.floor(Math.random() * volatility * 2 - volatility);
      const newRequests = Math.max(50, (site.baseTraffic || 100) + noise);

      websiteStats[site.id] = {
        ...currentStat,
        requests: newRequests,
        errorRate: 0,
        latency: 20 + Math.floor(Math.random() * 10),
        status: 'active',
        threatLevel: 'low',
        timestamp: new Date()
      };
      io.emit('website-update', websiteStats[site.id]);
    }
  });
}, 3000); 

// --- SOCKET CONNECTION ---
io.on('connection', (socket) => {
  socket.emit('init-stats', Object.values(websiteStats));
});

server.listen(PORT, () => {
  console.log(`🛡️  Node Server running on port ${PORT}`);
});