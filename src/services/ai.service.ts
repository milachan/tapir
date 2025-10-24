import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { HfInference } from '@huggingface/inference';

export class AIService {
  private provider: string;
  private openai?: OpenAI;
  private gemini?: GoogleGenerativeAI;
  private groq?: Groq;
  private hf?: HfInference;
  private deepseek?: OpenAI;
  private together?: OpenAI;
  private model: string;
  private imageProvider: string;

  // Helper function to clean environment variables (remove quotes)
  private cleanEnv(value: string | undefined): string | undefined {
    if (!value) return value;
    // Remove leading/trailing quotes and whitespace
    const cleaned = value.trim().replace(/^["']|["']$/g, '');
    return cleaned || undefined; // Return undefined if empty string after cleaning
  }

  constructor() {
    // Debug: Print all relevant env vars (first 10 chars only for security)
    console.log('🔍 Environment Variables Check:');
    console.log('   AI_PROVIDER:', process.env.AI_PROVIDER ? 'SET' : 'NOT SET');
    console.log('   GROQ_API_KEY:', process.env.GROQ_API_KEY ? `${process.env.GROQ_API_KEY.substring(0, 10)}...` : 'NOT SET');
    console.log('   DISCORD_TOKEN:', process.env.DISCORD_TOKEN ? 'SET' : 'NOT SET');
    
    this.provider = this.cleanEnv(process.env.AI_PROVIDER) || 'groq';
    this.imageProvider = this.cleanEnv(process.env.IMAGE_PROVIDER) || 'pollinations'; // Changed default to pollinations (free, no API key)
    
    console.log('🔧 AI Provider:', this.provider);
    console.log('🖼️ Image Provider:', this.imageProvider);
    
    if (this.provider === 'openai') {
      const apiKey = this.cleanEnv(process.env.OPENAI_API_KEY);
      if (!apiKey) throw new Error('OPENAI_API_KEY is required but not set');
      this.openai = new OpenAI({ apiKey });
      this.model = this.cleanEnv(process.env.AI_MODEL_OPENAI) || 'gpt-3.5-turbo';
    } else if (this.provider === 'gemini') {
      const apiKey = this.cleanEnv(process.env.GEMINI_API_KEY) || '';
      if (!apiKey) throw new Error('GEMINI_API_KEY is required but not set');
      this.gemini = new GoogleGenerativeAI(apiKey);
      this.model = this.cleanEnv(process.env.AI_MODEL_GEMINI) || 'gemini-pro';
    } else if (this.provider === 'groq') {
      const rawKey = process.env.GROQ_API_KEY;
      const apiKey = this.cleanEnv(rawKey);
      console.log('🔑 Raw GROQ_API_KEY:', rawKey ? `"${rawKey.substring(0, 10)}..."` : 'undefined');
      console.log('🔑 Cleaned GROQ API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING');
      
      if (!apiKey) {
        throw new Error('GROQ_API_KEY is required but not set. Please check Railway environment variables.');
      }
      
      this.groq = new Groq({ apiKey });
      this.model = this.cleanEnv(process.env.AI_MODEL_GROQ) || 'llama-3.3-70b-versatile';
    } else if (this.provider === 'huggingface') {
      const apiKey = this.cleanEnv(process.env.HUGGINGFACE_API_KEY);
      if (!apiKey) throw new Error('HUGGINGFACE_API_KEY is required but not set');
      this.hf = new HfInference(apiKey);
      this.model = this.cleanEnv(process.env.AI_MODEL_HUGGINGFACE) || 'meta-llama/Llama-3.2-3B-Instruct';
    } else if (this.provider === 'deepseek') {
      const apiKey = this.cleanEnv(process.env.DEEPSEEK_API_KEY);
      this.deepseek = new OpenAI({
        apiKey,
        baseURL: 'https://api.deepseek.com',
      });
      this.model = this.cleanEnv(process.env.AI_MODEL_DEEPSEEK) || 'deepseek-chat';
    } else if (this.provider === 'together') {
      const apiKey = this.cleanEnv(process.env.TOGETHER_API_KEY);
      this.together = new OpenAI({
        apiKey,
        baseURL: 'https://api.together.xyz/v1',
      });
      this.model = this.cleanEnv(process.env.AI_MODEL_TOGETHER) || 'lmsys/vicuna-13b-v1.5';
    }

    // Initialize image generation providers
    if (this.imageProvider === 'openai') {
      if (!this.openai) {
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
      }
    } else if (this.imageProvider === 'huggingface') {
      if (!this.hf) {
        this.hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
      }
    }
  }

  async chat(prompt: string, conversationHistory?: Array<{ role: string; content: string }>): Promise<string> {
    try {
      if (this.provider === 'openai' && this.openai) {
        return await this.chatOpenAI(prompt, conversationHistory);
      } else if (this.provider === 'gemini' && this.gemini) {
        return await this.chatGemini(prompt);
      } else if (this.provider === 'groq' && this.groq) {
        return await this.chatGroq(prompt, conversationHistory);
      } else if (this.provider === 'huggingface' && this.hf) {
        return await this.chatHuggingFace(prompt, conversationHistory);
      } else if (this.provider === 'deepseek' && this.deepseek) {
        return await this.chatDeepSeek(prompt, conversationHistory);
      } else if (this.provider === 'together' && this.together) {
        return await this.chatTogether(prompt, conversationHistory);
      }
      
      throw new Error('No AI provider configured');
    } catch (error) {
      console.error('AI Service Error:', error);
      throw error;
    }
  }

  private async chatOpenAI(prompt: string, conversationHistory?: Array<{ role: string; content: string }>): Promise<string> {
    const messages: any[] = conversationHistory || [];
    
    // Tambahkan system prompt bahasa Indonesia jika belum ada
    if (messages.length === 0 || messages[0].role !== 'system') {
      messages.unshift({
        role: 'system',
        content: 'Kamu adalah asisten AI yang SELALU menjawab dalam Bahasa Indonesia. Jawab dengan singkat, jelas, dan ramah. WAJIB gunakan Bahasa Indonesia untuk semua respons.'
      });
    }
    
    messages.push({ role: 'user', content: prompt });

    const completion = await this.openai!.chat.completions.create({
      model: this.model,
      messages: messages,
      max_tokens: parseInt(process.env.MAX_TOKENS || '500'),
      temperature: parseFloat(process.env.TEMPERATURE || '0.7'),
    });

    return completion.choices[0]?.message?.content || 'Tidak ada respons dari AI.';
  }

  private async chatGemini(prompt: string): Promise<string> {
    const model = this.gemini!.getGenerativeModel({ model: this.model });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  private async chatGroq(prompt: string, conversationHistory?: Array<{ role: string; content: string }>): Promise<string> {
    const messages: any[] = conversationHistory || [];
    
    // Tambahkan system prompt bahasa Indonesia jika belum ada
    if (messages.length === 0 || messages[0].role !== 'system') {
      messages.unshift({
        role: 'system',
        content: 'Kamu adalah asisten AI yang SELALU menjawab dalam Bahasa Indonesia. Jawab dengan singkat, jelas, dan ramah. WAJIB gunakan Bahasa Indonesia untuk semua respons.'
      });
    }
    
    messages.push({ role: 'user', content: prompt });

    const completion = await this.groq!.chat.completions.create({
      model: this.model,
      messages: messages,
      max_tokens: parseInt(process.env.MAX_TOKENS || '1000'),
      temperature: parseFloat(process.env.TEMPERATURE || '0.7'),
    });

    return completion.choices[0]?.message?.content || 'Tidak ada respons dari AI.';
  }

  private async chatHuggingFace(prompt: string, conversationHistory?: Array<{ role: string; content: string }>): Promise<string> {
    // Build conversation context as a single prompt
    let fullPrompt = '';
    
    if (conversationHistory && conversationHistory.length > 0) {
      for (const msg of conversationHistory) {
        if (msg.role === 'system') {
          fullPrompt += `${msg.content}\n\n`;
        } else if (msg.role === 'user') {
          fullPrompt += `User: ${msg.content}\n`;
        } else if (msg.role === 'assistant') {
          fullPrompt += `Assistant: ${msg.content}\n`;
        }
      }
      fullPrompt += `User: ${prompt}\nAssistant:`;
    } else {
      fullPrompt = `User: ${prompt}\nAssistant:`;
    }

    const response = await this.hf!.textGeneration({
      model: this.model,
      inputs: fullPrompt,
      parameters: {
        max_new_tokens: parseInt(process.env.MAX_TOKENS || '500'),
        temperature: parseFloat(process.env.TEMPERATURE || '0.7'),
        return_full_text: false,
        stop: ['User:', '\nUser:'],
      }
    });

    return response.generated_text.trim() || 'Tidak ada respons dari AI.';
  }

  private async chatDeepSeek(prompt: string, conversationHistory?: Array<{ role: string; content: string }>): Promise<string> {
    const messages: any[] = conversationHistory || [];
    
    // Tambahkan system prompt bahasa Indonesia jika belum ada
    if (messages.length === 0 || messages[0].role !== 'system') {
      messages.unshift({
        role: 'system',
        content: 'Kamu adalah asisten AI yang SELALU menjawab dalam Bahasa Indonesia. Jawab dengan singkat, jelas, dan ramah. WAJIB gunakan Bahasa Indonesia untuk semua respons.'
      });
    }
    
    messages.push({ role: 'user', content: prompt });

    const completion = await this.deepseek!.chat.completions.create({
      model: this.model,
      messages: messages,
      max_tokens: parseInt(process.env.MAX_TOKENS || '500'),
      temperature: parseFloat(process.env.TEMPERATURE || '0.7'),
    });

    return completion.choices[0]?.message?.content || 'Tidak ada respons dari AI.';
  }

  private async chatTogether(prompt: string, conversationHistory?: Array<{ role: string; content: string }>): Promise<string> {
    const messages: any[] = conversationHistory || [];
    
    // Tambahkan system prompt bahasa Indonesia jika belum ada
    if (messages.length === 0 || messages[0].role !== 'system') {
      messages.unshift({
        role: 'system',
        content: 'Kamu adalah asisten AI yang SELALU menjawab dalam Bahasa Indonesia. Jawab dengan singkat, jelas, dan ramah. WAJIB gunakan Bahasa Indonesia untuk semua respons.'
      });
    }
    
    messages.push({ role: 'user', content: prompt });

    const completion = await this.together!.chat.completions.create({
      model: this.model,
      messages: messages,
      max_tokens: parseInt(process.env.MAX_TOKENS || '500'),
      temperature: parseFloat(process.env.TEMPERATURE || '0.7'),
    });

    return completion.choices[0]?.message?.content || 'Tidak ada respons dari AI.';
  }

  async generateImage(prompt: string): Promise<string | null> {
    try {
      console.log(`🎨 [IMAGE] Provider: ${this.imageProvider}, Prompt: "${prompt}"`);
      
      if (this.imageProvider === 'openai' && this.openai) {
        console.log(`🤖 [IMAGE] Using OpenAI DALL-E...`);
        const response = await this.openai.images.generate({
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: "1024x1024",
        });
        const url = response.data[0]?.url || null;
        console.log(`✅ [IMAGE] OpenAI URL: ${url}`);
        return url;
      } else if (this.imageProvider === 'huggingface' && this.hf) {
        console.log(`🤗 [IMAGE] Using Hugging Face Stable Diffusion...`);
        const result = await this.hf.textToImage({
          model: 'stabilityai/stable-diffusion-xl-base-1.0',
          inputs: prompt,
        });
        
        // Convert blob to buffer and base64
        const buffer = Buffer.from(await (result as any).arrayBuffer());
        const base64 = buffer.toString('base64');
        console.log(`✅ [IMAGE] Hugging Face base64 length: ${base64.length}`);
        return `data:image/png;base64,${base64}`;
      } else if (this.imageProvider === 'pollinations') {
        // Using image.pollinations.ai with simpler approach
        console.log(`🌸 [IMAGE] Using Pollinations.ai...`);
        const encodedPrompt = encodeURIComponent(prompt);
        // Simpler URL without extra parameters - faster generation
        const url = `https://image.pollinations.ai/prompt/${encodedPrompt}`;
        console.log(`✅ [IMAGE] Pollinations URL: ${url}`);
        return url;
      } else if (this.imageProvider === 'prodia') {
        // Prodia.com - Fast and free alternative
        console.log(`⚡ [IMAGE] Using Prodia...`);
        const encodedPrompt = encodeURIComponent(prompt);
        const url = `https://image.prodia.com/generate?prompt=${encodedPrompt}&model=sd_xl_base_1.0.safetensors`;
        console.log(`✅ [IMAGE] Prodia URL: ${url}`);
        return url;
      }
      
      console.error(`❌ [IMAGE] Unsupported provider: ${this.imageProvider}`);
      throw new Error(`Image generation not supported with provider: ${this.imageProvider}`);
    } catch (error) {
      console.error('❌ [IMAGE] Generation error:', error);
      throw error;
    }
  }
}
