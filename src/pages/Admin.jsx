import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  RiDashboardLine, RiAlertLine, RiCheckDoubleLine, 
  RiMapPinLine, RiFilterLine, RiRefreshLine, RiLogoutBoxRLine
} from 'react-icons/ri';

const API = 'http://localhost:8000';

const CATEGORY_META = {
  pothole: { label: 'Pothole', emoji: '🕳️', color: '#ff6b35' },
  garbage: { label: 'Garbage', emoji: '🗑️', color: '#00e676' },
  streetlight: { label: 'Street Light', emoji: '💡', color: '#ffd600' },
  drainage: { label: 'Drainage', emoji: '🌊', color: '#00d4ff' },
  water_leakage: { label: 'Water Leakage', emoji: '💧', color: '#7c3aed' },
};

const STATUS_FLOW = ['reported', 'assigned', 'in_progress', 'resolved'];
const STATUS_LABELS = { reported: 'Reported', assigned: 'Assigned', in_progress: 'In Progress', resolved: 'Resolved' };

function genDemo() {
  const cats = Object.keys(CATEGORY_META);
  const statuses = STATUS_FLOW;
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad'];
  const names = ['Rahul Sharma', 'Priya Patel', 'Amit Singh', 'Sunita Desai', 'Vikram Mehta', 'Deepa Nair', 'Anil Kumar', 'Kavya Reddy'];
  return Array.from({ length: 18 }, (_, i) => ({
    id: i + 1,
    complaint_id: `JS2024${String(i + 1).padStart(6, '0')}`,
    user_name: names[i % names.length],
    mobile_number: `98${String(Math.floor(Math.random() * 1e8)).padStart(8, '0')}`,
    category: cats[i % cats.length],
    status: statuses[i % statuses.length],
    city: cities[i % cities.length],
    address: `${['MG Road', 'Park Street', 'Link Road', 'Station Road'][i % 4]}, ${cities[i % cities.length]}`,
    municipality_name: ['BMC', 'MCD', 'BBMP', 'GCC', 'GHMC'][i % 5],
    department: ['Road Department', 'Sanitation Department', 'Electricity Department'][i % 3],
    confidence: 0.75 + Math.random() * 0.2,
    created_at: new Date(Date.now() - i * 3600000 * 4).toISOString(),
  }));
}

export default function Admin() {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [updating, setUpdating] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("js_admin");
    window.location.reload(); 
  };

  const load = async () => {
    setLoading(true);
    try {
      const [cRes, sRes] = await Promise.all([
        axios.get(`${API}/api/complaints`),
        axios.get(`${API}/api/stats`),
      ]);
      setComplaints(cRes.data.length > 0 ? cRes.data : genDemo());
      setStats(sRes.data);
    } catch {
      const demo = genDemo();
      setComplaints(demo);
      const byCat = {}, byStat = {};
      demo.forEach(c => {
        byCat[c.category] = (byCat[c.category] || 0) + 1;
        byStat[c.status] = (byStat[c.status] || 0) + 1;
      });
      setStats({ total: demo.length, by_category: byCat, by_status: byStat });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (complaintId, newStatus) => {
    setUpdating(complaintId);
    try {
      const fd = new FormData();
      fd.append('status', newStatus);
      await axios.patch(`${API}/api/complaints/${complaintId}/status`, fd);
      setComplaints(prev => prev.map(c => c.complaint_id === complaintId ? { ...c, status: newStatus } : c));
    } catch {
      setComplaints(prev => prev.map(c => c.complaint_id === complaintId ? { ...c, status: newStatus } : c));
    } finally {
      setUpdating(null);
    }
  };

  const filtered = complaints.filter(c => {
    if (filterCat !== 'all' && c.category !== filterCat) return false;
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    return true;
  });

  const statCards = [
    { label: 'Total Complaints', value: stats?.total || 0, icon: <RiAlertLine />, color: '#00d4ff' },
    { label: 'Reported', value: stats?.by_status?.reported || 0, icon: '🔴', color: '#ff6b35' },
    { label: 'In Progress', value: (stats?.by_status?.assigned || 0) + (stats?.by_status?.in_progress || 0), icon: '🔵', color: '#7c3aed' },
    { label: 'Resolved', value: stats?.by_status?.resolved || 0, icon: <RiCheckDoubleLine />, color: '#00e676' },
  ];

  return (
    <div style={{ minHeight: '100vh', padding: '88px 24px 60px', maxWidth: 1300, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 10 }}>
              <RiDashboardLine style={{ color: '#00d4ff' }} /> Admin Dashboard
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
              Municipal staff portal — Jan Sahayak
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={load} style={{
              background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)',
              color: '#00d4ff', borderRadius: 10, padding: '10px 18px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem',
            }}>
              <RiRefreshLine /> Refresh
            </button>
            <button onClick={handleLogout} style={{
              background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#ef4444', borderRadius: 10, padding: '10px 18px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem',
            }}>
              <RiLogoutBoxRLine /> Logout
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          {statCards.map(({ label, value, icon, color }, i) => (
            <div key={i} style={{ background: 'rgba(13,24,41,0.7)', border: `1px solid ${color}20`, borderRadius: 18, padding: '22px 24px' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, marginBottom: 14 }}>{icon}</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color }}>{value}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Categories Section */}
        {stats?.by_category && (
          <div style={{ background: 'rgba(13,24,41,0.7)', border: '1px solid rgba(0,212,255,0.08)', borderRadius: 18, padding: '24px', marginBottom: 32 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 18 }}>Issues by Category</h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {Object.entries(stats.by_category).map(([cat, count]) => {
                const meta = CATEGORY_META[cat];
                if (!meta) return null;
                return (
                  <div key={cat} style={{ flex: '1 1 140px', background: `${meta.color}10`, border: `1px solid ${meta.color}25`, borderRadius: 12, padding: '14px' }}>
                    <div style={{ display: 'flex', gap: 8, color: meta.color, fontWeight: 600 }}><span>{meta.emoji}</span>{meta.label}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: meta.color }}>{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters and Table */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ background: '#0d1829', color: '#fff', padding: '8px', borderRadius: '8px' }}>
             <option value="all">All Categories</option>
             {Object.keys(CATEGORY_META).map(k => <option value={k}>{CATEGORY_META[k].label}</option>)}
          </select>
        </div>

        <div style={{ background: 'rgba(13,24,41,0.7)', border: '1px solid rgba(0,212,255,0.08)', borderRadius: 18, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(0,212,255,0.04)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '16px', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Reported By</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Category</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.complaint_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '16px', fontFamily: 'monospace' }}>{c.complaint_id.slice(-6)}</td>
                  <td style={{ padding: '16px' }}>{c.user_name}</td>
                  <td style={{ padding: '16px', color: CATEGORY_META[c.category]?.color }}>{CATEGORY_META[c.category]?.label}</td>
                  <td style={{ padding: '16px' }}>{STATUS_LABELS[c.status]}</td>
                  <td style={{ padding: '16px' }}>
                    <select value={c.status} onChange={e => updateStatus(c.complaint_id, e.target.value)} style={{ background: '#0d1829', color: '#00d4ff', border: '1px solid #00d4ff30', borderRadius: '6px' }}>
                      {STATUS_FLOW.map(s => <option value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
