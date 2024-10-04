import { z } from "zod";

export function validate<T>(schema: z.ZodType, data: T): T {
  return schema.parse(data);
}
