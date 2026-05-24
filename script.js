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

const translations = {
    types: { 'normal': 'Nor', 'fire': 'Fog', 'water': 'Águ', 'grass': 'Pla', 'electric': 'Elé', 'ice': 'Gel', 'fighting': 'Lut', 'poison': 'Ven', 'ground': 'Ter', 'flying': 'Voa', 'psychic': 'Psi', 'bug': 'Ins', 'rock': 'Ped', 'ghost': 'Fan', 'dragon': 'Dra', 'dark': 'Som', 'steel': 'Aço', 'fairy': 'Fad' },
    stats: { 'hp': 'Vida', 'attack': 'Ataque', 'defense': 'Defesa', 'speed': 'Velocidade' },
    items: {
        'poke-ball': { name: 'Poké Bola', desc: 'Item básico para capturar Pokémons selvagens.' },
        'great-ball': { name: 'Grande Bola', desc: 'Uma bola de alta performance com maior taxa de captura.' },
        'ultra-ball': { name: 'Ultra Bola', desc: 'Uma bola ultra-eficiente para capturar Pokémons.' },
        'master-ball': { name: 'Bola Mestra', desc: 'A melhor bola. Captura qualquer Pokémon sem falhar!' },
        'potion': { name: 'Poção', desc: 'Restaura 20 pontos de vida (HP) de um Pokémon.' },
        'super-potion': { name: 'Super Poção', desc: 'Restaura 60 pontos de vida (HP) de um Pokémon.' },
        'rare-candy': { name: 'Doce Raro', desc: 'Aumenta o nível de um Pokémon em 1.' },
        'revive': { name: 'Reviver', desc: 'Revive um Pokémon desmaiado com metade do seu HP.' },
        'antidote': { name: 'Antídoto', desc: 'Cura um Pokémon que foi envenenado.' }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    loadPokemon();
    document.getElementById('searchInput')?.addEventListener('input', filterPokemon);
    document.getElementById('generationFilter')?.addEventListener('change', filterPokemon);
});

async function loadPokemon() {
    try {
        const r = await fetch(`${POKE_API}/pokemon?limit=1025`);
        const d = await r.json();
        allPokemon = d.results.map((p, i) => ({
            id: i + 1, name: p.name,
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${i + 1}.png`,
            shiny: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${i + 1}.png`
        }));
        filterPokemon();
    } catch (e) { console.error(e); }
}

function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`${tab}-tab`)?.classList.add('active');
    document.getElementById(`btn-${tab}`)?.classList.add('active');
    if (tab === 'favorites') updateFavoritesGrid();
}

