# Phase Two: Custom FastAPI RAG and Realtime Voice

Last reviewed: 2026-09-15

## 1. Goal

Replace OpenAI-hosted File Search with a custom, inspectable RAG pipeline while preserving the Phase One user experience and voice architecture.

Phase Two will use:

- Existing React/Vite frontend on Vercel.
- FastAPI on Vercel Functions initially.
- Supabase PostgreSQL with pgvector.
- Custom document parsing, heading-aware chunking, embeddings, metadata, HNSW indexing, retrieval, evaluation, and observability.
- OpenAI Responses API for text generation.
- OpenAI Realtime API for microphone input and conversational tool use.
- ElevenLabs streaming TTS with Narendra's verified cloned voice.
- Redis only if measurements later show a real caching or rate-limiting need.

This is a custom RAG implementation, but it intentionally avoids enterprise-only infrastructure such as Kubernetes, a dedicated VM fleet, or separate AWS/Azure/GCP services at the expected portfolio traffic level.

## 2. Why this phase exists

Phase One optimizes for time to a reliable release. Phase Two optimizes for control and demonstrates AI-engineering depth:

- We control chunk boundaries.
- We control embeddings and metadata.
- We know exactly which passages were retrieved.
- We can implement vector, keyword, and hybrid retrieval.
- We can evaluate Recall@K, MRR, groundedness, and latency.
- We can inspect and tune HNSW.
- We can migrate providers without recreating the human-authored knowledge base.

Do not begin Phase Two until Phase One has produced an evaluation set and real latency/usage measurements. Otherwise, custom RAG would add complexity without a measured problem.

## 3. System architecture

### Text chat

```text
React chat interface
       |
       | POST /api/chat
       v
FastAPI on Vercel
       |
       | create query embedding
       v
OpenAI Embeddings API
       |
       | vector + metadata filters
       v
Supabase PostgreSQL + pgvector + HNSW
       |
       | top public chunks
       v
OpenAI Responses API
       |
       | streamed answer
       v
React chat interface
```

### Voice chat

```text
Browser microphone
       |
       | WebRTC
       v
OpenAI Realtime API
       |
       | search_portfolio tool call
       v
FastAPI /api/retrieve
       |
       | embedding + custom retrieval
       v
Supabase pgvector/HNSW
       |
       | relevant chunks
       v
OpenAI Realtime answer text
       |
       | phrase streaming
       v
ElevenLabs WebSocket + Narendra voice_id
       |
       v
Browser audio player
```

The voice pipeline does not create a second knowledge system. Both chat modes call the same retrieval service.

## 4. Deployment choice

### Initial Phase Two deployment

```text
Vercel
|-- React static frontend
`-- FastAPI serverless functions

Supabase
`-- PostgreSQL + pgvector + HNSW

OpenAI
|-- Embeddings
|-- Text generation
`-- Realtime sessions

ElevenLabs
`-- Cloned-voice streaming TTS
```

Choose the Supabase region first, then configure Vercel Functions in the nearest practical region. Use Supabase's server-side transaction pooler for serverless database connections. Do not open PostgreSQL directly from the browser.

