import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  RiDashboardLine, RiAlertLine, RiCheckDoubleLine, RiLoader4Line,
  RiMapPinLine, RiFilterLine, RiRefreshLine, RiEditLine,
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

// Generate demo data for offline use
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
    latitude: 19.07 + (Math.random() - 0.5) * 0.1,
    longitude: 72.87 + (Math.random() - 0.5) * 0.1,
    municipality_name: ['BMC', 'MCD', 'BBMP', 'GCC', 'GHMC'][i % 5],
    department: ['Road Department', 'Sanitation Department', 'Electricity Department'][i % 3],
    confidence: 0.75 + Math.random() * 0.2,
    created_at: new Date(Date.now() - i * 3600000 * 4).toISOString(),
    image_url: null,
  }));
}

export default function Admin() {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [updating, setUpdating] = useState(null);

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
      const byCat = {}, byStat = {}, byCity = {};
      demo.forEach(c => {
        byCat[c.category] = (byCat[c.category] || 0) + 1;
        byStat[c.status] = (byStat[c.status] || 0) + 1;
        byCity[c.city] = (byCity[c.city] || 0) + 1;
      });
      setStats({ total: demo.length, by_category: byCat, by_status: byStat, by_city: byCity });
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
          <button onClick={load} style={{
            background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)',
            color: '#00d4ff', borderRadius: 10, padding: '10px 18px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem',
          }}>
            <RiRefreshLine /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          {statCards.map(({ label, value, icon, color }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              style={{
                background: 'rgba(13,24,41,0.7)',
                border: `1px solid ${color}20`,
                borderRadius: 18, padding: '22px 24px',
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: `${color}15`, border: `1px solid ${color}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color, fontSize: 18, marginBottom: 14,
              }}>{icon}</div>
              <div style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 800, color, lineHeight: 1 }}>
                {value}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 6 }}>{label}</div>
            </motion.div>
          ))}
        </div>

        {/* Category breakdown */}
        {stats?.by_category && (
          <div style={{
            background: 'rgba(13,24,41,0.7)', border: '1px solid rgba(0,212,255,0.08)',
            borderRadius: 18, padding: '24px', marginBottom: 32,
          }}>
            <h3 style={{ fontWeight: 700, marginBottom: 18, fontSize: '1rem' }}>Issues by Category</h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {Object.entries(stats.by_category).map(([cat, count]) => {
                const meta = CATEGORY_META[cat];
                if (!meta) return null;
                const total = stats.total || 1;
                return (
                  <div key={cat} style={{
                    flex: '1 1 140px',
                    background: `${meta.color}10`, border: `1px solid ${meta.color}25`,
                    borderRadius: 12, padding: '14px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: '1.2rem' }}>{meta.emoji}</span>
                      <span style={{ fontSize: '0.8rem', color: meta.color, fontWeight: 600 }}>{meta.label}</span>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: meta.color }}>{count}</div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, marginTop: 8 }}>
                      <div style={{ height: '100%', width: `${(count / total) * 100}%`, background: meta.color, borderRadius: 2 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <RiFilterLine style={{ color: 'var(--text-muted)' }} />
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            style={{ background: 'rgba(13,24,41,0.9)', border: '1px solid rgba(0,212,255,0.15)', color: '#fff', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            <option value="all">All Categories</option>
            {Object.entries(CATEGORY_META).map(([k, v]) => (
              <option key={k} value={k}>{v.emoji} {v.label}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ background: 'rgba(13,24,41,0.9)', border: '1px solid rgba(0,212,255,0.15)', color: '#fff', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            <option value="all">All Statuses</option>
            {STATUS_FLOW.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            Showing {filtered.length} of {complaints.length}
          </span>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : (
          <div style={{ background: 'rgba(13,24,41,0.7)', border: '1px solid rgba(0,212,255,0.08)', borderRadius: 18, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,212,255,0.04)', borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
                    {['ID', 'Reported By', 'Category', 'Location', 'Municipality', 'Status', 'Date', 'Action'].map(h => (
                      <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => {
                    const meta = CATEGORY_META[c.category] || { emoji: '⚠️', color: '#fff', label: c.category };
                    return (
                      <motion.tr
                        key={c.complaint_id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.02 }}
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.03)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                          {c.complaint_id?.slice(-8)}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 600 }}>{c.user_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.mobile_number}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>{meta.emoji}</span>
                            <span style={{ color: meta.color, fontWeight: 600 }}>{meta.label}</span>
                          </div>
                          {c.confidence && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              {Math.round(c.confidence * 100)}% AI
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px', maxWidth: 180 }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                            <RiMapPinLine style={{ color: '#00d4ff', flexShrink: 0, marginTop: 2 }} />
                            <div>
                              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.4 }}>
                                {c.address?.slice(0, 50)}{c.address?.length > 50 ? '...' : ''}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.city}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{c.municipality_name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.department}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span className={`badge badge-${c.status}`}>
                            {STATUS_LABELS[c.status] || c.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                          {c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '-'}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <select
                            value={c.status}
                            disabled={updating === c.complaint_id}
                            onChange={e => updateStatus(c.complaint_id, e.target.value)}
                            style={{
                              background: 'rgba(0,212,255,0.08)',
                              border: '1px solid rgba(0,212,255,0.2)',
                              color: '#00d4ff', borderRadius: 8, padding: '6px 10px',
                              cursor: 'pointer', fontSize: '0.78rem',
                              opacity: updating === c.complaint_id ? 0.5 : 1,
                            }}
                          >
                            {STATUS_FLOW.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                          </select>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                No complaints match the current filters.
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}