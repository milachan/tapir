const { HfInference } = require('@huggingface/inference');
require('dotenv').config();

async function testHuggingFace() {
  console.log('🔍 Testing Hugging Face API...');
  console.log('API Key:', process.env.HUGGINGFACE_API_KEY ? process.env.HUGGINGFACE_API_KEY.substring(0, 10) + '...' : 'Not Set');
  
  try {
    const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
    
    console.log('\n📝 Testing text generation...');
    const result = await hf.textGeneration({
      model: 'gpt2',
      inputs: 'Hello, my name is',
    });
    
    console.log('✅ Text generation works!');
    console.log('Result:', result.generated_text.substring(0, 50) + '...');
    
    console.log('\n🎨 Testing image generation...');
    const imageResult = await hf.textToImage({
      model: 'black-forest-labs/FLUX.1-schnell',
      inputs: 'a cute cat',
    });
    
    console.log('✅ Image generation works!');
    console.log('Result type:', typeof imageResult);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nKemungkinan masalah:');
    console.log('1. API key salah atau expired');
    console.log('2. API key belum diaktifkan');
    console.log('3. Format API key salah (harus dimulai dengan "hf_")');
    console.log('\nCara mendapatkan API key baru:');
    console.log('1. Login ke https://huggingface.co/');
    console.log('2. Klik profile → Settings → Access Tokens');
    console.log('3. Buat token baru dengan role "read"');
  }
}

testHuggingFace();
