const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGemini() {
  console.log('🔍 Testing Gemini API...');
  console.log('API Key:', process.env.GEMINI_API_KEY ? 'Set' : 'Not Set');
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Test different model names
    const modelNames = ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash'];
    
    for (const modelName of modelNames) {
      console.log(`\n📝 Testing model: ${modelName}`);
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say hello in one word');
        const response = await result.response;
        console.log(`✅ ${modelName} works! Response:`, response.text());
        break; // If successful, stop testing
      } catch (error) {
        console.log(`❌ ${modelName} failed:`, error.message);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testGemini();
