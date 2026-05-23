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
    regionCards.forEach(card => card.classList.toggle('active', card.getAttribute('data-gen') === generationFilter.value));
}

async function loadPokemon() {
    try {
        pokemonGrid.innerHTML = '<div class="loading">Sincronizando com a Pokédex Global...</div>';
        const promises = [];
        for (let i = 1; i <= 1025; i++) promises.push(fetchPokemonBasic(i));
        const batchSize = 100;
        for (let i = 0; i < promises.length; i += batchSize) {
            const batch = promises.slice(i, i + batchSize);
            const results = await Promise.all(batch);
            allPokemon.push(...results.filter(p => p !== null));
            if (i === 0) displayPokemon(allPokemon);
        }
        displayPokemon(allPokemon);
    } catch (error) { console.error(error); }
}

async function fetchPokemonBasic(id) {
    try {
        const res = await fetch(`${POKE_API}/pokemon/${id}`);
        const data = await res.json();
        const speciesRes = await fetch(data.species.url);
        const speciesData = await speciesRes.json();

        // Lógica de Raridade
        let rarity = "comum";
        if (speciesData.is_mythical) rarity = "mitico";
        else if (speciesData.is_legendary) rarity = "lendario";
        else if (data.base_experience > 200) rarity = "raro";

        return {
            id: data.id, name: data.name,
            image: data.sprites.other['official-artwork'].front_default,
            shinyImage: data.sprites.other['official-artwork'].front_shiny,
            types: data.types.map(t => t.type.name),
            rarity: rarity,
            stats: data.stats.reduce((acc, s) => { acc[s.stat.name] = s.base_stat; return acc; }, {}),
            height: data.height / 10, weight: data.weight / 10,
            raw: data // Guardamos os dados brutos para o modal
        };
    } catch (e) { return null; }
}

function displayPokemon(pokemon) {
    if (pokemon.length === 0) {
        pokemonGrid.innerHTML = '<div class="no-results">Nenhum Pokémon encontrado.</div>';
        return;
    }
    pokemonGrid.innerHTML = pokemon.map(p => `
        <div class="pokemon-card" onclick="showDetail(${p.id})">
            <div class="rarity-tag rarity-${p.rarity}">${translateRarity(p.rarity)}</div>
            <div class="pokemon-image"><img src="${p.image}" alt="${p.name}"></div>
            <div class="pokemon-name">${p.name.toUpperCase()}</div>
            <div class="pokemon-id">#${String(p.id).padStart(4, '0')}</div>
            <div class="pokemon-types">${p.types.map(t => `<span class="type-badge type-${t}">${translate('types', t)}</span>`).join('')}</div>
        </div>
    `).join('');
}

async function showDetail(id) {
    detailContent.innerHTML = '<div class="loading">Carregando dados do Pokémon...</div>';
    detailModal.classList.add('show');
    
    // Busca o Pokémon na nossa lista local para pegar a raridade já calculada
    const pLocal = allPokemon.find(p => p.id === id);
    const rarity = pLocal ? pLocal.rarity : "comum";

    const [pData, sData] = await Promise.all([
        fetch(`${POKE_API}/pokemon/${id}`).then(r => r.json()),
        fetch(`${POKE_API}/pokemon-species/${id}`).then(r => r.json())
    ]);
    
    let desc = sData.flavor_text_entries.find(e => e.language.name === 'pt')?.flavor_text || 
               sData.flavor_text_entries.find(e => e.language.name === 'en')?.flavor_text || "Sem descrição disponível.";
    
    const evoRes = await fetch(sData.evolution_chain.url);
    const evoData = await evoRes.json();
    
    renderModalContent(pData, desc.replace(/\f/g, ' '), buildEvolutionChain(evoData.chain), rarity);
}

function renderModalContent(p, desc, evoChain, rarity) {
    const normalImg = p.sprites.other['official-artwork'].front_default;
    const shinyImg = p.sprites.other['official-artwork'].front_shiny;
    
    detailContent.innerHTML = `
        <div class="detail-header">
            <div class="detail-image"><img id="main-pokemon-img" src="${normalImg}"></div>
            <div class="detail-rarity-buff rarity-${rarity}">✨ Raridade: ${translateRarity(rarity)}</div>
              

            <button class="btn-shiny" onclick="toggleShiny('${normalImg}', '${shinyImg}')">✨ VER VERSÃO SHINY</button>
            <div class="detail-name">${p.name.toUpperCase()}</div>
            <div class="detail-id">#${String(p.id).padStart(4, '0')}</div>
        </div>
        <div class="detail-description">${desc}</div>
        <div class="stats-grid">
            ${p.stats.map(s => `
                <div class="stat-item">
                    <b>${translate('stats', s.stat.name)}:</b> ${s.base_stat}
                    <div class="stat-bar"><div class="stat-bar-fill" style="width: ${Math.min(s.base_stat/2, 100)}%"></div></div>
                </div>
            `).join('')}
        </div>
        <div class="evolution-chain" style="margin-top:30px">
            <h3 style="width:100%; margin-bottom:15px; color:var(--primary-red)">LINHA EVOLUTIVA</h3>
            ${evoChain.map(e => `<div class="evolution-item" onclick="showDetail(${e.id})" style="cursor:pointer"><img src="${e.image}">  
${e.name}</div>`).join(' <span style="font-size:2em">→</span> ')}
        </div>
    `;
}

function translateRarity(r) {
    const names = { "comum": "Comum", "raro": "Raro", "lendario": "Lendário", "mitico": "Mítico" };
    return names[r] || r;
}

function toggleShiny(n, s) {
    const img = document.getElementById('main-pokemon-img');
    currentShinyMode = !currentShinyMode;
    img.src = currentShinyMode ? s : n;
}

function buildEvolutionChain(chain) {
    const evos = []; let curr = chain;
    while (curr) {
        const id = curr.species.url.split('/').filter(Boolean).pop();
        evos.push({ id, name: curr.species.name.toUpperCase(), image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png` } );
        curr = curr.evolves_to[0];
    }
    return evos;
}

function closeModal() { detailModal.classList.remove('show'); }
