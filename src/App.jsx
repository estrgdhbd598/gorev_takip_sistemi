import { useEffect, useState } from 'react';
import { ILK_KULLANICILAR, ILK_GOREVLER } from './constants';
import Giris from './components/Giris';
import Platform from './components/Platform';
import { supabase } from './supabaseClient';

// ─── Sabitler ────────────────────────────────────────────
const ILK_BOLUMLER = [
  { id: 1, ad: 'Kalite',    emoji: '🔍', renk: '#FF6B35' },
  { id: 2, ad: 'Üretim',   emoji: '⚙️', renk: '#4ECDC4' },
  { id: 3, ad: 'Satın Alma', emoji: '🛒', renk: '#45B7D1' },
  { id: 4, ad: 'İdari',    emoji: '📋', renk: '#96CEB4' },
  { id: 5, ad: 'Genel',    emoji: '🌐', renk: '#9B59B6' }
];

// ─── Dönüşüm yardımcıları ────────────────────────────────
function dbKullaniciToApp(k) {
  return {
    id: k.id,
    ad: k.ad || k.adsoyad || '',
    adSoyad: k.adsoyad || k.ad || '',
    kullaniciAdi: k.kullaniciadi || '',
    sifre: k.sifre || '',
    rol: k.rol || '',
    unvan: k.unvan || '',
    bolumId: k.bolumid || '',
    ustKisiId: k.ustkisiid || '',
    ayarYetkisi: k.ayaryetkisi || false,
    avatar: k.avatar || '',
    renk: k.renk || '#4ECDC4'
  };
}

function appKullaniciToDb(k) {
  return {
    id: Number(k.id),
    ad: k.ad || k.adSoyad || '',
    adsoyad: k.adSoyad || k.ad || '',
    kullaniciadi: k.kullaniciAdi || '',
    sifre: k.sifre || '',
    rol: k.rol || '',
    unvan: k.unvan || '',
    bolumid: k.bolumId ? Number(k.bolumId) : null,
    ustkisiid: k.ustKisiId ? Number(k.ustKisiId) : null,
    ayaryetkisi: k.ayarYetkisi || false,
    avatar: k.avatar || '',
    renk: k.renk || '#4ECDC4'
  };
}

function dbGorevToApp(g) {
  return {
    id: g.id,
    baslik: g.baslik || '',
    aciklama: g.aciklama || '',
    atanan: g.atanan || '',
    atananlar: Array.isArray(g.atananlar) ? g.atananlar : [],
    durum: g.durum || 'Bekliyor',
    oncelik: g.oncelik || g.tur || 'Minor',
    tur: g.tur || g.oncelik || 'Minor',
    baslangic: g.baslangic || '',
    deadline: g.deadline || '',
    tamamlanma: g.tamamlanma || 0,
    bolumId: g.bolumid || '',
    dosyalar: Array.isArray(g.dosyalar) ? g.dosyalar : []
  };
}

function appGorevToDb(g) {
  return {
    id: Number(g.id),
    baslik: g.baslik || '',
    aciklama: g.aciklama || '',
    atanan: g.atanan ? Number(g.atanan) : null,
    atananlar: Array.isArray(g.atananlar)
      ? g.atananlar.map(Number)
      : g.atanan ? [Number(g.atanan)] : [],
    durum: g.durum || 'Bekliyor',
    oncelik: g.oncelik || g.tur || 'Minor',
    tur: g.tur || g.oncelik || 'Minor',
    baslangic: g.baslangic || null,
    deadline: g.deadline || null,
    tamamlanma: Number(g.tamamlanma || 0),
    bolumid: g.bolumId ? Number(g.bolumId) : null,
    dosyalar: Array.isArray(g.dosyalar) ? g.dosyalar : []
  };
}

function dbBolumToApp(b) {
  return {
    id: b.id,
    ad: b.ad || '',
    emoji: b.emoji || '📌',
    renk: b.renk || '#FF6B35'
  };
}

function appBolumToDb(b) {
  return {
    id: Number(b.id),
    ad: b.ad || '',
    emoji: b.emoji || '📌',
    renk: b.renk || '#FF6B35'
  };
}

