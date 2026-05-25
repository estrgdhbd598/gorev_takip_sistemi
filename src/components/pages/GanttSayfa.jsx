import React from 'react';

export default function GanttSayfa({ gorevler, setSeciliGorev }) {
  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);

  const gunler = Array.from({ length: 60 }, (_, i) => {
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
    <div>
      <h1 style={{ color: 'white', fontSize: 38 }}>
        ▦ Gantt Zaman Çizelgesi
      </h1>

      <div style={{ overflowX: 'auto', marginTop: 25 }}>
        <div style={{ minWidth: 1200 }}>

          <div style={{ display: 'flex' }}>
            <div style={styles.leftHead}>
              GÖREV
            </div>

            {gunler.map((g, i) => {
              const bugunMu = g.toDateString() === bugun.toDateString();

              return (
                <div
                    key={i}
                    style={{
                        ...styles.day,
                        background: bugunMu ? '#FF6B3522' : '#141620',
                        color: bugunMu ? '#FF6B35' : '#64748b'
                    }}
                    >
                    <div>{g.getDate()}</div>

                    <div style={{ fontSize: 10 }}>
                        {g.toLocaleDateString('tr-TR', { month: 'short' })}
                    </div>

                    <div style={{ fontSize: 9 }}>
                        {g.getFullYear()}
                    </div>
                </div>
              );
            })}
          </div>

          {gorevler.map(g => {
            const start = gunIndex(g.baslangic);
            const end = gunIndex(g.deadline);
            const width = Math.max(end - start + 1, 1) * 50;
            const renk = durumRengi(g.durum);

            return (
              <div key={g.id} style={{ display: 'flex' }}>
                <div style={styles.leftCell}>
                  {g.baslik}
                </div>

                <div style={styles.timeline}>
                  <div
                    onClick={() => setSeciliGorev(g)}
                    style={{
                      ...styles.bar,
                      marginLeft: start * 50,
                      width,
                      background: renk
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

      <div style={styles.legend}>
        <span><b style={{ color: '#64748b' }}>●</b> Bekliyor</span>
        <span><b style={{ color: '#FF6B35' }}>●</b> Devam Ediyor</span>
        <span><b style={{ color: '#A8E6CF' }}>●</b> Tamamlandı</span>
        <span><b style={{ color: '#ef4444' }}>●</b> İptal</span>
      </div>
    </div>
  );
}

const styles = {
  leftHead: {
    width: 250,
    minWidth: 250,
    padding: 15,
    background: '#141620',
    color: '#94a3b8',
    border: '1px solid #252836',
    fontWeight: 800
  },

  day: {
    width: 50,
    minWidth: 50,
    padding: 15,
    textAlign: 'center',
    background: '#141620',
    color: '#64748b',
    border: '1px solid #252836',
    fontWeight: 800
  },

  leftCell: {
    width: 250,
    minWidth: 250,
    padding: 15,
    background: '#0F1117',
    color: 'white',
    border: '1px solid #252836',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  },

  timeline: {
    position: 'relative',
    height: 60,
    flex: 1,
    border: '1px solid #252836',
    background: '#0B0D14'
  },

  bar: {
    height: 36,
    marginTop: 12,
    borderRadius: 10,
    color: 'white',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    paddingLeft: 12,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    boxShadow: '0 8px 25px #00000066'
  },

  legend: {
    display: 'flex',
    gap: 18,
    flexWrap: 'wrap',
    marginTop: 20,
    color: '#94a3b8',
    fontWeight: 800
  }
};