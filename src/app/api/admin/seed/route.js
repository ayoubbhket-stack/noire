import { HttpError, requireAdminApi } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { handler, ok } from '@/lib/http';
import { getDb } from '@/db';
import { seedDatabase } from '@/lib/seed';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Owner-only: fill an empty store with the sample catalogue.
export const POST = handler(async () => {
  await requireAdminApi('settings.write');
  const db = await getDb();
  try {
    const r = await seedDatabase(db);
    revalidatePath('/', 'layout');
    if (r.skipped) throw new HttpError(409, `The store already has ${r.products} products.`);
    return ok({ ok: true, ...r });
  } catch (e) {
    if (e instanceof HttpError) throw e;
    console.error('seed failed', e);
    throw new HttpError(500, `Sample data failed: ${e.message}`);
  }
});
