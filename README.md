# 🤖 AI Discord Bot

Bot Discord berbasis AI yang dapat menjawab pertanyaan, ngobrol santai, generate gambar, dan moderasi otomatis menggunakan multiple AI providers.

## ✨ Fitur Utama

- 💬 **Chat dengan AI** - Tanya apa saja dan dapatkan jawaban cerdas dalam Bahasa Indonesia
- 🧠 **Conversation Memory** - Bot ingat percakapan sebelumnya (per-user & per-channel)
- 🎨 **Generate Gambar** - Buat gambar gratis unlimited dengan Pollinations.ai
- 🤖 **Auto-Reply Channel** - Set channel untuk auto-reply semua pesan
- 👋 **Welcome Messages** - Sambut member baru dengan pantun/lelucon AI
- 🛡️ **Smart Moderation** - Deteksi toxic content & spam otomatis
- 👮 **Custom Moderators** - Assign user untuk terima notifikasi pelanggaran
- 🔄 **Multi AI Provider** - Groq, DeepSeek, Together.ai, Hugging Face, OpenAI, Gemini
- ⚡ **Slash Commands** - 6 commands lengkap
- 🎯 **TypeScript** - Full TypeScript untuk type safety
- 🌐 **Bahasa Indonesia** - Semua respons dipaksa dalam Bahasa Indonesia

## 📋 Prerequisites

- Node.js 18+ 
- npm atau yarn
- Discord Bot Token
- OpenAI API Key atau Google Gemini API Key

## 🚀 Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Konfigurasi Environment Variables

Copy file `.env.example` menjadi `.env`:

```bash
copy .env.example .env
```

Edit file `.env` dan isi dengan credentials kamu:

```env
# Discord Bot Configuration
DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_discord_client_id_here
GUILD_ID=your_discord_guild_id_here

# AI Provider (pilih: openai atau gemini)
AI_PROVIDER=gemini

# OpenAI Configuration (jika menggunakan OpenAI)
OPENAI_API_KEY=your_openai_api_key_here

# Google Gemini Configuration (jika menggunakan Gemini)
GEMINI_API_KEY=your_gemini_api_key_here

# Bot Settings
AI_MODEL_OPENAI=gpt-3.5-turbo
AI_MODEL_GEMINI=gemini-pro
MAX_TOKENS=500
TEMPERATURE=0.7
```

### 3. Cara Mendapatkan Credentials

#### Discord Bot Token

