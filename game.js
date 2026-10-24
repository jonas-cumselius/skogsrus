'use strict';
const {Game,W,H,ground}=Skogsrus;
const game=new Game(), canvas=document.getElementById('game'), ctx=canvas.getContext('2d');
const action=document.getElementById('action'),pause=document.getElementById('pause');
let best=0,last=0;
try {best=Math.max(0,Number(localStorage.getItem('skogsrus-best'))||0);} catch {}
document.getElementById('best').textContent=best;
ctx.imageSmoothingEnabled=false;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
// Hand-authored pixel sprites: palette indices map directly to integer canvas pixels.
const palette={o:'#e9873f',s:'#b85730',l:'#ffb65c',c:'#fff0cf',d:'#263c35',p:'#e6a08a'};
const body=[
'....................o......o....',
'...................oso....oso...',
'...................opso..ospo...',
'...................oooooolooo...',
'..................ollllllllooo..',
'.................oollllllldlooo.',
'................ooollllllldlooo.',
'cc.............ooooolllllllooo..',
'cccc..........oooooocccccccddd..',
'cccccooo.....oooooooccccccccc...',
'.cccoooooo..oooooooosccccccc....',
'..coooooooosoooooooossccccc.....',
'...oooooooosoooooooosssccc......',
'....ooooooosoooooooossscc.......',
'......ooooosoooooooosss.........',
'........oooooollloooss..........',
'.........ooooolllooos...........',
'..........oooossooos............'];
function sprite(rows,x,y,scale=1){rows.forEach((row,yy)=>[...row].forEach((p,xx)=>{if(palette[p])rect(x+xx*scale,y+yy*scale,scale,scale,palette[p]);}));}
function fox(){
 const f=game.fox,board=game.boardTime>0;
 if(game.immunity>0 && Math.floor(game.t/4)%2)return;
 const frame=Math.floor(game.t/6)%4;
 let x=f.x-8,y=f.y+7;
 if(f.onGround && !board)y+= [0,1,0,-1][frame];
 if(game.landing>0)y+=3;
 sprite(body,x,y,1.3);
 const feetY=f.y+33;
 if(board){
   rect(f.x+3,feetY-1,7,4,'#263c35');rect(f.x+22,feetY-1,7,4,'#263c35');
   rect(f.x-6,feetY+3,44,3,'#e9bd70');rect(f.x-9,feetY+1,4,3,'#e9bd70');rect(f.x+38,feetY+1,4,3,'#e9bd70');
   for(const wheel of [f.x+1,f.x+28]){rect(wheel,feetY+6,7,6,'#263c35');rect(wheel+2,feetY+7,3,3,frame%2?'#e9bd70':'#90c5af');}
   if(game.shield){rect(f.x+39,f.y+5,8,3,'#a8e4d2');rect(f.x+41,f.y+8,4,6,'#a8e4d2');}
 }else if(!f.onGround){rect(f.x+6,feetY-5,9,4,'#263c35');rect(f.x+22,feetY-7,8,4,'#263c35');}
 else if(game.landing>0){rect(f.x+1,feetY+1,12,4,'#263c35');rect(f.x+22,feetY+1,12,4,'#263c35');}
 else {const legs=[[1,24],[5,20],[9,16],[5,20]][frame];rect(f.x+legs[0],feetY,7,5,'#263c35');rect(f.x+legs[1],feetY,7,5,'#263c35');}
}
function tree(x,y,scale,color){rect(x+9*scale,y+18*scale,3*scale,30*scale,'#49634c');for(let i=0;i<4;i++)rect(x+(6-i*3)*scale,y+i*8*scale,(10+i*6)*scale,10*scale,color);}
function scenery(){
 rect(0,0,W,H,'#b7d7bc');rect(0,0,W,100,'#a9cebd');rect(0,100,W,60,'#bfd9ba');
 rect(275,55,34,34,'#f9e3a0');rect(269,62,46,20,'#f9e3a0');
 for(let i=0;i<4;i++){const x=((i*119-game.distance*.035)%480+480)%480-70;rect(x,48+i%2*47,51,6,'#e2e7c8');rect(x+10,42+i%2*47,27,6,'#e2e7c8');}
 // Three independently scrolling layers: stepped hills, distant forest, foreground vegetation.
 for(let i=-1;i<5;i++){const x=i*110-(game.distance*.12%110);for(let j=0;j<6;j++)rect(x-j*9,200+j*16,110+j*18,200,'#8eaf91');}
 for(let i=-1;i<10;i++){let x=i*49-(game.distance*.3%49);tree(x,215+i%3*13,2,'#668c73');}
 for(let i=-1;i<7;i++){let x=i*77-(game.distance*.6%77);tree(x,255+i%2*22,2.5,'#3f705c');rect(x+31,378,38,18,'#345e4d');rect(x+38,370,20,12,'#345e4d');}
 rect(0,ground,W,84,'#755d43');rect(0,ground,W,6,'#b5c877');rect(0,ground+6,W,7,'#4e7650');rect(0,ground+13,W,7,'#4e4937');
 for(let i=0;i<30;i++){let x=((i*29-game.distance)%420+420)%420-30;rect(x,ground+24+(i%4)*13,5+i%3*2,3,'#9a7b50');rect(x+13,ground+19+(i%3)*17,3,3,'#534b3b');}
}
function objects(){for(const o of game.objects){if(o.type==='rock'){
 rect(o.x+4,o.y,o.w-10,4,'#a2b0a0');rect(o.x,o.y+8,o.w,o.h-8,'#586d65');rect(o.x+3,o.y+3,o.w-6,15,'#82958a');rect(o.x+7,o.y+5,7,4,'#bdc5ad');rect(o.x+o.w-7,o.y+14,5,11,'#42594f');
 }else{let widths=[17,13,5,13],cw=widths[Math.floor(game.t/7)%4],x=o.x+11-cw/2;rect(x,o.y+4,cw,15,'#d99335');rect(x+2,o.y+1,Math.max(2,cw-4),21,'#eab34c');rect(x+2,o.y+4,Math.max(2,cw-4),14,'#ffdb75');if(cw>6)rect(x+4,o.y+6,3,9,'#fff0b0');}}}
