// in comune tra pagina della password e service worker
const CHIAVE = { sale: 'DkjLa+bd2FeS6bgc+1TowA==', iter: 310000, durata: 30 * 864e5 };
function chiaveDb() {
  return new Promise((ok, ko) => { const r = indexedDB.open('deck-chiave', 1); r.onupgradeneeded = () => r.result.createObjectStore('k'); r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error); });
}
async function chiaveLeggi() {
  const db = await chiaveDb();
  const v = await new Promise((ok) => { const q = db.transaction('k').objectStore('k').get('aes'); q.onsuccess = () => ok(q.result); q.onerror = () => ok(null); });
  return v && v.sale === CHIAVE.sale && Date.now() - v.t < CHIAVE.durata ? v.k : null;
}
async function chiaveScrivi(k) {
  const db = await chiaveDb();
  await new Promise((ok) => { const t = db.transaction('k', 'readwrite'); t.objectStore('k').put(k ? { k, t: Date.now(), sale: CHIAVE.sale } : null, 'aes'); t.oncomplete = ok; t.onerror = ok; });
}
async function chiaveDecifra(k, buf) {
  const b = new Uint8Array(buf);
  return crypto.subtle.decrypt({ name: 'AES-GCM', iv: b.slice(0, 12) }, k, b.slice(12));
}
