import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema:    './src/db/schema.ts',
  out:       './drizzle',          // migration files go here
  dialect:   'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
