import {
  bootstrapAuthDataBaseline,
  importFileBackedAuthData,
  seedDemoAuthData,
} from "./auth-data-bootstrap";

async function main(): Promise<void> {
  const [, , command = "bootstrap", filePath] = process.argv;

  if (command === "seed-demo") {
    const report = await seedDemoAuthData();
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  if (command === "import-file-store") {
    const report = await importFileBackedAuthData({
      ...(filePath ? { filePath } : {}),
    });
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  if (command === "bootstrap") {
    const report = await bootstrapAuthDataBaseline({
      ...(filePath ? { filePath } : {}),
    });
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  throw new Error(
    `Unknown auth-data command "${command}". Use "seed-demo", "import-file-store", or "bootstrap".`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
