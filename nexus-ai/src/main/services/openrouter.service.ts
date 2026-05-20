import OpenAI from 'openai'

export class OpenRouterService {
  private client: OpenAI

  constructor(apiKey: string) {
    this.client = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: apiKey,
      defaultHeaders: {
        'HTTP-Referer': 'https://github.com/nexus-ai', // Replace with actual URL if hosted
        'X-OpenRouter-Title': 'NexusAI',
      }
    })
  }

  async chat(model: string, messages: any[], tools?: any[]) {
    const params: any = {
      model,
      messages,
    }
    if (tools && tools.length > 0) {
      params.tools = tools
    }

    const response = await this.client.chat.completions.create(params)
    return response.choices[0].message
  }

  async chatStream(model: string, messages: any[], tools?: any[]) {
    const params: any = {
      model,
      messages,
      stream: true,
    }
    if (tools && tools.length > 0) {
      params.tools = tools
    }

    return await this.client.chat.completions.create(params)
  }

  async listModels() {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models')
      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Failed to fetch OpenRouter models:', error)
      return []
    }
  }
}
