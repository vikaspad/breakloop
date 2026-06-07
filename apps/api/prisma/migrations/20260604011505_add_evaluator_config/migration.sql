-- CreateTable
CREATE TABLE "EvaluatorConfig" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "evaluatorType" TEXT NOT NULL DEFAULT 'BUILTIN',
    "model" TEXT NOT NULL DEFAULT 'gpt-4o-mini',
    "apiKey" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvaluatorConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EvaluatorConfig_userId_key" ON "EvaluatorConfig"("userId");

-- AddForeignKey
ALTER TABLE "EvaluatorConfig" ADD CONSTRAINT "EvaluatorConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
