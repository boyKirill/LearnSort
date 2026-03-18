import { prisma } from '../lib/prisma.js';

export async function getCompareAlgorithms() {
  const modules = await prisma.module.findMany({
    orderBy: { order: 'asc' },
    select: {
      slug: true,
      title: true,
      description: true,
    },
  });

  return modules;
}
