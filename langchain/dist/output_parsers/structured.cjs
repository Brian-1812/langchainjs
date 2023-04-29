"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructuredOutputParser = void 0;
const zod_1 = require("zod");
const output_parser_js_1 = require("../schema/output_parser.cjs");
function printSchema(schema, depth = 0) {
    if (schema._def.typeName === "ZodString" &&
        schema._def.checks.some((check) => check.kind === "datetime")) {
        return "datetime";
    }
    if (schema._def.typeName === "ZodString") {
        return "string";
    }
    if (schema._def.typeName === "ZodNumber") {
        return "number";
    }
    if (schema._def.typeName === "ZodBoolean") {
        return "boolean";
    }
    if (schema._def.typeName === "ZodDate") {
        return "date";
    }
    if (schema._def.typeName === "ZodEnum") {
        return schema.options
            .map((value) => `"${value}"`)
            .join(" | ");
    }
    if (schema._def.typeName === "ZodNativeEnum") {
        return zod_1.util
            .getValidEnumValues(schema._def.values)
            .map((value) => `"${value}"`)
            .join(" | ");
    }
    if (schema._def.typeName === "ZodNullable") {
        return `${printSchema(schema._def.innerType, depth)} // Nullable`;
    }
    if (schema._def.typeName === "ZodTransformer") {
        return `${printSchema(schema._def.schema, depth)}`;
    }
    if (schema._def.typeName === "ZodOptional") {
        return `${printSchema(schema._def.innerType, depth)} // Optional`;
    }
    if (schema._def.typeName === "ZodArray") {
        return `${printSchema(schema._def.type, depth)}[]`;
    }
    if (schema._def.typeName === "ZodObject") {
        const indent = "\t".repeat(depth);
        const indentIn = "\t".repeat(depth + 1);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { shape } = schema;
        return `{${schema._def.description ? ` // ${schema._def.description}` : ""}
${Object.entries(shape)
            .map(([key, value]) => `${indentIn}"${key}": ${printSchema(value, depth + 1)}${value._def.description
            ? ` // ${value._def.description}`
            : ""}`)
            .join("\n")}
${indent}}`;
    }
    throw new Error(`Unsupported type: ${schema._def.typeName}`);
}
class StructuredOutputParser extends output_parser_js_1.BaseOutputParser {
    constructor(schema) {
        super();
        Object.defineProperty(this, "schema", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: schema
        });
    }
    static fromZodSchema(schema) {
        return new this(schema);
    }
    static fromNamesAndDescriptions(schemas) {
        const zodSchema = zod_1.z.object(Object.fromEntries(Object.entries(schemas).map(([name, description]) => [name, zod_1.z.string().describe(description)])));
        return new this(zodSchema);
    }
    getFormatInstructions() {
        return `The output should be a markdown code snippet formatted in the following schema:

\`\`\`json
${printSchema(this.schema)}
\`\`\`

Including the leading and trailing "\`\`\`json" and "\`\`\`"
`;
    }
    async parse(text) {
        try {
            const json = text.trim().split("```json")[1].split("```")[0].trim();
            return this.schema.parseAsync(JSON.parse(json));
        }
        catch (e) {
            throw new output_parser_js_1.OutputParserException(`Failed to parse. Text: "${text}". Error: ${e}`);
        }
    }
}
exports.StructuredOutputParser = StructuredOutputParser;
