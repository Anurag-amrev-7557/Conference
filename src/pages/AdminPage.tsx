import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../components/admin/AdminLayout';
import { BlogManager } from '../components/admin/BlogManager';
import { EventManager } from '../components/admin/EventManager';
import { ContentManager } from '../components/admin/ContentManager';
import { SettingsManager } from '../components/admin/SettingsManager';
import { AppearanceManager } from '../components/admin/AppearanceManager';
import { AdminOverview } from '../components/admin/AdminOverview';
import { Lock, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { config } from '../lib/config';
import { api } from '../lib/api';

export const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('adminToken')
  );
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { token } = await api.login(password);
      setIsAuthenticated(true);
      localStorage.setItem('adminToken', token);
      localStorage.setItem(config.admin.sessionKey, 'true');
    } catch (err: any) {
      setError(err.message || 'Incorrect administrative password.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminToken');
    localStorage.removeItem(config.admin.sessionKey);
    navigate('/admin');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-off p-6 relative">
        <div className="absolute inset-0 bg-grid-studio opacity-40 pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="bg-white p-10 rounded-[40px] border border-border/40 shadow-alabaster relative z-10">
            <div className="flex flex-col items-center text-center mb-10">
              <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-6 shadow-xl shadow-accent/20">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-serif italic text-text mb-2">Gatekeeper</h1>
              <p className="text-sm text-muted">Enter administrative credentials to maintain the Superhumanly AI Playbook.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] ml-2">Access Key</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-6 py-4 rounded-2xl bg-off border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all text-center tracking-widest"
                />
              </div>

              {error && (
                <p className="text-xs font-bold text-rose-500 text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-accent text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-accent2 transition-all shadow-lg shadow-accent/20 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Unlock Dashboard
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-8 pt-8 border-t border-border/10">
               <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] text-center">
                 Default Key: admin123
               </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route 
        path="dashboard" 
        element={
          <AdminLayout title="Dashboard" onLogout={handleLogout}>
            <AdminOverview />
          </AdminLayout>
        } 
      />
      <Route 
        path="blogs" 
        element={
          <AdminLayout title="Blog Management" onLogout={handleLogout}>
            <BlogManager />
          </AdminLayout>
        } 
      />
      <Route 
        path="events" 
        element={
          <AdminLayout title="Event Management" onLogout={handleLogout}>
            <EventManager />
          </AdminLayout>
        } 
      />
      <Route 
        path="content" 
        element={
          <AdminLayout title="Section Content" onLogout={handleLogout}>
            <ContentManager />
          </AdminLayout>
        } 
      />
      <Route 
        path="settings" 
        element={
          <AdminLayout title="General Settings" onLogout={handleLogout}>
            <SettingsManager />
          </AdminLayout>
        } 
      />
      <Route 
        path="appearance" 
        element={
          <AdminLayout title="Appearance & Branding" onLogout={handleLogout}>
            <AppearanceManager />
          </AdminLayout>
        } 
      />
    </Routes>
  );
};
