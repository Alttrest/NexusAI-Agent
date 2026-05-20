import { ipcMain } from 'electron'
import { OpenRouterService } from '../services/openrouter.service'
import { SettingsService } from '../services/settings.service'
import { NEXUS_TOOLS } from '../services/skills.schema'
import { executeSkill } from './skills.ipc'
import { petWindow } from '../index'

let openRouterService: OpenRouterService | null = null

function getService(): OpenRouterService {
  if (!openRouterService) {
    const settings = SettingsService.getInstance()
    const apiKey = settings.get('openRouterApiKey') as string || ''
    openRouterService = new OpenRouterService(apiKey)
  }
  return openRouterService
}

export function registerChatHandlers(): void {
  ipcMain.handle('chat:send', async (_event, model: string, messages: any[]) => {
    try {
      const service = getService()
      const response = await service.chat(model, messages, NEXUS_TOOLS)
      return { success: true, data: response }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('chat:send-stream', async (event, model: string, messages: any[]) => {
    try {
      const service = getService()
      let conversationMessages = [
        { 
          role: 'system', 
          content: `You are NexusAI, an advanced agentic operating system assistant.
STRICT DIRECTIVES:
1. NEVER hallucinate web links, file operations, or mock simulated data. You MUST trigger the appropriate JSON tool call to fetch real data or modify files.
2. If asked to search or create, use 'web_scrape' or 'file_write'. Do not just say "I have created it" without invoking the tool.
3. If a file operation fails with a permission error (EPERM/EACCES), retry using the user's project root directory instead of restricted folders like Desktop or C:\\temp.
4. Always provide concise, actionable answers after the tool execution completes.`
        },
        ...messages
      ]

      // Tool-call loop: keep going until the LLM produces a text response
      const MAX_TOOL_ROUNDS = 10
      petWindow?.webContents.send('pet:state-change', 'thinking')
      for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
        const stream = await service.chatStream(model, conversationMessages, NEXUS_TOOLS)

        let contentBuffer = ''
        let toolCallsBuffer: any[] = []
        let currentToolCalls: Record<number, { id: string; name: string; arguments: string }> = {}

        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta
          const finishReason = chunk.choices[0]?.finish_reason

          // Accumulate content
          if (delta?.content) {
            contentBuffer += delta.content
            event.sender.send('chat:stream-chunk', delta.content)
          }

          // Accumulate tool calls
          if (delta?.tool_calls) {
            for (const tc of delta.tool_calls) {
              const idx = tc.index ?? 0
              if (!currentToolCalls[idx]) {
                currentToolCalls[idx] = { id: tc.id || '', name: '', arguments: '' }
              }
              if (tc.id) currentToolCalls[idx].id = tc.id
              if (tc.function?.name) currentToolCalls[idx].name = tc.function.name
              if (tc.function?.arguments) currentToolCalls[idx].arguments += tc.function.arguments
            }
          }
        }

        // Convert accumulated tool calls to array
        toolCallsBuffer = Object.values(currentToolCalls).filter(tc => tc.name)

        // If no tool calls, we're done — the LLM gave a final text answer
        if (toolCallsBuffer.length === 0) {
          break
        }

        // Notify renderer about tool calls being executed
        petWindow?.webContents.send('pet:state-change', 'action')
        event.sender.send('chat:stream-activity', {
          type: 'thinking',
          message: `I need to use ${toolCallsBuffer.length} tool(s) to process this request.`
        })

        // Build the assistant message with tool_calls
        const assistantMsg: any = {
          role: 'assistant',
          content: contentBuffer || null,
          tool_calls: toolCallsBuffer.map(tc => ({
            id: tc.id,
            type: 'function',
            function: { name: tc.name, arguments: tc.arguments }
          }))
        }
        conversationMessages.push(assistantMsg)

        // Execute each tool call and add results
        for (const tc of toolCallsBuffer) {
          let args: Record<string, any> = {}
          try {
            args = JSON.parse(tc.arguments)
          } catch {
            args = {}
          }

          event.sender.send('chat:stream-activity', {
            type: 'action',
            message: `Executing ${tc.name} with arguments: ${JSON.stringify(args)}`
          })

          let result: string
          try {
            result = await executeSkill(tc.name, args)
          } catch (err: any) {
            result = `Error: ${err.message}`
          }

          event.sender.send('chat:stream-activity', {
            type: 'result',
            message: `Result from ${tc.name}: ${result.slice(0, 100)}${result.length > 100 ? '...' : ''}`
          })

          conversationMessages.push({
            role: 'tool',
            tool_call_id: tc.id,
            content: result
          })
        }

        petWindow?.webContents.send('pet:state-change', 'thinking')
        // Loop continues — the LLM will now process tool results
      }

      petWindow?.webContents.send('pet:state-change', 'idle')
      event.sender.send('chat:stream-end')
      return { success: true }
    } catch (error: any) {
      petWindow?.webContents.send('pet:state-change', 'idle')
      event.sender.send('chat:stream-error', error.message)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('chat:list-models', async () => {
    try {
      const service = getService()
      const models = await service.listModels()
      return { success: true, data: models }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('chat:update-api-key', async (_event, apiKey: string) => {
    const settings = SettingsService.getInstance()
    settings.set('openRouterApiKey', apiKey)
    openRouterService = new OpenRouterService(apiKey)
    return { success: true }
  })
}
