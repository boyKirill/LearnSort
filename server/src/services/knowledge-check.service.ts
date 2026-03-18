import { ModuleProgressStatus } from '@prisma/client';

import { prisma } from '../lib/prisma.js';
import { HttpError } from '../utils/http-error.js';
import { ensureModuleProgressRecords } from './module-progress.service.js';

function shuffle<T>(items: T[]) {
  const nextItems = [...items];

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [nextItems[index], nextItems[randomIndex]] = [nextItems[randomIndex], nextItems[index]];
  }

  return nextItems;
}

export async function getKnowledgeCheckByModuleSlug(userId: string, slug: string) {
  await ensureModuleProgressRecords(userId);

  const moduleItem = await prisma.module.findUnique({
    where: { slug },
    include: {
      knowledgeCheck: {
        include: {
          questions: {
            orderBy: { order: 'asc' },
            include: {
              options: {
                orderBy: { id: 'asc' },
                select: {
                  id: true,
                  text: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!moduleItem || !moduleItem.knowledgeCheck) {
    throw new HttpError(404, 'Проверка знаний для модуля не найдена.');
  }

  return {
    id: moduleItem.knowledgeCheck.id,
    moduleSlug: moduleItem.slug,
    moduleTitle: moduleItem.title,
    questions: moduleItem.knowledgeCheck.questions.map((question) => ({
      id: question.id,
      text: question.text,
      type: question.type,
      order: question.order,
      options: shuffle(question.options),
    })),
  };
}

export async function submitKnowledgeAttempt(
  userId: string,
  knowledgeCheckId: string,
  answers: Array<{ questionId: string; optionId: string }>,
) {
  const knowledgeCheck = await prisma.knowledgeCheck.findUnique({
    where: { id: knowledgeCheckId },
    include: {
      module: true,
      questions: {
        orderBy: { order: 'asc' },
        include: {
          options: {
            orderBy: { id: 'asc' },
          },
        },
      },
    },
  });

  if (!knowledgeCheck) {
    throw new HttpError(404, 'Проверка знаний не найдена.');
  }

  if (answers.length !== knowledgeCheck.questions.length) {
    throw new HttpError(400, 'Необходимо ответить на все вопросы.');
  }

  const answersMap = new Map(answers.map((answer) => [answer.questionId, answer.optionId]));

  if (answersMap.size !== knowledgeCheck.questions.length) {
    throw new HttpError(400, 'Ответы содержат повторяющиеся вопросы.');
  }

  let score = 0;

  const results = knowledgeCheck.questions.map((question) => {
    const selectedOptionId = answersMap.get(question.id) ?? null;
    const correctOption = question.options.find((option) => option.isCorrect);
    const selectedOption =
      question.options.find((option) => option.id === selectedOptionId) ?? null;
    const isCorrect = Boolean(correctOption && selectedOption && correctOption.id === selectedOption.id);

    if (isCorrect) {
      score += 1;
    }

    return {
      questionId: question.id,
      question: question.text,
      explanation: question.explanation,
      selectedOptionId,
      selectedOptionText: selectedOption?.text ?? null,
      correctOptionId: correctOption?.id ?? null,
      correctOptionText: correctOption?.text ?? null,
      isCorrect,
      options: question.options.map((option) => ({
        id: option.id,
        text: option.text,
      })),
    };
  });

  const maxScore = knowledgeCheck.questions.length;
  const percent = Math.round((score / maxScore) * 100);

  const attempt = await prisma.$transaction(async (tx) => {
    const createdAttempt = await tx.knowledgeAttempt.create({
      data: {
        userId,
        knowledgeCheckId,
        score,
        maxScore,
        percent,
        answersJson: answers,
        resultsJson: results,
      },
    });

    const currentProgress = await tx.moduleProgress.findUnique({
      where: {
        userId_moduleId: {
          userId,
          moduleId: knowledgeCheck.moduleId,
        },
      },
    });

    const bestKnowledgeCheckPercent = Math.max(currentProgress?.bestKnowledgeCheckPercent ?? 0, percent);

    await tx.moduleProgress.upsert({
      where: {
        userId_moduleId: {
          userId,
          moduleId: knowledgeCheck.moduleId,
        },
      },
      create: {
        userId,
        moduleId: knowledgeCheck.moduleId,
        bestKnowledgeCheckPercent,
        status: percent === 100 ? ModuleProgressStatus.COMPLETED : ModuleProgressStatus.IN_PROGRESS,
      },
      update: {
        bestKnowledgeCheckPercent,
        status:
          percent === 100
            ? ModuleProgressStatus.COMPLETED
            : currentProgress?.status === ModuleProgressStatus.COMPLETED
              ? ModuleProgressStatus.COMPLETED
              : ModuleProgressStatus.IN_PROGRESS,
      },
    });

    return createdAttempt;
  });

  return {
    id: attempt.id,
    score,
    maxScore,
    percent,
    moduleSlug: knowledgeCheck.module.slug,
    moduleTitle: knowledgeCheck.module.title,
    moduleCompleted: percent === 100,
    results,
  };
}
