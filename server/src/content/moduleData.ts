import { bubbleModule } from './modules/bubble.js';
import { insertionModule } from './modules/insertion.js';
import { mergeModule } from './modules/merge.js';
import { quickModule } from './modules/quick.js';
import { selectionModule } from './modules/selection.js';

export { type SeedModule, type SeedQuestion } from './modules/types.js';

export const seedModules = [
  bubbleModule,
  selectionModule,
  insertionModule,
  mergeModule,
  quickModule,
];

export const seedTestUser = {
  email: 'student@sortlearn.local',
  nickname: 'demo_student',
  password: 'SortLearn123!',
};
