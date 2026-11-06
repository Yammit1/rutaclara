// Animaciones de entrada con alternativa para navegadores que no soportan IntersectionObserver.
  const revealItems = Array.from(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window) {
    document.documentElement.classList.add('js-motion');
    const revealObserver = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    revealItems.forEach((el,i) => { el.style.transitionDelay = Math.min(i % 5, 4) * 70 + 'ms'; revealObserver.observe(el); });
    // Salvaguarda: si el navegador no dispara observaciones, el contenido sigue visible.
    window.setTimeout(()=>revealItems.forEach(el=>el.classList.add('visible')), 900);
  } else {
    revealItems.forEach(el=>el.classList.add('visible'));
  }

  const navLinks = Array.from(document.querySelectorAll('#navLinks a[data-sec]'));
  const sections = navLinks.map(a => document.getElementById(a.dataset.sec)).filter(Boolean);
  const spyObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      const link = navLinks.find(a => a.dataset.sec === entry.target.id);
      if(!link) return;
      if(entry.isIntersecting){ navLinks.forEach(a=>a.classList.remove('active')); link.classList.add('active'); }
    });
  }, { threshold: 0.4 });
  sections.forEach(sec => spyObserver.observe(sec));

  function avisoDescarga(){
    alert('La app todavía está en desarrollo. Cuando esté lista, este botón descargará el archivo APK directamente.');
  }
  function avisarme(){
    const correo = document.getElementById('notifyEmail').value.trim();
    if(!correo) return;
    let lista = [];
    try{ lista = JSON.parse(localStorage.getItem('rutaclara_avisos') || '[]'); }catch(e){}
    lista.push({correo, fecha: new Date().toISOString()});
    try{ localStorage.setItem('rutaclara_avisos', JSON.stringify(lista)); }catch(e){}
    document.getElementById('notifyEmail').value = '';
    const ok = document.getElementById('notifyOk');
    ok.style.display = 'block';
    setTimeout(()=>{ ok.style.display = 'none'; }, 4000);
  }
  function toggleFaq(btn){
    const item = btn.parentElement;
    const estabaAbierto = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if(!estabaAbierto) item.classList.add('open');
  }
  function enviarContacto(e){
    e.preventDefault();
    const nombre = document.getElementById('cNombre').value.trim();
    const correo = document.getElementById('cCorreo').value.trim();
    const mensaje = document.getElementById('cMensaje').value.trim();
    if(!nombre || !correo || !mensaje) return false;
    let mensajes = [];
    try{ mensajes = JSON.parse(localStorage.getItem('rutaclara_contacto') || '[]'); }catch(err){}
    mensajes.push({nombre, correo, mensaje, fecha: new Date().toISOString()});
    try{ localStorage.setItem('rutaclara_contacto', JSON.stringify(mensajes)); }catch(err){}
    document.getElementById('contactoForm').reset();
    const ok = document.getElementById('contactoOk');
    ok.style.display = 'block';
    setTimeout(()=>{ ok.style.display = 'none'; }, 4000);
    return false;
  }


/* Microinteracciones adicionales: progreso de lectura, cabecera y movimiento sutil. */
(function(){
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const progress = document.createElement('div');
  progress.id = 'scrollProgress';
  progress.setAttribute('aria-hidden','true');
  document.body.prepend(progress);

  const header = document.querySelector('header.top');
  let ticking = false;
  function updateScroll(){
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    progress.style.width = pct + '%';
    if(header) header.classList.toggle('scrolled', window.scrollY > 12);
    ticking = false;
  }
  window.addEventListener('scroll', function(){
    if(!ticking){ window.requestAnimationFrame(updateScroll); ticking = true; }
  }, {passive:true});
  updateScroll();

  // Entrada escalonada: los elementos de una misma sección no aparecen todos a la vez.
  if(!reduceMotion){
    document.querySelectorAll('.feature-grid, .steps-list, .req-grid, .phones-row').forEach(group=>{
      Array.from(group.children).forEach((item,index)=>{
        if(item.classList.contains('reveal')) item.style.transitionDelay = Math.min(index * 90, 360) + 'ms';
      });
    });

    // Inclinación muy ligera en tarjetas, solo con mouse/trackpad.
    if(window.matchMedia('(pointer:fine)').matches){
      document.querySelectorAll('.feature-card, .req-card').forEach(card=>{
        card.addEventListener('pointermove', event=>{
          const rect = card.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width;
          const y = (event.clientY - rect.top) / rect.height;
          const rx = (0.5 - y) * 3;
          const ry = (x - 0.5) * 4;
          card.style.transform = `perspective(900px) translateY(-5px) rotateX(${rx}deg) rotateY(${ry}deg)`;
        });
        card.addEventListener('pointerleave', ()=>{ card.style.transform = ''; });
      });
    }
  }
})();

