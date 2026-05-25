import React, { useEffect, useState } from 'react';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

export default function GanttSayfa({ gorevler, setSeciliGorev }) {
  const isMobile = useIsMobile();

  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);

  // Mobilde 30 gün, masaüstünde 60 gün göster
  const gunSayisi = isMobile ? 30 : 60;
  const gunGenislik = isMobile ? 38 : 50;
  const solGenislik = isMobile ? 120 : 220;

  const gunler = Array.from({ length: gunSayisi }, (_, i) => {
    const d = new Date(bugun);
    d.setDate(d.getDate() + i);
    return d;
  });

  function gunIndex(tarih) {
    if (!tarih) return 0;
    const d = new Date(tarih);
    d.setHours(0, 0, 0, 0);
    return Math.max(0, Math.floor((d - bugun) / 86400000));
  }

  function durumRengi(durum) {
    if (durum === 'Bekliyor') return '#64748b';
    if (durum === 'Devam Ediyor') return '#FF6B35';
    if (durum === 'Tamamlandı') return '#A8E6CF';
    if (durum === 'İptal') return '#ef4444';
    return '#4ECDC4';
  }

  return (
    <div style={{ color: 'white' }}>
      <h1 style={{ fontSize: isMobile ? 22 : 36, marginBottom: 6 }}>
        ▦ Gantt
      </h1>
      {isMobile && (
        <p style={{ color: '#64748b', fontSize: 12, marginBottom: 16 }}>
          Sola/sağa kaydırarak ilerleyin · Son 30 gün
        </p>
      )}

      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginTop: isMobile ? 0 : 20 }}>
        <div style={{ minWidth: solGenislik + gunler.length * gunGenislik }}>

          {/* Başlık satırı */}
          <div style={{ display: 'flex', position: 'sticky', top: 0, zIndex: 10 }}>
            <div style={{
              width: solGenislik, minWidth: solGenislik,
              padding: isMobile ? '10px 8px' : '12px 15px',
              background: '#141620', color: '#94a3b8',
              border: '1px solid #252836', fontWeight: 800,
              fontSize: isMobile ? 11 : 13,
              position: 'sticky', left: 0, zIndex: 11
            }}>
              GÖREV
            </div>

            {gunler.map((g, i) => {
              const bugunMu = g.toDateString() === bugun.toDateString();
              return (
                <div key={i} style={{
                  width: gunGenislik, minWidth: gunGenislik,
                  padding: isMobile ? '8px 2px' : '12px 4px',
                  textAlign: 'center',
                  background: bugunMu ? '#FF6B3522' : '#141620',
                  color: bugunMu ? '#FF6B35' : '#64748b',
                  border: '1px solid #252836',
                  fontWeight: 800, fontSize: isMobile ? 10 : 12
                }}>
                  <div>{g.getDate()}</div>
                  {(!isMobile || i % 5 === 0) && (
                    <div style={{ fontSize: isMobile ? 9 : 10 }}>
                      {g.toLocaleDateString('tr-TR', { month: 'short' })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Görev satırları */}
          {gorevler.map(g => {
            const start = gunIndex(g.baslangic);
            const end = gunIndex(g.deadline);
            const barWidth = Math.max(end - start + 1, 1) * gunGenislik;
            const renk = durumRengi(g.durum);

            return (
              <div key={g.id} style={{ display: 'flex' }}>
                {/* Sol: görev adı */}
                <div style={{
                  width: solGenislik, minWidth: solGenislik,
                  padding: isMobile ? '10px 8px' : '12px 15px',
                  background: '#0F1117', color: 'white',
                  border: '1px solid #252836',
                  overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                  fontSize: isMobile ? 11 : 14,
                  position: 'sticky', left: 0, zIndex: 5
                }}>
                  {g.baslik}
                </div>

                {/* Zaman çizelgesi */}
                <div style={{
                  position: 'relative',
                  height: isMobile ? 46 : 58,
                  flex: 1,
                  border: '1px solid #252836',
                  background: '#0B0D14',
                  minWidth: gunler.length * gunGenislik
                }}>
                  <div
                    onClick={() => setSeciliGorev(g)}
                    style={{
                      height: isMobile ? 26 : 34,
                      marginTop: isMobile ? 10 : 12,
                      marginLeft: start * gunGenislik,
                      width: barWidth,
                      borderRadius: 8,
                      background: renk,
                      color: 'white',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: 8,
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      fontSize: isMobile ? 10 : 13,
                      boxShadow: '0 4px 14px #00000055',
                      position: 'absolute'
                    }}
                  >
                    {g.baslik}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lejant */}
      <div style={{
        display: 'flex', gap: isMobile ? 12 : 18, flexWrap: 'wrap',
        marginTop: 18, color: '#94a3b8', fontWeight: 800,
        fontSize: isMobile ? 12 : 14
      }}>
        {[
          { renk: '#64748b', label: 'Bekliyor' },
          { renk: '#FF6B35', label: 'Devam Ediyor' },
          { renk: '#A8E6CF', label: 'Tamamlandı' },
          { renk: '#ef4444', label: 'İptal' }
        ].map(l => (
          <span key={l.label}>
            <b style={{ color: l.renk }}>●</b> {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}
