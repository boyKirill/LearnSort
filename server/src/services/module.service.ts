import { ModuleProgressStatus } from '@prisma/client';

import { prisma } from '../lib/prisma.js';
import { HttpError } from '../utils/http-error.js';
import { ensureModuleProgressRecords } from './module-progress.service.js';

function mapModuleWithProgress(
  moduleItem: {
    id: string;
    slug: string;
    title: string;
    description: string;
    order: number;
    knowledgeCheck: { id: string } | null;
    progress: Array<{
      status: ModuleProgressStatus;
      bestKnowledgeCheckPercent: number;
    }>;
  },
) {
  const progress = moduleItem.progress[0];

  return {
    id: moduleItem.id,
    slug: moduleItem.slug,
    title: moduleItem.title,
    description: moduleItem.description,
    order: moduleItem.order,
    knowledgeCheckId: moduleItem.knowledgeCheck?.id ?? null,
    progress: {
      status: progress?.status ?? ModuleProgressStatus.NOT_STARTED,
      bestKnowledgeCheckPercent: progress?.bestKnowledgeCheckPercent ?? 0,
    },
  };
}

export async function listModulesForUser(userId: string) {
  await ensureModuleProgressRecords(userId);

  const modules = await prisma.module.findMany({
    orderBy: { order: 'asc' },
    include: {
      knowledgeCheck: {
        select: { id: true },
      },
      progress: {
        where: { userId },
        select: {
          status: true,
          bestKnowledgeCheckPercent: true,
        },
      },
    },
  });

  return modules.map(mapModuleWithProgress);
}

export async function getModuleBySlugForUser(userId: string, slug: string) {
  await ensureModuleProgressRecords(userId);

  const moduleItem = await prisma.module.findUnique({
    where: { slug },
    include: {
      knowledgeCheck: {
        select: { id: true },
      },
      progress: {
        where: { userId },
        select: {
          status: true,
          bestKnowledgeCheckPercent: true,
        },
      },
    },
  });

  if (!moduleItem) {
    throw new HttpError(404, 'Модуль не найден.');
  }

  return {
    ...mapModuleWithProgress(moduleItem),
    theory: moduleItem.theory,
    pseudocode: moduleItem.pseudocode,
    complexity: moduleItem.complexity,
    properties: moduleItem.propertiesJson,
    advantages: moduleItem.advantages,
    disadvantages: moduleItem.disadvantages,
    usageNotes: moduleItem.usageNotes,
  };
}

export async function startModule(userId: string, slug: string) {
  const moduleItem = await prisma.module.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!moduleItem) {
    throw new HttpError(404, 'Модуль не найден.');
  }

  await prisma.moduleProgress.upsert({
    where: {
      userId_moduleId: {
        userId,
        moduleId: moduleItem.id,
      },
    },
    create: {
      userId,
      moduleId: moduleItem.id,
      status: ModuleProgressStatus.IN_PROGRESS,
      bestKnowledgeCheckPercent: 0,
    },
    update: {
      status: ModuleProgressStatus.IN_PROGRESS,
    },
  });

  return { success: true };
}

export async function completeModule(userId: string, slug: string) {
  const moduleItem = await prisma.module.findUnique({
    where: { slug },
    select: { id: true, title: true },
  });

  if (!moduleItem) {
    throw new HttpError(404, 'Модуль не найден.');
  }

  const progress = await prisma.moduleProgress.findUnique({
    where: {
      userId_moduleId: {
        userId,
        moduleId: moduleItem.id,
      },
    },
  });

  if (!progress || progress.bestKnowledgeCheckPercent < 100) {
    throw new HttpError(
      400,
      'Для завершения модуля необходимо набрать 100% в разделе «Проверка знаний».',
    );
  }

  await prisma.moduleProgress.update({
    where: { id: progress.id },
    data: {
      status: ModuleProgressStatus.COMPLETED,
    },
  });

  return {
    success: true,
    status: ModuleProgressStatus.COMPLETED,
    title: moduleItem.title,
  };
}
