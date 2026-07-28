import { z } from "zod";

// Fail fast and loud if config is missing — this is the single place
// that decides whether the process is even allowed to start.
const EnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  API_TOKEN: z.string().min(16, "API_TOKEN must be at least 16 characters"),
  WEB_ORIGIN: z.string().url(),
  PORT: z.coerce.number().default(3000),
  S3_ENDPOINT: z.string().url(),
  S3_REGION: z.string().default("auto"),
  S3_BUCKET: z.string().min(1),
  S3_ACCESS_KEY_ID: z.string().min(1),
  S3_SECRET_ACCESS_KEY: z.string().min(1),
  S3_PUBLIC_BASE_URL: z.string().url().optional().or(z.literal("")),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
