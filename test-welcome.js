// Test Welcome Message Generator
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk').default;
require('dotenv').config();

// Gunakan Groq karena gratis
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function testWelcomeMessage(username) {
  const prompt = `Buatkan sambutan hangat untuk member baru Discord bernama "${username}".

SYARAT PENTING:
1. Sambutan harus dalam Bahasa Indonesia yang hangat dan ramah
2. WAJIB buat pantun ATAU lelucon yang KREATIF dan dikaitkan dengan username "${username}"
3. Jika username bisa dijadikan permainan kata, manfaatkan itu untuk pantun/lelucon
4. Gunakan emoji yang sesuai (🎉 👋 😄 🎊 ✨)
5. Ajak member untuk perkenalkan diri
6. Total maksimal 4-5 baris

Sekarang buatkan untuk username "${username}" dengan kreativitasmu!`;

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'Kamu adalah bot yang kreatif, suka berpantun dan membuat lelucon yang lucu. Kamu pandai membuat permainan kata dari nama orang. Sambutan kamu selalu ceria dan menghibur.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.9, // Lebih kreatif
      max_tokens: 500
    });

    const welcomeMessage = response.choices[0].message.content;
    console.log('\n=== WELCOME MESSAGE ===');
    console.log(`@${username}\n`);
    console.log(welcomeMessage);
    console.log('\n======================\n');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Test dengan beberapa username
const testUsernames = [
  'Rafli',
  'Bordeaux19',
  'ShadowKnight',
  'CutiePie123',
  'DragonSlayer'
];

async function runTests() {
  console.log('🎉 Testing Welcome Message Generator...\n');
  
  for (const username of testUsernames) {
    await testWelcomeMessage(username);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Delay 1 detik
  }
  
  console.log('✅ All tests completed!');
}

runTests();
