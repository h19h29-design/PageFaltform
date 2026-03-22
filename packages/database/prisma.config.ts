import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { config as loadEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";

const currentDirectory = dirname(fileURLToPath(import.meta.url));

loadEnv({ path: resolve(currentDirectory, "../../.env") });
loadEnv({ path: resolve(currentDirectory, ".env"), override: false });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations"
  },
  datasource: {
    url: env("DATABASE_URL")
  }
});
