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

const typeTranslations = {
    'normal': 'Normal', 'fire': 'Fogo', 'water': 'Água', 'grass': 'Planta',
    'electric': 'Elétrico', 'ice': 'Gelo', 'fighting': 'Lutador', 'poison': 'Venenoso',
    'ground': 'Terra', 'flying': 'Voador', 'psychic': 'Psíquico', 'bug': 'Inseto',
    'rock': 'Pedra', 'ghost': 'Fantasma', 'dragon': 'Dragão', 'dark': 'Sombrio',
    'steel': 'Aço', 'fairy': 'Fada'
};

const itemDataBR = {
    'poke-ball': { name: 'Poké Bola', desc: 'Ferramenta básica para capturar Pokémons selvagens.' },
    'great-ball': { name: 'Grande Bola', desc: 'Bola de alto desempenho com melhor taxa de captura.' },
    'ultra-ball': { name: 'Ultra Bola', desc: 'Bola ultra-eficiente para capturar Pokémons.' },
    'master-ball': { name: 'Bola Mestra', desc: 'A melhor bola. Captura qualquer Pokémon sem falhar.' },
    'potion': { name: 'Poção', desc: 'Restaura 20 HP de um Pokémon.' },
    'super-potion': { name: 'Super Poção', desc: 'Restaura 60 HP de um Pokémon.' },
    'rare-candy': { name: 'Doce Raro', desc: 'Aumenta o nível de um Pokémon em 1.' },
    'revive': { name: 'Reviver', desc: 'Revive um Pokémon desmaiado com metade do HP.' }
};

document.addEventListener('DOMContentLoaded', ( ) => { 
    loadPokemon(); 
    setupEvents(); 
});

function setupEvents() {
    document.getElementById('searchInput')?.addEventListener('input', filterPokemon);
    document.getElementById('generationFilter')?.addEventListener('change', filterPokemon);
}

function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tab + '-tab')?.classList.add('active');
    document.getElementById('btn-' + tab)?.classList.add('active');
    if (tab === 'favorites') updateFavoritesGrid();
    if (tab === 'items') loadItems();
    if (tab === 'pokeballs') loadPokeballs();
}

