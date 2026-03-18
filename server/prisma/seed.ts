import bcrypt from 'bcryptjs';

import { PrismaClient, ModuleProgressStatus } from '@prisma/client';

import { seedModules, seedTestUser } from '../src/content/moduleData.js';
import { env } from '../src/config/env.js';

const prisma = new PrismaClient();

async function upsertModules() {
  for (const [index, moduleItem] of seedModules.entries()) {
    const upsertedModule = await prisma.module.upsert({
      where: { slug: moduleItem.slug },
      update: {
        title: moduleItem.title,
        description: moduleItem.description,
        theory: moduleItem.theory,
        pseudocode: moduleItem.pseudocode,
        complexity: moduleItem.complexity,
        propertiesJson: moduleItem.propertiesJson,
        advantages: moduleItem.advantages,
        disadvantages: moduleItem.disadvantages,
        usageNotes: moduleItem.usageNotes,
        order: index + 1,
      },
      create: {
        slug: moduleItem.slug,
        title: moduleItem.title,
        description: moduleItem.description,
        theory: moduleItem.theory,
        pseudocode: moduleItem.pseudocode,
        complexity: moduleItem.complexity,
        propertiesJson: moduleItem.propertiesJson,
        advantages: moduleItem.advantages,
        disadvantages: moduleItem.disadvantages,
        usageNotes: moduleItem.usageNotes,
        order: index + 1,
      },
    });

    await prisma.knowledgeCheck.deleteMany({
      where: {
        moduleId: upsertedModule.id,
      },
    });

    await prisma.knowledgeCheck.create({
      data: {
        moduleId: upsertedModule.id,
        questions: {
          create: moduleItem.questions.map((question, questionIndex) => ({
            text: question.text,
            explanation: question.explanation,
            order: questionIndex + 1,
            type: question.type,
            options: {
              create: question.options.map((option) => ({
                text: option.text,
                isCorrect: option.isCorrect,
              })),
            },
          })),
        },
      },
    });
  }
}

async function upsertTestUser() {
  const passwordHash = await bcrypt.hash(seedTestUser.password, env.BCRYPT_SALT_ROUNDS);

  const user = await prisma.user.upsert({
    where: {
      email: seedTestUser.email,
    },
    update: {
      nickname: seedTestUser.nickname,
      passwordHash,
      isEmailVerified: true,
    },
    create: {
      email: seedTestUser.email,
      nickname: seedTestUser.nickname,
      passwordHash,
      isEmailVerified: true,
    },
  });

  const modules = await prisma.module.findMany({
    select: { id: true },
  });

  await prisma.moduleProgress.createMany({
    data: modules.map((moduleItem) => ({
      userId: user.id,
      moduleId: moduleItem.id,
      status: ModuleProgressStatus.NOT_STARTED,
      bestKnowledgeCheckPercent: 0,
    })),
    skipDuplicates: true,
  });
}

async function main() {
  await upsertModules();
  await upsertTestUser();

  console.info('Seed успешно выполнен.');
}

main()
  .catch((error) => {
    console.error('Seed завершился с ошибкой:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
