import { useState, useEffect } from 'react';

const EMOJILER = ['📌', '🔍', '⚙️', '🛒', '📋', '🌐', '🏭', '💼', '🔧', '📊', '🎯', '📦'];
const RENKLER = ['#FF6B35', '#ef4444', '#4ECDC4', '#96CEB4', '#9B59B6', '#45B7D1', '#F7DC6F', '#2ecc71', '#3498db'];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

export function AyarlarSayfa({ kullanicilar, setKullanicilar, bolumler, setBolumler }) {
  const isMobile = useIsMobile();
  const [sekme, setSekme] = useState('bolumler');

  const [bolumForm, setBolumForm] = useState({ ad: '', emoji: '📌', renk: '#FF6B35' });
  const [kullaniciForm, setKullaniciForm] = useState({
    adSoyad: '', kullaniciAdi: '', sifre: '',
    rol: 'Çalışan', unvan: '', bolumId: '', ustKisiId: '', ayarYetkisi: false
  });

  function kisiAdi(k) { return k?.adSoyad || k?.ad || 'İsimsiz'; }

  function basHarf(ad) {
    return String(ad || '').split(' ').filter(Boolean).map(x => x[0]).join('').toUpperCase();
  }

  function bolumAdi(id) {
    const b = bolumler.find(x => Number(x.id) === Number(id));
    return b ? `${b.emoji} ${b.ad}` : '';
  }

  function bolumEkle() {
    if (!bolumForm.ad.trim()) { alert('Bölüm adı gir.'); return; }
    setBolumler([...bolumler, { id: Date.now(), ...bolumForm }]);
    setBolumForm({ ad: '', emoji: '📌', renk: '#FF6B35' });
  }

  function bolumSil(id) {
    if (kullanicilar.some(k => Number(k.bolumId) === Number(id))) {
      alert('Bu bölüme bağlı çalışan var. Önce çalışanların bölümünü değiştir.');
      return;
    }
    setBolumler(bolumler.filter(b => b.id !== id));
  }

  function kullaniciEkle() {
    if (!kullaniciForm.adSoyad.trim()) { alert('Ad soyad gir.'); return; }
    if (!kullaniciForm.kullaniciAdi.trim()) { alert('Kullanıcı adı gir.'); return; }
    if (!kullaniciForm.sifre.trim()) { alert('Şifre gir.'); return; }
    if (kullanicilar.some(k => k.kullaniciAdi === kullaniciForm.kullaniciAdi)) {
      alert('Bu kullanıcı adı zaten var.'); return;
    }
    const yeni = {
      id: Date.now(),
      ad: kullaniciForm.adSoyad,
      adSoyad: kullaniciForm.adSoyad,
      kullaniciAdi: kullaniciForm.kullaniciAdi,
      sifre: kullaniciForm.sifre,
      rol: kullaniciForm.rol,
      unvan: kullaniciForm.unvan,
      bolumId: kullaniciForm.bolumId ? Number(kullaniciForm.bolumId) : '',
      ustKisiId: kullaniciForm.ustKisiId ? Number(kullaniciForm.ustKisiId) : '',
      ayarYetkisi: kullaniciForm.ayarYetkisi,
      avatar: basHarf(kullaniciForm.adSoyad),
      renk: '#4ECDC4'
    };
    setKullanicilar([...kullanicilar, yeni]);
    setKullaniciForm({
      adSoyad: '', kullaniciAdi: '', sifre: '',
      rol: 'Çalışan', unvan: '', bolumId: '', ustKisiId: '', ayarYetkisi: false
    });
  }

  function kullaniciSil(id) { setKullanicilar(kullanicilar.filter(k => k.id !== id)); }

  function ayarYetkisiDegistir(id) {
    setKullanicilar(kullanicilar.map(k =>
      Number(k.id) === Number(id) ? { ...k, ayarYetkisi: !k.ayarYetkisi } : k
    ));
  }

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: isMobile ? 13 : 16,
    borderRadius: 14, border: '1px solid #303653',
    background: '#252836', color: 'white',
    fontSize: isMobile ? 15 : 16
  };

  const labelStyle = {
    display: 'block', color: '#64748b', fontWeight: 900,
    marginTop: 16, marginBottom: 6,
    letterSpacing: 1.5, fontSize: isMobile ? 11 : 12
  };

  return (
    <div style={{ padding: isMobile ? '0 2px' : 4, color: 'white' }}>
      <h1 style={{ fontSize: isMobile ? 26 : 38, fontWeight: 900, marginBottom: 20 }}>⚙️ Ayarlar</h1>

      {/* Sekmeler */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        {['bolumler', 'calisanlar'].map(id => (
          <button
            key={id}
            onClick={() => setSekme(id)}
            style={{
              border: 'none', borderRadius: 14,
              padding: isMobile ? '12px 20px' : '14px 26px',
              fontSize: isMobile ? 15 : 18, fontWeight: 900, cursor: 'pointer',
              background: sekme === id ? '#FF6B35' : '#1C1F2E',
              color: sekme === id ? 'white' : '#64748b',
              flex: isMobile ? 1 : 'none'
            }}
          >
            {id === 'bolumler' ? 'Bölümler' : 'Çalışanlar'}
          </button>
        ))}
      </div>

      {/* ── BÖLÜMLER ── */}
      {sekme === 'bolumler' && (
        <>
          <div style={{ background: '#1C1F2E', borderRadius: 20, padding: isMobile ? 18 : 24, marginBottom: 20 }}>
            <h2 style={{ color: '#FF6B35', marginTop: 0, fontSize: isMobile ? 16 : 20 }}>+ Yeni Bölüm</h2>

            <label style={labelStyle}>AD</label>
            <input style={inputStyle} placeholder="Bölüm adı..."
              value={bolumForm.ad}
              onChange={e => setBolumForm({ ...bolumForm, ad: e.target.value })} />

            <label style={labelStyle}>EMOJİ</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {EMOJILER.map(e => (
                <button key={e} onClick={() => setBolumForm({ ...bolumForm, emoji: e })}
                  style={{
                    width: isMobile ? 48 : 54, height: isMobile ? 48 : 54,
                    borderRadius: 12, background: '#252836', color: 'white',
                    fontSize: isMobile ? 22 : 26, cursor: 'pointer',
                    border: bolumForm.emoji === e ? '2px solid #FF6B35' : '2px solid transparent'
                  }}>
                  {e}
                </button>
              ))}
            </div>

            <label style={labelStyle}>RENK</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
              {RENKLER.map(r => (
                <button key={r} onClick={() => setBolumForm({ ...bolumForm, renk: r })}
                  style={{
                    width: isMobile ? 38 : 44, height: isMobile ? 38 : 44,
                    borderRadius: '50%', border: 'none', cursor: 'pointer', background: r,
                    outline: bolumForm.renk === r ? '3px solid white' : 'none',
                    outlineOffset: 2
                  }} />
              ))}
            </div>

            <button onClick={bolumEkle} style={{
              width: '100%', marginTop: 22, padding: isMobile ? 16 : 18,
              borderRadius: 16, border: 'none', background: '#FF6B35',
              color: 'white', fontSize: isMobile ? 16 : 20, fontWeight: 900, cursor: 'pointer'
            }}>
              Ekle
            </button>
          </div>

          {bolumler.map(b => (
            <div key={b.id} style={{
              background: '#1C1F2E', borderRadius: 18, padding: isMobile ? 14 : 18,
              marginBottom: 12, display: 'flex', alignItems: 'center', gap: 14,
              borderLeft: `5px solid ${b.renk}`
            }}>
              <div style={{ fontSize: isMobile ? 28 : 34 }}>{b.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 900, color: b.renk }}>{b.ad}</div>
                <div style={{ color: '#64748b', marginTop: 2, fontSize: 13 }}>
                  {kullanicilar.filter(k => Number(k.bolumId) === Number(b.id)).length} çalışan
                </div>
              </div>
              <button onClick={() => bolumSil(b.id)} style={{
                width: isMobile ? 44 : 50, height: isMobile ? 44 : 50,
                borderRadius: 12, border: 'none', background: '#3a2228',
                color: '#FF6B35', fontSize: 26, cursor: 'pointer'
              }}>×</button>
            </div>
          ))}
        </>
      )}

      {/* ── ÇALIŞANLAR ── */}
      {sekme === 'calisanlar' && (
        <>
          <div style={{ background: '#1C1F2E', borderRadius: 20, padding: isMobile ? 18 : 24, marginBottom: 20 }}>
            <h2 style={{ color: '#FF6B35', marginTop: 0, fontSize: isMobile ? 16 : 20 }}>+ Yeni Çalışan</h2>

            <label style={labelStyle}>AD SOYAD</label>
            <input style={inputStyle} placeholder="Ad Soyad..."
              value={kullaniciForm.adSoyad}
              onChange={e => setKullaniciForm({ ...kullaniciForm, adSoyad: e.target.value })} />

            <label style={labelStyle}>KULLANICI ADI</label>
            <input style={inputStyle} placeholder="kullaniciadi"
              value={kullaniciForm.kullaniciAdi}
              onChange={e => setKullaniciForm({ ...kullaniciForm, kullaniciAdi: e.target.value })} />

            <label style={labelStyle}>ŞİFRE</label>
            <input style={inputStyle} type="password" placeholder="Şifre"
              value={kullaniciForm.sifre}
              onChange={e => setKullaniciForm({ ...kullaniciForm, sifre: e.target.value })} />

            {/* Mobilde tek kolon */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>ROL</label>
                <select style={inputStyle} value={kullaniciForm.rol}
                  onChange={e => setKullaniciForm({ ...kullaniciForm, rol: e.target.value })}>
                  <option>Yönetici</option>
                  <option>Genel Müdür</option>
                  <option>Müdür</option>
                  <option>Sorumlu</option>
                  <option>Çalışan</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>BÖLÜM</label>
                <select style={inputStyle} value={kullaniciForm.bolumId}
                  onChange={e => setKullaniciForm({ ...kullaniciForm, bolumId: e.target.value })}>
                  <option value="">— Seç —</option>
                  {bolumler.map(b => <option key={b.id} value={b.id}>{b.ad}</option>)}
                </select>
              </div>
            </div>

            <label style={labelStyle}>ÜNVAN</label>
            <input style={inputStyle} placeholder="Uzman, Müdür..."
              value={kullaniciForm.unvan}
              onChange={e => setKullaniciForm({ ...kullaniciForm, unvan: e.target.value })} />

            <label style={labelStyle}>ÜST KİŞİ</label>
            <select style={inputStyle} value={kullaniciForm.ustKisiId}
              onChange={e => setKullaniciForm({ ...kullaniciForm, ustKisiId: e.target.value })}>
              <option value="">— Seç —</option>
              {kullanicilar.map(k => <option key={k.id} value={k.id}>{kisiAdi(k)}</option>)}
            </select>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#cbd5e1', fontWeight: 800, marginTop: 18, fontSize: isMobile ? 14 : 16, cursor: 'pointer' }}>
              <input type="checkbox" checked={kullaniciForm.ayarYetkisi}
                onChange={e => setKullaniciForm({ ...kullaniciForm, ayarYetkisi: e.target.checked })}
                style={{ width: 18, height: 18 }} />
              Ayarlar sayfasına erişebilsin
            </label>

            <button onClick={kullaniciEkle} style={{
              width: '100%', marginTop: 20, padding: isMobile ? 16 : 18,
              borderRadius: 16, border: 'none', background: '#FF6B35',
              color: 'white', fontSize: isMobile ? 16 : 20, fontWeight: 900, cursor: 'pointer'
            }}>
              Ekle
            </button>
          </div>

          {kullanicilar.map(k => {
            const ust = kullanicilar.find(u => Number(u.id) === Number(k.ustKisiId));
            return (
              <div key={k.id} style={{
                background: '#1C1F2E', borderRadius: 18, padding: isMobile ? 14 : 18,
                marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12
              }}>
                <div style={{
                  width: isMobile ? 48 : 60, height: isMobile ? 48 : 60,
                  flexShrink: 0, borderRadius: '50%', border: '3px solid #4ECDC4',
                  color: '#4ECDC4', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: isMobile ? 16 : 20
                }}>
                  {k.avatar || basHarf(kisiAdi(k))}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: isMobile ? 16 : 20, fontWeight: 900 }}>{kisiAdi(k)}</div>
                  <div style={{ color: '#64748b', marginTop: 2, fontSize: 12 }}>
                    {k.rol}{k.bolumId ? ` · ${bolumAdi(k.bolumId)}` : ''}{k.unvan ? ` · ${k.unvan}` : ''}
                  </div>
                  {ust && <div style={{ color: '#64748b', fontSize: 12 }}>Üst: {kisiAdi(ust)}</div>}
                  {k.ayarYetkisi && (
                    <span style={{
                      display: 'inline-block', marginTop: 4,
                      background: '#4ECDC422', color: '#4ECDC4',
                      padding: '3px 8px', borderRadius: 8, fontWeight: 800, fontSize: 11
                    }}>
                      Ayarlar yetkisi
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => ayarYetkisiDegistir(k.id)}
                    style={{
                      padding: isMobile ? '8px 10px' : '10px 14px', borderRadius: 12, border: 'none',
                      fontWeight: 900, cursor: 'pointer', fontSize: isMobile ? 11 : 13,
                      background: k.ayarYetkisi ? '#4ECDC422' : '#252836',
                      color: k.ayarYetkisi ? '#4ECDC4' : '#94a3b8'
                    }}
                  >
                    Yetki
                  </button>
                  <button
                    onClick={() => kullaniciSil(k.id)}
                    style={{
                      width: isMobile ? 36 : 44, height: isMobile ? 36 : 44,
                      borderRadius: 10, border: 'none', background: '#3a2228',
                      color: '#FF6B35', fontSize: 22, cursor: 'pointer'
                    }}
                  >×</button>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
