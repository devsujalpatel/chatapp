import type { ZodObject, ZodRawShape } from "zod";
import { z } from "zod";

interface EnvOptions {
  source?: NodeJS.ProcessEnv;
  serviceName?: string;
}

type SchemaOutput<TSchema extends ZodRawShape> = z.output<ZodObject<TSchema>>;

export const createEnv = <TSchema extends ZodRawShape>(
  schema: ZodObject<TSchema>,
  options: EnvOptions = {},
): SchemaOutput<TSchema> => {
  const { source = process.env, serviceName = "service" } = options;
  const parsed = schema.safeParse(source);
  if (!parsed.success) {
    const formatedErrors = z.treeifyError(parsed.error);
    throw new Error(
      `[${serviceName}] Environment variable validation failed: ${JSON.stringify(formatedErrors)}`,
    );
  }
  return parsed.data;
};

export type EnvSchema<TShape extends ZodRawShape> = ZodObject<TShape>;
