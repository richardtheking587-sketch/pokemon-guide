const POKE_API = 'https://pokeapi.co/api/v2';
let allPokemon = [];
let filteredPokemon = [];

const searchInput = document.getElementById('searchInput' );
const generationFilter = document.getElementById('generationFilter');
const typeFilter = document.getElementById('typeFilter');
const pokemonGrid = document.getElementById('pokemonGrid');
const detailModal = document.getElementById('detailModal');
const detailContent = document.getElementById('detailContent');
const closeModalBtn = document.getElementById('closeModalBtn');
const regionCards = document.querySelectorAll('.region-card');

const generationRanges = {
    1: { start: 1, end: 151 }, 2: { start: 152, end: 251 }, 3: { start: 252, end: 386 },
    4: { start: 387, end: 493 }, 5: { start: 494, end: 649 }, 6: { start: 650, end: 721 },
    7: { start: 722, end: 809 }, 8: { start: 810, end: 905 }, 9: { start: 906, end: 1025 }
};

// Listas de IDs para precisão total
const mythicIds = [151, 251, 385, 386, 489, 490, 491, 492, 493, 494, 647, 648, 649, 719, 720, 721, 801, 802, 807, 808, 809, 893];
const legendaryIds = [144, 145, 146, 150, 243, 244, 245, 249, 250, 377, 378, 379, 380, 381, 382, 383, 384, 480, 481, 482, 483, 484, 485, 486, 487, 488, 638, 639, 640, 641, 642, 643, 644, 645, 646, 716, 717, 718, 772, 773, 785, 786, 787, 788, 789, 790, 791, 792, 800, 888, 889, 890, 891, 892, 894, 895, 896, 897, 898, 1001, 1002, 1003, 1004, 1007, 1008, 1014, 1015, 1016, 1017];

document.addEventListener('DOMContentLoaded', () => { loadPokemon(); setupEvents(); });

function setupEvents() {
    searchInput.addEventListener('input', filterPokemon);
    generationFilter.addEventListener('change', filterPokemon);
    typeFilter.addEventListener('change', filterPokemon);
    closeModalBtn.onclick = () => detailModal.classList.remove('show');
    window.onclick = (e) => { if (e.target == detailModal) detailModal.classList.remove('show'); };
    regionCards.forEach(card => {
        card.addEventListener('click', () => {
            const gen = card.getAttribute('data-gen');
            generationFilter.value = (generationFilter.value === gen) ? "" : gen;
            filterPokemon();
            window.scrollTo({ top: searchInput.offsetTop - 50, behavior: 'smooth' });
        });
    });
}

async function loadPokemon() {
    pokemonGrid.innerHTML = '<div class="loading">Carregando Pokédex...</div>';
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
                    id: data.id,
                    name: data.name,
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

function getRarity(p) {
    if (mythicIds.includes(p.id)) return "mítico";
    if (legendaryIds.includes(p.id)) return "lendário";
    // Se não for lendário/mítico, mas tiver exp alta ou for estágio final, é Raro
    if (p.base_exp >= 170) return "raro";
    return "comum";
}

function filterPokemon() {
    const term = searchInput.value.toLowerCase();
    const gen = generationFilter.value;
    const type = typeFilter.value;

    filteredPokemon = allPokemon.filter(p => {
        const matchesSearch = p.name.includes(term) || String(p.id).includes(term);
        const matchesGen = !gen || (p.id >= generationRanges[gen].start && p.id <= generationRanges[gen].end);
        const matchesType = !type || p.types.includes(type);
        return matchesSearch && matchesGen && matchesType;
    });

    renderGrid();
    updateRegionCards();
}

function renderGrid() {
    pokemonGrid.innerHTML = filteredPokemon.map(p => {
        const rarity = getRarity(p);
        return `
        <div class="pokemon-card" onclick="showDetail(${p.id})">
            <div class="rarity-tag rarity-${rarity.normalize("NFD").replace(/[\u0300-\u036f]/g, "")}">${rarity.toUpperCase()}</div>
            <div class="pokemon-image"><img src="${p.image}" alt="${p.name}"></div>
            <div class="pokemon-name">${p.name.toUpperCase()}</div>
            <div class="pokemon-id">#${String(p.id).padStart(4, '0')}</div>
            <div class="pokemon-types">
                ${p.types.map(t => `<span class="type-badge type-${t}">${translate('types', t)}</span>`).join('')}
            </div>
        </div>`;
    }).join('');
}

function updateRegionCards() {
    regionCards.forEach(card => card.classList.toggle('active', card.getAttribute('data-gen') === generationFilter.value));
}

async function showDetail(id) {
    const p = allPokemon.find(poke => poke.id === id);
    if (!p) return;
    detailContent.innerHTML = '<div class="loading">Buscando detalhes...</div>';
    detailModal.classList.add('show');
    try {
        const speciesRes = await fetch(`${POKE_API}/pokemon-species/${id}`).then(r => r.json());
        const desc = speciesRes.flavor_text_entries.find(e => e.language.name === 'pt')?.flavor_text || 
                     speciesRes.flavor_text_entries.find(e => e.language.name === 'en')?.flavor_text || "Sem descrição.";
        const rarity = getRarity(p);
        detailContent.innerHTML = `
            <div class="detail-header">
                <div class="detail-image"><img id="modal-img" src="${p.image}"></div>
                <div class="detail-rarity-buff rarity-${rarity.normalize("NFD").replace(/[\u0300-\u036f]/g, "")}">✨ Raridade: ${rarity.toUpperCase()}</div>
                  

                <button class="btn-shiny" onclick="toggleShiny('${p.image}', '${p.shiny}')">✨ VER SHINY</button>
                <div class="detail-name">${p.name.toUpperCase()}</div>
                <div class="detail-id">#${String(p.id).padStart(4, '0')}</div>
            </div>
            <div class="detail-description">${desc.replace(/\f/g, ' ')}</div>
            <div class="stats-grid">
                ${p.stats.map(s => `
                    <div class="stat-item">
                        <b>${translate('stats', s.stat.name)}:</b> ${s.base_stat}
                        <div class="stat-bar"><div class="stat-bar-fill" style="width: ${Math.min(s.base_stat/2, 100)}%"></div></div>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (e) { detailContent.innerHTML = "Erro ao carregar."; }
}

function toggleShiny(normal, shiny) {
    const img = document.getElementById('modal-img');
    img.src = img.src === normal ? shiny : normal;
}
