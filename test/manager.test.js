import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createManager} from '../src/manager.js';
import {openStore} from '../src/store.js';
test('cadastro bloqueia traversal, duplicação e excesso de conexões',()=>{
 const store=openStore(':memory:');const manager=createManager({store,dir:'/tmp/unused-zap',max:2});
 try{
  assert.throws(()=>manager.create({id:'../escape'}));
  manager.create({id:'principal'});assert.throws(()=>manager.create({id:'principal'}));
  assert.throws(()=>manager.create({id:'meta',provider:'meta',phoneId:'../bad'}));
  manager.create({id:'segundo'});assert.throws(()=>manager.create({id:'terceiro'}));
  assert.equal(manager.list().length,2);
 }finally{manager.close();store.close();}
});
