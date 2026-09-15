# Phase One: ElevenLabs-Hosted Portfolio Agent

Last reviewed: 2026-09-15

## 1. Goal

Build the first production portfolio agent with one AI vendor and the smallest maintainable architecture.

- Existing React/Vite portfolio deployed on Vercel.
- ElevenLabs Agent for text chat, voice chat, speech-to-text, turn taking, interruption handling, hosted Knowledge Base RAG, language model access, and Narendra's cloned voice.
- One small Vercel serverless endpoint to issue temporary signed conversation URLs and apply rate limits. There is no continuously running server to maintain.
- Markdown knowledge files remain the human-editable source of truth.

The agent must speak as a first-person AI representation of Narendra, use only approved public facts, work on mobile, start responding quickly, and remain suitable for a public portfolio with roughly 100 page visitors.

## 2. Chosen architecture

Phase One uses ElevenLabs Agent as the complete conversation platform. It replaces the earlier design that combined OpenAI File Search, OpenAI Realtime, and separate ElevenLabs text-to-speech.

    Knowledge Markdown files
        -> sync when content changes
    ElevenLabs Knowledge Base with RAG
        -> relevant portfolio passages
    ElevenLabs Agent
        -> hosted low-latency LLM
        -> first-person instructions
        -> speech recognition and turn taking
        -> interruption handling
        -> Narendra cloned voice
    React portfolio text and voice interface

This removes the OpenAI-to-ElevenLabs audio relay. One provider handles the entire voice conversation, including stopping current speech when the visitor interrupts.

ElevenLabs Knowledge Base accepts Markdown and can use RAG, retrieving relevant passages instead of placing the entire portfolio in every prompt.

