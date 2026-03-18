-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('EMAIL_CHANGE', 'PASSWORD_CHANGE');

-- CreateEnum
CREATE TYPE "ModuleProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "KnowledgeQuestionType" AS ENUM ('SINGLE_CHOICE', 'NEXT_STEP', 'COMPARED_ELEMENTS', 'PROPERTY', 'COMPLEXITY', 'PIVOT', 'SORTED_SEGMENT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailVerificationCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "VerificationType" NOT NULL,
    "codeHash" TEXT NOT NULL,
    "pendingEmail" TEXT,
    "pendingPasswordHash" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerificationCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Module" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "theory" TEXT NOT NULL,
    "pseudocode" TEXT NOT NULL,
    "complexity" JSONB NOT NULL,
    "propertiesJson" JSONB NOT NULL,
    "advantages" JSONB NOT NULL,
    "disadvantages" JSONB NOT NULL,
    "usageNotes" JSONB NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeCheck" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,

    CONSTRAINT "KnowledgeCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeQuestion" (
    "id" TEXT NOT NULL,
    "knowledgeCheckId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "type" "KnowledgeQuestionType" NOT NULL,

    CONSTRAINT "KnowledgeQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,

    CONSTRAINT "KnowledgeOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "knowledgeCheckId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "maxScore" INTEGER NOT NULL,
    "percent" INTEGER NOT NULL,
    "answersJson" JSONB,
    "resultsJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnowledgeAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "status" "ModuleProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "bestKnowledgeCheckPercent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModuleProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "EmailVerificationCode_userId_type_expiresAt_idx" ON "EmailVerificationCode"("userId", "type", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Module_slug_key" ON "Module"("slug");

-- CreateIndex
CREATE INDEX "Module_order_idx" ON "Module"("order");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeCheck_moduleId_key" ON "KnowledgeCheck"("moduleId");

-- CreateIndex
CREATE INDEX "KnowledgeQuestion_knowledgeCheckId_order_idx" ON "KnowledgeQuestion"("knowledgeCheckId", "order");

-- CreateIndex
CREATE INDEX "KnowledgeOption_questionId_idx" ON "KnowledgeOption"("questionId");

-- CreateIndex
CREATE INDEX "KnowledgeAttempt_userId_knowledgeCheckId_createdAt_idx" ON "KnowledgeAttempt"("userId", "knowledgeCheckId", "createdAt");

-- CreateIndex
CREATE INDEX "ModuleProgress_userId_status_idx" ON "ModuleProgress"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ModuleProgress_userId_moduleId_key" ON "ModuleProgress"("userId", "moduleId");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailVerificationCode" ADD CONSTRAINT "EmailVerificationCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeCheck" ADD CONSTRAINT "KnowledgeCheck_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeQuestion" ADD CONSTRAINT "KnowledgeQuestion_knowledgeCheckId_fkey" FOREIGN KEY ("knowledgeCheckId") REFERENCES "KnowledgeCheck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeOption" ADD CONSTRAINT "KnowledgeOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "KnowledgeQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeAttempt" ADD CONSTRAINT "KnowledgeAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeAttempt" ADD CONSTRAINT "KnowledgeAttempt_knowledgeCheckId_fkey" FOREIGN KEY ("knowledgeCheckId") REFERENCES "KnowledgeCheck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleProgress" ADD CONSTRAINT "ModuleProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleProgress" ADD CONSTRAINT "ModuleProgress_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;
