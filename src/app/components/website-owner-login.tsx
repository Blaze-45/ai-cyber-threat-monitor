import { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Mail, Globe, Check, Sparkles, ArrowRight } from 'lucide-react';

interface WebsiteOwnerLoginProps {
  onLogin: () => void;
}

export function WebsiteOwnerLogin({ onLogin }: WebsiteOwnerLoginProps) {
  const [domain, setDomain] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    
    // Simulate API Authentication
    setTimeout(() => {
      // 1. CRITICAL FIX: Save Email to LocalStorage so Alerts page can use it
      localStorage.setItem('cyber_user_email', email);
      
      // 2. Proceed to Login
      onLogin();
    }, 2000);
  };

  const isFormValid = domain.length > 0 && email.length > 0 && password.length > 0;

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      {/* Subtle Animated Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, #ff5757 1px, transparent 1px),
            linear-gradient(to bottom, #ff5757 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }} />
      </div>

      {/* Floating Cyber Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              opacity: 0 
            }}
            animate={{ 
              y: ['0vh', '100vh'],
              opacity: [0, 0.3, 0],
            }}
            transition={{ 
              duration: Math.random() * 15 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: 'linear'
            }}
            className="absolute w-0.5 h-12 bg-gradient-to-b from-transparent via-red-400 to-transparent -top-12"
            style={{ left: `${(i * 6.7 + Math.random() * 3)}%` }}
          />
        ))}
      </div>

      {/* Diagonal Accent Shapes */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-red-50/50 to-transparent rounded-bl-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-gradient-to-tr from-blue-50/50 to-transparent rounded-tr-[80px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 min-h-screen">
        {/* Top Navigation Bar */}
        <nav className="px-6 md:px-12 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-xl bg-red-500 -z-10"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CyberShield</h1>
                <p className="text-xs text-gray-500">Security Platform</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-red-600 transition-colors">Features</a>
              <a href="#" className="hover:text-red-600 transition-colors">Pricing</a>
              <a href="#" className="hover:text-red-600 transition-colors">Contact</a>
            </div>
          </div>
        </nav>

        {/* Login Section */}
        <div className="px-6 md:px-12 py-12 md:py-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              
              {/* Left Side - Hero Content */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="order-2 lg:order-1"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-100 text-red-600 text-sm mb-6">
                  <Sparkles className="w-4 h-4" />
                  <span>AI-Powered Protection</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  Secure Your
                  <span className="block text-red-600 mt-2">Digital Assets</span>
                </h2>
                
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Monitor, detect, and protect your website from cyber threats in real-time with our advanced AI-powered security platform.
                </p>

                {/* Feature List */}
                <div className="space-y-4 mb-8">
                  {[
                    'Real-time threat detection',
                    'AI-powered anomaly analysis', 
                    'Automated incident response',
                    '24/7 continuous monitoring'
                  ].map((feature, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * idx + 0.3, duration: 0.4 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap items-center gap-8 pt-6 border-t border-gray-200">
                  <div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">99.9%</div>
                    <div className="text-sm text-gray-600">Uptime</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">24/7</div>
                    <div className="text-sm text-gray-600">Monitoring</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">500+</div>
                    <div className="text-sm text-gray-600">Protected Sites</div>
                  </div>
                </div>
              </motion.div>

              {/* Right Side - Login Form */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="order-1 lg:order-2"
              >
                <div className="relative">
                  {/* Glassmorphic Card with Unique Design */}
                  <div className="relative bg-white rounded-3xl shadow-2xl shadow-gray-200/70 border border-gray-100 overflow-hidden">
                    {/* Top Accent Bar */}
                    <div className="h-2 bg-gradient-to-r from-red-500 via-red-600 to-pink-600" />
                    
                    <div className="p-8 md:p-10">
                      <div className="text-center mb-8">
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                          Welcome Back
                        </h3>
                        <p className="text-gray-600">Sign in to your security dashboard</p>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Domain Field */}
                        <div className="relative">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Website Domain
                          </label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Globe className="w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                            </div>
                            <input
                              type="text"
                              value={domain}
                              onChange={(e) => setDomain(e.target.value)}
                              onFocus={() => setFocusedField('domain')}
                              onBlur={() => setFocusedField(null)}
                              placeholder="example.com"
                              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-red-500 focus:outline-none transition-all"
                            />
                            {focusedField === 'domain' && (
                              <motion.div
                                layoutId="input-focus"
                                className="absolute inset-0 rounded-xl border-2 border-red-500 pointer-events-none"
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                              />
                            )}
                          </div>
                        </div>

                        {/* Email Field */}
                        <div className="relative">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Address
                          </label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                            </div>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              onFocus={() => setFocusedField('email')}
                              onBlur={() => setFocusedField(null)}
                              placeholder="you@example.com"
                              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-red-500 focus:outline-none transition-all"
                            />
                            {focusedField === 'email' && (
                              <motion.div
                                layoutId="input-focus"
                                className="absolute inset-0 rounded-xl border-2 border-red-500 pointer-events-none"
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                              />
                            )}
                          </div>
                        </div>

                        {/* Password Field */}
                        <div className="relative">
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-semibold text-gray-700">
                              Password
                            </label>
                            <a href="#" className="text-sm text-red-600 hover:text-red-700 transition-colors">
                              Forgot?
                            </a>
                          </div>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                            </div>
                            <input
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              onFocus={() => setFocusedField('password')}
                              onBlur={() => setFocusedField(null)}
                              placeholder="••••••••"
                              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-red-500 focus:outline-none transition-all"
                            />
                            {focusedField === 'password' && (
                              <motion.div
                                layoutId="input-focus"
                                className="absolute inset-0 rounded-xl border-2 border-red-500 pointer-events-none"
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                              />
                            )}
                          </div>
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="remember"
                            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                          />
                          <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                            Remember me for 30 days
                          </label>
                        </div>

                        {/* Submit Button */}
                        <motion.button
                          type="submit"
                          disabled={!isFormValid || isAuthenticating}
                          whileHover={{ scale: isFormValid ? 1.02 : 1 }}
                          whileTap={{ scale: isFormValid ? 0.98 : 1 }}
                          className={`relative w-full py-4 rounded-xl font-semibold text-white overflow-hidden transition-all shadow-lg ${
                            isFormValid
                              ? 'bg-gradient-to-r from-red-500 to-red-600 hover:shadow-xl hover:shadow-red-500/30'
                              : 'bg-gray-300 cursor-not-allowed'
                          }`}
                        >
                          {isAuthenticating ? (
                            <div className="flex items-center justify-center gap-2">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              >
                                <Shield className="w-5 h-5" />
                              </motion.div>
                              <span>Authenticating...</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                                <span>Sign In to Dashboard</span>
                                <ArrowRight className="w-5 h-5" />
                            </div>
                          )}
                        </motion.button>
                      </form>

                      {/* Footer */}
                      <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                        <p className="text-sm text-gray-600">
                          Don't have an account?{' '}
                          <a href="#" className="text-red-600 font-semibold hover:text-red-700 transition-colors">
                            Start Free Trial
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Floating Security Badge */}
                  <motion.div
                    animate={{ 
                      y: [0, -10, 0],
                      rotate: [0, 5, 0]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                    className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-2xl shadow-green-500/40 flex items-center justify-center"
                  >
                    <div className="text-center text-white">
                      <div className="text-2xl font-bold">SSL</div>
                      <div className="text-xs">Secured</div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}