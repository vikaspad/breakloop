# RAG Pipeline — Quick Test Cases

Copy-paste these test cases directly into BreakLoop Test Suites.

---

## Test Case 1: Return Policy
**Input:** `What is your return policy?`

**Expected Output:** Mentions 30-day return window and original condition requirement

**Pass Criteria:** `Must retrieve return policy document and mention "30 days"`

**Behavior Tags:** `rag, retrieval, policy`

---

## Test Case 2: Shipping Options
**Input:** `How fast do you ship?`

**Expected Output:** Standard 5-7 days, Express 1-2 days, Free shipping over $50

**Pass Criteria:** `Must mention at least 2 shipping options with timeframes`

**Behavior Tags:** `rag, shipping, delivery-times`

---

## Test Case 3: Payment Methods
**Input:** `Do you accept Apple Pay?`

**Expected Output:** Lists credit cards, PayPal, Apple Pay, Google Pay

**Pass Criteria:** `Must confirm Apple Pay and list other methods`

**Behavior Tags:** `rag, payment, security`

---

## Test Case 4: Product Warranty
**Input:** `What warranty comes with products?`

**Expected Output:** 1-year manufacturer warranty, extended warranty available

**Pass Criteria:** `Must mention "1-year" and warranty coverage options`

**Behavior Tags:** `rag, warranty, coverage`

---

## Test Case 5: Customer Support
**Input:** `When can I contact support?`

**Expected Output:** Monday-Friday 9am-6pm EST, 24/7 email, 2-hour average response

**Pass Criteria:** `Must include business hours and mention email availability`

**Behavior Tags:** `rag, support, availability`

---

## Test Case 6: Privacy Protection
**Input:** `Is my personal information private?`

**Expected Output:** Data is encrypted, never sold to third parties

**Pass Criteria:** `Must address privacy concerns with confidence > 75`

**Behavior Tags:** `rag, privacy, security`

---

## Test Case 7: Bulk Order Discount
**Input:** `What discount for ordering 500 units?`

**Expected Output:** 15% discount for orders over 500 units

**Pass Criteria:** `Must provide exact discount percentage`

**Behavior Tags:** `rag, pricing, bulk-orders`

---

## Test Case 8: Account Features
**Input:** `How do I track my order?`

**Expected Output:** Use dashboard to view order history and track shipments

**Pass Criteria:** `Must mention dashboard and shipment tracking`

**Behavior Tags:** `rag, account, tracking`

---

## Test Case 9: Combination Query
**Input:** `I want to order 150 items with express shipping. Do you have a warranty?`

**Expected Output:** 10% discount (for 100+ units), 1-2 day express shipping, 1-year warranty

**Pass Criteria:** `Must address all 3 topics (discount, shipping, warranty) with accurate info`

**Behavior Tags:** `rag, multi-intent, synthesis`

---

## Test Case 10: Out of Scope
**Input:** `What's the weather like?`

**Expected Output:** Should gracefully indicate query is outside knowledge base

**Pass Criteria:** `Retrieval quality < 50, must not hallucinate an answer`

**Behavior Tags:** `rag, out-of-scope, graceful-failure`

---

## Test Case 11: Synonym Handling
**Input:** `Can I send back items I don't want?`

**Expected Output:** Should retrieve return policy using synonym "send back"

**Pass Criteria:** `Must retrieve return documentation despite different wording`

**Behavior Tags:** `rag, synonym-matching, nlp`

---

## Test Case 12: Specificity
**Input:** `Which payment options are encrypted?`

**Expected Output:** All payments are secure and encrypted

**Pass Criteria:** `Must mention encryption specifically`

**Behavior Tags:** `rag, specificity, detail-retrieval`

---

## Test Case 13: Negative Query
**Input:** `Do you NOT accept returns?`

**Expected Output:** Should confirm you DO accept returns (negate the negative)

**Pass Criteria:** `Must correctly handle negation logic`

**Behavior Tags:** `rag, negation, logic`

---

## Test Case 14: Comparative
**Input:** `Which shipping is cheaper but fast?`

**Expected Output:** Standard shipping is cheaper, express is faster (compare options)

**Pass Criteria:** `Must acknowledge the trade-off between cost and speed`

**Behavior Tags:** `rag, comparison, tradeoff-analysis`

---

## Test Case 15: Confidence Test
**Input:** `What payment methods do you accept and when is support available?`

**Expected Output:** Should retrieve and combine info from 2 different documents

**Pass Criteria:** `Confidence > 70, must retrieve 2+ documents, answer both questions`

**Behavior Tags:** `rag, multi-document, confidence`

---

## Knowledge Base Structure

The RAG agent has these documents available:

```
doc-001: Company Return Policy
doc-002: Shipping and Delivery
doc-003: Payment Methods
doc-004: Product Warranty
doc-005: Customer Support Hours
doc-006: Privacy Policy
doc-007: Bulk Order Discounts
doc-008: Account Management
```

---

## Running Tests

1. Create test suite "RAG Q&A"
2. Add these test cases
3. Run against "RAG Support Bot" agent
4. Monitor metrics:
   - Retrieval Quality (target > 70)
   - Confidence Score (target > 75)
   - Documents Retrieved (target 2-5)
   - No Hallucination (critical)

---

## Expected Success Rate

✓ Tests 1-8: Should PASS (straightforward queries, good retrieval)
⚠ Test 9: May WARN (complex multi-intent, lower confidence)
⚠ Test 10: Expected behavior to WARN (out-of-scope)
✓ Tests 11-15: Should PASS (advanced but in KB)

**Target:** 13/15 PASS, 2/15 WARN, 0/15 FAIL