// ─── Ana bileşen ─────────────────────────────────────────
export default function App() {
  // ✅ Tüm hook'lar burada — bileşen içinde
  const [kul, setKul] = useState(() => {
    try {
      const kayitli = localStorage.getItem('aktifKullanici');
      return kayitli ? JSON.parse(kayitli) : null;
    } catch {
      return null;
    }
  });

  const [kullanicilar, setKullanicilarState] = useState([]);
  const [gorevler,    setGorevlerState]    = useState([]);
  const [bolumler,    setBolumlerState]    = useState([]);
  const [yukleniyor,  setYukleniyor]       = useState(true);

  useEffect(() => {
    verileriYukle(true);
    const kanal = realtimeBaslat();
    return () => { supabase.removeChannel(kanal); };
  }, []);

  // ─── Veri yükleme ───────────────────────────────────────
  async function verileriYukle(ilkYukleme = false) {
    if (ilkYukleme) setYukleniyor(true);

    const [
      { data: kullaniciData, error: kullaniciError },
      { data: gorevData,     error: gorevError },
      { data: bolumData,     error: bolumError }
    ] = await Promise.all([
      supabase.from('kullanicilar').select('*').order('id', { ascending: true }),
      supabase.from('gorevler').select('*').order('id', { ascending: true }),
      supabase.from('bolumler').select('*').order('id', { ascending: true })
    ]);

    if (kullaniciError || gorevError || bolumError) {
      console.error('Supabase veri okuma hatası:', { kullaniciError, gorevError, bolumError });
      setYukleniyor(false);
      return;
    }

    let kData = (kullaniciData || []).map(dbKullaniciToApp);
    let gData = (gorevData     || []).map(dbGorevToApp);
    let bData = (bolumData     || []).map(dbBolumToApp);

    if (bData.length === 0) {
      await supabase.from('bolumler').upsert(ILK_BOLUMLER.map(appBolumToDb), { onConflict: 'id' });
      bData = ILK_BOLUMLER;
    }

    if (kData.length === 0) {
      const hazirKullanicilar = ILK_KULLANICILAR.map(k => ({
        ...k,
        ad: k.ad || k.adSoyad || '',
        adSoyad: k.adSoyad || k.ad || '',
        ayarYetkisi: k.ayarYetkisi || false,
        bolumId: k.bolumId || 5,
        ustKisiId: k.ustKisiId || '',
        avatar: k.avatar || '',
        renk: k.renk || '#4ECDC4'
      }));
      await supabase.from('kullanicilar').upsert(hazirKullanicilar.map(appKullaniciToDb), { onConflict: 'id' });
      kData = hazirKullanicilar;
    }

    if (gData.length === 0) {
      const hazirGorevler = ILK_GOREVLER.map(g => ({
        ...g,
        atananlar: Array.isArray(g.atananlar) ? g.atananlar : g.atanan ? [g.atanan] : [],
        bolumId: g.bolumId || 1,
        dosyalar: g.dosyalar || []
      }));
      await supabase.from('gorevler').upsert(hazirGorevler.map(appGorevToDb), { onConflict: 'id' });
      gData = hazirGorevler;
    }

    setKullanicilarState(kData);
    setGorevlerState(gData);
    setBolumlerState(bData);
    setYukleniyor(false);
  }

  // ─── Realtime ───────────────────────────────────────────
  function realtimeBaslat() {
    return supabase
      .channel('gorev_takip_sistemi_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kullanicilar' }, () => verileriYukle(false))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gorevler' },    () => verileriYukle(false))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bolumler' },    () => verileriYukle(false))
      .subscribe();
  }

  // ─── Setter'lar (state + Supabase sync) ─────────────────
  async function setKullanicilar(yeniListe) {
    setKullanicilarState(yeniListe);
    const temizListe = yeniListe.map(appKullaniciToDb);
    const { data: mevcutlar } = await supabase.from('kullanicilar').select('id');
    const mevcutIdler = (mevcutlar || []).map(x => Number(x.id));
    const yeniIdler   = temizListe.map(x => Number(x.id));
    const silinecekler = mevcutIdler.filter(id => !yeniIdler.includes(id));
    if (silinecekler.length > 0) {
      await supabase.from('kullanicilar').delete().in('id', silinecekler);
    }
    if (temizListe.length > 0) {
      const { error } = await supabase.from('kullanicilar').upsert(temizListe, { onConflict: 'id' });
      if (error) console.error('Kullanıcı kayıt hatası:', error);
    }
  }

  async function setGorevler(yeniListe) {
    setGorevlerState(yeniListe);
    const temizListe = yeniListe.map(appGorevToDb);
    const { data: mevcutlar } = await supabase.from('gorevler').select('id');
    const mevcutIdler  = (mevcutlar || []).map(x => Number(x.id));
    const yeniIdler    = temizListe.map(x => Number(x.id));
    const silinecekler = mevcutIdler.filter(id => !yeniIdler.includes(id));
    if (silinecekler.length > 0) {
      await supabase.from('gorevler').delete().in('id', silinecekler);
    }
    if (temizListe.length > 0) {
      const { error } = await supabase.from('gorevler').upsert(temizListe, { onConflict: 'id' });
      if (error) console.error('Görev kayıt hatası:', error);
    }
  }

  async function setBolumler(yeniListe) {
    setBolumlerState(yeniListe);
    const temizListe = yeniListe.map(appBolumToDb);
    const { data: mevcutlar } = await supabase.from('bolumler').select('id');
    const mevcutIdler  = (mevcutlar || []).map(x => Number(x.id));
    const yeniIdler    = temizListe.map(x => Number(x.id));
    const silinecekler = mevcutIdler.filter(id => !yeniIdler.includes(id));
    if (silinecekler.length > 0) {
      await supabase.from('bolumler').delete().in('id', silinecekler);
    }
    if (temizListe.length > 0) {
      const { error } = await supabase.from('bolumler').upsert(temizListe, { onConflict: 'id' });
      if (error) console.error('Bölüm kayıt hatası:', error);
    }
  }

  // ─── Giriş / Çıkış ──────────────────────────────────────
  function girisYap(kullanici) {
    localStorage.setItem('aktifKullanici', JSON.stringify(kullanici));
    setKul(kullanici);
  }

  function cikisYap() {
    localStorage.removeItem('aktifKullanici');
    setKul(null);
  }

  // ─── Render ─────────────────────────────────────────────
  if (yukleniyor) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0F1117', color: 'white',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 18
      }}>
        <div style={{ fontSize: 42 }}>⚙️</div>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 2 }}>
          Yükleniyor...
        </div>
      </div>
    );
  }

  if (!kul) {
    return <Giris kullanicilar={kullanicilar} onGiris={girisYap} />;
  }

  return (
    <Platform
      kul={kul}
      onCikis={cikisYap}
      kullanicilar={kullanicilar}
      setKullanicilar={setKullanicilar}
      gorevler={gorevler}
      setGorevler={setGorevler}
      bolumler={bolumler}
      setBolumler={setBolumler}
    />
  );
}
