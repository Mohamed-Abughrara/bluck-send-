/**
 * db.js — JSON file database layer
 *
 * MVP LIMITATION NOTES (intentional for this phase):
 *  - No real transactions: if the process crashes mid-write, data may be lost.
 *  - Write queue below prevents concurrent write corruption in a single Node process,
 *    but would NOT work across multiple Node instances / workers.
 *  - No indexing: all lookups are O(n) array scans. Fine for <10k records; swap for
 *    a real DB (Postgres, SQLite, MongoDB) when throughput grows.
 *  - No schema validation at the DB layer (validation lives in express-validator middleware).
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, '../data/db.json');

// ─── Write queue (simple in-memory mutex) ────────────────────────────────────
// Prevents concurrent writes from racing each other and corrupting the JSON file.
let writeQueue = Promise.resolve();

function enqueueWrite(fn) {
  writeQueue = writeQueue.then(fn).catch((err) => {
    console.error('[DB] Write queue error:', err);
  });
  return writeQueue;
}

// ─── Core read/write ─────────────────────────────────────────────────────────

function readDB() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[DB] Failed to read db.json:', err);
    throw new Error('Database read error');
  }
}

function writeDB(data) {
  return enqueueWrite(() => {
    return new Promise((resolve, reject) => {
      const json = JSON.stringify(data, null, 2);
      fs.writeFile(DB_PATH, json, 'utf-8', (err) => {
        if (err) {
          console.error('[DB] Failed to write db.json:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });
}

// ─── Generic collection helpers ──────────────────────────────────────────────

function getCollection(name) {
  const db = readDB();
  if (!db[name]) throw new Error(`Collection "${name}" does not exist`);
  return db[name];
}

async function insert(name, record) {
  const now = new Date().toISOString();
  const newRecord = {
    id: uuidv4(),
    created_at: now,
    updated_at: now,
    ...record,
  };
  await enqueueWrite(() => {
    const db = readDB();
    db[name].push(newRecord);
    return new Promise((resolve, reject) => {
      fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf-8', (err) => {
        if (err) reject(err); else resolve();
      });
    });
  });
  return newRecord;
}

async function update(name, id, updates) {
  let updatedRecord = null;
  await enqueueWrite(() => {
    const db = readDB();
    const idx = db[name].findIndex((r) => r.id === id);
    if (idx === -1) throw new Error(`Record ${id} not found in ${name}`);
    db[name][idx] = {
      ...db[name][idx],
      ...updates,
      id, // prevent id override
      updated_at: new Date().toISOString(),
    };
    updatedRecord = db[name][idx];
    return new Promise((resolve, reject) => {
      fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf-8', (err) => {
        if (err) reject(err); else resolve();
      });
    });
  });
  return updatedRecord;
}

async function remove(name, id) {
  await enqueueWrite(() => {
    const db = readDB();
    const initial = db[name].length;
    db[name] = db[name].filter((r) => r.id !== id);
    if (db[name].length === initial) throw new Error(`Record ${id} not found in ${name}`);
    return new Promise((resolve, reject) => {
      fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf-8', (err) => {
        if (err) reject(err); else resolve();
      });
    });
  });
}

function findById(name, id) {
  const col = getCollection(name);
  return col.find((r) => r.id === id) || null;
}

function findWhere(name, predicate) {
  const col = getCollection(name);
  return col.filter(predicate);
}

module.exports = {
  readDB,
  writeDB,
  getCollection,
  insert,
  update,
  remove,
  findById,
  findWhere,
};
