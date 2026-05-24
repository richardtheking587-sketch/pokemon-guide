const POKE_API = 'https://pokeapi.co/api/v2';
let allPokemon = [];
let compareSlots = { 1: null, 2: null };
let activeSlot = 1;

const typeTranslations = {
    'normal': 'Normal', 'fire': 'Fogo', 'water': 'Água', 'grass': 'Planta',
    'electric': 'Elétrico', 'ice': 'Gelo', 'fighting': 'Lutador', 'poison': 'Venenoso',
    'ground': 'Terra', 'flying': 'Voador', 'psychic': 'Psíquico', 'bug': 'Inseto',
    'rock': 'Pedra', 'ghost': 'Fantasma', 'dragon': 'Dragão', 'dark': 'Sombrio',
    'steel': 'Aço', 'fairy': 'Fada'
};

const itemDataBR = {
    'poke-ball': { name: 'Poké Bola', desc: 'Ferramenta básica de captura.' },
    'great-ball': { name: 'Grande Bola', desc: 'Melhor taxa de captura que a Poké Bola.' },
    'ultra-ball': { name: 'Ultra Bola', desc: 'Uma bola ultra-eficiente.' },
    'master-ball': { name: 'Bola Mestra', desc: 'Captura infalível.' },
    'potion': { name: 'Poção', desc: 'Restaura 20 HP.' },
    'super-potion': { name: 'Super Poção', desc: 'Restaura 60 HP.' },
    'rare-candy': { name: 'Doce Raro', desc: 'Aumenta o nível em 1.' },
    'revive': { name: 'Reviver', desc: 'Revive com metade do HP.' }
};

document.addEventListener('DOMContentLoaded', ( ) => { loadPokemon(); setupEvents(); });

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
    const r = await fetch(POKE_API + '/pokemon?limit=151');
    const d = await r.json();
    allPokemon = d.results.map((p, i) => ({
        id: i + 1, name: p.name,
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${i + 1}.png`,
        types: [], stats: []
    } ));
    filterPokemon();
}

function filterPokemon() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allPokemon.filter(p => p.name.includes(term));
    const grid = document.getElementById('pokemonGrid');
    if (grid) grid.innerHTML = filtered.map(p => `
        <div class="pokemon-card" onclick="showDetail(${p.id})">
            <div class="pokemon-image"><img src="${p.image}"></div>
            <div class="pokemon-name">${p.name.toUpperCase()}</div>
        </div>
    `).join('');
}

async function showDetail(id) {
    const p = allPokemon.find(poke => poke.id === id);
    const modal = document.getElementById('detailModal');
    modal.classList.add('show');
    const d = await fetch(`${POKE_API}/pokemon/${id}`).then(res => res.json());
    document.getElementById('detailContent').innerHTML = `
        <img src="${p.image}" style="width:150px">
        <h2>${p.name.toUpperCase()}</h2>
        <div>${d.types.map(t => `<span class="type-badge ${t.type.name}">${typeTranslations[t.type.name] || t.type.name}</span>`).join('')}</div>
    `;
}

function closeModal() { document.getElementById('detailModal').classList.remove('show'); }

async function loadItems() {
    const grid = document.getElementById('itemGrid');
    grid.innerHTML = 'Carregando...';
    const r = await fetch(`${POKE_API}/item?limit=50`);
    const d = await r.json();
    const items = await Promise.all(d.results.map(i => fetch(i.url).then(res => res.json())));
    grid.innerHTML = items.filter(i => !i.name.includes('ball')).map(i => {
        const tr = itemDataBR[i.name] || { name: i.name, desc: 'Item útil.' };
        return `<div class="pokemon-card item-card"><img src="${i.sprites.default}" style="width:40px"><div>${tr.name.toUpperCase()}</div><div class="item-desc">${tr.desc}</div></div>`;
    }).join('');
}

async function loadPokeballs() {
    const grid = document.getElementById('pokeballGrid');
    grid.innerHTML = 'Carregando...';
    const balls = ['poke-ball', 'great-ball', 'ultra-ball', 'master-ball'];
    const data = await Promise.all(balls.map(b => fetch(`${POKE_API}/item/${b}`).then(r => r.json())));
    grid.innerHTML = data.map(b => {
        const tr = itemDataBR[b.name] || { name: b.name, desc: 'Pokébola.' };
        return `<div class="pokemon-card item-card"><img src="${b.sprites.default}" style="width:40px"><div>${tr.name.toUpperCase()}</div><div class="item-desc">${tr.desc}</div></div>`;
    }).join('');
}

function openCompareSelector(slot) { activeSlot = slot; document.getElementById('compareSelectorModal').classList.add('show'); showRegions(); }
function closeCompareSelector() { document.getElementById('compareSelectorModal').classList.remove('show'); }
function showRegions() {
    document.getElementById('regionSelector').innerHTML = `<button class="action-btn" onclick="selectForCompare(1)">Bulbasaur</button> <button class="action-btn" onclick="selectForCompare(4)">Charmander</button>`;
}
async function selectForCompare(id) {
    const p = allPokemon.find(poke => poke.id === id);
    compareSlots[activeSlot] = p;
    document.getElementById(`result${activeSlot}`).innerHTML = `<img src="${p.image}" style="width:100px">`;
    closeCompareSelector();
    if(compareSlots[1] && compareSlots[2]) battleResult();
}
function battleResult() {
    const winner = compareSlots[1];
    document.getElementById('victoryPokemonImg').src = winner.image;
    document.getElementById('victoryPokemonName').textContent = winner.name.toUpperCase();
    document.getElementById('victoryModal').style.display = 'flex';
}
function closeVictoryModal() { document.getElementById('victoryModal').style.display = 'none'; }
