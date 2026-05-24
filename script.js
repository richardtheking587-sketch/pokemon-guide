const POKE_API = 'https://pokeapi.co/api/v2';
let allPokemon = [];
let compareSlots = { 1: null, 2: null };
let activeSlot = 1;

const generationRanges = {
    1: { start: 1, end: 151, name: "Kanto" },
    2: { start: 152, end: 251, name: "Johto" },
    3: { start: 252, end: 386, name: "Hoenn" },
    4: { start: 387, end: 493, name: "Sinnoh" },
    5: { start: 494, end: 649, name: "Unova" },
    6: { start: 650, end: 721, name: "Kalos" },
    7: { start: 722, end: 809, name: "Alola" },
    8: { start: 810, end: 905, name: "Galar" },
    9: { start: 906, end: 1025, name: "Paldea" }
};

const statTranslations = {
    'hp': 'HP', 'attack': 'Ataque', 'defense': 'Defesa',
    'special-attack': 'Atq. Especial', 'special-defense': 'Def. Especial', 'speed': 'Velocidade'
};

document.addEventListener('DOMContentLoaded', ( ) => {
    loadPokemon();
    setupEvents();
});

function setupEvents() {
    const searchInput = document.getElementById('searchInput');
    const genFilter = document.getElementById('generationFilter');
    if (searchInput) searchInput.addEventListener('input', filterPokemon);
    if (genFilter) genFilter.addEventListener('change', filterPokemon);
}

function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    const targetTab = document.getElementById(`${tab}-tab`);
    const targetBtn = document.getElementById(`btn-${tab}`);
    
    if (targetTab) targetTab.classList.add('active');
    if (targetBtn) targetBtn.classList.add('active');

    if (tab === 'pokemon') {
        document.getElementById('searchInput').value = '';
        document.getElementById('generationFilter').value = '';
        filterPokemon();
    }

    if (tab === 'favorites') updateFavoritesGrid();
    if (tab === 'items') loadItems();
    if (tab === 'pokeballs') loadPokeballs();
}

async function loadPokemon() {
    try {
        const response = await fetch(`${POKE_API}/pokemon?limit=1025`);
        const data = await response.json();
        allPokemon = data.results.map((p, index) => ({
            id: index + 1, name: p.name,
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${index + 1}.png`,
            shiny: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${index + 1}.png`,
            types: [], stats: []
        } ));
        filterPokemon();
        loadDetailedData();
    } catch (e) { console.error(e); }
}

async function loadDetailedData() {
    const batchSize = 50;
    for (let i = 0; i < allPokemon.length; i += batchSize) {
        const batch = allPokemon.slice(i, i + batchSize);
        await Promise.all(batch.map(p => 
            fetch(`${POKE_API}/pokemon/${p.id}`).then(res => res.json()).then(data => {
                const poke = allPokemon.find(item => item.id === data.id);
                if (poke) { poke.types = data.types.map(t => t.type.name); poke.stats = data.stats; }
            })
        ));
    }
}

function filterPokemon() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const gen = document.getElementById('generationFilter').value;
    const filtered = allPokemon.filter(p => {
        const mSearch = p.name.includes(term) || String(p.id).includes(term);
        const mGen = !gen || (p.id >= generationRanges[gen].start && p.id <= generationRanges[gen].end);
        return mSearch && mGen;
    });
    const grid = document.getElementById('pokemonGrid');
    if (grid) {
        grid.innerHTML = filtered.map(p => `
            <div class="pokemon-card" onclick="showDetail(${p.id})">
                <div class="pokemon-image"><img src="${p.image}" loading="lazy"></div>
                <div class="pokemon-name">${p.name.toUpperCase()}</div>
                <div class="pokemon-id">#${String(p.id).padStart(4, '0')}</div>
            </div>
        `).join('');
    }
}