Reference: [ElevenLabs Knowledge Base](https://elevenlabs.io/docs/eleven-agents/customization/knowledge-base)

## 3. Why this is the Phase One choice

- One vendor, one dashboard, one usage meter, and one live conversation session.
- Your cloned voice is native to the conversation experience.
- ElevenLabs owns speech recognition, streaming speech, turn taking, and barge-in.
- The portfolio still uses RAG, so the complete portfolio is not sent on every request.
- No custom vector database, embeddings job, WebRTC orchestration, or ongoing server process is needed.

This is the right first release for a portfolio. It is not an argument against custom RAG later. Phase Two remains the place for FastAPI, Supabase/pgvector, hybrid retrieval, reranking, and detailed retrieval control if Phase One data proves the need.

## 4. Scope

### Included

- One ElevenLabs Agent for Narendra's portfolio.
- First-person text and voice answers.
- ElevenLabs hosted Knowledge Base RAG.
- Narendra's cloned voice.
- Text and voice in the same conversation interface.
- Automatic speech start/end detection and user interruption.
- Visible conversation transcript.
- Evaluation, spend limits, rate limits, and error states.
- A serverless signed-URL endpoint for a private agent.

### Not included yet

- OpenAI File Search or OpenAI Realtime.
- A FastAPI agent backend or a permanently running server.
- Custom chunking, embeddings, pgvector, HNSW, BM25, hybrid search, or reranking.
- Private employer/client information, accounts, long-term visitor memory, scheduling, email, or video avatars.

## 5. Repository structure

    narendra-portfolio/
    |-- src/
    |   |-- components/PortfolioAssistant/
    |   |-- hooks/
    |   |   |-- usePortfolioAgent.js
    |   |-- services/
    |       |-- elevenLabsAgent.js
    |-- api/
    |   |-- agent-signed-url.py
    |-- knowledge/
    |   |-- profile-summary.md
    |   |-- experience/
    |   |-- projects/
    |   |-- education.md
    |   |-- certifications.md
    |   |-- achievements.md
    |   |-- skills.md
    |   |-- hobbies.md
    |   |-- personal-story.md
    |   |-- recruiter-faq.md
    |-- scripts/
    |   |-- sync_elevenlabs_knowledge.py
    |-- evals/
    |   |-- portfolio_questions.md
    |-- phase_one.md
    |-- phase_two.md

The Vercel endpoint runs only when a visitor begins a session. It is not a server process that we launch or keep alive manually.

## 6. Knowledge-base design

### Source of truth

The Markdown files in the knowledge directory are authoritative. The ElevenLabs Knowledge Base is a generated search copy.

Never edit facts only in the ElevenLabs dashboard. Edit the Markdown source, review the change, then synchronize the changed document.

### Structure and content

Keep focused files:

    knowledge/
    |-- profile-summary.md
    |-- experience/
    |   |-- endava.md
    |   |-- galaxe.md
    |-- projects/
    |   |-- ai-companion.md
    |   |-- product-match.md
    |   |-- synthetic-data-studio.md
    |   |-- rag-assistant.md
    |-- education.md
    |-- certifications.md
    |-- achievements.md
    |-- skills.md
    |-- hobbies.md
    |-- personal-story.md
    |-- recruiter-faq.md

Each project and role needs clear headings: problem, responsibility, architecture, decisions, measurable impact, technologies, lessons learned, and facts that must not be disclosed.

Use a small frontmatter block:

    title: AI Companion
    category: project
    visibility: public
    source_url: /projects/ai-companion
    last_verified: 2026-09-15

Only public, verified information is uploaded. Do not include salary information, private contacts, client secrets, unpublished source code, private credentials, or uncertain metrics.

### RAG behavior

Enable RAG for the Knowledge Base. At question time, ElevenLabs reformulates the question, searches indexed passages, and gives the relevant material to the agent. This keeps context small and supports a knowledge base larger than the model prompt.

ElevenLabs estimates that RAG adds about 250 ms. We accept this small cost for grounded answers and measure it in our real deployment.

Reference: [ElevenLabs RAG](https://elevenlabs.io/docs/eleven-agents/customization/knowledge-base/rag)

### Sync workflow

Initial setup:

1. Create a Knowledge Base document for every Markdown source file.
2. Attach each document to the portfolio agent.
3. Enable RAG.
4. Run the evaluation questions before publishing.

Every content update:

1. Edit and review the Markdown file in the repository.
2. Update the matching Knowledge Base document through the dashboard or sync script.
3. Confirm it is re-indexed.
4. Re-run the affected evaluation questions.

Replacing or editing a document regenerates the document's searchable chunks and RAG embeddings.

Reference: [Manage Knowledge Base documents](https://elevenlabs.io/docs/eleven-agents/customization/knowledge-base/manage-documents)

## 7. Agent configuration

### Model

Start with an ElevenLabs-hosted low-latency model. This keeps Phase One to one vendor and avoids external-model pass-through charges.

Test at least two low-latency models with the same evaluation set. Select the least expensive model that remains accurate, grounded, and conversational. Do not choose a more expensive model only because it sounds impressive in a short demo.

Default response lengths:

- Text: 2-5 concise sentences.
- Voice: 30-90 spoken words.
- More depth only after a follow-up question.

### First-person instruction contract

Configure instructions equivalent to:

    You are the AI portfolio representative of Narendra Vanapalli.
    Speak in first person: "I built", "I worked on", and "my approach".
    You are not Narendra himself. If asked, explain that you are an AI representation using his approved portfolio information.
    Use only facts supported by the Knowledge Base.
    If a fact is missing, private, uncertain, or unsupported, say so plainly. Do not guess.
    Do not invent metrics, employers, dates, project details, or certifications.
    Keep answers specific, conversational, and concise.
    Use conversation history for follow-up questions.

The UI must disclose that the visitor is speaking with an AI representation and hearing an AI-generated clone of Narendra's voice.

### Voice clone

Use only Narendra's recordings and complete any verification required by ElevenLabs.

Development:

- Create an Instant Voice Clone from clean, single-speaker samples.
- Include normal speech, project names, technical terms, numbers, short answers, and longer answers.
- Use it to test the interaction quickly.

Release:

- Compare the Instant Voice Clone against a Professional Voice Clone.
- Use Professional Voice Cloning only if it materially improves voice quality and accent fidelity.
- Record at least 30 minutes of clean speech; 1-3 hours is preferable for the strongest result.
- Safely retain the original recordings in case the clone must be recreated.

Reference: [Professional Voice Cloning](https://elevenlabs.io/docs/eleven-creative/voices/voice-cloning/professional-voice-cloning)

## 8. Runtime conversation behavior

### Text

    Visitor types a question
        -> ElevenLabs Agent
        -> Knowledge Base RAG retrieves relevant passages
        -> Agent creates a first-person answer
        -> React shows the text transcript
        -> optional cloned-voice playback

### Voice

    Visitor microphone
        -> ElevenLabs Agent voice session
        -> speech-to-text
        -> automatic turn detection
        -> Knowledge Base RAG
        -> hosted LLM
        -> Narendra cloned voice text-to-speech
        -> transcript and audio in the browser

Text and voice are interfaces to the same agent, knowledge base, instructions, and evaluation set. Do not create separate agents with different facts or different behavior.

The ElevenLabs React SDK uses WebRTC for voice conversations and WebSocket by default for text-only sessions.

Reference: [ElevenLabs React SDK](https://elevenlabs.io/docs/eleven-agents/libraries/react)

### Natural conversation and interruption

ElevenLabs owns the live voice session, including turn taking and interruption detection.

When the visitor starts speaking while the agent is speaking:

1. The current spoken response is interrupted.
2. In-flight answer generation is cancelled.
3. The new visitor speech becomes the next turn.
4. The next answer uses the same conversation and Knowledge Base.

We still test interruption carefully: it must stop quickly, never resume stale audio, respect natural short pauses, and avoid responding to background noise. Configure a conservative end-of-turn silence threshold, concise answers, and an inactivity timeout.

## 9. React integration and security

Use the ElevenLabs React SDK rather than the default widget, so the portfolio conversation panel matches the existing design.

The UI includes:

- Start and end call controls.
- Microphone permission and active-listening state.
- Visible live transcript.
- Text-input fallback.
- Mute and volume controls.
- Retry and provider-error states.
- AI and cloned-voice disclosure.
- Automatic close when a call is idle or the tab is hidden.

### Signed URL flow

Use a private agent and a newly generated signed URL for every conversation:

    Browser asks the Vercel endpoint for a session URL
        -> Vercel function uses ELEVENLABS_API_KEY
        -> ElevenLabs returns a temporary signed URL
        -> browser starts the Agent session with the signed URL

The permanent API key never reaches the browser. Signed URLs expire after 15 minutes, but a conversation started before expiry can continue normally.

Reference: [ElevenLabs Agent authentication](https://elevenlabs.io/docs/eleven-agents/customization/authentication)

For a quick visual prototype, a public agent plus an allowed-domain list is acceptable. For the public production portfolio, use signed URLs, keep the agent private, and rate-limit the serverless endpoint.

Server-only Vercel variables:

    ELEVENLABS_API_KEY
    ELEVENLABS_AGENT_ID
    ALLOWED_ORIGIN

Never expose ELEVENLABS_API_KEY through a VITE-prefixed variable.

## 10. Speed and cost controls

Speed rules:

- Use an evaluated low-latency hosted model.
- Keep permanent instructions and answers concise.
- Keep knowledge documents focused.
- Use RAG rather than full-context documents for the full portfolio.
- Start voice only after the visitor presses Start Call.
- Close idle calls quickly.
- Measure end-of-speech to first-audio on mobile networks as well as Wi-Fi.

Initial targets:

| Measurement | Target |
|---|---:|
| Text first visible response p95 | under 3 seconds |
| Voice end-of-speech to first audio p50 | under 1.5 seconds |
| Voice end-of-speech to first audio p95 | under 3 seconds |
| Interruption feels stopped | under 250 ms |
| Typical spoken answer | 30-90 words |

These are engineering targets, not provider guarantees.

Current published ElevenAgents self-service pricing includes 15 free voice minutes, a $6 Starter plan with 75 included minutes, additional voice time at $0.08 per minute, and text messages at $0.003 each. LLM usage depends on the selected model.

Reference: [ElevenAgents pricing](https://elevenlabs.io/pricing/agents)

Illustrative Starter-plan voice cost:

    100 visitors x 5 minutes = 500 minutes
    $6 subscription + (500 - 75) x $0.08
    approximately $40 before LLM usage and taxes

This is only an example. One hundred page visitors is not one hundred simultaneous voice calls, and most portfolio visitors will not spend five minutes speaking.

Cost controls:

- Begin with the free allowance for internal tests.
- Use Instant Voice Cloning during development.
- Set a low monthly spend cap and alerts before public launch.
- Cap response length and auto-end idle calls.
- Rate-limit signed URL creation by IP/session.
- Stay within the selected plan's concurrent-call limit.
- Review conversation usage and quality weekly during launch.
- Upgrade to Professional Voice Cloning only after quality testing justifies its plan cost.

## 11. Evaluation and load testing

Create a versioned evaluation set containing:

- Direct factual questions about projects, experience, skills, education, certifications, and achievements.
- Multi-topic and follow-up questions.
- Questions with no answer in the portfolio.
- Requests for private information.
- Prompt-injection attempts.
- Voice questions containing technical terms, names, numbers, and accent variation.

Measure:

- Factual support and correctness.
- First-person consistency.
- Safe handling of missing/private information.
- Conciseness.
- Retrieval quality.
- Pronunciation, naturalness, and transcript/audio consistency.
- Time to first text/audio.
- Interruption behavior.
- Failed connection and provider errors.

Load tests:

1. 100 simultaneous static page visitors.
2. 5-10 concurrent voice sessions, aligned with the selected plan limit.
3. A burst of text messages.
4. Repeated call start/stop actions and interruptions.
5. Microphone denied, expired signed URL, network loss, and provider failures.

The static portfolio remains usable when the agent is unavailable.

## 12. Deployment workflow

1. Create the ElevenLabs workspace and strict monthly budget.
2. Create Narendra's Instant Voice Clone.
3. Create the hosted portfolio agent in the ElevenLabs dashboard.
4. Add the first-person instruction contract.
5. Upload approved Markdown knowledge documents, attach them to the agent, and enable RAG.
6. Test low-latency model choices in the dashboard.
7. Add the ElevenLabs React SDK to the portfolio UI.
8. Create the Vercel signed-URL endpoint and keep the agent private.
9. Add rate limits, disclosure, idle handling, and failure UI.
10. Deploy a preview environment.
11. Run evaluation, mobile, interruption, and load tests.
12. Release voice behind a feature flag, inspect real usage, then iterate.

## 13. Definition of done

Phase One is complete when:

- One ElevenLabs Agent powers both portfolio text and voice.
- Markdown is the source of truth and knowledge updates are repeatable.
- RAG is enabled, so the full portfolio is not sent on every prompt.
- Answers are first person but honestly disclosed as AI-generated.
- Unsupported/private questions do not produce invented claims.
- The cloned voice is clearly disclosed.
- Text, voice, turn taking, and interruption work in the same ElevenLabs session.
- The browser never receives the permanent ElevenLabs API key.
- Signed URL creation is rate-limited.
- The static portfolio works if the agent fails.
- The agent meets the agreed latency and cost budgets.

## 14. Phase Two boundary

Do not add custom RAG merely because it sounds more advanced. First collect real questions, retrieval misses, latency measurements, and cost data.

If Phase Two is justified, preserve the Markdown knowledge files and evaluation set. We can then replace hosted RAG with FastAPI plus Supabase pgvector, hybrid retrieval, and reranking, while retaining ElevenLabs through Speech Engine or Custom LLM integration; or adopt the full custom architecture described in phase_two.md.

Make that decision from measured evidence after the first launch.
