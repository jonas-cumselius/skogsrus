const {test}=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const fs=require('node:fs');const {Game,W,H,ground}=require('../engine.js');
test('UI starts, pauses, resumes, stores best and restarts',()=>{
 const elements={},listeners={},storage=new Map([['skogsrus-best','12']]);let frame;
 const ctx=new Proxy({}, {get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
 const element=id=>elements[id]||=( {textContent:'',disabled:false,getContext:()=>ctx,addEventListener:(type,fn)=>{listeners[id+type]=fn;},setAttribute(){},click(){if(!this.disabled)this.onclick?.();}} );
 const sandbox={Skogsrus:{Game,W,H,ground},document:{getElementById:element,addEventListener:(type,fn)=>listeners[type]=fn},window:{addEventListener(){}},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},matchMedia:()=>({matches:false}),requestAnimationFrame:fn=>frame=fn};vm.createContext(sandbox);vm.runInContext(fs.readFileSync(require.resolve('../game.js'),'utf8'),sandbox);
 const run=s=>vm.runInContext(s,sandbox);
 assert.equal(elements.best.textContent,12);elements.action.click();assert.equal(run('game.state'),'play');
 elements.pause.click();assert.equal(run('game.state'),'paused');elements.action.click();assert.equal(run('game.state'),'play');
 run('game.coins=10;game.objects=[{type:"rock",x:72,y:367,w:34,h:29}]');frame(16);assert.equal(run('game.state'),'over');assert.equal(storage.get('skogsrus-best'),'100');
 elements.action.click();assert.equal(run('game.state'),'play');assert.equal(run('game.score'),0);assert.equal(run('best'),100);
 listeners.visibilitychange();run('document.hidden=true');listeners.visibilitychange();assert.equal(run('game.state'),'paused');
});
