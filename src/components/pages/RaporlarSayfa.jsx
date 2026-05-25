import { useState } from 'react';

function kGun(tarih) {
  if (!tarih) return null;

  const bugun = new Date();
  const hedef = new Date(tarih);

  bugun.setHours(0, 0, 0, 0);
  hedef.setHours(0, 0, 0, 0);

  return Math.ceil((hedef - bugun) / 86400000);
}

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

function PastaChart({ veriler, boyut = 150 }) {
  const toplam = veriler.reduce((s, v) => s + v.deger, 0);

  if (!toplam) {
    return <div style={{ color: '#64748b', padding: 20 }}>Veri yok</div>;
  }

  let aci = 0;

  const dilimler = veriler.map(v => {
    const yuzde = v.deger / toplam;
    const bas = aci;
    aci += yuzde * 2 * Math.PI;
    return { ...v, baslangicAci: bas, bitisAci: aci, yuzde };
  });

  const cx = boyut / 2;
  const cy = boyut / 2;
  const r = boyut * 0.4;
  const ri = boyut * 0.23;

  return (
    <svg width={boyut} height={boyut}>
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

        if (d.deger === toplam) {
          return <circle key={i} cx={cx} cy={cy} r={r} fill={d.renk} />;
        }

        return (
          <path
            key={i}
            d={`M ${xi1} ${yi1} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${ri} ${ri} 0 ${large} 0 ${xi1} ${yi1} Z`}
            fill={d.renk}
            opacity={0.9}
          />
        );
      })}

      <text x={cx} y={cy - 4} textAnchor="middle" fill="#fff" fontSize={24} fontWeight="900">
        {toplam}
      </text>

      <text x={cx} y={cy + 18} textAnchor="middle" fill="#64748b" fontSize={12} fontWeight="700">
        GÖREV
      </text>
    </svg>
  );
}

