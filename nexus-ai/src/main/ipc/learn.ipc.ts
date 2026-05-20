import { ipcMain, BrowserWindow, desktopCapturer, screen } from 'electron'
import { join } from 'path'
import { OpenRouterService } from '../services/openrouter.service'
import { SettingsService } from '../services/settings.service'

let overlayWindow: BrowserWindow | null = null

function getMainWindow(): BrowserWindow | null {
  const windows = BrowserWindow.getAllWindows()
  return windows.find(w => !w.isDestroyed() && w !== overlayWindow) || null
}

export function registerLearnHandlers(): void {
  ipcMain.handle('learn:start-session', async () => {
    try {
      if (overlayWindow && !overlayWindow.isDestroyed()) {
        overlayWindow.close()
      }

      const primaryDisplay = screen.getPrimaryDisplay()
      const { width, height } = primaryDisplay.workAreaSize

      overlayWindow = new BrowserWindow({
        width,
        height,
        x: 0,
        y: 0,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        skipTaskbar: true,
        focusable: false,
        resizable: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          preload: join(__dirname, '../preload/index.js')
        }
      })

      overlayWindow.setIgnoreMouseEvents(true, { forward: true })

      // Load inline overlay HTML
      const overlayHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; font-family: sans-serif; }
            html, body { width: 100vw; height: 100vh; overflow: hidden; background: transparent; }
            .dot {
              display: none;
              position: absolute;
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background: radial-gradient(circle, rgba(0,150,255,0.9), rgba(0,100,255,0.3));
              box-shadow: 0 0 20px rgba(0,150,255,0.8), 0 0 60px rgba(0,150,255,0.4), 0 0 100px rgba(0,150,255,0.2);
              transform: translate(-50%, -50%);
              animation: pulse 1.5s ease-in-out infinite;
              z-index: 99999;
              pointer-events: none;
            }
            .dot.visible { display: block; }
            .dot-ring {
              position: absolute;
              top: 50%;
              left: 50%;
              width: 50px;
              height: 50px;
              border: 2px solid rgba(0,150,255,0.5);
              border-radius: 50%;
              transform: translate(-50%, -50%);
              animation: ring-expand 1.5s ease-out infinite;
            }
            @keyframes pulse {
              0%, 100% { transform: translate(-50%, -50%) scale(1); }
              50% { transform: translate(-50%, -50%) scale(1.3); }
            }
            @keyframes ring-expand {
              0% { width: 28px; height: 28px; opacity: 1; }
              100% { width: 80px; height: 80px; opacity: 0; }
            }
            
            /* Chatbox */
            #chatbox {
              position: fixed;
              top: 20px;
              right: 20px;
              width: 320px;
              background: rgba(10, 10, 20, 0.85);
              backdrop-filter: blur(10px);
              border: 1px solid rgba(0, 255, 130, 0.3);
              border-radius: 12px;
              display: flex;
              flex-direction: column;
              z-index: 100000;
              pointer-events: auto; /* Make chatbox clickable */
              box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            }
            #chat-header {
              padding: 12px 16px;
              border-b: 1px solid rgba(255,255,255,0.1);
              color: white;
              font-size: 14px;
              font-weight: bold;
              display: flex;
              justify-content: space-between;
            }
            #chat-log {
              height: 250px;
              overflow-y: auto;
              padding: 12px;
              display: flex;
              flex-direction: column;
              gap: 8px;
            }
            .msg { padding: 8px 12px; border-radius: 8px; font-size: 13px; color: white; max-width: 85%; line-height: 1.4; }
            .msg.user { background: rgba(0, 255, 130, 0.2); align-self: flex-end; border: 1px solid rgba(0,255,130,0.3); }
            .msg.ai { background: rgba(255, 255, 255, 0.1); align-self: flex-start; }
            
            #chat-input-container {
              display: flex;
              padding: 12px;
              border-t: 1px solid rgba(255,255,255,0.1);
            }
            #chat-input {
              flex: 1;
              background: rgba(0,0,0,0.5);
              border: 1px solid rgba(255,255,255,0.2);
              border-radius: 6px;
              padding: 8px 12px;
              color: white;
              outline: none;
              font-size: 13px;
            }
            #chat-input:focus { border-color: rgba(0, 255, 130, 0.5); }
          </style>
        </head>
        <body>
          <div class="dot" id="guide-dot">
            <div class="dot-ring"></div>
          </div>
          
          <div id="chatbox">
            <div id="chat-header">
              <span>Agent Link</span>
              <span style="color: rgba(0,255,130,0.8); font-size: 12px;">Active</span>
            </div>
            <div id="chat-log">
              <div class="msg ai">I am analyzing your screen. Tell me what you want to do.</div>
            </div>
            <div id="chat-input-container">
              <input type="text" id="chat-input" placeholder="Ask a question..." />
            </div>
          </div>

          <script>
            const { ipcRenderer } = require('electron');
            
            // Drag and Drop
            const chatbox = document.getElementById('chatbox');
            const chatHeader = document.getElementById('chat-header');
            let isDragging = false;
            let currentX;
            let currentY;
            let initialX;
            let initialY;
            let xOffset = 0;
            let yOffset = 0;

            chatHeader.addEventListener('mousedown', dragStart);
            document.addEventListener('mouseup', dragEnd);
            document.addEventListener('mousemove', drag);

            function dragStart(e) {
              initialX = e.clientX - xOffset;
              initialY = e.clientY - yOffset;
              if (e.target === chatHeader || chatHeader.contains(e.target)) {
                isDragging = true;
              }
            }
            function dragEnd(e) {
              initialX = currentX;
              initialY = currentY;
              isDragging = false;
            }
            function drag(e) {
              if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                xOffset = currentX;
                yOffset = currentY;
                chatbox.style.transform = \`translate3d(\${currentX}px, \${currentY}px, 0)\`;
              }
            }
            
            // Allow pointer events through body, but capture on chatbox
            document.body.addEventListener('mouseenter', () => ipcRenderer.send('set-ignore-mouse-events', true, { forward: true }));
            chatbox.addEventListener('mouseenter', () => ipcRenderer.send('set-ignore-mouse-events', false));
            chatbox.addEventListener('mouseleave', () => ipcRenderer.send('set-ignore-mouse-events', true, { forward: true }));

            const log = document.getElementById('chat-log');
            const input = document.getElementById('chat-input');
            
            function addMessage(role, text) {
              const div = document.createElement('div');
              div.className = 'msg ' + role;
              div.innerText = text;
              log.appendChild(div);
              log.scrollTop = log.scrollHeight;
            }

            input.addEventListener('keydown', (e) => {
              if (e.key === 'Enter' && input.value.trim()) {
                const text = input.value.trim();
                addMessage('user', text);
                input.value = '';
                
                // Call main process
                ipcRenderer.invoke('learn:overlay-chat', text).then(res => {
                  if(res.success) {
                    addMessage('ai', res.data);
                  } else {
                    addMessage('ai', 'Error: ' + res.error);
                  }
                });
              }
            });

            window.addEventListener('message', (e) => {
              if (e.data.type === 'move-dot') {
                const dot = document.getElementById('guide-dot');
                const ratio = window.devicePixelRatio || 1;
                dot.style.left = (e.data.x / ratio) + 'px';
                dot.style.top = (e.data.y / ratio) + 'px';
                dot.classList.add('visible');
              }
              if (e.data.type === 'hide-dot') {
                document.getElementById('guide-dot').classList.remove('visible');
              }
            });
          </script>
        </body>
        </html>
      `

      overlayWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(overlayHTML)}`)

      overlayWindow.on('closed', () => {
        overlayWindow = null
      })

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('learn:capture-screen', async () => {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: { width: 1920, height: 1080 }
      })

      if (sources.length === 0) {
        return { success: false, error: 'No screen sources found' }
      }

      const screenshot = sources[0].thumbnail.toDataURL()
      return { success: true, data: screenshot }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('learn:send-vision', async (_event, screenshot: string, task: string, model: string) => {
    try {
      const settings = SettingsService.getInstance()
      const apiKey = settings.get('openRouterApiKey') as string || ''
      const service = new OpenRouterService(apiKey)

      const response = await service.chat(
        model || 'openai/gpt-4o',
        [
          {
            role: 'system',
            content: `You are a screen guidance assistant. The user wants to learn how to do a task on their computer.
