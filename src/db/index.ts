// src/db/index.ts
// Drizzle client — import `db` anywhere to run queries.

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)

export const db = drizzle(sql, { schema })
