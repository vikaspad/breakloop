# RAG Pipeline Testing in BreakLoop

Complete guide to understanding and testing Retrieval-Augmented Generation (RAG) pipelines in BreakLoop.

---

## Table of Contents

1. [What is RAG?](#what-is-rag)
2. [RAG Architecture](#rag-architecture)
3. [Quick Start](#quick-start)
4. [Test Cases](#test-cases)
5. [Evaluation Metrics](#evaluation-metrics)
6. [Real-World Applications](#real-world-applications)
7. [Troubleshooting](#troubleshooting)

---

## What is RAG?

**RAG (Retrieval-Augmented Generation)** combines two AI capabilities:

### 1. **Retrieval**
- Search a knowledge base for relevant documents/context
- Rank documents by relevance to the query
- Return top-k most relevant documents

### 2. **Augmentation**
- Add retrieved documents to the prompt context
- Provide the LLM with grounding information
- Constrain the response to factual content

### 3. **Generation**
- LLM generates response based on augmented prompt
- Response is grounded in retrieved context
- Reduces hallucinations and improves accuracy

---

## Why RAG?

### Problem with Standard LLMs:
```
User: "What is your return policy?"
     ↓
LLM (no context): "Typically, return windows vary..."
     ↓
Response: ❌ Generic, hallucinated, possibly incorrect
```

### Solution with RAG:
```
User: "What is your return policy?"
     ↓
Retrieval: Find "Return Policy" document in KB
     ↓
Augmentation: Add policy text to prompt
     ↓
Generation: "Based on company policy, returns accepted within 30 days..."
     ↓
Response: ✓ Specific, factual, accurate
```

---

## RAG Architecture

```
┌─────────────────────────────────────┐
│        User Query                   │
│  "What is your return policy?"      │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│     Query Understanding             │
│  - Parse query                      │
│  - Extract intent                   │
│  - Generate search terms            │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│     Retrieval (Search KB)           │
│  - Find relevant documents          │
│  - Rank by relevance               │
│  - Select top-k documents          │
└────────────┬────────────────────────┘
             │
      Retrieved Documents:
      ┌─────────────────────┐
      │ Return Policy Doc   │
      │ (score: 95/100)     │
      └─────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│     Context Augmentation            │
│  - Combine query + documents        │
│  - Build augmented prompt           │
│  - Add retrieval metadata           │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│     LLM Generation                  │
│  Augmented Prompt:                  │
│  "Based on company policy:          │
│   Returns: 30 days, original        │
│   condition...                      │
│   User asks: Return policy?"        │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│     Generated Response              │
│  "According to our policy,          │
│   returns accepted within 30 days   │
│   with original receipt and         │
│   original condition..."            │
└─────────────────────────────────────┘
```

---

## Quick Start

### Step 1: Start Agent
```bash
double-click: start-rag-agent.bat
# OR
cd rag-pipeline && node agent.js
```

### Step 2: Onboard in BreakLoop
- Go to **Agents** → **+ Onboard Agent**
- Name: `RAG Support Bot`
- Type: `RAG_PIPELINE`
- Endpoint: `http://localhost:3004/api/rag`

### Step 3: Create Test Suite
- Name: `RAG Pipeline Q&A`
- Add test cases from `QUICK_TEST_CASES.md`

### Step 4: Run Tests
- Select agent & suite
- Click **▶ RUN NOW**
- Monitor retrieval quality & confidence

---

## Test Cases

### Beginner: Basic Queries
```
✓ "What is your return policy?"
✓ "How fast do you ship?"
✓ "Do you accept credit cards?"
```

### Intermediate: Specific Retrieval
```
✓ "What's your warranty coverage?"
✓ "When is customer support available?"
✓ "Do you offer bulk discounts?"
```

### Advanced: Multi-Document
```
✓ "I want to order 200 units with overnight shipping"
✓ "What warranty + support do you offer?"
✓ "Complete order process with all costs"
```

### Edge Cases: Robustness
```
✓ Out-of-scope: "What's the weather?"
✓ Synonym handling: "Can I send back items?"
✓ Negation: "Do you NOT accept returns?"
```

See `TESTING_RAG_PIPELINES.md` for 10 detailed test cases.

---

## Evaluation Metrics

### Retrieval Quality Metrics

| Metric | Meaning | Target |
|--------|---------|--------|
| **Documents Retrieved** | How many KB docs were used | 2-5 |
| **Retrieval Score** | Avg relevance of top docs | > 70 |
| **Coverage** | % of query intent covered | > 80% |
| **Precision** | % of retrieved docs are relevant | > 80% |
| **Recall** | % of relevant docs were found | > 70% |

### Generation Quality Metrics

| Metric | Meaning | Target |
|--------|---------|--------|
| **Hallucination** | Facts not in retrieved docs | 0% |
| **Accuracy** | Response facts match KB | > 95% |
| **Completeness** | All query aspects answered | > 80% |
| **Confidence** | LLM confidence in response | > 75 |
| **Citation Accuracy** | Correct source attribution | 100% |

### System Metrics

| Metric | Meaning | Target |
|--------|---------|--------|
| **Latency** | Time from query to response | < 500ms |
| **Context Length** | Tokens of context used | 100-500 |
| **Response Length** | Length of generated text | 100-500 chars |

---

## RAG vs Other Agent Types

| Agent Type | Method | Pros | Cons |
|---|---|---|---|
| **Conversational** | Direct LLM | Fast, flexible | Can hallucinate |
| **Tool-Using** | Calls external tools | Real-time data | Complex orchestration |
| **RAG** | Retrieves + generates | Accurate, grounded | Requires KB quality |
| **Multi-Agent** | Multiple specialized agents | Modular, scalable | Complex coordination |
| **Autonomous** | Self-directed execution | Independent decisions | Hard to control |

---

## Real-World RAG Applications

### 1. Customer Support
```
KB: Company policies, FAQs, product info
Query: "How do I return an item?"
Response: Retrieves return policy, shipping details
Impact: Fast, accurate support without human
```

### 2. Legal Research
```
KB: Case law, statutes, regulations
Query: "Is this precedent applicable?"
Response: Retrieves relevant cases, legal analysis
Impact: Faster contract review, legal research
```

### 3. Medical Diagnosis
```
KB: Medical literature, symptom databases
Query: "Persistent headache + fever symptoms"
Response: Retrieves relevant conditions, treatments
Impact: Assists doctors with diagnosis, treatment
```

### 4. Internal Documentation
```
KB: API docs, code examples, design docs
Query: "How to use authentication endpoint?"
Response: Retrieves API docs, code samples
Impact: Faster onboarding, fewer support tickets
```

### 5. Product Recommendations
```
KB: Product catalog, specifications, reviews
Query: "I need a laptop for video editing"
Response: Retrieves relevant products, specs
Impact: Personalized recommendations
```

---

## Knowledge Base Design

### Document Structure
```
Each document should have:
- Unique ID (doc-001)
- Descriptive Title ("Return Policy")
- Content (full text or summary)
- Category (policies, shipping, etc.)
- Keywords (for better retrieval)
```

### Organization
```
✓ GOOD: Small, focused documents
✓ GOOD: Clear titles and metadata
✓ GOOD: Related documents grouped

❌ BAD: One huge 100KB document
❌ BAD: Vague titles like "Info"
❌ BAD: Poor categorization
```

### Optimization
```
Techniques for better retrieval:
- Semantic search (embeddings)
- Hybrid search (keyword + semantic)
- Query expansion (synonyms)
- Document summarization
- Metadata filtering
```

---

## Failure Modes and Fixes

### Failure: Poor Retrieval
```
Symptom: Retrieved documents not relevant
Cause: KB poorly organized or query expansion missing
Fix:
  1. Improve document titles/summaries
  2. Add query expansion (synonyms)
  3. Use semantic search instead of keyword
```

### Failure: Hallucination
```
Symptom: Response includes facts not in KB
Cause: LLM adding information from training data
Fix:
  1. Use stricter prompt: "Only use provided context"
  2. Add fact verification step
  3. Reduce temperature (more deterministic)
```

### Failure: Incomplete Answers
```
Symptom: Response misses important info
Cause: Retrieved only 1 document instead of multiple
Fix:
  1. Increase k (retrieve more documents)
  2. Improve retrieval ranking
  3. Split complex queries into sub-queries
```

### Failure: Out-of-Scope Handling
```
Symptom: Responds to questions KB doesn't cover
Cause: No out-of-scope detection
Fix:
  1. Check retrieval confidence
  2. If low, respond: "I don't have that info"
  3. Suggest escalation to human support
```

---

## Testing Strategy

### Phase 1: Basic Functionality
```
□ Agent connects and responds
□ Documents are retrieved
□ Response includes generated text
□ Metrics are calculated
```

### Phase 2: Retrieval Quality
```
□ Relevant documents retrieved
□ Retrieval scores > 70
□ Multi-document queries work
□ Category coverage complete
```

### Phase 3: Generation Quality
```
□ No hallucinations
□ Accuracy > 95%
□ All query aspects answered
□ Confidence scores appropriate
```

### Phase 4: Edge Cases
```
□ Out-of-scope queries handled
□ Synonyms work
□ Negations understood
□ Complex queries parsed
```

### Phase 5: Performance
```
□ Latency < 500ms
□ Handles concurrent queries
□ Memory usage acceptable
□ No timeout errors
```

---

## Troubleshooting

### Q: Agent shows PENDING instead of HEALTHY
**A:** Make sure `node agent.js` is running
```bash
curl http://localhost:3004/health
```

### Q: No documents retrieved
**A:** Query doesn't match any documents
```bash
curl http://localhost:3004/api/rag/kb-stats
# Check available documents and categories
```

### Q: Low retrieval scores (< 50)
**A:** Either query is out-of-scope or KB organization is poor
```
Options:
1. Check if query is in KB scope
2. Use synonyms that match document content
3. Try keywords from document titles
```

### Q: High retrieval but low confidence
**A:** LLM uncertain despite having context
```
Possible causes:
- Conflicting documents retrieved
- Ambiguous query
- Generated response differs from context
Fix: Check "no_hallucination" eval score
```

### Q: Response seems hallucinated
**A:** LLM added information not in KB
```
Fix:
1. Check retrieved documents contain the claim
2. Add fact verification step
3. Use stricter prompt
4. Lower LLM temperature
```

---

## Advanced: Extending RAG

### Add to Mock Agent:
```javascript
// Semantic search
function semanticSearch(query, embeddings) {
  const queryVec = embed(query);
  return docs.sort((a, b) => 
    cosine(queryVec, b.embedding) - 
    cosine(queryVec, a.embedding)
  );
}

// Multi-query
function expandQuery(query) {
  return [
    query,
    paraphrase(query),
    extractKeywords(query),
  ];
}

// Fact verification
function verifyFacts(response, docs) {
  const claims = extractClaims(response);
  return claims.map(c => ({
    claim: c,
    verified: docs.some(d => d.content.includes(c))
  }));
}
```

---

## Summary

**RAG Pipelines are best for:**
- ✓ Knowledge-intensive tasks
- ✓ Grounding responses in factual data
- ✓ Reducing hallucinations
- ✓ Domain-specific QA
- ✓ Compliance-heavy applications

**Test with BreakLoop to:**
- ✓ Measure retrieval quality
- ✓ Detect hallucinations
- ✓ Track confidence scores
- ✓ Monitor KB coverage
- ✓ Catch failure modes early

**Key Metrics to Watch:**
- ✓ Retrieval quality (> 70)
- ✓ Hallucination rate (0%)
- ✓ Accuracy (> 95%)
- ✓ Confidence (> 75)
- ✓ Coverage (> 80%)

---

## Files Reference

- `agent.js` — Mock RAG pipeline server
- `TESTING_RAG_PIPELINES.md` — Complete testing guide (10 test cases)
- `QUICK_TEST_CASES.md` — Copy-paste test cases
- `start-rag-agent.bat` — Quick launcher
- `RAG_PIPELINE_GUIDE.md` — This file

---

## Next Steps

1. ✓ Start RAG agent: `start-rag-agent.bat`
2. ✓ Onboard in BreakLoop
3. ✓ Create test suite from `QUICK_TEST_CASES.md`
4. ✓ Run 10 test cases and review results
5. ✓ Monitor retrieval quality in Failures tab
6. ✓ Iterate on KB and test cases
7. ✓ Export results to Excel for analysis
