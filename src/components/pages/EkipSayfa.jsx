import React, { useState, useEffect } from 'react';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

export function EkipSayfa({ aktifKullanici, kullanicilar, setKullanicilar, gorevler = [] }) {
  const isMobile = useIsMobile();
  const [seciliKisi, setSeciliKisi] = useState(null);
  const [modalAcik, setModalAcik] = useState(false);

  const [form, setForm] = useState({
    adSoyad: '', kullaniciAdi: '', sifre: '',
    rol: 'Çalışan', unvan: '', departman: 'Üretim'
  });

  const kullaniciEkleyebilir =
    aktifKullanici?.rol === 'Yönetici' || aktifKullanici?.rol === 'Genel Müdür';

  function kullaniciEkle() {
    if (!form.adSoyad || !form.kullaniciAdi || !form.sifre || !form.unvan) {
      alert('Lütfen tüm alanları doldur.'); return;
    }
    if (kullanicilar.some(k => k.kullaniciAdi === form.kullaniciAdi)) {
      alert('Bu kullanıcı adı zaten var.'); return;
    }
    setKullanicilar([...kullanicilar, {
      id: Date.now(), adSoyad: form.adSoyad, kullaniciAdi: form.kullaniciAdi,
      sifre: form.sifre, rol: form.rol, unvan: form.unvan, departman: form.departman, gorevler: []
    }]);
    setModalAcik(false);
    setForm({ adSoyad: '', kullaniciAdi: '', sifre: '', rol: 'Çalışan', unvan: '', departman: 'Üretim' });
  }

  function kisiAdi(kisi) { return kisi?.adSoyad || kisi?.ad || 'İsimsiz Kullanıcı'; }

  function basHarfler(kisi) {
    return kisiAdi(kisi).split(' ').filter(Boolean).map(k => k[0]).join('').toUpperCase();
  }

  function kisininGorevleri(kisi) {
    return gorevler.filter(g => Number(g.atanan) === Number(kisi.id));
  }

  function gorevSayisi(kisi) { return kisininGorevleri(kisi).length; }

  function bitenGorevSayisi(kisi) {
    return kisininGorevleri(kisi).filter(g => g.durum === 'Tamamlandı').length;
  }

  function gecikenGorevSayisi(kisi) {
    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0);
    return kisininGorevleri(kisi).filter(g => {
      if (!g.deadline) return false;
      const bitis = new Date(g.deadline);
      bitis.setHours(0, 0, 0, 0);
      return bitis < bugun && g.durum !== 'Tamamlandı';
    }).length;
  }

  const inputStyle = {
    width: '100%', padding: 13, marginBottom: 10,
    borderRadius: 12, border: '1px solid #33384d',
    background: '#11131f', color: '#fff',
    fontSize: isMobile ? 15 : 16, boxSizing: 'border-box'
  };

  // Detay görünümü
  if (seciliKisi) {
    return (
      <div style={{ color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button
            onClick={() => setSeciliKisi(null)}
            style={{
              background: '#1d2030', color: '#a0a7bb', border: 'none',
              borderRadius: 12, padding: '10px 16px', fontSize: 16,
              fontWeight: 700, cursor: 'pointer'
            }}
          >
            ‹ Geri
          </button>
          <h1 style={{ fontSize: isMobile ? 22 : 32, fontWeight: 800, margin: 0 }}>Ekip</h1>
        </div>

        <div style={{ background: '#1d2030', borderRadius: 20, padding: isMobile ? 18 : 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{
              width: isMobile ? 60 : 72, height: isMobile ? 60 : 72,
              borderRadius: '50%', border: '4px solid #4fd1c5',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#4fd1c5', fontSize: isMobile ? 20 : 24,
              fontWeight: 800, background: '#19313a', flexShrink: 0
            }}>
              {basHarfler(seciliKisi)}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: isMobile ? 20 : 26, fontWeight: 800 }}>{kisiAdi(seciliKisi)}</h2>
              <p style={{ margin: '4px 0 0', color: '#8b91a7', fontSize: isMobile ? 14 : 16 }}>{seciliKisi.unvan}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { label: 'Toplam', value: gorevSayisi(seciliKisi), color: 'white' },
              { label: 'Bitti', value: bitenGorevSayisi(seciliKisi), color: '#8fd6b5' },
              { label: 'Geciken', value: gecikenGorevSayisi(seciliKisi), color: '#ff6b35' }
            ].map(s => (
              <div key={s.label} style={{ background: '#282b3a', borderRadius: 14, padding: isMobile ? 14 : 18, textAlign: 'center' }}>
                <strong style={{ fontSize: isMobile ? 24 : 32, display: 'block', color: s.color }}>{s.value}</strong>
                <span style={{ color: '#8b91a7', fontSize: 13 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: isMobile ? 24 : 34, fontWeight: 800, margin: 0 }}>Ekip</h1>
        {kullaniciEkleyebilir && (
          <button
            onClick={() => setModalAcik(true)}
            style={{
              background: '#ff6b35', color: '#fff', border: 'none', borderRadius: 12,
              padding: isMobile ? '10px 14px' : '12px 18px',
              fontWeight: 700, cursor: 'pointer', fontSize: isMobile ? 13 : 15
            }}
          >
            + Kullanıcı Ekle
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {kullanicilar.map(kisi => (
          <div
            key={kisi.id}
            onClick={() => setSeciliKisi(kisi)}
            style={{
              display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 18,
              background: '#1d2030', borderRadius: 20,
              padding: isMobile ? 14 : 20, cursor: 'pointer',
              borderLeft: '5px solid #4fd1c5'
            }}
          >
            <div style={{
              minWidth: isMobile ? 52 : 64, height: isMobile ? 52 : 64,
              borderRadius: '50%', border: '4px solid #4fd1c5',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#4fd1c5', fontSize: isMobile ? 18 : 22,
              fontWeight: 800, background: '#19313a'
            }}>
              {basHarfler(kisi)}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ margin: 0, fontSize: isMobile ? 18 : 22, fontWeight: 800 }}>{kisiAdi(kisi)}</h2>
              <p style={{ margin: '4px 0 0', color: '#8b91a7', fontSize: isMobile ? 13 : 16 }}>
                {kisi.rol}{kisi.unvan ? ` · ${kisi.unvan}` : ''}
              </p>
              {kisi.departman && (
                <span style={{
                  display: 'inline-block', marginTop: 6,
                  background: '#163b45', color: '#4fd1c5',
                  padding: '4px 10px', borderRadius: 8, fontWeight: 700, fontSize: 12
                }}>
                  ⚙️ {kisi.departman}
                </span>
              )}
            </div>

            <div style={{ color: '#a0a7bb', fontWeight: 800, fontSize: isMobile ? 14 : 16, flexShrink: 0 }}>
              {gorevSayisi(kisi)} görev
            </div>
            <div style={{ color: '#6b7280', fontSize: 28, flexShrink: 0 }}>›</div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalAcik && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: isMobile ? 'flex-end' : 'center',
          justifyContent: 'center', zIndex: 999
        }}>
          <div style={{
            width: isMobile ? '100%' : '90%', maxWidth: 420,
            background: '#1d2030',
            borderRadius: isMobile ? '20px 20px 0 0' : 20,
            padding: isMobile ? '20px 18px 36px' : 24,
            maxHeight: isMobile ? '90vh' : 'auto', overflowY: 'auto'
          }}>
            {isMobile && (
              <div style={{ width: 36, height: 4, background: '#2d3250', borderRadius: 4, margin: '0 auto 16px' }} />
            )}
            <h2 style={{ marginTop: 0, fontSize: isMobile ? 18 : 22 }}>Kullanıcı Ekle</h2>

            {[
              { ph: 'Ad Soyad', key: 'adSoyad' },
              { ph: 'Kullanıcı Adı', key: 'kullaniciAdi' },
            ].map(f => (
              <input key={f.key} style={inputStyle} placeholder={f.ph}
                value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
            ))}

            <input style={inputStyle} placeholder="Şifre" type="password"
              value={form.sifre} onChange={e => setForm({ ...form, sifre: e.target.value })} />

            <select style={inputStyle} value={form.rol}
              onChange={e => setForm({ ...form, rol: e.target.value })}>
              <option>Yönetici</option><option>Genel Müdür</option>
              <option>Müdür</option><option>Sorumlu</option><option>Çalışan</option>
            </select>

            <input style={inputStyle} placeholder="Ünvan"
              value={form.unvan} onChange={e => setForm({ ...form, unvan: e.target.value })} />
            <input style={inputStyle} placeholder="Departman"
              value={form.departman} onChange={e => setForm({ ...form, departman: e.target.value })} />

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button onClick={() => setModalAcik(false)} style={{
                background: '#33384d', color: '#fff', border: 'none', borderRadius: 12,
                padding: '12px 18px', cursor: 'pointer', fontWeight: 700
              }}>İptal</button>
              <button onClick={kullaniciEkle} style={{
                background: '#ff6b35', color: '#fff', border: 'none', borderRadius: 12,
                padding: '12px 18px', fontWeight: 700, cursor: 'pointer'
              }}>Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
