import type { z } from "zod";

/**
 * Minimal zod → JSON Schema converter.
 *
 * We only need the subset of JSON Schema that OpenAI's Structured Outputs
 * (`response_format: { type: "json_schema", strict: true }`) accepts:
 * objects with `additionalProperties: false`, every property listed in
 * `required`, arrays, enums and primitives. Keeping the converter local means
 * the runtime prompt schema and the validation schema can never drift apart.
 */

export type JsonSchema = Record<string, unknown>;

export function zodToJsonSchema(schema: z.ZodTypeAny): JsonSchema {
  const definition = (schema as unknown as { _def?: { typeName?: string } })._def;
  const typeName = definition?.typeName ?? "ZodUnknown";
  const def = definition as unknown as Record<string, unknown>;
  const description = typeof def.description === "string" ? def.description : undefined;

  /** ZodObject/ZodArray 等分支共用：把 .describe() 的内容带进 JSON Schema。 */
  const withDescription = (result: JsonSchema): JsonSchema =>
    description ? { ...result, description } : result;

  switch (typeName) {
    case "ZodObject": {
      const shapeFactory = def.shape as () => Record<string, z.ZodTypeAny>;
      const shape = shapeFactory();
      const properties: Record<string, JsonSchema> = {};
      const required: string[] = [];
      Object.entries(shape).forEach(([key, value]) => {
        properties[key] = zodToJsonSchema(value);
        required.push(key);
      });
      return withDescription({
        type: "object",
        properties,
        required,
        additionalProperties: false,
      });
    }
    case "ZodArray": {
      const inner = def.type as z.ZodTypeAny;
      return withDescription({ type: "array", items: zodToJsonSchema(inner) });
    }
    case "ZodString":
      return withDescription({ type: "string" });
    case "ZodNumber": {
      const checks = (def.checks as Array<{ kind: string; value?: number }> | undefined) ?? [];
      const result: JsonSchema = { type: "number" };
      checks.forEach((check) => {
        if (check.kind === "min" && typeof check.value === "number") result.minimum = check.value;
        if (check.kind === "max" && typeof check.value === "number") result.maximum = check.value;
        if (check.kind === "int") result.type = "integer";
      });
      return withDescription(result);
    }
    case "ZodBoolean":
      return withDescription({ type: "boolean" });
    case "ZodEnum":
      return withDescription({ type: "string", enum: def.values as string[] });
    case "ZodNativeEnum":
      return { type: "string", enum: Object.values(def.values as Record<string, string>) };
    case "ZodLiteral":
      return { enum: [def.value as string | number | boolean] };
    case "ZodUnion": {
      const options = (def.options as z.ZodTypeAny[]) ?? [];
      const literals = options
        .map((option) => {
          const optionDef = (option as unknown as { _def?: { typeName?: string; value?: unknown } })._def;
          return optionDef?.typeName === "ZodLiteral" ? optionDef.value : undefined;
        })
        .filter((value): value is string | number => value !== undefined);
      if (literals.length === options.length && literals.length > 0) {
        return { type: "string", enum: literals.map(String) };
      }
      return { anyOf: options.map((option) => zodToJsonSchema(option)) };
    }
    case "ZodOptional":
    case "ZodNullable":
    case "ZodDefault":
    case "ZodCatch":
    case "ZodReadonly": {
      const inner = (def.innerType ?? def.type) as z.ZodTypeAny;
      return inner ? zodToJsonSchema(inner) : { type: "string" };
    }
    case "ZodEffects": {
      const inner = def.schema as z.ZodTypeAny;
      return inner ? zodToJsonSchema(inner) : { type: "string" };
    }
    default:
      return { type: "string" };
  }
}

/**
 * JSON Schema keywords that OpenAI's Structured Outputs (strict mode) rejects.
 * The zod schema still enforces all of these constraints on the response — we
 * only strip them from the schema we send on the wire, because sending e.g.
 * `minimum`/`maximum` makes the provider answer 400
 * ("Invalid schema for response_format") and every agent would silently fall
 * back to the demo engine.
 */
const STRICT_UNSUPPORTED_KEYWORDS = new Set([
  "minimum",
  "maximum",
  "exclusiveMinimum",
  "exclusiveMaximum",
  "multipleOf",
  "minLength",
  "maxLength",
  "pattern",
  "format",
  "minItems",
  "maxItems",
  "uniqueItems",
  "contains",
  "minContains",
  "maxContains",
  "minProperties",
  "maxProperties",
  "propertyNames",
  "patternProperties",
  "dependencies",
  "dependentRequired",
  "dependentSchemas",
  "if",
  "then",
  "else",
  "not",
  "default",
  "examples",
  "$comment",
]);

