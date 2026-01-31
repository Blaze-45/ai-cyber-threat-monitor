import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Shield, CheckCircle, ChevronDown, ChevronUp, Clock, Globe, Zap, RotateCcw, Info } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';

type Severity = 'low' | 'medium' | 'high';

interface Alert {
  id: string;
  timestamp: string;
  website: string;
  severity: Severity;
  message: string;
  actionTaken: string;
  details: {
    ipAddress?: string;
    requestCount?: number;
    anomalyScore?: number;
    blockedIPs?: number;
  };
}

// Initial Mock History
const initialMockAlerts: Alert[] = [
  {
    id: '1',
    timestamp: '2 minutes ago',
    website: 'demo-shop.com',
    severity: 'high',
    message: 'DDoS Attack Pattern Detected',
    actionTaken: '12 malicious IPs blocked automatically',
    details: { ipAddress: '192.168.1.45', requestCount: 8470, anomalyScore: 92.3, blockedIPs: 12 }
  },
  {
    id: '2',
    timestamp: '15 minutes ago',
    website: 'api.myservice.io',
    severity: 'medium',
    message: 'Unusual Traffic Spike',
    actionTaken: 'Rate limiting applied to 3 IP ranges',
    details: { requestCount: 5240, anomalyScore: 67.8, blockedIPs: 3 }
  },
  {
    id: '3',
    timestamp: '32 minutes ago',
    website: 'blog.techcorp.com',
    severity: 'low',
    message: 'Routine SSL Handshake Check',
    actionTaken: 'Certificate Validated',
    details: { requestCount: 234, anomalyScore: 12.1 }
  },
];

