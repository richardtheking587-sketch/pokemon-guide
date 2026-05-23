const POKE_API = 'https://pokeapi.co/api/v2';
let allPokemon = [];
let itemStorage = {}; 
let currentRarity = 'all';

// Configuração das Gerações e Regiões
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

// IDs para Filtros de Raridade
const mythicIds = [151, 251, 385, 386, 489, 490, 491, 492, 493, 494, 647, 648, 649, 719, 720, 721, 801, 802, 807, 808, 809, 893];
const legendaryIds = [144, 145, 146, 150, 243, 244, 245, 249, 250, 377, 378, 379, 380, 381, 382, 383, 384, 480, 481, 482, 483, 484, 485, 486, 487, 488, 638, 639, 640, 641, 642, 643, 644, 645, 646, 716, 717, 718, 772, 773, 785, 786, 787, 788, 789, 790, 791, 792, 800, 888, 889, 890, 891, 892, 894, 895, 896, 897, 898, 1001, 1002, 1003, 1004, 1007, 1008, 1014, 1015, 1016, 1017];

document.addEventListener('DOMContentLoaded', ( ) => { 
    loadPokemon(); 
    loadItems(); 
    loadPokeballs(); 
    setupEvents(); 
});

function setupEvents() {
    document.getElementById('searchInput').addEventListener('input', filterPokemon);
    document.getElementById('generationFilter').addEventListener('change', filterPokemon);
    document.getElementById('typeFilter').addEventListener('change', filterPokemon);
    document.getElementById('closeModalBtn').onclick = closeModal;
}

function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`${tab}-tab`).classList.add('active');
    document.getElementById(`btn-${tab}`).classList.add('active');
}

async function loadPokemon() {
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
                    base_exp: data.base_experience
                });
            });
            filterPokemon();
        }
    } catch (e) {}
}

async function loadItems() {
    const grid = document.getElementById('itemGrid');
    const items = ['potion', 'super-potion', 'hyper-potion', 'max-potion', 'revive', 'rare-candy', 'sun-stone', 'moon-stone', 'fire-stone', 'thunder-stone', 'water-stone'];
    for (const name of items) {
        try {
            const data = await fetch(`${POKE_API}/item/${name}`).then(r => r.json());
            const desc = data.flavor_text_entries.find(e => e.language.name === 'en')?.text || "Item de aventura.";
            itemStorage[data.name] = { img: data.sprites.default, desc: desc };
            grid.innerHTML += `<div class="item-card" onclick="openItemModal('${data.name}')"><img src="${data.sprites.default}" class="item-img"><div class="item-name">${data.name.toUpperCase().replace(/-/g, ' ')}</div></div>`;
        } catch(e) {}
    }
}

async function loadPokeballs() {
    const grid = document.getElementById('pokeballGrid');
    const balls = ['poke-ball', 'great-ball', 'ultra-ball', 'master-ball', 'safari-ball', 'luxury-ball', 'quick-ball', 'dusk-ball', 'beast-ball', 'love-ball', 'heavy-ball'];
    for (const name of balls) {
        try {
            const data = await fetch(`${POKE_API}/item/${name}`).then(r => r.json());
            const desc = data.flavor_text_entries.find(e => e.language.name === 'en')?.text || "Pokébola especial.";
            itemStorage[data.name] = { img: data.sprites.default, desc: desc };
            grid.innerHTML += `<div class="item-card" onclick="openItemModal('${data.name}')"><img src="${data.sprites.default}" class="item-img"><div class="item-name">${data.name.toUpperCase().replace(/-/g, ' ')}</div></div>`;
        } catch(e) {}
    }
}

function openItemModal(name) {
    const item = itemStorage[name];
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('detailContent');
    content.innerHTML = `<img src="${item.img}" style="width:80px"><h2 class="pokemon-name" style="color:var(--accent-gold); margin:15px 0;">${name.toUpperCase().replace(/-/g, ' ')}</h2><div style="color:#aaa; font-size:0.85em; line-height:1.5; padding: 10px;">${translateDescription(item.desc)}</div>`;
    modal.classList.add('show');
}

