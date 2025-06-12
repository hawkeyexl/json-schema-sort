export const DEFAULT_MAX_DEPTH = 10;

export const SCHEMA_TYPES = {
  JSON_SCHEMA: 'json-schema' as const,
  OPENAPI: 'openapi' as const,
  ASYNCAPI: 'asyncapi' as const,
  GENERIC: 'generic' as const
} as const;

export type SchemaType = typeof SCHEMA_TYPES[keyof typeof SCHEMA_TYPES];