function overlay(title,lines){rect(18,132,324,169,'#173b32');rect(18,132,324,3,'#e9bd70');ctx.textAlign='center';ctx.fillStyle='#e9bd70';ctx.font='10px monospace';ctx.fillText('SKOGSRUS / PIXEL & SKATE',180,157);ctx.fillStyle='#fff0cf';ctx.font='bold 24px monospace';ctx.fillText(title,180,194);ctx.font='12px monospace';lines.forEach((s,i)=>ctx.fillText(s,180,225+i*23));ctx.textAlign='left';}
function draw(){scenery();objects();fox();for(const p of game.particles)rect(p.x,p.y,3,3,p.color);if(game.flash>0&&!reduced){ctx.globalAlpha=.16;rect(0,0,W,H,'#fff0cf');ctx.globalAlpha=1;}
 if(game.state==='ready')overlay('SKOGEN VÄNTAR',['Hoppa över stenar. Samla mynt.','5 i rad → 10 sekunder på brädan','TRYCK FÖR ATT STARTA']);
 if(game.state==='paused')overlay('EN LITEN PAUS',['Räven väntar på dig.','Tid och skog står stilla.','TRYCK FÖR ATT FORTSÄTTA']);
 if(game.state==='over')overlay('EN RUNDA TILL?',['POÄNG '+game.score+'  /  REKORD '+best,'Varje stig är en ny chans.','TRYCK FÖR ATT SPELA IGEN']);
}
function sync(){document.getElementById('score').textContent=game.score;document.getElementById('best').textContent=best;document.getElementById('streak').textContent=game.boardTime>0?'SKATE · '+game.boardTime.toFixed(1)+' s':'MYNTSVIT · '+game.streak+'/5';document.getElementById('power').textContent=game.boardTime>0?(game.shield?'SKYDD KVAR ◆':'SKYDD FÖRBRUKAT ◇'):'5 I RAD = SKATEBOARD';pause.disabled=!['play','paused'].includes(game.state);pause.textContent=game.state==='paused'?'▶':'Ⅱ';pause.setAttribute('aria-label',game.state==='paused'?'Återuppta spelet':'Pausa spelet');action.textContent={ready:'UT I SKOGEN →',play:'HOPPA ↑',paused:'FORTSÄTT →',over:'SPELA IGEN →'}[game.state];}
function input(){if(game.state==='ready'||game.state==='over')game.reset();else if(game.state==='paused'){game.resume();last=0;}else game.jump();sync();}
action.onclick=input;canvas.addEventListener('pointerdown',e=>{e.preventDefault();input();});pause.onclick=()=>{game.state==='paused'?game.resume():game.pause();last=0;sync();};
document.addEventListener('keydown',e=>{if(['Space','ArrowUp'].includes(e.code)){e.preventDefault();if(!e.repeat)input();}if(e.code==='Escape'||e.code==='KeyP'){pause.click();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){game.pause();last=0;sync();}});window.addEventListener('blur',()=>{game.pause();last=0;sync();});
function frame(now){const dt=last?(now-last)/16.667:0;last=now;const previous=game.state;game.update(dt);if(previous==='play'&&game.state==='over'&&game.score>best){best=game.score;try{localStorage.setItem('skogsrus-best',String(best));}catch{}}sync();draw();requestAnimationFrame(frame);}sync();requestAnimationFrame(frame);