async function showDetail(id) {
    const p = allPokemon.find(poke => poke.id === id);
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('detailContent');
    if (!modal || !content) return;
    content.innerHTML = '<div class="loading">Sincronizando Dados...</div>';
    modal.classList.add('show');
    try {
        const species = await fetch(`${POKE_API}/pokemon-species/${id}`).then(r => r.json());
        let desc = species.flavor_text_entries.find(e => e.language.name === 'pt' || e.language.name === 'en')?.flavor_text || "";
        
        const evoData = await fetch(species.evolution_chain.url).then(r => r.json());
        const evolutions = [];
        let curr = evoData.chain;
        while(curr) {
            const eid = curr.species.url.split('/').filter(Boolean).pop();
            evolutions.push({ id: eid, name: curr.species.name });
            curr = curr.evolves_to[0];
        }

        if (!p.types.length) {
            const d = await fetch(`${POKE_API}/pokemon/${id}`).then(res => res.json());
            p.types = d.types.map(t => t.type.name); p.stats = d.stats;
        }

        const typeData = await fetch(`${POKE_API}/type/${p.types[0] || 'normal'}`).then(r => r.json());
        const weaknesses = typeData.damage_relations.double_damage_from.map(t => t.name);
        const strengths = typeData.damage_relations.double_damage_to.map(t => t.name);

        content.innerHTML = `
            <img id="modal-img" src="${p.image}" style="width:180px">
            <h2 class="pokemon-name">${p.name.toUpperCase()}</h2>
            <div class="types-container">${p.types.map(t => \`<span class="type-badge \${t}">\${t.toUpperCase()}</span>\`).join('')}</div>
            
            <div class="detail-description" style="color:#eee; font-size:0.9em; margin:15px 0; line-height:1.6; background:rgba(0,0,0,0.3); padding:10px; border-radius:8px;">
                \${typeof translateDescription === 'function' ? translateDescription(desc) : desc.replace(/\\f/g, ' ')}
            </div>

            <div class="battle-info" style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin:15px 0; font-size:0.8em;">
                <div style="background:#222; padding:10px; border-radius:8px;">
                    <strong style="color:#ff4422">FRAQUEZAS</strong>  

                    \${weaknesses.map(t => \`<span class="type-badge \${t}" style="padding:2px 5px; font-size:0.7em">\${t.toUpperCase()}</span>\`).join(' ')}
                </div>
                <div style="background:#222; padding:10px; border-radius:8px;">
                    <strong style="color:#77cc55">VANTAGENS</strong>  

                    \${strengths.map(t => \`<span class="type-badge \${t}" style="padding:2px 5px; font-size:0.7em">\${t.toUpperCase()}</span>\`).join(' ')}
                </div>
            </div>

            <div class="evolution-chain" style="margin-top:20px;">
                <strong style="font-size:0.8em; color:var(--accent-gold)">LINHA EVOLUTIVA</strong>
                <div style="display:flex; justify-content:center; align-items:center; gap:10px; margin-top:10px;">
                    \${evolutions.map((evo, i) => \`
                        <div style="text-align:center">
                            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/\${evo.id}.png" style="width:50px; cursor:pointer" onclick="showDetail(\${evo.id} )">
                            <div style="font-size:0.6em">\${evo.name.toUpperCase()}</div>
                        </div>
                        \${i < evolutions.length - 1 ? '<span style="color:#444">➔</span>' : ''}
                    \`).join('')}
                </div>
            </div>

            <div class="modal-actions" style="margin-top:20px">
                <button class="action-btn" onclick="toggleShiny('\${p.image}', '\${p.shiny}')">✨ VER SHINY</button>
                <button class="action-btn" onclick="toggleFavorite(\${p.id})">⭐ FAVORITAR</button>
            </div>
        `;
    } catch (e) { content.innerHTML = "Erro ao carregar."; }
}

function toggleShiny(normal, shiny) {
    const img = document.getElementById('modal-img');
    if (img) img.src = img.src === normal ? shiny : normal;
}

function randomPokemon() { showDetail(Math.floor(Math.random() * 1025) + 1); }
function closeModal() { document.getElementById('detailModal').classList.remove('show'); }

