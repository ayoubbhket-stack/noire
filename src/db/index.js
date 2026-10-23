// Database client. Uses real PostgreSQL when DATABASE_URL is a postgres:// URL
// (production), or an embedded PGlite Postgres in ./data/pglite for local dev.
// On first connection to an empty database the tables are created
// automatically from ./drizzle, so no command has to be run by hand.
import fs from 'node:fs';
import path from 'node:path';
import * as schema from './schema.js';

const g = globalThis;

async function ensureSchema(run) {
  const res = await run("select to_regclass('public.products') as t");
  const rows = res.rows || res;
  if (rows?.[0]?.t) return;
  const dir = path.join(process.cwd(), 'drizzle');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const f of files) {
    const statements = fs.readFileSync(path.join(dir, f), 'utf8').split('--> statement-breakpoint').map((x) => x.trim()).filter(Boolean);
    for (const st of statements) await run(st);
  }
}

async function create() {
  // tolerate values pasted with quotes or spaces around them
  let url = (process.env.DATABASE_URL || '').trim().replace(/^["']|["']$/g, '').trim();
  url = url.replace(/[&?]channel_binding=require/, '');
  if (!url.startsWith('postgres') && (process.env.VERCEL || (process.env.NODE_ENV === 'production' && process.env.REQUIRE_DATABASE_URL))) {
    throw new Error('DATABASE_URL is missing or invalid. Set it to your PostgreSQL connection string (postgres://… or postgresql://…) in the hosting environment variables.');
  }
  if (url.startsWith('postgres')) {
    const { drizzle } = await import('drizzle-orm/node-postgres');
    const pg = (await import('pg')).default;
    const pool = new pg.Pool({ connectionString: url, max: Number(process.env.DB_POOL_MAX || 5),
      ssl: process.env.DATABASE_SSL === 'false' ? false : (/sslmode=(require|verify)/.test(url) || url.includes('neon.tech') ? { rejectUnauthorized: false } : undefined) });
    await ensureSchema((q) => pool.query(q));
    return drizzle(pool, { schema });
  }
  const { PGlite } = await import('@electric-sql/pglite');
  const { drizzle } = await import('drizzle-orm/pglite');
  const dir = process.env.PGLITE_DIR || './data/pglite';
  fs.mkdirSync(path.dirname(dir), { recursive: true });
  const client = new PGlite(dir);
  await client.waitReady;
  await ensureSchema((q) => client.exec(q).then((r) => r[r.length - 1]));
  return drizzle(client, { schema });
}

export function getDb() {
  if (!g.__noireDb) g.__noireDb = create().catch((e) => { g.__noireDb = null; throw e; });
  return g.__noireDb;
}
export { schema };
