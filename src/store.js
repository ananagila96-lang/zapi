import {DatabaseSync} from 'node:sqlite';
export function openStore(path){
 const db=new DatabaseSync(path);
 db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
 CREATE TABLE IF NOT EXISTS instances(id TEXT PRIMARY KEY, provider TEXT NOT NULL, phone_id TEXT);
 CREATE TABLE IF NOT EXISTS messages(instance TEXT NOT NULL, id TEXT NOT NULL, sender TEXT, text TEXT, time TEXT, direction TEXT, status TEXT, PRIMARY KEY(instance,id));
 CREATE TABLE IF NOT EXISTS requests(instance TEXT NOT NULL, id TEXT NOT NULL, hash TEXT NOT NULL, result TEXT, PRIMARY KEY(instance,id));`);
 return {
  instances:()=>db.prepare('SELECT * FROM instances ORDER BY id').all(),
  addInstance:(id,provider,phoneId)=>db.prepare('INSERT INTO instances VALUES(?,?,?)').run(id,provider,phoneId||null),
  addMessage:(instance,m)=>db.prepare('INSERT OR IGNORE INTO messages VALUES(?,?,?,?,?,?,?)').run(instance,m.id,m.from||'',m.text||'',m.receivedAt||new Date().toISOString(),m.direction||'in',m.status||'received'),
  status:(instance,id,status)=>db.prepare('UPDATE messages SET status=? WHERE instance=? AND id=?').run(status,instance,id),
  messages:instance=>db.prepare('SELECT id,sender AS "from",text,time AS receivedAt,direction,status FROM messages WHERE instance=? ORDER BY time DESC LIMIT 100').all(instance).reverse(),
  request:(instance,id)=>db.prepare('SELECT hash,result FROM requests WHERE instance=? AND id=?').get(instance,id),
  begin:(instance,id,hash)=>db.prepare('INSERT INTO requests VALUES(?,?,?,NULL)').run(instance,id,hash),
  finish:(instance,id,result)=>db.prepare('UPDATE requests SET result=? WHERE instance=? AND id=?').run(JSON.stringify(result),instance,id),
  prune:days=>db.prepare('DELETE FROM messages WHERE time < ?').run(new Date(Date.now()-days*86400000).toISOString()),
  close:()=>db.close()
 };
}