/* RutaClara viva: partículas ligeras, parallax del mapa y detalles animados. */
(function rutaClaraViva(){
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.querySelector('.hero');
  const map = document.querySelector('.map-panel');
  if(!hero) return;

  // Capas decorativas ambientales, creadas desde JS para mantener limpio el HTML.
  ['orb-a','orb-b'].forEach(name=>{
    if(!hero.querySelector('.'+name)){
      const orb=document.createElement('span');
      orb.className='ambient-orb '+name;
      orb.setAttribute('aria-hidden','true');
      hero.appendChild(orb);
    }
  });

  if(map){
    if(!map.querySelector('.map-sweep')){
      const sweep=document.createElement('span');
      sweep.className='map-sweep'; sweep.setAttribute('aria-hidden','true'); map.appendChild(sweep);
    }
    if(!map.querySelector('.route-live-pin')){
      const pin=document.createElement('span');
      pin.className='route-live-pin'; pin.setAttribute('aria-hidden','true'); map.appendChild(pin);
    }
  }

  if(reduceMotion) return;
  const finePointer=window.matchMedia('(pointer:fine)').matches;
  if(finePointer && map){
    let frame=0;
    map.addEventListener('pointermove',e=>{
      const rect=map.getBoundingClientRect();
      const nx=(e.clientX-rect.left)/rect.width-.5;
      const ny=(e.clientY-rect.top)/rect.height-.5;
      if(frame) cancelAnimationFrame(frame);
      frame=requestAnimationFrame(()=>{
        map.style.transform=`perspective(1100px) rotateX(${(-ny*3).toFixed(2)}deg) rotateY(${(nx*4).toFixed(2)}deg) translateY(-2px)`;
      });
    });
    map.addEventListener('pointerleave',()=>{map.style.transform='';});
  }

  // Contadores que cuentan al entrar en pantalla, sin inventar nuevos datos.
  const nums=document.querySelectorAll('.stats-strip .num');
  const counterObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting) return;
      const el=entry.target;
      if(el.dataset.counted==='true') return;
      el.dataset.counted='true';
      const raw=el.textContent.trim();
      const match=raw.match(/^(\D*)(\d+(?:[.,]\d+)?)(.*)$/);
      if(!match) return;
      const prefix=match[1], target=Number(match[2].replace(',','.')), suffix=match[3];
      if(!Number.isFinite(target) || target===0) return;
      const start=performance.now(), duration=1050;
      function tick(now){
        const p=Math.min(1,(now-start)/duration);
        const eased=1-Math.pow(1-p,3);
        const value=target<10 && !Number.isInteger(target) ? (target*eased).toFixed(1) : Math.round(target*eased).toString();
        el.textContent=prefix+value.replace('.',',')+suffix;
        if(p<1) requestAnimationFrame(tick); else el.textContent=raw;
      }
      requestAnimationFrame(tick);
    });
  },{threshold:.55});
  nums.forEach(el=>counterObserver.observe(el));
})();

