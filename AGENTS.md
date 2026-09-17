# Video avatar integration rules

- Bundle `@anam-ai/js-sdk`; do not load it dynamically from a CDN when a visitor clicks.
- Fetch the ElevenLabs signed URL and mint the Anam session token on the server just before a session is needed. Do not cache the signed URL.
- Put ElevenLabs settings under `environment.elevenLabsAgentSettings` in the Anam session-token request.
- Keep the ElevenLabs agent's voice, LLM, tools, prompt, and knowledge on ElevenLabs. Anam renders the face only.
- Never open an additional ElevenLabs browser WebSocket for video mode. Anam bridges the agent server-to-server.
- Never configure a second voice or LLM on Anam for video mode.
- Never expose `ANAM_API_KEY` or `ELEVENLABS_API_KEY` to client code or a `VITE_` variable.
- Verify that the avatar speaks the ElevenLabs response in sync and that both API keys occur only in server-side environment configuration.
- Set the ElevenLabs agent user-input audio format to PCM 16000 Hz for Anam compatibility.
- Current Anam documentation says client tool events are forwarded in server-side ElevenLabs mode. Follow the live cookbook if this behavior changes.