You will receive a screenshot of their screen. Analyze it and provide step-by-step guidance.
For each step, respond with a JSON object:
{
  "step": "description of what to do",
  "x": <x coordinate of where to click on screen>,
  "y": <y coordinate of where to click on screen>,
  "action": "click" | "type" | "scroll" | "wait",
  "details": "any additional info"
}
If you cannot determine exact coordinates, estimate based on the UI elements visible.
Respond with a JSON array of step objects.`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: `Task: ${task}. Analyze this screenshot and tell me where to click and what to do.` },
              { type: 'image_url', image_url: { url: screenshot } }
            ]
          }
        ]
      )

      return { success: true, data: response.content }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('learn:show-dot', async (_event, x: number, y: number) => {
    try {
      if (overlayWindow && !overlayWindow.isDestroyed()) {
        overlayWindow.webContents.executeJavaScript(`
          const dot = document.getElementById('guide-dot');
          dot.style.left = '${x}px';
          dot.style.top = '${y}px';
          dot.classList.add('visible');
        `)
      }
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('learn:hide-dot', async () => {
    try {
      if (overlayWindow && !overlayWindow.isDestroyed()) {
        overlayWindow.webContents.executeJavaScript(`
          document.getElementById('guide-dot').classList.remove('visible');
        `)
      }
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) {
      win.setIgnoreMouseEvents(ignore, options)
      if (!ignore) {
        win.focus()
      }
    }
  })

  ipcMain.handle('learn:overlay-chat', async (_event, message: string) => {
    try {
      const settings = SettingsService.getInstance()
      const apiKey = settings.get('openRouterApiKey') as string || ''
      const service = new OpenRouterService(apiKey)

      const response = await service.chat(
        'openai/gpt-4o-mini', // Fast model for chat
        [
          { role: 'system', content: 'You are helping the user via a screen overlay chat. Be very concise and helpful.' },
          { role: 'user', content: message }
        ]
      )

      return { success: true, data: response.content }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('learn:stop-session', async () => {
    try {
      if (overlayWindow && !overlayWindow.isDestroyed()) {
        overlayWindow.close()
        overlayWindow = null
      }
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
