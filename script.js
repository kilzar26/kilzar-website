
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const t=document.querySelector(a.getAttribute('href'));if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth'})}}));

const revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');revealObserver.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));

const stage=document.querySelector('.hero-stage');
if(stage && matchMedia('(pointer:fine)').matches){
  stage.addEventListener('mousemove',e=>{
    const r=stage.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    stage.style.transform=`perspective(900px) rotateY(${x*3}deg) rotateX(${-y*2}deg)`;
    stage.querySelector('.hero-car').style.transform=`translate3d(${x*10}px,${y*7}px,20px)`;
  });
  stage.addEventListener('mouseleave',()=>{stage.style.transform='';stage.querySelector('.hero-car').style.transform=''});
}

const canvas=document.getElementById('field'),ctx=canvas?.getContext('2d');
if(canvas&&ctx&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
 let w,h,dpr,pts=[];
 function resize(){dpr=Math.min(devicePixelRatio||1,2);w=innerWidth;h=innerHeight;canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);pts=Array.from({length:Math.min(65,Math.floor(w/22))},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.12,vy:(Math.random()-.5)*.12,r:Math.random()*1.2+.25}))}
 function draw(){ctx.clearRect(0,0,w,h);for(const p of pts){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>w)p.vx*=-1;if(p.y<0||p.y>h)p.vy*=-1;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle='rgba(63,205,255,.42)';ctx.fill()}for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){let a=pts[i],b=pts[j],dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy);if(d<115){ctx.strokeStyle=`rgba(25,126,190,${(1-d/115)*.10})`;ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}}requestAnimationFrame(draw)}
 addEventListener('resize',resize,{passive:true});resize();draw();
}

const menuButton=document.querySelector('.menu-toggle');
const mobileNav=document.querySelector('.links');
if(menuButton&&mobileNav){
  const closeMenu=()=>{mobileNav.classList.remove('open');menuButton.setAttribute('aria-expanded','false');document.body.classList.remove('menu-open')};
  menuButton.addEventListener('click',()=>{
    const open=!mobileNav.classList.contains('open');
    mobileNav.classList.toggle('open',open);
    menuButton.setAttribute('aria-expanded',String(open));
    document.body.classList.toggle('menu-open',open);
  });
  mobileNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
  addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
}