function BarChart({ veriler }) {
  const maks = Math.max(...veriler.map(v => v.deger), 1);

  return (
    <div style={styles.barWrap}>
      {veriler.map(v => {
        const h = v.deger > 0 ? Math.max((v.deger / maks) * 150, 45) : 0;

        return (
          <div key={v.label} style={styles.barItem}>
            <div style={styles.barValue}>{v.deger}</div>

            <div
              style={{
                ...styles.bar,
                height: h,
                background: v.renk || '#4ECDC4'
              }}
            />

            <div style={styles.barLabel}>{v.label}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function RaporlarSayfa({
  gorevler = [],
  bolumler = [],
  kullanicilar = []
}) {
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

  const bolumVerisi = bolumler
    .map(b => {
      const bg = gorevler.filter(g => Number(g.bolumId) === Number(b.id));

      const bit = bg.filter(g => g.durum === 'Tamamlandı').length;
      const dev = bg.filter(g => g.durum === 'Devam Ediyor').length;

      const gec = bg.filter(g => {
        const k = kGun(g.deadline);
        return k !== null && k < 0 && g.durum !== 'Tamamlandı' && g.durum !== 'İptal';
      }).length;

      const ort = bg.length
        ? Math.round(bg.reduce((s, g) => s + (g.tamamlanma || 0), 0) / bg.length)
        : 0;

      return {
        ...b,
        toplam: bg.length,
        tamam: bit,
        devam: dev,
        gecik: gec,
        ort
      };
    })
    .filter(b => b.toplam > 0);

  const kisiVerisi = kullanicilar
    .map(k => {
      const kg = gorevler.filter(g => Number(g.atanan) === Number(k.id));
      const bolum = bolumler.find(b => Number(b.id) === Number(k.bolumId));

      const bit = kg.filter(g => g.durum === 'Tamamlandı').length;

      const gec = kg.filter(g => {
        const kk = kGun(g.deadline);
        return kk !== null && kk < 0 && g.durum !== 'Tamamlandı' && g.durum !== 'İptal';
      }).length;

      const ort = kg.length
        ? Math.round(kg.reduce((s, g) => s + (g.tamamlanma || 0), 0) / kg.length)
        : 0;

      return {
        ...k,
        toplam: kg.length,
        tamam: bit,
        gecik: gec,
        ort,
        bolum
      };
    })
    .filter(k => k.toplam > 0)
    .sort((a, b) => b.toplam - a.toplam);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>📊 Raporlar</h1>

        <div style={styles.tabs}>
          {[
            ['genel', 'Genel'],
            ['bolum', 'Bölüm'],
            ['kisi', 'Kişi']
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setSekme(id)}
              style={{
                ...styles.tab,
                background: sekme === id ? '#FF6B35' : '#1C1F2E',
                color: sekme === id ? '#fff' : '#64748b'
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {sekme === 'genel' && (
        <>
          <div style={styles.grid2}>
            <RaporKart emoji="📋" baslik="Toplam Görev" deger={gorevler.length} renk="#94a3b8" />
            <RaporKart emoji="✅" baslik="Tamamlanan" deger={tamam} renk="#96CEB4" />
            <RaporKart emoji="▶️" baslik="Devam Eden" deger={devam} renk="#4ECDC4" />
            <RaporKart emoji="⏳" baslik="Bekleyen" deger={bekle} renk="#F7DC6F" />
            <RaporKart emoji="⚠️" baslik="Geciken" deger={gecik} renk="#FF6B35" />
            <RaporKart emoji="📈" baslik="Ortalama %" deger={ortaTam} renk="#9B59B6" />
          </div>

          <div style={styles.panel}>
            <h2 style={styles.panelTitle}>DURUM DAĞILIMI</h2>

            <div style={styles.chartRow}>
              <PastaChart
                veriler={[
                  { deger: tamam, renk: '#96CEB4' },
                  { deger: devam, renk: '#4ECDC4' },
                  { deger: bekle, renk: '#94a3b8' },
                  { deger: iptal, renk: '#ef4444' }
                ]}
              />

              <div style={{ flex: 1 }}>
                <Legend label="Tamamlandı" value={tamam} total={gorevler.length} color="#96CEB4" />
                <Legend label="Devam" value={devam} total={gorevler.length} color="#4ECDC4" />
                <Legend label="Bekliyor" value={bekle} total={gorevler.length} color="#94a3b8" />
                <Legend label="İptal" value={iptal} total={gorevler.length} color="#ef4444" />
              </div>
            </div>
          </div>

          <div style={styles.panel}>
            <h2 style={styles.panelTitle}>ÖNCELİK DAĞILIMI</h2>

            <div style={styles.grid2}>
              <PriorityBox label="Major" value={major} color="#FF6B35" total={gorevler.length} />
              <PriorityBox label="Minor" value={minor} color="#F7DC6F" total={gorevler.length} />
            </div>
          </div>
        </>
      )}

      {sekme === 'bolum' && (
        <>
          <div style={styles.panel}>
            <h2 style={styles.panelTitle}>BÖLÜM BAZLI GÖREV SAYISI</h2>

            <BarChart
              veriler={bolumVerisi.map(b => ({
                label: b.ad,
                deger: b.toplam,
                renk: b.renk
              }))}
            />
          </div>

          {bolumVerisi.map(b => (
            <div
              key={b.id}
              style={{
                ...styles.bolumCard,
                borderLeft: `6px solid ${b.renk || '#4ECDC4'}`
              }}
            >
              <div style={styles.bolumHead}>
                <div style={styles.bolumTitle}>
                  <span style={styles.bolumEmoji}>{b.emoji}</span>
                  <span style={{ color: b.renk }}>{b.ad}</span>
                </div>

                <div style={styles.gorevSayi}>{b.toplam} görev</div>
              </div>

              <div style={styles.grid4}>
                <MiniBox emoji="✅" value={b.tamam} label="Tamamlandı" color="#96CEB4" />
                <MiniBox emoji="▶️" value={b.devam} label="Devam" color="#4ECDC4" />
                <MiniBox emoji="⚠️" value={b.gecik} label="Geciken" color="#FF6B35" />
                <MiniBox emoji="📈" value={`${b.ort}%`} label="Ort %" color="#9B59B6" />
              </div>

              <div style={styles.progressBg}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${b.ort}%`,
                    background: b.renk || '#4ECDC4'
                  }}
                />
              </div>

              <div style={styles.progressText}>Ortalama tamamlanma: %{b.ort}</div>
            </div>
          ))}
        </>
      )}

      {sekme === 'kisi' && (
        <>
          <div style={styles.panel}>
            <h2 style={styles.panelTitle}>KİŞİ BAZLI GÖREV YÜKÜ</h2>

            <BarChart
              veriler={kisiVerisi.map(k => ({
                label: kisiAdi(k).split(' ')[0],
                deger: k.toplam,
                renk: k.bolum?.renk || k.renk || '#4ECDC4'
              }))}
            />
          </div>

          {kisiVerisi.map(k => (
            <div key={k.id} style={styles.kisiCard}>
              <div style={styles.kisiHead}>
                <div
                  style={{
                    ...styles.avatar,
                    borderColor: k.bolum?.renk || '#4ECDC4',
                    color: k.bolum?.renk || '#4ECDC4'
                  }}
                >
                  {k.avatar || basHarf(kisiAdi(k))}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={styles.kisiAd}>{kisiAdi(k)}</div>
                  <div style={styles.kisiAlt}>
                    👤 {k.rol} {k.bolum ? `· ${k.bolum.emoji} ${k.bolum.ad}` : ''}
                  </div>
                </div>

                <div style={styles.kisiToplam}>
                  <div>{k.toplam}</div>
                  <span>görev</span>
                </div>
              </div>

              <div style={styles.grid3}>
                <MiniBox value={k.tamam} label="Tamamlandı" color="#96CEB4" />
                <MiniBox value={k.gecik} label="Geciken" color="#FF6B35" />
                <MiniBox value={`${k.ort}%`} label="Ort %" color="#9B59B6" />
              </div>

              <div style={styles.progressBg}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${k.ort}%`,
                    background: k.bolum?.renk || '#4ECDC4'
                  }}
                />
              </div>
            </div>
          ))}
        </>
      )}

      <div style={{ height: 50 }} />
    </div>
  );
}

function RaporKart({ emoji, baslik, deger, renk }) {
  return (
    <div style={{ ...styles.reportCard, borderTop: `4px solid ${renk}` }}>
      <div style={styles.reportEmoji}>{emoji}</div>
      <div style={{ ...styles.reportValue, color: renk }}>{deger}</div>
      <div style={styles.reportLabel}>{baslik}</div>
    </div>
  );
}

function Legend({ label, value, total, color }) {
  const oran = total ? Math.round((value / total) * 100) : 0;

  return (
    <div style={styles.legendRow}>
      <span style={{ ...styles.dot, background: color }} />
      <span style={styles.legendLabel}>{label}</span>
      <strong style={{ color }}>{value}</strong>
      <span style={styles.legendPercent}>{oran}%</span>
    </div>
  );
}

function PriorityBox({ label, value, color, total }) {
  const oran = total ? Math.round((value / total) * 100) : 0;

  return (
    <div style={styles.priorityBox}>
      <div style={{ ...styles.priorityValue, color }}>{value}</div>
      <div style={styles.priorityLabel}>{label}</div>

      <div style={styles.priorityBarBg}>
        <div
          style={{
            ...styles.priorityBar,
            width: `${oran}%`,
            background: color
          }}
        />
      </div>
    </div>
  );
}

function MiniBox({ emoji, value, label, color }) {
  return (
    <div style={styles.miniBox}>
      {emoji && <div style={styles.miniEmoji}>{emoji}</div>}
      <div style={{ ...styles.miniValue, color }}>{value}</div>
      <div style={styles.miniLabel}>{label}</div>
    </div>
  );
}

const styles = {
  page: {
    color: 'white',
    padding: 20
  },
  header: {
    marginBottom: 30
  },
  title: {
    fontSize: 42,
    fontWeight: 900,
    margin: '0 0 24px'
  },
  tabs: {
    display: 'flex',
    gap: 14
  },
  tab: {
    border: 'none',
    borderRadius: 18,
    padding: '16px 30px',
    fontSize: 22,
    fontWeight: 900,
    cursor: 'pointer'
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 18,
    marginBottom: 18
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 14,
    marginTop: 18
  },
  grid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 14,
    marginTop: 18
  },
  reportCard: {
    background: '#1C1F2E',
    borderRadius: 22,
    padding: 24,
    minHeight: 150
  },
  reportEmoji: {
    fontSize: 38,
    marginBottom: 20
  },
  reportValue: {
    fontSize: 46,
    fontWeight: 900
  },
  reportLabel: {
    color: '#64748b',
    fontSize: 22,
    marginTop: 6
  },
  panel: {
    background: '#1C1F2E',
    borderRadius: 24,
    padding: 24,
    marginBottom: 22
  },
  panelTitle: {
    color: '#94a3b8',
    fontSize: 24,
    fontWeight: 900,
    margin: '0 0 20px'
  },
  chartRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 30
  },
  legendRow: {
    display: 'grid',
    gridTemplateColumns: '20px 1fr 40px 50px',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    fontSize: 22
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: '50%'
  },
  legendLabel: {
    color: '#94a3b8'
  },
  legendPercent: {
    color: '#475569'
  },
  priorityBox: {
    background: '#252836',
    borderRadius: 18,
    padding: 28,
    textAlign: 'center'
  },
  priorityValue: {
    fontSize: 52,
    fontWeight: 900
  },
  priorityLabel: {
    color: '#64748b',
    fontSize: 22,
    marginTop: 8
  },
  priorityBarBg: {
    height: 8,
    background: '#151824',
    borderRadius: 8,
    marginTop: 18,
    overflow: 'hidden'
  },
  priorityBar: {
    height: '100%',
    borderRadius: 8
  },
  barWrap: {
    height: 220,
    display: 'flex',
    alignItems: 'flex-end',
    gap: 28,
    padding: '10px 10px 0'
  },
  barItem: {
    flex: 1,
    minWidth: 70,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  barValue: {
    color: '#94a3b8',
    fontSize: 20,
    fontWeight: 900,
    marginBottom: 8
  },
  bar: {
    width: '100%',
    maxWidth: 130,
    borderRadius: 10
  },
  barLabel: {
    color: '#64748b',
    fontSize: 18,
    fontWeight: 700,
    marginTop: 12,
    textAlign: 'center'
  },
  bolumCard: {
    background: '#1C1F2E',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20
  },
  bolumHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  bolumTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    fontSize: 30,
    fontWeight: 900
  },
  bolumEmoji: {
    fontSize: 40
  },
  gorevSayi: {
    color: '#64748b',
    fontSize: 24,
    fontWeight: 900
  },
  miniBox: {
    background: '#252836',
    borderRadius: 16,
    padding: 18,
    textAlign: 'center'
  },
  miniEmoji: {
    fontSize: 28,
    marginBottom: 6
  },
  miniValue: {
    fontSize: 34,
    fontWeight: 900
  },
  miniLabel: {
    color: '#64748b',
    fontSize: 16,
    marginTop: 4
  },
  progressBg: {
    height: 9,
    background: '#252836',
    borderRadius: 9,
    marginTop: 20,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 9
  },
  progressText: {
    textAlign: 'right',
    color: '#64748b',
    marginTop: 8,
    fontSize: 18
  },
  kisiCard: {
    background: '#1C1F2E',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20
  },
  kisiHead: {
    display: 'flex',
    alignItems: 'center',
    gap: 18
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: '50%',
    border: '4px solid #4ECDC4',
    background: '#19313a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900,
    fontSize: 24
  },
  kisiAd: {
    fontSize: 30,
    fontWeight: 900
  },
  kisiAlt: {
    color: '#64748b',
    fontSize: 20,
    marginTop: 6
  },
  kisiToplam: {
    color: '#4ECDC4',
    fontSize: 44,
    fontWeight: 900,
    textAlign: 'center'
  }
};