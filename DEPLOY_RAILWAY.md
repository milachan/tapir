# 🚀 Deploy Bot Discord AI ke Railway

## Langkah 1: Persiapan GitHub

1. **Buat Repository GitHub**
   - Buka https://github.com/new
   - Nama repo: `ai-discord-bot` (atau nama lain)
   - Set ke Public atau Private
   - **JANGAN** centang "Add README" (sudah ada)
   - Klik "Create repository"

2. **Push Code ke GitHub**
   ```bash
   cd ai-bot
   git init
   git add .
   git commit -m "Initial commit - AI Discord Bot"
   git branch -M main
   git remote add origin https://github.com/USERNAME/ai-discord-bot.git
   git push -u origin main
   ```
   *(Ganti USERNAME dengan username GitHub kamu)*

## Langkah 2: Deploy ke Railway

1. **Buka Railway**
   - Pergi ke https://railway.app/
   - Klik "Start a New Project"
   - Login dengan GitHub

2. **Deploy from GitHub**
   - Klik "Deploy from GitHub repo"
   - Pilih repository `ai-discord-bot` yang baru dibuat
   - Klik "Deploy Now"

3. **Set Environment Variables**
   Klik tab "Variables" dan tambahkan satu per satu:
   
   ```
   DISCORD_TOKEN=your_discord_token_here
   CLIENT_ID=your_client_id_here
   GUILD_ID=your_guild_id_here
   
   AI_PROVIDER=deepseek
   DEEPSEEK_API_KEY=your_deepseek_api_key_here
   
   IMAGE_PROVIDER=pollinations
   
   AI_MODEL_OPENAI=gpt-4o-mini
   AI_MODEL_GEMINI=gemini-1.5-pro
   AI_MODEL_GROQ=llama-3.1-8b-instant
   AI_MODEL_HUGGINGFACE=microsoft/DialoGPT-medium
   AI_MODEL_DEEPSEEK=deepseek-chat
   AI_MODEL_TOGETHER=lmsys/vicuna-13b-v1.5
   
   MAX_TOKENS=500
   TEMPERATURE=0.7
   
   MODERATION_ENABLED=true
   TOXIC_THRESHOLD=0.7
   SPAM_DETECTION=true
   
   AUTO_REPLY_CHANNELS=
   WELCOME_CHANNEL_ID=
   ```

4. **Deploy!**
   - Railway akan otomatis build dan deploy
   - Tunggu sampai status berubah menjadi "Success" (hijau)
   - Bot akan langsung online 24/7! 🎉

## Langkah 3: Monitor Bot

- **View Logs**: Klik tab "Logs" untuk melihat output bot
- **Restart**: Klik "Restart" jika perlu restart manual
- **Settings**: Bisa set custom domain, auto-deploy, dll

## Tips:

### ✅ Free Tier Railway
- $5 credit/bulan untuk free account
- Cukup untuk bot kecil-menengah
- Auto-sleep jika idle (tapi bot Discord tidak sleep)

### ✅ Auto-Deploy
Railway akan otomatis re-deploy setiap kali kamu push ke GitHub:
```bash
# Edit code
git add .
git commit -m "Update feature"
git push
# Railway otomatis deploy!
```

### ✅ Ganti AI Provider
Edit di Variables tab, ubah `AI_PROVIDER` ke:
- `groq` - Cepat, 100k tokens/hari
- `deepseek` - $5 credit, powerful
- `together` - Vicuna & Llama models
- `huggingface` - Gratis tapi slow cold start

### ✅ View Bot Status
Lihat di logs apakah bot sukses login:
```
✅ Bot siap! Login sebagai tapir#9425
🤖 AI Provider: deepseek
```

## Troubleshooting

**Bot tidak online?**
- Cek logs untuk error
- Pastikan semua environment variables sudah benar
- Pastikan DISCORD_TOKEN valid

**Build failed?**
- Railway akan auto-install dependencies
- Jika error, cek logs untuk detail

**Kehabisan credit?**
- Upgrade ke Railway Pro ($5/month)
- Atau pindah ke Render/Fly.io

---

## 🎊 Selesai!

Bot kamu sekarang online 24/7 di cloud!

Untuk update bot:
1. Edit code di local
2. `git add . && git commit -m "update"`
3. `git push`
4. Railway auto-deploy! ✨
