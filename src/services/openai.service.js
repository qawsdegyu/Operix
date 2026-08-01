const { OpenAI } = require('openai');

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENAI_API_KEY,
      defaultHeaders: {
        "HTTP-Referer": "https://operixsys.online",
        "X-Title": "Operix"
      }
    });
  }

  async createChatCompletionStream(messages) {
    try {
      const stream = await this.openai.chat.completions.create({
        model: "openai/gpt-4o-mini", // Using the model currently configured
        messages: messages,
        stream: true,
        temperature: 0.3,
      });
      return stream;
    } catch (error) {
      console.error("OpenAI Service Error:", error);
      throw error;
    }
  }
}

module.exports = new OpenAIService();
