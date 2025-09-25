(function(){
    // ===== Persistent checklist state =====
    const STORAGE_KEY='phan-dashboard-state-v2';
    const UI_KEY='phan-dashboard-ui-v1';
    const THEME_KEY='phan-dashboard-theme';
    let state = loadState(); // { issueId: true }

    // ===== State =====
    let raw=[],filtered=[],byFile=new Map();
    let activeFile=null,sortKey='severity',sortDir='asc';
    const $=q=>document.querySelector(q),$$=q=>Array.from(document.querySelectorAll(q));
    const tbody=$('#tbody'),fileList=$('#fileList'),search=$('#search'),summary=$('#summary'),activeFileHint=$('#activeFileHint');
    const drop=$('#dropzone'),fileInput=$('#fileInput'),toast=$('#toast');
    const themeToggle=$('#themeToggle');
    const onlyOpen=$('#onlyOpen'), exportStateBtn=$('#exportState'), resetStateBtn=$('#resetState');

    // ===== Utils =====
    const sevOrder={critical:0,high:1,normal:2,low:3,info:4};
    const sevClass=s=>['critical','high','normal','low','info'].includes(String(s).toLowerCase())?String(s).toLowerCase():'info';
    const fmtSev=s=>({critical:'Critique',high:'Élevée',normal:'Normal',low:'Faible',info:'Info'})[sevClass(s)];
    const escapeHtml=s=>(s+'').replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
    const cleanAnsi=s=>String(s||'').replace(/\u001b\[[0-9;]*m/gi,'');
    const mapSeverity=v=>{if(typeof v==='number')return v>=10?'critical':(v>=5?'normal':'info');const t=String(v||'info').toLowerCase();if(/^(critical|high|10)$/.test(t))return'critical';if(/^(normal|medium|moderate|5)$/.test(t))return'normal';return'info';};
    function toastMsg(msg){toast.textContent=msg;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2200);}    
    function footerMsg(msg){$('#footer').textContent=msg;}
    function issueId(it){ return btoa(unescape(encodeURIComponent([it.file,it.line,it.type,it.message].join('|')))); }
    function progressFor(items){ let t=items.length, d=0; for(const it of items){ if(state[issueId(it)]===true) d++; } return [d,t]; }
    function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    function loadState(){ try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')||{}; }catch(_){ return {}; } }
    function saveUi(){
        const sev = $$('.sevFilter').map(c=>({v:c.value,checked:c.checked}));
        const ui = { sev, search: search.value||'', onlyOpen: !!onlyOpen.checked, sortKey, sortDir, activeFile };
        try{ localStorage.setItem(UI_KEY, JSON.stringify(ui)); }catch(_){ }
    }
    function loadUi(){
        try{ return JSON.parse(localStorage.getItem(UI_KEY)||'null'); }catch(_){ return null; }
    }
    function applySavedUi(){
        const ui = loadUi(); if(!ui) return;
        if(Array.isArray(ui.sev)){
            for(const c of $$('.sevFilter')){
                const f = ui.sev.find(x=>x.v===c.value);
                if(f) c.checked = !!f.checked;
            }
        }
        search.value = ui.search||'';
        onlyOpen.checked = !!ui.onlyOpen;
        sortKey = ui.sortKey||sortKey; sortDir = ui.sortDir||sortDir;
        activeFile = ui.activeFile||null;
    }
    function setTheme(theme){
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
        const isDark = theme==='dark';
        if(themeToggle){ themeToggle.setAttribute('aria-pressed', String(isDark)); themeToggle.textContent = isDark?'☀️':'🌙'; }
    }
    function initTheme(){
        const saved = localStorage.getItem(THEME_KEY);
        if(saved){ setTheme(saved); return; }
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark?'dark':'light');
    }
    function shortPath(p){
        p=String(p||''); const max=56; if(p.length<=max) return p;
        const parts=p.split(/[/\\]/); const file=parts.pop(); const dir=parts.join('/');
        const keep=Math.max(8, Math.floor((max-file.length-3)/2));
        const head=dir.slice(0,keep); const tail=dir.slice(-keep);
        return `${head}…/${file}`.replace(/\/{2,}/g,'/');
    }

    // ===== IDE Links =====
    function ideLinks(file,line){
        const f = encodeURIComponent(file);
        const ln = Number(line)||1;
        const vs = `vscode://file/${f}:${ln}`;      // VS Code
        const codium = `vscodium://file/${f}:${ln}`; // VSCodium
        const phpstorm = `phpstorm://open?file=${encodeURIComponent(file)}&line=${ln}`; // PhpStorm
        const netbeans = `netbeans://open/?f=${encodeURIComponent(file)}&line=${ln}`; // NetBeans (selon assoc.)
        return {vs,codium,phpstorm,netbeans};
    }

    // ===== Loaders =====
    $('#loadJsonBtn').onclick=()=>fetch('phan-report.json').then(r=>r.text()).then(processText).catch(()=>toastMsg('Aucun phan-report.json trouvé'));
    function loadFromFile(file){ const reader=new FileReader(); reader.onload=()=>{ try{ processText(reader.result); } catch(e){ toastMsg('Erreur: '+e.message); } }; reader.readAsText(file); }
    function processText(txt){ const t=String(txt||'').trim(); if(!t){ footerMsg('Fichier vide'); return; } try{ t.startsWith('<')?ingest(parseCheckstyle(t)):ingest(JSON.parse(t)); } catch(e){ footerMsg('Erreur parsing: '+e.message); } }
    function parseCheckstyle(xml){ const dom=new DOMParser().parseFromString(xml,'application/xml'); if(dom.querySelector('parsererror')) throw new Error('XML invalide'); const issues=[]; dom.querySelectorAll('file').forEach(f=>{const name=f.getAttribute('name')||'unknown'; f.querySelectorAll('error').forEach(err=>issues.push({file:name,line:Number(err.getAttribute('line')||0),severity:err.getAttribute('severity')||'info',type:err.getAttribute('source')||'Issue',message:err.getAttribute('message')||''}));}); return issues; }

    // ===== Ingest =====
    function ingest(json){
        const arr=Array.isArray(json)?json:(json?.issues||[]);
        raw=arr.map(x=>({
            severity:mapSeverity(x.severity??x.level??'info'),
            type:x.type||x.check_name||x.rule||'Issue',
            file:x.file||x?.location?.path||x.path||'unknown',
            line:Number(x.line??x?.location?.lines?.begin??x.begin??0),
            message:cleanAnsi(x.message||x.description||x.text||''),
        }));
        byFile=new Map();
        for(const it of raw){ if(!byFile.has(it.file)) byFile.set(it.file,[]); byFile.get(it.file).push(it); }
        activeFile=null;
        renderSidebar();
        applyFilters();
        saveUi();
        footerMsg('Rapport chargé');
    }

    // ===== Sidebar =====
    function renderSidebar(){
        const entries=[...byFile.entries()].sort((a,b)=>b[1].length-a[1].length);
        fileList.innerHTML='';
        for(const [file,items] of entries){
            const [done,total]=progressFor(items);
            const div=document.createElement('div');
            div.className='file'+(activeFile===file?' active':'');
            div.title=file;
            div.innerHTML=`<span class="mono cell-path">${escapeHtml(shortPath(file))}</span>
                 <span class="count">${items.length}</span>
                 <span class="progress">${done}/${total}</span>`;
            div.onclick=()=>{ activeFile=(activeFile===file? null:file); applyFilters(); renderSidebar(); };
            fileList.appendChild(div);
        }
        summary.textContent=`${byFile.size} fichiers • ${raw.length} issues`;
        activeFileHint.textContent=activeFile?`Filtré sur: ${activeFile}`:'';
        updateSeverityChipCounts();
    }

    // ===== Filters & table =====
    function applyFilters(){
        const allowed=new Set($$('.sevFilter').filter(c=>c.checked).map(c=>c.value));
        const q=(search.value||'').toLowerCase();
        filtered = raw.filter(it => allowed.has(sevClass(it.severity)) && (!activeFile || it.file===activeFile) && (q===''||(it.message+it.type+it.file).toLowerCase().includes(q)) && (!onlyOpen.checked || state[issueId(it)]!==true));
        sortAndRender();
        saveUi();
    }

    function sortAndRender(){
        const k=sortKey,dir=sortDir==='asc'?1:-1;
        filtered.sort((a,b)=>{let va=a[k],vb=b[k];if(k==='severity'){va=sevOrder[sevClass(va)]??99;vb=sevOrder[sevClass(vb)]??99;}if(k==='line'){va=Number(va)||0;vb=Number(vb)||0;}if(va<vb)return-1*dir;if(va>vb)return 1*dir;return 0;});
        tbody.innerHTML=filtered.map(r=>{
            const id = issueId(r);
            const checked = state[id]===true;
            const rowClass = checked? 'done' : '';
            const links = ideLinks(r.file, r.line||1);
            const copyVal = `${r.file}:${r.line||1}`;
            const fileCell = `<span class=\"cell-path\" title=\"${escapeHtml(r.file)}\">${escapeHtml(shortPath(r.file))}</span>
                    <span class=\"path-tools\">
                      <button class=\"btn-mini\" data-copy=\"${escapeHtml(copyVal)}\">Copier</button>
                      <a class=\"btn-mini\" href=\"${links.vs}\" title=\"Ouvrir dans VS Code\">VSCode</a>
                      <a class=\"btn-mini\" href=\"${links.codium}\" title=\"Ouvrir dans VSCodium\">VSCodium</a>
                      <a class=\"btn-mini\" href=\"${links.phpstorm}\" title=\"Ouvrir dans PhpStorm\">PhpStorm</a>
                      <a class=\"btn-mini\" href=\"${links.netbeans}\" title=\"Ouvrir dans NetBeans\">NetBeans</a>
                    </span>`;
            return `<tr class="${rowClass}" data-id="${id}">
    <td><input type="checkbox" data-id="${id}" ${checked?'checked':''}></td>
    <td><span class="sev ${sevClass(r.severity)}">${fmtSev(r.severity)}</span></td>
    <td class="mono">${escapeHtml(r.type)}</td>
    <td class="mono">${fileCell}</td>
    <td class="mono">${r.line||''}</td>
    <td class="wrap">${escapeHtml(r.message)}</td>
  </tr>`;
        }).join('');

        // wire checkboxes & copy buttons
        tbody.querySelectorAll('input[type="checkbox"]').forEach(cb=>{
            cb.addEventListener('change',()=>{ state[cb.dataset.id]=cb.checked; saveState(); applyFilters(); renderSidebar(); });
        });
        tbody.querySelectorAll('button[data-copy]').forEach(btn=>{
            btn.addEventListener('click',()=>{ navigator.clipboard.writeText(btn.getAttribute('data-copy')); toastMsg('Copié: '+btn.getAttribute('data-copy')); });
        });
        // row click toggles
        tbody.querySelectorAll('tr').forEach(tr=>{
            tr.addEventListener('click',e=>{
                if((e.target.closest('.path-tools'))||(e.target.tagName==='INPUT')||(e.target.tagName==='A')||(e.target.tagName==='BUTTON')) return;
                const id = tr.getAttribute('data-id');
                const cb = tr.querySelector('input[type="checkbox"]');
                if(!id||!cb) return;
                cb.checked = !cb.checked;
                state[id]=cb.checked; saveState(); applyFilters(); renderSidebar();
            });
        });
    }

    // ===== Events =====
    $('#clearFilter').onclick=()=>{activeFile=null;applyFilters();renderSidebar();};
    fileInput.addEventListener('change', e=>{ const f=e.target.files?.[0]; if(f) loadFromFile(f); });
    search.addEventListener('input', applyFilters);
    $$('.sevFilter').forEach(c=>c.addEventListener('change', applyFilters));
    $$('thead th').forEach(th=>{
        const k=th.dataset.k; if(k){ th.setAttribute('role','button'); th.setAttribute('tabindex','0'); }
        th.addEventListener('click',()=>{const key=th.dataset.k;if(!key)return;if(sortKey===key)sortDir=sortDir==='asc'?'desc':'asc';else{sortKey=key;sortDir='asc';}updateSortIndicators(); sortAndRender(); saveUi();});
        th.addEventListener('keydown',e=>{ if((e.key==='Enter'||e.key===' ') && th.dataset.k){ e.preventDefault(); th.click(); }});
    });
    function updateSortIndicators(){
        $$('thead th').forEach(th=>{ const k=th.dataset.k; if(!k){ th.removeAttribute('aria-sort'); return; } const s=(k===sortKey)?sortDir:'none'; th.setAttribute('aria-sort', s==='none'?'none':s); });
    }
    drop.addEventListener('click',()=>fileInput.click());
    drop.setAttribute('role','button'); drop.setAttribute('tabindex','0'); drop.setAttribute('aria-label','Importer un rapport Phan');
    ['dragover','dragleave'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.toggle('dragover',ev==='dragover');}));
    drop.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('dragover');const f=e.dataTransfer.files?.[0];if(f)loadFromFile(f);});
    drop.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); fileInput.click(); }});
    onlyOpen.addEventListener('change',applyFilters);
    exportStateBtn.addEventListener('click',()=>{ const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='phan-dashboard-state.json'; a.click(); URL.revokeObjectURL(url); });
    resetStateBtn.addEventListener('click',()=>{ if(confirm('Réinitialiser toutes les cases cochées ?')){ state={}; saveState(); applyFilters(); renderSidebar(); toastMsg('État réinitialisé'); } });
    if(themeToggle){ themeToggle.addEventListener('click',()=>{ const next = (document.documentElement.getAttribute('data-theme')==='dark')?'light':'dark'; setTheme(next); }); }

    // severity counts on chips
    function updateSeverityChipCounts(){
        const counts={critical:0,high:0,normal:0,low:0,info:0};
        for(const it of raw){ counts[sevClass(it.severity)]++; }
        $$('.sevFilter').forEach(c=>{
            const label=c.closest('label'); if(!label) return;
            let badge=label.querySelector('.count');
            if(!badge){ badge=document.createElement('span'); badge.className='count'; label.appendChild(badge); }
            badge.textContent=String(counts[c.value]||0);
        });
    }

    // Initialize
    initTheme();
    applySavedUi();
    updateSortIndicators();
    applyFilters();
    renderSidebar();
})();


