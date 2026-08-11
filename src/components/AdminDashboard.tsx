import React, { useState, useEffect } from 'react';
import {
  Lock,
  ShieldCheck,
  LogOut,
  RefreshCw,
  Activity,
  Users,
  Clock,
  Zap,
  TrendingUp,
  Smartphone,
  Laptop,
  Tablet,
  Radio,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export interface AnalyticsData {
  serverUptimeSec: number;
  totalPingsReceived: number;
  currentActiveListeners: number;
  peakListenersToday: number;
  simulatedBoostOffset: number;
  totalDisplayedListeners: number;
  totalUniqueSessionsAllTime: number;
  totalListeningHoursAllTime: string;
  avgSessionDurationSec: number;
  deviceBreakdown: {
    Mobile: number;
    Tablet: number;
    Desktop: number;
    Other: number;
  };
  hourlyGraphData: Array<{ hour: string; listeners: number }>;
  activeSessions: Array<{
    clientId: string;
    joinedAt: number;
    onlineDurationSec: number;
    lastPingAgoSec: number;
    pingsCount: number;
    deviceCategory: string;
    userAgent?: string;
  }>;
  recentCompletedHistory: Array<{
    clientId: string;
    joinedAt: number;
    leftAt: number;
    durationSec: number;
    totalPings: number;
    deviceCategory: string;
  }>;
}

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export const AdminDashboard: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [token, setToken] = useState<string | null>(() =>
    sessionStorage.getItem('highway_admin_token')
  );
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [newOffsetInput, setNewOffsetInput] = useState<number | ''>('');
  const [configSuccessMsg, setConfigSuccessMsg] = useState<string | null>(null);

  // Authenticate Admin Password
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsLoading(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const json = await res.json();

      if (res.ok && json.token) {
        setToken(json.token);
        sessionStorage.setItem('highway_admin_token', json.token);
        setPassword('');
        fetchAnalytics(json.token);
      } else {
        setLoginError(json.error || 'Authentication failed');
      }
    } catch (err) {
      setLoginError('Network error connecting to backend');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Protected Analytics
  const fetchAnalytics = async (authToken = token) => {
    if (!authToken) return;
    setIsRefreshing(true);

    try {
      const res = await fetch('/api/admin/analytics', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (res.status === 401) {
        // Token expired or invalid
        handleLogout();
        return;
      }

      if (res.ok) {
        const json = await res.json();
        setData(json.analytics);
        setNewOffsetInput(json.analytics.simulatedBoostOffset);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Update Simulated Offset Config
  const handleUpdateOffset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newOffsetInput === '' || !token) return;

    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ offset: Number(newOffsetInput) }),
      });

      if (res.ok) {
        setConfigSuccessMsg('Simulated offset updated successfully!');
        fetchAnalytics();
        setTimeout(() => setConfigSuccessMsg(null), 3000);
      }
    } catch (err) {
      console.error('Error updating config:', err);
    }
  };

  // Logout Admin Session
  const handleLogout = () => {
    if (token) {
      fetch('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    setToken(null);
    sessionStorage.removeItem('highway_admin_token');
    setData(null);
  };

  useEffect(() => {
    if (token) {
      fetchAnalytics(token);
      const interval = setInterval(() => fetchAnalytics(token), 10000); // Poll every 10s
      return () => clearInterval(interval);
    }
  }, [token]);

  // Format Seconds to MM:SS or HH:MM:SS
  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const remainingSecs = secs % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m ${remainingSecs}s`;
    }
    return `${mins}m ${remainingSecs}s`;
  };

  // Unauthenticated Login Screen
  if (!token) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-200 font-poppins">
        <div className="w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl text-white">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-3">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">Highway Radio Admin</h2>
            <p className="text-xs text-slate-400 mt-1">
              Protected analytics & live audience dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                Admin Security Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password..."
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all cursor-pointer shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Authenticate Session</span>
                </>
              )}
            </button>
          </form>

          {onClose && (
            <div className="mt-4 text-center">
              <button
                onClick={onClose}
                className="text-xs text-slate-500 hover:text-slate-300 transition-all cursor-pointer"
              >
                Return to Radio App
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard Screen
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/95 backdrop-blur-xl text-slate-100 font-poppins p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        {/* Top Bar Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-slate-900 border border-amber-500/30 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white leading-tight">
                  Highway Radio Telemetry
                </h1>
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Protected Active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time listening statistics & audience analytics dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchAnalytics()}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Admin</span>
            </button>
          </div>
        </header>

        {data ? (
          <>
            {/* KPI Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* Card 1: Active Listeners */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 shadow-lg">
                <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold">
                  <span>Active Now</span>
                  <Activity className="w-4 h-4" />
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-black text-emerald-300">
                    {data.currentActiveListeners}
                  </span>
                  <span className="text-[11px] text-emerald-200/60 block mt-0.5">
                    Real active connections
                  </span>
                </div>
              </div>

              {/* Card 2: Peak Concurrent */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 shadow-lg">
                <div className="flex items-center justify-between text-amber-400 text-xs font-semibold">
                  <span>Peak Today</span>
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-black text-amber-300">
                    {data.peakListenersToday}
                  </span>
                  <span className="text-[11px] text-amber-200/60 block mt-0.5">
                    Highest actual concurrent
                  </span>
                </div>
              </div>

              {/* Card 3: Total Unique Sessions */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-sky-500/30 shadow-lg">
                <div className="flex items-center justify-between text-sky-400 text-xs font-semibold">
                  <span>Total Sessions</span>
                  <Users className="w-4 h-4" />
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-black text-sky-300">
                    {data.totalUniqueSessionsAllTime}
                  </span>
                  <span className="text-[11px] text-sky-200/60 block mt-0.5">
                    All-time unique connections
                  </span>
                </div>
              </div>

              {/* Card 4: Total Listening Hours */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-purple-500/30 shadow-lg">
                <div className="flex items-center justify-between text-purple-400 text-xs font-semibold">
                  <span>Total Time</span>
                  <Clock className="w-4 h-4" />
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-black text-purple-300">
                    {data.totalListeningHoursAllTime}
                  </span>
                  <span className="text-[11px] text-purple-200/60 block mt-0.5">
                    Hours listened overall
                  </span>
                </div>
              </div>

              {/* Card 5: Avg Session Duration */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 shadow-lg col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between text-slate-300 text-xs font-semibold">
                  <span>Avg Session</span>
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-bold text-white">
                    {formatTime(data.avgSessionDurationSec)}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Average retention time
                  </span>
                </div>
              </div>
            </div>

            {/* Graphs & Config Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Graph: Hourly Activity */}
              <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-amber-400" /> Hourly Listener Distribution
                    </h3>
                    <p className="text-xs text-slate-400">Peak listeners by hour of day (24h)</p>
                  </div>
                </div>

                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.hourlyGraphData}>
                      <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          color: '#fff',
                        }}
                      />
                      <Bar dataKey="listeners" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Device Category & Simulated Offset Control */}
              <div className="space-y-6">
                {/* Device Distribution Pie Chart */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
                  <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-sky-400" /> Device Distribution
                  </h3>
                  <div className="h-44 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Mobile', value: data.deviceBreakdown.Mobile || 0 },
                            { name: 'Desktop', value: data.deviceBreakdown.Desktop || 0 },
                            { name: 'Tablet', value: data.deviceBreakdown.Tablet || 0 },
                            { name: 'Other', value: data.deviceBreakdown.Other || 0 },
                          ]}
                          dataKey="value"
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={60}
                          paddingAngle={3}
                        >
                          {PIE_COLORS.map((color, idx) => (
                            <Cell key={`cell-${idx}`} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderColor: '#334155',
                            borderRadius: '12px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-medium pt-2 border-t border-slate-800">
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                      <span>Mobile: {data.deviceBreakdown.Mobile}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span>Desktop: {data.deviceBreakdown.Desktop}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <span>Tablet: {data.deviceBreakdown.Tablet}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                      <span>Other: {data.deviceBreakdown.Other}</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Offset Config Box */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
                  <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" /> Adjust Listener Boost Offset
                  </h3>
                  <p className="text-xs text-slate-400 mb-3">
                    Public displayed count = Actual ({data.currentActiveListeners}) + Offset (+
                    {data.simulatedBoostOffset})
                  </p>

                  <form onSubmit={handleUpdateOffset} className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max="500"
                      value={newOffsetInput}
                      onChange={(e) =>
                        setNewOffsetInput(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                      placeholder="e.g. 50"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all cursor-pointer whitespace-nowrap"
                    >
                      Save
                    </button>
                  </form>

                  {configSuccessMsg && (
                    <div className="flex items-center gap-1.5 mt-2 text-emerald-400 text-xs font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{configSuccessMsg}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Table: Active Sessions */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" /> Active Listener Heartbeats (
                    {data.activeSessions.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Live connected clients sending 10s ping requests
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-mono">
                    <tr>
                      <th className="p-3">Client ID</th>
                      <th className="p-3">Device</th>
                      <th className="p-3">Duration</th>
                      <th className="p-3 text-center">Pings</th>
                      <th className="p-3 text-right">Last Ping</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono text-slate-200">
                    {data.activeSessions.length > 0 ? (
                      data.activeSessions.map((s) => (
                        <tr key={s.clientId} className="hover:bg-slate-800/40">
                          <td className="p-3 text-amber-300 font-semibold">{s.clientId}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                              {s.deviceCategory}
                            </span>
                          </td>
                          <td className="p-3">{formatTime(s.onlineDurationSec)}</td>
                          <td className="p-3 text-center font-bold text-emerald-400">
                            {s.pingsCount}
                          </td>
                          <td className="p-3 text-right text-slate-400">
                            {s.lastPingAgoSec}s ago
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-500">
                          No active clients currently listening
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table: Recent Session Audit History */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" /> Completed Session History Logs (
                  {data.recentCompletedHistory.length})
                </h3>
                <p className="text-xs text-slate-400">Audit trail of disconnected user sessions</p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 text-xs max-h-64 overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-mono sticky top-0 bg-slate-900">
                    <tr>
                      <th className="p-3">Client ID</th>
                      <th className="p-3">Device</th>
                      <th className="p-3">Listening Duration</th>
                      <th className="p-3">Pings</th>
                      <th className="p-3 text-right">Disconnected At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono text-slate-300">
                    {data.recentCompletedHistory.length > 0 ? (
                      data.recentCompletedHistory.map((h, i) => (
                        <tr key={i} className="hover:bg-slate-800/30">
                          <td className="p-3 text-slate-400">{h.clientId}</td>
                          <td className="p-3 text-slate-400">{h.deviceCategory}</td>
                          <td className="p-3 text-emerald-400 font-semibold">
                            {formatTime(h.durationSec)}
                          </td>
                          <td className="p-3 text-slate-400">{h.totalPings}</td>
                          <td className="p-3 text-right text-slate-500">
                            {new Date(h.leftAt).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-500">
                          No completed sessions logged yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
            <p className="text-sm">Loading protected telemetry metrics...</p>
          </div>
        )}
      </div>
    </div>
  );
};