/* Movimiento protagonista: vehículo animado, halo de luz y scroll reveal reforzado. */
(function movimientoProtagonista(){
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.querySelector('.hero');
  const map = document.querySelector('.map-panel');
  if(hero && !reduceMotion){
    const glow = document.createElement('span');
    glow.className = 'cursor-glow';
    glow.setAttribute('aria-hidden','true');
    hero.appendChild(glow);
    if(window.matchMedia('(pointer:fine)').matches){
      hero.addEventListener('pointermove', e=>{
        const r=hero.getBoundingClientRect();
        glow.style.left=(e.clientX-r.left)+'px';
        glow.style.top=(e.clientY-r.top)+'px';
        glow.classList.add('active');
      });
      hero.addEventListener('pointerleave',()=>glow.classList.remove('active'));
    }
  }
  if(map && !map.querySelector('.moving-bus')){
    const bus=document.createElement('div');
    bus.className='moving-bus';
    bus.setAttribute('aria-hidden','true');
    bus.innerHTML='<span class="bus-light"></span><span class="bus-label">L1</span><svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="17" rx="4"/><path d="M4 10h16M8 20v2M16 20v2"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/></svg>';
    map.appendChild(bus);
  }
  // Microinteracción: los enlaces de navegación responden al clic con una transición limpia.
  document.querySelectorAll('a[href^="#"]').forEach(link=>{
    link.addEventListener('click',()=>{
      const id=link.getAttribute('href');
      if(!id || id==='#') return;
      const target=document.querySelector(id);
      if(target){target.classList.remove('section-arrive');void target.offsetWidth;target.classList.add('section-arrive');}
    });
  });
})();

/* Interacciones visuales extra en tarjetas: inclinación mínima y brillo siguiendo el puntero.
   Solo afecta a dispositivos con cursor; no modifica el contenido ni las acciones de la web. */
(function interaccionesTarjetas(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.matchMedia('(pointer:fine)').matches) return;
  const cards=document.querySelectorAll('.feature-card,.req-card,.road-item,.phone,.spotlight');
  cards.forEach(card=>{
    card.addEventListener('pointermove',e=>{
      const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width;
      const y=(e.clientY-r.top)/r.height;
      card.style.setProperty('--shine-x',(x*100).toFixed(1)+'%');
      card.style.setProperty('--shine-y',(y*100).toFixed(1)+'%');
      if(card.matches('.feature-card,.req-card,.road-item')){
        card.style.transform=`perspective(900px) rotateX(${((.5-y)*2.2).toFixed(2)}deg) rotateY(${((x-.5)*2.8).toFixed(2)}deg) translateY(-5px)`;
      }
    });
    card.addEventListener('pointerleave',()=>{card.style.transform='';});
  });
})();

/* Acceso de demostración: no sustituye autenticación real de servidor. */
(function accesoRutaClara(){
  const gate=document.getElementById('authGate');
  if(!gate) return;
  const form=document.getElementById('authForm');
  const loginTab=document.getElementById('loginTab');
  const registerTab=document.getElementById('registerTab');
  const title=document.getElementById('authTitle');
  const subtitle=document.getElementById('authSubtitle');
  const submitText=document.getElementById('authSubmitText');
  const nameField=document.getElementById('nameField');
  const confirmField=document.getElementById('confirmField');
  const rememberRow=document.getElementById('rememberRow');
  const termsRow=document.getElementById('termsRow');
  const email=document.getElementById('authEmail');
  const password=document.getElementById('authPassword');
  const confirm=document.getElementById('authConfirm');
  const error=document.getElementById('authError');
  let mode='login';
  try{const remembered=localStorage.getItem('rutaclara_login_email');if(remembered)email.value=remembered;}catch(e){}
  function showError(message){error.textContent=message;error.hidden=false;}
  function clearError(){error.textContent='';error.hidden=true;}
  function setMode(next){
    mode=next;clearError();
    const registering=mode==='register';
    loginTab.classList.toggle('active',!registering);registerTab.classList.toggle('active',registering);
    loginTab.setAttribute('aria-selected',String(!registering));registerTab.setAttribute('aria-selected',String(registering));
    nameField.hidden=!registering;confirmField.hidden=!registering;termsRow.hidden=!registering;rememberRow.hidden=registering;
    document.getElementById('authName').required=registering;confirm.required=registering;document.getElementById('authTerms').required=registering;
    password.autocomplete=registering?'new-password':'current-password';
    title.textContent=registering?'Crea tu cuenta gratis':'Qué bueno verte de nuevo';
    subtitle.textContent=registering?'Únete y descubre una forma más clara de moverte por Cusco.':'Ingresa a tu cuenta y empieza a explorar Cusco.';
    submitText.textContent=registering?'Crear cuenta de demostración':'Entrar a RutaClara';
    document.getElementById('forgotBtn').hidden=registering;
  }
  loginTab.addEventListener('click',()=>setMode('login'));
  registerTab.addEventListener('click',()=>setMode('register'));
  document.getElementById('togglePassword').addEventListener('click',()=>{
    const visible=password.type==='password';password.type=visible?'text':'password';
    document.getElementById('togglePassword').setAttribute('aria-label',visible?'Ocultar contraseña':'Mostrar contraseña');
  });
  document.getElementById('forgotBtn').addEventListener('click',()=>{
    clearError();const value=email.value.trim();
    if(!value){showError('Escribe tu correo electrónico para continuar. En esta demo no se envían correos reales.');email.focus();return;}
    showError('Esta versión es una demostración: la recuperación por correo estará disponible cuando se conecte el servicio de autenticación.');
  });
  form.addEventListener('submit',event=>{
    event.preventDefault();clearError();
    const address=email.value.trim();const pass=password.value;
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)){showError('Ingresa un correo electrónico válido.');email.focus();return;}
    if(pass.length<8){showError('La contraseña debe tener al menos 8 caracteres.');password.focus();return;}
    if(mode==='register'){
      if(document.getElementById('authName').value.trim().length<2){showError('Escribe tu nombre para crear la cuenta de demostración.');document.getElementById('authName').focus();return;}
      if(pass!==confirm.value){showError('Las contraseñas no coinciden.');confirm.focus();return;}
      if(!document.getElementById('authTerms').checked){showError('Marca la casilla para continuar con la demostración.');return;}
    }
    // Nunca se almacena la contraseña. Solo se guarda el correo opcionalmente.
    try{if(mode==='login'&&document.getElementById('rememberMe').checked)localStorage.setItem('rutaclara_login_email',address);else if(mode==='login')localStorage.removeItem('rutaclara_login_email');sessionStorage.setItem('rutaclara_demo_session',JSON.stringify({email:address,mode:mode,at:Date.now()}));}catch(e){}
    gate.classList.add('auth-exit');gate.setAttribute('aria-hidden','true');document.body.classList.remove('site-locked');gate.style.display='none';window.scrollTo({top:0,behavior:'smooth'});
  });
})();


