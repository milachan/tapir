import { Client, Events } from 'discord.js';

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client: Client) {
    console.log(`✅ Bot siap! Login sebagai ${client.user?.tag}`);
    console.log(`🤖 AI Provider: ${process.env.AI_PROVIDER || 'groq'}`);
    console.log(`📊 Serving ${client.guilds.cache.size} server(s)`);
    
    // Memory monitoring every 5 minutes
    setInterval(() => {
      const memUsage = process.memoryUsage();
      const heapUsedMB = (memUsage.heapUsed / 1024 / 1024).toFixed(2);
      const heapTotalMB = (memUsage.heapTotal / 1024 / 1024).toFixed(2);
      const rssMB = (memUsage.rss / 1024 / 1024).toFixed(2);
      
      console.log(`📊 [MEMORY] Heap: ${heapUsedMB}MB / ${heapTotalMB}MB | RSS: ${rssMB}MB`);
      
      // Warning if memory usage is high (> 400MB on Railway)
      if (memUsage.heapUsed > 400 * 1024 * 1024) {
        console.warn(`⚠️ [MEMORY] High memory usage detected! Consider restarting.`);
      }
    }, 5 * 60 * 1000); // Every 5 minutes
    
    // Garbage collection hint every 30 minutes
    setInterval(() => {
      if (global.gc) {
        console.log(`🧹 [GC] Running garbage collection...`);
        global.gc();
      }
    }, 30 * 60 * 1000); // Every 30 minutes
    
    console.log(`✅ Monitoring and cleanup tasks started`);
  },
};
