import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(10, 'Пароль должен содержать минимум 10 символов.')
  .max(100)
  .regex(/[A-Z]/, 'Пароль должен содержать хотя бы одну заглавную букву.')
  .regex(/[a-z]/, 'Пароль должен содержать хотя бы одну строчную букву.')
  .regex(/\d/, 'Пароль должен содержать хотя бы одну цифру.')
  .regex(/[^A-Za-z0-9]/, 'Пароль должен содержать хотя бы один специальный символ.');

export const registerSchema = z
  .object({
    email: z.string().email(),
    nickname: z.string().trim().min(3).max(32),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Пароли не совпадают.',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const slugSchema = z.object({
  slug: z.string().trim().min(1),
});

export const knowledgeAttemptSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        optionId: z.string().min(1),
      }),
    )
    .min(1),
});

export const knowledgeCheckIdSchema = z.object({
  knowledgeCheckId: z.string().min(1),
});

export const nicknameSchema = z.object({
  nickname: z.string().trim().min(3).max(32),
});

export const emailChangeRequestSchema = z.object({
  newEmail: z.string().email(),
});

export const codeConfirmSchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/),
});

export const passwordChangeRequestSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: 'Пароли не совпадают.',
    path: ['confirmPassword'],
  });
