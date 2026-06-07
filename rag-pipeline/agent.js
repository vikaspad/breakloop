/**
 * RAG Pipeline Agent Simulator
 *
 * Demonstrates a Retrieval-Augmented Generation pipeline:
 * 1. Parse user query
 * 2. Retrieve relevant documents from knowledge base
 * 3. Augment prompt with retrieved context
 * 4. Generate response using augmented context
 * 5. Return response with retrieval metadata
 */

const express = require("express");
const app = express();
app.use(express.json());

// Mock knowledge base - company documentation
const knowledgeBase = [
  {
    id: "doc-001",
    title: "Company Return Policy",
    content: "Returns are accepted within 30 days of purchase with original receipt. Items must be in original condition.",
    category: "policies",
    relevanceScore: 0,
  },
  {
    id: "doc-002",
    title: "Shipping and Delivery",
    content: "Standard shipping takes 5-7 business days. Express shipping available for 1-2 day delivery. Free shipping on orders over $50.",
    category: "shipping",
    relevanceScore: 0,
  },
  {
    id: "doc-003",
    title: "Payment Methods",
    content: "We accept credit cards (Visa, Mastercard, Amex), PayPal, Apple Pay, and Google Pay. All payments are secure and encrypted.",
    category: "payment",
    relevanceScore: 0,
  },
  {
    id: "doc-004",
    title: "Product Warranty",
    content: "All products come with a 1-year manufacturer warranty covering defects. Extended warranty options available for purchase.",
    category: "warranty",
    relevanceScore: 0,
  },
  {
    id: "doc-005",
    title: "Customer Support Hours",
    content: "Our customer support team is available Monday-Friday 9am-6pm EST. Email support available 24/7. Average response time is 2 hours.",
    category: "support",
    relevanceScore: 0,
  },
  {
    id: "doc-006",
    title: "Privacy Policy",
    content: "We protect your personal data with industry-standard encryption. Your data is never sold to third parties. See our privacy policy for details.",
    category: "legal",
    relevanceScore: 0,
  },
  {
    id: "doc-007",
    title: "Bulk Order Discounts",
    content: "Orders over 100 units receive 10% discount. Orders over 500 units receive 15% discount. Orders over 1000 units receive 20% discount.",
    category: "pricing",
    relevanceScore: 0,
  },
  {
    id: "doc-008",
    title: "Account Management",
    content: "Manage your account settings, view order history, track shipments, and update payment methods in your dashboard.",
    category: "account",
    relevanceScore: 0,
  },
];

// Simple keyword-based similarity scoring
function calculateSimilarity(query, doc) {
  const queryWords = query.toLowerCase().split(/\s+/);
  const docText = (doc.title + " " + doc.content).toLowerCase();

  let matches = 0;
  for (const word of queryWords) {
    if (word.length > 3 && docText.includes(word)) {
      matches++;
    }
  }

  // Also check category keywords
  const categoryBoost = {
    "shipping": ["shipping", "delivery", "track", "delivery"],
    "payment": ["pay", "payment", "credit", "card"],
    "warranty": ["warranty", "coverage", "defect"],
    "policies": ["return", "policy", "refund", "exchange"],
    "support": ["help", "support", "contact", "customer"],
    "legal": ["privacy", "policy", "terms", "agreement"],
    "pricing": ["price", "discount", "bulk", "cost"],
    "account": ["account", "profile", "settings", "login"],
  };

  return (matches / queryWords.length) * 100;
}

// Retrieve relevant documents from knowledge base
function retrieveDocuments(query, topK = 3) {
  const scored = knowledgeBase.map(doc => ({
    ...doc,
    score: calculateSimilarity(query, doc),
  }));

  return scored
    .filter(doc => doc.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ score, ...doc }) => ({
      ...doc,
      retrievalScore: Math.round(score),
    }));
}

