const POKE_API = 'https://pokeapi.co/api/v2';
let allPokemon = [];
let currentRarity = 'all';

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
    grid.innerHTML = '<div class="loading">Sincronizando...</div>';
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
    const items = ['potion', 'revive', 'rare-candy', 'lucky-egg', 'exp-share', 'sun-stone'];
    for (const name of items) {
        const data = await fetch(`${POKE_API}/item/${name}`).then(r => r.json());
        grid.innerHTML += `<div class="item-card" onclick="showItemDetail('${data.name}', '${data.sprites.default}')">
            <img src="${data.sprites.default}" class="item-img">
            <div class="item-name">${data.name.replace('-', ' ').toUpperCase()}</div>
        </div>`;
    }
}

async function loadPokeballs() {
    const grid = document.getElementById('pokeballGrid');
    const balls = ['poke-ball', 'great-ball', 'ultra-ball', 'master-ball', 'luxury-ball', 'premier-ball'];
    for (const name of balls) {
        const data = await fetch(`${POKE_API}/item/${name}`).then(r => r.json());
        grid.innerHTML += `<div class="item-card" onclick="showItemDetail('${data.name}', '${data.sprites.default}')">
            <img src="${data.sprites.default}" class="item-img">
            <div class="item-name">${data.name.replace('-', ' ').toUpperCase()}</div>
        </div>`;
    }
}

function filterByRarity(rarity) {
    currentRarity = rarity;
    document.querySelectorAll('.r-btn').forEach(b => {
        const isAll = rarity === 'all' && b.querySelector('.all-circle');
        const isSpecific = b.innerText.toLowerCase().includes(rarity);
        b.classList.toggle('active', isAll || isSpecific);
    });
    filterPokemon();
}

function filterPokemon() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const gen = document.getElementById('generationFilter').value;
    const type = document.getElementById('typeFilter').value;

    const filtered = allPokemon.filter(p => {
        const r = mythicIds.includes(p.id) ? "mitico" : legendaryIds.includes(p.id) ? "lendario" : p.base_exp >= 175 ? "raro" : "comum";
        const mRarity = currentRarity === 'all' || r === currentRarity;
        const mSearch = p.name.includes(term) || String(p.id).includes(term);
        const mGen = !gen || (p.id >= getGenRange(gen)[0] && p.id <= getGenRange(gen)[1]);
        const mType = !type || p.types.includes(type);
        return mRarity && mSearch && mGen && mType;
    });

    document.getElementById('pokemonGrid').innerHTML = filtered.map(p => {
        const r = mythicIds.includes(p.id) ? "mitico" : legendaryIds.includes(p.id) ? "lendario" : p.base_exp >= 175 ? "raro" : "comum";
        return `
        <div class="pokemon-card" onclick="showDetail(${p.id})">
            <div class="rarity-tag rarity-${r}">${r}</div>
            <div class="pokemon-image"><img src="${p.image}"></div>
            <div class="pokemon-name">${p.name.toUpperCase()}</div>
            <div class="pokemon-id">#${String(p.id).padStart(4, '0')}</div>
        </div>`;
    }).join('');
}

function getGenRange(gen) {
    const ranges = { 1:[1,151], 2:[152,251], 3:[252,386], 4:[387,493], 5:[494,649], 6:[650,721], 7:[722,809], 8:[810,905], 9:[906,1025] };
    return ranges[gen];
}

async function showDetail(id) {
    const p = allPokemon.find(poke => poke.id === id);
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('detailContent');
    content.innerHTML = '<div class="loading">Carregando...</div>';
    modal.classList.add('show');
    try {
        const species = await fetch(`${POKE_API}/pokemon-species/${id}`).then(r => r.json());
        const desc = species.flavor_text_entries.find(e => e.language.name === 'pt')?.flavor_text || 
                     species.flavor_text_entries.find(e => e.language.name === 'en')?.flavor_text || "";
        content.innerHTML = `
            <img src="${p.image}" style="width:120px">
            <h2 class="pokemon-name">${p.name.toUpperCase()}</h2>
            <div class="detail-description" style="color:#888; font-size:0.8em; margin:15px 0;">${translateDescription(desc)}</div>
            <button class="nav-btn" onclick="toggleShiny('${p.image}', '${p.shiny}')">✨ VER SHINY</button>
        `;
    } catch (e) { content.innerHTML = "Erro."; }
}

function showItemDetail(name, img) {
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('detailContent');
    modal.classList.add('show');
    content.innerHTML = `
        <img src="${img}" style="width:80px">
        <h2 class="pokemon-name">${name.toUpperCase().replace('-', ' ')}</h2>
        <p style="color:#888; font-size:0.8em; margin-top:10px;">Este é um item essencial para sua jornada Pokémon!</p>
    `;
}

function toggleShiny(n, s) {
    const img = document.querySelector('#detailContent img');
    img.src = img.src === n ? s : n;
}
