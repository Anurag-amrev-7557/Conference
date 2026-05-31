import { restoreRegistrationCms } from '../test/restoreRegistrationCms';
import prisma from '../lib/prisma';

async function main() {
  const ok = await restoreRegistrationCms();
  if (ok) {
    console.log('[✅] Registration form CMS copy restored to defaults.');
  } else {
    console.log('[⚠️] No site content row found. Run: npm run seed');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
