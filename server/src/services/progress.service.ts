import { ModuleProgressStatus } from '@prisma/client';

import { listModulesForUser } from './module.service.js';

export async function getProgressOverview(userId: string) {
  const modules = await listModulesForUser(userId);
  const completedCount = modules.filter(
    (moduleItem) => moduleItem.progress.status === ModuleProgressStatus.COMPLETED,
  ).length;

  const overallPercent = Math.round((completedCount / Math.max(modules.length, 1)) * 100);
  const bestKnowledgePercent = Math.max(
    ...modules.map((moduleItem) => moduleItem.progress.bestKnowledgeCheckPercent),
  );

  return {
    overallPercent,
    completedCount,
    totalModules: modules.length,
    bestKnowledgePercent,
    modules,
  };
}
