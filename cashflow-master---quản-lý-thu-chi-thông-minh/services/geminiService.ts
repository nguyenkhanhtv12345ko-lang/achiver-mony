
import { GoogleGenAI, Modality } from "@google/genai";
import { Transaction, Settings, FinancialStats } from "../types";

export class GeminiService {
  private ai: any;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async getFinancialAdvice(transactions: Transaction[], stats: FinancialStats, query: string) {
    const context = `
      Dữ liệu tài chính hiện tại:
      - Tiền mặt: ${stats.currentCash.toLocaleString()} VND
      - Tài khoản: ${stats.currentBank.toLocaleString()} VND
      - Tổng cộng: ${stats.total.toLocaleString()} VND
      - Khả năng duy trì: ${stats.survivalDays} ngày (dựa trên chi phí cố định)
      - Lịch sử giao dịch: ${JSON.stringify(transactions.slice(-10))}
      
      Hãy đóng vai một chuyên gia tư vấn tài chính. Trả lời câu hỏi của người dùng một cách ngắn gọn, súc tích và hữu ích.
    `;

    const response = await this.ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `${context}\n\nNgười dùng hỏi: ${query}`,
    });

    return response.text;
  }

  async speakText(text: string) {
    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Đọc nội dung sau một cách tự nhiên bằng tiếng Việt: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            // "Kore" often sounds good for Asian languages if localized, 
            // but we'll stick to a standard one known for quality.
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      await this.playAudioFromBase64(base64Audio);
    }
  }

  private async playAudioFromBase64(base64: string) {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const bytes = this.decodeBase64(base64);
    const audioBuffer = await this.decodeAudioData(bytes, audioContext, 24000, 1);
    
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
  }

  private decodeBase64(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  private async decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }
}

export const geminiService = new GeminiService();
