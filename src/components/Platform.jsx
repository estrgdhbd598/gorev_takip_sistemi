import { useEffect, useState } from 'react';
import GanttSayfa from './pages/GanttSayfa';
import { EkipSayfa } from './pages/EkipSayfa.jsx';
import RaporlarSayfa from './pages/RaporlarSayfa.jsx';
import { AyarlarSayfa } from './pages/AyarlarSayfa.jsx';

const DURUMLAR = ['Bekliyor', 'Devam Ediyor', 'Tamamlandı', 'İptal'];

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

  const isMobile = window.innerWidth <= 768;

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

    if (ziyaretEdilenler.has(id)) {
        return [];
    }

    ziyaretEdilenler.add(id);

    const direktAltlar = kullanicilar.filter(
        k => Number(k.ustKisiId) === id && Number(k.id) !== id
    );

    let tumAltlar = [];

    direktAltlar.forEach(alt => {
        const altId = Number(alt.id);

        if (!ziyaretEdilenler.has(altId)) {
        tumAltlar.push(altId);
        tumAltlar = [
            ...tumAltlar,
            ...altKisiIdleri(altId, ziyaretEdilenler)
        ];
        }
    });

    return tumAltlar;
  }

  function gorevinAtananlari(gorev) {
    if (Array.isArray(gorev.atananlar)) {
      return gorev.atananlar.map(Number);
    }

    if (gorev.atanan) {
      return [Number(gorev.atanan)];
    }

    return [];
  }

  const gorulecekKisiIdleri = [
    Number(kul.id),
    ...altKisiIdleri(kul.id)
  ];

  const gorunenGorevler = yoneticiMi
    ? gorevler
    : gorevler.filter(g =>
        gorevinAtananlari(g).some(id =>
          gorulecekKisiIdleri.includes(Number(id))
        )
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
    if (!form.baslik.trim()) {
      alert('Başlık zorunlu');
      return;
    }

    if (!form.atananlar || form.atananlar.length === 0) {
      alert('En az bir kişi seçmelisin');
      return;
    }

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
    return gorevinAtananlari(gorev)
      .map(id => kullaniciAdi(id))
      .join(', ');
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
          prev.map(g =>
            g.id === gorevId
              ? { ...g, dosyalar: [...(g.dosyalar || []), yeniDosya] }
              : g
          )
        );

        setSeciliGorev(prev =>
          prev?.id === gorevId
            ? { ...prev, dosyalar: [...(prev.dosyalar || []), yeniDosya] }
            : prev
        );
      };

      reader.readAsDataURL(file);
    });
  }

  function dosyaAc(dosya) {
    const yeniPencere = window.open();

    if (yeniPencere) {
      yeniPencere.document.write(`
        <iframe 
          src="${dosya.data}" 
          style="width:100%;height:100vh;border:none;"
        ></iframe>
      `);
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
      prev.map(g =>
        g.id === gorevId
          ? { ...g, dosyalar: (g.dosyalar || []).filter(d => d.id !== dosyaId) }
          : g
      )
    );

    setSeciliGorev(prev =>
      prev?.id === gorevId
        ? { ...prev, dosyalar: (prev.dosyalar || []).filter(d => d.id !== dosyaId) }
        : prev
    );
  }

  return (
    <div style={styles.app}>
      <aside
        style={{
          ...styles.menu,
          ...(isMobile
            ? {
                position: 'fixed',
                left: mobilMenuAcik ? 0 : '-260px',
                top: 0,
                bottom: 0,
                zIndex: 999,
                transition: '0.3s'
              }
            : {})
        }}
      >
        <div style={styles.logo}>İŞ TAKİP</div>

        {menuSayfalari.map(s => (
          <button
            key={s}
            onClick={() => setSayfa(s)}
            style={{
              ...styles.menuBtn,
              background: sayfa === s ? '#FF6B35' : 'transparent'
            }}
          >
            {s}
          </button>
        ))}

        <div style={styles.kullaniciKutu}>
          <b>{kisiAdi(kul)}</b>
          <div style={{ color: '#64748b', marginTop: 4 }}>{kul.rol}</div>
          <button onClick={onCikis} style={styles.cikisBtn}>
            Çıkış Yap
          </button>
        </div>
      </aside>

      <main
        onClick={() => setSeciliGorev(null)}
        style={{
          ...styles.main,
          ...(isMobile
            ? {
                padding: 16,
                marginLeft: 0,
                width: '100%',
                overflowX: 'hidden'
              }
            : {})
        }}
      >

        {isMobile && (
          <button
            onClick={e => {
              e.stopPropagation();
              setMobilMenuAcik(!mobilMenuAcik);
            }}
            style={styles.mobileMenuBtn}
          >
            ☰
          </button>
        )}

        {sayfa === 'Dashboard' && (
          <>
            <div style={{ marginBottom: 30 }}>
              <div style={{ color: '#64748b', fontSize: 18 }}>
                {new Date().toLocaleDateString('tr-TR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>

              <h1 style={{ fontSize: 42, margin: '12px 0 0' }}>
                Merhaba, {kisiAdi(kul).split(' ')[0]} 👋
              </h1>
            </div>

            <div style={styles.dashboardOzet}>
              <OzetKart baslik="Toplam" deger={toplam} />
              <OzetKart baslik="Bitti" deger={tamam} />
              <OzetKart baslik="Devam" deger={devam} />
              <OzetKart
                baslik="Geciken"
                deger={
                  gorunenGorevler.filter(g => {
                    if (!g.deadline) return false;

                    const bugun = new Date();
                    const bitis = new Date(g.deadline);

                    bugun.setHours(0, 0, 0, 0);
                    bitis.setHours(0, 0, 0, 0);

                    return bitis < bugun && g.durum !== 'Tamamlandı';
                  }).length
                }
              />
            </div>

            <h2 style={{ marginTop: 45, color: '#FF6B35' }}>
              ⚠ ACİL DEADLİNELER
            </h2>

            {gorunenGorevler
              .filter(g => g.deadline && g.durum !== 'Tamamlandı')
              .slice(0, 3)
              .map(g => (
                <GorevKart
                  key={g.id}
                  g={g}
                  secili={seciliGorev?.id === g.id}
                  kisi={atananYazisi(g)}
                  gunFarki={gunFarki}
                  onClick={e => {
                    e.stopPropagation();
                    setSeciliGorev(g);
                  }}
                />
              ))}

            <h2 style={{ marginTop: 35, color: '#4ECDC4' }}>
              ◎ DEVAM EDEN
            </h2>

            {gorunenGorevler
              .filter(g => g.durum === 'Devam Ediyor')
              .map(g => (
                <GorevKart
                  key={g.id}
                  g={g}
                  secili={seciliGorev?.id === g.id}
                  kisi={atananYazisi(g)}
                  gunFarki={gunFarki}
                  onClick={e => {
                    e.stopPropagation();
                    setSeciliGorev(g);
                  }}
                />
              ))}

            {yoneticiMi && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  setFormAcik(true);
                }}
                style={styles.floatingBtn}
              >
                +
              </button>
            )}
          </>
        )}

        {sayfa === 'Görevler' && (
          <>
            <div style={styles.sayfaUst}>
              <div>
                <h1 style={styles.baslik}>Görevler</h1>
                <p style={styles.altYazi}>
                  {yoneticiMi
                    ? 'Tüm görevleri yönet'
                    : 'Kendi görevlerini ve altındaki kişilerin görevlerini takip et'}
                </p>
              </div>

              {yoneticiMi && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setFormAcik(true);
                  }}
                  style={styles.ekleBtn}
                >
                  + Yeni Görev
                </button>
              )}
            </div>

            {gorunenGorevler.length === 0 && (
              <div style={styles.bosKutu}>Henüz görev yok</div>
            )}

            {gorunenGorevler.map(g => (
              <GorevKart
                key={g.id}
                g={g}
                secili={seciliGorev?.id === g.id}
                kisi={atananYazisi(g)}
                gunFarki={gunFarki}
                onClick={e => {
                  e.stopPropagation();
                  setSeciliGorev(g);
                }}
              />
            ))}
          </>
        )}

        {sayfa === 'Gantt' && ganttGorebilir && (
          <GanttSayfa
            gorevler={gorunenGorevler}
            setSeciliGorev={setSeciliGorev}
          />
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

      {seciliGorev && (
        <div onClick={e => e.stopPropagation()} style={styles.detayPanel}>
          <h2>{seciliGorev.baslik}</h2>

          <p style={styles.aciklama}>
            {seciliGorev.aciklama || 'Açıklama yok'}
          </p>

          <div style={styles.infoGrid}>
            <Info baslik="Atanan" deger={atananYazisi(seciliGorev)} />
            <Info baslik="Başlangıç" deger={tarihKisa(seciliGorev.baslangic)} />
            <Info
              baslik="Deadline"
              deger={tarihKisa(seciliGorev.deadline)}
              alt={gunFarki(seciliGorev.deadline)}
            />
          </div>

          <div style={styles.durumGrid}>
            {DURUMLAR.map(d => (
              <button
                key={d}
                onClick={() => gorevGuncelle(seciliGorev.id, { durum: d })}
                style={{
                  ...styles.durumBtn,
                  border:
                    seciliGorev.durum === d
                      ? '2px solid #4ECDC4'
                      : '2px solid transparent',
                  color:
                    d === 'İptal'
                      ? '#ef4444'
                      : d === 'Tamamlandı'
                        ? '#96CEB4'
                        : d === 'Devam Ediyor'
                          ? '#4ECDC4'
                          : '#cbd5e1'
                }}
              >
                {d}
              </button>
            ))}
          </div>

          <label style={styles.label}>
            Tamamlanma: %{seciliGorev.tamamlanma || 0}
          </label>

          <input
            type="range"
            min="0"
            max="100"
            value={seciliGorev.tamamlanma || 0}
            onChange={e =>
              gorevGuncelle(seciliGorev.id, {
                tamamlanma: Number(e.target.value)
              })
            }
            style={{ width: '100%' }}
          />

          <label style={styles.label}>
            📎 Dosyalar ({(seciliGorev.dosyalar || []).length})
          </label>

          {(seciliGorev.dosyalar || []).length === 0 && (
            <div style={{ color: '#64748b', marginBottom: 12 }}>
              Henüz dosya yok
            </div>
          )}

          {(seciliGorev.dosyalar || []).map(d => (
            <div key={d.id} style={styles.dosyaSatir}>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 800 }}>{d.ad}</div>
                <div style={{ color: '#64748b', fontSize: 12 }}>
                  {(d.boyut / 1024).toFixed(1)} KB
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => dosyaAc(d)} style={styles.dosyaAcBtn}>
                  Aç
                </button>

                <button onClick={() => dosyaIndir(d)} style={styles.dosyaIndirBtn}>
                  İndir
                </button>

                <button
                  onClick={() => dosyaSil(seciliGorev.id, d.id)}
                  style={styles.dosyaSilBtn}
                >
                  Sil
                </button>
              </div>
            </div>
          ))}

          <input
            id="dosyaInput"
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={e => dosyaEkle(seciliGorev.id, e.target.files)}
          />

          <button
            onClick={() => document.getElementById('dosyaInput').click()}
            style={styles.dosyaEkleBtn}
          >
            📎 Dosya Ekle
          </button>

          {yoneticiMi && (
            <>
              <button onClick={gorevDuzenle} style={styles.duzenleBtn}>
                ✏ Görevi Düzenle
              </button>

              <button onClick={() => gorevSil(seciliGorev.id)} style={styles.silBtn}>
                Görevi Sil
              </button>
            </>
          )}
        </div>
      )}

      {formAcik && (
        <div style={styles.modalBg} onClick={() => setFormAcik(false)}>
          <div style={styles.formPanel} onClick={e => e.stopPropagation()}>
            <h2>Yeni Görev Ekle</h2>

            <label style={styles.label}>Başlık *</label>
            <input
              style={styles.input}
              value={form.baslik}
              onChange={e => setForm({ ...form, baslik: e.target.value })}
            />

            <label style={styles.label}>Açıklama</label>
            <textarea
              style={styles.textarea}
              value={form.aciklama}
              onChange={e => setForm({ ...form, aciklama: e.target.value })}
            />

            <div style={styles.formGrid}>
              <div>
                <label style={styles.label}>Atanan Kişiler</label>
                <select
                  multiple
                  style={{ ...styles.input, height: 145 }}
                  value={form.atananlar}
                  onChange={e => {
                    const secilenler = Array.from(e.target.selectedOptions).map(o => Number(o.value));
                    setForm({
                      ...form,
                      atananlar: secilenler,
                      atanan: secilenler[0] || ''
                    });
                  }}
                >
                  {kullanicilar.filter(k => !yoneticiRolMu(k.rol)).map(k => (
                    <option key={k.id} value={k.id}>
                      {kisiAdi(k)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={styles.label}>Bölüm</label>
                <select
                  style={styles.input}
                  value={form.bolumId}
                  onChange={e => setForm({ ...form, bolumId: Number(e.target.value) })}
                >
                  {bolumler.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.ad}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={styles.label}>Öncelik</label>
                <select
                  style={styles.input}
                  value={form.oncelik}
                  onChange={e =>
                    setForm({
                      ...form,
                      oncelik: e.target.value,
                      tur: e.target.value
                    })
                  }
                >
                  <option>Minor</option>
                  <option>Major</option>
                </select>
              </div>

              <div>
                <label style={styles.label}>Durum</label>
                <select
                  style={styles.input}
                  value={form.durum}
                  onChange={e => setForm({ ...form, durum: e.target.value })}
                >
                  <option>Bekliyor</option>
                  <option>Devam Ediyor</option>
                  <option>Tamamlandı</option>
                  <option>İptal</option>
                </select>
              </div>

              <div>
                <label style={styles.label}>Başlangıç</label>
                <input
                  type="date"
                  style={styles.input}
                  value={form.baslangic}
                  onChange={e => setForm({ ...form, baslangic: e.target.value })}
                />
              </div>

              <div>
                <label style={styles.label}>Bitiş / Deadline</label>
                <input
                  type="date"
                  style={styles.input}
                  value={form.deadline}
                  onChange={e => setForm({ ...form, deadline: e.target.value })}
                />
              </div>
            </div>

            <button onClick={gorevEkle} style={styles.kaydetBtn}>
              Kaydet
            </button>
          </div>
        </div>
      )}

      {duzenleAcik && (
        <div style={styles.modalBg} onClick={() => setDuzenleAcik(false)}>
          <div style={styles.formPanel} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: 25 }}>✏ Görevi Düzenle</h2>

            <label style={styles.label}>Başlık</label>
            <input
              style={styles.input}
              value={form.baslik}
              onChange={e => setForm({ ...form, baslik: e.target.value })}
            />

            <label style={styles.label}>Açıklama</label>
            <textarea
              style={styles.textarea}
              value={form.aciklama}
              onChange={e => setForm({ ...form, aciklama: e.target.value })}
            />

            <div style={styles.formGrid}>
              <div>
                <label style={styles.label}>Atanan Kişiler</label>
                <select
                  multiple
                  style={{ ...styles.input, height: 145 }}
                  value={form.atananlar}
                  onChange={e => {
                    const secilenler = Array.from(e.target.selectedOptions).map(o => Number(o.value));
                    setForm({
                      ...form,
                      atananlar: secilenler,
                      atanan: secilenler[0] || ''
                    });
                  }}
                >
                  {kullanicilar.filter(k => !yoneticiRolMu(k.rol)).map(k => (
                    <option key={k.id} value={k.id}>
                      {kisiAdi(k)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={styles.label}>Bölüm</label>
                <select
                  style={styles.input}
                  value={form.bolumId}
                  onChange={e => setForm({ ...form, bolumId: Number(e.target.value) })}
                >
                  {bolumler.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.ad}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={styles.label}>Durum</label>
                <select
                  style={styles.input}
                  value={form.durum}
                  onChange={e => setForm({ ...form, durum: e.target.value })}
                >
                  <option>Bekliyor</option>
                  <option>Devam Ediyor</option>
                  <option>Tamamlandı</option>
                  <option>İptal</option>
                </select>
              </div>

              <div>
                <label style={styles.label}>Öncelik</label>
                <select
                  style={styles.input}
                  value={form.oncelik}
                  onChange={e =>
                    setForm({
                      ...form,
                      oncelik: e.target.value,
                      tur: e.target.value
                    })
                  }
                >
                  <option>Minor</option>
                  <option>Major</option>
                </select>
              </div>

              <div>
                <label style={styles.label}>Tamamlanma %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  style={styles.input}
                  value={form.tamamlanma}
                  onChange={e =>
                    setForm({ ...form, tamamlanma: Number(e.target.value) })
                  }
                />
              </div>

              <div>
                <label style={styles.label}>Başlangıç</label>
                <input
                  type="date"
                  style={styles.input}
                  value={form.baslangic}
                  onChange={e => setForm({ ...form, baslangic: e.target.value })}
                />
              </div>

              <div>
                <label style={styles.label}>Deadline</label>
                <input
                  type="date"
                  style={styles.input}
                  value={form.deadline}
                  onChange={e => setForm({ ...form, deadline: e.target.value })}
                />
              </div>
            </div>

            <button
              onClick={() => {
                if (!form.atananlar || form.atananlar.length === 0) {
                  alert('En az bir kişi seçmelisin');
                  return;
                }

                const guncelForm = {
                  ...form,
                  atananlar: form.atananlar.map(Number),
                  atanan: Number(form.atananlar[0]),
                  bolumId: Number(form.bolumId),
                  tamamlanma: Number(form.tamamlanma),
                  tur: form.oncelik
                };

                const yeniListe = gorevler.map(g =>
                  g.id === seciliGorev.id ? { ...g, ...guncelForm } : g
                );

                setGorevler(yeniListe);
                setSeciliGorev({ ...seciliGorev, ...guncelForm });
                setDuzenleAcik(false);
              }}
              style={styles.kaydetBtn}
            >
              Kaydet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function OzetKart({ baslik, deger }) {
  return (
    <div style={styles.ozetKart}>
      <div style={{ color: '#64748b' }}>{baslik}</div>
      <div style={{ fontSize: 38, fontWeight: 900 }}>{deger}</div>
    </div>
  );
}

function GorevKart({ g, secili, kisi, gunFarki, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        ...styles.gorevKart,
        border: secili ? '2px solid #FF6B35' : '2px solid transparent'
      }}
    >
      <div style={styles.gorevBaslik}>{g.baslik}</div>
      <div style={styles.gorevAlt}>{kisi}</div>

      <div style={styles.gorevAltSatir}>
        <span style={styles.durumBadge}>{g.durum}</span>

        <div style={styles.progressBg}>
          <div style={{ ...styles.progress, width: `${g.tamamlanma || 0}%` }} />
        </div>

        <span style={{ color: '#94a3b8' }}>{gunFarki(g.deadline)}</span>
      </div>

      <span style={styles.oncelik}>{g.oncelik || g.tur}</span>
    </div>
  );
}

function Info({ baslik, deger, alt }) {
  return (
    <div style={styles.info}>
      <div style={{ color: '#64748b', fontSize: 12, fontWeight: 800 }}>
        {baslik}
      </div>
      <div style={{ fontSize: 18, fontWeight: 800 }}>{deger}</div>
      {alt && <div style={{ color: '#64748b', marginTop: 4 }}>{alt}</div>}
    </div>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    background: '#0F1117',
    color: 'white',
    display: 'flex'
  },
  menu: {
    width: 250,
    background: '#141620',
    padding: 18,
    position: 'relative',
    boxSizing: 'border-box'
  },
  logo: {
    color: '#FF6B35',
    fontWeight: 900,
    letterSpacing: 4,
    marginBottom: 35
  },
  menuBtn: {
    width: '100%',
    padding: 15,
    borderRadius: 14,
    border: 'none',
    color: 'white',
    textAlign: 'left',
    marginBottom: 8,
    fontWeight: 800,
    cursor: 'pointer'
  },
  kullaniciKutu: {
    position: 'absolute',
    bottom: 18,
    left: 18,
    right: 18,
    background: '#1C1F2E',
    borderRadius: 18,
    padding: 16
  },
  cikisBtn: {
    width: '100%',
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    border: 'none',
    background: '#FF6B35',
    color: 'white',
    fontWeight: 800,
    cursor: 'pointer'
  },
  main: {
    flex: 1,
    padding: 28,
    overflowY: 'auto'
  },
  baslik: {
    fontSize: 38,
    margin: 0
  },
  altYazi: {
    color: '#64748b'
  },
  ozetKart: {
    background: '#1C1F2E',
    padding: 22,
    borderRadius: 20
  },
  dashboardOzet: {
    display: 'grid',
    gridTemplateColumns: window.innerWidth <= 768 ? '1fr 1fr' : 'repeat(4,1fr)',
    gap: 16
  },
  sayfaUst: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 20
  },
  ekleBtn: {
    padding: '15px 22px',
    borderRadius: 18,
    border: 'none',
    background: '#FF6B35',
    color: 'white',
    fontWeight: 900,
    cursor: 'pointer'
  },
  gorevKart: {
    background: '#1C1F2E',
    padding: 22,
    borderRadius: 22,
    marginTop: 16,
    cursor: 'pointer',
    position: 'relative'
  },
  gorevBaslik: {
    fontSize: 22,
    fontWeight: 900
  },
  gorevAlt: {
    color: '#64748b',
    marginTop: 8
  },
  gorevAltSatir: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginTop: 18
  },
  durumBadge: {
    background: '#4ECDC422',
    color: '#4ECDC4',
    padding: '8px 14px',
    borderRadius: 10,
    fontWeight: 800
  },
  progressBg: {
    height: 6,
    background: '#252836',
    borderRadius: 6,
    flex: 1
  },
  progress: {
    height: 6,
    background: '#FF6B35',
    borderRadius: 6
  },
  oncelik: {
    position: 'absolute',
    right: 18,
    top: 18,
    background: '#FF6B3522',
    color: '#FF6B35',
    padding: '8px 12px',
    borderRadius: 12,
    fontWeight: 900
  },
  detayPanel: {
    position: 'fixed',
    right: window.innerWidth <= 768 ? 10 : 30,
    left: window.innerWidth <= 768 ? 10 : 'auto',
    bottom: 20,
    width: window.innerWidth <= 768 ? 'auto' : 430,
    maxHeight: '85vh',
    overflowY: 'auto',
    background: '#141620',
    borderRadius: 28,
    padding: 28,
    boxShadow: '0 20px 80px #000',
    zIndex: 100
  },
  aciklama: {
    background: '#252836',
    color: '#cbd5e1',
    padding: 16,
    borderRadius: 16
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: 12
  },
  info: {
    background: '#252836',
    padding: 16,
    borderRadius: 16
  },
  durumGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: 12,
    marginTop: 20
  },
  durumBtn: {
    padding: 15,
    borderRadius: 16,
    background: '#252836',
    fontWeight: 900,
    cursor: 'pointer'
  },
  label: {
    display: 'block',
    color: '#64748b',
    fontWeight: 900,
    marginTop: 18,
    marginBottom: 8
  },
  silBtn: {
    width: '100%',
    padding: 15,
    borderRadius: 16,
    border: 'none',
    background: '#ef4444',
    color: 'white',
    marginTop: 20,
    fontWeight: 900,
    cursor: 'pointer'
  },
  modalBg: {
    position: 'fixed',
    inset: 0,
    background: '#00000099',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 200
  },
  formPanel: {
    background: '#141620',
    width: 700,
    maxWidth: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    borderRadius: 28,
    padding: 30
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: 16,
    borderRadius: 14,
    border: '1px solid #2d3250',
    background: '#252836',
    color: 'white',
    fontSize: 16
  },
  textarea: {
    width: '100%',
    height: 110,
    boxSizing: 'border-box',
    padding: 16,
    borderRadius: 14,
    border: '1px solid #2d3250',
    background: '#252836',
    color: 'white',
    fontSize: 16
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(2,1fr)',
    gap: 16
  },
  kaydetBtn: {
    width: '100%',
    marginTop: 24,
    padding: 18,
    borderRadius: 18,
    border: 'none',
    background: '#FF6B35',
    color: 'white',
    fontWeight: 900,
    fontSize: 18,
    cursor: 'pointer'
  },
  bosKutu: {
    background: '#1C1F2E',
    padding: 30,
    borderRadius: 20,
    color: '#64748b',
    marginTop: 20
  },
  floatingBtn: {
    position: 'fixed',
    right: 35,
    bottom: 35,
    width: 80,
    height: 80,
    borderRadius: '50%',
    border: 'none',
    background: '#FF6B35',
    color: 'white',
    fontSize: 46,
    fontWeight: 300,
    boxShadow: '0 20px 60px #FF6B3566',
    cursor: 'pointer'
  },
  dosyaSatir: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    background: '#252836',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8
  },
  dosyaAcBtn: {
    padding: '8px 10px',
    borderRadius: 10,
    border: 'none',
    background: '#4ECDC4',
    color: '#0F1117',
    fontWeight: 800,
    cursor: 'pointer'
  },
  dosyaIndirBtn: {
    padding: '8px 10px',
    borderRadius: 10,
    border: 'none',
    background: '#64748b',
    color: 'white',
    fontWeight: 800,
    cursor: 'pointer'
  },
  dosyaSilBtn: {
    padding: '8px 10px',
    borderRadius: 10,
    border: 'none',
    background: '#ef4444',
    color: 'white',
    fontWeight: 800,
    cursor: 'pointer'
  },
  dosyaEkleBtn: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    border: '2px dashed #2d3250',
    background: '#252836',
    color: '#cbd5e1',
    fontWeight: 900,
    marginTop: 10,
    marginBottom: 18,
    cursor: 'pointer'
  },
  mobileMenuBtn: {
    position: 'fixed',
    top: 18,
    right: 18,
    zIndex: 1000,
    width: 52,
    height: 52,
    borderRadius: 14,
    border: 'none',
    background: '#FF6B35',
    color: 'white',
    fontSize: 26,
    fontWeight: 900
  },
  duzenleBtn: {
    width: '100%',
    padding: 15,
    borderRadius: 16,
    border: 'none',
    background: '#252836',
    color: 'white',
    marginTop: 20,
    fontWeight: 900,
    fontSize: 16,
    cursor: 'pointer'
  }
};