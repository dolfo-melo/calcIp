import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { SubnetResult } from '../core/subnet';
import { IPv6Result } from '../core/ipv6';
import { VLSMEntry } from '../core/vlsm';

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  calculations: (SubnetResult | IPv6Result)[];
  vlsmResults: VLSMEntry[][];
}

interface SubnetDB extends DBSchema {
  history: {
    key: string;
    value: SubnetResult | IPv6Result;
    indexes: { timestamp: number };
  };
  projects: {
    key: string;
    value: Project;
    indexes: { updatedAt: number };
  };
}

let db: IDBPDatabase<SubnetDB> | null = null;

async function getDB(): Promise<IDBPDatabase<SubnetDB>> {
  if (db) return db;
  db = await openDB<SubnetDB>('subnetpro-v1', 1, {
    upgrade(database) {
      const historyStore = database.createObjectStore('history', { keyPath: 'id' });
      historyStore.createIndex('timestamp', 'timestamp');

      const projectStore = database.createObjectStore('projects', { keyPath: 'id' });
      projectStore.createIndex('updatedAt', 'updatedAt');
    },
  });
  return db;
}

// ─── History ──────────────────────────────────────────────────────────────────

export async function saveToHistory(result: SubnetResult | IPv6Result): Promise<void> {
  const database = await getDB();
  await database.put('history', result);

  // Keep only last 100 entries
  const all = await database.getAllFromIndex('history', 'timestamp');
  if (all.length > 100) {
    const toDelete = all.slice(0, all.length - 100);
    const tx = database.transaction('history', 'readwrite');
    await Promise.all(toDelete.map((entry) => tx.store.delete(entry.id)));
    await tx.done;
  }
}

export async function getHistory(): Promise<(SubnetResult | IPv6Result)[]> {
  const database = await getDB();
  const all = await database.getAllFromIndex('history', 'timestamp');
  return all.reverse();
}

export async function clearHistory(): Promise<void> {
  const database = await getDB();
  await database.clear('history');
}

export async function deleteHistoryEntry(id: string): Promise<void> {
  const database = await getDB();
  await database.delete('history', id);
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export async function saveProject(project: Project): Promise<void> {
  const database = await getDB();
  await database.put('projects', { ...project, updatedAt: Date.now() });
}

export async function getProjects(): Promise<Project[]> {
  const database = await getDB();
  const all = await database.getAllFromIndex('projects', 'updatedAt');
  return all.reverse();
}

export async function getProject(id: string): Promise<Project | undefined> {
  const database = await getDB();
  return database.get('projects', id);
}

export async function deleteProject(id: string): Promise<void> {
  const database = await getDB();
  await database.delete('projects', id);
}

export function createNewProject(name: string, description = ''): Project {
  return {
    id: crypto.randomUUID(),
    name,
    description,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    calculations: [],
    vlsmResults: [],
  };
}