References: [Vercel Python runtime](https://vercel.com/docs/functions/runtimes/python) and [Supabase connection pooling](https://supabase.com/docs/guides/database/connecting-to-postgres/pooling-and-limits)

### When to move FastAPI away from Vercel

Keep Vercel while request/response functions are sufficient. Move only FastAPI to a long-running container service if measurements show that we need:

- A permanent server-side WebSocket sideband for every voice call.
- Long-running ingestion jobs that exceed function limits.
- Persistent in-memory model/reranker processes.
- More control over connection pools or background workers.
- Predictable warm instances under sustained heavy traffic.

The React frontend can remain on Vercel even if FastAPI moves later.

## 5. Why Supabase PostgreSQL instead of ChromaDB

Supabase is selected for the first custom implementation because it supplies managed PostgreSQL plus pgvector and also supports relational data, JSON metadata, SQL filtering, chat feedback, analytics, migrations, and backups in one service.

ChromaDB is valid, especially for local prototyping. A persistent local Chroma client stores data on one machine; production requires Chroma Cloud or a separately hosted Chroma server with persistent storage. That would add another operational component without a clear benefit at this portfolio's scale.

Reconsider ChromaDB or another dedicated vector database only if retrieval becomes the dominant workload, the collection becomes very large, or a required search capability is unavailable in pgvector.

## 6. Source knowledge structure

Reuse the Phase One Markdown knowledge base without changing its meaning:

```text
knowledge/
|-- profile-summary.md
|-- experience/
|   |-- endava.md
|   `-- galaxe.md
|-- projects/
|   |-- ai-companion.md
|   |-- product-match.md
|   |-- synthetic-data-studio.md
|   `-- rag-assistant.md
|-- education.md
|-- certifications.md
|-- achievements.md
|-- skills.md
|-- hobbies.md
|-- personal-story.md
`-- recruiter-faq.md
```

Only approved public content is ingested. The Markdown source remains authoritative; Supabase stores a searchable projection.

## 7. Database design

### 7.1 `knowledge_documents`

One row per source document:

| Column | Purpose |
|---|---|
| `id` | Stable UUID |
| `source_path` | Repository-relative source path |
| `title` | Human-readable title |
| `category` | Project, experience, certification, etc. |
| `project_slug` | Optional normalized project identifier |
| `visibility` | Must be `public` for retrieval |
| `content_hash` | SHA-256 used for change detection |
| `version` | Incremented knowledge version |
| `metadata` | JSONB for additional fields |
| `created_at` | Audit timestamp |
| `updated_at` | Audit timestamp |

### 7.2 `knowledge_chunks`

One row per chunk:

| Column | Purpose |
|---|---|
| `id` | Stable UUID |
| `document_id` | Foreign key to the source document |
| `chunk_index` | Order within the document |
| `heading_path` | Example: `AI Companion > Measurable impact` |
| `content` | Chunk text supplied to the model |
| `token_count` | Used to enforce context budgets |
| `embedding` | pgvector column matching the configured dimensions |
| `category` | Denormalized filter field |
| `project_slug` | Denormalized filter field |
| `visibility` | Denormalized safety filter |
| `metadata` | JSONB for secondary filters |
| `content_hash` | Chunk-level change detection |
| `created_at` | Audit timestamp |

Use dedicated columns for filters used on most requests. Use JSONB for optional metadata. This makes filtering predictable and indexable.

### 7.3 Optional interaction tables

Add only when needed:

```text
chat_feedback
retrieval_events
answer_events
knowledge_sync_runs
```

Do not store raw chat content by default. If analytics are enabled, disclose that behavior and prefer anonymized event data.

## 8. Database indexes

Create:

- Primary-key and foreign-key indexes.
- Unique index on `source_path`.
- B-tree indexes on `visibility`, `category`, and `project_slug`.
- Optional GIN index on JSONB metadata only if real queries use it.
- HNSW index on the embedding column using the same distance operator as retrieval.

Conceptual HNSW index:

```sql
create index knowledge_chunks_embedding_hnsw
on knowledge_chunks
using hnsw (embedding vector_cosine_ops);
```

HNSW is the index structure used to avoid comparing a query vector with every stored vector. Chunking, embedding, storing, and indexing remain separate operations.

Supabase currently recommends HNSW in general for its performance and robustness as data changes. The index operator class must match the distance operator used by the search query.

Reference: [Supabase vector indexes](https://supabase.com/docs/guides/ai/vector-indexes)

## 9. Custom ingestion pipeline

### 9.1 Pipeline

```text
Discover files
   -> validate front matter
   -> parse Markdown headings
   -> normalize content
   -> create semantic chunks
   -> count tokens
   -> batch embedding requests
   -> transactional upsert into Supabase
   -> refresh indexes/statistics as needed
   -> run retrieval smoke tests
   -> record sync manifest
```

### 9.2 Chunking strategy

Start with heading-aware chunks rather than splitting every fixed number of characters.

Initial heuristic:

- Target 300-600 tokens per chunk.
- Use 50-100 tokens of overlap only when adjacent context truly matters.
- Never split a project metric from the action that produced it.
- Never split a heading from its first paragraph.
- Store each recruiter FAQ question and answer as one chunk when possible.
- Repeat a small amount of document identity in each chunk, such as project title and role.
- Keep lists of skills/certifications intact when short.
- Split long architecture sections by subheading or decision.

These values are starting points. Final chunk size and overlap must be selected through retrieval evaluation, not personal preference.

### 9.3 Embeddings

Start with `text-embedding-3-small` because a portfolio collection is small and the model is inexpensive. Store the model name and dimensions with every ingestion version. The PostgreSQL vector column dimension must match the generated embeddings.

Keep the embedding model configurable:

```text
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=<configured dimension>
```

If the embedding model changes, create a new embedding column/table or rebuild all chunks. Never mix vectors from different embedding models in one index.

Reference: [OpenAI text-embedding-3-small](https://developers.openai.com/api/docs/models/text-embedding-3-small)

### 9.4 Idempotent updates

The ingestion command must:

- Skip unchanged documents using content hashes.
- Re-chunk and re-embed only changed documents.
- Delete old chunks only after replacement chunks are ready.
- Use transactions so partial failures do not corrupt the active knowledge set.
- Record model, dimensions, chunker version, prompt version, and timestamp.
- Support `--dry-run`, `--file`, and `--all` modes.

Example commands:

```text
python -m scripts.ingest --dry-run
python -m scripts.ingest --file knowledge/projects/ai-companion.md
python -m scripts.ingest --all
```

Run ingestion locally first. Later, automate it in CI only after tests pass and the required secrets are configured securely.

## 10. Retrieval pipeline

### 10.1 First version

For each question:

1. Validate and normalize the question.
2. Infer safe metadata filters only when confidence is high.
3. Create one query embedding.
4. Search only `visibility='public'` chunks.
5. Retrieve approximately 8 candidate chunks.
6. Remove duplicates and near-duplicates.
7. Apply a similarity threshold established by evaluation.
8. Select the best 4-6 chunks within the context-token budget.
9. Return chunk IDs, source titles, content, and scores internally.

Conceptual query:

```sql
select
  id,
  document_id,
  heading_path,
  content,
  1 - (embedding <=> :query_embedding) as similarity
from knowledge_chunks
where visibility = 'public'
order by embedding <=> :query_embedding
limit :candidate_count;
```

When a reliable filter is available, apply it:

```text
visibility = public
project_slug = ai-companion
```

Do not let the browser choose or bypass the visibility filter.

### 10.2 Hybrid retrieval upgrade

Names, acronyms, certifications, and exact metrics sometimes benefit from keyword search. Add PostgreSQL full-text search only if the evaluation set shows misses.

Possible pipeline:

```text
Vector candidates
      +
Keyword candidates
      |
      v
Reciprocal Rank Fusion
      |
      v
Top context chunks
```

Do not add an LLM reranker to the critical voice path until measured retrieval quality justifies its additional latency and cost. A lightweight local or hosted cross-encoder may be evaluated later for text chat.

### 10.3 No-answer behavior

If results do not pass the validated relevance threshold, return an explicit no-context result. The generation prompt must then say that the information is not included in the public portfolio instead of answering from model memory.

## 11. FastAPI responsibilities

FastAPI owns:

- Request validation.
- Rate limiting.
- Query embeddings.
- Supabase retrieval.
- Context-budget enforcement.
- Prompt construction.
- OpenAI streaming.
- Realtime session creation.
- ElevenLabs single-use token creation.
- Safe retrieval responses for voice tool calls.
- Timing, usage, and error telemetry.

FastAPI does not serve or proxy continuous microphone audio. Browser audio travels directly to OpenAI over WebRTC, and generated speech travels directly from ElevenLabs to the browser over a token-authenticated WebSocket.

## 12. API surface

Keep the same public contract introduced in Phase One:

```text
POST /api/chat
POST /api/retrieve
POST /api/voice/session
```

Only the internal retrieval implementation changes:

```text
Phase One: search_portfolio -> OpenAI vector-store search
Phase Two: search_portfolio -> query embedding -> Supabase pgvector search
```

### `/api/retrieve` response

Return a compact tool result:

```json
{
  "found": true,
  "passages": [
    {
      "source": "AI Companion > Measurable impact",
      "text": "I reduced repeated-request latency by approximately 80%."
    }
  ]
}
```

Do not return embeddings, database IDs that reveal implementation details, private metadata, SQL errors, or unrestricted document content.

## 13. Text generation

Build the prompt from:

```text
Stable first-person and safety instruction
             +
Retrieved public passages
             +
Recent conversation context
             +
Visitor question
```

Use the same first-person contract as Phase One. Require every material factual claim to be supported by a retrieved passage or the compact core profile. For internal evaluation, retain passage IDs with the answer event; the public UI can show friendly source labels if desired.

Stream the answer. Do not wait for complete generation before updating the UI.

## 14. Realtime voice and ElevenLabs integration

The Phase One voice client remains. The Realtime tool now searches Supabase.

**Chosen voice path carried from Phase One:** Realtime receives microphone audio and emits text only. That text streams phrase by phrase to ElevenLabs, which speaks it using Narendra's cloned voice. OpenAI native audio is not generated for the same answer.

### Runtime sequence

1. Visitor presses Start Call.
2. Browser requests microphone permission.
3. `/api/voice/session` creates the OpenAI Realtime call and an ElevenLabs single-use TTS token.
4. Browser establishes OpenAI WebRTC and ElevenLabs WebSocket connections in parallel.
5. OpenAI detects and commits the user's spoken turn.
6. Realtime calls `search_portfolio` for factual questions.
7. Browser relays the call to `/api/retrieve`.
8. FastAPI embeds the question and runs pgvector/HNSW retrieval.
9. Browser submits the retrieved passages as the Realtime tool result.
10. Realtime produces grounded text deltas.
11. Browser buffers deltas into speech-safe phrases, using punctuation, a short timeout, and safe clause boundaries.
12. Phrases stream to ElevenLabs using Narendra's voice ID.
13. Audio chunks begin playing while later text is still being generated.
14. If the visitor interrupts, both the response and current audio context are cancelled.

The implementation never waits for the final Realtime response before starting ElevenLabs. It keeps only a small playback queue and tags every text and audio fragment with the active `turn_id`, discarding late fragments from an interrupted turn.

### Own-voice quality plan

- Use Instant Voice Clone during development for lower setup time and typically lower synthesis latency.
- Record a Professional Voice Clone for the final portfolio if evaluation shows a meaningful quality improvement.
- Test both clones with the same script and network conditions.
- Use `eleven_flash_v2_5` for interactive mode.
- Normalize numbers before TTS.
- Maintain a pronunciation dictionary for names and technologies.
- Keep speech concise and conversational.
- Show an always-visible AI-generated-voice disclosure.

### Voice latency instrumentation

Capture timestamps for:

```text
speech_started
speech_stopped
transcript_committed
tool_call_received
query_embedding_completed
retrieval_completed
first_text_delta
first_tts_text_sent
first_tts_audio_received
first_audio_played
interruption_detected
audio_stopped
```

This breakdown lets us identify whether latency comes from end-of-turn detection, retrieval, the language model, ElevenLabs, networking, or browser buffering.

## 15. Speed strategy

### 15.1 Critical-path rules

- Keep Vercel and Supabase regions close.
- Use Supabase's transaction pooler for serverless calls.
- Use async FastAPI database and HTTP clients.
- Batch embeddings during ingestion; generate only one query embedding at runtime.
- Use HNSW for approximate nearest-neighbor search.
- Filter on indexed columns.
- Retrieve a small candidate set.
- Avoid reranking on voice until proven necessary.
- Stream both answer text and TTS audio.
- Preconnect to ElevenLabs at call start.
- Cancel abandoned requests immediately.
- Keep spoken answers short.

### 15.2 Caching stages

Do not introduce Redis automatically. Measure first.

Possible later caches:

- Exact normalized-question to final answer for public FAQ questions.
- Normalized-question to query embedding.
- Normalized-question to retrieved chunk IDs.
- Short-lived browser cache for the current session.

Add managed Redis only when repeated-query measurements show enough benefit or when distributed rate limiting requires it.

### 15.3 Performance budgets

Use the Phase One targets as the migration guardrail. Phase Two must not ship if custom retrieval materially worsens the experience.

| Measurement | Target |
|---|---:|
| Query embedding p95 | less than 400 ms |
| pgvector retrieval p95 | less than 200 ms |
| Complete retrieval pipeline p95 | less than 700 ms |
| Text time-to-first-token p95 | less than 3 seconds |
| Voice end-of-speech to first audio p50 | less than 1.5 seconds |
| Voice end-of-speech to first audio p95 | less than 3 seconds |
| Barge-in stop | less than 250 ms |

These are targets to test from representative user locations, not promises derived from vendor marketing.

## 16. Security

- Enable row-level security on Supabase tables.
- Keep the Supabase service-role key server-only.
- Never use the service-role key in React.
- Restrict the API to the production and preview origins that need access.
- Force `visibility='public'` in server-side retrieval code.
- Parameterize all SQL.
- Validate Realtime tool arguments against JSON Schema.
- Add per-IP/session request limits.
- Add OpenAI and ElevenLabs spend alerts.
- Use single-use browser tokens for ElevenLabs TTS.
- Do not store raw voice audio.
- Redact sensitive values from logs and exception messages.
- Version prompts and knowledge data for auditability.
- Treat retrieved text as data, not instructions; the developer prompt must resist prompt injection inside documents.

## 17. Observability

Every request receives a correlation ID. Log structured events containing:

- Request and session ID.
- Chat or voice modality.
- Prompt version and knowledge version.
- Retrieval duration.
- Candidate and selected chunk counts.
- Safe source identifiers and similarity scores.
- Input/output token usage.
- Time-to-first-token or first audio.
- Provider retry count.
- Completion, timeout, cancellation, or error status.

Avoid logging full raw questions and answers until a privacy policy and retention period are explicitly defined.

## 18. Evaluation

### Retrieval evaluation

For each golden question, label the expected source documents/chunks and calculate:

- Recall@K.
- Precision@K.
- Hit Rate.
- Mean Reciprocal Rank.
- No-answer accuracy.
- Retrieval latency.

### Answer evaluation

Score:

- Factual correctness.
- Groundedness in retrieved context.
- Completeness.
- First-person consistency.
- Disclosure consistency.
- Conciseness.
- Handling of missing/private information.
- Prompt-injection resistance.

### Voice evaluation

Score:

- Transcription accuracy for names and technical terms.
- Time-to-first-audio.
- Naturalness and similarity of the cloned voice.
- Pronunciation accuracy.
- Audio continuity.
- Interruption behavior.
- Whether spoken content matches the visible transcript.

Compare Phase One hosted retrieval and Phase Two custom retrieval on the same questions before migration.

## 19. Load testing

Test independently:

1. Static page load for 100 visitors.
2. `/api/retrieve` at 20-30 concurrent requests.
3. `/api/chat` streaming under concurrent load.
4. Supabase connection usage through the serverless transaction pooler.
5. OpenAI and ElevenLabs provider rate-limit responses.
6. Several concurrent voice sessions with realistic pauses.
7. Cancellation storms caused by users closing or interrupting calls.

The goal is graceful degradation: return a friendly retry state, preserve the static portfolio, and never leave the microphone or audio player active after a failed call.

## 20. Implementation stages

### Stage A: Local custom retrieval

- Create Supabase development project.
- Create migrations and pgvector extension.
- Implement document and chunk tables.
- Implement heading-aware chunker.
- Implement batched ingestion.
- Implement vector search.
- Run retrieval evaluation locally.

### Stage B: Replace hosted retrieval for text

- Implement a provider-neutral `search_portfolio` interface.
- Add Supabase retrieval implementation.
- Switch text chat behind a feature flag.
- Compare latency and answer quality against Phase One.
- Retain instant rollback to hosted File Search.

### Stage C: Replace hosted retrieval for voice

- Point `/api/retrieve` to Supabase.
- Run pronunciation and interruption tests.
- Compare voice latency before and after migration.
- Release behind a small-percentage feature flag.

### Stage D: Improve only from evidence

- Add keyword/hybrid search if exact terms are missed.
- Add reranking if ranking quality is inadequate.
- Add Redis if repeated-query or distributed-rate-limit data justifies it.
- Move FastAPI to a container only if Vercel limitations appear in measured production use.

## 21. Deployment workflow

1. Create Supabase project and choose region.
2. Apply version-controlled SQL migrations.
3. Configure pgvector and indexes.
4. Configure Vercel in a nearby region.
5. Add server-only secrets.
6. Run ingestion with `--dry-run`.
7. Ingest the approved public knowledge set.
8. Run database and retrieval smoke tests.
9. Run the golden retrieval evaluation.
10. Deploy preview environment with custom retrieval feature flag.
11. Run text and voice end-to-end tests.
12. Run load tests and inspect database connections.
13. Compare Phase One and Phase Two metrics.
14. Promote to production only if quality and latency satisfy the budgets.
15. Keep hosted File Search available temporarily as rollback.

## 22. Environment variables

```text
OPENAI_API_KEY
OPENAI_CHAT_MODEL
OPENAI_REALTIME_MODEL
OPENAI_EMBEDDING_MODEL
EMBEDDING_DIMENSIONS
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_DATABASE_URL
ELEVENLABS_API_KEY
ELEVENLABS_VOICE_ID
ELEVENLABS_TTS_MODEL=eleven_flash_v2_5
RAG_PROVIDER=supabase
RAG_KNOWLEDGE_VERSION
PROMPT_VERSION
ALLOWED_ORIGIN
```

No secret may use a `VITE_` prefix.

## 23. Definition of done

Phase Two is complete when:

- Source files are parsed and chunked by our code.
- Embeddings and metadata are stored in Supabase.
- HNSW is used and verified by the query plan.
- Incremental ingestion is idempotent and recoverable.
- Retrieval meets the agreed golden-set quality metrics.
- Text and voice use the same custom retrieval service.
- Answers remain grounded and first-person.
- ElevenLabs reliably streams Narendra's verified voice.
- Interruption and cancellation work without stale audio.
- Performance meets or improves on Phase One.
- The system handles the expected visitor load.
- Hosted File Search can be disabled without changing the React UI or voice tool contract.

## 24. Recommended final progression

```text
Phase One
Hosted File Search + text chat + Realtime input + ElevenLabs cloned voice
                         |
                         | collect questions, evals, latency, and usage
                         v
Phase Two
FastAPI custom RAG + Supabase pgvector/HNSW + same chat and voice clients
                         |
                         | add complexity only when measurements justify it
                         v
Optional future
Hybrid retrieval, reranking, Redis, container backend, analytics, video avatar
```
