# 📦 Persiapan Deploy ke Railway - Lengkap

## Step 1: Install Git (Jika Belum Ada)

1. **Download Git**
   - Buka: https://git-scm.com/download/win
   - Download "64-bit Git for Windows Setup"
   - Install dengan semua pilihan default (Next > Next > Install)

2. **Restart VS Code**
   - Tutup VS Code
   - Buka lagi agar Git terdeteksi

## Step 2: Setup Git (First Time)

Buka terminal baru di VS Code dan jalankan:

```powershell
git config --global user.name "Nama Kamu"
git config --global user.email "email@example.com"
```

## Step 3: Buat GitHub Account

1. Buka https://github.com/signup
2. Daftar dengan email
3. Verify email
4. Login ke GitHub

## Step 4: Buat Repository Baru

1. Buka https://github.com/new
2. **Repository name**: `ai-discord-bot`
3. **Description**: "AI-powered Discord bot with multiple providers"
4. Pilih **Public** atau **Private**
5. **JANGAN** centang "Add a README file"
6. Klik **"Create repository"**

## Step 5: Push Code ke GitHub

Copy-paste commands ini satu per satu di terminal VS Code (folder ai-bot):

```powershell
# 1. Inisialisasi Git
cd ai-bot
git init

# 2. Tambahkan semua file
git add .

# 3. Commit pertama
git commit -m "Initial commit - AI Discord Bot"

# 4. Rename branch ke main
git branch -M main

# 5. Tambahkan remote (GANTI USERNAME dengan username GitHub kamu!)
git remote add origin https://github.com/USERNAME/ai-discord-bot.git

# 6. Push ke GitHub
git push -u origin main
```

**Login GitHub di Terminal:**
- Username: masukkan username GitHub
- Password: **JANGAN** pakai password! Pakai **Personal Access Token**

### Cara Buat Personal Access Token:
1. Buka: https://github.com/settings/tokens
2. Klik "Generate new token" > "Generate new token (classic)"
3. Note: "Railway Deploy Token"
4. Expiration: No expiration
5. Centang: **repo** (semua checkbox di bawahnya)
6. Klik "Generate token"
7. **COPY TOKEN** (hanya muncul 1x!)
8. Paste token sebagai password di terminal

## Step 6: Deploy ke Railway

### A. Buat Akun Railway
1. Buka https://railway.app/
2. Klik "Login with GitHub"
3. Authorize Railway

### B. Deploy Project
1. Klik "New Project"
2. Pilih "Deploy from GitHub repo"
3. Pilih repository `ai-discord-bot`
4. Railway akan otomatis detect dan build!

### C. Set Environment Variables
Klik tab **"Variables"** dan tambahkan:

**Copy paste ini satu-satu (ganti dengan nilai dari .env kamu):**

```
DISCORD_TOKEN=your_discord_token_here
```
```
CLIENT_ID=your_client_id_here
```
```
GUILD_ID=your_guild_id_here
```
```
AI_PROVIDER=deepseek
```
```
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```
```
IMAGE_PROVIDER=pollinations
```
```
AI_MODEL_DEEPSEEK=deepseek-chat
```
```
MAX_TOKENS=500
```
```
TEMPERATURE=0.7
```
```
MODERATION_ENABLED=true
```

*(Variables lain optional)*

### D. Deploy!
- Klik "Deploy" jika belum auto-deploy
- Tunggu build selesai (2-5 menit)
- Cek tab **"Logs"** untuk melihat:
  ```
  ✅ Bot siap! Login sebagai tapir#9425
  🤖 AI Provider: deepseek
  ```

## Step 7: Bot Online 24/7! 🎉

Bot sekarang jalan di cloud Railway dan akan:
- ✅ Selalu online 24/7
- ✅ Auto-restart jika crash
- ✅ Auto-deploy setiap git push
- ✅ Gratis dengan $5 credit/bulan

## Update Bot di Masa Depan

Setiap kali mau update:

```powershell
# Edit code kamu
# Lalu:
git add .
git commit -m "deskripsi update"
git push

# Railway otomatis deploy! ✨
```

## Troubleshooting

**"git: command not found"**
- Install Git dari langkah 1
- Restart VS Code

**"Push failed - authentication"**
- Pakai Personal Access Token sebagai password
- Bukan password GitHub biasa!

**"Build failed" di Railway**
- Cek logs untuk error detail
- Pastikan package.json sudah benar

**Bot tidak online di Discord**
- Cek Railway logs tab
- Pastikan DISCORD_TOKEN benar
- Pastikan environment variables lengkap

---

## 🚀 Quick Commands Reference

```powershell
# Update & push
git add .
git commit -m "update message"
git push

# Check status
git status

# View remote
git remote -v

# Pull latest
git pull
```

---

Need help? Check Railway logs atau tanya saya! 😊