1. Kunjungi [Discord Developer Portal](https://discord.com/developers/applications)
2. Klik "New Application" dan beri nama bot kamu
3. Di menu kiri, klik "Bot"
4. Klik "Reset Token" untuk mendapatkan token
5. Copy token dan paste ke `.env`
6. Enable "MESSAGE CONTENT INTENT" di bagian Privileged Gateway Intents
7. Di menu "OAuth2" → "URL Generator":
   - Pilih scope: `bot` dan `applications.commands`
   - Pilih permissions: `Send Messages`, `Use Slash Commands`, `Embed Links`, dll
   - Copy URL dan buka di browser untuk invite bot ke server

#### Client ID dan Guild ID

- **CLIENT_ID**: Ada di menu "General Information" → Application ID
- **GUILD_ID**: 
  1. Buka Discord
  2. Enable Developer Mode (Settings → Advanced → Developer Mode)
  3. Klik kanan pada server → Copy ID

#### OpenAI API Key

1. Kunjungi [OpenAI Platform](https://platform.openai.com/)
2. Login atau buat akun
3. Kunjungi [API Keys](https://platform.openai.com/api-keys)
4. Klik "Create new secret key"
5. Copy key dan paste ke `.env`

#### Google Gemini API Key

1. Kunjungi [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Login dengan akun Google
3. Klik "Create API Key"
4. Copy key dan paste ke `.env`

### 4. Register Slash Commands

```bash
npm run register
```

### 5. Jalankan Bot

Development mode (dengan hot reload):
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

## 🎮 Commands

### User Commands
| Command | Deskripsi | Contoh |
|---------|-----------|---------|
| `/ask [pertanyaan]` | Tanya sesuatu kepada AI dengan conversation memory | `/ask Apa itu JavaScript?` |
| `/chat [pesan]` | Ngobrol santai dengan AI | `/chat Halo, apa kabar?` |
| `/imagine [prompt]` | Generate gambar gratis unlimited | `/imagine A cat wearing sunglasses` |
| `/help` | Tampilkan daftar command | `/help` |

### Admin Commands (Administrator Only)
| Command | Deskripsi | Contoh |
|---------|-----------|---------|
| `/setchannel autoreply` | Add/remove/list channel auto-reply | `/setchannel autoreply action:Add channel:#general` |
| `/setchannel welcome` | Set channel untuk welcome message | `/setchannel welcome channel:#welcome` |
| `/setchannel clearmemory` | Clear conversation memory di channel | `/setchannel clearmemory channel:#general` |
| `/setchannel moderation` | Exclude/include channel dari moderasi | `/setchannel moderation action:Exclude channel:#memes` |
| `/setmoderator add` | Assign user sebagai moderator | `/setmoderator add user:@username` |
| `/setmoderator remove` | Remove user dari moderator | `/setmoderator remove user:@username` |
| `/setmoderator list` | Lihat daftar moderator | `/setmoderator list` |
| `/setmoderator clear` | Clear semua moderator | `/setmoderator clear` |

📖 **[Panduan Moderasi Lengkap →](MODERATION_GUIDE.md)**

## 🏗️ Struktur Proyek

```
ai-bot/
├── src/
│   ├── bot.ts                    # Main bot file
│   ├── register-commands.ts      # Command registration
│   ├── commands/                 # Slash commands
│   │   ├── ask.ts
│   │   ├── chat.ts
│   │   ├── imagine.ts
│   │   └── help.ts
│   ├── events/                   # Event handlers
│   │   ├── ready.ts
│   │   └── interactionCreate.ts
│   └── services/                 # Services
│       └── ai.service.ts         # AI integration
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 🔧 Kustomisasi

### Mengubah AI Provider

Edit `.env` dan ubah `AI_PROVIDER`:
- `openai` - Untuk menggunakan OpenAI GPT
- `gemini` - Untuk menggunakan Google Gemini

### Mengubah Model AI

Edit `.env`:
- `AI_MODEL_OPENAI` - Model OpenAI (gpt-3.5-turbo, gpt-4, dll)
- `AI_MODEL_GEMINI` - Model Gemini (gemini-pro, gemini-ultra, dll)

### Menambah Command Baru

1. Buat file baru di `src/commands/nama-command.ts`
2. Gunakan template:

```typescript
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nama-command')
    .setDescription('Deskripsi command'),
  
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply('Hello!');
  },
};
```

3. Jalankan `npm run register` untuk register command baru

## 🐛 Troubleshooting

### Bot tidak online
- Pastikan `DISCORD_TOKEN` sudah benar
- Cek apakah bot sudah di-invite ke server

### Commands tidak muncul
- Jalankan `npm run register`
- Tunggu beberapa menit (global commands bisa delay hingga 1 jam)
- Gunakan `GUILD_ID` untuk instant registration di server tertentu

### AI tidak merespons
- Pastikan `AI_PROVIDER` sudah di-set (openai atau gemini)
- Cek API key sudah benar
- Pastikan punya credit/quota di OpenAI atau Gemini

### Error saat compile
- Jalankan `npm install` lagi
- Pastikan Node.js versi 18+
- Hapus folder `node_modules` dan `package-lock.json`, lalu install ulang

## 📝 License

MIT License

## 🤝 Contributing

Pull requests welcome! Untuk perubahan besar, buka issue dulu untuk diskusi.

## 📮 Support

Jika ada pertanyaan atau masalah, silakan buka issue di repository ini.

---

Made with ❤️ and ☕
