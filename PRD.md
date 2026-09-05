# DSA Course Intelligence & Learning Assistant

**Version:** 1.0  
**Status:** MVP Development  
**Primary Stack:** Node.js, TypeScript, Express, Qdrant  
**Data Source:** Striver's A2Z DSA Course  
**Embedding:** 384-dimensional local embeddings  
**Current Dataset:** 304 videos, 3,599 transcript chunks

---

## 1. Product Overview

### Problem

DSA courses contain hundreds of long videos. A student may remember a concept such as:

> "Why does Dijkstra use a priority queue?"

but finding the exact explanation manually requires searching through multiple videos and timestamps.

Traditional keyword search is also insufficient because the user may ask a question using different wording than the instructor used.

### Solution

Build a **DSA Course Intelligence Platform** that understands the transcript content of the course and allows students to search and ask questions using natural language.

The system should provide:

- Relevant video
- Exact timestamp
- Transcript context
- YouTube jump link
- Eventually, an AI-generated explanation grounded in retrieved course material

The system should retrieve course content first and use an LLM only after retrieval is reliable.

---

# 2. Product Vision

> **Ask anything about the DSA course and get the exact explanation from the course, with the video and timestamp.**

Example:

```text
User:
"Why does Dijkstra use a priority queue instead of a normal queue?"

        ↓

Query embedding

        ↓

Vector search

        ↓

Relevant transcript chunks

        ↓

LLM

        ↓

Grounded explanation

        ↓

Source video + timestamp
```

---

# 3. Goals

## Primary Goals

### G1. Course-aware semantic search

Users should be able to search using natural language.

Examples:

```text
"Dijkstra algorithm"

"how does sliding window work"

"find cycle in linked list"

"why do we use recursion"

"minimum spanning tree"
```

---

### G2. Timestamp-based navigation

Every retrieved chunk should retain:

```text
video
videoId
title
start
end
url
```

so users can directly jump to the relevant part of the video.

---

### G3. Course-grounded answers

The future RAG system should answer questions using retrieved course content rather than relying entirely on an LLM's internal knowledge.

---

### G4. Efficient retrieval

The system should search thousands of transcript chunks quickly using a vector database.

Current dataset:

```text
304 videos
3599 chunks
384-dimensional vectors
```

---

### G5. Extensible architecture

The system should be designed so additional courses or educational content can eventually be added without rewriting the core architecture.

---

# 4. Non-Goals for MVP

The first version will **not** focus on:

- User authentication
- Payments
- Mobile app
- Social features
- Progress tracking
- Recommendation engine
- Automatic DSA roadmap generation
- Fine-tuning an LLM
- Custom AI model training

These can be considered later.

---

# 5. Target User

### Primary User

A student preparing for:

- DSA interviews
- Placements
- Coding interviews
- Competitive programming

The user already has access to the course but wants faster revision and better navigation.

---

# 6. Core User Stories

## US-1: Find a concept

> As a student, I want to search for a DSA concept using natural language so that I can quickly find the relevant part of the course.

Example:

```text
Search:
"Dijkstra shortest path"
```

Result:

```text
G-32. Dijkstra's Algorithm
05:41 → 07:40
```

---

## US-2: Find an explanation

> As a student, I want to ask a conceptual question and find where the course explains it.

Example:

```text
"Why priority queue in Dijkstra?"
```

---

## US-3: Jump directly to an explanation

The user can click:

```text
Watch at 05:41
```

and YouTube opens at that timestamp.

---

## US-4: Ask a question

Eventually:

```text
User:
"What is the difference between BFS and DFS?"
```

System:

```text
Retrieve relevant chunks
        ↓
LLM
        ↓
Grounded answer
        ↓
Sources
```

---

## US-5: Verify the answer

Every AI answer should expose its sources:

```text
Sources

G-5. Breadth First Search
02:30 - 04:20

G-6. Depth First Search
01:10 - 03:05
```

This makes the answer auditable.

---

# 7. Product Features

## Phase 1: Data Pipeline

### Playlist ingestion

Collect:

```text
videoId
title
position
url
```

### Transcript extraction

Collect transcript segments:

```json
{
  "start": 0,
  "duration": 4.2,
  "end": 4.2,
  "text": "..."
}
```

### Chunking

Combine transcript segments into manageable chunks while preserving timestamp boundaries.

Current result:

```text
3599 chunks
```

Target chunk size:

```text
~350 words
```

---

# 8. Embedding Pipeline

Generate embeddings for each transcript chunk.

Current vector:

```text
Dimension: 384
```

Store:

```text
chunk
+
embedding
+
metadata
```

The query must be embedded using the same embedding model/embedding space used for stored vectors.

---

# 9. Vector Database

## Qdrant

Collection:

```text
striver_dsa
```

Configuration:

```text
Vector size: 384
Distance: Cosine
```

Current dataset:

```text
Points: 3599
```

Each point contains metadata such as:

```json
{
  "id": 0,
  "vector": "[384 numbers]",
  "payload": {
    "videoId": "...",
    "title": "...",
    "url": "...",
    "chunkIndex": 0,
    "start": 0,
    "end": 112.32,
    "text": "...",
    "wordCount": 344
  }
}
```

