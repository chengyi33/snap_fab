const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

function loadCollection(name) {
  const file = path.join(DATA_DIR, `${name}.json`);
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function saveCollection(name, data) {
  const file = path.join(DATA_DIR, `${name}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function nextId(collection) {
  if (!collection.length) return 1;
  return Math.max(...collection.map(r => r.id)) + 1;
}

const db = {
  // Generic CRUD
  all(name) { return loadCollection(name); },
  find(name, id) { return loadCollection(name).find(r => r.id === Number(id)); },
  insert(name, obj) {
    const rows = loadCollection(name);
    obj.id = nextId(rows);
    rows.push(obj);
    saveCollection(name, rows);
    return obj;
  },
  update(name, id, patch) {
    const rows = loadCollection(name);
    const i = rows.findIndex(r => r.id === Number(id));
    if (i === -1) return null;
    rows[i] = { ...rows[i], ...patch };
    saveCollection(name, rows);
    return rows[i];
  },
  remove(name, id) {
    const rows = loadCollection(name);
    const filtered = rows.filter(r => r.id !== Number(id));
    saveCollection(name, filtered);
    return filtered.length < rows.length;
  },
  seed(name, data) {
    const file = path.join(DATA_DIR, `${name}.json`);
    if (!fs.existsSync(file)) {
      saveCollection(name, data);
    }
  }
};

module.exports = db;
