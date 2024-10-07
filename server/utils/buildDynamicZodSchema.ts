import { z, ZodTypeAny } from "zod";

// Utility function to build dynamic Zod schema based on JSON keys
export const buildDynamicZodSchema = (content: any): ZodTypeAny => {
  if (typeof content === "string") {
    return z.string();
  } else if (typeof content === "number") {
    return z.number();
  } else if (typeof content === "boolean") {
    return z.boolean();
  } else if (Array.isArray(content)) {
    if (content.length === 0) {
      return z.array(z.any());
    }
    return z.array(buildDynamicZodSchema(content[0]));
  } else if (typeof content === "object" && content !== null) {
    const shape: Record<string, ZodTypeAny> = {};
    for (const key in content) {
      shape[key] = buildDynamicZodSchema(content[key]);
    }
    return z.object(shape);
  } else {
    return z.any();
  }
};