// Generate RAG response with augmented context
function generateRAGResponse(query, retrievedDocs) {
  const augmentedContext = retrievedDocs
    .map(doc => `[${doc.title}]: ${doc.content}`)
    .join("\n\n");

  const responseTemplates = {
    shipping: "Based on our shipping policy, {context}",
    return: "Regarding returns, {context}",
    payment: "For payment options, {context}",
    warranty: "Our warranty coverage includes {context}",
    support: "Our support team can help. {context}",
    account: "In your account, you can {context}",
    discount: "For bulk orders, {context}",
    price: "Regarding pricing, {context}",
  };

  let template = "Here's what I found from our documentation: {context}";
  for (const [key, tpl] of Object.entries(responseTemplates)) {
    if (query.toLowerCase().includes(key)) {
      template = tpl;
      break;
    }
  }

  const response = template.replace("{context}", augmentedContext);

  return {
    response,
    augmentedPrompt: `You are a helpful customer service assistant. Use the following context to answer the query:\n\n${augmentedContext}\n\nQuery: ${query}`,
    contextLength: augmentedContext.length,
  };
}

// Calculate retrieval quality score
function calculateRetrievalQuality(retrievedDocs) {
  if (retrievedDocs.length === 0) return 0;

  const avgScore = retrievedDocs.reduce((sum, doc) => sum + doc.retrievalScore, 0) / retrievedDocs.length;
  const coverage = Math.min(retrievedDocs.length * 25, 100); // 3+ docs = 75%+ score

  return Math.round((avgScore * 0.6 + coverage * 0.4));
}

// Main RAG endpoint
app.post("/api/rag", (req, res) => {
  const { input, session_id } = req.body;

  if (!input) {
    return res.status(400).json({ error: "Input query required" });
  }

  const startTime = Date.now();

  // Step 1: Retrieve relevant documents
  const retrievedDocs = retrieveDocuments(input, 3);

  // Step 2: Generate RAG response
  const ragOutput = generateRAGResponse(input, retrievedDocs);

  // Step 3: Calculate quality metrics
  const retrievalQuality = calculateRetrievalQuality(retrievedDocs);
  const responseLength = ragOutput.response.length;
  const latencyMs = Date.now() - startTime;

  // Step 4: Construct trace steps
  const traceSteps = [
    {
      step: "Query Parsing",
      status: "pass",
      msg: `Parsed query: "${input.substring(0, 50)}${input.length > 50 ? "..." : ""}"`,
      ms: "2ms",
    },
    {
      step: "Document Retrieval",
      status: "pass",
      msg: `Retrieved ${retrievedDocs.length} relevant documents from knowledge base`,
      ms: "5ms",
    },
    {
      step: "Retrieval Quality",
      status: retrievalQuality > 60 ? "pass" : "warn",
      msg: `Quality score: ${retrievalQuality}/100`,
      ms: "1ms",
    },
    {
      step: "Context Augmentation",
      status: retrievedDocs.length > 0 ? "pass" : "fail",
      msg: `Augmented prompt with ${ragOutput.contextLength} characters of context`,
      ms: "3ms",
    },
    {
      step: "Response Generation",
      status: "pass",
      msg: `Generated response with ${responseLength} characters`,
      ms: "4ms",
    },
  ];

  res.json({
    input,
    session_id,
    pipeline_type: "retrieval_augmented_generation",
    query: input,
    retrieved_documents: retrievedDocs.map(doc => ({
      id: doc.id,
      title: doc.title,
      content: doc.content.substring(0, 100) + "...",
      category: doc.category,
      retrieval_score: doc.retrievalScore,
    })),
    augmented_context: ragOutput.augmentedContext,
    generated_response: ragOutput.response,
    metrics: {
      retrieval_quality: retrievalQuality,
      documents_retrieved: retrievedDocs.length,
      context_tokens_used: Math.round(ragOutput.contextLength / 4), // Estimate tokens
      response_length: responseLength,
      latency_ms: latencyMs,
    },
    trace_steps: traceSteps,
    confidence_score: Math.round(retrievalQuality * 0.95), // Slightly lower than retrieval quality
  });
});

// Get knowledge base stats
app.get("/api/rag/kb-stats", (req, res) => {
  const categories = {};
  knowledgeBase.forEach(doc => {
    categories[doc.category] = (categories[doc.category] || 0) + 1;
  });

  res.json({
    total_documents: knowledgeBase.length,
    categories,
    status: "healthy",
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "healthy", agent: "rag_pipeline" });
});

const PORT = 3004;
app.listen(PORT, () => {
  console.log(`🔍 RAG Pipeline Agent running on http://localhost:${PORT}`);
  console.log(`📍 Endpoint: POST /api/rag`);
  console.log(`📊 Stats:   GET /api/rag/kb-stats`);
  console.log(`❤️  Health:  GET /health`);
});