/* Mapa cartográfico real de Cusco: los trazados son demostrativos, no líneas oficiales de buses. */
(function initCuscoMap(){
  const mapNode=document.getElementById('cuscoRealMap');
  if(!mapNode || !window.L) return;
  const places={
    sanjeronimo:{name:'San Jerónimo',coords:[-13.5447,-71.8858],note:'Distrito y zona urbana al sureste de Cusco.'},
    wanchaq:{name:'Wanchaq',coords:[-13.5237,-71.9673],note:'Zona urbana de Cusco.'},
    centro:{name:'Plaza de Armas de Cusco',coords:[-13.5164,-71.9785],note:'Centro histórico de Cusco.'},
    sansebastian:{name:'San Sebastián',coords:[-13.5319,-71.9344],note:'Zona urbana al este del centro.'},
    aeropuerto:{name:'Aeropuerto Alejandro Velasco Astete',coords:[-13.5357,-71.9388],note:'Aeropuerto de Cusco.'}
  };
  const map=L.map(mapNode,{scrollWheelZoom:false,zoomControl:true}).setView([-13.525,-71.956],12);
  const tileAttribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors &copy; <a href="https://www.esri.com/" target="_blank" rel="noopener">Esri</a>';
  // Proveedores públicos sin clave API. Evitamos CARTO, que en esta web está
  // devolviendo mosaicos "API KEY REQUIRED". Esri ofrece mapas base públicos.
  const streetTiles=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',{
    maxZoom:19,attribution:tileAttribution,crossOrigin:true
  });
  const topoTiles=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',{
    maxZoom:19,attribution:tileAttribution,crossOrigin:true
  });
  let activeTiles=streetTiles, fallbackStarted=false;
  activeTiles.addTo(map);
  activeTiles.on('tileerror',()=>{
    if(!fallbackStarted){
      fallbackStarted=true;
      if(map.hasLayer(streetTiles)){map.removeLayer(streetTiles);topoTiles.addTo(map);activeTiles=topoTiles;}
    }
  });
  const layerToggle=document.getElementById('mapLayerToggle');
  if(layerToggle){layerToggle.addEventListener('click',()=>{
    const useTopo=activeTiles===streetTiles;
    map.removeLayer(activeTiles);activeTiles=useTopo?topoTiles:streetTiles;activeTiles.addTo(map);
    layerToggle.setAttribute('aria-pressed',String(useTopo));
    layerToggle.textContent=useTopo?'Mapa topográfico activo':'Mapa de calles';
  });}
  const markers={};
  Object.entries(places).forEach(([id,p])=>{
    const icon=L.divIcon({className:'',html:'<div class="rc-marker"><span>⌖</span></div>',iconSize:[32,38],iconAnchor:[16,34],popupAnchor:[0,-32]});
    markers[id]=L.marker(p.coords,{icon,title:p.name,alt:p.name}).addTo(map).bindPopup('<b>'+p.name+'</b><br>'+p.note);
  });
  let route=null, routeDots=[];
  function clearRoute(){if(route){map.removeLayer(route);route=null;}routeDots.forEach(x=>map.removeLayer(x));routeDots=[];}
  function showRoute(){
    const origin=document.getElementById('mapOrigin').value;
    const destination=document.getElementById('mapDestination').value;
    const feedback=document.getElementById('routeFeedback');
    if(origin===destination){
      markers[origin].openPopup();map.flyTo(places[origin].coords,14,{duration:1.1});
      if(feedback){feedback.classList.add('has-route');feedback.innerHTML='<span class="feedback-icon">⌖</span><div><b>'+places[origin].name+'</b><p>Elegiste el mismo punto como origen y destino. Cambia uno de los dos para visualizar un recorrido.</p></div><span class="feedback-tag">DEMO</span>'; }
      return;
    }
    clearRoute();
    const a=places[origin],b=places[destination];
    // Línea entre coordenadas reales; no sigue calles ni equivale a una ruta de transporte validada.
    route=L.polyline([a.coords,b.coords],{color:'#42e8e0',weight:4,opacity:.95,dashArray:'9 10',lineCap:'round'}).addTo(map);
    routeDots.push(L.circleMarker(a.coords,{radius:7,color:'#071326',weight:3,fillColor:'#42e8e0',fillOpacity:1}).addTo(map));
    routeDots.push(L.circleMarker(b.coords,{radius:7,color:'#071326',weight:3,fillColor:'#ff8caa',fillOpacity:1}).addTo(map));
    map.fitBounds(L.latLngBounds(a.coords,b.coords).pad(.28),{animate:true,duration:1.2,maxZoom:14});
    markers[origin].openPopup();
    const path=route.getElement(); if(path){path.style.strokeDasharray='9 10';path.style.animation='rcRouteFlow 1.4s linear infinite';}
    if(feedback){
      const rad=v=>v*Math.PI/180;
      const dLat=rad(b.coords[0]-a.coords[0]),dLon=rad(b.coords[1]-a.coords[1]);
      const h=Math.sin(dLat/2)**2+Math.cos(rad(a.coords[0]))*Math.cos(rad(b.coords[0]))*Math.sin(dLon/2)**2;
      const km=6371*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));
      feedback.classList.remove('has-route');void feedback.offsetWidth;feedback.classList.add('has-route');
      feedback.innerHTML='<span class="feedback-icon">⌁</span><div><b>'+a.name+' <span aria-hidden="true">→</span> '+b.name+'</b><p>Separación aproximada en línea recta: '+km.toFixed(1)+' km. Este trazo es ilustrativo; no sigue calles ni indica una ruta oficial de bus.</p></div><span class="feedback-tag">DEMO</span>';
    }
  }
  const routeStyle=document.createElement('style');routeStyle.textContent='@keyframes rcRouteFlow{to{stroke-dashoffset:-38}}';document.head.appendChild(routeStyle);
  document.getElementById('mapShowRoute').addEventListener('click',showRoute);
  const heroSearch=document.getElementById('heroSearchRoute');
  if(heroSearch){heroSearch.addEventListener('click',()=>{document.getElementById('mapOrigin').value='sanjeronimo';document.getElementById('mapDestination').value='centro';document.getElementById('mapa-cusco').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});window.setTimeout(showRoute,650);});}
  document.getElementById('mapSwap').addEventListener('click',()=>{
    const origin=document.getElementById('mapOrigin'),destination=document.getElementById('mapDestination');
    const old=origin.value;origin.value=destination.value;destination.value=old;showRoute();
  });
  map.whenReady(()=>setTimeout(()=>map.invalidateSize(),250));
  if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){setTimeout(()=>map.invalidateSize(),100);observer.disconnect();}},{threshold:.1});observer.observe(mapNode);}
})();


