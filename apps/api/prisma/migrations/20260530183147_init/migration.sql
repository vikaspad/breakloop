-- CreateEnum
CREATE TYPE "AgentType" AS ENUM ('CONVERSATIONAL', 'TOOL_USING', 'AUTONOMOUS', 'MULTI_AGENT', 'RAG_PIPELINE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ConnType" AS ENUM ('REST', 'CLAUDE_API', 'OPENAI', 'LANGCHAIN', 'WEBSOCKET', 'MOCK');

-- CreateEnum
CREATE TYPE "AuthType" AS ENUM ('BEARER', 'API_KEY', 'BASIC', 'NONE');

-- CreateEnum
CREATE TYPE "AgentStatus" AS ENUM ('PENDING', 'HEALTHY', 'WARN', 'FAIL');

-- CreateEnum
CREATE TYPE "RunStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETE', 'FAILED');

-- CreateEnum
CREATE TYPE "EvalStatus" AS ENUM ('PASS', 'WARN', 'FAIL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "AgentType" NOT NULL,
    "connType" "ConnType" NOT NULL,
    "endpoint" TEXT,
    "authType" "AuthType" NOT NULL DEFAULT 'BEARER',
    "authToken" TEXT,
    "inputSchema" JSONB,
    "outputSchema" JSONB,
    "evalCriteria" TEXT[],
    "systemPrompt" TEXT,
    "tags" TEXT[],
    "status" "AgentStatus" NOT NULL DEFAULT 'PENDING',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestSuite" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tags" TEXT[],
    "agentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestSuite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestCase" (
    "id" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "expectedOutput" TEXT,
    "behaviorTags" TEXT[],
    "passCriteria" TEXT,
    "suiteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Run" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "suiteId" TEXT NOT NULL,
    "status" "RunStatus" NOT NULL DEFAULT 'PENDING',
    "overallScore" INTEGER,
    "summary" JSONB,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseResult" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "status" "EvalStatus" NOT NULL,
    "agentOutput" TEXT NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "scores" JSONB NOT NULL,
    "failureTags" TEXT[],
    "evalReason" TEXT NOT NULL,
    "traceSteps" JSONB[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSuite" ADD CONSTRAINT "TestSuite_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_suiteId_fkey" FOREIGN KEY ("suiteId") REFERENCES "TestSuite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Run" ADD CONSTRAINT "Run_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Run" ADD CONSTRAINT "Run_suiteId_fkey" FOREIGN KEY ("suiteId") REFERENCES "TestSuite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseResult" ADD CONSTRAINT "CaseResult_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseResult" ADD CONSTRAINT "CaseResult_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "TestCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
