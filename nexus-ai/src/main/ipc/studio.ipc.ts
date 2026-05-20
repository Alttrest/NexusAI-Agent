import { ipcMain } from 'electron'
import { OpenRouterService } from '../services/openrouter.service'
import { SettingsService } from '../services/settings.service'

export function registerStudioHandlers(): void {
  ipcMain.handle('studio:generate', async (_event, prompt: string, model: string) => {
    try {
      const settings = SettingsService.getInstance()
      const apiKey = settings.get('openRouterApiKey') as string || ''

      const service = new OpenRouterService(apiKey)

      // Step 1: True Intent Parsing
      // Use a fast text model to parse the user's simple intent into a detailed prompt
      let enhancedPrompt = prompt
      try {
        const intentResponse = await service.chat(
          'openai/gpt-4o-mini',
          [
            { 
              role: 'system', 
              content: 'You are an expert prompt engineer for image generation models (like Midjourney, DALL-E, Flux). The user will provide a simple intent. Convert it into a highly detailed, professional image generation prompt with lighting, style, camera angle, and mood details. ONLY output the enhanced prompt text, nothing else.' 
            },
            { role: 'user', content: prompt }
          ]
        )
        if (intentResponse.content) {
          enhancedPrompt = intentResponse.content.trim()
        }
      } catch (e) {
        console.warn('Intent parsing failed, falling back to original prompt', e)
      }

      // Step 2: Image Generation via OpenRouter
      // Some models on OpenRouter support image generation (openai/dall-e-3, etc.)
      const response = await fetch('https://openrouter.ai/api/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/nexus-ai',
          'X-OpenRouter-Title': 'NexusAI'
        },
        body: JSON.stringify({
          model: model || 'openai/dall-e-3',
          prompt: enhancedPrompt,
          n: 1,
          size: '1024x1024',
          response_format: 'url'
        })
      })

      if (!response.ok) {
        // Fallback: use chat model to describe what would be generated
        const chatResponse = await service.chat(
          model || 'openai/gpt-4o-mini',
          [
            { role: 'system', content: 'You are an image generation assistant. The user wants to generate an image. Describe in detail what the generated image would look like, and provide any URLs if the model supports it.' },
            { role: 'user', content: `Generate an image: ${prompt}` }
          ]
        )
        return {
          success: true,
          data: {
            type: 'text',
            content: chatResponse.content || 'Image generation not available for this model.',
            url: null
          }
        }
      }

      const data = await response.json()
      const imageUrl = data.data?.[0]?.url || data.data?.[0]?.b64_json

      return {
        success: true,
        data: {
          type: 'image',
          url: imageUrl,
          content: null
        }
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