/* Navegación de apoyo: volver arriba y mostrar avance de lectura. */
(function(){
  const btn=document.createElement('button');btn.id='scrollTopButton';btn.type='button';btn.setAttribute('aria-label','Volver al inicio');btn.title='Volver al inicio';btn.textContent='↑';document.body.appendChild(btn);
  const update=()=>btn.classList.toggle('visible',window.scrollY>480);window.addEventListener('scroll',update,{passive:true});update();
  btn.addEventListener('click',()=>window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));
})();

/* Microinteracciones progresivas para las secciones informativas. */
(function(){
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Escalonar tarjetas al entrar en pantalla, sin retrasar el contenido demasiado.
  if(!reduce && 'IntersectionObserver' in window){
    const groups=['.feature-grid','.steps-list','.req-grid'];
    groups.forEach(selector=>document.querySelectorAll(selector).forEach(group=>{
      const children=Array.from(group.children);
      children.forEach((el,i)=>{el.style.transitionDelay=(i*65)+'ms';});
      const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
        if(entry.isIntersecting){entry.target.classList.add('motion-in');io.unobserve(entry.target);}
      }),{threshold:.12});
      io.observe(group);
    }));
  }
  // Realce sutil del enlace activo de navegación al desplazarse.
  const nav=document.querySelector('header.top');
  const onScroll=()=>{if(nav)nav.classList.toggle('scrolled',window.scrollY>20);};
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();
})();

