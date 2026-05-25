import React, { useState } from "react";

export function EkipSayfa({
  aktifKullanici,
  kullanicilar,
  setKullanicilar,
  gorevler = []
}) {
  const [seciliKisi, setSeciliKisi] = useState(null);
  const [modalAcik, setModalAcik] = useState(false);

  const [form, setForm] = useState({
    adSoyad: "",
    kullaniciAdi: "",
    sifre: "",
    rol: "Çalışan",
    unvan: "",
    departman: "Üretim"
  });

  const kullaniciEkleyebilir =
    aktifKullanici?.rol === "Yönetici" ||
    aktifKullanici?.rol === "Genel Müdür";

  function kullaniciEkle() {
    if (!form.adSoyad || !form.kullaniciAdi || !form.sifre || !form.unvan) {
      alert("Lütfen tüm alanları doldur.");
      return;
    }

    const ayniKullaniciVar = kullanicilar.some(
      k => k.kullaniciAdi === form.kullaniciAdi
    );

    if (ayniKullaniciVar) {
      alert("Bu kullanıcı adı zaten var.");
      return;
    }

    const yeniKullanici = {
      id: Date.now(),
      adSoyad: form.adSoyad,
      kullaniciAdi: form.kullaniciAdi,
      sifre: form.sifre,
      rol: form.rol,
      unvan: form.unvan,
      departman: form.departman,
      gorevler: []
    };

    setKullanicilar([...kullanicilar, yeniKullanici]);
    setModalAcik(false);

    setForm({
      adSoyad: "",
      kullaniciAdi: "",
      sifre: "",
      rol: "Çalışan",
      unvan: "",
      departman: "Üretim"
    });
  }

  function kisiAdi(kisi) {
    return kisi?.adSoyad || kisi?.ad || "İsimsiz Kullanıcı";
    }

    function basHarfler(kisi) {
    const ad = kisiAdi(kisi);

    return ad
        .split(" ")
        .filter(Boolean)
        .map(k => k[0])
        .join("")
        .toUpperCase();
  }

  function kisininGorevleri(kisi) {
    return gorevler.filter(g => Number(g.atanan) === Number(kisi.id));
  }

  function gorevSayisi(kisi) {
    return kisininGorevleri(kisi).length;
  }

  function bitenGorevSayisi(kisi) {
    return kisininGorevleri(kisi).filter(g => g.durum === "Tamamlandı").length;
  }

  function gecikenGorevSayisi(kisi) {
    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0);

    return kisininGorevleri(kisi).filter(g => {
        if (!g.deadline) return false;

        const bitis = new Date(g.deadline);
        bitis.setHours(0, 0, 0, 0);

        return bitis < bugun && g.durum !== "Tamamlandı";
    }).length;
  }

  if (seciliKisi) {
    return (
      <div style={styles.page}>
        <h1 style={styles.title}>Ekip</h1>

        <button style={styles.backBtn} onClick={() => setSeciliKisi(null)}>
          ‹ Geri
        </button>

        <div style={styles.detailCard}>
          <div style={styles.detailTop}>
            <div style={styles.avatar}>{basHarfler(seciliKisi)}</div>

            <div>
              <h2 style={styles.name}>{kisiAdi(seciliKisi)}</h2>
              <p style={styles.subText}>{seciliKisi.unvan}</p>
            </div>
          </div>

          <div style={styles.stats}>
            <div style={styles.statBox}>
              <strong>{gorevSayisi(seciliKisi)}</strong>
              <span>Toplam</span>
            </div>

            <div style={styles.statBox}>
              <strong style={{ color: "#8fd6b5" }}>
                {bitenGorevSayisi(seciliKisi)}
              </strong>
              <span>Bitti</span>
            </div>

            <div style={styles.statBox}>
              <strong style={{ color: "#ff6b35" }}>
                {gecikenGorevSayisi(seciliKisi)}
              </strong>
              <span>Geciken</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <h1 style={styles.title}>Ekip</h1>

        {kullaniciEkleyebilir && (
          <button style={styles.addBtn} onClick={() => setModalAcik(true)}>
            + Kullanıcı Ekle
          </button>
        )}
      </div>

      <div style={styles.list}>
        {kullanicilar.map(kisi => (
          <div
            key={kisi.id}
            style={styles.card}
            onClick={() => setSeciliKisi(kisi)}
          >
            <div style={styles.avatar}>{basHarfler(kisi)}</div>

            <div style={styles.userInfo}>
              <h2 style={styles.name}>{kisiAdi(kisi)}</h2>
              <p style={styles.subText}>
                {kisi.rol} · {kisi.unvan}
              </p>

              {kisi.departman && (
                <span style={styles.badge}>⚙️ {kisi.departman}</span>
              )}
            </div>

            <div style={styles.taskCount}>{gorevSayisi(kisi)} görev</div>
            <div style={styles.arrow}>›</div>
          </div>
        ))}
      </div>

      {modalAcik && (
        <div style={styles.modalBg}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Kullanıcı Ekle</h2>

            <input
              style={styles.input}
              placeholder="Ad Soyad"
              value={form.adSoyad}
              onChange={e => setForm({ ...form, adSoyad: e.target.value })}
            />

            <input
              style={styles.input}
              placeholder="Kullanıcı Adı"
              value={form.kullaniciAdi}
              onChange={e =>
                setForm({ ...form, kullaniciAdi: e.target.value })
              }
            />

            <input
              style={styles.input}
              placeholder="Şifre"
              type="password"
              value={form.sifre}
              onChange={e => setForm({ ...form, sifre: e.target.value })}
            />

            <select
              style={styles.input}
              value={form.rol}
              onChange={e => setForm({ ...form, rol: e.target.value })}
            >
              <option>Yönetici</option>
              <option>Genel Müdür</option>
              <option>Müdür</option>
              <option>Sorumlu</option>
              <option>Çalışan</option>
            </select>

            <input
              style={styles.input}
              placeholder="Ünvan"
              value={form.unvan}
              onChange={e => setForm({ ...form, unvan: e.target.value })}
            />

            <input
              style={styles.input}
              placeholder="Departman"
              value={form.departman}
              onChange={e => setForm({ ...form, departman: e.target.value })}
            />

            <div style={styles.modalBtns}>
              <button style={styles.cancelBtn} onClick={() => setModalAcik(false)}>
                İptal
              </button>

              <button style={styles.saveBtn} onClick={kullaniciEkle}>
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    padding: 20,
    color: "#fff"
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24
  },
  title: {
    fontSize: 34,
    fontWeight: 800,
    margin: 0
  },
  addBtn: {
    background: "#ff6b35",
    color: "#fff",
    border: "none",
    borderRadius: 14,
    padding: "12px 16px",
    fontWeight: 700,
    cursor: "pointer"
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 18
  },
  card: {
    display: "flex",
    alignItems: "center",
    gap: 18,
    background: "#1d2030",
    borderRadius: 24,
    padding: 20,
    cursor: "pointer",
    borderLeft: "5px solid #4fd1c5"
  },
  avatar: {
    minWidth: 72,
    height: 72,
    borderRadius: "50%",
    border: "4px solid #4fd1c5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#4fd1c5",
    fontSize: 24,
    fontWeight: 800,
    background: "#19313a"
  },
  userInfo: {
    flex: 1
  },
  name: {
    margin: 0,
    fontSize: 26,
    fontWeight: 800
  },
  subText: {
    margin: "6px 0",
    color: "#8b91a7",
    fontSize: 18
  },
  badge: {
    display: "inline-block",
    background: "#163b45",
    color: "#4fd1c5",
    padding: "6px 12px",
    borderRadius: 8,
    fontWeight: 700
  },
  taskCount: {
    color: "#a0a7bb",
    fontWeight: 800,
    fontSize: 18
  },
  arrow: {
    color: "#6b7280",
    fontSize: 34
  },
  backBtn: {
    background: "#1d2030",
    color: "#a0a7bb",
    border: "none",
    borderRadius: 14,
    padding: "12px 18px",
    fontSize: 18,
    fontWeight: 700,
    margin: "24px 0",
    cursor: "pointer"
  },
  detailCard: {
    background: "#1d2030",
    borderRadius: 24,
    padding: 24
  },
  detailTop: {
    display: "flex",
    alignItems: "center",
    gap: 18,
    marginBottom: 26
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 14
  },
  statBox: {
    background: "#282b3a",
    borderRadius: 16,
    padding: 18,
    textAlign: "center"
  },
  modalBg: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999
  },
  modal: {
    width: "90%",
    maxWidth: 420,
    background: "#1d2030",
    borderRadius: 24,
    padding: 24
  },
  modalTitle: {
    marginTop: 0
  },
  input: {
    width: "100%",
    padding: 14,
    marginBottom: 12,
    borderRadius: 12,
    border: "1px solid #33384d",
    background: "#11131f",
    color: "#fff",
    fontSize: 16,
    boxSizing: "border-box"
  },
  modalBtns: {
    display: "flex",
    gap: 12,
    justifyContent: "flex-end"
  },
  cancelBtn: {
    background: "#33384d",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "12px 18px",
    cursor: "pointer"
  },
  saveBtn: {
    background: "#ff6b35",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "12px 18px",
    fontWeight: 700,
    cursor: "pointer"
  }
};