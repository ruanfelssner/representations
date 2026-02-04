import { createError } from 'h3'
import type { ZodError, ZodTypeAny } from 'zod'

function firstIssueMessage(error: ZodError) {
  return error.issues[0]?.message || 'Payload inválido.'
}

export function parseWithZod<TSchema extends ZodTypeAny>(
  schema: TSchema,
  input: unknown,
  opts?: { statusCode?: number }
): ReturnType<TSchema['parse']> {
  const parsed = schema.safeParse(input)
  if (!parsed.success) {
    throw createError({
      statusCode: opts?.statusCode ?? 400,
      statusMessage: firstIssueMessage(parsed.error),
      data: { issues: parsed.error.issues },
    })
  }
  return parsed.data
}