---

# 10. Search Architecture

```text
User Query
    ↓
Query Embedding
    ↓
384-dimensional vector
    ↓
Qdrant
    ↓
Similarity Search
    ↓
Top K chunks
    ↓
Ranking / filtering
    ↓
Search Results
```

Example:

```text
Query:
"Dijkstra algorithm"
```

The system returns the most semantically relevant transcript chunks.

---

# 11. Retrieval Quality

Retrieval quality must be evaluated before adding an LLM.

A semantically related chunk is not always the best answer.

For example, a Bellman-Ford transcript chunk may mention Dijkstra and therefore score highly for:

```text
"Dijkstra algorithm"
```

while a dedicated Dijkstra video may receive a lower score.

Therefore, the system should eventually support **hybrid retrieval** and/or reranking.

---

# 12. Retrieval Improvements

The MVP should eventually use **hybrid retrieval**.

Instead of relying only on:

```text
Vector similarity
```

use:

```text
Semantic similarity
        +
Keyword relevance
        +
Metadata
        ↓
Final ranking
```

For example:

Query:

```text
"Dijkstra algorithm"
```

A chunk containing the exact phrase `"Dijkstra's algorithm"` can receive additional ranking weight.

This should help prevent related-but-not-primary results from dominating.

---

# 13. RAG Architecture

Once retrieval is reliable:

```text
                    ┌──────────────┐
                    │    User      │
                    └──────┬───────┘
                           │
                           ↓
                    Natural Language
                           │
                           ↓
                    Query Embedding
                           │
                           ↓
                    ┌──────────────┐
                    │    Qdrant    │
                    └──────┬───────┘
                           │
                     Top K chunks
                           │
                           ↓
                    Context Builder
                           │
                           ↓
                    ┌──────────────┐
                    │     LLM      │
                    └──────┬───────┘
                           │
                           ↓
                    Grounded Answer
                           │
             ┌─────────────┴─────────────┐
             ↓                           ↓
        Explanation                  Sources
                                      + timestamps
```

---

# 14. LLM Requirements

The LLM should be instructed to:

1. Answer using retrieved context.
2. Avoid inventing course content.
3. Say when the retrieved context is insufficient.
4. Provide concise explanations.
5. Include relevant source videos.
6. Include timestamps.
7. Clearly distinguish course-grounded information from any additional knowledge if additional knowledge is eventually permitted.

Example:

```text
Question:
"Why do we use a priority queue in Dijkstra?"
```

Expected structure:

```text
Answer:

The course explains that the priority queue allows us
to process the node having the currently smallest
distance first.

This is important because Dijkstra repeatedly selects
the minimum-distance node and relaxes its neighbours.

Source:
G-32. Dijkstra's Algorithm
05:41 → 07:40
```

---

# 15. API Design

Backend:

```text
Node.js
TypeScript
Express
```

## Search API

```http
GET /api/search?q=dijkstra
```

Response:

```json
{
  "query": "dijkstra",
  "results": [
    {
      "score": 0.64,
      "title": "G-32. Dijkstra's Algorithm",
      "videoId": "V6H1qAeB-l4",
      "start": 341,
      "end": 460,
      "url": "https://youtube.com/...",
      "text": "..."
    }
  ]
}
```

---

## Ask API

Future:

```http
POST /api/ask
```

Request:

```json
{
  "question": "Why does Dijkstra use a priority queue?"
}
```

Response:

```json
{
  "answer": "...",
  "sources": [
    {
      "title": "G-32. Dijkstra's Algorithm",
      "start": 341,
      "end": 460,
      "url": "..."
    }
  ]
}
```

---

# 16. Suggested Backend Structure

```text
src/
│
├── config/
│   ├── env.ts
│   └── qdrant.ts
│
├── ingestion/
│   └── ingestEmbeddings.ts
│
├── search/
│   ├── semanticSearch.ts
│   ├── queryEmbedding.ts
│   └── ranking.ts
│
├── rag/
│   ├── retrieve.ts
│   ├── contextBuilder.ts
│   └── answer.ts
│
├── routes/
│   ├── search.routes.ts
│   └── ask.routes.ts
│
├── controllers/
│   ├── search.controller.ts
│   └── ask.controller.ts
│
├── services/
│   ├── search.service.ts
│   └── rag.service.ts
│
├── app.ts
└── server.ts
```

---

# 17. Frontend

The initial frontend can be simple.

## Search Page

```text
┌─────────────────────────────────────────┐
│        DSA Course Intelligence          │
│                                         │
│  [ Why use priority queue in Dijkstra?] │
│                                         │
│              [ Search ]                 │
└─────────────────────────────────────────┘
```

Result:

```text
G-32. Dijkstra's Algorithm

05:41 ─────────────────────

The algorithm starts by putting the source
node into the priority queue...

[▶ Watch at 05:41]
```

---

## AI Answer Mode

