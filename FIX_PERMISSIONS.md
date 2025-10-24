# 🔧 Fix Bot Permissions

## ❌ Error: Missing Permissions (50013)

Bot berhasil detect toxic content tapi tidak bisa delete messages karena kurang permission.

---

## ✅ Solusi 1: Update Bot Permissions (RECOMMENDED)

### Step 1: Buka Discord Developer Portal
1. Kunjungi https://discord.com/developers/applications
2. Pilih aplikasi bot kamu
3. Klik menu **"Bot"** di sidebar kiri

### Step 2: Enable Permissions
Scroll ke bawah, pastikan permissions ini di-enable:
- ✅ **Read Messages/View Channels**
- ✅ **Send Messages**
- ✅ **Manage Messages** ← **INI YANG PENTING!**
- ✅ **Read Message History**
- ✅ **Add Reactions**
- ✅ **Embed Links**

### Step 3: Re-invite Bot ke Server
1. Klik menu **"OAuth2"** → **"URL Generator"**
2. Pilih scope:
   - ✅ `bot`
   - ✅ `applications.commands`
3. Pilih Bot Permissions:
   - ✅ **Read Messages/View Channels**
   - ✅ **Send Messages**
   - ✅ **Manage Messages** ← **WAJIB!**
   - ✅ **Read Message History**
   - ✅ **Embed Links**
   - ✅ **Use Slash Commands**
4. Copy URL yang di-generate
5. Buka URL di browser
6. Pilih server kamu
7. Klik **"Authorize"**

**Note:** Kalau bot sudah ada di server, re-invite akan update permissions tanpa kick bot.

---

## ✅ Solusi 2: Update Bot Role di Server

### Option A: Via Server Settings
1. Buka server Discord kamu
2. Klik kanan server → **Server Settings**
3. Klik **Roles** di sidebar
4. Cari role bot kamu (biasanya nama bot)
5. Scroll ke **Text Permissions**
6. Enable:
   - ✅ **Read Messages**
   - ✅ **Send Messages**
   - ✅ **Manage Messages** ← **INI YANG PENTING!**
   - ✅ **Read Message History**
   - ✅ **Embed Links**
7. Klik **Save Changes**

### Option B: Via Bot User (Quick Fix)
1. Klik kanan pada bot user di member list
2. Pilih **"Roles"**
3. Beri role yang punya **"Manage Messages"** permission
   - Atau buat role baru "Moderator Bot" dengan permissions lengkap

---

## ✅ Solusi 3: Update Role Hierarchy

Pastikan **role bot di ATAS role member biasa**:

```
👑 Owner (kamu)
🤖 Bot Role ← Role bot harus di sini
👤 Members
🎮 Gamers
etc...
```

**Cara:**
1. Server Settings → Roles
2. Drag role bot ke atas member roles
3. Save

**Important:** Bot TIDAK BISA delete pesan dari user yang rolenya LEBIH TINGGI dari bot!

---

## 🧪 Test Setelah Fix

### 1. Pastikan Bot Online
```powershell
cd ai-bot
npm run dev
```

### 2. Test Delete Permission
Kirim pesan toxic:
```
fuck
anjing
tolol
```

### 3. Expected Result
```
✅ Pesan terhapus langsung
✅ Warning muncul
✅ Moderator dapat DM
✅ Console log: Message deleted and warning sent
```

---

## 🔍 Debug Permission Issues

### Check Bot Permissions
Tambahkan logging untuk cek permission bot:

```typescript
// Di messageCreate.ts, sebelum delete message
const permissions = message.channel.permissionsFor(message.guild.members.me);
console.log(`🔐 Bot permissions in this channel:`, {
  ManageMessages: permissions?.has('ManageMessages'),
  SendMessages: permissions?.has('SendMessages'),
  ViewChannel: permissions?.has('ViewChannel')
});
```

---

## ❓ FAQ

**Q: Apakah harus kick dan re-invite bot?**
A: Tidak! Re-invite dengan URL baru akan auto-update permissions.

**Q: Kenapa bot masih tidak bisa delete?**
A: Cek:
1. ✅ Role bot ada permission "Manage Messages"
2. ✅ Role bot hierarchy di atas member
3. ✅ Channel permissions tidak override/block bot

**Q: Apakah bot bisa delete pesan admin?**
A: Tidak, jika role admin lebih tinggi dari role bot.

---

## 📋 Checklist

- [ ] Bot punya permission "Manage Messages"
- [ ] Role bot hierarchy benar
- [ ] Bot sudah di-restart
- [ ] Test dengan pesan toxic
- [ ] Bot berhasil delete pesan
- [ ] Moderator dapat DM notifikasi

---

**Setelah fix permissions, moderasi akan jalan sempurna!** 🛡️✨
