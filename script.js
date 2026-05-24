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

document.addEventListener('DOMContentLoaded', ( ) => { 
    loadPokemon(); 
    setupEvents(); 
});

function setupEvents() {
    document.getElementById('searchInput').addEventListener('input', filterPokemon);
    document.getElementById('generationFilter').addEventListener('change', filterPokemon);
}

function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`${tab}-tab`).classList.add('active');
    const btn = document.getElementById(`btn-${tab}`);
    if (btn) btn.classList.add('active');
}

async function loadPokemon() {
    try {
        const batchSize = 150;
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
                    stats: data.stats
                });
            });
            filterPokemon();
        }
    } catch (e) {}
}

function filterPokemon() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const gen = document.getElementById('generationFilter').value;
    const filtered = allPokemon.filter(p => {
        const mSearch = p.name.includes(term) || String(p.id).includes(term);
        const mGen = !gen || (p.id >= generationRanges[gen].start && p.id <= generationRanges[gen].end);
        return mSearch && mGen;
    });
    document.getElementById('pokemonGrid').innerHTML = filtered.map(p => `
        <div class="pokemon-card" onclick="showDetail(${p.id})">
            <div class="pokemon-image"><img src="${p.image}"></div>
            <div class="pokemon-name">${p.name.toUpperCase()}</div>
            <div class="pokemon-id">#${String(p.id).padStart(4, '0')}</div>
        </div>
    `).join('');
}

// --- SISTEMA DE COMPARAÇÃO ---
function openCompareSelector(slot) {
    activeSlot = slot;
    document.getElementById('compareSelectorModal').classList.add('show');
    showRegions();
}

function showRegions() {
    document.getElementById('selectorTitle').innerText = "ESCOLHA A REGIÃO";
    document.getElementById('pokemonSelector').style.display = 'none';
    document.getElementById('regionSelector').style.display = 'grid';
    const grid = document.getElementById('regionSelector');
    grid.innerHTML = Object.keys(generationRanges).map(gen => `
        <button class="selector-btn" onclick="showPokemonByRegion(${gen})">
            ${generationRanges[gen].name.toUpperCase()}  
Geração ${gen}
        </button>
    `).join('');
}

function showPokemonByRegion(gen) {
    document.getElementById('selectorTitle').innerText = `REGIÃO ${generationRanges[gen].name.toUpperCase()}`;
    document.getElementById('regionSelector').style.display = 'none';
    document.getElementById('pokemonSelector').style.display = 'grid';
    const grid = document.getElementById('pokemonSelector');
    const pokes = allPokemon.filter(p => p.id >= generationRanges[gen].start && p.id <= generationRanges[gen].end);
    grid.innerHTML = `<button class="selector-btn" style="grid-column: 1/-1" onclick="showRegions()">⬅ VOLTAR PARA REGIÕES</button>` + 
        pokes.map(p => `
            <div class="mini-poke-btn" onclick="selectForCompare(${p.id})">
                <img src="${p.image}">
                <div style="font-size:0.5em">${p.name.toUpperCase()}</div>
            </div>
        `).join('');
}

function selectForCompare(id) {
    const p = allPokemon.find(poke => poke.id === id);
    compareSlots[activeSlot] = p;
    document.getElementById(`result${activeSlot}`).innerHTML = `
        <img src="${p.image}" style="width:150px">
        <div class="pokemon-name">${p.name.toUpperCase()}</div>
    `;
    closeCompareSelector();
    updateComparison();
}

function updateComparison() {
    if (!compareSlots[1] || !compareSlots[2]) return;
    const s1 = compareSlots[1].stats;
    const s2 = compareSlots[2].stats;
    const statsDiv = document.getElementById('comparison-stats');
    const statNames = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
    
    statsDiv.innerHTML = statNames.map((name, i) => {
        const v1 = s1[i].base_stat;
        const v2 = s2[i].base_stat;
        const w1 = v1 > v2 ? 'winner' : '';
        const w2 = v2 > v1 ? 'winner' : '';
        return `
            <div class="stat-row">
                <div class="stat-val ${w1}">${v1}</div>
                <div class="stat-label">${translate('stats', name)}</div>
                <div class="stat-val ${w2}">${v2}</div>
            </div>
        `;
    }).join('');
}

function closeCompareSelector() { document.getElementById('compareSelectorModal').classList.remove('show'); }

// --- OUTRAS FUNÇÕES ---
async function showDetail(id) {
    const p = allPokemon.find(poke => poke.id === id);
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('detailContent');
    content.innerHTML = '<div class="loading">Sincronizando...</div>';
    modal.classList.add('show');
    try {
        const species = await fetch(`${POKE_API}/pokemon-species/${id}`).then(r => r.json());
        let desc = species.flavor_text_entries.find(e => e.language.name === 'pt' || e.language.name === 'en')?.flavor_text || "";
        content.innerHTML = `
            <img id="modal-img" src="${p.image}" style="width:150px">
            <h2 class="pokemon-name">${p.name.toUpperCase()}</h2>
            <div class="detail-description" style="color:#aaa; font-size:0.85em; margin:15px 0; line-height:1.6;">${translateDescription(desc)}</div>
            <button class="nav-btn active" onclick="toggleShiny('${p.image}', '${p.shiny}')">✨ VER SHINY</button>
        `;
    } catch (e) { content.innerHTML = "Erro."; }
}

function randomPokemon() {
    const id = Math.floor(Math.random() * 1025) + 1;
    showDetail(id);
}

function closeModal() { document.getElementById('detailModal').classList.remove('show'); }
