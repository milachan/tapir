# 👋 Panduan Welcome Message

## ✨ Cara Kerja

Bot akan **otomatis menyambut SEMUA member yang join server**, baik:
- ✅ Member baru pertama kali join
- ✅ Member lama yang keluar lalu join lagi
- ✅ Member yang di-kick/ban lalu di-unban

---

## 🔧 Setup Welcome Channel

### Step 1: Set Channel Welcome
Jalankan command ini (hanya Admin yang bisa):
```
/setchannel welcome channel:#welcome
```

Ganti `#welcome` dengan channel yang kamu mau. Contoh:
- `#welcome`
- `#general`
- `#member-baru`

### Step 2: Test Welcome
Cara test:
1. **Buat akun Discord baru** atau
2. **Minta teman join server** atau
3. **Keluar dari server lalu join lagi**

Bot akan langsung kirim welcome message!

---

## 🎨 Format Welcome Message

Bot akan generate welcome message dengan **AI** yang:
1. ✅ **Pantun kreatif** dikaitkan dengan username
2. ✅ **Lelucon lucu** tentang username
3. ✅ **Bahasa Indonesia** selalu
4. ✅ **Emoji ceria** (🎉 👋 😄 ✨)
5. ✅ **Mention member** yang baru join

### Contoh 1 (Username: "Budi")
```
@Budi Pergi ke pasar beli roti canai
Pulang-pulang mampir beli es kelapa
Selamat datang Budi, ayo semangat selalu bernyanyi
Yuk perkenalkan diri, jangan malu-malu! 🎉
```

### Contoh 2 (Username: "Siti")
```
@Siti Halo Siti! 🎉
Selamat datang di server kita yang penuh dengan orang-orang seru!
Kenapa kamu datang? Karena kamu tau ini tempatnya ngobrol santai! 😄
Yuk perkenalkan diri dan join keseruannya! ✨
```

### Contoh 3 (Username: "Rafli")
```
@Rafli Jalan-jalan ke kota melihat ombak
Beli buah mangga yang manis rasanya
Selamat datang Rafli, semoga betah sampai tua nanti jombak
Yuk kenalan, jangan sungkan ngobrolnya! 🎊
```

---

## 🎯 Fitur Khusus

### 1. AI-Generated Unique Message
Setiap welcome message **SELALU BEDA** karena di-generate AI real-time!
- Member A dapat pantun A
- Member B dapat pantun B (berbeda!)
- Member A join lagi → dapat pantun C (baru lagi!)

### 2. Username-Based Creativity
Bot akan coba buat permainan kata dari username:
- Username "Andi" → Pantun pakai "Andi", "candy", "handy", dll
- Username "Gaming123" → Lelucon tentang gaming
- Username "Kawaii" → Lelucon tentang anime/cute things

### 3. Typing Indicator
Bot akan show "typing..." sebelum kirim message (terlihat lebih natural!)

---

## 🔍 Troubleshooting

### ❌ Welcome Message Tidak Muncul?

#### 1. Cek Welcome Channel Sudah Di-set?
```
/setchannel welcome channel:#welcome
```

#### 2. Cek Bot Punya Permission?
Bot butuh permissions:
- ✅ **View Channels** (lihat channel welcome)
- ✅ **Send Messages** (kirim welcome message)
- ✅ **Mention Everyone** (mention member baru)

#### 3. Cek Console Bot
Setelah member join, console harus show:
```
✅ Welcome message sent for username
```

Jika muncul error, berarti ada masalah permission atau AI provider.

---

### ❌ Welcome Message dalam Bahasa Inggris?

Seharusnya **TIDAK MUNGKIN** karena sudah dipaksa Bahasa Indonesia di:
1. System prompt AI
2. User prompt AI
3. Contoh format

Jika tetap English, berarti AI provider bermasalah. Switch provider:
```env
AI_PROVIDER=groq  # Recommended
# atau
AI_PROVIDER=deepseek
```

---

## 📋 Commands Terkait

| Command | Fungsi |
|---------|--------|
| `/setchannel welcome channel:#welcome` | Set channel untuk welcome message |
| `/setchannel autoreply action:List` | Lihat semua channel settings |

---

## 🎨 Customize Welcome Message

Jika kamu ingin customize format welcome, edit file:
```
src/events/guildMemberAdd.ts
```

Cari bagian `prompt` dan ubah:
```typescript
const prompt = `Buatkan sambutan hangat untuk member baru Discord bernama "${member.user.username}".

SYARAT PENTING:
1. Sambutan harus dalam Bahasa Indonesia yang hangat dan ramah
2. WAJIB buat pantun ATAU lelucon yang KREATIF
3. ... (customize sesuai keinginan)
`;
```

Setelah edit, restart bot:
```powershell
# Stop bot (Ctrl+C)
cd ai-bot
npm run dev
```

---

## 🚀 Best Practices

### 1. Pilih Channel yang Tepat
Buat channel khusus `#welcome` atau `#member-baru` supaya:
- ✅ Member baru langsung tau di mana harus perkenalan
- ✅ Tidak spam channel general
- ✅ Welcome message tidak tenggelam

### 2. Set Welcome + Auto-reply
Kombinasi powerful:
```
/setchannel welcome channel:#welcome
/setchannel autoreply action:Add channel:#welcome
```

Hasilnya:
1. Member baru join → dapat welcome message
2. Member reply → bot auto-reply (conversation starter!)

### 3. Monitor Welcome Messages
Kadang pantun AI bisa aneh/lucu, monitor channel welcome untuk quality control!

---

## ❓ FAQ

**Q: Apakah member yang re-join akan dapat welcome message lagi?**
A: ✅ YA! Setiap kali member join (baik baru atau lama), bot akan kirim welcome.

**Q: Apakah bisa disable welcome untuk member tertentu?**
A: ❌ Tidak. Semua member yang join akan dapat welcome. Ini by design Discord (GuildMemberAdd event).

**Q: Apakah welcome message bisa di-customize per user?**
A: Ya! AI sudah customize berdasarkan username. Tapi kalau mau lebih spesifik (misal based on role), perlu coding tambahan.

**Q: Berapa lama bot butuh waktu untuk kirim welcome?**
A: ~2-5 detik (tergantung AI provider speed). Bot show "typing..." indicator.

**Q: Apakah welcome message bisa tanpa AI (static text)?**
A: Bisa! Edit `guildMemberAdd.ts` dan replace AI call dengan static text:
```typescript
const welcomeMessage = `🎉 Selamat datang di server kami! 
Silakan perkenalkan diri di sini ya! 😄`;
```

---

## 🎯 Example Flow

### Scenario: Member "Budi" Join Server

1. **Budi click invite link** dan join server
2. **Discord trigger** `GuildMemberAdd` event
3. **Bot detect** event dan jalankan `guildMemberAdd.ts`
4. **Bot show** "typing..." di #welcome channel
5. **AI generate** pantun kreatif untuk "Budi"
6. **Bot send** message:
   ```
   @Budi Pergi ke pasar beli roti
   Pulang-pulang mampir ke tukang sate
   Selamat datang Budi ke komunitas ini
   Yuk kenalan, jangan malu-malu ngobrolnya! 🎉
   ```
7. **Budi reply** "Halo semua!"
8. **Jika auto-reply enabled**, bot reply lagi dengan conversation!

---

**Selamat menggunakan Welcome Message! 🎉**

Setup dengan `/setchannel welcome` lalu test dengan invite temanmu atau re-join server!
