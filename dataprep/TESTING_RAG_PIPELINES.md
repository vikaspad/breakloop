# Testing RAG Pipelines with BreakLoop

Complete guide to test Retrieval-Augmented Generation (RAG) agents in BreakLoop using the provided mock RAG pipeline.

---

## What is a RAG Pipeline?

A **Retrieval-Augmented Generation (RAG)** pipeline is an AI system that:
- **Retrieves** relevant documents/context from a knowledge base
- **Augments** the user prompt with retrieved context
- **Generates** a response based on the augmented context

Instead of relying solely on model training, RAG systems can:
- ✓ Ground responses in real, up-to-date information
- ✓ Cite sources (documents used)
- ✓ Reduce hallucinations (constrained by retrieved context)
- ✓ Handle domain-specific queries better

**Real-world examples:**
- Customer support chatbots (retrieves company policies)
- Legal research systems (retrieves case law)
- Medical diagnosis assistants (retrieves medical literature)
- Company Q&A bots (retrieves documentation)

---

## Step 1: Start the RAG Pipeline Agent

```bash
run start-rag-agent.bat
```

You should see:
```
🔍 RAG Pipeline Agent running on http://localhost:3004
📍 Endpoint: POST /api/rag
📊 Stats:   GET /api/rag/kb-stats
❤️  Health:  GET /health
```

---

## Step 2: Onboard the RAG Agent in BreakLoop

### In BreakLoop UI:

1. Go to **Agents** → Click **+ Onboard Agent**

2. **Step 1: Identity**
   - **Name:** `RAG Support Bot`
   - **Type:** `RAG_PIPELINE` ← Important!
   - **Description:** `RAG pipeline that retrieves company documentation to answer customer questions`
   - **Tags:** `rag, qa, knowledge-base, production`

3. **Step 2: Connection**
   - **Connection Type:** `REST API`
   - **Endpoint:** `http://localhost:3004/api/rag`
   - **Auth Type:** `NONE`

4. **Step 3: Schema**
   - **Input Schema:**
     ```json
     {
       "type": "object",
       "properties": {
         "input": {"type": "string", "description": "Customer question or query"},
         "session_id": {"type": "string"}
       },
       "required": ["input"]
     }
     ```
   - **Output Schema:**
     ```json
     {
       "type": "object",
       "properties": {
         "query": {"type": "string"},
         "retrieved_documents": {
           "type": "array",
           "items": {
             "type": "object",
             "properties": {
               "id": {"type": "string"},
               "title": {"type": "string"},
               "retrieval_score": {"type": "number"},
               "category": {"type": "string"}
             }
           }
         },
         "generated_response": {"type": "string"},
         "metrics": {
           "type": "object",
           "properties": {
             "retrieval_quality": {"type": "number"},
             "documents_retrieved": {"type": "number"},
             "confidence_score": {"type": "number"}
           }
         },
         "trace_steps": {"type": "array"}
       }
    }
     ```

5. **Step 4: Eval Criteria** (select all)
   - ✓ goal_completion
   - ✓ no_hallucination
   - ✓ schema_valid
   - ✓ tool_accuracy
   - ✓ instruction_fidelity

6. **Step 5: Review & Save**
   - Click **Save Agent**
   - Should show **HEALTHY** status ✓

---

## Step 3: Create Test Suite for RAG Pipeline

### Test Suite: "RAG Pipeline Q&A"

Create 10 test cases testing different aspects of RAG:

---

### Test Case 1: Basic Query (Good Retrieval)
```
INPUT:
What is your return policy?

EXPECTED OUTPUT:
Should retrieve "Company Return Policy" document and generate response about 30-day returns

PASS CRITERIA:
- Must retrieve at least 1 document
- Response must mention "30 days"
- Retrieval quality > 70

BEHAVIOR TAGS:
rag, retrieval, document-matching, qa
```

**What tests:** Can RAG retrieve relevant documents for straightforward queries?

---

### Test Case 2: Multi-Document Retrieval
```
INPUT:
What are your shipping options and how long do they take?

EXPECTED OUTPUT:
Should retrieve "Shipping and Delivery" document with details on standard (5-7 days) and express (1-2 days) shipping

PASS CRITERIA:
- Must retrieve shipping documentation
- Response must include timeframes
- Confidence score > 75

BEHAVIOR TAGS:
rag, multi-document, retrieval-quality
```

**What tests:** Can RAG retrieve and integrate multiple documents?

---

### Test Case 3: Payment Question
```
INPUT:
Do you accept credit cards?

EXPECTED OUTPUT:
Should retrieve "Payment Methods" document listing card types (Visa, Mastercard, Amex)

PASS CRITERIA:
- Must mention specific card types
- Should mention PayPal/Apple Pay/Google Pay
- Retrieval score > 65

BEHAVIOR TAGS:
rag, specificity, fact-accuracy
```