async function loadPokemon() {
    try {
        const r = await fetch(POKE_API + '/pokemon?limit=1025');
        const d = await r.json();
        allPokemon = d.results.map((p, i) => ({
            id: i + 1, name: p.name,
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${i + 1}.png`
        } ));
        filterPokemon();
    } catch(e) { console.error("Erro ao carregar:", e); }
}

function getFavorites() { return JSON.parse(localStorage.getItem('pokeFavorites') || '[]'); }

function toggleFavorite(event, id) {
    event.stopPropagation();
    let favs = getFavorites();
    if (favs.includes(id)) favs = favs.filter(f => f !== id);
    else favs.push(id);
    localStorage.setItem('pokeFavorites', JSON.stringify(favs));
    filterPokemon();
    updateFavoritesGrid();
}

function filterPokemon() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const gen = document.getElementById('generationFilter').value;
    const favs = getFavorites();
    const filtered = allPokemon.filter(p => {
        const mSearch = p.name.includes(term) || String(p.id).includes(term);
        const mGen = !gen || (p.id >= generationRanges[gen].start && p.id <= generationRanges[gen].end);
        return mSearch && mGen;
    });
    const grid = document.getElementById('pokemonGrid');
    if (grid) grid.innerHTML = filtered.map(p => {
        const isFav = favs.includes(p.id);
        return `<div class="pokemon-card${isFav ? ' favorited' : ''}" onclick="showDetail(${p.id})"><button class="fav-btn${isFav ? ' active' : ''}" onclick="toggleFavorite(event, ${p.id})">${isFav ? '⭐' : '☆'}</button><div class="pokemon-image"><img src="${p.image}" loading="lazy"></div><div class="pokemon-name">${p.name.toUpperCase()}</div><div class="pokemon-id">#${String(p.id).padStart(4, '0')}</div></div>`;
    }).join('');
}

async function showDetail(id) {
    const p = allPokemon.find(poke => poke.id === id);
    const modal = document.getElementById('detailModal');
    modal.classList.add('show');
    const content = document.getElementById('detailContent');
    content.innerHTML = '<div class="loading">Carregando detalhes e evoluções...</div>';
    
    try {
        const d = await fetch(`${POKE_API}/pokemon/${id}`).then(res => res.json());
        const species = await fetch(d.species.url).then(res => res.json());
        const evoData = await fetch(species.evolution_chain.url).then(res => res.json());
        
        let evoChain = [];
        let evoCurrent = evoData.chain;
        
        // Lógica para percorrer a árvore de evolução
        while (evoCurrent) {
            const evoId = evoCurrent.species.url.split('/').filter(Boolean).pop();
            evoChain.push({
                name: evoCurrent.species.name,
                id: evoId,
                image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evoId}.png`
            } );
            evoCurrent = evoCurrent.evolves_to[0];
        }

        content.innerHTML = `
            <img src="${p.image}" style="width:180px">
            <h2>${p.name.toUpperCase()}</h2>
            <div class="types-container">${d.types.map(t => `<span class="type-badge ${t.type.name}">${typeTranslations[t.type.name] || t.type.name}</span>`).join('')}</div>
            
            <div style="margin-top:20px; display:grid; grid-template-columns:1fr 1fr; gap:10px; text-align:left; font-size:0.8em;">
                ${d.stats.map(s => `<div><strong>${s.stat.name.toUpperCase()}:</strong> ${s.base_stat}</div>`).join('')}
            </div>

            <div class="evolution-chain" style="margin-top:30px; border-top:1px solid rgba(255,255,255,0.1); padding-top:20px;">
                <h3 style="font-family:Orbitron; font-size:0.9em; margin-bottom:15px;">LINHA EVOLUTIVA</h3>
                <div style="display:flex; justify-content:center; align-items:center; gap:10px; flex-wrap:wrap;">
                    ${evoChain.map((evo, index) => `
                        <div style="text-align:center; cursor:pointer" onclick="showDetail(${evo.id})">
                            <img src="${evo.image}" style="width:60px; border-radius:50%; background:rgba(255,255,255,0.05); padding:5px; border:1px solid rgba(241,196,15,0.2);">
                            <div style="font-size:9px; margin-top:5px; color:#f1c40f">${evo.name.toUpperCase()}</div>
                        </div>
                        ${index < evoChain.length - 1 ? '<span style="color:#f1c40f; font-weight:bold">➔</span>' : ''}
                    `).join('')}
                </div>
            </div>
        `;
    } catch(e) {
        content.innerHTML = `<h2>Erro ao carregar detalhes</h2>`;
    }
}

function closeModal() { document.getElementById('detailModal').classList.remove('show'); }

async function loadItems() {
    const grid = document.getElementById('itemGrid');
    grid.innerHTML = '<div class="loading">Carregando mochila...</div>';
    const r = await fetch(`${POKE_API}/item?limit=150`);
    const d = await r.json();
    const items = await Promise.all(d.results.map(i => fetch(i.url).then(res => res.json())));
    grid.innerHTML = items.filter(i => !i.name.includes('ball')).slice(0, 40).map(i => {
        const tr = itemDataBR[i.name] || { name: i.name.replace(/-/g, ' '), desc: 'Item útil.' };
        return `<div class="pokemon-card item-card" onclick="showItemDetail('${tr.name}', '${i.sprites.default}', '${tr.desc}')"><img src="${i.sprites.default}" style="width:50px"><div>${tr.name.toUpperCase()}</div><div class="item-desc">${tr.desc}</div></div>`;
    }).join('');
}

async function loadPokeballs() {
    const grid = document.getElementById('pokeballGrid');
    grid.innerHTML = '<div class="loading">Carregando Pokébolas...</div>';
    const balls = ['poke-ball', 'great-ball', 'ultra-ball', 'master-ball', 'safari-ball', 'net-ball', 'dive-ball', 'dusk-ball', 'quick-ball'];
    const data = await Promise.all(balls.map(b => fetch(`${POKE_API}/item/${b}`).then(r => r.json())));
    grid.innerHTML = data.map(b => {
        const tr = itemDataBR[b.name] || { name: b.name.toUpperCase(), desc: 'Pokébola.' };
        return `<div class="pokemon-card item-card" onclick="showItemDetail('${tr.name}', '${b.sprites.default}', '${tr.desc}')"><img src="${b.sprites.default}" style="width:50px"><div>${tr.name.toUpperCase()}</div><div class="item-desc">${tr.desc}</div></div>`;
    }).join('');
}

function showItemDetail(name, img, desc) {
    const modal = document.getElementById('detailModal');
    modal.classList.add('show');
    document.getElementById('detailContent').innerHTML = `<img src="${img}" style="width:100px"><h2>${name.toUpperCase()}</h2><p style="margin-top:20px; color:#888; font-style:italic;">${desc}</p>`;
}

function openCompareSelector(slot) { 
    activeSlot = slot; 
    document.getElementById('compareSelectorModal').classList.add('show'); 
    showRegions(); 
}

function closeCompareSelector() { 
    document.getElementById('compareSelectorModal').classList.remove('show'); 
}

function showRegions() {
    document.getElementById('regionSelector').style.display = 'grid';
    document.getElementById('pokemonSelector').style.display = 'none';
    let html = '<span class="close" onclick="closeCompareSelector()">&times;</span><h2 style="font-family:Orbitron; margin-bottom:20px; grid-column:1/-1">ESCOLHA A REGIÃO</h2>';
    Object.keys(generationRanges).forEach(g => { 
        html += `<button class="selector-btn" onclick="showPokemonByRegion(${g})">${generationRanges[g].name}</button> `; 
    });
    document.getElementById('regionSelector').innerHTML = html;
}

function showPokemonByRegion(gen) {
    document.getElementById('regionSelector').style.display = 'none';
    const pSel = document.getElementById('pokemonSelector');
    pSel.style.display = 'grid';
    pSel.innerHTML = '<div class="loading">Carregando...</div>';
    
    const range = generationRanges[gen];
    const pokes = allPokemon.filter(p => p.id >= range.start && p.id <= range.end);
    
    let html = `<button class="selector-btn" style="grid-column:1/-1; background:#333" onclick="showRegions()">⬅ VOLTAR PARA REGIÕES</button>`;
    html += pokes.map(p => `
        <div class="mini-poke-btn" onclick="selectForCompare(${p.id})">
            <img src="${p.image}" style="width:40px">
            <div style="font-size:10px">${p.name.toUpperCase()}</div>
        </div>
    `).join('');
    pSel.innerHTML = html;
}

async function selectForCompare(id) {
    const d = await fetch(`${POKE_API}/pokemon/${id}`).then(res => res.json());
    compareSlots[activeSlot] = { 
        name: d.name, 
        image: d.sprites.other['official-artwork'].front_default, 
        stats: d.stats 
    };
    document.getElementById(`result${activeSlot}`).innerHTML = `<img src="${compareSlots[activeSlot].image}" style="width:120px"><div>${d.name.toUpperCase()}</div>`;
    closeCompareSelector();
    updateComparisonAnalysis();
}

function updateComparisonAnalysis() {
    if(!compareSlots[1] || !compareSlots[2]) return;
    const s1 = compareSlots[1].stats.reduce((a, s) => a + s.base_stat, 0);
    const s2 = compareSlots[2].stats.reduce((a, s) => a + s.base_stat, 0);
    
    document.getElementById('comparison-stats').innerHTML = `
        <div class="comparison-stats">
            <div class="stat-row">
                <div class="stat-val ${s1>=s2?'winner':''}">${s1}</div>
                <div class="stat-label">TOTAL DE STATS</div>
                <div class="stat-val ${s2>=s1?'winner':''}">${s2}</div>
            </div>
            <button class="action-btn" style="width:100%; margin-top:20px; font-size:1.2em;" onclick="battleResult()">⚔️ INICIAR LUTA!</button>
        </div>
    `;
}

function battleResult() {
    const t1 = compareSlots[1].stats.reduce((a, s) => a + s.base_stat, 0);
    const t2 = compareSlots[2].stats.reduce((a, s) => a + s.base_stat, 0);
    const winner = t1 >= t2 ? compareSlots[1] : compareSlots[2];
    const loser = t1 < t2 ? compareSlots[1] : compareSlots[2];
    document.getElementById('victoryPokemonImg').src = winner.image;
    document.getElementById('victoryPokemonName').textContent = winner.name.toUpperCase();
    document.getElementById('victoryStatsSummary').innerHTML = `Venceu com ${Math.max(t1,t2)} pontos contra ${Math.min(t1,t2)} de ${loser.name.toUpperCase()}!`;
    document.getElementById('victoryModal').style.display = 'flex';
}

function closeVictoryModal() { document.getElementById('victoryModal').style.display = 'none'; }

function updateFavoritesGrid() {
    const favs = getFavorites();
    const grid = document.getElementById('favoritesGrid');
    if (!favs.length) { grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:40px">Nenhum favorito.</p>'; return; }
    grid.innerHTML = allPokemon.filter(p => favs.includes(p.id)).map(p => `<div class="pokemon-card favorited" onclick="showDetail(${p.id})"><button class="fav-btn active">⭐</button><img src="${p.image}" style="width:100px"><div>${p.name.toUpperCase()}</div></div>`).join('');
}

function randomPokemon() { showDetail(Math.floor(Math.random() * 1025) + 1); }
