# 🧪 Testing Moderasi Bot

## ✅ Yang Sudah Diperbaiki

### 1. **Threshold Diturunkan**
- **Sebelum**: `TOXIC_THRESHOLD=0.7` (butuh 3 kata toxic)
- **Sekarang**: `TOXIC_THRESHOLD=0.5` (cukup 1 kata toxic)
- **Kalkulasi**: Setiap kata toxic = 0.5 confidence

### 2. **Logging Detail Ditambahkan**
Bot sekarang akan print log detail di console:
```
🔍 [MODERATION] Checking message from user 123456789: "anjing banget sih"
🔍 [MODERATION] Checking toxic keywords in: "anjing banget sih"
⚠️ [MODERATION] Found toxic keyword: "anjing"
📊 [MODERATION] Toxic confidence: 0.5 (threshold: 0.5)
🚨 [MODERATION] ABOVE THRESHOLD! Blocking message.
🚨 [MODERATION] TOXIC DETECTED! Reason: Mengandung kata-kata tidak pantas: anjing, Confidence: 0.5
🚨 [MODERATION] VIOLATION DETECTED! Taking action...
```

---

## 📝 Langkah Testing

### Step 1: Pastikan Kamu Sudah Jadi Moderator
```
/setmoderator add user:@kamu
/setmoderator list
```

Harus muncul nama kamu di list!

---

### Step 2: Test Toxic Words

Minta temanmu kirim pesan dengan kata toxic (atau test sendiri dengan akun lain):

#### Test Bahasa Indonesia:
```
anjing banget sih
tolol lu
bodoh amat
bangsat
kontol
goblok
```

#### Test Bahasa Inggris:
```
fuck you
shit
damn it
asshole
```

---

### Step 3: Yang Harus Terjadi

#### ✅ Bot Seharusnya:
1. **Hapus pesan** langsung
2. **Kirim warning** ke pelaku (auto-delete setelah 10 detik)
3. **Kirim DM ke kamu** (sebagai moderator) dengan embed detail:

```
🚨 PELANGGARAN TERDETEKSI

👤 User: temanmu#1234 (ID: 123456789)
📍 Channel: #general
🕐 Waktu: 24/10/2025 14:30:45

⚠️ Tipe: Toxic Content
📝 Alasan: Mengandung kata-kata tidak pantas: anjing

💬 Pesan:
"anjing banget sih"

✅ Aksi: Pesan telah dihapus dan user diberi peringatan.
```

#### ✅ Di Console Bot (Terminal):
```
📨 Message received in channel 1430563603840237873 from temanmu
🛡️ [MODERATION] Enabled in this channel: true
🔍 [MODERATION] Checking message from user 123456789: "anjing banget sih"
⚠️ [MODERATION] Found toxic keyword: "anjing"
🚨 [MODERATION] TOXIC DETECTED!
🚨 [MODERATION] VIOLATION DETECTED! Taking action...
✅ [MODERATION] Message deleted and warning sent
📨 [MODERATION] DM sent to moderator: 987654321
```

---

## 🔍 Troubleshooting

### ❌ Moderasi Tidak Jalan?

#### 1. Cek Console Bot
Pastikan ada log seperti ini:
```
🛡️ [MODERATION] Enabled in this channel: true
```

Jika muncul `false`, berarti:
- Channel di-exclude, atau
- `MODERATION_ENABLED=false` di `.env`

**Solusi:**
```bash
# Cek status
/setchannel moderation action:List

# Jika channel di-exclude, include kembali:
/setchannel moderation action:Include channel:#general
```

---

#### 2. Cek Kata Toxic
Pastikan kata yang digunakan ada di list:

**Bahasa Indonesia:**
- anjing, bangsat, babi, kontol, memek, ngentot, tolol
- bodoh, goblok, idiot, bajingan, kampret, asu, jancok

**Bahasa Inggris:**
- fuck, shit, bitch, damn, ass, dick, pussy, cunt
- bastard, asshole, motherfucker, retard

Jika kata tidak ada di list, tambahkan di:
```
src/services/moderation.service.ts
```

---

#### 3. Cek DM Settings
Bot tidak bisa kirim DM jika:
- ❌ Privacy settings user = "Disable DMs from server members"

**Solusi:**
Minta moderator enable DM dari server members:
```
User Settings → Privacy & Safety → 
Allow direct messages from server members = ON
```

---

#### 4. Restart Bot
Jika sudah test dan masih belum jalan:
```powershell
# Stop bot (Ctrl+C di terminal)
# Lalu start ulang:
cd ai-bot
npm run dev
```

---

## 🎯 Test Cases

### Test Case 1: Single Toxic Word
**Input:** `anjing`
**Expected:**
- ✅ Message deleted
- ✅ Warning sent
- ✅ DM to moderators

---

### Test Case 2: Multiple Toxic Words
**Input:** `anjing tolol bangsat`
**Expected:**
- ✅ Message deleted
- ✅ Reason: "Mengandung kata-kata tidak pantas: anjing, tolol, bangsat"
- ✅ Confidence: 1.0 (3 words × 0.5 = 1.5, capped at 1.0)

---

### Test Case 3: Toxic Word in Sentence
**Input:** `wah kamu anjing banget sih hahaha`
**Expected:**
- ✅ Still detected (case-insensitive, substring match)
- ✅ Reason: "Mengandung kata-kata tidak pantas: anjing"

---

### Test Case 4: Spam Detection
**Input:** Send 6 messages in 5 seconds
**Expected:**
- ✅ 6th message deleted
- ✅ Reason: "Spam - terlalu banyak pesan dalam waktu singkat"

---

### Test Case 5: Clean Message
**Input:** `halo semua, gimana kabar kalian?`
**Expected:**
- ✅ Message NOT deleted
- ✅ No warnings
- ✅ Console log: `✅ [MODERATION] Message passed all checks`

---

## 📊 Monitoring Tips

### 1. Watch Console Logs
Biarkan terminal bot terbuka untuk lihat real-time logs:
```
🔍 [MODERATION] Checking message...
⚠️ [MODERATION] Found toxic keyword...
🚨 [MODERATION] TOXIC DETECTED!
```

### 2. Check Moderator DMs
Semua pelanggaran akan masuk ke DM moderator yang ditunjuk.

### 3. Optional: Set Log Channel
Tambahkan channel khusus untuk logs:
```env
MODERATION_LOG_CHANNEL=1234567890
```

Semua pelanggaran akan di-log ke channel tersebut juga.

---

## 🚀 Next Steps

Jika semua test berhasil:
1. ✅ Deploy ke Railway untuk 24/7 uptime
2. ✅ Monitor logs selama beberapa hari
3. ✅ Adjust threshold jika terlalu strict/loose
4. ✅ Tambah kata toxic custom sesuai kebutuhan server

---

## ❓ FAQ

**Q: Kenapa threshold 0.5?**
A: 1 kata toxic = 0.5 confidence, jadi langsung kena. Kalau mau lebih strict, naikkan jadi 0.7 atau 1.0.

**Q: Apakah bot bisa salah deteksi?**
A: Bisa (false positive), misalnya "anjing lucu banget" juga kena. Solusi: tambahkan whitelist atau gunakan AI-based moderation.

**Q: Bagaimana cara customize keywords?**
A: Edit `src/services/moderation.service.ts` → array `toxicKeywords`.

**Q: Apakah moderator bisa reply DM bot?**
A: Tidak, DM satu arah. Future feature: add button untuk ban/warn user.

---

**Happy Testing! 🧪**
