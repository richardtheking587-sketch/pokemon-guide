const POKE_API = 'https://pokeapi.co/api/v2';
let allPokemon = [];
let compareSlots = { 1: null, 2: null };
let activeSlot = 1;
let favorites = [];

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
    'hp': 'HP',
    'attack': 'Ataque',
    'defense': 'Defesa',
    'special-attack': 'Atq. Especial',
    'special-defense': 'Def. Especial',
    'speed': 'Velocidade'
};

document.addEventListener('DOMContentLoaded', () => {
    loadFavorites();
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
    
    const targetTab = document.getElementById(tab + '-tab');
    const targetBtn = document.getElementById('btn-' + tab);
    
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
        const response = await fetch(POKE_API + '/pokemon?limit=1025');
        const data = await response.json();
        allPokemon = data.results.map((p, index) => ({
            id: index + 1,
            name: p.name,
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${index + 1}.png`,
            shiny: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${index + 1}.png`,
            types: [],
            stats: []
        }));
        filterPokemon();
        loadDetailedData();
    } catch (e) {
        console.error('Erro ao carregar Pokémon:', e);
    }
}

async function loadDetailedData() {
    const batchSize = 50;
    for (let i = 0; i < allPokemon.length; i += batchSize) {
        const batch = allPokemon.slice(i, i + batchSize);
        await Promise.all(batch.map(p =>
            fetch(POKE_API + '/pokemon/' + p.id)
                .then(res => res.json())
                .then(data => {
                    const poke = allPokemon.find(item => item.id === data.id);
                    if (poke) {
                        poke.types = data.types.map(t => t.type.name);
                        poke.stats = data.stats;
                    }
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
                <button class="fav-btn ${favorites.includes(p.id) ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite(${p.id})">⭐</button>
                <div class="pokemon-image"><img src="${p.image}" loading="lazy" alt="${p.name}"></div>
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
    
    content.innerHTML = '<div style="text-align: center; padding: 20px;"><p>Carregando...</p></div>';
    modal.classList.add('show');
    
    try {
        const species = await fetch(POKE_API + '/pokemon-species/' + id).then(r => r.json());
        let desc = species.flavor_text_entries.find(e => e.language.name === 'pt')?.flavor_text || 
                   species.flavor_text_entries.find(e => e.language.name === 'en')?.flavor_text || 
                   "Sem descrição disponível.";
        desc = desc.replace(/\f/g, ' ').replace(/\n/g, ' ');

        const evoData = await fetch(species.evolution_chain.url).then(r => r.json());
        const evolutions = [];
        let curr = evoData.chain;
        while (curr) {
            const eid = curr.species.url.split('/').filter(Boolean).pop();
            evolutions.push({ id: eid, name: curr.species.name });
            curr = curr.evolves_to[0];
        }

        if (!p.types.length) {
            const d = await fetch(POKE_API + '/pokemon/' + id).then(res => res.json());
            p.types = d.types.map(t => t.type.name);
            p.stats = d.stats;
        }

        const typeData = await fetch(POKE_API + '/type/' + (p.types[0] || 'normal')).then(r => r.json());
        const weaknesses = typeData.damage_relations.double_damage_from.map(t => t.name);
        const strengths = typeData.damage_relations.double_damage_to.map(t => t.name);

        content.innerHTML = `
            <img id="modal-img" src="${p.image}" class="detail-img" alt="${p.name}">
            <h2 class="detail-name">${p.name.toUpperCase()}</h2>
            <div class="type-row">${p.types.map(t => `<span class="type-tag ${t}">${t.toUpperCase()}</span>`).join('')}</div>
            <div style="color:#ccc; font-size:0.9em; margin:15px 0; line-height:1.6; background:rgba(0,0,0,0.3); padding:10px; border-radius:8px;">${desc}</div>
            <div class="stats-container">${p.stats.map(s => `<div class="stat-box"><strong>${statTranslations[s.stat.name] || s.stat.name}</strong><span>${s.base_stat}</span></div>`).join('')}</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin:15px 0; font-size:0.8em;">
                <div style="background:#222; padding:10px; border-radius:8px;"><strong style="color:#ff4422">FRAQUEZAS</strong><br>${weaknesses.map(t => `<span class="type-tag ${t}" style="padding:2px 5px; font-size:0.7em; display:inline-block; margin:2px;">${t.toUpperCase()}</span>`).join(' ')}</div>
                <div style="background:#222; padding:10px; border-radius:8px;"><strong style="color:#77cc55">VANTAGENS</strong><br>${strengths.map(t => `<span class="type-tag ${t}" style="padding:2px 5px; font-size:0.7em; display:inline-block; margin:2px;">${t.toUpperCase()}</span>`).join(' ')}</div>
            </div>
            <div class="evolution-row">${evolutions.map((evo, i) => `<div class="evo-unit" onclick="showDetail(${evo.id})"><img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evo.id}.png"><div>${evo.name.toUpperCase()}</div></div>${i < evolutions.length - 1 ? '<span class="evo-arrow">➔</span>' : ''}`).join('')}</div>
            <div style="margin-top:20px; display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
                <button class="shiny-btn-tag" onclick="toggleShiny('${p.image}', '${p.shiny}')">✨ VER SHINY</button>
                <button class="shiny-btn-tag" onclick="toggleFavorite(${p.id})">⭐ ${favorites.includes(p.id) ? 'REMOVER' : 'FAVORITAR'}</button>
            </div>
        `;
    } catch (e) { content.innerHTML = "<p>Erro ao carregar detalhes.</p>"; }
}

function toggleShiny(normal, shiny) {
    const img = document.getElementById('modal-img');
    if (img) img.src = img.src === normal ? shiny : normal;
}

function randomPokemon() { showDetail(Math.floor(Math.random() * 1025) + 1); }
function closeModal() { document.getElementById('detailModal').classList.remove('show'); }
function loadFavorites() { favorites = JSON.parse(localStorage.getItem('pokeFavorites') || '[]'); }

function toggleFavorite(id) {
    if (favorites.includes(id)) { favorites = favorites.filter(f => f !== id); }
    else { favorites.push(id); }
    localStorage.setItem('pokeFavorites', JSON.stringify(favorites));
    filterPokemon();
    updateFavoritesGrid();
}

function updateFavoritesGrid() {
    const grid = document.getElementById('favoritesGrid');
    if (!grid) return;
    if (!favorites.length) { grid.innerHTML = '<p style="grid-column:1/-1; color:#888;">Sem favoritos ainda.</p>'; return; }
    grid.innerHTML = allPokemon.filter(p => favorites.includes(p.id)).map(p => `
        <div class="pokemon-card" onclick="showDetail(${p.id})">
            <button class="fav-btn active" onclick="event.stopPropagation(); toggleFavorite(${p.id})">⭐</button>
            <div class="pokemon-image"><img src="${p.image}"></div>
            <div class="pokemon-name">${p.name.toUpperCase()}</div>
        </div>
    `).join('');
}

function openCompareSelector(slot) { activeSlot = slot; document.getElementById('selectorModal').classList.add('show'); showRegions(); }
function closeSelector() { document.getElementById('selectorModal').classList.remove('show'); }

function showRegions() {
    const regionList = document.getElementById('regionList');
    document.getElementById('pokeSelectorList').style.display = 'none';
    regionList.style.display = 'grid';
    regionList.innerHTML = Object.keys(generationRanges).map(gen => `<button class="selector-btn" onclick="showPokemonByRegion(${gen})">${generationRanges[gen].name.toUpperCase()}<br><small>Gen ${gen}</small></button>`).join('');
}

function showPokemonByRegion(gen) {
    document.getElementById('regionList').style.display = 'none';
    const pokeSelectorList = document.getElementById('pokeSelectorList');
    pokeSelectorList.style.display = 'grid';
    const pokes = allPokemon.filter(p => p.id >= generationRanges[gen].start && p.id <= generationRanges[gen].end);
    pokeSelectorList.innerHTML = `<button class="selector-btn" style="grid-column:1/-1" onclick="showRegions()">⬅ VOLTAR</button>` +
        pokes.map(p => `<div class="mini-poke-card" onclick="selectForCompare(${p.id})"><img src="${p.image}"><div>${p.name.toUpperCase()}</div></div>`).join('');
}

async function selectForCompare(id) {
    let p = allPokemon.find(poke => poke.id === id);
    if (!p.stats.length) { const d = await fetch(POKE_API + '/pokemon/' + id).then(res => res.json()); p.stats = d.stats; }
    compareSlots[activeSlot] = p;
    document.getElementById('result' + activeSlot).innerHTML = `<img src="${p.image}" style="width:120px; margin-bottom:10px;"><div class="pokemon-name">${p.name.toUpperCase()}</div>`;
    closeSelector();
    updateComparison();
}

function updateComparison() {
    if (!compareSlots[1] || !compareSlots[2]) return;
    const s1 = compareSlots[1].stats, s2 = compareSlots[2].stats;
    const statNames = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
    const comparisonHTML = statNames.map((name, i) => {
        const v1 = s1[i].base_stat, v2 = s2[i].base_stat;
        const winner = v1 > v2 ? 1 : v2 > v1 ? 2 : 0;
        return `<div class="stat-comparison"><div class="stat-comparison-name" style="text-align:right;">${statTranslations[name]}</div><div class="stat-comparison-value ${winner === 1 ? 'winner' : ''}">${v1}</div><div class="stat-comparison-value ${winner === 2 ? 'winner' : ''}">${v2}</div></div>`;
    }).join('');
    document.getElementById('comparison-details').innerHTML = `<div style="margin-bottom: 20px;"><h3 style="font-family:'Orbitron'; color:var(--accent-gold); margin-bottom:15px;">COMPARAÇÃO</h3>${comparisonHTML}</div>`;
}

async function loadItems() {
    const itemGrid = document.getElementById('itemGrid');
    if (!itemGrid) return;
    try {
        const response = await fetch(POKE_API + '/item?limit=50');
        const data = await response.json();
        itemGrid.innerHTML = data.results.map(item => `<div class="pokemon-card" onclick="showItemDetail('${item.name}')"><div class="pokemon-image"><img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${item.name}.png"></div><div class="pokemon-name">${item.name.toUpperCase()}</div></div>`).join('');
    } catch (e) { itemGrid.innerHTML = '<p>Erro ao carregar itens.</p>'; }
}

async function loadPokeballs() {
    const pokeballGrid = document.getElementById('pokeballGrid');
    if (!pokeballGrid) return;
    try {
        const response = await fetch(POKE_API + '/item-category/34');
        const data = await response.json();
        pokeballGrid.innerHTML = data.items.slice(0, 20).map(item => `<div class="pokemon-card"><div class="pokemon-image"><img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${item.name}.png"></div><div class="pokemon-name">${item.name.toUpperCase()}</div></div>`).join('');
    } catch (e) { pokeballGrid.innerHTML = '<p>Erro ao carregar pokébolas.</p>'; }
}

function showItemDetail(itemName) {
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('detailContent');
    content.innerHTML = `<img class="item-detail-img" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${itemName}.png"><h2 class="item-detail-name">${itemName.toUpperCase()}</h2><p class="item-detail-desc">Item Pokémon</p>`;
    modal.classList.add('show');
}
