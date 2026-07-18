const fs = require('fs/promises');
const path = require('path');
const HISTORY_FILE = path.join(__dirname, '..', 'storage', 'history.json');
async function readHistory() { try { return JSON.parse(await fs.readFile(HISTORY_FILE, 'utf8')); } catch { return []; } }
async function saveHistoryItem(item) { await fs.mkdir(path.dirname(HISTORY_FILE), { recursive: true }); const history = await readHistory(); const next = [item, ...history].slice(0, 500); await fs.writeFile(HISTORY_FILE, JSON.stringify(next, null, 2)); return item; }
module.exports = { readHistory, saveHistoryItem };
