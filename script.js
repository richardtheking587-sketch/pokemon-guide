const POKE_API = 'https://pokeapi.co/api/v2';
let allPokemon = [];
let shinyPokemon = [];
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

document.addEventListener('DOMContentLoaded', () => {
    loadPokemon();
    setupEvents();
});

function setupEvents() {
    document.getElementById('searchInput')?.addEventListener('input', filterPokemon);
    document.getElementById('generationFilter')?.addEventListener('change', filterPokemon);
    document.getElementById('shinySearchInput')?.addEventListener('input', filterShinyPokemon);
}

function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tab + '-tab')?.classList.add('active');
    document.getElementById('btn-' + tab)?.classList.add('active');

    if (tab === 'favorites') updateFavoritesGrid();
    if (tab === 'items') loadItems();
    if (tab === 'pokeballs') loadPokeballs();
    if (tab === 'shiny') loadShinyPokemon();
}

async function loadPokemon() {
    try {
        const r = await fetch(POKE_API + '/pokemon?limit=1025');
        const d = await r.json();
        allPokemon = d.results.map((p, i) => ({
            id: i + 1, name: p.name,
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${i + 1}.png`
        }));
        filterPokemon();
    } catch (e) { console.error(e); }
}

async function loadShinyPokemon() {
    const grid = document.getElementById('shinyGrid');
    if (shinyPokemon.length === 0) {
        grid.innerHTML = '<div class="loading">Carregando Pokémons Shiny...</div>';
        const shinyIds = [1, 4, 7, 25, 39, 54, 58, 63, 66, 69, 72, 77, 79, 81, 129, 130, 133, 147, 150];
        shinyPokemon = shinyIds.map(id => ({
            id: id,
            name: allPokemon.find(p => p.id === id)?.name || `Pokemon ${id}`,
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${id}.png`
        }));
    }
    filterShinyPokemon();
}

function filterShinyPokemon() {
    const term = document.getElementById('shinySearchInput')?.value.toLowerCase() || '';
    const filtered = shinyPokemon.filter(p => p.name.includes(term) || String(p.id).includes(term));
    const grid = document.getElementById('shinyGrid');
    if (grid) {
        grid.innerHTML = filtered.map(p => `
            <div class="pokemon-card" onclick="showDetail(${p.id})">
                <div class="pokemon-image"><img src="${p.image}"></div>
                <div class="pokemon-name">✨ ${p.name.toUpperCase()}</div>
                <div class="pokemon-id">#${String(p.id).padStart(4, '0')}</div>
            </div>
        `).join('');
    }
}

function randomShinyPokemon() {
    if (shinyPokemon.length > 0) showDetail(shinyPokemon[Math.floor(Math.random() * shinyPokemon.length)].id);
}

function getFavorites() { return JSON.parse(localStorage.getItem('pokeFavorites') || '[]'); }

function toggleFavorite(event, id) {
    event.stopPropagation();
    let favs = getFavorites();
    favs = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id];
    localStorage.setItem('pokeFavorites', JSON.stringify(favs));
    filterPokemon();
    updateFavoritesGrid();
}

function filterPokemon() {
    const term = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const gen = document.getElementById('generationFilter')?.value || '';
    const favs = getFavorites();
    const filtered = allPokemon.filter(p => {
        const mSearch = p.name.includes(term) || String(p.id).includes(term);
        const mGen = !gen || (p.id >= generationRanges[gen].start && p.id <= generationRanges[gen].end);
        return mSearch && mGen;
    });
    const grid = document.getElementById('pokemonGrid');
    if (grid) {
        grid.innerHTML = filtered.map(p => {
            const isFav = favs.includes(p.id);
            return `<div class="pokemon-card${isFav ? ' favorited' : ''}" onclick="showDetail(${p.id})">
                <button class="fav-btn${isFav ? ' active' : ''}" onclick="toggleFavorite(event, ${p.id})">${isFav ? '⭐' : '☆'}</button>
                <div class="pokemon-image"><img src="${p.image}"></div>
                <div class="pokemon-name">${p.name.toUpperCase()}</div>
                <div class="pokemon-id">#${String(p.id).padStart(4, '0')}</div>
            </div>`;
        }).join('');
    }
}

async function showDetail(id) {
    const p = allPokemon.find(poke => poke.id === id);
    const modal = document.getElementById('detailModal');
    modal.classList.add('show');
    const content = document.getElementById('detailContent');
    content.innerHTML = '<div class="loading">Carregando...</div>';
    try {
        const d = await fetch(`${POKE_API}/pokemon/${id}`).then(res => res.json());
        content.innerHTML = `
            <img src="${p.image}" style="width:180px">
            <h2>${p.name.toUpperCase()}</h2>
            <div class="types-container">${d.types.map(t => `<span class="type-badge ${t.type.name}">${typeTranslations[t.type.name] || t.type.name}</span>`).join('')}</div>
            <div style="margin-top:20px; display:grid; grid-template-columns:1fr 1fr; gap:10px; text-align:left;">
                ${d.stats.map(s => `<div><strong>${s.stat.name.toUpperCase()}:</strong> ${s.base_stat}</div>`).join('')}
            </div>
        `;
    } catch (e) { content.innerHTML = `<h2>Erro ao carregar</h2>`; }
}

