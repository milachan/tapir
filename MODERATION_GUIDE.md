# 🛡️ Panduan Moderasi Bot

## Status Moderasi Global

**✅ MODERASI AKTIF DI SEMUA CHANNEL** (secara default)

Ketika `MODERATION_ENABLED=true` di `.env`, bot akan otomatis moderasi **SEMUA CHANNEL** di server, kecuali channel yang di-exclude.

---

## 📋 Fitur Moderasi

### 1. Deteksi Konten Toxic
Bot mendeteksi kata-kata toxic dalam:
- **Bahasa Indonesia**: bodoh, tolol, bangsat, anjing, kontol, memek, tai, bego, sialan, setan, etc.
- **Bahasa Inggris**: fuck, shit, bitch, asshole, bastard, cunt, dick, pussy, etc.

### 2. Deteksi Spam
- **Flood Detection**: Lebih dari 5 pesan dalam 10 detik
- **Caps Lock Spam**: Lebih dari 70% huruf kapital dalam pesan panjang

### 3. Aksi Otomatis
Ketika pelanggaran terdeteksi:
1. ❌ **Hapus pesan** langsung
2. ⚠️ **Kirim warning** ke pelaku (reply otomatis)
3. 📨 **Notifikasi DM** ke semua moderator yang ditunjuk
4. 📝 **Log ke channel** (jika `MODERATION_LOG_CHANNEL` di-set)

---

## 👮 Manajemen Moderator

### Menunjuk Moderator
Orang yang ditunjuk akan menerima DM ketika ada pelanggaran.

```
/setmoderator add user:@username
```

### Hapus Moderator
```
/setmoderator remove user:@username
```

### Lihat Daftar Moderator
```
/setmoderator list
```

### Clear Semua Moderator
```
/setmoderator clear
```

**Note:** Hanya **Administrator** yang bisa menggunakan command ini.

---

## 🔧 Exclude Channel dari Moderasi

Jika kamu ingin **channel tertentu bebas dari moderasi** (misalnya #memes atau #bot-spam):

### Exclude Channel
```
/setchannel moderation action:Exclude channel:#channel-name
```

### Include Kembali
```
/setchannel moderation action:Include channel:#channel-name
```

### Lihat Status Moderasi
```
/setchannel moderation action:List
```

Output contoh:
```
📝 Status Moderasi:
✅ Moderasi aktif di semua channel
❌ Kecuali:
#memes
#bot-spam
#off-topic
```

---

## 📨 Format Notifikasi DM ke Moderator

Ketika ada pelanggaran, moderator yang ditunjuk akan menerima DM seperti ini:

```
🚨 PELANGGARAN TERDETEKSI

👤 User: username#1234 (ID: 123456789)
📍 Channel: #general
🕐 Waktu: 15/01/2025 14:30:45

⚠️ Tipe: Toxic Content
📝 Alasan: Menggunakan kata-kata kasar (bodoh, tolol)

💬 Pesan:
"lu bodoh banget sih tolol"

✅ Aksi: Pesan telah dihapus dan user diberi peringatan.
```

---

## ⚙️ Konfigurasi di .env

```env
# WAJIB: Enable/disable moderasi
MODERATION_ENABLED=true

# OPSIONAL: Channel untuk log moderasi
MODERATION_LOG_CHANNEL=1234567890

# OPSIONAL: Channel auto-reply (tidak wajib untuk moderasi)
AUTO_REPLY_CHANNELS=1234567890,0987654321
```

---

## 🎯 Use Case

### Scenario 1: Moderasi Full Server
**Setup:**
- `MODERATION_ENABLED=true`
- Tidak ada channel di-exclude
- 3 moderator ditunjuk

**Result:** 
✅ Bot moderasi semua channel
✅ 3 moderator dapat notifikasi DM setiap ada pelanggaran

---

### Scenario 2: Moderasi dengan Exclusion
**Setup:**
- `MODERATION_ENABLED=true`
- Channel #memes dan #bot-spam di-exclude
- 2 moderator ditunjuk

**Command:**
```
/setchannel moderation action:Exclude channel:#memes
/setchannel moderation action:Exclude channel:#bot-spam
```

**Result:**
✅ Bot moderasi semua channel KECUALI #memes dan #bot-spam
✅ User bebas kirim apa saja di #memes dan #bot-spam
✅ 2 moderator dapat DM untuk pelanggaran di channel lain

---

### Scenario 3: Moderasi + Log Channel
**Setup:**
- `MODERATION_ENABLED=true`
- `MODERATION_LOG_CHANNEL=1234567890` (ID channel #mod-log)
- 5 moderator ditunjuk

**Result:**
✅ Bot moderasi semua channel
✅ 5 moderator dapat DM setiap pelanggaran
✅ Log embed juga dikirim ke #mod-log

---

## 🔍 Troubleshooting

### Moderasi Tidak Jalan?
1. ✅ Cek `.env` → `MODERATION_ENABLED=true`
2. ✅ Restart bot: `npm run dev`
3. ✅ Cek channel sudah di-exclude?: `/setchannel moderation action:List`

### Moderator Tidak Dapat DM?
1. ✅ Pastikan moderator sudah ditunjuk: `/setmoderator list`
2. ✅ Pastikan moderator allow DM dari server member
3. ✅ Cek logs bot untuk error DM

### Bot Hapus Pesan Normal?
Kemungkinan false positive. Coba adjust keywords di:
```
src/services/moderation.service.ts
```

---

## 📊 Statistik & Monitoring

Setiap pelanggaran tercatat dengan:
- ✅ User ID & username
- ✅ Channel & waktu
- ✅ Tipe pelanggaran (Toxic/Spam)
- ✅ Konten pesan
- ✅ Aksi yang diambil

**Future Feature:** Dashboard moderasi dengan stats lengkap (coming soon!)

---

## 🚀 Best Practices

1. **Tunjuk 2-5 moderator aktif** untuk coverage optimal
2. **Exclude channel fun** seperti #memes agar user bebas bercanda
3. **Set log channel** untuk audit trail lengkap
4. **Review false positive** secara berkala
5. **Communicate rules** ke member server

---

## ❓ FAQ

**Q: Apakah moderasi berlaku di semua channel?**
A: ✅ Ya! Moderasi aktif di SEMUA channel secara default. Kamu bisa exclude channel tertentu dengan `/setchannel moderation`.

**Q: Siapa yang bisa jadi moderator?**
A: Siapa saja yang ditunjuk oleh Administrator menggunakan `/setmoderator add`.

**Q: Apakah moderator harus punya role khusus?**
A: ❌ Tidak! Sistem moderator sekarang berbasis per-user assignment, bukan role.

**Q: Bagaimana cara disable moderasi?**
A: Set `MODERATION_ENABLED=false` di `.env` lalu restart bot.

**Q: Apakah bot bisa ban user?**
A: Belum. Saat ini bot hanya delete + warn. Fitur ban/kick/mute coming soon!

---

## 📞 Support

Ada bug atau saran? Open issue di GitHub atau hubungi developer!

**Happy Moderating! 🛡️**
