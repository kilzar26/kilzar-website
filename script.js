const reduced=matchMedia('(prefers-reduced-motion: reduce)');

document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
  const href=a.getAttribute('href');
  if(!href||href==='#') return;
  const t=document.querySelector(href);
  if(t){e.preventDefault();t.scrollIntoView({behavior:reduced.matches?'auto':'smooth'})}
}));

const revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{
  if(e.isIntersecting){e.target.classList.add('visible');revealObserver.unobserve(e.target)}
}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));

const canvas=document.getElementById('field'),ctx=canvas?.getContext('2d');
if(canvas&&ctx&&!reduced.matches){
  let w,h,dpr,pts=[],raf=0;
  function resize(){dpr=Math.min(devicePixelRatio||1,2);w=innerWidth;h=innerHeight;canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);pts=Array.from({length:Math.min(65,Math.floor(w/22))},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.12,vy:(Math.random()-.5)*.12,r:Math.random()*1.2+.25}))}
  function draw(){if(document.hidden){raf=0;return}ctx.clearRect(0,0,w,h);for(const p of pts){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>w)p.vx*=-1;if(p.y<0||p.y>h)p.vy*=-1;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle='rgba(63,205,255,.42)';ctx.fill()}for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){const a=pts[i],b=pts[j],dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy);if(d<115){ctx.strokeStyle=`rgba(25,126,190,${(1-d/115)*.10})`;ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}}raf=requestAnimationFrame(draw)}
  addEventListener('resize',resize,{passive:true});document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!raf)draw()});resize();draw();
}

const menuButton=document.querySelector('.menu-toggle');
const mobileNav=document.querySelector('.links');
if(menuButton&&mobileNav){
  const closeMenu=()=>{mobileNav.classList.remove('open');menuButton.setAttribute('aria-expanded','false');document.body.classList.remove('menu-open')};
  menuButton.addEventListener('click',()=>{const open=!mobileNav.classList.contains('open');mobileNav.classList.toggle('open',open);menuButton.setAttribute('aria-expanded',String(open));document.body.classList.toggle('menu-open',open)});
  mobileNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
  addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
}

(()=>{
  const bg=document.getElementById('krai-background'),button=document.getElementById('background-toggle');
  const saveData=navigator.connection?.saveData;
  if(!bg||!button||reduced.matches||saveData)return;
  const source=bg.querySelector('source');
  if(source?.dataset.src){source.src=source.dataset.src;bg.load()}
  bg.play().then(()=>{button.hidden=false}).catch(()=>{});
  button.addEventListener('click',()=>{if(bg.paused){bg.play().then(()=>button.textContent='Pause background').catch(()=>{})}else{bg.pause();button.textContent='Play background'}});
  reduced.addEventListener?.('change',e=>{if(e.matches){bg.pause();button.textContent='Play background'}});
  const observer=new IntersectionObserver(([entry])=>{if(!entry.isIntersecting)bg.pause();else if(button.textContent==='Pause background'&&!reduced.matches)bg.play().catch(()=>{})},{threshold:.1});
  observer.observe(bg);
})();