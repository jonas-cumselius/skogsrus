const {test}=require('node:test');
const assert=require('node:assert/strict');
const {Game,ground}=require('../engine.js');
const coin=()=>({type:'coin',x:72,y:ground-38,w:23,h:23});
const rock=()=>({type:'rock',x:72,y:ground-29,w:34,h:29});
function fresh(){const g=new Game(()=>.5);g.reset();g.spawn=10000;return g;}
function collect(g){g.objects.push(coin());g.update(1);}
test('five consecutive coins activate a ten second board',()=>{const g=fresh();for(let i=1;i<5;i++){collect(g);assert.equal(g.streak,i);}collect(g);assert.equal(g.boardTime,10);assert.equal(g.shield,true);assert.equal(g.coins,5);});
test('missed coin breaks streak when it passes fox',()=>{const g=fresh();collect(g);g.objects.push({type:'coin',x:50,y:200,w:23,h:23});g.update(1);assert.equal(g.streak,0);});
test('board coins score without building next streak; expires after 600 frames',()=>{const g=fresh();for(let i=0;i<5;i++)collect(g);collect(g);assert.equal(g.coins,6);assert.equal(g.streak,0);for(let i=0;i<600;i++)g.update(1);assert.equal(g.boardTime,0);assert.equal(g.shield,false);assert.equal(g.streak,0);});
test('pause freezes timer, physics, objects, particles and score',()=>{const g=fresh();for(let i=0;i<5;i++)collect(g);g.pause();const before=JSON.stringify(g);g.update(600);assert.equal(JSON.stringify(g),before);g.resume();g.update(1);assert.ok(g.boardTime<10);});
test('shield absorbs exactly one rock and grants temporary immunity',()=>{const g=fresh();for(let i=0;i<5;i++)collect(g);g.objects.push(rock());g.update(1);assert.equal(g.state,'play');assert.equal(g.shield,false);assert.ok(g.immunity>0);assert.equal(g.objects.length,0);g.objects.push(rock());g.update(1);assert.equal(g.state,'play');g.objects=[];for(let i=0;i<45;i++)g.update(1);g.objects.push(rock());g.update(1);assert.equal(g.state,'over');});
test('normal collision ends game and reset clears power and world',()=>{const g=fresh();g.objects.push(rock());g.update(1);assert.equal(g.state,'over');g.reset();assert.equal(g.state,'play');assert.equal(g.boardTime,0);assert.equal(g.immunity,0);assert.equal(g.streak,0);assert.equal(g.score,0);assert.equal(g.objects.length,0);assert.equal(g.fox.onGround,true);});
test('original jump physics and difficulty are preserved',()=>{const g=fresh();g.jump();assert.equal(g.fox.vy,-11.2);g.update(1);assert.equal(g.fox.vy,-10.62);assert.equal(g.speed,3.1+1/650);for(let i=0;i<45;i++)g.update(1);assert.equal(g.fox.onGround,true);assert.equal(g.fox.y,ground-38);});
