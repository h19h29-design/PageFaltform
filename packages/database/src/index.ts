export { getPrismaClient } from "./client";
export {
  authSessionMigrationRequirements,
  dbCutoverChecklist,
  fileBackedMigrationTargets,
  nextWaveDbCutoverPlan,
} from "./auth-data-transition";
export {
  bootstrapAuthDataBaseline,
  importFileBackedAuthData,
  resolveDefaultFamilySiteStoreImportPath,
  seedDemoAuthData,
} from "./auth-data-bootstrap";
export {
  authDataServiceBoundaries,
  createAuthDataRepositories,
  createAuthDataWriteService,
  hashFamilySharedSecret,
} from "./auth-data-repositories";
export {
  createAuthRuntimeService,
} from "./auth-runtime-service";
export type {
  RuntimeFamilyGraphRecord,
  RuntimeManagedFamilyRecord,
  RuntimePlatformAuthUser,
} from "./auth-runtime-service";

export const prismaSchemaPath = "packages/database/prisma/schema.prisma";