function filterPokemon() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const gen = document.getElementById('generationFilter').value;
    const favs = JSON.parse(localStorage.getItem('pokeFavorites') || '[]');
    const filtered = allPokemon.filter(p => {
        const mSearch = p.name.includes(term) || String(p.id).includes(term);
        const mGen = !gen || (p.id >= generationRanges[gen].start && p.id <= generationRanges[gen].end);
        return mSearch && mGen;
    });
    const grid = document.getElementById('pokemonGrid');
    if (grid) {
        grid.innerHTML = filtered.map(p => {
            const isFav = favs.includes(p.id);
            return `<div class="pokemon-card" onclick="showDetail(${p.id})">
                <button class="fav-btn${isFav ? ' active' : ''}" onclick="toggleFavorite(event, ${p.id})">★</button>
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
        const species = await fetch(d.species.url).then(res => res.json());
        const evoData = await fetch(species.evolution_chain.url).then(res => res.json());

        function getEvolutions(chain) {
            let evos = [];
            const evoId = chain.species.url.split('/').filter(Boolean).pop();
            evos.push({ name: chain.species.name, id: parseInt(evoId) });
            chain.evolves_to.forEach(next => evos = evos.concat(getEvolutions(next)));
            return evos;
        }
        const allEvos = getEvolutions(evoData.chain);

        content.innerHTML = `
            <img id="modal-img" src="${p.image}" style="width:160px">
            <h2 style="font-family:Orbitron; margin-bottom:10px">${p.name.toUpperCase()}</h2>
            <div class="type-container">
                ${d.types.map(t => `<div class="type-badge ${t.type.name}">${translations.types[t.type.name] || t.type.name}</div>`).join('')}
            </div>
            <button class="shiny-toggle-btn" onclick="toggleShiny(${id})">VER SHINY ✨</button>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:20px; font-size:0.85em; text-align:left;">
                ${d.stats.filter(s => translations.stats[s.stat.name]).map(s => `<div><strong>${translations.stats[s.stat.name]}:</strong> ${s.base_stat}</div>`).join('')}
            </div>
            <div class="evolution-chain">
                <h3 style="font-family:Orbitron; font-size:0.8em; margin-bottom:10px">LINHA EVOLUTIVA</h3>
                <div class="evo-list">
                    ${allEvos.map(evo => `
                        <div class="evo-item" onclick="showDetail(${evo.id})">
                            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evo.id}.png">
                            <div style="color:${evo.id === id ? '#ffd700' : '#888'}">${evo.name.toUpperCase()}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } catch (e) { content.innerHTML = "Erro ao carregar."; }
}

function toggleShiny(id) {
    const p = allPokemon.find(poke => poke.id === id);
    const img = document.getElementById('modal-img');
    img.src = img.src === p.image ? p.shiny : p.image;
}

function toggleFavorite(event, id) {
    event.stopPropagation();
    let favs = JSON.parse(localStorage.getItem('pokeFavorites') || '[]');
    if (favs.includes(id)) {
        favs = favs.filter(f => f !== id);
    } else {
        favs.push(id);
    }
    localStorage.setItem('pokeFavorites', JSON.stringify(favs));
    filterPokemon();
    if (document.getElementById('favorites-tab').classList.contains('active')) updateFavoritesGrid();
}

function updateFavoritesGrid() {
    const favs = JSON.parse(localStorage.getItem('pokeFavorites') || '[]');
    const grid = document.getElementById('favoritesGrid');
    if (!favs.length) { grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:#666">Nenhum favorito ainda.</p>'; return; }
    grid.innerHTML = allPokemon.filter(p => favs.includes(p.id)).map(p => `
        <div class="pokemon-card favorited" onclick="showDetail(${p.id})">
            <button class="fav-btn active" onclick="toggleFavorite(event, ${p.id})">★</button>
            <div class="pokemon-image"><img src="${p.image}"></div>
            <div class="pokemon-name">${p.name.toUpperCase()}</div>
        </div>
    `).join('');
}

async function loadItems() {
    const grid = document.getElementById('itemGrid');
    grid.innerHTML = '<div class="loading">Carregando...</div>';
    const r = await fetch(`${POKE_API}/item?limit=100`);
    const d = await r.json();
    const items = await Promise.all(d.results.map(i => fetch(i.url).then(res => res.json())));
    grid.innerHTML = items.filter(i => !i.name.includes('ball')).slice(0, 30).map(i => {
        const tr = translations.items[i.name] || { name: i.name.replace(/-/g, ' '), desc: 'Item útil para sua jornada.' };
        return `<div class="pokemon-card" onclick="showItemDetail('${tr.name}', '${i.sprites.default}', '${tr.desc}')">
            <img src="${i.sprites.default}" style="width:50px">
            <div class="pokemon-name">${tr.name.toUpperCase()}</div>
        </div>`;
    }).join('');
}

async function loadPokeballs() {
    const grid = document.getElementById('pokeballGrid');
    grid.innerHTML = '<div class="loading">Carregando...</div>';
    const balls = ['poke-ball', 'great-ball', 'ultra-ball', 'master-ball', 'safari-ball', 'luxury-ball', 'premier-ball', 'quick-ball'];
    const data = await Promise.all(balls.map(b => fetch(`${POKE_API}/item/${b}`).then(r => r.json())));
    grid.innerHTML = data.map(b => {
        const tr = translations.items[b.name] || { name: b.name.replace(/-/g, ' '), desc: 'Pokébola para capturar Pokémons.' };
        return `<div class="pokemon-card" onclick="showItemDetail('${tr.name}', '${b.sprites.default}', '${tr.desc}')">
            <img src="${b.sprites.default}" style="width:50px">
            <div class="pokemon-name">${tr.name.toUpperCase()}</div>
        </div>`;
    }).join('');
}

function showItemDetail(name, img, desc) {
    const modal = document.getElementById('detailModal');
    modal.classList.add('show');
    document.getElementById('detailContent').innerHTML = `
        <img src="${img}" class="item-detail-img">
        <h2 class="item-detail-name">${name.toUpperCase()}</h2>
        <p class="item-detail-desc">${desc}</p>
    `;
}

function closeModal() { document.getElementById('detailModal').classList.remove('show'); }
function closeSelector() { document.getElementById('selectorModal').classList.remove('show'); }
function closeVictoryModal() { document.getElementById('victoryModal').classList.remove('show'); }
function randomPokemon() { showDetail(Math.floor(Math.random() * 1025) + 1); }
