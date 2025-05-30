import { z } from "zod";

const envSchema = z.object({
  PORT: z.string(),
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  DATABASE_URL: z.string(),
  RESEND_API_KEY: z.string(),
  VERIFY_ACCOUNT_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  RESET_PASSWORD_SECRET: z.string(),
  REDIRECT_GOOGLE_OAUTH_URL: z.string(),
  SUPABASE_URL: z.string(),
  SUPABASE_KEY: z.string(),
  RAJA_ONGKIR_API_KEY: z.string(),
  RAJA_ONGKIR_BASE_URL: z.string(),
  MIDTRANS_CLIENT_KEY: z.string(),
  MIDTRANS_SERVER_KEY: z.string(),
  MIDTRANS_URL: z.string(),
});

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}