function filterByRarity(rarity) {
    currentRarity = rarity;
    document.querySelectorAll('.r-btn').forEach(b => {
        const isAll = rarity === 'all' && b.innerText.includes('TODOS');
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
        const mGen = !gen || (p.id >= generationRanges[gen].start && p.id <= generationRanges[gen].end);
        const mType = !type || p.types.includes(type);
        return mRarity && mSearch && mGen && mType;
    });

    document.getElementById('pokemonGrid').innerHTML = filtered.map(p => {
        const r = mythicIds.includes(p.id) ? "mitico" : legendaryIds.includes(p.id) ? "lendario" : p.base_exp >= 175 ? "raro" : "comum";
        return `<div class="pokemon-card" onclick="showDetail(${p.id})"><div class="rarity-tag rarity-${r}">${r.toUpperCase()}</div><div class="pokemon-image"><img src="${p.image}"></div><div class="pokemon-name">${p.name.toUpperCase()}</div><div class="pokemon-id">#${String(p.id).padStart(4, '0')}</div></div>`;
    }).join('');
}

// AQUI ESTÁ A FUNÇÃO QUE VOCÊ PROCURAVA!
async function showDetail(id) {
    const p = allPokemon.find(poke => poke.id === id);
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('detailContent');
    content.innerHTML = '<div class="loading">Sincronizando...</div>';
    modal.classList.add('show');
    try {
        const species = await fetch(`${POKE_API}/pokemon-species/${id}`).then(r => r.json());
        const evoRes = await fetch(species.evolution_chain.url).then(r => r.json());
        
        // Tradução Inteligente
        let descEntry = species.flavor_text_entries.find(e => e.language.name === 'pt') || species.flavor_text_entries.find(e => e.language.name === 'en');
        const evos = await buildEvoChain(evoRes.chain);
        
        // Encontra a Região
        let region = "Desconhecida";
        for (const g in generationRanges) {
            if (id >= generationRanges[g].start && id <= generationRanges[g].end) {
                region = generationRanges[g].name;
                break;
            }
        }

        content.innerHTML = `
            <img id="modal-img" src="${p.image}" style="width:120px">
            <h2 class="pokemon-name">${p.name.toUpperCase()}</h2>
            <div style="color:var(--primary-red); font-size:0.7em; font-family:'Orbitron'; margin-bottom:10px;">REGIÃO: ${region.toUpperCase()}</div>
            <div class="detail-description" style="color:#aaa; font-size:0.8em; margin:15px 0; padding: 0 10px; line-height:1.6;">${translateDescription(descEntry ? descEntry.flavor_text : "Sem descrição.")}</div>
            <button class="nav-btn active" style="margin-bottom:15px" onclick="toggleShiny('${p.image}', '${p.shiny}')">✨ VER SHINY</button>
            <div class="evolution-chain" style="display:flex; justify-content:center; gap:10px; margin-top:20px; flex-wrap:wrap; border-top:1px solid #333; padding-top:15px;">
                <h4 style="width:100%; color:var(--primary-red); font-size:0.7em; margin-bottom:10px;">LINHA EVOLUTIVA</h4>
                ${evos.map(e => `<div class="evolution-item" onclick="showDetail(${e.id})" style="cursor:pointer; text-align:center;"><img src="${e.image}" style="width:50px">  
<span style="font-size:0.6em;">${e.name}</span></div>`).join(' → ')}
            </div>
        `;
    } catch (e) { content.innerHTML = "Erro."; }
}

async function buildEvoChain(chain) {
    const evos = []; let curr = chain;
    while (curr) {
        const id = curr.species.url.split('/').filter(Boolean).pop();
        evos.push({ id: parseInt(id), name: curr.species.name.toUpperCase(), image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png` } );
        curr = curr.evolves_to[0];
    }
    return evos;
}

function toggleShiny(n, s) {
    const img = document.getElementById('modal-img');
    img.src = img.src === n ? s : n;
}

function closeModal() { document.getElementById('detailModal').classList.remove('show'); }
