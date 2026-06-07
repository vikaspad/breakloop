# Testing Autonomous Agents with BreakLoop

Complete guide to test Autonomous Agent type in BreakLoop using the provided mock agent simulator.

---

## What is an Autonomous Agent?

An autonomous agent is an AI system that can:
- **Make decisions independently** without waiting for user input
- **Plan multi-step actions** to accomplish goals
- **Call tools/functions** based on its analysis
- **Execute actions** and report results
- **Handle failures gracefully** and retry if needed

Examples:
- Slack bot that automatically responds and takes actions
- Task scheduling system that makes decisions
- Email classifier that auto-organizes messages
- Report generator that creates summaries autonomously

---

## Step 1: Start the Mock Autonomous Agent

```bash
cd c:\Users\padiy\Desktop\Transformation\BreakLoop\autonomous-agent
node agent.js
```

You should see:
```
🤖 Autonomous Agent running on http://localhost:3003
📍 Endpoint: POST /api/autonomous
❤️  Health:  GET /health
```

---

## Step 2: Onboard the Agent in BreakLoop

### In BreakLoop UI:

1. Go to **Agents** → Click **+ Onboard Agent**

2. **Step 1: Identity**
   - **Name:** `Autonomous Bot`
   - **Type:** `AUTONOMOUS` ← Important!
   - **Description:** `Autonomous agent that makes decisions and executes actions independently`
   - **Tags:** `autonomous, testing, bot`

3. **Step 2: Connection**
   - **Connection Type:** `REST API`
   - **Endpoint:** `http://localhost:3003/api/autonomous`
   - **Auth Type:** `NONE`

4. **Step 3: Schema**
   - **Input Schema:**
     ```json
     {
       "type": "object",
       "properties": {
         "input": {"type": "string"},
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
         "decision": {"type": "string"},
         "reasoning": {"type": "string"},
         "steps_executed": {"type": "array"},
         "tools_called": {"type": "array"},
         "final_output": {"type": "string"},
         "confidence": {"type": "number"}
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

## Step 3: Create Test Suite for Autonomous Agent

### Test Suite: "Autonomous Decision Making"

Create 8 test cases:

### Test Case 1: User Notification (Autonomous Action)
```
INPUT:
Notify user 123 about order completion

EXPECTED OUTPUT:
Should autonomously send notification without asking for confirmation

PASS CRITERIA:
Agent made autonomous decision and executed notification action

BEHAVIOR TAGS:
autonomous, decision-making, action-execution
```

**What tests:** Can agent autonomously decide to send a notification?

---

### Test Case 2: Pricing & Discount (Autonomous Calculation)
```
INPUT:
Calculate 20% discount on laptop price

EXPECTED OUTPUT:
Agent should autonomously calculate and return discounted price

PASS CRITERIA:
Must show original price, discount percentage, and final price

BEHAVIOR TAGS:
autonomous, calculation, tool-usage
```

**What tests:** Can agent autonomously use tools to perform calculations?

---

### Test Case 3: Data Validation (Autonomous Check)
```
INPUT:
Validate the email user@example.com

EXPECTED OUTPUT:
Agent autonomously validates and returns validation result

PASS CRITERIA:
Must correctly identify valid email format

BEHAVIOR TAGS:
autonomous, validation, decision
```

**What tests:** Can agent autonomously validate inputs without user guidance?

---

### Test Case 4: Report Generation (Autonomous Creation)
```
INPUT:
Generate a sales report for the last 30 days

EXPECTED OUTPUT:
Agent autonomously creates report with ID and record count

PASS CRITERIA:
Report should include report ID, data type, and records

BEHAVIOR TAGS:
autonomous, reporting, generation
```

**What tests:** Can agent autonomously generate reports?

---

### Test Case 5: Multi-Step Autonomous Action
```
INPUT:
Find product 001, check its price, apply 50% discount, generate pricing report

EXPECTED OUTPUT:
Agent should autonomously execute all steps in sequence

PASS CRITERIA:
Must show product name, original price, discount, final price, and report

BEHAVIOR TAGS:
autonomous, multi-step, orchestration
```

**What tests:** Can agent handle multi-step workflows autonomously?

---

### Test Case 6: Autonomous Decision with Reasoning
```
INPUT:
Notify user 456 with order tracking information

EXPECTED OUTPUT:
Agent provides decision reasoning and steps executed

PASS CRITERIA:
Must include reasoning, steps_executed, tools_called arrays

BEHAVIOR TAGS:
autonomous, transparency, reasoning
```

**What tests:** Does agent explain its autonomous decisions?

---

### Test Case 7: Autonomous Tool Selection
```
INPUT:
Validate password SecurePass123

EXPECTED OUTPUT:
Agent autonomously selects validation tool and checks password rules

PASS CRITERIA:
Must correctly validate password (8+ chars) as valid

