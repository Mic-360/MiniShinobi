const { initDb, saveToDisk } = require('./db');
let _db = null;

async function init() {
  _db = await initDb();
}

function prepare(sql) {
  return {
    get(...params) {
      if (!_db) throw new Error('DB not initialised');
      const stmt = _db.prepare(sql);
      try {
        stmt.bind(params.flat());
        return stmt.step() ? stmt.getAsObject() : undefined;
      } finally {
        stmt.free();
      }
    },
    all(...params) {
      if (!_db) throw new Error('DB not initialised');
      const stmt = _db.prepare(sql);
      try {
        stmt.bind(params.flat());
        const rows = [];
        while (stmt.step()) rows.push(stmt.getAsObject());
        return rows;
      } finally {
        stmt.free();
      }
    },
    run(...params) {
      if (!_db) throw new Error('DB not initialised');
      _db.run(sql, params.flat());
      const lastInsertRowid =
        _db.exec('SELECT last_insert_rowid()')[0]?.values[0][0] ?? null;
      saveToDisk();
      return { lastInsertRowid };
    },
  };
}

module.exports = { init, prepare };
