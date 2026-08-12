const { OpenAI } = require('openai');

class OpenAIService {
  async createChatCompletionStream(messages, apiKey) {
    if (!apiKey) throw new Error("OpenAI API Key is missing or invalid.");

    // Instantiate a new OpenAI client per request with the dynamic API key
    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1", // Using OpenRouter as configured previously
      apiKey: apiKey,
      defaultHeaders: {
        "HTTP-Referer": "https://operixsys.online",
        "X-Title": "Operix"
      }
    });

    try {
      const stream = await openai.chat.completions.create({
        model: "openai/gpt-4o-mini",
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