**What tests:** Does RAG return specific factual information from documents?

---

### Test Case 4: Warranty Question
```
INPUT:
What warranty do your products come with?

EXPECTED OUTPUT:
Should retrieve warranty document mentioning 1-year manufacturer warranty and extended options

PASS CRITERIA:
- Must mention "1-year"
- Should mention warranty coverage
- No hallucination of made-up warranty terms

BEHAVIOR TAGS:
rag, hallucination-prevention, factual-grounding
```

**What tests:** Does RAG avoid hallucinating and stick to documented facts?

---

### Test Case 5: Customer Support Hours
```
INPUT:
What are your customer support hours?

EXPECTED OUTPUT:
Should retrieve support documentation showing Monday-Friday 9am-6pm EST and 24/7 email

PASS CRITERIA:
- Must include business hours
- Must mention email availability
- Should include response time (2 hours avg)

BEHAVIOR TAGS:
rag, document-retrieval, information-accuracy
```

**What tests:** Can RAG answer structured Q&A from documentation?

---

### Test Case 6: Bulk Ordering
```
INPUT:
What discounts do you offer for large orders?

EXPECTED OUTPUT:
Should retrieve bulk discount document with tiered pricing (10%, 15%, 20%)

PASS CRITERIA:
- Must mention specific discount percentages
- Should list quantity thresholds (100, 500, 1000)
- All numbers must be accurate

BEHAVIOR TAGS:
rag, numeric-accuracy, tier-retrieval
```

**What tests:** Does RAG accurately retrieve and communicate numeric information?

---

### Test Case 7: Privacy Concerns
```
INPUT:
Is my personal data safe with you? Do you sell my information?

EXPECTED OUTPUT:
Should retrieve privacy policy confirming data protection and no third-party sales

PASS CRITERIA:
- Must explicitly state data not sold
- Should mention encryption
- Confidence > 80

BEHAVIOR TAGS:
rag, sensitive-topics, accurate-reassurance
```

**What tests:** Can RAG handle sensitive queries with accurate reassurance?

---

### Test Case 8: Account Management
```
INPUT:
How do I view my order history and track shipments?

EXPECTED OUTPUT:
Should retrieve account management documentation describing dashboard features

PASS CRITERIA:
- Must mention dashboard/account settings
- Should mention order history tracking
- Should mention shipment tracking

BEHAVIOR TAGS:
rag, feature-documentation, user-guidance
```

**What tests:** Can RAG guide users to features in documentation?

---

### Test Case 9: Out-of-Scope Question (Graceful Degradation)
```
INPUT:
What is the meaning of life?

EXPECTED OUTPUT:
Should recognize query is not in knowledge base and gracefully indicate limited information

PASS CRITERIA:
- Retrieval quality < 50 (no relevant docs)
- Should not hallucinate an answer
- Response should indicate knowledge base limitations

BEHAVIOR TAGS:
rag, out-of-scope, graceful-failure
```

**What tests:** How does RAG handle questions outside its knowledge base?

---

### Test Case 10: Complex Multi-Intent Query
```
INPUT:
I want to order 200 units with overnight shipping and pay with Apple Pay. Do you have warranty coverage?

EXPECTED OUTPUT:
Should retrieve documents on: bulk discounts, shipping, payment methods, warranty

PASS CRITERIA:
- Must retrieve at least 3 different documents
- Response should address all intents
- Should mention 15% discount (for 200 units)
- Should confirm Apple Pay accepted
- Should mention warranty coverage

BEHAVIOR TAGS:
rag, multi-intent, complex-query, information-synthesis
```

**What tests:** Can RAG handle complex queries requiring information from multiple documents?

---

## Step 4: Run the Test Suite

1. Go to **Run Center**
2. Select:
   - **Agent:** RAG Support Bot
   - **Suite:** RAG Pipeline Q&A
3. Click **▶ RUN NOW**

---

## Expected Results

After running the 10 test cases, you should see:

```
✓ RUN COMPLETE — Pass: 9 · Warn: 1 · Fail: 0 · Overall: 88/100
```

### Individual Results:
- ✓ **Test 1:** PASS - Retrieved return policy correctly
- ✓ **Test 2:** PASS - Retrieved multiple shipping docs
- ✓ **Test 3:** PASS - Listed all payment methods accurately
- ✓ **Test 4:** PASS - Grounded response in warranty documentation
- ✓ **Test 5:** PASS - Retrieved support hours correctly
- ✓ **Test 6:** PASS - All discount percentages accurate
- ✓ **Test 7:** PASS - Privacy concerns addressed from policy
- ✓ **Test 8:** PASS - Guided user to account features
- ⚠ **Test 9:** WARN - Gracefully handled out-of-scope query but confidence lower
- ✓ **Test 10:** PASS - Synthesized information from 4+ documents

---

## What Makes This a RAG Pipeline?

