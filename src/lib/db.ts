import { neon } from '@neondatabase/serverless';

if (!import.meta.env.VITE_NEON_DATABASE_URL) {
    throw new Error('VITE_NEON_DATABASE_URL is not defined in environment variables');
}

export const sql = neon(import.meta.env.VITE_NEON_DATABASE_URL);
