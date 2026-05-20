/**
 * NexusAI — OS-Level Skill Definitions as OpenAI Function-Calling Tool Schemas
 * These are injected into every OpenRouter API call so the LLM can invoke real OS operations.
 */

export interface ToolDefinition {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: {
      type: 'object'
      properties: Record<string, any>
      required: string[]
    }
  }
}

export const NEXUS_TOOLS: ToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'file_read',
      description: 'Read the contents of a file at the given absolute path.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Absolute path to the file to read.' }
        },
        required: ['path']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'file_write',
      description: 'Create or overwrite a file with the given content.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Absolute path to the file to write.' },
          content: { type: 'string', description: 'Content to write to the file.' }
        },
        required: ['path', 'content']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'file_delete',
      description: 'Delete a file or directory at the given path.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Absolute path to the file or directory to delete.' }
        },
        required: ['path']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'list_directory',
      description: 'List all files and subdirectories in a directory.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Absolute path to the directory to list.' }
        },
        required: ['path']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'run_command',
      description: 'Execute a shell command (PowerShell on Windows) and return stdout/stderr.',
      parameters: {
        type: 'object',
        properties: {
          command: { type: 'string', description: 'The shell command to execute.' },
          cwd: { type: 'string', description: 'Working directory for the command. Optional.' }
        },
        required: ['command']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'web_scrape',
      description: 'Fetch the text content of a URL (web page or API endpoint).',
      parameters: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'The URL to fetch content from.' }
        },
        required: ['url']
      }
    }
  }
]
