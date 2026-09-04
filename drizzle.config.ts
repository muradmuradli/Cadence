import { defineConfig } from "drizzle-kit";

import { env } from "./lib/env";

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DB_URL,
  },
});
