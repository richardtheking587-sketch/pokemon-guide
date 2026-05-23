const POKE_API = 'https://pokeapi.co/api/v2';
let allPokemon = [];
const generationRanges = {
    1: { start: 1, end: 151 }, 2: { start: 152, end: 251 }, 3: { start: 252, end: 386 },
    4: { start: 387, end: 493 }, 5: { start: 494, end: 649 }, 6: { start: 650, end: 721 },
    7: { start: 722, end: 809 }, 8: { start: 810, end: 905 }, 9: { start: 906, end: 1025 }
};

// IDs Oficiais para Raridade
const mythicIds = [151, 251, 385, 386, 489, 490, 491, 492, 493, 494, 647, 648, 649, 719, 720, 721, 801, 802, 807, 808, 809, 893];
const legendaryIds = [144, 145, 146, 150, 243, 244, 245, 249, 250, 377, 378, 379, 380, 381, 382, 383, 384, 480, 481, 482, 483, 484, 485, 486, 487, 488, 638, 639, 640, 641, 642, 643, 644, 645, 646, 716, 717, 718, 772, 773, 785, 786, 787, 788, 789, 790, 791, 792, 800, 888, 889, 890, 891, 892, 894, 895, 896, 897, 898, 1001, 1002, 1003, 1004, 1007, 1008, 1014, 1015, 1016, 1017];

document.addEventListener('DOMContentLoaded', ( ) => { loadPokemon(); setupEvents(); });

function setupEvents() {
    document.getElementById('searchInput').addEventListener('input', filterPokemon);
    document.getElementById('generationFilter').addEventListener('change', filterPokemon);
    document.getElementById('typeFilter').addEventListener('change', filterPokemon);
    document.getElementById('closeModalBtn').onclick = () => document.getElementById('detailModal').classList.remove('show');
    window.onclick = (e) => { if (e.target == document.getElementById('detailModal')) document.getElementById('detailModal').classList.remove('show'); };
    document.querySelectorAll('.region-card').forEach(card => {
        card.addEventListener('click', () => {
            document.getElementById('generationFilter').value = (document.getElementById('generationFilter').value === card.getAttribute('data-gen')) ? "" : card.getAttribute('data-gen');
            filterPokemon();
        });
    });
}

async function loadPokemon() {
    const grid = document.getElementById('pokemonGrid');
    grid.innerHTML = '<div class="loading">Sincronizando Pokédex...</div>';
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

function getRarity(p) {
    if (mythicIds.includes(p.id)) return "mítico";
    if (legendaryIds.includes(p.id)) return "lendário";
    if (p.base_exp >= 175) return "raro";
    return "comum";
}

function filterPokemon() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const gen = document.getElementById('generationFilter').value;
    const type = document.getElementById('typeFilter').value;

    const filtered = allPokemon.filter(p => {
        const mSearch = p.name.includes(term) || String(p.id).includes(term);
        const mGen = !gen || (p.id >= generationRanges[gen].start && p.id <= generationRanges[gen].end);
        const mType = !type || p.types.includes(type);
        return mSearch && mGen && mType;
    });

    document.getElementById('pokemonGrid').innerHTML = filtered.map(p => {
        const r = getRarity(p);
        const rClass = r.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return `
        <div class="pokemon-card" onclick="showDetail(${p.id})">
            <div class="rarity-tag rarity-${rClass}">${r.toUpperCase()}</div>
            <div class="pokemon-image"><img src="${p.image}"></div>
            <div class="pokemon-name">${p.name.toUpperCase()}</div>
            <div class="pokemon-id">#${String(p.id).padStart(4, '0')}</div>
            <div class="pokemon-types">${p.types.map(t => `<span class="type-badge type-${t}">${translate('types', t)}</span>`).join('')}</div>
        </div>`;
    }).join('');
    
    document.querySelectorAll('.region-card').forEach(c => c.classList.toggle('active', c.getAttribute('data-gen') === gen));
}

async function showDetail(id) {
    const p = allPokemon.find(poke => poke.id === id);
    if (!p) return;
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('detailContent');
    content.innerHTML = '<div class="loading">Carregando dados...</div>';
    modal.classList.add('show');

    try {
        const species = await fetch(`${POKE_API}/pokemon-species/${id}`).then(r => r.json());
        const evoRes = await fetch(species.evolution_chain.url).then(r => r.json());
        const desc = species.flavor_text_entries.find(e => e.language.name === 'pt')?.flavor_text || 
                     species.flavor_text_entries.find(e => e.language.name === 'en')?.flavor_text || "Sem descrição.";
        
        const r = getRarity(p);
        const rClass = r.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const evos = await buildEvoChain(evoRes.chain);

        content.innerHTML = `
            <div class="detail-header">
                <div class="detail-image"><img id="modal-img" src="${p.image}"></div>
                <div class="detail-rarity-buff rarity-${rClass}">✨ RARIDADE: ${r.toUpperCase()}</div>
                  

                <button class="btn-shiny" onclick="toggleShiny('${p.image}', '${p.shiny}')">✨ VER SHINY</button>
                <div class="detail-name">${p.name.toUpperCase()}</div>
                <div class="detail-id">#${String(p.id).padStart(4, '0')}</div>
            </div>
            <div class="detail-description">${desc.replace(/\f/g, ' ')}</div>
            <div class="stats-grid">
                ${p.stats.map(s => `<div class="stat-item"><b>${translate('stats', s.stat.name)}:</b> ${s.base_stat}<div class="stat-bar"><div class="stat-bar-fill" style="width: ${Math.min(s.base_stat/2, 100)}%"></div></div></div>`).join('')}
            </div>
            <div class="evolution-chain">
                <h3 style="width:100%; color:var(--primary-red); margin-bottom:10px;">LINHA EVOLUTIVA</h3>
                ${evos.map(e => `<div class="evolution-item" onclick="showDetail(${e.id})" style="cursor:pointer"><img src="${e.image}">  
${e.name}</div>`).join(' → ')}
            </div>
        `;
    } catch (e) { content.innerHTML = "Erro ao carregar detalhes."; }
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
