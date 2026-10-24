(function (root) {
  'use strict';
  const W = 360, H = 480, ground = 396;
  function hit(a, b, pad = 7) {
    return a.x + pad < b.x + b.w - pad && a.x + a.w - pad > b.x + pad && a.y + pad < b.y + b.h - pad && a.y + a.h - pad > b.y + pad;
  }
  class Game {
    constructor(random = Math.random) { this.random = random; this.reset(); this.state = 'ready'; }
    reset() {
      Object.assign(this, {state:'play', t:0, score:0, coins:0, speed:3.1, spawn:65, objects:[], particles:[], streak:0, boardTime:0, shield:false, immunity:0, landing:0, distance:0, flash:0});
      this.fox = {x:72,y:ground-38,w:32,h:38,vy:0,onGround:true};
    }
    jump() { if(this.state === 'play' && this.fox.onGround) { this.fox.vy=-11.2; this.fox.onGround=false; this.burst(this.fox.x+16,ground,5,'#e8d7a3'); } }
    pause() { if(this.state==='play') this.state='paused'; }
    resume() { if(this.state==='paused') this.state='play'; }
    burst(x,y,n,color) { for(let i=0;i<n;i++) this.particles.push({x,y,vx:(this.random()-.5)*3,vy:-this.random()*2,life:20,color}); }
    collect(o) {
      o.collected=true; this.coins++; this.burst(o.x+11,o.y+11,7,'#ffdc75');
      if(this.boardTime<=0 && ++this.streak===5) { this.boardTime=10; this.shield=true; this.streak=0; this.flash=18; }
    }
    update(dt) {
      if(this.state!=='play') return;
      const d=Math.min(Math.max(dt,0),2), f=this.fox;
      this.t+=d; this.speed=Math.min(7,3.1+this.t/650); this.distance+=this.speed*d;
      this.immunity=Math.max(0,this.immunity-d); this.flash=Math.max(0,this.flash-d); this.landing=Math.max(0,this.landing-d);
      if(this.boardTime>0) { this.boardTime=Math.max(0,this.boardTime-d/60); if(this.boardTime===0) {this.shield=false;this.streak=0;this.immunity=0;} }
      f.vy+=.58*d; f.y+=f.vy*d;
      if(f.y>=ground-f.h) { if(!f.onGround){this.landing=8;this.burst(f.x+16,ground,4,'#e8d7a3');} f.y=ground-f.h; f.vy=0; f.onGround=true; }
      this.spawn-=d;
      if(this.spawn<=0) {
        const coin=this.random()<.34;
        this.objects.push(coin?{type:'coin',x:W+20,y:ground-72-this.random()*55,w:23,h:23}:{type:'rock',x:W+20,y:ground-29,w:29+this.random()*10,h:29});
        this.spawn=55+this.random()*38-Math.min(22,this.t/140);
      }
      for(const o of this.objects) {
        o.x-=this.speed*d;
        if(o.collected || o.broken) continue;
        if(hit(f,o)) {
          if(o.type==='coin') this.collect(o);
          else if(this.immunity<=0) {
            if(this.boardTime>0 && this.shield) { this.shield=false; this.immunity=45; this.flash=18; o.broken=true; this.burst(o.x,o.y,12,'#a9b9ad'); }
            else {this.state='over';break;}
          }
        }
        if(o.type==='coin' && !o.collected && !o.missed && o.x+o.w-7<=f.x+7) {o.missed=true;if(this.boardTime<=0)this.streak=0;}
      }
      this.objects=this.objects.filter(o=>o.x>-50&&!o.collected&&!o.broken);
      for(const p of this.particles) { p.x+=p.vx*d;p.y+=p.vy*d;p.life-=d; }
      this.particles=this.particles.filter(p=>p.life>0);
      this.score=Math.floor(this.t/7)+this.coins*10;
    }
  }
  root.Skogsrus={Game,W,H,ground,hit};
  if(typeof module!=='undefined') module.exports=root.Skogsrus;
})(globalThis);
