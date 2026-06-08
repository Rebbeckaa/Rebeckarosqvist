/* ============================================================
   Rebecka Rosqvist — interactions
   ============================================================ */
(function(){
  'use strict';
  const fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  const reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ---------- HEART CURSOR + TRAIL ---------- */
  const HEART = "<svg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' fill='#141414'/></svg>";

  if(fine){
    document.body.classList.add('heart-cursor');
    const heart = document.createElement('div');
    heart.className = 'cursor-heart';
    heart.innerHTML = HEART;
    document.body.appendChild(heart);

    // trail pool
    const TRAIL = 6;
    const trails = [];
    for(let i=0;i<TRAIL;i++){
      const t = document.createElement('div');
      t.className = 'cursor-trail';
      t.innerHTML = HEART;
      t.style.opacity = '0';
      document.body.appendChild(t);
      trails.push({el:t,x:0,y:0});
    }

    let mx=innerWidth/2, my=innerHeight/2;
    let hx=mx, hy=my;
    let moved=false;
    window.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;moved=true;},{passive:true});

    function loop(){
      // main heart eases slightly toward pointer
      hx += (mx-hx)*0.35; hy += (my-hy)*0.35;
      heart.style.left = hx+'px'; heart.style.top = hy+'px';
      // trail follows in a chain
      let px=hx, py=hy;
      for(let i=0;i<trails.length;i++){
        const tr=trails[i];
        tr.x += (px-tr.x)*0.32; tr.y += (py-tr.y)*0.32;
        tr.el.style.left=tr.x+'px'; tr.el.style.top=tr.y+'px';
        const scale = 0.85 - i*0.11;
        tr.el.style.transform = `translate(-50%,-50%) scale(${Math.max(.15,scale)})`;
        tr.el.style.opacity = moved ? String(Math.max(0,0.45 - i*0.07)) : '0';
        px=tr.x; py=tr.y;
      }
      requestAnimationFrame(loop);
    }
    loop();

    // grow over interactive elements
    const hot = 'a,button,.proj-card,.pill,.foot-mail,.course,.social-rail a';
    document.addEventListener('mouseover',e=>{ if(e.target.closest(hot)) heart.classList.add('grow'); });
    document.addEventListener('mouseout',e=>{ if(e.target.closest(hot)) heart.classList.remove('grow'); });
    document.addEventListener('mousedown',()=>heart.classList.add('tap'));
    document.addEventListener('mouseup',()=>heart.classList.remove('tap'));
    document.addEventListener('mouseleave',()=>{heart.style.opacity='0';});
    document.addEventListener('mouseenter',()=>{heart.style.opacity='1';});
  }

  /* ---------- MAGNETIC BUTTONS ---------- */
  if(fine && !reduce){
    document.querySelectorAll('[data-magnetic]').forEach(btn=>{
      const strength = 0.32;
      btn.addEventListener('mousemove',e=>{
        const r=btn.getBoundingClientRect();
        const x=e.clientX-(r.left+r.width/2);
        const y=e.clientY-(r.top+r.height/2);
        btn.style.transform=`translate(${x*strength}px,${y*strength}px)`;
      });
      btn.addEventListener('mouseleave',()=>{btn.style.transform='';});
    });
  }

  /* ---------- SCROLL REVEAL ---------- */
  const reveals = document.querySelectorAll('[data-reveal]');
  if(reveals.length){
    const show = el => el.classList.add('in');
    if(reduce){ reveals.forEach(show); }
    else{
      const io = new IntersectionObserver((entries)=>{
        entries.forEach(en=>{ if(en.isIntersecting){ show(en.target); io.unobserve(en.target);} });
      },{threshold:0.1, rootMargin:'0px 0px -6% 0px'});
      reveals.forEach(r=>io.observe(r));
      // guard: reveal whatever is in view, retried until layout settles
      const guard = ()=>reveals.forEach(r=>{ if(r.getBoundingClientRect().top < innerHeight*0.95) show(r); });
      guard();
      requestAnimationFrame(guard);
      setTimeout(guard,150);
      window.addEventListener('load',guard,{once:true});
    }
  }

  /* ---------- PROJECT CARD PARALLAX ---------- */
  if(fine && !reduce){
    document.querySelectorAll('.proj-card').forEach(card=>{
      const img = card.querySelector('.proj-media img');
      if(!img) return;
      card.addEventListener('mousemove',e=>{
        const r=card.getBoundingClientRect();
        const x=(e.clientX-(r.left+r.width/2))/r.width;
        const y=(e.clientY-(r.top+r.height/2))/r.height;
        img.style.transform=`scale(1.06) translate(${x*-22}px,${y*-16}px)`;
      });
      card.addEventListener('mouseleave',()=>{img.style.transform='';});
    });
  }

  /* ---------- OVERLAY MENU ---------- */
  const menuBtn = document.querySelector('.menu-btn');
  const overlay = document.querySelector('.overlay-menu');
  if(menuBtn && overlay){
    const toggle = (open)=>{
      menuBtn.classList.toggle('open',open);
      overlay.classList.toggle('open',open);
      document.body.style.overflow = open ? 'hidden' : '';
    };
    menuBtn.addEventListener('click',()=>toggle(!overlay.classList.contains('open')));
    overlay.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>toggle(false)));
    document.addEventListener('keydown',e=>{ if(e.key==='Escape') toggle(false); });
  }

  /* ---------- MARQUEE: duplicate track to fill ---------- */
  document.querySelectorAll('.marquee').forEach(m=>{
    const track = m.querySelector('.marquee-track');
    if(!track) return;
    const clone = track.cloneNode(true);
    clone.setAttribute('aria-hidden','true');
    m.appendChild(clone);
  });

})();
