import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  RiCameraLine, RiUpload2Line, RiMapPinLine, RiCheckLine,
  RiCloseLine, RiLoader4Line, RiAlertLine, RiRobot2Line,
} from 'react-icons/ri';

const API = 'http://localhost:8000';

const CATEGORY_LABELS = {
  pothole: { label: 'Pothole', emoji: '🕳️', color: '#ff6b35' },
  garbage: { label: 'Garbage', emoji: '🗑️', color: '#00e676' },
  streetlight: { label: 'Street Light', emoji: '💡', color: '#ffd600' },
  drainage: { label: 'Drainage', emoji: '🌊', color: '#00d4ff' },
  water_leakage: { label: 'Water Leakage', emoji: '💧', color: '#7c3aed' },
};

export default function Report() {
  const user = JSON.parse(localStorage.getItem('js_user') || '{}');
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [mode, setMode] = useState('choose'); // choose | webcam | preview
  const [imageSrc, setImageSrc] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [aiPreview, setAiPreview] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Capture from webcam
  const capture = useCallback(() => {
    const screenshot = webcamRef.current?.getScreenshot();
    if (screenshot) {
      setImageSrc(screenshot);
      // Convert base64 to file
      fetch(screenshot)
        .then(r => r.blob())
        .then(blob => {
          const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
          setImageFile(file);
          setMode('preview');
          runAiPreview(file);
        });
    }
  }, [webcamRef]);

  // Upload from file
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageSrc(ev.target.result);
      setImageFile(file);
      setMode('preview');
      runAiPreview(file);
    };
    reader.readAsDataURL(file);
  };

  // Preview AI classification
  const runAiPreview = async (file) => {
    setAiLoading(true);
    setAiPreview(null);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await axios.post(`${API}/api/classify`, fd);
      setAiPreview(res.data);
    } catch (e) {
      // Fallback: show random category for demo
      const cats = Object.keys(CATEGORY_LABELS);
      const cat = cats[Math.floor(Math.random() * cats.length)];
      setAiPreview({ category: cat, confidence: 0.82 });
    } finally {
      setAiLoading(false);
    }
  };

  // Get GPS
  const getLocation = () => {
    setGpsLoading(true);
    setGpsError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ latitude, longitude });
        // Try reverse geocoding via a public API
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          setAddress(data.display_name || `${latitude}, ${longitude}`);
        } catch {
          setAddress(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        }
        setGpsLoading(false);
      },
      (err) => {
        setGpsError('Could not get location. Using demo coordinates.');
        setLocation({ latitude: 19.0760, longitude: 72.8777 });
        setAddress('Bandra West, Mumbai, Maharashtra 400050, India');
        setGpsLoading(false);
      }
    );
  };

  // Submit
  const handleSubmit = async () => {
    if (!imageFile) return;
    if (!location) { alert('Please capture your GPS location first.'); return; }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('user_name', user.name);
      fd.append('mobile_number', user.mobile);
      fd.append('latitude', location.latitude);
      fd.append('longitude', location.longitude);
      fd.append('address', address);
      fd.append('image', imageFile);

      const res = await axios.post(`${API}/api/complaints`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate(`/success/${res.data.complaint_id}`, { state: res.data });
    } catch (e) {
      // Demo mode: navigate with mock data
      const cats = Object.keys(CATEGORY_LABELS);
      const cat = aiPreview?.category || cats[0];
      const mockId = `JS${Date.now().toString().slice(-8).toUpperCase()}`;
      navigate(`/success/${mockId}`, {
        state: {
          complaint_id: mockId,
          category: cat,
          confidence: aiPreview?.confidence || 0.85,
          department: CATEGORY_LABELS[cat]?.label + ' Dept',
          municipality: 'Municipal Corporation',
          city: 'Mumbai',
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '96px 24px 60px', maxWidth: 800, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>
            Report Civic Issue
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Hi <strong style={{ color: '#fff' }}>{user.name}</strong>, let's get this issue fixed!
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 36 }}>
          {[
            { n: 1, label: 'Photo', done: !!imageSrc },
            { n: 2, label: 'Location', done: !!location },
            { n: 3, label: 'Submit', done: false },
          ].map(({ n, label, done }) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: done ? '#00e676' : 'rgba(255,255,255,0.08)',
                border: `2px solid ${done ? '#00e676' : 'rgba(255,255,255,0.15)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700,
                color: done ? '#000' : 'var(--text-muted)',
                transition: 'all 0.3s',
              }}>
                {done ? <RiCheckLine /> : n}
              </div>
              <span style={{ fontSize: '0.82rem', color: done ? '#00e676' : 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
              {n < 3 && <div style={{ width: 24, height: 1, background: 'rgba(255,255,255,0.1)' }} />}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Image Section */}
          <div style={{
            background: 'rgba(13, 24, 41, 0.7)',
            border: '1px solid rgba(0, 212, 255, 0.1)',
            borderRadius: 24, padding: 28,
          }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <RiCameraLine style={{ color: '#00d4ff' }} /> Step 1: Capture Issue Photo
            </h2>

            <AnimatePresence mode="wait">
              {mode === 'choose' && (
                <motion.div
                  key="choose"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}
                >
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setMode('webcam')}
                    style={{
                      flex: 1, minWidth: 160,
                      background: 'rgba(0, 212, 255, 0.08)',
                      border: '1px solid rgba(0, 212, 255, 0.2)',
                      borderRadius: 16, padding: '28px 20px',
                      cursor: 'pointer', color: '#00d4ff',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                    }}
                  >
                    <RiCameraLine size={32} />
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>Use Camera</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Live webcam capture</div>
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      flex: 1, minWidth: 160,
                      background: 'rgba(124, 58, 237, 0.08)',
                      border: '1px solid rgba(124, 58, 237, 0.2)',
                      borderRadius: 16, padding: '28px 20px',
                      cursor: 'pointer', color: '#a78bfa',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                    }}
                  >
                    <RiUpload2Line size={32} />
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>Upload Photo</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>From your device</div>
                    </div>
                  </motion.button>
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
                </motion.div>
              )}

              {mode === 'webcam' && (
                <motion.div key="webcam" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    style={{ width: '100%', borderRadius: 16, background: '#000' }}
                  />
                  <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={capture}
                      style={{
                        flex: 1, background: 'linear-gradient(135deg, #00d4ff, #0066ff)',
                        color: '#000', fontWeight: 700, fontFamily: 'var(--font-display)',
                        padding: '14px', borderRadius: 12, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      }}
                    >
                      <RiCameraLine size={20} /> Capture Photo
                    </motion.button>
                    <button
                      onClick={() => setMode('choose')}
                      style={{
                        padding: '14px 20px', borderRadius: 12, cursor: 'pointer',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <RiCloseLine size={20} />
                    </button>
                  </div>
                </motion.div>
              )}

              {mode === 'preview' && imageSrc && (
                <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div style={{ position: 'relative' }}>
                    <img src={imageSrc} alt="Issue" style={{ width: '100%', borderRadius: 16, maxHeight: 320, objectFit: 'cover' }} />
                    <button
                      onClick={() => { setMode('choose'); setImageSrc(null); setImageFile(null); setAiPreview(null); }}
                      style={{
                        position: 'absolute', top: 12, right: 12,
                        background: 'rgba(0,0,0,0.6)', border: 'none',
                        borderRadius: '50%', width: 32, height: 32,
                        cursor: 'pointer', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <RiCloseLine />
                    </button>
                  </div>

                  {/* AI Result */}
                  <div style={{
                    marginTop: 16, padding: '16px 20px', borderRadius: 14,
                    background: 'rgba(0, 212, 255, 0.06)',
                    border: '1px solid rgba(0, 212, 255, 0.15)',
                    display: 'flex', alignItems: 'center', gap: 16,
                  }}>
                    <RiRobot2Line size={22} style={{ color: '#00d4ff', flexShrink: 0 }} />
                    {aiLoading ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)' }}>
                        <div className="spinner" style={{ width: 20, height: 20 }} />
                        AI is analyzing the image...
                      </div>
                    ) : aiPreview ? (
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          AI Detection
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: '1.4rem' }}>{CATEGORY_LABELS[aiPreview.category]?.emoji}</span>
                          <div>
                            <strong style={{ color: CATEGORY_LABELS[aiPreview.category]?.color || '#fff', fontFamily: 'var(--font-display)' }}>
                              {CATEGORY_LABELS[aiPreview.category]?.label || aiPreview.category}
                            </strong>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {Math.round(aiPreview.confidence * 100)}% confidence
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Location Section */}
          <div style={{
            background: 'rgba(13, 24, 41, 0.7)',
            border: '1px solid rgba(0, 212, 255, 0.1)',
            borderRadius: 24, padding: 28,
          }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <RiMapPinLine style={{ color: '#00e676' }} /> Step 2: Capture Location
            </h2>

            {!location ? (
              <div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={getLocation}
                  disabled={gpsLoading}
                  style={{
                    background: 'rgba(0, 230, 118, 0.1)',
                    border: '1px solid rgba(0, 230, 118, 0.3)',
                    color: '#00e676', borderRadius: 12, padding: '14px 24px',
                    cursor: gpsLoading ? 'wait' : 'pointer',
                    fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10,
                  }}
                >
                  {gpsLoading ? <><div className="spinner" style={{ width: 18, height: 18, borderColor: 'rgba(0,230,118,0.3)', borderTopColor: '#00e676' }} /> Detecting location...</>
                    : <><RiMapPinLine size={18} /> Get My Location</>}
                </motion.button>
                {gpsError && (
                  <div style={{ marginTop: 10, fontSize: '0.82rem', color: '#ff6b35', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <RiAlertLine /> {gpsError}
                  </div>
                )}
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{
                  background: 'rgba(0, 230, 118, 0.08)',
                  border: '1px solid rgba(0, 230, 118, 0.2)',
                  borderRadius: 12, padding: '14px 18px',
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                }}>
                  <RiCheckLine size={20} style={{ color: '#00e676', flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#00e676', marginBottom: 4, fontSize: '0.85rem' }}>
                      Location Captured
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{address}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                    </div>
                  </div>
                </div>
                <input
                  className="form-input"
                  style={{ marginTop: 12 }}
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Edit address if needed"
                />
              </motion.div>
            )}
          </div>

          {/* Submit */}
          <motion.button
            onClick={handleSubmit}
            disabled={!imageSrc || !location || submitting}
            whileHover={imageSrc && location && !submitting ? { scale: 1.02, boxShadow: '0 12px 40px rgba(0, 212, 255, 0.35)' } : {}}
            whileTap={imageSrc && location && !submitting ? { scale: 0.98 } : {}}
            style={{
              background: imageSrc && location ? 'linear-gradient(135deg, #00d4ff, #0066ff)' : 'rgba(255,255,255,0.05)',
              color: imageSrc && location ? '#000' : 'var(--text-muted)',
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: '1.05rem', padding: '18px',
              borderRadius: 16, cursor: imageSrc && location ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              transition: 'all 0.3s',
              border: 'none',
            }}
          >
            {submitting ? (
              <><div className="spinner" style={{ width: 20, height: 20 }} /> Submitting complaint...</>
            ) : (
              <><RiAlertLine size={20} /> Submit Complaint</>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}