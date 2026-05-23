const POKE_API = 'https://pokeapi.co/api/v2';
let allPokemon = [];
let currentRarity = 'all';

// IDs para Raridade
const mythicIds = [151, 251, 385, 386, 489, 490, 491, 492, 493, 494, 647, 648, 649, 719, 720, 721, 801, 802, 807, 808, 809, 893];
const legendaryIds = [144, 145, 146, 150, 243, 244, 245, 249, 250, 377, 378, 379, 380, 381, 382, 383, 384, 480, 481, 482, 483, 484, 485, 486, 487, 488, 638, 639, 640, 641, 642, 643, 644, 645, 646, 716, 717, 718, 772, 773, 785, 786, 787, 788, 789, 790, 791, 792, 800, 888, 889, 890, 891, 892, 894, 895, 896, 897, 898, 1001, 1002, 1003, 1004, 1007, 1008, 1014, 1015, 1016, 1017];

document.addEventListener('DOMContentLoaded', ( ) => { 
    loadPokemon(); 
    loadItems();
    loadPokeballs();
    setupEvents(); 
});

function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`${tab}-tab`).classList.add('active');
    event.target.classList.add('active');
}

function setupEvents() {
    document.getElementById('searchInput').addEventListener('input', filterPokemon);
    document.getElementById('generationFilter').addEventListener('change', filterPokemon);
    document.getElementById('typeFilter').addEventListener('change', filterPokemon);
    document.getElementById('closeModalBtn').onclick = () => document.getElementById('detailModal').classList.remove('show');
}

async function loadPokemon() {
    const grid = document.getElementById('pokemonGrid');
    grid.innerHTML = '<div class="loading">Carregando Pokédex...</div>';
    try {
        const batchSize = 100;
        for (let i = 1; i <= 1025; i += batchSize) {
            const promises = [];
            for (let j = i; j < i + batchSize && j <= 1025; j++) {
                promises.push(fetch(`${POKE_API}/pokemon/${j}`).then(res => res.json()));
            }
            const results = await Promise.all(promises);
            results.forEach(data => {
                allPokemon.push({
                    id: data.id, name: data.name,
                    image: data.sprites.other['official-artwork'].front_default,
                    shiny: data.sprites.other['official-artwork'].front_shiny,
                    types: data.types.map(t => t.type.name),
                    base_exp: data.base_experience,
                    stats: data.stats
                });
            });
            filterPokemon();
        }
    } catch (e) { console.error(e); }
}

async function loadItems() {
    const grid = document.getElementById('itemGrid');
    const items = ['potion', 'antidote', 'revive', 'rare-candy', 'lucky-egg', 'exp-share', 'sun-stone', 'moon-stone'];
    for (const name of items) {
        const data = await fetch(`${POKE_API}/item/${name}`).then(r => r.json());
        grid.innerHTML += renderItemCard(data);
    }
}

async function loadPokeballs() {
    const grid = document.getElementById('pokeballGrid');
    const balls = ['poke-ball', 'great-ball', 'ultra-ball', 'master-ball', 'safari-ball', 'luxury-ball', 'premier-ball', 'beast-ball'];
    for (const name of balls) {
        const data = await fetch(`${POKE_API}/item/${name}`).then(r => r.json());
        grid.innerHTML += renderItemCard(data);
    }
}

function renderItemCard(data) {
    const desc = data.flavor_text_entries.find(e => e.language.name === 'en')?.text || "";
    return `
    <div class="item-card">
        <img src="${data.sprites.default}" class="item-img">
        <div class="item-name">${data.name.toUpperCase().replace('-', ' ')}</div>
        <div class="item-desc">${translateDescription(desc)}</div>
    </div>`;
}

function getRarity(p) {
    if (mythicIds.includes(p.id)) return "mitico";
    if (legendaryIds.includes(p.id)) return "lendario";
    if (p.base_exp >= 175) return "raro";
    return "comum";
}

function filterByRarity(rarity) {
    currentRarity = rarity;
    document.querySelectorAll('.r-btn').forEach(b => b.classList.toggle('active', b.innerText.toLowerCase() === rarity || (rarity === 'all' && b.innerText === 'TODOS')));
    filterPokemon();
}

function filterPokemon() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const gen = document.getElementById('generationFilter').value;
    const type = document.getElementById('typeFilter').value;

    const filtered = allPokemon.filter(p => {
        const r = getRarity(p);
        const mRarity = currentRarity === 'all' || r === currentRarity;
        const mSearch = p.name.includes(term) || String(p.id).includes(term);
        const mGen = !gen || (p.id >= getGenRange(gen).start && p.id <= getGenRange(gen).end);
        const mType = !type || p.types.includes(type);
        return mRarity && mSearch && mGen && mType;
    });

    document.getElementById('pokemonGrid').innerHTML = filtered.map(p => {
        const r = getRarity(p);
        return `
        <div class="pokemon-card" onclick="showDetail(${p.id})">
            <div class="rarity-tag rarity-${r}">${r.toUpperCase()}</div>
            <div class="pokemon-image"><img src="${p.image}"></div>
            <div class="pokemon-name">${p.name.toUpperCase()}</div>
            <div class="pokemon-id">#${String(p.id).padStart(4, '0')}</div>
            <div class="pokemon-types">${p.types.map(t => `<span class="type-badge type-${t}">${translate('types', t)}</span>`).join('')}</div>
        </div>`;
    }).join('');
}

function getGenRange(gen) {
    const ranges = { 1:[1,151], 2:[152,251], 3:[252,386], 4:[387,493], 5:[494,649], 6:[650,721], 7:[722,809], 8:[810,905], 9:[906,1025] };
    return { start: ranges[gen][0], end: ranges[gen][1] };
}

async function showDetail(id) {
    const p = allPokemon.find(poke => poke.id === id);
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('detailContent');
    content.innerHTML = '<div class="loading">Carregando...</div>';
    modal.classList.add('show');
    try {
        const species = await fetch(`${POKE_API}/pokemon-species/${id}`).then(r => r.json());
        const evoRes = await fetch(species.evolution_chain.url).then(r => r.json());
        const desc = species.flavor_text_entries.find(e => e.language.name === 'pt')?.flavor_text || 
                     species.flavor_text_entries.find(e => e.language.name === 'en')?.flavor_text || "";
        const evos = await buildEvoChain(evoRes.chain);
        content.innerHTML = `
            <div class="detail-header">
                <img id="modal-img" src="${p.image}" style="width:150px">
                <div class="detail-name">${p.name.toUpperCase()}</div>
                <button class="btn-shiny" onclick="toggleShiny('${p.image}', '${p.shiny}')">✨ VER SHINY</button>
            </div>
            <div class="detail-description">${translateDescription(desc)}</div>
            <div class="evolution-chain" style="display:flex; justify-content:center; gap:10px; margin-top:20px;">
                ${evos.map(e => `<div style="font-size:0.7em"><img src="${e.image}" style="width:50px">  
${e.name}</div>`).join(' → ')}
            </div>
        `;
    } catch (e) { content.innerHTML = "Erro ao carregar."; }
}

async function buildEvoChain(chain) {
    const evos = []; let curr = chain;
    while (curr) {
        const id = curr.species.url.split('/').filter(Boolean).pop();
        evos.push({ id, name: curr.species.name.toUpperCase(), image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png` } );
        curr = curr.evolves_to[0];
    }
    return evos;
}

function toggleShiny(n, s) {
    const img = document.getElementById('modal-img');
    img.src = img.src === n ? s : n;
}
