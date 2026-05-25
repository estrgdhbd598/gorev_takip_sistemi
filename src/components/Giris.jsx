import { useState } from 'react';

export default function Giris({ kullanicilar, onGiris }) {
  const [sec, setSec] = useState(null);
  const [sifre, setSifre] = useState('');
  const [hata, setHata] = useState('');

  const secilen = kullanicilar.find(k => k.id === sec);

  function giris() {
    if (!secilen) {
      setHata('Lütfen kullanıcı seçin');
      return;
    }

    if (secilen.sifre !== sifre) {
      setHata('Şifre hatalı');
      return;
    }

    onGiris(secilen);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0F1117', color: 'white' }}>
      <div style={{ padding: '50px 24px 30px', background: 'linear-gradient(160deg,#1a1f35,#0F1117)' }}>
        <div style={{ color: '#FF6B35', letterSpacing: 4, fontSize: 13, fontWeight: 800 }}>
          İŞ TAKİP SİSTEMİ
        </div>

        <h1 style={{ fontSize: 46, lineHeight: 1.05, marginTop: 30 }}>
          Hoş<br />Geldiniz
        </h1>

        <div style={{ color: '#64748b', fontSize: 20 }}>
          Hesabınızı seçin
        </div>
      </div>

      <div style={{ padding: 20 }}>
        {kullanicilar.map(k => (
          <div
            key={k.id}
            onClick={() => {
              setSec(k.id);
              setSifre('');
              setHata('');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              background: sec === k.id ? '#1C1F2E' : '#141620',
              border: `2px solid ${sec === k.id ? '#FF6B35' : '#1C1F2E'}`,
              borderRadius: 22,
              padding: 20,
              marginBottom: 14,
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: 62,
              height: 62,
              borderRadius: '50%',
              border: `3px solid ${k.renk}`,
              color: k.renk,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 18
            }}>
              {k.avatar}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{k.ad}</div>
              <div style={{ color: '#64748b', marginTop: 4 }}>{k.rol}</div>
            </div>

            {sec === k.id && (
              <div style={{
                background: '#FF6B35',
                color: 'white',
                width: 38,
                height: 38,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900
              }}>
                ✓
              </div>
            )}
          </div>
        ))}

        <div style={{ background: '#141620', padding: 20, borderRadius: 22, marginTop: 20 }}>
          <label style={{ color: '#64748b', fontWeight: 800, letterSpacing: 2 }}>ŞİFRE</label>

          <input
            type="password"
            placeholder="Şifrenizi girin..."
            value={sifre}
            onChange={e => setSifre(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') giris();
            }}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: 18,
              marginTop: 12,
              borderRadius: 16,
              border: '2px solid #2d3250',
              background: '#252836',
              color: 'white',
              fontSize: 18
            }}
          />

          {hata && <div style={{ color: '#FF6B35', marginTop: 12 }}>{hata}</div>}

          
        </div>

        <button
          onClick={giris}
          style={{
            width: '100%',
            padding: 22,
            marginTop: 24,
            borderRadius: 22,
            border: 'none',
            background: '#FF6B35',
            color: 'white',
            fontSize: 20,
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          Giriş Yap →
        </button>
      </div>
    </div>
  );
}