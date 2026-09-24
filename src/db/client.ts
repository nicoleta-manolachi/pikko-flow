import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';

// enableChangeListener powers useLiveQuery (UI updates automatically on writes)
export const expoDb = openDatabaseSync('grocery.db', { enableChangeListener: true });
expoDb.execSync('PRAGMA foreign_keys = ON;');
export const db = drizzle(expoDb, { schema });
