import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { motion } from 'framer-motion';
import { divIcon } from 'leaflet';
import axios from 'axios';
import { RiMapPinLine, RiRefreshLine, RiFilterLine } from 'react-icons/ri';

const API = 'http://localhost:8000';

const CATEGORY_META = {
  pothole: { label: 'Pothole', emoji: '🕳️', color: '#ff6b35' },
  garbage: { label: 'Garbage', emoji: '🗑️', color: '#00e676' },
  streetlight: { label: 'Street Light', emoji: '💡', color: '#ffd600' },
  drainage: { label: 'Drainage', emoji: '🌊', color: '#00d4ff' },
  water_leakage: { label: 'Water Leakage', emoji: '💧', color: '#7c3aed' },
};

const STATUS_COLORS = {
  reported: '#ff6b35',
  assigned: '#a78bfa',
  in_progress: '#00d4ff',
  resolved: '#00e676',
};

// Demo complaints for map display when backend is offline
const DEMO_COMPLAINTS = [
  { id: 1, complaint_id: 'JS20240101DEMO01', category: 'pothole', status: 'reported', latitude: 19.0760, longitude: 72.8777, address: 'Bandra West, Mumbai', user_name: 'Rahul Sharma', created_at: new Date().toISOString() },
  { id: 2, complaint_id: 'JS20240101DEMO02', category: 'garbage', status: 'assigned', latitude: 19.0820, longitude: 72.8850, address: 'Dadar, Mumbai', user_name: 'Priya Patel', created_at: new Date().toISOString() },
  { id: 3, complaint_id: 'JS20240101DEMO03', category: 'streetlight', status: 'in_progress', latitude: 19.0700, longitude: 72.8700, address: 'Worli, Mumbai', user_name: 'Amit Singh', created_at: new Date().toISOString() },
  { id: 4, complaint_id: 'JS20240101DEMO04', category: 'drainage', status: 'resolved', latitude: 19.0900, longitude: 72.8600, address: 'Andheri West, Mumbai', user_name: 'Sunita Desai', created_at: new Date().toISOString() },
  { id: 5, complaint_id: 'JS20240101DEMO05', category: 'water_leakage', status: 'reported', latitude: 19.0650, longitude: 72.8900, address: 'Kurla, Mumbai', user_name: 'Vikram Mehta', created_at: new Date().toISOString() },
  { id: 6, complaint_id: 'JS20240101DEMO06', category: 'pothole', status: 'assigned', latitude: 28.6139, longitude: 77.2090, address: 'Connaught Place, Delhi', user_name: 'Anil Kumar', created_at: new Date().toISOString() },
  { id: 7, complaint_id: 'JS20240101DEMO07', category: 'garbage', status: 'in_progress', latitude: 12.9716, longitude: 77.5946, address: 'MG Road, Bangalore', user_name: 'Deepa Nair', created_at: new Date().toISOString() },
];

function createMarkerIcon(category, status) {
  const meta = CATEGORY_META[category] || { emoji: '⚠️', color: '#fff' };
  const color = STATUS_COLORS[status] || '#fff';
  return divIcon({
    html: `<div style="
      width:38px;height:38px;border-radius:50%;
      background:${meta.color}22;
      border:2px solid ${color};
      display:flex;align-items:center;justify-content:center;
      font-size:18px;
      box-shadow:0 4px 15px ${color}50;
      cursor:pointer;
    ">${meta.emoji}</div>`,
    className: '',
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
}

export default function MapView() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/complaints`);
      setComplaints(res.data.length > 0 ? res.data : DEMO_COMPLAINTS);
    } catch {
      setComplaints(DEMO_COMPLAINTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = complaints.filter(c => {
    if (filterCat !== 'all' && c.category !== filterCat) return false;
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', paddingTop: 72 }}>
      {/* Header */}
      <div style={{
        padding: '32px 24px 20px',
        background: 'linear-gradient(180deg, rgba(6,11,20,1) 0%, transparent 100%)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 10 }}>
              <RiMapPinLine style={{ color: '#00d4ff' }} /> Live Complaint Map
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
              {filtered.length} complaints shown · Real-time civic issue tracking
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              value={filterCat}
              onChange={e => setFilterCat(e.target.value)}
              style={{
                background: 'rgba(13,24,41,0.9)', border: '1px solid rgba(0,212,255,0.15)',
                color: '#fff', borderRadius: 10, padding: '8px 14px', cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORY_META).map(([k, v]) => (
                <option key={k} value={k}>{v.emoji} {v.label}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              style={{
                background: 'rgba(13,24,41,0.9)', border: '1px solid rgba(0,212,255,0.15)',
                color: '#fff', borderRadius: 10, padding: '8px 14px', cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              <option value="all">All Statuses</option>
              <option value="reported">🔴 Reported</option>
              <option value="assigned">🟣 Assigned</option>
              <option value="in_progress">🔵 In Progress</option>
              <option value="resolved">🟢 Resolved</option>
            </select>
            <button onClick={load} style={{
              background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)',
              color: '#00d4ff', borderRadius: 10, padding: '8px 14px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem',
            }}>
              <RiRefreshLine /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Map */}
      <div style={{ height: 'calc(100vh - 220px)', padding: '0 24px 24px' }}>
        <div style={{ height: '100%', borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(0,212,255,0.1)' }}>
          <MapContainer
            center={[19.076, 72.877]}
            zoom={11}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© OpenStreetMap contributors'
            />
            {filtered.map(c => (
              <Marker
                key={c.id || c.complaint_id}
                position={[c.latitude, c.longitude]}
                icon={createMarkerIcon(c.category, c.status)}
              >
                <Popup>
                  <div style={{
                    background: '#0d1829', color: '#fff',
                    borderRadius: 12, padding: '14px 16px',
                    minWidth: 200, fontFamily: 'DM Sans, sans-serif',
                  }}>
                    {c.image_url && (
                      <img src={`http://localhost:8000${c.image_url}`} alt="Issue"
                        style={{ width: '100%', borderRadius: 8, marginBottom: 10, maxHeight: 120, objectFit: 'cover' }}
                        onError={e => e.target.style.display = 'none'}
                      />
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: '1.2rem' }}>{CATEGORY_META[c.category]?.emoji}</span>
                      <strong style={{ color: CATEGORY_META[c.category]?.color || '#fff' }}>
                        {CATEGORY_META[c.category]?.label || c.category}
                      </strong>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#8899bb', marginBottom: 6 }}>
                      📍 {c.address || 'Location not available'}
                    </div>
                    <div style={{ fontSize: '0.8rem', marginBottom: 6 }}>
                      Reported by: <strong>{c.user_name}</strong>
                    </div>
                    <div style={{
                      display: 'inline-block', padding: '2px 10px', borderRadius: 20,
                      fontSize: '0.72rem', fontWeight: 600,
                      background: `${STATUS_COLORS[c.status]}20`,
                      color: STATUS_COLORS[c.status],
                      border: `1px solid ${STATUS_COLORS[c.status]}40`,
                    }}>
                      {c.status?.replace('_', ' ').toUpperCase()}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#4a5a7a', marginTop: 6 }}>
                      ID: {c.complaint_id}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(6,11,20,0.9)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0,212,255,0.1)',
        borderRadius: 50, padding: '10px 24px',
        display: 'flex', gap: 20, zIndex: 1000,
      }}>
        {Object.entries(STATUS_COLORS).map(([s, c]) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#8899bb' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
            {s.replace('_', ' ')}
          </div>
        ))}
      </div>
    </div>
  );
}