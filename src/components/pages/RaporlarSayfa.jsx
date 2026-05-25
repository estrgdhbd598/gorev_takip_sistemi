import { useState, useEffect } from 'react';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

function kGun(tarih) {
  if (!tarih) return null;
  const bugun = new Date();
  const hedef = new Date(tarih);
  bugun.setHours(0, 0, 0, 0);
  hedef.setHours(0, 0, 0, 0);
  return Math.ceil((hedef - bugun) / 86400000);
}

function kisiAdi(k) { return k?.adSoyad || k?.ad || 'İsimsiz'; }
function basHarf(ad) {
  return String(ad || '').split(' ').filter(Boolean).map(x => x[0]).join('').toUpperCase();
}

function PastaChart({ veriler, boyut = 140 }) {
  const toplam = veriler.reduce((s, v) => s + v.deger, 0);
  if (!toplam) return <div style={{ color: '#64748b', padding: 20 }}>Veri yok</div>;

  let aci = 0;
  const dilimler = veriler.map(v => {
    const yuzde = v.deger / toplam;
    const bas = aci;
    aci += yuzde * 2 * Math.PI;
    return { ...v, baslangicAci: bas, bitisAci: aci, yuzde };
  });

  const cx = boyut / 2, cy = boyut / 2;
  const r = boyut * 0.42, ri = boyut * 0.24;

  return (
    <svg width={boyut} height={boyut} style={{ flexShrink: 0 }}>
      {dilimler.map((d, i) => {
        const x1 = cx + r * Math.cos(d.baslangicAci - Math.PI / 2);
        const y1 = cy + r * Math.sin(d.baslangicAci - Math.PI / 2);
        const x2 = cx + r * Math.cos(d.bitisAci - Math.PI / 2);
        const y2 = cy + r * Math.sin(d.bitisAci - Math.PI / 2);
        const xi1 = cx + ri * Math.cos(d.baslangicAci - Math.PI / 2);
        const yi1 = cy + ri * Math.sin(d.baslangicAci - Math.PI / 2);
        const xi2 = cx + ri * Math.cos(d.bitisAci - Math.PI / 2);
        const yi2 = cy + ri * Math.sin(d.bitisAci - Math.PI / 2);
        const large = d.yuzde > 0.5 ? 1 : 0;
        if (d.deger === toplam) return <circle key={i} cx={cx} cy={cy} r={r} fill={d.renk} />;
        return (
          <path key={i}
            d={`M ${xi1} ${yi1} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${ri} ${ri} 0 ${large} 0 ${xi1} ${yi1} Z`}
            fill={d.renk} opacity={0.9}
          />
        );
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" fill="#fff" fontSize={22} fontWeight="900">{toplam}</text>
      <text x={cx} y={cy + 16} textAnchor="middle" fill="#64748b" fontSize={11} fontWeight="700">GÖREV</text>
    </svg>
  );
}

function BarChart({ veriler, isMobile }) {
  const maks = Math.max(...veriler.map(v => v.deger), 1);
  const barYukseklik = isMobile ? 100 : 150;

  return (
    <div style={{ height: barYukseklik + 70, display: 'flex', alignItems: 'flex-end', gap: isMobile ? 10 : 24, padding: '10px 4px 0', overflowX: 'auto' }}>
      {veriler.map(v => {
        const h = v.deger > 0 ? Math.max((v.deger / maks) * barYukseklik, 30) : 0;
        return (
          <div key={v.label} style={{ flex: 1, minWidth: isMobile ? 40 : 60, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ color: '#94a3b8', fontSize: isMobile ? 14 : 18, fontWeight: 900, marginBottom: 6 }}>{v.deger}</div>
            <div style={{ width: '100%', maxWidth: 100, height: h, borderRadius: 8, background: v.renk || '#4ECDC4' }} />
            <div style={{ color: '#64748b', fontSize: isMobile ? 11 : 15, fontWeight: 700, marginTop: 10, textAlign: 'center' }}>
              {v.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function RaporlarSayfa({ gorevler = [], bolumler = [], kullanicilar = [] }) {
  const isMobile = useIsMobile();
  const [sekme, setSekme] = useState('genel');

  const tamam = gorevler.filter(g => g.durum === 'Tamamlandı').length;
  const devam = gorevler.filter(g => g.durum === 'Devam Ediyor').length;
  const bekle = gorevler.filter(g => g.durum === 'Bekliyor').length;
  const iptal = gorevler.filter(g => g.durum === 'İptal').length;

  const gecik = gorevler.filter(g => {
    const k = kGun(g.deadline);
    return k !== null && k < 0 && g.durum !== 'Tamamlandı' && g.durum !== 'İptal';
  }).length;

  const ortaTam = gorevler.length
    ? Math.round(gorevler.reduce((s, g) => s + (g.tamamlanma || 0), 0) / gorevler.length)
    : 0;

  const major = gorevler.filter(g => (g.oncelik || g.tur) === 'Major').length;
  const minor = gorevler.filter(g => (g.oncelik || g.tur) === 'Minor').length;

  const bolumVerisi = bolumler.map(b => {
    const bg = gorevler.filter(g => Number(g.bolumId) === Number(b.id));
    return {
      ...b,
      toplam: bg.length,
      tamam: bg.filter(g => g.durum === 'Tamamlandı').length,
      devam: bg.filter(g => g.durum === 'Devam Ediyor').length,
      gecik: bg.filter(g => { const k = kGun(g.deadline); return k !== null && k < 0 && g.durum !== 'Tamamlandı' && g.durum !== 'İptal'; }).length,
      ort: bg.length ? Math.round(bg.reduce((s, g) => s + (g.tamamlanma || 0), 0) / bg.length) : 0
    };
  }).filter(b => b.toplam > 0);

  const kisiVerisi = kullanicilar.map(k => {
    const kg = gorevler.filter(g => Number(g.atanan) === Number(k.id));
    const bolum = bolumler.find(b => Number(b.id) === Number(k.bolumId));
    return {
      ...k,
      toplam: kg.length,
      tamam: kg.filter(g => g.durum === 'Tamamlandı').length,
      gecik: kg.filter(g => { const kk = kGun(g.deadline); return kk !== null && kk < 0 && g.durum !== 'Tamamlandı' && g.durum !== 'İptal'; }).length,
      ort: kg.length ? Math.round(kg.reduce((s, g) => s + (g.tamamlanma || 0), 0) / kg.length) : 0,
      bolum
    };
  }).filter(k => k.toplam > 0).sort((a, b) => b.toplam - a.toplam);

  const panel = { background: '#1C1F2E', borderRadius: 20, padding: isMobile ? 16 : 24, marginBottom: 18 };
  const panelTitle = { color: '#94a3b8', fontSize: isMobile ? 14 : 20, fontWeight: 900, margin: '0 0 16px', letterSpacing: 1 };

  return (
    <div style={{ color: 'white', overflowX: 'hidden' }}>
      <h1 style={{ fontSize: isMobile ? 24 : 40, fontWeight: 900, margin: '0 0 16px' }}>📊 Raporlar</h1>

      {/* Sekmeler - mobilde scroll edilebilir */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {[['genel', 'Genel'], ['bolum', 'Bölüm'], ['kisi', 'Kişi']].map(([id, label]) => (
          <button key={id} onClick={() => setSekme(id)} style={{
            border: 'none', borderRadius: 14,
            padding: isMobile ? '10px 18px' : '14px 26px',
            fontSize: isMobile ? 14 : 18, fontWeight: 900, cursor: 'pointer',
            background: sekme === id ? '#FF6B35' : '#1C1F2E',
            color: sekme === id ? '#fff' : '#64748b',
            whiteSpace: 'nowrap', flexShrink: 0
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── GENEL ── */}
      {sekme === 'genel' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: isMobile ? 10 : 16, marginBottom: 16 }}>
            {[
              { emoji: '📋', baslik: 'Toplam', deger: gorevler.length, renk: '#94a3b8' },
              { emoji: '✅', baslik: 'Tamamlanan', deger: tamam, renk: '#96CEB4' },
              { emoji: '▶️', baslik: 'Devam', deger: devam, renk: '#4ECDC4' },
              { emoji: '⏳', baslik: 'Bekleyen', deger: bekle, renk: '#F7DC6F' },
              { emoji: '⚠️', baslik: 'Geciken', deger: gecik, renk: '#FF6B35' },
              { emoji: '📈', baslik: 'Ort %', deger: ortaTam, renk: '#9B59B6' }
            ].map(k => (
              <div key={k.baslik} style={{
                background: '#1C1F2E', borderRadius: 16,
                padding: isMobile ? 14 : 22,
                borderTop: `4px solid ${k.renk}`
              }}>
                <div style={{ fontSize: isMobile ? 24 : 34 }}>{k.emoji}</div>
                <div style={{ fontSize: isMobile ? 30 : 42, fontWeight: 900, color: k.renk }}>{k.deger}</div>
                <div style={{ color: '#64748b', fontSize: isMobile ? 12 : 16, marginTop: 4 }}>{k.baslik}</div>
              </div>
            ))}
          </div>

          <div style={panel}>
            <h2 style={panelTitle}>DURUM DAĞILIMI</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <PastaChart
                boyut={isMobile ? 120 : 150}
                veriler={[
                  { deger: tamam, renk: '#96CEB4' },
                  { deger: devam, renk: '#4ECDC4' },
                  { deger: bekle, renk: '#94a3b8' },
                  { deger: iptal, renk: '#ef4444' }
                ]}
              />
              <div style={{ flex: 1, minWidth: 140 }}>
                {[
                  { label: 'Tamamlandı', value: tamam, color: '#96CEB4' },
                  { label: 'Devam', value: devam, color: '#4ECDC4' },
                  { label: 'Bekliyor', value: bekle, color: '#94a3b8' },
                  { label: 'İptal', value: iptal, color: '#ef4444' }
                ].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, fontSize: isMobile ? 14 : 18 }}>
                    <span style={{ width: 14, height: 14, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
                    <span style={{ color: '#94a3b8', flex: 1 }}>{l.label}</span>
                    <strong style={{ color: l.color }}>{l.value}</strong>
                    <span style={{ color: '#475569', fontSize: isMobile ? 12 : 14 }}>
                      {gorevler.length ? Math.round((l.value / gorevler.length) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={panel}>
            <h2 style={panelTitle}>ÖNCELİK DAĞILIMI</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Major', value: major, color: '#FF6B35' },
                { label: 'Minor', value: minor, color: '#F7DC6F' }
              ].map(p => (
                <div key={p.label} style={{ background: '#252836', borderRadius: 16, padding: isMobile ? 16 : 24, textAlign: 'center' }}>
                  <div style={{ fontSize: isMobile ? 36 : 48, fontWeight: 900, color: p.color }}>{p.value}</div>
                  <div style={{ color: '#64748b', fontSize: isMobile ? 14 : 18, marginTop: 6 }}>{p.label}</div>
                  <div style={{ height: 6, background: '#151824', borderRadius: 6, marginTop: 14, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 6, background: p.color,
                      width: `${gorevler.length ? Math.round((p.value / gorevler.length) * 100) : 0}%`
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── BÖLÜM ── */}
      {sekme === 'bolum' && (
        <>
          <div style={panel}>
            <h2 style={panelTitle}>BÖLÜM BAZLI GÖREV SAYISI</h2>
            <BarChart isMobile={isMobile} veriler={bolumVerisi.map(b => ({ label: b.ad, deger: b.toplam, renk: b.renk }))} />
          </div>

          {bolumVerisi.map(b => (
            <div key={b.id} style={{ ...panel, borderLeft: `6px solid ${b.renk || '#4ECDC4'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: isMobile ? 20 : 26, fontWeight: 900 }}>
                  <span style={{ fontSize: isMobile ? 28 : 36 }}>{b.emoji}</span>
                  <span style={{ color: b.renk }}>{b.ad}</span>
                </div>
                <div style={{ color: '#64748b', fontSize: isMobile ? 16 : 22, fontWeight: 900 }}>{b.toplam} görev</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: isMobile ? 8 : 12 }}>
                {[
                  { emoji: '✅', value: b.tamam, label: 'Bitti', color: '#96CEB4' },
                  { emoji: '▶️', value: b.devam, label: 'Devam', color: '#4ECDC4' },
                  { emoji: '⚠️', value: b.gecik, label: 'Geciken', color: '#FF6B35' },
                  { emoji: '📈', value: `${b.ort}%`, label: 'Ort', color: '#9B59B6' }
                ].map(s => (
                  <div key={s.label} style={{ background: '#252836', borderRadius: 12, padding: isMobile ? 10 : 16, textAlign: 'center' }}>
                    {!isMobile && <div style={{ fontSize: 22 }}>{s.emoji}</div>}
                    <div style={{ fontSize: isMobile ? 20 : 28, fontWeight: 900, color: s.color }}>{s.value}</div>
                    <div style={{ color: '#64748b', fontSize: isMobile ? 10 : 13, marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ height: 7, background: '#252836', borderRadius: 7, marginTop: 16, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 7, width: `${b.ort}%`, background: b.renk || '#4ECDC4' }} />
              </div>
              <div style={{ textAlign: 'right', color: '#64748b', marginTop: 6, fontSize: 13 }}>%{b.ort}</div>
            </div>
          ))}
        </>
      )}

      {/* ── KİŞİ ── */}
      {sekme === 'kisi' && (
        <>
          <div style={panel}>
            <h2 style={panelTitle}>KİŞİ BAZLI GÖREV YÜKÜ</h2>
            <BarChart isMobile={isMobile} veriler={kisiVerisi.map(k => ({
              label: kisiAdi(k).split(' ')[0],
              deger: k.toplam,
              renk: k.bolum?.renk || '#4ECDC4'
            }))} />
          </div>

          {kisiVerisi.map(k => (
            <div key={k.id} style={panel}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{
                  width: isMobile ? 52 : 64, height: isMobile ? 52 : 64, flexShrink: 0,
                  borderRadius: '50%', border: `4px solid ${k.bolum?.renk || '#4ECDC4'}`,
                  background: '#19313a', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: isMobile ? 18 : 22, color: k.bolum?.renk || '#4ECDC4'
                }}>
                  {k.avatar || basHarf(kisiAdi(k))}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: isMobile ? 18 : 26, fontWeight: 900 }}>{kisiAdi(k)}</div>
                  <div style={{ color: '#64748b', fontSize: isMobile ? 12 : 16, marginTop: 3 }}>
                    👤 {k.rol} {k.bolum ? `· ${k.bolum.emoji} ${k.bolum.ad}` : ''}
                  </div>
                </div>
                <div style={{ color: k.bolum?.renk || '#4ECDC4', fontSize: isMobile ? 30 : 42, fontWeight: 900, textAlign: 'center', flexShrink: 0 }}>
                  {k.toplam}
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>görev</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: isMobile ? 8 : 12 }}>
                {[
                  { value: k.tamam, label: 'Tamamlandı', color: '#96CEB4' },
                  { value: k.gecik, label: 'Geciken', color: '#FF6B35' },
                  { value: `${k.ort}%`, label: 'Ort %', color: '#9B59B6' }
                ].map(s => (
                  <div key={s.label} style={{ background: '#252836', borderRadius: 12, padding: isMobile ? 12 : 18, textAlign: 'center' }}>
                    <div style={{ fontSize: isMobile ? 22 : 32, fontWeight: 900, color: s.color }}>{s.value}</div>
                    <div style={{ color: '#64748b', fontSize: isMobile ? 11 : 15, marginTop: 3 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ height: 7, background: '#252836', borderRadius: 7, marginTop: 14, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 7, width: `${k.ort}%`, background: k.bolum?.renk || '#4ECDC4' }} />
              </div>
            </div>
          ))}
        </>
      )}

      <div style={{ height: 40 }} />
    </div>
  );
}