/* Acabado interactivo adicional: progreso de lectura y reflejo sutil en tarjetas.
   No modifica contenido ni funciones existentes; se degrada sin JS/Pointer Events. */
(()=>{
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const progress = document.createElement('div');
  progress.className = 'rc-scroll-progress';
  progress.setAttribute('aria-hidden','true');
  progress.innerHTML = '<span></span>';
  document.body.appendChild(progress);
  const bar = progress.firstElementChild;
  let scheduled = false;
  const updateProgress = () => {
    const root = document.documentElement;
    const max = root.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    bar.style.transform = `scaleX(${ratio})`;
    scheduled = false;
  };
  window.addEventListener('scroll',()=>{
    if(!scheduled){scheduled=true;window.requestAnimationFrame(updateProgress);}
  },{passive:true});
  window.addEventListener('resize',updateProgress,{passive:true});
  updateProgress();
  if(!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches){
    document.querySelectorAll('.feature-card,.req-card,.road-item').forEach(card=>{
      card.addEventListener('pointermove',event=>{
        const rect=card.getBoundingClientRect();
        card.style.setProperty('--rc-x',`${event.clientX-rect.left}px`);
        card.style.setProperty('--rc-y',`${event.clientY-rect.top}px`);
      },{passive:true});
    });
  }
})();

