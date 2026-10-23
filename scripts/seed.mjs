// Loads the sample catalogue (fictional placeholder brands), collections,
// imagery and default content. Refuses to run on a database that already has
// products unless you pass --force (which wipes catalogue and order data).
// The site also creates its tables on first run, and /admin/setup can load the
// same sample data, so this script is optional.
import { connect } from './db.mjs';
import { seedDatabase } from '../src/lib/seed.js';

const { db, close } = await connect();
const r = await seedDatabase(db, { force: process.argv.includes('--force') });
console.log(r.skipped ? `Database already has ${r.products} products. Run with --force to wipe catalogue data and reseed.` : `✓ Seeded ${r.products} products and ${r.collections} collections.`);
await close();