function closeModal() { document.getElementById('detailModal').classList.remove('show'); }

async function loadItems() {
    const grid = document.getElementById('itemGrid');
    grid.innerHTML = '<div class="loading">Carregando...</div>';
    const r = await fetch(`${POKE_API}/item?limit=40`);
    const d = await r.json();
    const items = await Promise.all(d.results.map(i => fetch(i.url).then(res => res.json())));
    grid.innerHTML = items.map(i => `<div class="pokemon-card item-card"><img src="${i.sprites.default}"><div>${i.name.replace(/-/g, ' ').toUpperCase()}</div></div>`).join('');
}

async function loadPokeballs() {
    const grid = document.getElementById('pokeballGrid');
    grid.innerHTML = '<div class="loading">Carregando...</div>';
    const balls = ['poke-ball', 'great-ball', 'ultra-ball', 'master-ball'];
    const data = await Promise.all(balls.map(b => fetch(`${POKE_API}/item/${b}`).then(r => r.json())));
    grid.innerHTML = data.map(b => `<div class="pokemon-card item-card"><img src="${b.sprites.default}"><div>${b.name.toUpperCase()}</div></div>`).join('');
}

function openCompareSelector(slot) {
    activeSlot = slot;
    document.getElementById('compareSelectorModal').classList.add('show');
    showRegions();
}

function closeCompareSelector() { document.getElementById('compareSelectorModal').classList.remove('show'); }

function showRegions() {
    let html = '<h2 style="font-family:Orbitron; margin-bottom:20px; grid-column:1/-1">ESCOLHA A REGIÃO</h2>';
    Object.keys(generationRanges).forEach(g => {
        html += `<button class="selector-btn" onclick="showPokemonByRegion(${g})">${generationRanges[g].name}</button>`;
    });
    document.getElementById('regionSelector').innerHTML = html;
    document.getElementById('regionSelector').style.display = 'grid';
    document.getElementById('pokemonSelector').style.display = 'none';
}

function showPokemonByRegion(gen) {
    const range = generationRanges[gen];
    const pokes = allPokemon.filter(p => p.id >= range.start && p.id <= range.end);
    let html = `<button class="selector-btn" style="grid-column:1/-1; background:#333" onclick="showRegions()">⬅ VOLTAR</button>`;
    html += pokes.map(p => `<div class="mini-poke-btn" onclick="selectForCompare(${p.id})"><img src="${p.image}"><div>${p.name.toUpperCase()}</div></div>`).join('');
    document.getElementById('pokemonSelector').innerHTML = html;
    document.getElementById('regionSelector').style.display = 'none';
    document.getElementById('pokemonSelector').style.display = 'grid';
}

async function selectForCompare(id) {
    const d = await fetch(`${POKE_API}/pokemon/${id}`).then(res => res.json());
    compareSlots[activeSlot] = { name: d.name, image: d.sprites.other['official-artwork'].front_default, stats: d.stats };
    document.getElementById(`result${activeSlot}`).innerHTML = `<img src="${compareSlots[activeSlot].image}" style="width:120px"><div>${d.name.toUpperCase()}</div>`;
    closeCompareSelector();
    updateComparisonAnalysis();
}

function updateComparisonAnalysis() {
    if (!compareSlots[1] || !compareSlots[2]) return;
    const s1 = compareSlots[1].stats.reduce((a, s) => a + s.base_stat, 0);
    const s2 = compareSlots[2].stats.reduce((a, s) => a + s.base_stat, 0);
    document.getElementById('comparison-stats').innerHTML = `
        <div class="stat-row">
            <div class="stat-val ${s1 >= s2 ? 'winner' : ''}">${s1}</div>
            <div class="stat-label">TOTAL</div>
            <div class="stat-val ${s2 >= s1 ? 'winner' : ''}">${s2}</div>
        </div>
        <button class="action-btn" style="width:100%" onclick="battleResult()">⚔️ LUTAR!</button>
    `;
}

function battleResult() {
    const t1 = compareSlots[1].stats.reduce((a, s) => a + s.base_stat, 0);
    const t2 = compareSlots[2].stats.reduce((a, s) => a + s.base_stat, 0);
    const winner = t1 >= t2 ? compareSlots[1] : compareSlots[2];
    document.getElementById('victoryPokemonImg').src = winner.image;
    document.getElementById('victoryPokemonName').textContent = winner.name.toUpperCase();
    document.getElementById('victoryModal').classList.add('show');
}

function closeVictoryModal() { document.getElementById('victoryModal').classList.remove('show'); }

function updateFavoritesGrid() {
    const favs = getFavorites();
    const grid = document.getElementById('favoritesGrid');
    if (!favs.length) { grid.innerHTML = '<p style="grid-column:1/-1; text-align:center;">Vazio.</p>'; return; }
    grid.innerHTML = allPokemon.filter(p => favs.includes(p.id)).map(p => `
        <div class="pokemon-card favorited" onclick="showDetail(${p.id})">
            <button class="fav-btn active" onclick="toggleFavorite(event, ${p.id})">⭐</button>
            <div class="pokemon-image"><img src="${p.image}"></div>
            <div class="pokemon-name">${p.name.toUpperCase()}</div>
        </div>
    `).join('');
}

function randomPokemon() { showDetail(Math.floor(Math.random() * 1025) + 1); }
