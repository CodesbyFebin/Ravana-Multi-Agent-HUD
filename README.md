# RAVANA — AI Agentic HUD

**RAVANA** is an AI agentic HUD and multi-agent command centre by **CodesbyFebin**. It brings voice commands, specialist agents, model routing, live system telemetry, task and memory panels, and human-reviewed actions into a single cyberpunk dashboard.

Explore the project: [Ravana-Multi-Agent-HUD](https://github.com/CodesbyFebin/Ravana-Multi-Agent-HUD) · [CodesbyFebin](https://github.com/CodesbyFebin)

> RAVANA is an experimental developer project. The dashboard includes demo and simulated data; review the notes below before treating any panel as a production system.

## What it does

- **Agentic HUD:** a full-screen React dashboard with a Three.js reactor visualization, agent status, command controls, and modular panels.
- **Voice command interface:** browser speech recognition where available, text-to-speech output, and a voice activity display.
- **Agent workflow:** routes prompts through a task classifier, tracks specialist agent state, and streams command events to connected clients over WebSockets.
- **Model integration:** server-side Gemini API integration through `@google/genai`, with model selection and optional Google Search or Maps grounding where configured.
- **Review gate:** high-impact command categories can open an adversarial review panel for a person to approve or reject.
- **Live server telemetry:** CPU, memory, uptime, and connected-client metrics are read from the running Node.js host and sent over the `/live` WebSocket.
- **Workspace panels:** task board, shared memory interface, model status, proactive suggestions, and grouped DevOps, finance, communications, and executive widgets.
- **Controls:** freeze switch, visual themes, audio toggle, and responsive navigation dock.

## Screens and panels

The HUD organizes controls into overview, DevOps and infrastructure, trading and finance, communications and intelligence, executive tools, agents and skills, models, tasks, and memory. The interface is designed as a single-pane AI agent dashboard for observing and interacting with an agentic workflow.

## Run locally

Requirements: Node.js 20+ and npm, pnpm, or Bun.

```bash
git clone https://github.com/CodesbyFebin/Ravana-Multi-Agent-HUD.git
cd Ravana-Multi-Agent-HUD
npm install
cp .env.example .env
```

Add a Gemini API key to `.env` to enable the server-side Gemini integration:

```dotenv
GEMINI_API_KEY=your_gemini_api_key
APP_URL=http://localhost:3000
```

Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). To create a static frontend build, run `npm run build`. For a production-style server, run `npm run build && npm start`.

## Configuration

| Variable | Required | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | Optional | Enables Gemini requests, grounding, and generated speech through the server. Without it, the server returns a local fallback response. |
| `APP_URL` | Optional | Public app URL for deployments that need to refer to their own host. |

Keep API keys on the server. Do not expose secrets in frontend variables or commit a populated `.env` file.

## Architecture

```text
React + TypeScript HUD
  ├── Three.js reactor and modular dashboard widgets
  ├── Voice command and browser speech APIs
  ├── Model/task routing and human review UI
  └── HTTP API + WebSocket client (/live)
          └── Express server + Gemini API (optional)
```

The browser UI talks to the local Express server for chat, speech, and adversarial-review requests. The server broadcasts telemetry, agent state, model state, command events, and task updates through a WebSocket endpoint at `/live`.

## Important: demo data and safety boundaries

RAVANA is a prototype HUD, not a finished autonomous-agent runtime. Several widget values, agent activity examples, model availability states, proactive suggestions, finance cards, and simulated review outcomes are demonstration data. The server emits real host CPU, memory, uptime, and connection counts, but some telemetry fields and market events are simulated. Verify each panel's implementation before relying on its values.

The review UI demonstrates an approval workflow; it does not execute or sandbox trades, shell commands, deployments, or other external actions. Do not connect it to production credentials or use it as a safety control without implementing and testing an execution boundary.

## Built with

React · TypeScript · Vite · Express · WebSockets · Three.js · Tailwind CSS · Google GenAI SDK · Lucide

## Search terms

AI agentic HUD · AI agent dashboard · multi-agent AI command centre · agent orchestration dashboard · voice-controlled AI assistant · LLM routing interface · real-time AI agent monitoring · adversarial AI review

## Author

Built by [CodesbyFebin](https://github.com/CodesbyFebin) — [Portfolio](https://codesbyfebin.github.io/) · [LinkedIn](https://www.linkedin.com/in/codes-by-febin/)

## License

No license file is present yet. Until a license is added, normal copyright applies and reuse permissions are not granted.