/* Motion Plus: scroll reveals para toda la página, zoom suave y profundidad en escritorio. */
(()=>{
  const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if(reduce) return;
  const html=document.documentElement;
  if(!('IntersectionObserver' in window)) return;
  // Marca la página solo después de tener el observador disponible: sin fallos de contenido oculto.
  const targets=[...document.querySelectorAll('main section, body > section, .stats-strip, .compare-table, .real-map-shell, .apk-trust-card, footer')];
  targets.forEach((el,index)=>{
    if(el.matches('.hero')) return;
    el.classList.add('rc-reveal');
    if(el.matches('.real-map-shell,.phones-row,.compare-table,.stats-strip'))el.classList.add('rc-zoom-reveal');
    el.style.setProperty('--rc-delay',`${Math.min(index%4,3)*70}ms`);
  });
  html.classList.add('rc-motion-ready');
  const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('rc-in-view');io.unobserve(entry.target);}
  }),{threshold:.12,rootMargin:'0px 0px -5% 0px'});
  targets.forEach(el=>{if(el.classList.contains('rc-reveal'))io.observe(el)});
  // Reflejo ambiental que sigue el cursor, solo en equipos con ratón.
  if(window.matchMedia('(hover: hover) and (pointer: fine)').matches){
    const glow=document.createElement('div');glow.className='rc-pointer-glow';glow.setAttribute('aria-hidden','true');document.body.appendChild(glow);
    let raf=0,lastX=0,lastY=0;
    window.addEventListener('pointermove',e=>{lastX=e.clientX;lastY=e.clientY;if(!raf)raf=requestAnimationFrame(()=>{glow.style.left=lastX+'px';glow.style.top=lastY+'px';glow.classList.add('active');raf=0})},{passive:true});
    document.addEventListener('pointerleave',()=>glow.classList.remove('active'));
  }
  // Profundidad parallax ligera en el panel principal; no interfiere con controles ni móvil.
  const hero=document.querySelector('.hero');
  const visual=hero?.querySelector('.map-panel');
  if(hero&&visual&&window.matchMedia('(hover: hover) and (pointer: fine)').matches){
    let frame=0;hero.addEventListener('pointermove',e=>{
      if(frame)return;frame=requestAnimationFrame(()=>{const r=hero.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5;const y=(e.clientY-r.top)/r.height-.5;visual.style.transform=`translate3d(${x*7}px,${y*6}px,0) rotateX(${-y*1.2}deg) rotateY(${x*1.5}deg)`;frame=0});
    },{passive:true});
    hero.addEventListener('pointerleave',()=>{visual.style.transform='';});
  }
})();

/* Motion Plus 2 — animación palabra a palabra, párrafos y hover en todas las secciones. */
(()=>{
  const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if(reduce) return;
  const finePointer=window.matchMedia?.('(hover:hover) and (pointer:fine)').matches;
  // Divide únicamente los nodos de texto: conserva enlaces, negritas y spans de marca.
  const splitWords=(root)=>{
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(node){
      if(!node.nodeValue.trim() || !node.parentElement) return NodeFilter.FILTER_REJECT;
      if(node.parentElement.closest('script,style,button,svg,.rc-word,.map-coordinate,.real-map-topbar,.phone-screen')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }});
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(node=>{
      const text=node.nodeValue;const frag=document.createDocumentFragment();
      text.split(/(\s+)/).forEach(part=>{
        if(!part) return;
        if(/^\s+$/.test(part)){frag.appendChild(document.createTextNode(part));return;}
        const span=document.createElement('span');span.className='rc-word';span.textContent=part;span.style.setProperty('--word-delay',`${Math.min((frag.childNodes.length/2)|0,12)*32}ms`);frag.appendChild(span);
      });node.parentNode.replaceChild(frag,node);
    });
  };
  const wordTargets=document.querySelectorAll('main h1,main h2,main h3,body > section h1,body > section h2,body > section h3');
  wordTargets.forEach(splitWords);
  // Entradas de textos en cascada para que el movimiento se note al bajar por cada sección.
  const copyTargets=document.querySelectorAll('main section p,body > section p,.eyebrow,.map-live-chip,.stat .num,.phone-caption,.road-tag,.faq-q,.band-sec .primary,.form-card label');
  copyTargets.forEach((el,i)=>{el.classList.add('rc-copy-reveal');el.style.setProperty('--copy-delay',`${(i%5)*65}ms`)});
  const wordEls=document.querySelectorAll('.rc-word');
  if('IntersectionObserver' in window){
    const wordIO=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('rc-word-in');wordIO.unobserve(entry.target)}
    }),{threshold:.15,rootMargin:'0px 0px -3% 0px'});
    wordEls.forEach(el=>wordIO.observe(el));
    const copyIO=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('rc-copy-in');copyIO.unobserve(entry.target)}
    }),{threshold:.12,rootMargin:'0px 0px -3% 0px'});
    copyTargets.forEach(el=>copyIO.observe(el));
  }else{wordEls.forEach(el=>el.classList.add('rc-word-in'));copyTargets.forEach(el=>el.classList.add('rc-copy-in'))}
  // Reflejo que sigue la posición del ratón en tarjetas y elementos visuales relevantes.
  if(finePointer){
    const hoverTargets=document.querySelectorAll('.feature-card,.req-card,.road-item,.phone,.phone.big,.faq-item,.form-card,.step-card,.install-card,.stat,.download-card,.legal-detail,.search-card,.rt');
    hoverTargets.forEach(el=>el.addEventListener('pointermove',e=>{
      const r=el.getBoundingClientRect();el.style.setProperty('--rc-x',`${e.clientX-r.left}px`);el.style.setProperty('--rc-y',`${e.clientY-r.top}px`);
    },{passive:true}));
  }
})();


