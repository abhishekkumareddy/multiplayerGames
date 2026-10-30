import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBackendUrl, setCustomBackendUrl, DEFAULT_BACKEND_URL } from '../socket/socketClient';
import { api, HealthCheckResponse } from '../api';
import { X, Server, Check, RotateCcw, Activity, ShieldCheck, AlertCircle } from 'lucide-react';

interface ServerConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
}

export const ServerConfigModal: React.FC<ServerConfigModalProps> = ({ isOpen, onClose, isConnected }) => {
  const [url, setUrl] = useState(getBackendUrl());
  const [saved, setSaved] = useState(false);
  const [testingHealth, setTestingHealth] = useState(false);
  const [healthResult, setHealthResult] = useState<{
    success: boolean;
    data?: HealthCheckResponse;
    latencyMs?: number;
    error?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomBackendUrl(url);
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const handleReset = () => {
    setCustomBackendUrl('');
    setUrl(DEFAULT_BACKEND_URL);
    setHealthResult(null);
  };

  const handleTestHealth = async () => {
    setTestingHealth(true);
    setHealthResult(null);
    const start = performance.now();
    try {
      const data = await api.checkHealth();
      const latencyMs = Math.round(performance.now() - start);
      setHealthResult({
        success: true,
        data,
        latencyMs,
      });
    } catch (err: any) {
      setHealthResult({
        success: false,
        error: err?.message || 'Failed to reach backend server. The instance may be waking up.',
      });
    } finally {
      setTestingHealth(false);
    }
  };

  const isDefaultUrl = url.trim() === DEFAULT_BACKEND_URL;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-display font-extrabold text-white">Backend Server</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-rose-400 animate-pulse'}`} />
                <span className="text-xs font-semibold text-slate-400">
                  {isConnected ? 'Connected & Active' : 'Connecting / Waking up...'}
                </span>
                {isDefaultUrl && (
                  <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20 font-medium">
                    Production Render
                  </span>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Backend API & Socket URL
                </label>
                <button
                  type="button"
                  onClick={handleTestHealth}
                  disabled={testingHealth}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  <Activity className={`w-3.5 h-3.5 ${testingHealth ? 'animate-spin' : ''}`} />
                  {testingHealth ? 'Pinging...' : 'Test Health'}
                </button>
              </div>

              <input
                type="url"
                required
                placeholder="https://multiplayergames-2.onrender.com"
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-white font-mono text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <p className="text-[11px] text-slate-400 mt-2">
                Friends Arcade automatically connects to Render backend{' '}
                <code className="text-blue-300 font-mono">https://multiplayergames-2.onrender.com</code>.
              </p>
            </div>

            {/* Health Result Banner */}
            {healthResult && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-2xl text-xs border ${
                  healthResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                }`}
              >
                {healthResult.success ? (
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-emerald-200">Backend Online (HTTP 200 OK)</div>
                      <div className="text-[11px] text-emerald-300/80 mt-0.5">
                        Latency: {healthResult.latencyMs}ms | Storage: {healthResult.data?.storage || 'In-Memory'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-rose-200">Connection Check Failed</div>
                      <div className="text-[11px] text-rose-300/80 mt-0.5">{healthResult.error}</div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5"
                title="Reset to default production URL"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <Server className="w-4 h-4" />}
                <span>{saved ? 'Saved & Reconnecting...' : 'Save & Reconnect'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
