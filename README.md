# 🌌 NexusAI - Desktop Agent

**An advanced local AI System Operator featuring an ultra-modern, futuristic interface (Liquid Glass / Cyberpunk) built with Electron, React, and TailwindCSS.**

![NexusAI](https://img.shields.io/badge/NEXUS-AI-00D2FF?style=flat-square)
![License](https://img.shields.io/badge/LICENSE-MIT-00FFAA?style=flat-square)
![Node.js](https://img.shields.io/badge/NODE.JS-18%2B-b53cff?style=flat-square)
![Electron](https://img.shields.io/badge/ELECTRON-v33%2B-blue?style=flat-square)

---

## 🔒 Security & Credentials Note
Security is treated as a first-class citizen. **There are absolutely no hardcoded API keys, passwords, or credentials stored anywhere in the source code.**
When you start the application for the first time, the elegant **Setup Wizard** will safely guide you through entering your API keys (OpenRouter, GitHub, etc.). Your keys are stored locally inside secure OS-level keychain directories and never committed to the repository or Git history.

---

## ✨ Features

NexusAI is packed with premium visual accents, smooth transitions, micro-animations, and cutting-edge features:

*   🤖 **Chat Mode** — Intelligent conversational playground utilizing OpenRouter, featuring real-time stream payloads, full context history, and tool execution loops.
*   🐾 **Holographic AI Pet Window** — A transparent, always-on-top floating desktop companion that changes states based on your AI agent:
    *   `IDLE` (Neon Cyan): Standard waiting state.
    *   `THINKING` (Amber/Orange): Prompting the model or calculating the next step.
    *   `ACTION` (Neon Green): Running active skill calls and system operations.
*   🛡️ **Smart Model & Tool Fallback** — Transparently catches and falls back to normal conversational modes if the chosen OpenRouter model doesn't support system tools, preventing Bad Request 400 crashes.
*   🔓 **Network & TLS Resiliency** — Integrated SSL/TLS bypass to bypass self-signed certificate chain issues (`SELF_SIGNED_CERT_IN_CHAIN`) commonly triggered by security suites (Kaspersky, ESET, etc.) or corporate firewalls.
*   🎨 **Studio Mode** — A creative visual workspace featuring a highly responsive media control grid for assets, images, and audio generation.
*   💻 **Code Mode** — Integrated Monaco Editor with a full right-side workspace file explorer, letting you edit and deploy project changes directly inside the app.
*   🧠 **Learn Mode** — Guided walkthrough tutorials utilizing screen overlays to teach AI orchestration steps.
*   🧙 **Setup Wizard** — An elegant, frameless initialization UI to set your custom keys and repository variables on first run.
*   🌐 **Liquid Glass & Cyberpunk Styling** — High-end visual aesthetics using HSL-tailored neon gradients, premium Google typography, dynamic hover accents, and glassmorphism.
*   🌓 **Theme Toggle** — Seamless light and dark mode switching.

---

## 🛠️ Tech Stack

*   **Core:** [Electron](https://www.electronjs.org/) + [electron-vite](https://electron-vite.org/)
*   **Frontend:** React 18, TypeScript, TailwindCSS v4
*   **State:** Zustand
*   **Editor:** Monaco Editor
*   **AI API:** OpenRouter API (via openai SDK)
*   **System Integrations:** simple-git, recast, vectra

---

## 📁 Architecture

```text
nexus-ai/
├── custom_skills/     # Dynamic runtime skill files and custom scripts
├── src/
│   ├── main/          # Electron main process (Node.js backend, IPC handlers)
│   │   ├── ipc/       # secure IPC communication channels
│   │   └── services/  # Settings manager, OpenRouter API wrappers
│   ├── preload/       # secure Context Bridge
│   └── renderer/      # React frontend (Views, Layouts, Design System)
│       └── src/
│           ├── components/ # Reusable UI components & AI Pet companion
│           ├── pages/      # Chat, Code, Learn, Studio, and Setup pages
│           └── stores/     # App-level Zustand store configurations
```

---

## 🚀 Quick Start

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18+) installed on your local machine.

### Installation Steps:

1.  **Install Dependencies:**
    *We recommend using `--legacy-peer-deps` to bypass Vite 6 / electron-vite peer dependency conflicts:*
    ```bash
    npm install --legacy-peer-deps
    ```

2.  **Run Development Mode:**
    ```bash
    npm run dev
    ```

3.  **Build Production Binary:**
    ```bash
    # Compiles and bundles for Windows target
    npm run build
    ```

---

## 📝 License and Contributions
This project is open-source and licensed under the **[MIT License](LICENSE)**. You are free to fork, customize, distribute, and integrate it into your own systems. Pull requests are highly welcome!
