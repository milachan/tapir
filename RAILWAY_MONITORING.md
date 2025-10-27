# 🔍 Railway Monitoring Guide

## Crash Prevention Features

Bot sekarang memiliki fitur-fitur untuk mencegah crash:

### ✅ Global Error Handlers
- **Unhandled Promise Rejection** → Log error, tidak crash
- **Uncaught Exception** → Log error, graceful shutdown
- **Discord Client Errors** → Auto-log, tidak crash

### 📊 Memory Monitoring
Bot akan log memory usage setiap 5 menit:
```
📊 [MEMORY] Heap: 125.45MB / 150.30MB | RSS: 180.22MB
```

**Warning jika >400MB:**
```
⚠️ [MEMORY] High memory usage detected! Consider restarting.
```

### 🧹 Auto Cleanup
- **Garbage Collection** → Setiap 30 menit (jika available)
- **Conversation History** → Max 10 messages per conversation
- **Message Cache** → Auto-clear setelah 5 detik

### 🔄 Graceful Shutdown
Bot akan shutdown dengan aman pada:
- `SIGINT` (Ctrl+C)
- `SIGTERM` (Railway restart)
- Critical errors

---

## 🚨 Cara Cek Jika Bot Crash

### 1. Cek Railway Logs
```
Railway Dashboard → Project → Deployments → Logs
```

**Cari error patterns:**
- `❌ [CRITICAL]` - Critical errors
- `⚠️ [MEMORY]` - Memory warnings
- `Error:` - General errors

### 2. Cek Bot Status di Discord
- Bot offline? ❌
- Bot tidak respond? ⚠️
- Commands timeout? ⚠️

### 3. Cek Railway Metrics
```
Railway Dashboard → Metrics
```
- **CPU** - Jika >80% sustained → problem
- **Memory** - Jika >450MB → near limit
- **Network** - Spike tidak normal

---

## 🔧 Solusi Crash

### Jika Bot Sering Crash:

**1. Memory Leak**
```
Symptom: Memory terus naik, crash setelah beberapa jam
Solution: Railway auto-restart (max 10x), bot akan cleanup otomatis
```

**2. Rate Limit dari AI Provider**
```
Symptom: Error "Rate limit exceeded"
Solution: 
- Groq: 100k tokens/day limit
- Ganti ke provider lain jika perlu
```

**3. Discord Rate Limit**
```
Symptom: Error "You are being rate limited"
Solution: Bot auto-handle rate limits, tunggu beberapa menit
```

**4. Environment Variables Missing**
```
Symptom: Bot crash immediately on startup
Solution: Cek Railway Variables, pastikan semua ada dan TANPA KUTIP
```

---

## 📈 Railway Free Tier Limits

- **Memory**: 512MB
- **CPU**: Shared vCPU
- **Network**: 100GB/month
- **Build time**: 500 hours/month
- **Deployment**: Unlimited

**Tips:**
1. Bot akan auto-restart jika crash (max 10x)
2. Memory monitoring membantu detect leak early
3. Conversation history limited untuk prevent memory bloat

---

## 🆘 Emergency Actions

### Bot Tidak Bisa Start:
1. Cek Railway logs → cari error pertama
2. Cek environment variables → hapus semua kutip
3. Redeploy manual: `Railway → Deployments → Redeploy`

### Bot Crash Terus-Menerus:
1. Cek Railway logs → identify pattern
2. Check memory usage → jika >400MB, tunggu auto-restart
3. Disable features sementara (moderation, auto-reply)

### Out of Memory:
```
Error: JavaScript heap out of memory
```
**Solution:**
1. Railway akan auto-restart
2. Bot cleanup conversation history otomatis
3. Consider upgrade Railway plan

---

## 📝 Logs yang Normal

```
✅ Bot siap! Login sebagai tapir#9425
🤖 AI Provider: groq
📊 Serving 1 server(s)
✅ Monitoring and cleanup tasks started
📊 [MEMORY] Heap: 125.45MB / 150.30MB | RSS: 180.22MB
```

## ❌ Logs yang Bermasalah

```
❌ [CRITICAL] Unhandled Promise Rejection: ...
⚠️ [MEMORY] High memory usage detected!
Error: GROQ_API_KEY environment variable is missing
```

---

## 🎯 Best Practices

1. **Monitor Railway logs** setiap hari sekali
2. **Check bot status** di Discord
3. **Update code** jika ada bug reports
4. **Restart manual** jika bot act weird (Railway dashboard)
5. **Keep Railway env vars updated** (no quotes!)

---

## 📞 Support

Jika masalah persist:
1. Copy Railway logs (last 100 lines)
2. Screenshot error messages
3. Note: kapan crash terjadi, apa yang dilakukan sebelumnya
