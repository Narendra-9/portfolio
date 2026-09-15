---
title: Agentic Synthetic Data Studio
category: project
project_slug: synthetic-data-studio
visibility: public
last_verified: 2026-09-15
---

# Agentic Synthetic Data Studio

## Summary

I designed an end-to-end AI product for connecting to enterprise data sources, understanding their structure and rules, and producing realistic, validated synthetic data at scale.

## My responsibility

I architected the full product journey: configurable connections, file-based sources, source profiling, rule review, generation, monitoring, batch execution, recovery, project history, and delivery through downloadable artifacts or database loading.

## Technical approach

- ReactJS, Python, FastAPI, PostgreSQL, and Pandas.
- Configurable database and file-based data sources.
- Intelligent source profiling and AI-assisted rule inference for schemas, relationships, constraints, distributions, and cross-column behavior.
- User-editable generated configurations.
- A bounded agentic loop that creates generator code, runs deterministic validation, diagnoses failures, and repairs within controlled retry limits.
- Scalable batch processing, generator reuse, progress tracking, audit logs, failure recovery, and extensible connectors.

## Engineering principles

I designed the agentic loop to be bounded and validated rather than letting it run without controls. Human-editable rules, deterministic validation, retry limits, and auditability are central to the design.

## Information I do not disclose

I do not disclose enterprise source data, customer schemas, generated data, credentials, or confidential implementation details.
