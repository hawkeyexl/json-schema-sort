export interface JsonSchema {
    $schema?: string;
    type?: string | string[];
    properties?: Record<string, JsonSchema>;
    items?: JsonSchema | JsonSchema[];
    additionalProperties?: boolean | JsonSchema;
    required?: string[];
    $ref?: string;
    anyOf?: JsonSchema[];
    oneOf?: JsonSchema[];
    allOf?: JsonSchema[];
    definitions?: Record<string, JsonSchema>;
    [key: string]: unknown;
}
export interface OpenApiSchema extends JsonSchema {
    openapi: string;
    components?: {
        schemas?: Record<string, JsonSchema>;
    };
}
export interface AsyncApiSchema extends JsonSchema {
    asyncapi: string;
    components?: {
        schemas?: Record<string, JsonSchema>;
    };
}
export type AnySchema = JsonSchema | OpenApiSchema | AsyncApiSchema;
export interface SortOptions {
    maxDepth?: number;
    schemaPointer?: string;
}
export interface SortBySchemaParams {
    object: unknown;
    schema: AnySchema;
    options?: SortOptions;
}
export interface MergedSchemaProperties {
    properties: Record<string, JsonSchema>;
    propertyOrder: string[];
}
//# sourceMappingURL=types.d.ts.map