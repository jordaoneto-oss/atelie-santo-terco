import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, existsSync, readdirSync, copyFileSync, unlinkSync, statSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbDir = existsSync('/data') ? '/data' : join(__dirname, '..', 'data');
const backupDir = join(dbDir, 'backups');
const dbPath = join(dbDir, '3dprint.db');

if (!existsSync(backupDir)) mkdirSync(backupDir, { recursive: true });

function rotateBackups() {
  const files = readdirSync(backupDir)
    .filter(f => f.startsWith('3dprint-') && f.endsWith('.db'))
    .map(f => ({ name: f, path: join(backupDir, f), time: f.replace('3dprint-', '').replace('.db', '') }))
    .sort((a, b) => b.time.localeCompare(a.time));

  while (files.length > 7) {
    const old = files.pop();
    unlinkSync(old.path);
    console.log('[BACKUP] Removido backup antigo:', old.name);
  }
}

export function createBackup() {
  if (!existsSync(dbPath)) return null;

  const date = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupFile = join(backupDir, `3dprint-${date}.db`);
  copyFileSync(dbPath, backupFile);
  console.log('[BACKUP] Criado:', backupFile);
  rotateBackups();
  return backupFile;
}

export function listBackups() {
  if (!existsSync(backupDir)) return [];
  return readdirSync(backupDir)
    .filter(f => f.endsWith('.db'))
    .map(f => ({
      name: f,
      path: join(backupDir, f),
      date: f.replace('3dprint-', '').replace('.db', '').replace(/-/g, ':').replace('T', ' ').slice(0, 19),
      size: `${(statSync(join(backupDir, f)).size / 1024).toFixed(1)} KB`,
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

// Auto-backup on startup
createBackup();

// Scheduled backup every 6 hours
setInterval(createBackup, 6 * 60 * 60 * 1000);
