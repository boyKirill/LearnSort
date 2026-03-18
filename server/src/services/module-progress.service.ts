import { ModuleProgressStatus } from '@prisma/client';

import { prisma } from '../lib/prisma.js';

export async function ensureModuleProgressRecords(userId: string) {
  const [modules, existingProgress] = await Promise.all([
    prisma.module.findMany({
      select: { id: true },
    }),
    prisma.moduleProgress.findMany({
      where: { userId },
      select: { moduleId: true },
    }),
  ]);

  const existingIds = new Set(existingProgress.map((item) => item.moduleId));
  const missing = modules
    .filter((moduleItem) => !existingIds.has(moduleItem.id))
    .map((moduleItem) => ({
      userId,
      moduleId: moduleItem.id,
      status: ModuleProgressStatus.NOT_STARTED,
      bestKnowledgeCheckPercent: 0,
    }));

  if (missing.length > 0) {
    await prisma.moduleProgress.createMany({
      data: missing,
      skipDuplicates: true,
    });
  }
}
