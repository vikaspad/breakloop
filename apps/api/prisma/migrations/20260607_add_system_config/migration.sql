-- CreateTable SystemConfig
CREATE TABLE "SystemConfig" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "jwtSecret" TEXT NOT NULL,
    "encryptionKey" TEXT NOT NULL,
    "isSetupComplete" BOOLEAN NOT NULL DEFAULT false,
    "setupCompletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);