function toggleFavorite(id) {
    let favs = JSON.parse(localStorage.getItem('pokeFavorites') || '[]');
    if (favs.includes(id)) { favs = favs.filter(f => f !== id); alert('Removido!'); }
    else { favs.push(id); alert('Adicionado!'); }
    localStorage.setItem('pokeFavorites', JSON.stringify(favs));
    updateFavoritesGrid();
}

function updateFavoritesGrid() {
    const favs = JSON.parse(localStorage.getItem('pokeFavorites') || '[]');
    const grid = document.getElementById('favoritesGrid');
    if (!grid) return;
    if (!favs.length) { grid.innerHTML = '<p style="grid-column:1/-1; color:#888;">Sem favoritos.</p>'; return; }
    grid.innerHTML = allPokemon.filter(p => favs.includes(p.id)).map(p => \`
        <div class="pokemon-card" onclick="showDetail(\${p.id})">
            <div class="pokemon-image"><img src="\${p.image}"></div>
            <div class="pokemon-name">\${p.name.toUpperCase()}</div>
        </div>
    \`).join('');
}

function openCompareSelector(slot) { activeSlot = slot; document.getElementById('compareSelectorModal').classList.add('show'); showRegions(); }
function closeCompareSelector() { document.getElementById('compareSelectorModal').classList.remove('show'); }

function showRegions() {
    document.getElementById('selectorTitle').innerText = "ESCOLHA A REGIÃO";
    document.getElementById('pokemonSelector').style.display = 'none';
    const reg = document.getElementById('regionSelector');
    reg.style.display = 'grid';
    reg.innerHTML = Object.keys(generationRanges).map(gen => \`
        <button class="selector-btn" onclick="showPokemonByRegion(\${gen})">\${generationRanges[gen].name.toUpperCase()}  
<small>Geração \${gen}</small></button>
    \`).join('');
}

function showPokemonByRegion(gen) {
    document.getElementById('selectorTitle').innerText = \`REGIÃO \${generationRanges[gen].name.toUpperCase()}\`;
    document.getElementById('regionSelector').style.display = 'none';
    const pSel = document.getElementById('pokemonSelector');
    pSel.style.display = 'grid';
    const pokes = allPokemon.filter(p => p.id >= generationRanges[gen].start && p.id <= generationRanges[gen].end);
    pSel.innerHTML = \`<button class="selector-btn" style="grid-column:1/-1" onclick="showRegions()">⬅ VOLTAR</button>\` + 
        pokes.map(p => \`<div class="mini-poke-btn" onclick="selectForCompare(\${p.id})"><img src="\${p.image}"><div style="font-size:0.7em">\${p.name.toUpperCase()}</div></div>\`).join('');
}

async function selectForCompare(id) {
    let p = allPokemon.find(poke => poke.id === id);
    if (!p.stats.length) { const d = await fetch(\`\${POKE_API}/pokemon/\${id}\`).then(res => res.json()); p.stats = d.stats; }
    compareSlots[activeSlot] = p;
    document.getElementById(\`result\${activeSlot}\`).innerHTML = \`<img src="\${p.image}" style="width:120px"><div class="pokemon-name">\${p.name.toUpperCase()}</div>\`;
    closeCompareSelector(); updateComparison();
}

function updateComparison() {
    if (!compareSlots[1] || !compareSlots[2]) return;
    const s1 = compareSlots[1].stats, s2 = compareSlots[2].stats;
    const statNames = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
    document.getElementById('comparison-stats').innerHTML = statNames.map((name, i) => {
        const v1 = s1[i].base_stat, v2 = s2[i].base_stat;
        return \`<div class="stat-row"><div class="stat-val \${v1>v2?'winner':''}">\${v1}</div><div class="stat-label">\${statTranslations[name]}</div><div class="stat-val \${v2>v1?'winner':''}">\${v2}</div></div>\`;
    }).join('') + \`<button class="action-btn" style="width:100%; margin-top:20px" onclick="battleResult()">⚔️ QUEM VENCE?</button>\`;
}

function battleResult() {
    const p1 = compareSlots[1];
    const p2 = compareSlots[2];
    const total1 = p1.stats.reduce((acc, s) => acc + s.base_stat, 0);
    const total2 = p2.stats.reduce((acc, s) => acc + s.base_stat, 0);
    const winner = total1 > total2 ? p1.name : p2.name;
    alert(\`O CAMPEÃO É: \${winner.toUpperCase()}! 🏆\`);
}

async function loadItems() {
    const grid = document.getElementById('itemGrid'); if (!grid) return;
    grid.innerHTML = '<div class="loading">Carregando...</div>';
    try {
        const response = await fetch(\`\${POKE_API}/item?limit=60\`);
        const data = await response.json();
        const items = await Promise.all(data.results.map(i => fetch(i.url).then(r => r.json())));
        const filteredItems = items.filter(i => i.category.name !== 'standard-balls' && i.category.name !== 'special-balls');

        grid.innerHTML = filteredItems.map(i => \`
            <div class="pokemon-card" onclick="showItemDetail('\${i.name}')">
                <img src="\${i.sprites.default||''}" style="width:50px">
                <div style="font-size:0.7em">\${getTranslatedItemName(i.name)}</div>
            </div>
        \`).join('');
    } catch(e) { grid.innerHTML = "Erro."; }
}

async function loadPokeballs() {
    const grid = document.getElementById('pokeballGrid'); if (!grid) return;
    grid.innerHTML = '<div class="loading">Carregando...</div>';
    try {
        const data = await fetch(\`\${POKE_API}/item-category/34/\`).then(res => res.json());
        const balls = await Promise.all(data.items.map(i => fetch(i.url).then(r => r.json())));
        grid.innerHTML = balls.map(b => \`
            <div class="pokemon-card" onclick="showItemDetail('\${b.name}')">
                <img src="\${b.sprites.default}" style="width:50px">
                <div style="font-size:0.7em">\${getTranslatedItemName(b.name)}</div>
            </div>
        \`).join('');
    } catch(e) { grid.innerHTML = "Erro."; }
}

async function showItemDetail(itemName) {
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('detailContent');
    modal.classList.add('show');
    content.innerHTML = '<div class="loading">Buscando...</div>';
    try {
        const item = await fetch(\`\${POKE_API}/item/\${itemName}\`).then(r => r.json());
        const desc = item.flavor_text_entries.find(e => e.language.name === 'en')?.text || "Sem descrição.";
        content.innerHTML = \`
            <img src="\${item.sprites.default || ''}" style="width:100px">
            <h2 class="pokemon-name">\${getTranslatedItemName(item.name)}</h2>
            <div class="detail-description" style="color:#eee; font-size:0.9em; margin:15px 0; line-height:1.6; background:rgba(0,0,0,0.3); padding:10px; border-radius:8px;">\${desc}</div>
            <button class="action-btn" onclick="closeModal()">FECHAR</button>
        \`;
    } catch (e) { content.innerHTML = "Erro."; }
}

// Função auxiliar de tradução de itens (se não estiver no translations.js)
const itemNamesPT = { "potion": "Poção", "super-potion": "Super Poção", "hyper-potion": "Hiper Poção", "max-potion": "Poção Máxima", "revive": "Reviver", "rare-candy": "Doce Raro", "sun-stone": "Pedra do Sol", "moon-stone": "Pedra da Lua", "fire-stone": "Pedra de Fogo", "thunder-stone": "Pedra do Trovão", "water-stone": "Pedra da Água", "poke-ball": "Poké Bola", "great-ball": "Grande Bola", "ultra-ball": "Ultra Bola", "master-ball": "Master Ball" };
function getTranslatedItemName(name) { return itemNamesPT[name] || name.toUpperCase().replace(/-/g, ' '); }
