# AI Integration for Sturum

Ideas for integrating artificial intelligence in ways that **genuinely help students**, aligned with [GOALS.md](./GOALS.md). This is a product and technical guide—not a mandate to add AI everywhere.

**Core rule:** AI on Sturum should strengthen the **department community** and **discoverability**, not replace learning or turn the app into a generic chatbot.

---

## What “helpful AI” means on Sturum

| Helpful | Not helpful (for now) |
|---------|------------------------|
| Find the right past question in your department’s library | Writing full assignments from a prompt |
| Summarize a long handout *you uploaded* | Open-ended “do my homework” |
| Suggest coursemates or posts relevant to your level | Cross-department or public internet answers |
| Tag and organize materials automatically | Fake engagement (auto-posts, bot likes) |
| Flag spam or abusive content | Surveillance of private DMs without consent |

Students already have ChatGPT. Sturum’s edge is **context**: *your department, your materials, your cohort.*

---

## Integration principles

1. **Department-scoped context** — Models and search only use data the user is allowed to see (same department, own uploads, public department materials).
2. **Grounded answers** — When AI answers questions, cite **which file or post** it came from; say “not in your library” when unsure.
3. **Academic integrity** — Position features as *study aid* and *discovery*, with clear policies; avoid “essay generator” positioning.
4. **Opt-in and transparent** — Label AI-generated summaries/tags; let users disable AI features where possible.
5. **Cost-aware** — Start with batch/off-peak jobs (tagging, indexing) before real-time chat on every page.
6. **Privacy** — Do not send private messages to third-party APIs without explicit consent and disclosure.

---

## High-impact opportunities (by Sturum feature)

### 1. Study materials library (highest ROI)

Students upload PDFs, images, and handouts but struggle to **find** the right file later.

| Feature | What it does | Why students care |
|---------|----------------|-------------------|
| **Semantic search** | “GST 201 past questions 2022” finds relevant uploads even if the title is vague | Replaces scrolling WhatsApp and guessing filenames |
| **Auto-tagging on upload** | Course code, topic, type (past question / handout / book), level | Less work for uploaders; better browse filters |
| **PDF / image text extraction (OCR)** | Index text inside scans so search works | Most past questions are photos or PDFs |
| **Duplicate & near-duplicate detection** | “This file looks like one already uploaded” | Cleaner library, less clutter |
| **Short summary per material** | 3–5 bullet summary + “what exam/topics this covers” | Quick decide before download |
| **“Similar materials”** | After viewing one file, show related department uploads | Discovery without new search |

**Technical sketch:** On upload → extract text (OCR if needed) → chunk → embed → store in vector DB keyed by `department` (+ optional `academicLevel`). Search API filters by `req.user.department` before retrieval.

**Models/APIs:** Embeddings (OpenAI `text-embedding-3-small`, Voyage, or open-source via Ollama); optional LLM for summaries (Claude, GPT-4o-mini, Gemini Flash).

---

### 2. Community feed

| Feature | What it does | Why students care |
|---------|----------------|-------------------|
| **Post intent labels** | Auto-suggest: question, announcement, resource share, study group | Cleaner feed, easier filtering |
| **Related posts** | “Others in your department also discussed…” | Surfaces useful threads |
| **Weekly department digest** | Email or in-app: top posts, new materials, exam reminders | Brings people back (pilot metric in GOALS) |
| **Toxicity / spam detection** | Flag posts/comments for review | Safer community at scale |
| **Smart notifications** | Notify when AI detects high-relevance (e.g. “past questions” + your level) | Less noise than “notify on everything” |

**Avoid:** Auto-generating feed posts or comments—that undermines authenticity and trust.

---

### 3. Connection & discover

| Feature | What it does | Why students care |
|---------|----------------|-------------------|
| **Study buddy suggestions** | Same department + level; optional shared material interests | Solves “I don’t know who to ask” |
| **“Who might know this?”** | User asks a topic; suggest coursemates who uploaded relevant materials (with consent) | Human answer + AI routing |
| **Profile bio assist** | Optional help writing a short intro for networking | Low risk, optional |

**Boundary:** Recommendations only within department; no stalking-style cross-faculty graph.

---

### 4. Messaging (careful)

| Feature | What it does | Why students care |
|---------|----------------|-------------------|
| **Suggested replies** (opt-in) | Short reply chips in DMs | Convenience |
| **Translate** (opt-in) | For multilingual cohorts | Inclusion |

**Avoid by default:** Reading all DMs for training, AI summarizing private chats without consent, or storing message content in external AI logs without policy.

---

### 5. Department Q&A assistant (“Ask Sturum”)

A single **grounded** assistant scoped to:

- Public department materials index  
- Public posts (optional)  
- FAQ you maintain per department  

**Example prompts:**

- “Where are MTE 301 past questions from 2023?”  
- “Summarize the handout on [topic] uploaded last week.”  
- “What did coursemates post about registration this month?”

**Rules:**

- Answers must include **sources** (file name, link, post link).  
- Refuse to answer from general internet if not in corpus.  
- Refuse explicit exam cheating requests; offer study strategies instead.

**Architecture:** RAG pipeline — retrieve top-k chunks → LLM with system prompt + citations → return answer + links to Materials/Posts.

This is the flagship AI feature if you do one thing well.

---

## Phased roadmap

### Phase 1 — Foundation (low risk, high utility)

No chatbot yet. Backend-only, mostly async.

