---
title: Production RAG Knowledge Assistant
category: project
project_slug: rag-knowledge-assistant
visibility: public
last_verified: 2026-09-15
---

# Production RAG Knowledge Assistant

## Summary

I built a production-style knowledge assistant for technical documents. It combines grounded generation, transparent retrieval, rigorous evaluation, observability, and optimization across answer quality, latency, and inference cost.

## My responsibility

I built the ingestion, retrieval, evaluation, observability, API, and React product layers.

## Technical approach

- Ingestion for PDF, Markdown, and text sources.
- Structure-aware chunking and metadata enrichment.
- Embeddings with PostgreSQL and pgvector indexing.
- Hybrid retrieval using dense vector search and BM25.
- Reciprocal Rank Fusion and BGE cross-encoder reranking.
- Conversational query rewriting, confidence thresholds, no-answer handling, and source-level citations.
- Golden datasets and retrieval metrics including Recall at K, Precision at K, Hit Rate, and MRR.
- RAGAS and structured LLM-as-a-Judge evaluation.
- Langfuse tracing, token and cost monitoring, Redis semantic caching, user-feedback capture, and a visual Query Inspector.
- Async FastAPI APIs, React interface, and Dockerized frontend, backend, PostgreSQL/pgvector, and Redis services.

## Why it matters

I designed this project to make RAG inspectable. Instead of treating a model response as sufficient, I expose retrieval sources, metrics, quality checks, latency, and cost so the system can be improved with evidence.

## What I learned

Reliable RAG is a pipeline, not only a vector search. Chunking, metadata, retrieval strategy, reranking, evaluation, observability, and refusal behavior all affect answer quality.
