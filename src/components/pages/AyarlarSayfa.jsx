import { useState } from 'react';

const EMOJILER = ['📌', '🔍', '⚙️', '🛒', '📋', '🌐', '🏭', '💼', '🔧', '📊', '🎯', '📦'];
const RENKLER = ['#FF6B35', '#ef4444', '#4ECDC4', '#96CEB4', '#9B59B6', '#45B7D1', '#F7DC6F', '#2ecc71', '#3498db'];

export function AyarlarSayfa({
  kullanicilar,
  setKullanicilar,
  bolumler,
  setBolumler
}) {
  const [sekme, setSekme] = useState('bolumler');

  const [bolumForm, setBolumForm] = useState({
    ad: '',
    emoji: '📌',
    renk: '#FF6B35'
  });

  const [kullaniciForm, setKullaniciForm] = useState({
    adSoyad: '',
    kullaniciAdi: '',
    sifre: '',
    rol: 'Çalışan',
    unvan: '',
    bolumId: '',
    ustKisiId: '',
    ayarYetkisi: false
  });

  function kisiAdi(k) {
    return k?.adSoyad || k?.ad || 'İsimsiz';
  }

  function basHarf(ad) {
    return String(ad || '')
      .split(' ')
      .filter(Boolean)
      .map(x => x[0])
      .join('')
      .toUpperCase();
  }

  function bolumAdi(id) {
    const b = bolumler.find(x => Number(x.id) === Number(id));
    return b ? `${b.emoji} ${b.ad}` : '';
  }

  function bolumEkle() {
    if (!bolumForm.ad.trim()) {
      alert('Bölüm adı gir.');
      return;
    }

    const yeniBolum = {
      id: Date.now(),
      ad: bolumForm.ad,
      emoji: bolumForm.emoji,
      renk: bolumForm.renk
    };

    setBolumler([...bolumler, yeniBolum]);

    setBolumForm({
      ad: '',
      emoji: '📌',
      renk: '#FF6B35'
    });
  }

  function bolumSil(id) {
    const kullananVar = kullanicilar.some(k => Number(k.bolumId) === Number(id));

    if (kullananVar) {
      alert('Bu bölüme bağlı çalışan var. Önce çalışanların bölümünü değiştir.');
      return;
    }

    setBolumler(bolumler.filter(b => b.id !== id));
  }

  function kullaniciEkle() {
    if (!kullaniciForm.adSoyad.trim()) {
      alert('Ad soyad gir.');
      return;
    }

    if (!kullaniciForm.kullaniciAdi.trim()) {
      alert('Kullanıcı adı gir.');
      return;
    }

    if (!kullaniciForm.sifre.trim()) {
      alert('Şifre gir.');
      return;
    }

    const ayniVar = kullanicilar.some(
      k => k.kullaniciAdi === kullaniciForm.kullaniciAdi
    );

    if (ayniVar) {
      alert('Bu kullanıcı adı zaten var.');
      return;
    }

    const yeniKullanici = {
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

    setKullanicilar([...kullanicilar, yeniKullanici]);

    setKullaniciForm({
      adSoyad: '',
      kullaniciAdi: '',
      sifre: '',
      rol: 'Çalışan',
      unvan: '',
      bolumId: '',
      ustKisiId: '',
      ayarYetkisi: false
    });
  }

  function kullaniciSil(id) {
    setKullanicilar(kullanicilar.filter(k => k.id !== id));
  }

  function ayarYetkisiDegistir(id) {
    setKullanicilar(
      kullanicilar.map(k =>
        Number(k.id) === Number(id)
          ? { ...k, ayarYetkisi: !k.ayarYetkisi }
          : k
      )
    );
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>⚙️ Ayarlar</h1>

      <div style={styles.tabs}>
        <button
          onClick={() => setSekme('bolumler')}
          style={{
            ...styles.tab,
            background: sekme === 'bolumler' ? '#FF6B35' : '#1C1F2E',
            color: sekme === 'bolumler' ? 'white' : '#64748b'
          }}
        >
          Bölümler
        </button>

        <button
          onClick={() => setSekme('calisanlar')}
          style={{
            ...styles.tab,
            background: sekme === 'calisanlar' ? '#FF6B35' : '#1C1F2E',
            color: sekme === 'calisanlar' ? 'white' : '#64748b'
          }}
        >
          Çalışanlar
        </button>
      </div>

      {sekme === 'bolumler' && (
        <>
          <div style={styles.panel}>
            <h2 style={styles.panelTitle}>+ Yeni Bölüm</h2>

            <label style={styles.label}>AD</label>
            <input
              style={styles.input}
              placeholder="Bölüm adı..."
              value={bolumForm.ad}
              onChange={e => setBolumForm({ ...bolumForm, ad: e.target.value })}
            />

            <label style={styles.label}>EMOJI</label>
            <div style={styles.iconGrid}>
              {EMOJILER.map(e => (
                <button
                  key={e}
                  onClick={() => setBolumForm({ ...bolumForm, emoji: e })}
                  style={{
                    ...styles.iconBtn,
                    border:
                      bolumForm.emoji === e
                        ? '2px solid #FF6B35'
                        : '2px solid transparent'
                  }}
                >
                  {e}
                </button>
              ))}
            </div>

            <label style={styles.label}>RENK</label>
            <div style={styles.renkSatir}>
              {RENKLER.map(r => (
                <button
                  key={r}
                  onClick={() => setBolumForm({ ...bolumForm, renk: r })}
                  style={{
                    ...styles.renkBtn,
                    background: r,
                    outline: bolumForm.renk === r ? '4px solid white' : 'none'
                  }}
                />
              ))}
            </div>

            <button onClick={bolumEkle} style={styles.ekleBtn}>
              Ekle
            </button>
          </div>

          {bolumler.map(b => (
            <div
              key={b.id}
              style={{
                ...styles.listCard,
                borderLeft: `5px solid ${b.renk}`
              }}
            >
              <div style={styles.bolumSol}>
                <div style={styles.bigEmoji}>{b.emoji}</div>

                <div>
                  <div style={{ ...styles.cardName, color: b.renk }}>
                    {b.ad}
                  </div>

                  <div style={styles.muted}>
                    {
                      kullanicilar.filter(
                        k => Number(k.bolumId) === Number(b.id)
                      ).length
                    } çalışan
                  </div>
                </div>
              </div>

              <button style={styles.deleteBtn} onClick={() => bolumSil(b.id)}>
                ×
              </button>
            </div>
          ))}
        </>
      )}

      {sekme === 'calisanlar' && (
        <>
          <div style={styles.panel}>
            <h2 style={styles.panelTitle}>+ Yeni Çalışan</h2>

            <label style={styles.label}>AD SOYAD</label>
            <input
              style={styles.input}
              placeholder="Ad Soyad..."
              value={kullaniciForm.adSoyad}
              onChange={e =>
                setKullaniciForm({
                  ...kullaniciForm,
                  adSoyad: e.target.value
                })
              }
            />

            <label style={styles.label}>KULLANICI ADI</label>
            <input
              style={styles.input}
              placeholder="kullaniciadi"
              value={kullaniciForm.kullaniciAdi}
              onChange={e =>
                setKullaniciForm({
                  ...kullaniciForm,
                  kullaniciAdi: e.target.value
                })
              }
            />

            <label style={styles.label}>ŞİFRE</label>
            <input
              style={styles.input}
              placeholder="Şifre"
              type="password"
              value={kullaniciForm.sifre}
              onChange={e =>
                setKullaniciForm({
                  ...kullaniciForm,
                  sifre: e.target.value
                })
              }
            />

            <div style={styles.grid2}>
              <div>
                <label style={styles.label}>ROL</label>
                <select
                  style={styles.input}
                  value={kullaniciForm.rol}
                  onChange={e =>
                    setKullaniciForm({
                      ...kullaniciForm,
                      rol: e.target.value
                    })
                  }
                >
                  <option>Yönetici</option>
                  <option>Genel Müdür</option>
                  <option>Müdür</option>
                  <option>Sorumlu</option>
                  <option>Çalışan</option>
                </select>
              </div>

              <div>
                <label style={styles.label}>BÖLÜM</label>
                <select
                  style={styles.input}
                  value={kullaniciForm.bolumId}
                  onChange={e =>
                    setKullaniciForm({
                      ...kullaniciForm,
                      bolumId: e.target.value
                    })
                  }
                >
                  <option value="">— Seç —</option>
                  {bolumler.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.ad}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label style={styles.label}>ÜNVAN</label>
            <input
              style={styles.input}
              placeholder="Uzman, Müdür..."
              value={kullaniciForm.unvan}
              onChange={e =>
                setKullaniciForm({
                  ...kullaniciForm,
                  unvan: e.target.value
                })
              }
            />

            <label style={styles.label}>ÜST KİŞİ</label>
            <select
              style={styles.input}
              value={kullaniciForm.ustKisiId}
              onChange={e =>
                setKullaniciForm({
                  ...kullaniciForm,
                  ustKisiId: e.target.value
                })
              }
            >
              <option value="">— Seç —</option>
              {kullanicilar.map(k => (
                <option key={k.id} value={k.id}>
                  {kisiAdi(k)}
                </option>
              ))}
            </select>

            <label style={styles.checkLabel}>
              <input
                type="checkbox"
                checked={kullaniciForm.ayarYetkisi}
                onChange={e =>
                  setKullaniciForm({
                    ...kullaniciForm,
                    ayarYetkisi: e.target.checked
                  })
                }
              />
              Ayarlar sayfasına erişebilsin
            </label>

            <button onClick={kullaniciEkle} style={styles.ekleBtn}>
              Ekle
            </button>
          </div>

          {kullanicilar.map(k => {
            const ust = kullanicilar.find(
              u => Number(u.id) === Number(k.ustKisiId)
            );

            return (
              <div key={k.id} style={styles.listCard}>
                <div style={styles.avatar}>
                  {k.avatar || basHarf(kisiAdi(k))}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={styles.cardName}>{kisiAdi(k)}</div>

                  <div style={styles.muted}>
                    {k.rol}
                    {k.bolumId ? ` · ${bolumAdi(k.bolumId)}` : ''}
                    {k.unvan ? ` · ${k.unvan}` : ''}
                  </div>

                  {ust && (
                    <div style={styles.muted}>
                      Üst kişi: {kisiAdi(ust)}
                    </div>
                  )}

                  {k.ayarYetkisi && (
                    <div style={styles.yetkiBadge}>
                      Ayarlar yetkisi var
                    </div>
                  )}
                </div>

                <button
                  style={{
                    ...styles.yetkiBtn,
                    background: k.ayarYetkisi ? '#4ECDC422' : '#252836',
                    color: k.ayarYetkisi ? '#4ECDC4' : '#94a3b8'
                  }}
                  onClick={() => ayarYetkisiDegistir(k.id)}
                >
                  Yetki
                </button>

                <button
                  style={styles.deleteBtn}
                  onClick={() => kullaniciSil(k.id)}
                >
                  ×
                </button>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

const styles = {
  page: {
    padding: 20,
    color: 'white'
  },
  title: {
    fontSize: 38,
    fontWeight: 900,
    marginBottom: 24
  },
  tabs: {
    display: 'flex',
    gap: 14,
    marginBottom: 28
  },
  tab: {
    border: 'none',
    borderRadius: 16,
    padding: '16px 28px',
    fontSize: 20,
    fontWeight: 900,
    cursor: 'pointer'
  },
  panel: {
    background: '#1C1F2E',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24
  },
  panelTitle: {
    color: '#FF6B35',
    marginTop: 0
  },
  label: {
    display: 'block',
    color: '#64748b',
    fontWeight: 900,
    marginTop: 18,
    marginBottom: 8,
    letterSpacing: 2
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: 18,
    borderRadius: 16,
    border: '1px solid #303653',
    background: '#252836',
    color: 'white',
    fontSize: 18
  },
  iconGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10
  },
  iconBtn: {
    width: 58,
    height: 58,
    borderRadius: 14,
    background: '#252836',
    color: 'white',
    fontSize: 28,
    cursor: 'pointer'
  },
  renkSatir: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 10
  },
  renkBtn: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer'
  },
  ekleBtn: {
    width: '100%',
    marginTop: 28,
    padding: 20,
    borderRadius: 20,
    border: 'none',
    background: '#FF6B35',
    color: 'white',
    fontSize: 24,
    fontWeight: 900,
    cursor: 'pointer'
  },
  listCard: {
    background: '#1C1F2E',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 16
  },
  bolumSol: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    flex: 1
  },
  bigEmoji: {
    fontSize: 34
  },
  cardName: {
    fontSize: 24,
    fontWeight: 900
  },
  muted: {
    color: '#64748b',
    marginTop: 4
  },
  deleteBtn: {
    width: 54,
    height: 54,
    borderRadius: 14,
    border: 'none',
    background: '#3a2228',
    color: '#FF6B35',
    fontSize: 32,
    cursor: 'pointer'
  },
  yetkiBtn: {
    padding: '14px 18px',
    borderRadius: 14,
    border: 'none',
    fontWeight: 900,
    cursor: 'pointer'
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 14
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    border: '3px solid #4ECDC4',
    color: '#4ECDC4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900,
    fontSize: 20
  },
  checkLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    color: '#cbd5e1',
    fontWeight: 800,
    marginTop: 22,
    fontSize: 17
  },
  yetkiBadge: {
    display: 'inline-block',
    marginTop: 8,
    background: '#4ECDC422',
    color: '#4ECDC4',
    padding: '6px 10px',
    borderRadius: 10,
    fontWeight: 800,
    fontSize: 13
  }
};