```text
┌─────────────────────────────────────────┐
│ Ask about DSA                           │
│                                         │
│ Why is priority queue used in Dijkstra? │
└─────────────────────────────────────────┘

Answer

Dijkstra uses a priority queue so that the node
with the smallest current distance can be processed
first...

Sources
────────────────────────────────────────────
G-32. Dijkstra's Algorithm
05:41 - 07:40

▶ Watch explanation
```

---

# 18. Data Model

## Video

```text
Video
├── videoId
├── title
├── position
└── url
```

## Chunk

```text
Chunk
├── id
├── videoId
├── chunkIndex
├── start
├── end
├── text
├── wordCount
└── embedding
```

---

# 19. Error Handling

### No results

```text
No relevant course content found.
```

### Low confidence

```text
I couldn't find a sufficiently relevant
explanation in the course.
```

### Qdrant unavailable

```text
Search service temporarily unavailable.
```

### Embedding failure

Retry query embedding generation and return a clear error if it remains unavailable.

---

# 20. Performance Requirements

| Requirement | Target |
|---|---:|
| Search latency | < 1 sec ideally |
| Initial dataset | 3,599+ chunks |
| Vector dimension | 384 |
| Top results | 5-10 |
| API | REST |
| Vector database | Qdrant |

The architecture should support larger datasets without requiring a complete redesign.

---

# 21. Security

- Store secrets/API keys in `.env`.
- Add `.env` to `.gitignore`.
- Never expose API keys to the frontend.
- Validate API request payloads.
- Add rate limiting before public deployment.
- Keep Qdrant credentials/configuration server-side.

---

# 22. Development Roadmap

## Phase 1 — Dataset

- [x] Collect playlist data
- [x] Download transcripts
- [x] Handle failed transcript videos
- [x] Generate transcript chunks
- [x] Generate embeddings
- [x] Validate embedding dimensions

## Phase 2 — Vector Search

- [x] Set up Node.js + TypeScript
- [x] Set up Express
- [x] Set up Qdrant
- [x] Create `striver_dsa` collection
- [x] Insert embeddings
- [x] Generate query embeddings
- [x] Perform semantic search
- [ ] Evaluate retrieval quality
- [ ] Improve ranking

## Phase 3 — Backend API

- [ ] Create `/api/search`
- [ ] Create search service
- [ ] Add validation
- [ ] Add error handling
- [ ] Add timestamp URL generation

## Phase 4 — RAG

- [ ] Build retrieval service
- [ ] Select top relevant chunks
- [ ] Build context
- [ ] Integrate LLM
- [ ] Create `/api/ask`
- [ ] Add source citations
- [ ] Add hallucination safeguards

## Phase 5 — Frontend

- [ ] Search interface
- [ ] Search result cards
- [ ] Timestamp links
- [ ] Ask-question interface
- [ ] AI answer display
- [ ] Source display

## Phase 6 — Quality & Production

- [ ] Create retrieval evaluation dataset
- [ ] Measure Precision@K / Recall@K
- [ ] Improve hybrid search/reranking
- [ ] Add caching
- [ ] Add rate limiting
- [ ] Add logging
- [ ] Deploy backend
- [ ] Deploy frontend

---

# 23. Success Metrics

The project should not be judged only by whether the API works.

### Retrieval

- Relevant result appears in Top 3
- Dedicated concept video ranks above merely related videos
- Correct timestamp points to useful explanation

### RAG

- Answers remain grounded in retrieved content
- Sources are relevant
- Hallucination rate is minimized
- User can verify the answer through the original video

### Performance

- Search response ideally under 1 second
- Stable performance as chunk count increases

---

# 24. Future Extensions

Once the core system works, possible extensions include:

### Multi-course support

```text
Striver A2Z DSA
NeetCode
System Design
Backend
Operating Systems
DBMS
Computer Networks
```

### Knowledge graph

Connect concepts:

```text
Dijkstra
   ↓
Shortest Path
   ↓
Priority Queue
   ↓
Graph
```

### Learning mode

```text
Ask concept
    ↓
Explanation
    ↓
Example
    ↓
Practice problem
    ↓
Hint
    ↓
Solution
```

### Codebase intelligence

The same architecture can eventually be extended to source-code repositories:

```text
Repository
    ↓
Code chunks
    ↓
Embeddings
    ↓
Vector DB
    ↓
Semantic retrieval
    ↓
AI explanation
```

---

# 25. Final Product Definition

The MVP is complete when a user can:

```text
1. Open the application
        ↓
2. Ask a DSA question
        ↓
3. Search semantically across the course
        ↓
4. Receive relevant transcript chunks
        ↓
5. See the video + timestamp
        ↓
6. Jump directly to the explanation
```

The full product is complete when:

```text
User Question
      ↓
Semantic / Hybrid Retrieval
      ↓
Relevant Course Context
      ↓
LLM
      ↓
Grounded Explanation
      ↓
Video + Timestamp Sources
```

The central engineering principle is:

> **Retrieval first. Generation second.**

A fancy LLM cannot rescue poor retrieval. The vector search and ranking layer therefore needs to be reliable before the RAG layer is considered complete.