/* Motion Impact: zoom de los dos showcases y entrada escalonada de las seis tarjetas. */
(()=>{
  const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const spotlights=[...document.querySelectorAll('.spotlight')];
  const cards=[...document.querySelectorAll('.feature-grid .feature-card')];
  if(!('IntersectionObserver' in window)){
    spotlights.forEach(el=>el.classList.add('rc-showcase-in'));
    cards.forEach(el=>el.classList.add('rc-card-seen'));
    return;
  }
  const showIO=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('rc-showcase-in');showIO.unobserve(entry.target)}
  }),{threshold:.22,rootMargin:'0px 0px -8% 0px'});
  spotlights.forEach(el=>showIO.observe(el));
  const cardIO=new IntersectionObserver(entries=>{
    const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
    visible.forEach((entry,i)=>{
      entry.target.style.animationDelay=(i*.13)+'s';
      entry.target.classList.add('rc-card-seen');
      cardIO.unobserve(entry.target);
    });
  },{threshold:.18,rootMargin:'0px 0px -4% 0px'});
  cards.forEach(el=>cardIO.observe(el));
  // Interpolated cursor hotspot, independent of external libraries.
  if(!reduce && window.matchMedia?.('(hover:hover) and (pointer:fine)').matches){
    document.querySelectorAll('.feature-grid .feature-card').forEach(card=>card.addEventListener('pointermove',e=>{
      const r=card.getBoundingClientRect();
      card.style.setProperty('--rc-x',(e.clientX-r.left)+'px');
      card.style.setProperty('--rc-y',(e.clientY-r.top)+'px');
    },{passive:true}));
  }
})();


/* RutaClara Flow: activa el ambiente y las entradas en TODAS las secciones desde el primer showcase. */
(()=>{
 const firstSpot=document.querySelector('.spotlight')?.closest('section');
 if(!firstSpot)return;
 const sections=[...document.querySelectorAll('body > section')];
 const start=sections.indexOf(firstSpot);
 const flowSections=sections.slice(start);
 flowSections.forEach((section,si)=>{
   section.classList.add('rc-flow-section');
   // Actualiza la luz relativa a la sección, con variables CSS para una transición suave.
   if(window.matchMedia?.('(hover:hover) and (pointer:fine)').matches){
     section.addEventListener('pointermove',e=>{
       const r=section.getBoundingClientRect();
       section.style.setProperty('--rc-mx',`${Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100))}%`);
       section.style.setProperty('--rc-my',`${Math.max(0,Math.min(100,(e.clientY-r.top)/r.height*100))}%`);
       section.classList.add('rc-cursor-active');
     },{passive:true});
     section.addEventListener('pointerleave',()=>section.classList.remove('rc-cursor-active'));
   }
 });
 const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 if(reduce)return;
 const targets=[];
 flowSections.forEach(section=>section.querySelectorAll('.wrap > .eyebrow,.wrap > h2,.wrap > h3,.wrap > .lede,.wrap > p,.spotlight,.feature-card,.compare-table,.road-item,.step-card,.install-card,.download-card,.faq-item,.form-card,.legal-detail,.contact-card,.req-card').forEach(el=>{
   if(!targets.includes(el)){el.classList.add('rc-flow-item');el.style.setProperty('--rc-flow-delay',`${(targets.length%4)*75}ms`);targets.push(el)}
 }));
 if(!('IntersectionObserver' in window)){targets.forEach(el=>el.classList.add('rc-flow-enter'));return;}
 const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
   if(entry.isIntersecting){entry.target.classList.add('rc-flow-enter');io.unobserve(entry.target)}
 }),{threshold:.12,rootMargin:'0px 0px -4% 0px'});
 targets.forEach(el=>io.observe(el));
})();