✓ **Retrieval:** Searches knowledge base for relevant documents
✓ **Ranking:** Scores documents by relevance to query
✓ **Augmentation:** Adds top documents to prompt context
✓ **Generation:** Uses augmented context to generate response
✓ **Transparency:** Shows which documents were retrieved
✓ **Grounding:** Response constrained by actual documentation
✓ **Metrics:** Tracks retrieval quality and confidence

---

## Testing RAG Quality

### In Failure Explorer, look for:

- ✓ **goal_completion:** Did RAG answer the user's question?
- ✓ **no_hallucination:** Did RAG invent facts or stick to knowledge base?
- ✓ **schema_valid:** Did response include all required fields?
- ✓ **tool_accuracy:** Were retrieved documents actually relevant?
- ✓ **instruction_fidelity:** Did RAG follow the query intent?

### Additional Metrics to Monitor:

```
Metric                  What It Means                    Target
─────────────────────────────────────────────────────────────
Retrieval Quality       Relevance of top documents       > 70
Documents Retrieved     How many KB docs were used       2-5
Confidence Score        Overall response quality          > 75
Context Tokens Used     Amount of document context       100-500
Response Length         Length of generated response      100-500 chars
```

---

## Advanced Testing: Knowledge Base Coverage

To test RAG comprehensiveness, vary queries:

### Coverage Test 1: All Categories
```
Test each document category:
- "I need to return an item" → policies
- "How fast can you ship?" → shipping
- "What cards do you accept?" → payment
- "What if my product breaks?" → warranty
- "When can I contact support?" → support
- "Is my data private?" → legal
- "Do you have discounts?" → pricing
- "How do I update my account?" → account
```

### Coverage Test 2: Synonym Handling
```
Test if RAG finds docs with similar words:
- "How do I give something back?" (return synonym)
- "Quick delivery?" (shipping synonym)
- "Secure payment?" (payment synonym)
- "Product guarantee?" (warranty synonym)
```

### Coverage Test 3: Negative Queries
```
Test handling of NOT queries:
- "Do you NOT accept returns?"
- "Is my data NOT secure?"
- "Will my order NOT ship fast?"
```

---

## Optimization: Improving RAG Quality

If you see low retrieval scores, consider:

1. **Better Document Organization**
   - More granular documents (split long docs)
   - Clear titles and summaries
   - Relevant metadata/tags

2. **Enhanced Retrieval**
   - Add semantic search (embeddings)
   - Implement BM25 ranking
   - Add query expansion

3. **Context Quality**
   - Include document summaries not full text
   - Add relevance explanations
   - Include document metadata

4. **Response Quality**
   - Add citation generation (which docs were used)
   - Include confidence levels per claim
   - Add "not found" fallback for out-of-scope

---

## Quick Start Commands

```bash
# 1. Start agent
cd rag-pipeline && node agent.js &

# 2. Test connectivity
curl -X POST http://localhost:3004/api/rag \
  -H "Content-Type: application/json" \
  -d '{
    "input": "What is your return policy?",
    "session_id": "test-123"
  }'

# 3. Should respond with retrieved documents and generated response

# 4. Check knowledge base stats
curl http://localhost:3004/api/rag/kb-stats
```

---

## Real-World RAG Use Cases

This mock RAG demonstrates patterns used in:

| Use Case | Knowledge Base | Query Type |
|----------|---|---|
| **Support Chatbot** | Company docs, FAQs, policies | "How do I...?" "What is...?" |
| **Legal Research** | Case law, statutes, regulations | "Is this precedent applicable?" |
| **Medical Assistant** | Medical literature, guidelines | "Symptoms indicate...?" |
| **Code Documentation** | API docs, examples, tutorials | "How to use...?" |
| **Product Research** | Product specs, comparisons | "Which product best...?" |
| **HR Assistant** | Policies, benefits, procedures | "What's the policy on...?" |

---

## Troubleshooting

### Agent shows PENDING instead of HEALTHY
- Make sure `node agent.js` is running on port 3004
- Check: `curl http://localhost:3004/health`

### No documents retrieved
- Query might be too specific or use different terminology
- Check KB stats: `curl http://localhost:3004/api/rag/kb-stats`
- Try synonym variations

### Low confidence scores
- Fewer documents retrieved = lower confidence
- Out-of-scope queries have lower confidence (expected)
- Check `retrieval_quality` metric in response

### Response seems hallucinated
- Check if retrieved documents actually mention the claim
- This would indicate RAG isn't properly using context
- Test with "no_hallucination" evaluation criteria

---

## Next Steps

1. ✓ Run the 10 provided test cases
2. ✓ Monitor metrics: retrieval quality, confidence
3. ✓ Add custom test cases for your domain
4. ✓ Expand knowledge base with real documents
5. ✓ Implement semantic search for better retrieval
6. ✓ Add fact verification against documents
7. ✓ Track citation accuracy
