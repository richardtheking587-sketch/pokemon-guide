const POKE_API = 'https://pokeapi.co/api/v2';
let allPokemon = [];
let filteredPokemon = [];
let currentShinyMode = false;

const searchInput = document.getElementById('searchInput' );
const generationFilter = document.getElementById('generationFilter');
const typeFilter = document.getElementById('typeFilter');
const pokemonGrid = document.getElementById('pokemonGrid');
const detailModal = document.getElementById('detailModal');
const detailContent = document.getElementById('detailContent');
const closeBtn = document.querySelector('.close');
const regionCards = document.querySelectorAll('.region-card');

const generationRanges = {
    1: { start: 1, end: 151 }, 2: { start: 152, end: 251 }, 3: { start: 252, end: 386 },
    4: { start: 387, end: 493 }, 5: { start: 494, end: 649 }, 6: { start: 650, end: 721 },
    7: { start: 722, end: 809 }, 8: { start: 810, end: 905 }, 9: { start: 906, end: 1025 }
};

document.addEventListener('DOMContentLoaded', () => { loadPokemon(); setupEventListeners(); });

function setupEventListeners() {
    searchInput.addEventListener('input', filterPokemon);
    generationFilter.addEventListener('change', () => { updateRegionCardsActiveState(); filterPokemon(); });
    typeFilter.addEventListener('change', filterPokemon);
    closeBtn.addEventListener('click', closeModal);
    detailModal.addEventListener('click', (e) => { if (e.target === detailModal) closeModal(); });
    regionCards.forEach(card => {
        card.addEventListener('click', () => {
            const gen = card.getAttribute('data-gen');
            generationFilter.value = (generationFilter.value === gen) ? "" : gen;
            updateRegionCardsActiveState(); filterPokemon();
            document.querySelector('.search-section').scrollIntoView({ behavior: 'smooth' });
        });
    });
}

function updateRegionCardsActiveState() {
    regionCards.forEach(card => {
        card.classList.toggle('active', card.getAttribute('data-gen') === generationFilter.value);
    });
}

async function loadPokemon() {
    try {
        pokemonGrid.innerHTML = '<div class="loading">Carregando Pokémon...</div>';
        const promises = [];
        for (let i = 1; i <= 1025; i++) promises.push(fetchPokemonBasic(i));
        const batchSize = 100;
        for (let i = 0; i < promises.length; i += batchSize) {
            const batch = promises.slice(i, i + batchSize);
            const results = await Promise.all(batch);
            allPokemon.push(...results.filter(p => p !== null));
            if (i === 0) displayPokemon(allPokemon);
        }
        filteredPokemon = [...allPokemon]; displayPokemon(filteredPokemon);
    } catch (error) { pokemonGrid.innerHTML = '<div class="no-results">Erro ao carregar dados.</div>'; }
}

async function fetchPokemonBasic(id) {
    try {
        const res = await fetch(`${POKE_API}/pokemon/${id}`);
        const data = await res.json();
        return {
            id: data.id, name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
            image: data.sprites.other['official-artwork'].front_default,
            shinyImage: data.sprites.other['official-artwork'].front_shiny,
            types: data.types.map(t => t.type.name),
            stats: data.stats.reduce((acc, s) => { acc[s.stat.name] = s.base_stat; return acc; }, {}),
            height: data.height / 10, weight: data.weight / 10,
            abilities: data.abilities.map(a => a.ability.name)
        };
    } catch (e) { return null; }
}

function filterPokemon() {
    const term = searchInput.value.toLowerCase();
    const gen = generationFilter.value;
    const type = typeFilter.value;
    filteredPokemon = allPokemon.filter(p => {
        if (term && !p.name.toLowerCase().includes(term)) return false;
        if (gen) { const r = generationRanges[gen]; if (p.id < r.start || p.id > r.end) return false; }
        if (type && !p.types.includes(type)) return false;
        return true;
    });
    displayPokemon(filteredPokemon);
}

function displayPokemon(pokemon) {
    pokemonGrid.innerHTML = pokemon.map(p => `
        <div class="pokemon-card" onclick="showDetail(${p.id})">
            <div class="pokemon-image"><img src="${p.image}" alt="${p.name}"></div>
            <div class="pokemon-name">${p.name}</div>
            <div class="pokemon-id">#${String(p.id).padStart(4, '0')}</div>
            <div class="pokemon-types">${p.types.map(t => `<span class="type-badge type-${t}">${translate('types', t)}</span>`).join('')}</div>
        </div>
    `).join('');
}

async function showDetail(id) {
    detailContent.innerHTML = '<div class="loading">Carregando...</div>';
    detailModal.classList.add('show');
    const [pData, sData] = await Promise.all([
        fetch(`${POKE_API}/pokemon/${id}`).then(r => r.json()),
        fetch(`${POKE_API}/pokemon-species/${id}`).then(r => r.json())
    ]);
    let desc = sData.flavor_text_entries.find(e => e.language.name === 'pt') || sData.flavor_text_entries.find(e => e.language.name === 'en');
    desc = desc ? desc.flavor_text.replace(/\f/g, ' ') : "Sem descrição.";
    const evoRes = await fetch(sData.evolution_chain.url);
    const evoData = await evoRes.json();
    renderModalContent(pData, desc, buildEvolutionChain(evoData.chain));
}

function renderModalContent(p, desc, evoChain) {
    const normalImg = p.sprites.other['official-artwork'].front_default;
    const shinyImg = p.sprites.other['official-artwork'].front_shiny;
    detailContent.innerHTML = `
        <div class="detail-header">
            <div class="detail-image"><img id="main-pokemon-img" src="${normalImg}"></div>
            <button class="btn-shiny" onclick="toggleShiny('${normalImg}', '${shinyImg}')">✨ Ver Shiny</button>
            <div class="detail-name">${p.name.toUpperCase()}</div>
            <div class="detail-id">#${String(p.id).padStart(4, '0')}</div>
            <div>${p.types.map(t => `<span class="type-badge type-${t.type.name}">${translate('types', t.type.name)}</span>`).join('')}</div>
        </div>
        <div class="detail-description">${desc}</div>
        <div class="stats-grid">
            ${p.stats.map(s => `<div class="stat-item"><b>${translate('stats', s.stat.name)}:</b> ${s.base_stat}</div>`).join('')}
        </div>
        <div class="evolution-chain" style="margin-top:20px">
            ${evoChain.map(e => `<div class="evolution-item"><img src="${e.image}">  
${e.name}</div>`).join(' → ')}
        </div>
    `;
}

function toggleShiny(n, s) {
    const img = document.getElementById('main-pokemon-img');
    const btn = document.querySelector('.btn-shiny');
    currentShinyMode = !currentShinyMode;
    img.src = currentShinyMode ? s : n;
    btn.classList.toggle('active', currentShinyMode);
    btn.innerText = currentShinyMode ? "✨ Ver Normal" : "✨ Ver Shiny";
}

function buildEvolutionChain(chain) {
    const evos = []; let curr = chain;
    while (curr) {
        const id = curr.species.url.split('/').filter(Boolean).pop();
        evos.push({ id, name: curr.species.name, image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png` } );
        curr = curr.evolves_to[0];
    }
    return evos;
}

function closeModal() { detailModal.classList.remove('show'); }
