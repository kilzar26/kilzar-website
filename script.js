const toggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('.nav-links');
toggle?.addEventListener('click',()=>{
  const open=nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded',String(open));
});
document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>{
  nav?.classList.remove('open');
  toggle?.setAttribute('aria-expanded','false');
}));
const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}});
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
const sections=[...document.querySelectorAll('main section[id]')];
const links=[...document.querySelectorAll('.nav-links a[href^="#"]')];
const spy=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+entry.target.id));
    }
  });
},{rootMargin:'-45% 0px -45% 0px'});
sections.forEach(s=>spy.observe(s));
document.getElementById('year').textContent=new Date().getFullYear();