1. OCR + text extraction on material upload  
2. Embeddings + **department-filtered semantic search** on Materials page  
3. Auto-tags (type, suggested title) on upload  
4. Basic spam/toxicity flag on posts/comments  

**Student-visible win:** “I can actually find past questions.”

### Phase 2 — Grounded assistant

1. “Ask Sturum” on Materials + optional feed context  
2. Summaries on material detail pages  
3. Similar materials + related posts  
4. Weekly digest (optional email)  

**Student-visible win:** “The app understands our department’s content.”

### Phase 3 — Community intelligence

1. Study buddy / “who might know” suggestions  
2. Smarter notifications  
3. Moderation dashboard for reps/admins  
4. Optional DM assist (opt-in only)  

**Student-visible win:** “It connects me to the right people and moments.”

---

## Technical integration options

| Layer | Options | Notes |
|-------|---------|--------|
| **Embeddings** | OpenAI, Voyage AI, Cohere, local (Ollama + `nomic-embed`) | Prefer one provider; store `department` on every vector |
| **LLM** | OpenAI GPT-4o-mini, Anthropic Claude Haiku, Google Gemini Flash | Use cheapest model that passes quality bar for summaries |
| **OCR** | Tesseract (self-hosted), Google Document AI, Azure Read | PDFs/images are core for materials |
| **Vector store** | MongoDB Atlas Vector Search, Pinecone, Qdrant, pgvector | Atlas fits existing MongoDB stack |
| **Orchestration** | Simple Node service, LangChain/LlamaIndex (if needed) | Start simple; avoid heavy frameworks until necessary |

**Suggested Sturum-shaped API additions:**

```
POST /api/materials/:id/index     # (re)index after upload
GET  /api/materials/search?q=     # semantic + keyword hybrid
POST /api/ai/ask                  # body: { question } → grounded answer + sources
GET  /api/ai/summary/:materialId  # cached summary
```

All routes: `protect` middleware + **enforce `department === req.user.department`** on retrieval.

---

## Data, privacy, and academic integrity

### Data you can use (with policy)

- Materials marked public to department  
- User’s own uploads  
- Public posts/comments in department  
- Profile fields (department, level) for filtering—not for selling data  

### Data to treat carefully

- Private messages — opt-in only, minimal retention, clear ToS  
- Email, phone — never send to AI providers for training  

### Academic integrity policy (publish in-app)

- AI may **summarize, search, and explain** materials already shared on Sturum.  
- AI must **not** replace assessed work; refuse “write my assignment” flows.  
- Encourage citing original uploads and talking to coursemates.  
- Department reps can report misuse.

### Cost control

- Cache summaries per `materialId`  
- Rate-limit `/api/ai/ask` per user/day  
- Index uploads in background queue (Bull, Render cron, or serverless worker)  
- Use smaller models for tags; larger only for Q&A  

---

## Features to deprioritize (common traps)

| Idea | Why wait |
|------|----------|
| General-purpose “ChatGPT inside Sturum” | Duplicates tools students already use; no department moat |
| AI-written posts/comments | Hurts trust and pilot metrics |
| Auto-grading | Out of scope; needs instructor integration |
| Cross-department AI search | Breaks “safety of scope” principle |
| Scraping the whole internet per question | Wrong product; liability and noise |

---

## Success metrics for AI features

Align with [GOALS.md](./GOALS.md) pilot metrics:

| Metric | Indicates |
|--------|-----------|
| **Search → open material** within 2 clicks | Semantic search works |
| **Repeat use of search** weekly | Sticky utility |
| **Uploads with auto-tags accepted** (not edited away) | Tagging quality |
| **Ask Sturum questions with positive feedback** | Grounded Q&A value |
| **Time to find a known past question** (user testing) | Before/after comparison |
| **Reports of wrong/hallucinated answers** | Keep low via citations + “I don’t know” |

Signups alone do not prove AI success—**findability and return visits** do.

---

## Example user stories (for prioritization)

1. *“I need GST 102 past questions from last year”* → semantic search returns 3 PDFs in my department with snippets.  
2. *“What’s in this 40-page handout?”* → summary + link before I download.  
3. *“Who uploaded notes on [topic]?”* → list of materials + uploader profiles (same department).  
4. *“Is anyone discussing the test next week?”* → digest or related posts, not internet gossip.  
5. *Course rep:* *“Flag spam and duplicate uploads”* → moderation assists human review.

---

## Summary

| Priority | AI capability | Fits Sturum because… |
|----------|---------------|----------------------|
| **1** | Semantic materials search + OCR | Core pain: fragmented, unsearchable files |
| **2** | Auto-tag + summarize uploads | Persistence and discoverability |
| **3** | Grounded “Ask Sturum” (RAG) | Department context is the moat |
| **4** | Feed digest + related content | Keeps cohort active |
| **5** | Moderation + smart notifications | Scale without chaos |
| **Later** | DM assist, buddy matching | Needs trust and opt-in |

**Sturum + AI should feel like a smarter department library and bulletin board—not a replacement for thinking or for WhatsApp.**

---

## Related docs

- [GOALS.md](./GOALS.md) — product vision and boundaries  
- [README.md](../README.md) — technical stack  
- [DEPLOYMENT.md](./DEPLOYMENT.md) — hosting (factor AI API keys into Render env)  

---

*Last updated: 2026. Revisit when pilot feedback identifies the top 1–2 student pain points.*
