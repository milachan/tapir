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

  constructor() {
    this.provider = process.env.AI_PROVIDER || 'groq';
    this.imageProvider = process.env.IMAGE_PROVIDER || 'huggingface';
    
    if (this.provider === 'openai') {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      this.model = process.env.AI_MODEL_OPENAI || 'gpt-3.5-turbo';
    } else if (this.provider === 'gemini') {
      this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
      this.model = process.env.AI_MODEL_GEMINI || 'gemini-pro';
    } else if (this.provider === 'groq') {
      this.groq = new Groq({
        apiKey: process.env.GROQ_API_KEY,
      });
      this.model = process.env.AI_MODEL_GROQ || 'llama-3.3-70b-versatile';
    } else if (this.provider === 'huggingface') {
      this.hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
      this.model = process.env.AI_MODEL_HUGGINGFACE || 'meta-llama/Llama-3.2-3B-Instruct';
    } else if (this.provider === 'deepseek') {
      this.deepseek = new OpenAI({
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL: 'https://api.deepseek.com',
      });
      this.model = process.env.AI_MODEL_DEEPSEEK || 'deepseek-chat';
    } else if (this.provider === 'together') {
      this.together = new OpenAI({
        apiKey: process.env.TOGETHER_API_KEY,
        baseURL: 'https://api.together.xyz/v1',
      });
      this.model = process.env.AI_MODEL_TOGETHER || 'lmsys/vicuna-13b-v1.5';
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
      if (this.imageProvider === 'openai' && this.openai) {
        const response = await this.openai.images.generate({
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: "1024x1024",
        });
        return response.data[0]?.url || null;
      } else if (this.imageProvider === 'huggingface' && this.hf) {
        const result = await this.hf.textToImage({
          model: 'stabilityai/stable-diffusion-xl-base-1.0',
          inputs: prompt,
        });
        
        // Convert blob to buffer and base64
        const buffer = Buffer.from(await (result as any).arrayBuffer());
        const base64 = buffer.toString('base64');
        return `data:image/png;base64,${base64}`;
      } else if (this.imageProvider === 'pollinations') {
        // Pollinations.ai - 100% gratis, no API key needed!
        const encodedPrompt = encodeURIComponent(prompt);
        return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`;
      }
      
      throw new Error(`Image generation not supported with provider: ${this.imageProvider}`);
    } catch (error) {
      console.error('Image generation error:', error);
      throw error;
    }
  }
}
