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
    types: { 'normal': 'Normal', 'fire': 'Planta', 'water': 'Água', 'grass': 'Planta', 'electric': 'Elét', 'ice': 'Gelo', 'fighting': 'Luta', 'poison': 'Veneno', 'ground': 'Terra', 'flying': 'Vôo', 'psychic': 'Psi', 'bug': 'Ins', 'rock': 'Ped', 'ghost': 'Fan', 'dragon': 'Dra', 'dark': 'Som', 'steel': 'Aço', 'fairy': 'Fada' },
    stats: { 'hp': 'Vida', 'attack': 'Ataque', 'defense': 'Defesa', 'speed': 'Veloc.' },
    items: {
        'poke-ball': { name: 'Poké Bola', desc: 'Item básico para capturar Pokémons selvagens.' },
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
    if (tab === 'items') loadItems();
    if (tab === 'pokeballs') loadPokeballs();
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
            <img id="modal-img" src="${p.image}" class="detail-img">
            <h2 class="detail-name">${p.name.toUpperCase()}</h2>
            <div class="type-row">
                ${d.types.map(t => `<div class="type-tag ${t.type.name}">${translations.types[t.type.name] || t.type.name}</div>`).join('')}
                <button class="shiny-btn-tag" onclick="toggleShiny(${id})">VER SHINY ✨</button>
            </div>
            <div class="stats-container">
                ${d.stats.filter(s => translations.stats[s.stat.name]).map(s => `
                    <div class="stat-box">
                        <strong>${translations.stats[s.stat.name].toUpperCase()}</strong>
                        <span>${s.base_stat}</span>
                    </div>
                `).join('')}
            </div>
            <div class="evolution-chain">
                <h3 style="font-family:Orbitron; font-size:0.7em; color:#666; margin-bottom:15px">LINHA EVOLUTIVA</h3>
                <div class="evolution-row">
                    ${allEvos.map((evo, index) => `
                        <div class="evo-unit" onclick="showDetail(${evo.id})">
                            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evo.id}.png">
                            <div>${evo.name.toUpperCase()}</div>
                        </div>
                        ${index < allEvos.length - 1 ? '<div class="evo-arrow">➔</div>' : ''}
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
    favs = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id];
    localStorage.setItem('pokeFavorites', JSON.stringify(favs));
    filterPokemon();
    if (document.getElementById('favorites-tab').classList.contains('active')) updateFavoritesGrid();
}

function updateFavoritesGrid() {
    const favs = JSON.parse(localStorage.getItem('pokeFavorites') || '[]');
    const grid = document.getElementById('favoritesGrid');
    if (!favs.length) { grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:#666">Vazio.</p>'; return; }
    grid.innerHTML = allPokemon.filter(p => favs.includes(p.id)).map(p => `
        <div class="pokemon-card" onclick="showDetail(${p.id})">
            <button class="fav-btn active" onclick="toggleFavorite(event, ${p.id})">★</button>
            <div class="pokemon-image"><img src="${p.image}"></div>
            <div class="pokemon-name">${p.name.toUpperCase()}</div>
        </div>
    `).join('');
}

async function loadItems() {
    const grid = document.getElementById('itemGrid');
    grid.innerHTML = '<div class="loading">Carregando...</div>';
    const r = await fetch(`${POKE_API}/item?limit=60`);
    const d = await r.json();
    const items = await Promise.all(d.results.map(i => fetch(i.url).then(res => res.json())));
    grid.innerHTML = items.filter(i => !i.name.includes('ball')).slice(0, 20).map(i => {
        return `<div class="pokemon-card" onclick="showItemDetail('${i.name}', '${i.sprites.default}')">
            <img src="${i.sprites.default}" style="width:50px">
            <div class="pokemon-name">${i.name.toUpperCase()}</div>
        </div>`;
    }).join('');
}

async function loadPokeballs() {
    const grid = document.getElementById('pokeballGrid');
    grid.innerHTML = '<div class="loading">Carregando...</div>';
    const balls = ['poke-ball', 'great-ball', 'ultra-ball', 'master-ball'];
    const data = await Promise.all(balls.map(b => fetch(`${POKE_API}/item/${b}`).then(r => r.json())));
    grid.innerHTML = data.map(b => `<div class="pokemon-card" onclick="showItemDetail('${b.name}', '${b.sprites.default}')">
        <img src="${b.sprites.default}" style="width:50px">
        <div class="pokemon-name">${b.name.toUpperCase()}</div>
    </div>`).join('');
}

function showItemDetail(name, img) {
    const modal = document.getElementById('detailModal');
    modal.classList.add('show');
    document.getElementById('detailContent').innerHTML = `<img src="${img}" style="width:100px"><h2 style="font-family:Orbitron; margin-top:20px">${name.toUpperCase()}</h2>`;
}

function openCompareSelector(slot) {
    activeSlot = slot;
    document.getElementById('selectorModal').classList.add('show');
    let html = '';
    Object.keys(generationRanges).forEach(g => html += `<button class="selector-btn" onclick="showPokeSelector(${g})">${generationRanges[g].name}</button>`);
    document.getElementById('regionList').innerHTML = html;
    document.getElementById('regionList').style.display = 'grid';
    document.getElementById('pokeSelectorList').style.display = 'none';
}

function showPokeSelector(gen) {
    const range = generationRanges[gen];
    const pokes = allPokemon.filter(p => p.id >= range.start && p.id <= range.end);
    let html = `<button class="selector-btn" style="grid-column:1/-1" onclick="openCompareSelector(${activeSlot})">⬅ VOLTAR</button>`;
    html += pokes.map(p => `<div class="mini-poke-card" onclick="selectForCompare(${p.id})"><img src="${p.image}"><div>${p.name.toUpperCase()}</div></div>`).join('');
    document.getElementById('pokeSelectorList').innerHTML = html;
    document.getElementById('regionList').style.display = 'none';
    document.getElementById('pokeSelectorList').style.display = 'grid';
}

async function selectForCompare(id) {
    const d = await fetch(`${POKE_API}/pokemon/${id}`).then(res => res.json());
    compareSlots[activeSlot] = { name: d.name, image: d.sprites.other['official-artwork'].front_default, stats: d.stats };
    document.getElementById(`result${activeSlot}`).innerHTML = `<img src="${compareSlots[activeSlot].image}" style="width:100px"><div style="font-family:Orbitron;font-size:0.7em">${d.name.toUpperCase()}</div>`;
    closeSelector();
    updateComparison();
}

function updateComparison() {
    if (!compareSlots[1] || !compareSlots[2]) return;
    const statsToCompare = ['hp', 'attack', 'defense', 'speed'];
    let html = '';
    statsToCompare.forEach(sName => {
        const v1 = compareSlots[1].stats.find(s => s.stat.name === sName).base_stat;
        const v2 = compareSlots[2].stats.find(s => s.stat.name === sName).base_stat;
        const max = Math.max(v1, v2, 1);
        html += `
            <div class="stat-comparison-row">
                <div class="stat-num ${v1 >= v2 ? 'winner' : ''}">${v1}</div>
                <div class="stat-label" style="font-size:0.6em">${translations.stats[sName].toUpperCase()}</div>
                <div class="stat-num ${v2 >= v1 ? 'winner' : ''}">${v2}</div>
            </div>
            <div class="stat-bar-bg"><div class="stat-bar-fill" style="width:${(v1/max)*100}%"></div></div>
        `;
    });
    html += `<button class="action-btn" style="width:100%;margin-top:20px" onclick="startBattle()">LUTAR! ⚔️</button>`;
    document.getElementById('comparison-details').innerHTML = html;
}

function startBattle() {
    const s1 = compareSlots[1].stats.reduce((a, s) => a + s.base_stat, 0);
    const s2 = compareSlots[2].stats.reduce((a, s) => a + s.base_stat, 0);
    const winner = s1 >= s2 ? compareSlots[1] : compareSlots[2];
    document.getElementById('victoryImg').src = winner.image;
    document.getElementById('victoryName').innerText = winner.name.toUpperCase();
    document.getElementById('victoryReason').innerText = `Venceu com ${Math.max(s1,s2)} de Poder!`;
    document.getElementById('victorySound').play();
    document.getElementById('victoryModal').classList.add('show');
}

function closeSelector() { document.getElementById('selectorModal').classList.remove('show'); }
function closeModal() { document.getElementById('detailModal').classList.remove('show'); }
function closeVictoryModal() { document.getElementById('victoryModal').classList.remove('show'); }
function randomPokemon() { showDetail(Math.floor(Math.random() * 1025) + 1); }
