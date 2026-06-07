/**
 * Mock Autonomous Agent Simulator
 *
 * This simulates an autonomous agent that can:
 * - Make decisions without user input
 * - Call tools/functions independently
 * - Plan multi-step actions
 * - Execute and report results
 */

const express = require("express");
const app = express();
app.use(express.json());

// Simulated tools the autonomous agent can use
const tools = {
  search_db: (query) => {
    const mockDb = {
      "user:123": { id: 123, name: "John Doe", email: "john@example.com", role: "admin" },
      "user:456": { id: 456, name: "Jane Smith", email: "jane@example.com", role: "user" },
      "product:001": { id: "001", name: "Laptop", price: 999, stock: 5 },
      "product:002": { id: "002", name: "Mouse", price: 29, stock: 50 },
    };
    return mockDb[query] || { error: "Not found" };
  },

  calculate_discount: (price, percentage) => {
    return { original: price, discount_percent: percentage, final_price: price * (1 - percentage / 100) };
  },

  send_notification: (user_id, message) => {
    return { status: "success", user_id, message_sent: message, timestamp: new Date().toISOString() };
  },

  generate_report: (data_type, filters) => {
    return { report_id: "RPT-" + Date.now(), data_type, filters_applied: filters, records: 42 };
  },

  validate_input: (value, rule) => {
    const rules = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      phone: /^\d{10}$/.test(value),
      username: /^[a-zA-Z0-9_]{3,20}$/.test(value),
      password: value.length >= 8,
    };
    return { value, rule, valid: rules[rule] ?? false };
  },
};

// Main autonomous agent endpoint
app.post("/api/autonomous", (req, res) => {
  const { input, session_id } = req.body;

  if (!input) {
    return res.status(400).json({ error: "Input required" });
  }

  // Simulate autonomous decision-making
  const decision = makeAutonomousDecision(input);

  res.json({
    input,
    session_id,
    decision: decision.action,
    reasoning: decision.reasoning,
    steps_executed: decision.steps,
    tools_called: decision.tools_used,
    final_output: decision.output,
    confidence: decision.confidence,
  });
});

function makeAutonomousDecision(input) {
  const lowerInput = input.toLowerCase();
  let steps = [];
  let toolsUsed = [];
  let output = "";
  let confidence = 0;

  // Decision 1: User lookup + notification
  if (lowerInput.includes("notify user") || lowerInput.includes("send message")) {
    steps.push("Identified: User notification task");
    steps.push("Analyzing: User identifier from input");

    const userId = extractNumber(input) || "123";
    const user = tools.search_db(`user:${userId}`);
    toolsUsed.push("search_db");

    steps.push(`Retrieved: User ${user.name || "Unknown"}`);

    const message = `Automated notification: Task completed successfully`;
    const result = tools.send_notification(userId, message);
    toolsUsed.push("send_notification");

    steps.push("Executed: Notification sent");
    output = `Successfully notified user ${userId} with message: "${message}"`;
    confidence = 92;
  }

  // Decision 2: Product pricing + discount calculation
  else if (lowerInput.includes("price") || lowerInput.includes("discount")) {
    steps.push("Identified: Pricing/discount query");

    const productId = lowerInput.includes("laptop") ? "001" : "002";
    const product = tools.search_db(`product:${productId}`);
    toolsUsed.push("search_db");

    steps.push(`Retrieved: ${product.name} ($${product.price})`);

    const discount = lowerInput.includes("50%") ? 50 : lowerInput.includes("20%") ? 20 : 10;
    const pricing = tools.calculate_discount(product.price, discount);
    toolsUsed.push("calculate_discount");

    steps.push(`Calculated: ${discount}% discount applied`);
    output = `Product: ${product.name}\nOriginal Price: $${pricing.original}\nDiscount: ${discount}%\nFinal Price: $${pricing.final_price.toFixed(2)}`;
    confidence = 88;
  }

  // Decision 3: Data validation
  else if (lowerInput.includes("validate") || lowerInput.includes("check")) {
    steps.push("Identified: Validation task");

    let validationType = "email";
    let valueToCheck = "user@example.com";

    if (lowerInput.includes("phone")) {
      validationType = "phone";
      valueToCheck = "1234567890";
    } else if (lowerInput.includes("password")) {
      validationType = "password";
      valueToCheck = "SecurePass123";
    } else if (lowerInput.includes("username")) {
      validationType = "username";
      valueToCheck = "john_doe";
    }

    const validation = tools.validate_input(valueToCheck, validationType);
    toolsUsed.push("validate_input");

    steps.push(`Validated: ${validationType} format`);
    output = `Validation Result:\nValue: ${validation.value}\nRule: ${validation.rule}\nValid: ${validation.valid ? "YES ✓" : "NO ✗"}`;
    confidence = 95;
  }

  // Decision 4: Report generation
  else if (lowerInput.includes("report") || lowerInput.includes("summary")) {
    steps.push("Identified: Report generation task");
    steps.push("Analyzing: Required data type and filters");

    const report = tools.generate_report("sales", { date_range: "last_30_days", status: "completed" });
    toolsUsed.push("generate_report");

    steps.push("Generated: Sales report");
    output = `Report Generated:\nReport ID: ${report.report_id}\nType: ${report.data_type}\nRecords: ${report.records}`;
    confidence = 85;
  }

  // Default: Provide autonomous response
  else {
    steps.push("Parsing: User request");
    steps.push("Decision: No specific tool required");
    steps.push("Generating: Autonomous response");
    output = `Autonomous agent received: "${input}". This appears to be a general query. Autonomous processing complete. Please clarify if you need: user notifications, pricing, validation, or reports.`;
    confidence = 70;
  }

  return {
    action: "autonomous_decision_execution",
    reasoning: `Autonomously analyzed input and made decisions without user intervention. Executed ${toolsUsed.length} tools across ${steps.length} steps.`,
    steps,
    tools_used: [...new Set(toolsUsed)],
    output,
    confidence,
  };
}

function extractNumber(str) {
  const match = str.match(/\d+/);
  return match ? match[0] : null;
}

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "healthy", agent: "autonomous" });
});

const PORT = 3003;
app.listen(PORT, () => {
  console.log(`🤖 Autonomous Agent running on http://localhost:${PORT}`);
  console.log(`📍 Endpoint: POST /api/autonomous`);
  console.log(`❤️  Health:  GET /health`);
});
