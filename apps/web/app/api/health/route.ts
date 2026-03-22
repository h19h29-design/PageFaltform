import { listDemoConsoleUsers } from "@ysplan/auth";
import { listFamilies } from "@ysplan/tenant";

export async function GET() {
  return Response.json({
    name: "YSplan",
    status: "ok",
    checkedAt: new Date().toISOString(),
    tenantFixtures: listFamilies().length,
    consoleFixtures: listDemoConsoleUsers().length,
    databaseConfigured: Boolean(process.env.DATABASE_URL)
  });
}