export function Alerts() {
  const { websiteStats } = useSocket();
  const [alerts, setAlerts] = useState<Alert[]>(initialMockAlerts);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<Severity | 'all'>('all');

  const alertedAttacksRef = useRef<Set<string>>(new Set());

  // 1. WATCH FOR REAL THREATS & TRIGGER EMAIL
  useEffect(() => {
      // RETRIEVE USER EMAIL FROM STORAGE
      const userEmail = localStorage.getItem('cyber_user_email');

      websiteStats.forEach(site => {
          const timeKey = new Date().getMinutes();
          const attackKey = `${site.id}-${site.status}-${timeKey}`;
          
          if (!alertedAttacksRef.current.has(attackKey)) {
              
              if (site.status === 'critical') {
                  // HIGH SEVERITY (DDoS)
                  alertedAttacksRef.current.add(attackKey);
                  
                  const newAlert: Alert = {
                      id: `live-crit-${Date.now()}`,
                      timestamp: 'Just now',
                      website: site.name,
                      severity: 'high',
                      message: '🚨 Active DDoS Attack Detected',
                      actionTaken: 'AI Shield Activated: Traffic Rerouting',
                      details: {
                          ipAddress: site.sourceIP || 'Distributed Botnet',
                          requestCount: site.requests,
                          anomalyScore: 99.9,
                          blockedIPs: Math.floor(Math.random() * 50) + 20
                      }
                  };
                  setAlerts(prev => [newAlert, ...prev]);

                  // TRIGGER EMAIL TO LOGGED IN USER
                  if (userEmail) {
                    console.log(`📨 Sending Alert Email to ${userEmail} for ${site.name}...`);
                    axios.post('http://localhost:3001/api/send-alert-email', {
                        targetEmail: userEmail, // PASS EMAIL TO BACKEND
                        website: site.name,
                        requests: site.requests,
                        ip: site.sourceIP,
                        time: new Date().toLocaleString()
                    }).catch(err => console.error("Email failed:", err));
                  } else {
                    console.warn("⚠️ No user email found in storage. Email alert skipped.");
                  }
              } 
              else if (site.status === 'warning') {
                  // MEDIUM SEVERITY (Suspicious)
                  alertedAttacksRef.current.add(attackKey);
                  
                  const newAlert: Alert = {
                      id: `live-warn-${Date.now()}`,
                      timestamp: 'Just now',
                      website: site.name,
                      severity: 'medium',
                      message: '⚠️ Suspicious Traffic Pattern',
                      actionTaken: 'Rate Limiting Applied',
                      details: {
                          ipAddress: site.sourceIP || 'Unknown',
                          requestCount: site.requests,
                          anomalyScore: 75.5,
                          blockedIPs: 0
                      }
                  };
                  setAlerts(prev => [newAlert, ...prev]);
              }
          }
      });
  }, [websiteStats]);

  // 2. SIMULATE "LOW" PRIORITY LOGS
  useEffect(() => {
      const interval = setInterval(() => {
          if (Math.random() > 0.7) {
              const systems = ['Database', 'Auth Service', 'Load Balancer', 'Firewall'];
              const actions = ['Backup Completed', 'Health Check Passed', 'Config Synced', 'Cache Cleared'];
              const system = systems[Math.floor(Math.random() * systems.length)];
              const action = actions[Math.floor(Math.random() * actions.length)];

              const newLog: Alert = {
                  id: `sys-${Date.now()}`,
                  timestamp: 'Just now',
                  website: 'System Internal',
                  severity: 'low',
                  message: `${system}: Routine Operation`,
                  actionTaken: action,
                  details: { requestCount: 0, anomalyScore: 0.1 }
              };
              setAlerts(prev => [newLog, ...prev]);
          }
      }, 10000); 

      return () => clearInterval(interval);
  }, []);

  const filteredAlerts = filterSeverity === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.severity === filterSeverity);

  const getSeverityStyle = (severity: Severity) => {
    switch (severity) {
      case 'high':
        return { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', icon: 'text-red-600', badge: 'bg-red-100 text-red-700 border-red-200' };
      case 'medium':
        return { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', icon: 'text-amber-600', badge: 'bg-amber-100 text-amber-700 border-amber-200' };
      case 'low':
        return { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', icon: 'text-blue-600', badge: 'bg-blue-100 text-blue-700 border-blue-200' };
    }
  };

  const getSeverityIcon = (severity: Severity) => {
    switch (severity) {
      case 'high': return AlertTriangle;
      case 'medium': return Shield;
      case 'low': return Info;
    }
  };

  const severityCount = {
    high: alerts.filter(a => a.severity === 'high').length,
    medium: alerts.filter(a => a.severity === 'medium').length,
    low: alerts.filter(a => a.severity === 'low').length,
  };

  const handleClearAlerts = () => {
      setAlerts(initialMockAlerts);
      alertedAttacksRef.current.clear();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/20 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Security Alerts</h1>
            <p className="text-gray-600">Real-time threat detection log</p>
        </div>
        <button onClick={handleClearAlerts} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors shadow-sm">
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm font-medium">Reset Log</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <motion.div layout className="bg-white border-2 border-red-200 rounded-2xl p-6 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-100/50 rounded-bl-[40px]" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center border-2 border-red-200">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-sm font-semibold text-gray-700">High Priority</span>
            </div>
            <p className="text-4xl font-bold text-red-600">{severityCount.high}</p>
          </div>
        </motion.div>

        <motion.div layout className="bg-white border-2 border-amber-200 rounded-2xl p-6 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-100/50 rounded-bl-[40px]" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center border-2 border-amber-200">
                <Shield className="w-6 h-6 text-amber-600" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Medium Priority</span>
            </div>
            <p className="text-4xl font-bold text-amber-600">{severityCount.medium}</p>
          </div>
        </motion.div>

        <motion.div layout className="bg-white border-2 border-blue-200 rounded-2xl p-6 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100/50 rounded-bl-[40px]" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center border-2 border-blue-200">
                <Info className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm font-semibold text-gray-700">System Logs</span>
            </div>
            <p className="text-4xl font-bold text-blue-600">{severityCount.low}</p>
          </div>
        </motion.div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-3 mb-6">
        {(['all', 'high', 'medium', 'low'] as const).map((severity) => (
          <button
            key={severity}
            onClick={() => setFilterSeverity(severity)}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all border-2 ${
              filterSeverity === severity
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-600 shadow-lg shadow-red-500/30'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
            }`}
          >
            {severity === 'low' ? 'System Logs' : severity.charAt(0).toUpperCase() + severity.slice(1)}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        <AnimatePresence mode='popLayout'>
        {filteredAlerts.map((alert) => {
          const style = getSeverityStyle(alert.severity);
          const Icon = getSeverityIcon(alert.severity);
          const isExpanded = expandedAlert === alert.id;

          return (
            <motion.div
              layout
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`bg-white border-2 ${style.border} rounded-2xl overflow-hidden hover:shadow-lg transition-all`}
            >
              <div className={`${style.bg} p-6`}>
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className={`w-14 h-14 rounded-xl ${style.badge} border-2 flex items-center justify-center`}>
                      <Icon className={`w-7 h-7 ${style.icon}`} />
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold border-2 ${style.badge}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                        {alert.message}
                        {alert.timestamp === 'Just now' && <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">NEW</span>}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-4 h-4" />
                        <span className="font-medium">{alert.website}</span>
                      </div>
                      <span className="hidden sm:inline">•</span>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>{alert.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedAlert(isExpanded ? null : alert.id)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:border-gray-300 transition-all flex-shrink-0"
                  >
                    <span>Details</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t-2 border-gray-200"
                >
                  <div className="p-6 space-y-4">
                    <div className={`flex items-start gap-3 p-4 border-2 rounded-xl ${alert.severity === 'low' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}`}>
                      <Zap className={`w-5 h-5 mt-0.5 flex-shrink-0 ${alert.severity === 'low' ? 'text-blue-600' : 'text-green-600'}`} />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-1">Automated Action</p>
                        <p className="text-sm text-gray-700">{alert.actionTaken}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {alert.details.ipAddress && (
                        <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-xl">
                          <p className="text-xs text-gray-600 mb-1 font-semibold">Source/System</p>
                          <code className="text-sm text-gray-900 font-mono font-bold">{alert.details.ipAddress}</code>
                        </div>
                      )}
                      {alert.details.requestCount !== undefined && (
                        <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-xl">
                          <p className="text-xs text-gray-600 mb-1 font-semibold">Request Count</p>
                          <p className="text-lg font-bold text-gray-900">{alert.details.requestCount.toLocaleString()}</p>
                        </div>
                      )}
                      {alert.details.anomalyScore !== undefined && (
                        <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-xl">
                          <p className="text-xs text-gray-600 mb-1 font-semibold">Anomaly Score</p>
                          <p className="text-lg font-bold text-gray-900">{alert.details.anomalyScore}%</p>
                        </div>
                      )}
                      {alert.details.blockedIPs !== undefined && (
                        <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-xl">
                          <p className="text-xs text-gray-600 mb-1 font-semibold">Blocked IPs</p>
                          <p className="text-lg font-bold text-gray-900">{alert.details.blockedIPs}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
              </AnimatePresence>
            </motion.div>
          );
        })}
        </AnimatePresence>
      </div>
    </div>
  );
}