/** Deep-clones the schema without the keywords strict mode cannot accept. */
export function stripUnsupportedForStrict(schema: JsonSchema): JsonSchema {
  if (Array.isArray(schema)) {
    return schema.map((item) => stripUnsupportedForStrict(item as JsonSchema)) as unknown as JsonSchema;
  }
  const result: JsonSchema = {};
  Object.entries(schema).forEach(([key, value]) => {
    if (STRICT_UNSUPPORTED_KEYWORDS.has(key)) return;
    if (value && typeof value === "object") {
      result[key] = stripUnsupportedForStrict(value as JsonSchema);
      return;
    }
    result[key] = value;
  });
  return result;
}

export function zodToStructuredOutputFormat(schema: z.ZodTypeAny, name: string) {
  return {
    type: "json_schema" as const,
    json_schema: {
      name,
      strict: true,
      schema: stripUnsupportedForStrict(zodToJsonSchema(schema)),
    },
  };
}

/**
 * Human readable schema text used when a provider does not support
 * `response_format: json_schema` and we degrade to `json_object` / plain JSON.
 *
 * The schema *name* is included on purpose: in json_object mode the provider no
 * longer sees `response_format.json_schema.name`, so the prompt is the only
 * place where the expected output contract can be stated.
 */
export function jsonSchemaPromptHint(schema: z.ZodTypeAny, schemaName?: string): string {
  return [
    "",
    // Some providers (e.g. DeepSeek JSON Output) require the literal word "json"
    // to appear in the prompt, otherwise they may return empty content.
    `输出契约名称：${schemaName ?? "mori_structured_output"}`,
    "输出格式要求：必须返回合法的 json（JSON）对象，严格遵守下面的 JSON Schema，",
    "只输出 json 本身，不要输出 Markdown 代码块、解释文字或任何前后缀：",
    "",
    "必填字段清单（**每一个字段都必须出现**；不允许省略任何 key；不允许用 null 代替；",
    "数组无内容时返回 []；数字字段必须是数字而不是字符串）：",
    ...requiredFieldChecklist(schema).map((line) => `- ${line}`),
    "",
    "完整 JSON Schema：",
    JSON.stringify(stripUnsupportedForStrict(zodToJsonSchema(schema)), null, 2),
  ].join("\n");
}

/**
 * Builds an explicit "every field must be present" checklist from the zod schema.
 *
 * Why this exists: in `json_object` / plain mode (DeepSeek does not support
 * strict `json_schema`) the model only sees a JSON Schema. Models frequently
 * drop the *last* nested string fields of a contract (e.g.
 * `scores.howToImprove`), which then fails zod validation and triggers the
 * demo fallback. An explicit flat checklist is what reliably prevents that —
 * deleting `required` or skipping validation is not an option.
 */
export function requiredFieldChecklist(schema: z.ZodTypeAny, maxLines = 160): string[] {
  const json = stripUnsupportedForStrict(zodToJsonSchema(schema));
  const lines: string[] = [];

  const describe = (node: JsonSchema | undefined) => {
    if (!node) return "";
    const parts: string[] = [];
    if (typeof node.description === "string" && node.description.length > 0) parts.push(node.description);
    if (Array.isArray(node.enum)) parts.push(`可选值：${(node.enum as string[]).join(" | ")}`);
    return parts.length > 0 ? ` — ${parts.join("；")}` : "";
  };

  const walkObject = (node: JsonSchema, path: string) => {
    const properties = node.properties as Record<string, JsonSchema> | undefined;
    if (!properties) return;
    Object.entries(properties).forEach(([key, child]) => {
      if (lines.length >= maxLines) return;
      const childPath = path ? `${path}.${key}` : key;
      if (child.type === "object") {
        lines.push(`${childPath}: object（必填对象，其下每个子字段都必须出现）${describe(child)}`);
        walkObject(child, childPath);
        return;
      }
      if (child.type === "array") {
        const items = (child.items ?? {}) as JsonSchema;
        if (items.type === "object" && items.properties) {
          const itemKeys = Object.keys(items.properties as Record<string, JsonSchema>);
          lines.push(
            `${childPath}: array（必填，可为 []；每个元素必须包含 ${itemKeys.join(", ")}）${describe(child)}`,
          );
          walkObject(items, `${childPath}[]`);
          return;
        }
        lines.push(`${childPath}: array<${String(items.type ?? "any")}>（必填，可为 []）${describe(child)}`);
        return;
      }
      lines.push(`${childPath}: ${String(child.type ?? "any")}（必填）${describe(child)}`);
    });
  };

  walkObject(json, "");
  return lines;
}