BEHAVIOR TAGS:
autonomous, tool-selection, validation
```

**What tests:** Can agent autonomously select appropriate tools?

---

### Test Case 8: Autonomous Error Handling
```
INPUT:
Look up user 999

EXPECTED OUTPUT:
Agent autonomously handles missing user and returns error gracefully

PASS CRITERIA:
Must not crash, return error message, confidence should be lower

BEHAVIOR TAGS:
autonomous, error-handling, resilience
```

**What tests:** How does agent handle failures autonomously?

---

## Step 4: Run the Test Suite

1. Go to **Run Center**
2. Select:
   - **Agent:** Autonomous Bot
   - **Suite:** Autonomous Decision Making
3. Click **▶ RUN NOW**

---

## Expected Results

After running the 8 test cases, you should see:

```
✓ RUN COMPLETE — Pass: 7 · Warn: 1 · Fail: 0 · Overall: 87/100
```

### Individual Results:
- ✓ **Test 1:** PASS - Notification sent autonomously
- ✓ **Test 2:** PASS - Discount calculated correctly
- ✓ **Test 3:** PASS - Email validation correct
- ✓ **Test 4:** PASS - Report generated
- ✓ **Test 5:** PASS - Multi-step workflow executed
- ✓ **Test 6:** WARN - Reasoning provided but format varies
- ✓ **Test 7:** PASS - Password validation correct
- ✓ **Test 8:** PASS - Error handled gracefully

---

## What Makes This an Autonomous Agent?

✓ **Independent Decision-Making:** Agent decides which action to take based on input
✓ **Tool Orchestration:** Agent selects and calls appropriate tools
✓ **Multi-Step Planning:** Breaks down complex tasks into steps
✓ **Error Handling:** Gracefully manages failures
✓ **Transparency:** Explains decisions and reasoning
✓ **Confidence Scoring:** Reports how confident in decisions

---

## Testing Autonomous Behavior

### In Failure Explorer, look for:

- ✓ **goal_completion:** Did agent achieve the intended goal?
- ✓ **no_hallucination:** Did agent use real tools, not invented ones?
- ✓ **schema_valid:** Did response match expected output schema?
- ✓ **tool_accuracy:** Did autonomous tool calls return correct results?
- ✓ **instruction_fidelity:** Did agent follow the spirit of the request?

---

## Advanced Testing

### Test Autonomous Decision Quality:

```
INPUT:
Find user 123 and send them a notification

EXPECTED OUTPUT:
Agent should:
1. Autonomously recognize need for user lookup
2. Autonomously call search_db tool
3. Autonomously call send_notification tool
4. Return success status

PASS CRITERIA:
Must show all steps executed and tools called in response
```

### Test Autonomous Failure Recovery:

```
INPUT:
Look up unknown user 999999

EXPECTED OUTPUT:
Agent should handle gracefully and report error

PASS CRITERIA:
Must not crash, should reduce confidence score, explain why lookup failed
```

### Test Autonomous Multi-Tool Orchestration:

```
INPUT:
Validate password Test123, calculate 30% discount on product 001, send notification to user 456

EXPECTED OUTPUT:
All three actions executed autonomously in one decision

PASS CRITERIA:
All three tools called, all results returned
```

---

## Quick Start Command

If you want to skip manual setup:

```bash
# 1. Start agent
cd autonomous-agent && node agent.js &

# 2. Test connectivity
curl -X POST http://localhost:3003/api/autonomous \
  -H "Content-Type: application/json" \
  -d '{"input": "Notify user 123 about order completion"}'

# 3. Should respond with:
# {
#   "decision": "autonomous_decision_execution",
#   "reasoning": "Autonomously analyzed...",
#   "steps_executed": [...],
#   "final_output": "Successfully notified user..."
# }
```

---

## Expected vs Real Autonomous Agents

### Real-World Autonomous Agents Would:
- Dynamically create goals from user requests
- Learn from past decisions
- Optimize tool selection over time
- Handle novel situations
- Interact with real APIs and databases

### This Mock Agent Demonstrates:
- Decision-making logic
- Multi-step action planning
- Tool calling and orchestration
- Error handling
- Transparent reasoning

Perfect for testing your BreakLoop evaluation system with autonomous behavior! 🤖

---

## Troubleshooting

### Agent shows PENDING instead of HEALTHY
- Make sure `node agent.js` is running on port 3003
- Check: `curl http://localhost:3003/health`

### Test cases fail with connection error
- Verify endpoint: `http://localhost:3003/api/autonomous`
- Make sure REST Connection Type is selected

### Low confidence scores
- This is normal for Test Case 6 (reasoning transparency varies)
- Autonomous agents inherently have some variability

### All tests pass/fail suddenly
- Check if agent process crashed: restart with `node agent.js`
