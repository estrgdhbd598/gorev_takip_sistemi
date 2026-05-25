import { useEffect, useState, useCallback } from 'react';
import GanttSayfa from './pages/GanttSayfa';
import { EkipSayfa } from './pages/EkipSayfa.jsx';
import RaporlarSayfa from './pages/RaporlarSayfa.jsx';
import { AyarlarSayfa } from './pages/AyarlarSayfa.jsx';

const DURUMLAR = ['Bekliyor', 'Devam Ediyor', 'Tamamlandı', 'İptal'];

// Hook: pencere genişliğini reaktif olarak takip eder
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

export default function Platform({
  kul,
  onCikis,
  kullanicilar,
  setKullanicilar,
  gorevler,
  setGorevler,
  bolumler,
  setBolumler
}) {
  const [sayfa, setSayfa] = useState('Dashboard');
  const [seciliGorev, setSeciliGorev] = useState(null);
  const [formAcik, setFormAcik] = useState(false);
  const [duzenleAcik, setDuzenleAcik] = useState(false);
  const [mobilMenuAcik, setMobilMenuAcik] = useState(false);

  const isMobile = useIsMobile();

  function rolNormalize(rol) {
    return String(rol || '').toLowerCase();
  }

  function yoneticiRolMu(rol) {
    const r = rolNormalize(rol);
    return (
      r === 'yonetici' ||
      r === 'yönetici' ||
      r === 'gm' ||
      r === 'genel müdür' ||
      r === 'genel mudur'
    );
  }

  function kisiAdi(kisi) {
    return kisi?.adSoyad || kisi?.ad || 'Bilinmiyor';
  }

  function kullaniciAdi(id) {
    const kisi = kullanicilar.find(k => Number(k.id) === Number(id));
    return kisiAdi(kisi);
  }

  const yoneticiMi = yoneticiRolMu(kul?.rol);

  const ayarlarGorebilir = yoneticiMi || kul?.ayarYetkisi === true;
  const raporlarGorebilir = yoneticiMi;
  const ekipGorebilir = yoneticiMi;
  const ganttGorebilir = yoneticiMi;

  const ilkAtanacak =
    kullanicilar.find(k => !yoneticiRolMu(k.rol))?.id ||
    kullanicilar[0]?.id ||
    1;

  const [form, setForm] = useState({
    baslik: '',
    aciklama: '',
    atananlar: [ilkAtanacak],
    atanan: ilkAtanacak,
    durum: 'Bekliyor',
    oncelik: 'Minor',
    tur: 'Minor',
    baslangic: '',
    deadline: '',
    tamamlanma: 0,
    bolumId: 1
  });

  function altKisiIdleri(kisiId, ziyaretEdilenler = new Set()) {
    const id = Number(kisiId);
    if (ziyaretEdilenler.has(id)) return [];
    ziyaretEdilenler.add(id);
    const direktAltlar = kullanicilar.filter(
      k => Number(k.ustKisiId) === id && Number(k.id) !== id
    );
    let tumAltlar = [];
    direktAltlar.forEach(alt => {
      const altId = Number(alt.id);
      if (!ziyaretEdilenler.has(altId)) {
        tumAltlar.push(altId);
        tumAltlar = [...tumAltlar, ...altKisiIdleri(altId, ziyaretEdilenler)];
      }
    });
    return tumAltlar;
  }

  function gorevinAtananlari(gorev) {
    if (Array.isArray(gorev.atananlar)) return gorev.atananlar.map(Number);
    if (gorev.atanan) return [Number(gorev.atanan)];
    return [];
  }

  const gorulecekKisiIdleri = [Number(kul.id), ...altKisiIdleri(kul.id)];

  const gorunenGorevler = yoneticiMi
    ? gorevler
    : gorevler.filter(g =>
        gorevinAtananlari(g).some(id => gorulecekKisiIdleri.includes(Number(id)))
      );

  const toplam = gorunenGorevler.length;
  const devam = gorunenGorevler.filter(g => g.durum === 'Devam Ediyor').length;
  const tamam = gorunenGorevler.filter(g => g.durum === 'Tamamlandı').length;

  const menuSayfalari = [
    'Dashboard',
    'Görevler',
    ...(ganttGorebilir ? ['Gantt'] : []),
    ...(ekipGorebilir ? ['Ekip'] : []),
    ...(raporlarGorebilir ? ['Raporlar'] : []),
    ...(ayarlarGorebilir ? ['Ayarlar'] : [])
  ];

  useEffect(() => {
    function escKapat(e) {
      if (e.key === 'Escape') {
        setSeciliGorev(null);
        setFormAcik(false);
        setDuzenleAcik(false);
      }
    }
    window.addEventListener('keydown', escKapat);
    return () => window.removeEventListener('keydown', escKapat);
  }, []);

  // Mobil menü açıkken dışarı tıklayınca kapat
  useEffect(() => {
    if (!mobilMenuAcik) return;
    function handler(e) {
      setMobilMenuAcik(false);
    }
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [mobilMenuAcik]);

  function gunFarki(tarih) {
    if (!tarih) return '';
    const bugun = new Date();
    const hedef = new Date(tarih);
    bugun.setHours(0, 0, 0, 0);
    hedef.setHours(0, 0, 0, 0);
    const fark = Math.ceil((hedef - bugun) / 86400000);
    if (fark < 0) return `${Math.abs(fark)}g geçti`;
    if (fark === 0) return 'Bugün';
    return `${fark}g kaldı`;
  }

  function tarihKisa(tarih) {
    if (!tarih) return '-';
    return new Date(tarih).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  function formSifirla() {
    setForm({
      baslik: '',
      aciklama: '',
      atananlar: [ilkAtanacak],
      atanan: ilkAtanacak,
      durum: 'Bekliyor',
      oncelik: 'Minor',
      tur: 'Minor',
      baslangic: '',
      deadline: '',
      tamamlanma: 0,
      bolumId: 1
    });
  }

  function gorevEkle() {
    if (!form.baslik.trim()) { alert('Başlık zorunlu'); return; }
    if (!form.atananlar || form.atananlar.length === 0) { alert('En az bir kişi seçmelisin'); return; }
    const yeni = {
      ...form,
      id: Date.now(),
      atananlar: form.atananlar.map(Number),
      atanan: Number(form.atananlar[0]),
      bolumId: Number(form.bolumId),
      tamamlanma: Number(form.tamamlanma),
      tur: form.oncelik,
      dosyalar: []
    };
    setGorevler([...gorevler, yeni]);
    setFormAcik(false);
    formSifirla();
  }

  function gorevGuncelle(id, alanlar) {
    setGorevler(gorevler.map(g => (g.id === id ? { ...g, ...alanlar } : g)));
    setSeciliGorev(prev => (prev?.id === id ? { ...prev, ...alanlar } : prev));
  }

  function gorevSil(id) {
    setGorevler(gorevler.filter(g => g.id !== id));
    setSeciliGorev(null);
  }

  function gorevDuzenle() {
    if (!seciliGorev) return;
    const atananlar = gorevinAtananlari(seciliGorev);
    setForm({
      baslik: seciliGorev.baslik || '',
      aciklama: seciliGorev.aciklama || '',
      atananlar: atananlar.length ? atananlar : [ilkAtanacak],
      atanan: seciliGorev.atanan || ilkAtanacak,
      durum: seciliGorev.durum || 'Bekliyor',
      oncelik: seciliGorev.oncelik || seciliGorev.tur || 'Minor',
      tur: seciliGorev.tur || seciliGorev.oncelik || 'Minor',
      baslangic: seciliGorev.baslangic || '',
      deadline: seciliGorev.deadline || '',
      tamamlanma: seciliGorev.tamamlanma || 0,
      bolumId: seciliGorev.bolumId || 1
    });
    setDuzenleAcik(true);
  }

  function atananYazisi(gorev) {
    return gorevinAtananlari(gorev).map(id => kullaniciAdi(id)).join(', ');
  }

  function dosyaEkle(gorevId, secilenDosyalar) {
    const files = Array.from(secilenDosyalar);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const yeniDosya = {
          id: Date.now() + Math.random(),
          ad: file.name,
          tip: file.type,
          boyut: file.size,
          data: reader.result
        };
        setGorevler(prev =>
          prev.map(g => g.id === gorevId ? { ...g, dosyalar: [...(g.dosyalar || []), yeniDosya] } : g)
        );
        setSeciliGorev(prev =>
          prev?.id === gorevId ? { ...prev, dosyalar: [...(prev.dosyalar || []), yeniDosya] } : prev
        );
      };
      reader.readAsDataURL(file);
    });
  }

  function dosyaAc(dosya) {
    const yeniPencere = window.open();
    if (yeniPencere) {
      yeniPencere.document.write(
        `<iframe src="${dosya.data}" style="width:100%;height:100vh;border:none;"></iframe>`
      );
    }
  }

  function dosyaIndir(dosya) {
    const link = document.createElement('a');
    link.href = dosya.data;
    link.download = dosya.ad;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function dosyaSil(gorevId, dosyaId) {
    setGorevler(prev =>
      prev.map(g => g.id === gorevId ? { ...g, dosyalar: (g.dosyalar || []).filter(d => d.id !== dosyaId) } : g)
    );
    setSeciliGorev(prev =>
      prev?.id === gorevId ? { ...prev, dosyalar: (prev.dosyalar || []).filter(d => d.id !== dosyaId) } : prev
    );
  }

  const mainPadding = isMobile ? '90px 14px 100px' : '28px';

  return (
    <div style={{ minHeight: '100vh', background: '#0F1117', color: 'white', display: 'flex' }}>

      {/* Mobil: overlay backdrop */}
      {isMobile && mobilMenuAcik && (
        <div
          onClick={() => setMobilMenuAcik(false)}
          style={{
            position: 'fixed', inset: 0, background: '#00000088',
            zIndex: 998
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: 250,
          background: '#141620',
          padding: 18,
          boxSizing: 'border-box',
          ...(isMobile ? {
            position: 'fixed',
            left: mobilMenuAcik ? 0 : -260,
            top: 0,
            bottom: 0,
            zIndex: 999,
            transition: 'left 0.28s cubic-bezier(.4,0,.2,1)',
            overflowY: 'auto'
          } : {
            position: 'relative'
          })
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ color: '#FF6B35', fontWeight: 900, letterSpacing: 4, marginBottom: 28, fontSize: 15 }}>
          İŞ TAKİP
        </div>

        {menuSayfalari.map(s => (
          <button
            key={s}
            onClick={() => {
              setSayfa(s);
              setMobilMenuAcik(false);
              setFormAcik(false);
              setDuzenleAcik(false);
              setSeciliGorev(null);
            }}
            style={{
              width: '100%',
              padding: '13px 15px',
              borderRadius: 14,
              border: 'none',
              color: 'white',
              textAlign: 'left',
              marginBottom: 6,
              fontWeight: 800,
              cursor: 'pointer',
              fontSize: 15,
              background: sayfa === s ? '#FF6B35' : 'transparent'
            }}
          >
            {s}
          </button>
        ))}

        <div style={{
          marginTop: 32,
          background: '#1C1F2E',
          borderRadius: 18,
          padding: 16
        }}>
          <b style={{ fontSize: 14 }}>{kisiAdi(kul)}</b>
          <div style={{ color: '#64748b', marginTop: 4, fontSize: 13 }}>{kul.rol}</div>
          <button
            onClick={onCikis}
            style={{
              width: '100%', marginTop: 12, padding: 10, borderRadius: 12,
              border: 'none', background: '#FF6B35', color: 'white',
              fontWeight: 800, cursor: 'pointer', fontSize: 14
            }}
          >
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Mobil üst bar */}
      {isMobile && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: 72,
          background: '#0F1117', borderBottom: '1px solid #252836',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', boxSizing: 'border-box', zIndex: 997
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              border: '2.5px solid #FF6B35', color: '#FF6B35',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 14, background: '#1a1520'
            }}>
              {kul.avatar || kisiAdi(kul).split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 900, fontSize: 14 }}>{kisiAdi(kul)}</div>
              <div style={{ color: '#64748b', fontSize: 11 }}>👑 {kul.rol}</div>
            </div>
          </div>

          <button
            onClick={e => { e.stopPropagation(); setMobilMenuAcik(v => !v); }}
            style={{
              width: 44, height: 44, borderRadius: 14, border: 'none',
              background: '#1C1F2E', color: '#cbd5e1', fontSize: 22,
              fontWeight: 900, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}
          >
            {mobilMenuAcik ? '✕' : '☰'}
          </button>
        </div>
      )}

      {/* Ana içerik */}
      <main
        onClick={() => { setSeciliGorev(null); }}
        style={{
          flex: 1,
          padding: mainPadding,
          overflowY: 'auto',
          overflowX: 'hidden',
          minWidth: 0,
          // Detay paneli açıkken mobilde kaydırmayı engelle
          ...(isMobile && seciliGorev ? { overflow: 'hidden' } : {})
        }}
      >
        {/* ───── DASHBOARD ───── */}
        {sayfa === 'Dashboard' && (
          <>
            <div style={{ marginBottom: 24 }}>
              <div style={{ color: '#64748b', fontSize: isMobile ? 13 : 16 }}>
                {new Date().toLocaleDateString('tr-TR', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                })}
              </div>
              <h1 style={{ fontSize: isMobile ? 26 : 40, margin: '10px 0 0', lineHeight: 1.2 }}>
                Merhaba, {kisiAdi(kul).split(' ')[0]} 👋
              </h1>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 12, marginBottom: 8
            }}>
              <OzetKart baslik="Toplam" deger={toplam} isMobile={isMobile} />
              <OzetKart baslik="Bitti" deger={tamam} isMobile={isMobile} />
              <OzetKart baslik="Devam" deger={devam} isMobile={isMobile} />
              <OzetKart
                baslik="Geciken"
                isMobile={isMobile}
                deger={gorunenGorevler.filter(g => {
                  if (!g.deadline) return false;
                  const bugun = new Date(); const bitis = new Date(g.deadline);
                  bugun.setHours(0,0,0,0); bitis.setHours(0,0,0,0);
                  return bitis < bugun && g.durum !== 'Tamamlandı';
                }).length}
              />
            </div>

            <h2 style={{ marginTop: 28, color: '#FF6B35', fontSize: isMobile ? 15 : 20 }}>
              ⚠ ACİL DEADLİNELER
            </h2>
            {gorunenGorevler
              .filter(g => g.deadline && g.durum !== 'Tamamlandı')
              .slice(0, 3)
              .map(g => (
                <GorevKart
                  key={g.id} g={g}
                  secili={seciliGorev?.id === g.id}
                  kisi={atananYazisi(g)}
                  gunFarki={gunFarki}
                  isMobile={isMobile}
                  onClick={e => { e.stopPropagation(); setSeciliGorev(g); }}
                />
              ))}

            <h2 style={{ marginTop: 24, color: '#4ECDC4', fontSize: isMobile ? 15 : 20 }}>
              ◎ DEVAM EDEN
            </h2>
            {gorunenGorevler
              .filter(g => g.durum === 'Devam Ediyor')
              .map(g => (
                <GorevKart
                  key={g.id} g={g}
                  secili={seciliGorev?.id === g.id}
                  kisi={atananYazisi(g)}
                  gunFarki={gunFarki}
                  isMobile={isMobile}
                  onClick={e => { e.stopPropagation(); setSeciliGorev(g); }}
                />
              ))}

            {yoneticiMi && (
              <button
                onClick={e => { e.stopPropagation(); setFormAcik(true); }}
                style={{
                  position: 'fixed',
                  right: isMobile ? 20 : 35,
                  bottom: isMobile ? 24 : 35,
                  width: isMobile ? 60 : 72,
                  height: isMobile ? 60 : 72,
                  borderRadius: '50%', border: 'none',
                  background: '#FF6B35', color: 'white',
                  fontSize: isMobile ? 36 : 46, fontWeight: 300,
                  boxShadow: '0 12px 40px #FF6B3566', cursor: 'pointer',
                  zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                +
              </button>
            )}
          </>
        )}

        {/* ───── GÖREVLER ───── */}
        {sayfa === 'Görevler' && (
          <>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'center',
              flexDirection: isMobile ? 'column' : 'row',
              gap: 12, marginBottom: 8
            }}>
              <div>
                <h1 style={{ fontSize: isMobile ? 26 : 38, margin: 0 }}>Görevler</h1>
                <p style={{ color: '#64748b', margin: '6px 0 0', fontSize: isMobile ? 13 : 15 }}>
                  {yoneticiMi ? 'Tüm görevleri yönet' : 'Görevlerini takip et'}
                </p>
              </div>
              {yoneticiMi && (
                <button
                  onClick={e => { e.stopPropagation(); setFormAcik(true); }}
                  style={{
                    padding: isMobile ? '12px 18px' : '14px 22px',
                    borderRadius: 16, border: 'none',
                    background: '#FF6B35', color: 'white',
                    fontWeight: 900, cursor: 'pointer',
                    fontSize: isMobile ? 14 : 15,
                    alignSelf: isMobile ? 'flex-end' : 'auto'
                  }}
                >
                  + Yeni Görev
                </button>
              )}
            </div>

            {gorunenGorevler.length === 0 && (
              <div style={{ background: '#1C1F2E', padding: 24, borderRadius: 18, color: '#64748b', marginTop: 16 }}>
                Henüz görev yok
              </div>
            )}

            {gorunenGorevler.map(g => (
              <GorevKart
                key={g.id} g={g}
                secili={seciliGorev?.id === g.id}
                kisi={atananYazisi(g)}
                gunFarki={gunFarki}
                isMobile={isMobile}
                onClick={e => { e.stopPropagation(); setSeciliGorev(g); }}
              />
            ))}
          </>
        )}

        {sayfa === 'Gantt' && ganttGorebilir && (
          <GanttSayfa gorevler={gorunenGorevler} setSeciliGorev={setSeciliGorev} />
        )}

        {sayfa === 'Ekip' && ekipGorebilir && (
          <div onClick={e => e.stopPropagation()}>
            <EkipSayfa
              aktifKullanici={kul}
              kullanicilar={kullanicilar}
              setKullanicilar={setKullanicilar}
              gorevler={gorevler}
            />
          </div>
        )}

        {sayfa === 'Raporlar' && raporlarGorebilir && (
          <div onClick={e => e.stopPropagation()}>
            <RaporlarSayfa
              gorevler={gorevler}
              bolumler={bolumler}
              kullanicilar={kullanicilar}
            />
          </div>
        )}

        {sayfa === 'Ayarlar' && ayarlarGorebilir && (
          <div onClick={e => e.stopPropagation()}>
            <AyarlarSayfa
              kullanicilar={kullanicilar}
              setKullanicilar={setKullanicilar}
              bolumler={bolumler}
              setBolumler={setBolumler}
            />
          </div>
        )}
      </main>

      {/* ───── DETAY PANELİ ───── */}
      {seciliGorev && (
        <>
          {/* Mobil: tam ekran overlay */}
          {isMobile && (
            <div
              style={{
                position: 'fixed', inset: 0, background: '#00000077', zIndex: 149
              }}
              onClick={() => setSeciliGorev(null)}
            />
          )}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'fixed',
              zIndex: 150,
              background: '#141620',
              boxShadow: '0 20px 80px #000',
              overflowY: 'auto',
              ...(isMobile ? {
                left: 0, right: 0, bottom: 0,
                top: 'auto',
                maxHeight: '88vh',
                borderRadius: '24px 24px 0 0',
                padding: '20px 18px 32px'
              } : {
                right: 30, bottom: 20,
                width: 430,
                maxHeight: '85vh',
                borderRadius: 28,
                padding: 28
              })
            }}
          >
            {/* Mobil'de kapatma çubuğu */}
            {isMobile && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ width: 40, height: 4, background: '#2d3250', borderRadius: 4, margin: '0 auto' }} />
                <button
                  onClick={() => setSeciliGorev(null)}
                  style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 22, cursor: 'pointer', padding: 4 }}
                >
                  ✕
                </button>
              </div>
            )}

            <h2 style={{ fontSize: isMobile ? 20 : 24, marginTop: 0 }}>{seciliGorev.baslik}</h2>

            <p style={{ background: '#252836', color: '#cbd5e1', padding: 14, borderRadius: 14, fontSize: 14 }}>
              {seciliGorev.aciklama || 'Açıklama yok'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
              <Info baslik="Atanan" deger={atananYazisi(seciliGorev)} />
              <Info baslik="Başlangıç" deger={tarihKisa(seciliGorev.baslangic)} />
              <Info baslik="Deadline" deger={tarihKisa(seciliGorev.deadline)} alt={gunFarki(seciliGorev.deadline)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginTop: 16 }}>
              {DURUMLAR.map(d => (
                <button
                  key={d}
                  onClick={() => gorevGuncelle(seciliGorev.id, { durum: d })}
                  style={{
                    padding: isMobile ? 12 : 14,
                    borderRadius: 14,
                    background: '#252836',
                    fontWeight: 900,
                    cursor: 'pointer',
                    fontSize: isMobile ? 12 : 14,
                    border: seciliGorev.durum === d ? '2px solid #4ECDC4' : '2px solid transparent',
                    color: d === 'İptal' ? '#ef4444' : d === 'Tamamlandı' ? '#96CEB4' : d === 'Devam Ediyor' ? '#4ECDC4' : '#cbd5e1'
                  }}
                >
                  {d}
                </button>
              ))}
            </div>

            <label style={{ display: 'block', color: '#64748b', fontWeight: 900, marginTop: 16, marginBottom: 6, fontSize: 13 }}>
              Tamamlanma: %{seciliGorev.tamamlanma || 0}
            </label>
            <input
              type="range" min="0" max="100"
              value={seciliGorev.tamamlanma || 0}
              onChange={e => gorevGuncelle(seciliGorev.id, { tamamlanma: Number(e.target.value) })}
              style={{ width: '100%' }}
            />

            <label style={{ display: 'block', color: '#64748b', fontWeight: 900, marginTop: 14, marginBottom: 6, fontSize: 13 }}>
              📎 Dosyalar ({(seciliGorev.dosyalar || []).length})
            </label>

            {(seciliGorev.dosyalar || []).length === 0 && (
              <div style={{ color: '#64748b', marginBottom: 10, fontSize: 13 }}>Henüz dosya yok</div>
            )}

            {(seciliGorev.dosyalar || []).map(d => (
              <div key={d.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: 8, background: '#252836', padding: '10px 12px',
                borderRadius: 12, marginBottom: 8
              }}>
                <div style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.ad}</div>
                  <div style={{ color: '#64748b', fontSize: 11 }}>{(d.boyut / 1024).toFixed(1)} KB</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {['Aç', 'İndir', 'Sil'].map((label, i) => (
                    <button
                      key={label}
                      onClick={() => i === 0 ? dosyaAc(d) : i === 1 ? dosyaIndir(d) : dosyaSil(seciliGorev.id, d.id)}
                      style={{
                        padding: '6px 8px', borderRadius: 8, border: 'none',
                        background: i === 0 ? '#4ECDC4' : i === 1 ? '#64748b' : '#ef4444',
                        color: i === 0 ? '#0F1117' : 'white',
                        fontWeight: 800, cursor: 'pointer', fontSize: 11
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <input id="dosyaInput" type="file" multiple style={{ display: 'none' }}
              onChange={e => dosyaEkle(seciliGorev.id, e.target.files)} />
            <button
              onClick={() => document.getElementById('dosyaInput').click()}
              style={{
                width: '100%', padding: 14, borderRadius: 14,
                border: '2px dashed #2d3250', background: '#252836',
                color: '#cbd5e1', fontWeight: 900, marginTop: 8,
                marginBottom: 14, cursor: 'pointer', fontSize: 14
              }}
            >
              📎 Dosya Ekle
            </button>

            {yoneticiMi && (
              <>
                <button
                  onClick={gorevDuzenle}
                  style={{
                    width: '100%', padding: 13, borderRadius: 14, border: 'none',
                    background: '#252836', color: 'white', marginTop: 8,
                    fontWeight: 900, fontSize: 14, cursor: 'pointer'
                  }}
                >
                  ✏ Görevi Düzenle
                </button>
                <button
                  onClick={() => gorevSil(seciliGorev.id)}
                  style={{
                    width: '100%', padding: 13, borderRadius: 14, border: 'none',
                    background: '#ef4444', color: 'white', marginTop: 10,
                    fontWeight: 900, cursor: 'pointer', fontSize: 14
                  }}
                >
                  Görevi Sil
                </button>
              </>
            )}
          </div>
        </>
      )}

      {/* ───── FORM MODALİ ───── */}
      {(formAcik || duzenleAcik) && (
        <div
          style={{
            position: 'fixed', inset: 0, background: '#00000099',
            display: 'flex',
            alignItems: isMobile ? 'flex-end' : 'center',
            justifyContent: 'center',
            padding: isMobile ? 0 : 20, zIndex: 200
          }}
          onClick={() => { setFormAcik(false); setDuzenleAcik(false); }}
        >
          <div
            style={{
              background: '#141620',
              width: isMobile ? '100%' : 680,
              maxWidth: '100%',
              /* Mobilde ekranın tamamını kullan, masaüstünde max %90 */
              height: isMobile ? '100dvh' : 'auto',
              maxHeight: isMobile ? '100dvh' : '90vh',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: isMobile ? 0 : 28,
              overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Mobil üst bar: başlık + kapat butonu */}
            {isMobile ? (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 18px 12px',
                borderBottom: '1px solid #252836',
                flexShrink: 0
              }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: 'white' }}>
                  {duzenleAcik ? '✏ Görevi Düzenle' : 'Yeni Görev Ekle'}
                </h2>
                <button
                  onClick={() => { setFormAcik(false); setDuzenleAcik(false); }}
                  style={{
                    background: '#252836', border: 'none', color: '#94a3b8',
                    borderRadius: 10, width: 36, height: 36,
                    fontSize: 18, cursor: 'pointer', flexShrink: 0
                  }}
                >✕</button>
              </div>
            ) : (
              <h2 style={{ margin: '30px 30px 0', fontSize: 22, fontWeight: 900, color: 'white', flexShrink: 0 }}>
                {duzenleAcik ? '✏ Görevi Düzenle' : 'Yeni Görev Ekle'}
              </h2>
            )}

            {/* Kaydırılabilir form alanı */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              padding: isMobile ? '14px 18px' : '16px 30px 20px'
            }}>
              <FormIcerigi
                form={form}
                setForm={setForm}
                kullanicilar={kullanicilar}
                bolumler={bolumler}
                yoneticiRolMu={yoneticiRolMu}
                kisiAdi={kisiAdi}
                isMobile={isMobile}
                showTamamlanma={duzenleAcik}
              />
            </div>

            {/* Sabit alt: Kaydet butonu */}
            <div style={{
              padding: isMobile ? '12px 18px 28px' : '12px 30px 24px',
              borderTop: '1px solid #252836',
              flexShrink: 0,
              background: '#141620'
            }}>
              <button
                onClick={() => {
                  if (duzenleAcik) {
                    if (!form.atananlar || form.atananlar.length === 0) {
                      alert('En az bir kişi seçmelisin'); return;
                    }
                    const guncelForm = {
                      ...form,
                      atananlar: form.atananlar.map(Number),
                      atanan: Number(form.atananlar[0]),
                      bolumId: Number(form.bolumId),
                      tamamlanma: Number(form.tamamlanma),
                      tur: form.oncelik
                    };
                    setGorevler(gorevler.map(g => g.id === seciliGorev.id ? { ...g, ...guncelForm } : g));
                    setSeciliGorev({ ...seciliGorev, ...guncelForm });
                    setDuzenleAcik(false);
                  } else {
                    gorevEkle();
                  }
                }}
                style={{
                  width: '100%', padding: isMobile ? 16 : 18,
                  borderRadius: 16, border: 'none', background: '#FF6B35',
                  color: 'white', fontWeight: 900,
                  fontSize: isMobile ? 16 : 18, cursor: 'pointer'
                }}
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Form alanlarını tekrar kullanılabilir bileşene çektik
function FormIcerigi({ form, setForm, kullanicilar, bolumler, yoneticiRolMu, kisiAdi, isMobile, showTamamlanma }) {
  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: isMobile ? 13 : 16, borderRadius: 12,
    border: '1px solid #2d3250', background: '#252836',
    color: 'white', fontSize: isMobile ? 15 : 16
  };
  const labelStyle = {
    display: 'block', color: '#64748b', fontWeight: 900,
    marginTop: 14, marginBottom: 6, fontSize: 13
  };

  return (
    <>
      <label style={labelStyle}>Başlık *</label>
      <input style={inputStyle} value={form.baslik}
        onChange={e => setForm({ ...form, baslik: e.target.value })} />

      <label style={labelStyle}>Açıklama</label>
      <textarea style={{ ...inputStyle, height: 90, resize: 'vertical' }}
        value={form.aciklama}
        onChange={e => setForm({ ...form, aciklama: e.target.value })} />

      <label style={labelStyle}>Atanan Kişiler</label>
      <select
        multiple
        style={{ ...inputStyle, height: isMobile ? 100 : 120 }}
        value={form.atananlar}
        onChange={e => {
          const secilenler = Array.from(e.target.selectedOptions).map(o => Number(o.value));
          setForm({ ...form, atananlar: secilenler, atanan: secilenler[0] || '' });
        }}
      >
        {kullanicilar.filter(k => !yoneticiRolMu(k.rol)).map(k => (
          <option key={k.id} value={k.id}>{kisiAdi(k)}</option>
        ))}
      </select>

      <label style={labelStyle}>Bölüm</label>
      <select style={inputStyle} value={form.bolumId}
        onChange={e => setForm({ ...form, bolumId: Number(e.target.value) })}>
        {bolumler.map(b => <option key={b.id} value={b.id}>{b.ad}</option>)}
      </select>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Öncelik</label>
          <select style={inputStyle} value={form.oncelik}
            onChange={e => setForm({ ...form, oncelik: e.target.value, tur: e.target.value })}>
            <option>Minor</option>
            <option>Major</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Durum</label>
          <select style={inputStyle} value={form.durum}
            onChange={e => setForm({ ...form, durum: e.target.value })}>
            <option>Bekliyor</option>
            <option>Devam Ediyor</option>
            <option>Tamamlandı</option>
            <option>İptal</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Başlangıç</label>
          <input type="date" style={inputStyle} value={form.baslangic}
            onChange={e => setForm({ ...form, baslangic: e.target.value })} />
        </div>
        <div>
          <label style={labelStyle}>Bitiş / Deadline</label>
          <input type="date" style={inputStyle} value={form.deadline}
            onChange={e => setForm({ ...form, deadline: e.target.value })} />
        </div>
      </div>

      {showTamamlanma && (
        <>
          <label style={labelStyle}>Tamamlanma %</label>
          <input type="number" min="0" max="100" style={inputStyle}
            value={form.tamamlanma}
            onChange={e => setForm({ ...form, tamamlanma: Number(e.target.value) })} />
        </>
      )}
    </>
  );
}

function OzetKart({ baslik, deger, isMobile }) {
  return (
    <div style={{ background: '#1C1F2E', padding: isMobile ? 16 : 22, borderRadius: 18 }}>
      <div style={{ color: '#64748b', fontSize: isMobile ? 12 : 14 }}>{baslik}</div>
      <div style={{ fontSize: isMobile ? 30 : 38, fontWeight: 900 }}>{deger}</div>
    </div>
  );
}

function GorevKart({ g, secili, kisi, gunFarki, onClick, isMobile }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#1C1F2E',
        padding: isMobile ? 16 : 22,
        borderRadius: 18,
        marginTop: 12,
        cursor: 'pointer',
        position: 'relative',
        border: secili ? '2px solid #FF6B35' : '2px solid transparent'
      }}
    >
      {/* Öncelik badge - sağ üst */}
      <span style={{
        position: 'absolute', right: 14, top: 14,
        background: '#FF6B3522', color: '#FF6B35',
        padding: '5px 10px', borderRadius: 10,
        fontWeight: 900, fontSize: 11
      }}>
        {g.oncelik || g.tur}
      </span>

      <div style={{ fontSize: isMobile ? 16 : 20, fontWeight: 900, paddingRight: 70 }}>{g.baslik}</div>
      <div style={{ color: '#64748b', marginTop: 6, fontSize: 13 }}>{kisi}</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
        <span style={{
          background: '#4ECDC422', color: '#4ECDC4',
          padding: '5px 10px', borderRadius: 8, fontWeight: 800, fontSize: 12
        }}>
          {g.durum}
        </span>

        <div style={{ height: 5, background: '#252836', borderRadius: 5, flex: 1, minWidth: 40 }}>
          <div style={{ height: 5, background: '#FF6B35', borderRadius: 5, width: `${g.tamamlanma || 0}%` }} />
        </div>

        <span style={{ color: '#94a3b8', fontSize: 12, whiteSpace: 'nowrap' }}>
          {gunFarki(g.deadline)}
        </span>
      </div>
    </div>
  );
}

function Info({ baslik, deger, alt }) {
  return (
    <div style={{ background: '#252836', padding: 14, borderRadius: 14 }}>
      <div style={{ color: '#64748b', fontSize: 11, fontWeight: 800 }}>{baslik}</div>
      <div style={{ fontSize: 15, fontWeight: 800, marginTop: 4 }}>{deger}</div>
      {alt && <div style={{ color: '#64748b', marginTop: 4, fontSize: 12 }}>{alt}</div>}
    </div>
  );
}
