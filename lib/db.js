// Almacenamiento simple en archivos JSON (sin dependencias).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const DATA_DIR = process.env.RADAR_DATA_DIR
  ? path.resolve(process.env.RADAR_DATA_DIR)
  : path.join(ROOT, 'data');

const stores = [];

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    if (e.code !== 'ENOENT') {
      const backup = `${file}.corrupto-${Date.now()}`;
      try { fs.copyFileSync(file, backup); } catch {}
      console.warn(`⚠️  No se pudo leer ${path.basename(file)} (copia guardada en ${path.basename(backup)}). Se parte de cero.`);
    }
    return structuredClone(fallback);
  }
}

export class Store {
  constructor(name, fallback) {
    this.file = path.join(DATA_DIR, name);
    this.data = readJson(this.file, fallback);
    this.timer = null;
    stores.push(this);
  }
  save() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(), 300);
  }
  flush() {
    clearTimeout(this.timer);
    this.timer = null;
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmp = `${this.file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(this.data, null, 2));
    fs.renameSync(tmp, this.file);
  }
}

export function flushAll() {
  for (const s of stores) {
    try { if (s.timer) s.flush(); } catch (e) { console.error('Error guardando', s.file, e.message); }
  }
}
