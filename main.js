const state = {sites: [], filtered: []};

async function loadSites(){
  const res = await fetch('sites.json');
  state.sites = await res.json();
  state.sites = state.sites.filter(s => s && s.name && isFinite(+s.latitude) && isFinite(+s.longitude));
  state.sites.sort((a,b)=>a.name.localeCompare(b.name));
  state.filtered = state.sites;
  render();
}

function render(){
  const list = document.getElementById('list');
  const count = document.getElementById('count');
  count.textContent = `${state.filtered.length} site(s)`;
  list.innerHTML = '';
  const frag = document.createDocumentFragment();
  state.filtered.slice(0,500).forEach(s=>{
    const card = document.createElement('div');
    card.className = 'card';

    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = s.name;

    const coords = document.createElement('div');
    coords.className = 'coords';
    coords.textContent = `${(+s.latitude).toFixed(6)}, ${(+s.longitude).toFixed(6)}`;

    const actions = document.createElement('div');
    actions.className = 'actions';

    const navBtn = document.createElement('a');
    navBtn.className = 'btn';
    navBtn.textContent = 'Navigate';
    navBtn.href = mapDeepLink(+s.latitude, +s.longitude, s.name);
    navBtn.target = '_blank';
    navBtn.rel = 'noopener';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'small';
    copyBtn.textContent = 'Copy coords';
    copyBtn.onclick = ()=>{
      navigator.clipboard?.writeText(`${s.latitude},${s.longitude}`);
      copyBtn.textContent = 'Copied!';
      setTimeout(()=>copyBtn.textContent='Copy coords',1200);
    }

    actions.append(navBtn, copyBtn);
    card.append(name, coords, actions);
    frag.append(card);
  });
  list.append(frag);
}

function mapDeepLink(lat, lon, label=''){ 
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const q = encodeURIComponent(`${lat},${lon}${label? ' ('+label+')':''}`);
  if(isIOS){
    return `http://maps.apple.com/?daddr=${lat},${lon}&q=${q}`;
  } else {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&destination_place_id=&travelmode=driving`;
  }
}

function fuzzyIncludes(text, query){
  text = (text||'').toLowerCase();
  query = (query||'').toLowerCase();
  // simple subsequence match
  let i=0; for(const ch of text){ if(ch===query[i]) i++; if(i===query.length) return true; }
  return text.includes(query);
}

function onSearch(){
  const q = document.getElementById('q').value.trim();
  if(!q){ state.filtered = state.sites; render(); return; }
  state.filtered = state.sites.filter(s=> fuzzyIncludes(s.name, q));
  render();
}

window.addEventListener('load', ()=>{
  loadSites();
  document.getElementById('q').addEventListener('input', onSearch);
  if('serviceWorker' in navigator){ navigator.serviceWorker.register('sw.js'); }
});
