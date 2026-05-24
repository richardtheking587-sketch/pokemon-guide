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

const statTranslations = {
    'hp': 'HP', 'attack': 'Ataque', 'defense': 'Defesa',
    'special-attack': 'Atq. Especial', 'special-defense': 'Def. Especial', 'speed': 'Velocidade'
};

document.addEventListener('DOMContentLoaded', () => {
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
            image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/' + (index + 1) + '.png',
            shiny: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/' + (index + 1) + '.png',
            types: [],
            stats: []
        }));
        filterPokemon();
        loadDetailedData();
    } catch (e) { console.error(e); }
}

async function loadDetailedData() {
    const batchSize = 50;
    for (let i = 0; i < allPokemon.length; i += batchSize) {
        const batch = allPokemon.slice(i, i + batchSize);
        await Promise.all(batch.map(p =>
            fetch(POKE_API + '/pokemon/' + p.id).then(res => res.json()).then(data => {
                const poke = allPokemon.find(item => item.id === data.id);
                if (poke) {
                    poke.types = data.types.map(t => t.type.name);
                    poke.stats = data.stats;
                }
            })
        ));
    }
}

// ===== FAVORITOS =====
function getFavorites() {
    return JSON.parse(localStorage.getItem('pokeFavorites') || '[]');
}

function isFavorited(id) {
    return getFavorites().includes(id);
}

function toggleFavoriteCard(event, id) {
    // Impede que o clique no botão abra o modal de detalhes
    event.stopPropagation();

    let favs = getFavorites();
    const btn = event.currentTarget;
    const card = btn.closest('.pokemon-card');

    if (favs.includes(id)) {
        favs = favs.filter(f => f !== id);
        btn.textContent = '☆';
        btn.classList.remove('active');
        if (card) card.classList.remove('favorited');
        showFavToast('Removido dos favoritos!', false);
    } else {
        favs.push(id);
        btn.textContent = '⭐';
        btn.classList.add('active');
        if (card) card.classList.add('favorited');
        showFavToast('Adicionado aos favoritos! ⭐', true);
    }
    localStorage.setItem('pokeFavorites', JSON.stringify(favs));
    updateFavoritesGrid();
}

function toggleFavorite(id) {
    let favs = getFavorites();
    if (favs.includes(id)) {
        favs = favs.filter(f => f !== id);
        showFavToast('Removido dos favoritos!', false);
    } else {
        favs.push(id);
        showFavToast('Adicionado aos favoritos! ⭐', true);
    }
    localStorage.setItem('pokeFavorites', JSON.stringify(favs));
    updateFavoritesGrid();
    filterPokemon();
}

// Toast de notificação de favorito
function showFavToast(msg, added) {
    let toast = document.getElementById('favToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'favToast';
        toast.style.cssText = `
            position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
            background: ${added ? 'rgba(255,215,0,0.15)' : 'rgba(255,31,31,0.15)'};
            border: 1px solid ${added ? '#ffd700' : '#ff1f1f'};
            color: ${added ? '#ffd700' : '#ff6666'};
            padding: 12px 24px; border-radius: 8px;
            font-family: 'Orbitron', sans-serif; font-size: 0.75em; letter-spacing: 1px;
            z-index: 99999; transition: opacity 0.4s; pointer-events: none;
            backdrop-filter: blur(10px);
        `;
        document.body.appendChild(toast);
    }
    toast.style.background = added ? 'rgba(255,215,0,0.15)' : 'rgba(255,31,31,0.15)';
    toast.style.borderColor = added ? '#ffd700' : '#ff1f1f';
    toast.style.color = added ? '#ffd700' : '#ff6666';
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => { toast.style.opacity = '0'; }, 2500);
}

// ===== FILTRO E GRID =====
function filterPokemon() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const gen = document.getElementById('generationFilter').value;
    const favs = getFavorites();
    const filtered = allPokemon.filter(p => {
        const mSearch = p.name.includes(term) || String(p.id).includes(term);
        const mGen = !gen || (p.id >= generationRanges[gen].start && p.id <= generationRanges[gen].end);
        return mSearch && mGen;
    });
    const grid = document.getElementById('pokemonGrid');
    if (grid) {
        grid.innerHTML = filtered.map(p => {
            const faved = favs.includes(p.id);
            return `
                <div class="pokemon-card${faved ? ' favorited' : ''}" onclick="showDetail(${p.id})">
                    <button class="fav-btn${faved ? ' active' : ''}" 
                        onclick="toggleFavoriteCard(event, ${p.id})" 
                        title="${faved ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}"
                    >${faved ? '⭐' : '☆'}</button>
                    <div class="pokemon-image"><img src="${p.image}" loading="lazy"></div>
                    <div class="pokemon-name">${p.name.toUpperCase()}</div>
                    <div class="pokemon-id">#${String(p.id).padStart(4, '0')}</div>
                </div>
            `;
        }).join('');
    }
}

// ===== DETALHES DO POKÉMON =====
async function showDetail(id) {
    const p = allPokemon.find(poke => poke.id === id);
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('detailContent');
    if (!modal || !content) return;
    content.innerHTML = '<div class="loading">Sincronizando Dados...</div>';
    modal.classList.add('show');
    try {
        const species = await fetch(POKE_API + '/pokemon-species/' + id).then(r => r.json());
        let desc = species.flavor_text_entries.find(e => e.language.name === 'pt' || e.language.name === 'en')?.flavor_text || "";

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

        const faved = isFavorited(id);

        content.innerHTML = `
            <img id="modal-img" src="${p.image}" style="width:180px">
            <h2 class="pokemon-name">${p.name.toUpperCase()}</h2>
            <div class="types-container">${p.types.map(t => `<span class="type-badge ${t}">${t.toUpperCase()}</span>`).join('')}</div>
            
            <div class="detail-description" style="color:#eee; font-size:0.9em; margin:15px 0; line-height:1.6; background:rgba(0,0,0,0.3); padding:10px; border-radius:8px;">
                ${typeof translateDescription === 'function' ? translateDescription(desc) : desc.replace(/\f/g, ' ')}
            </div>

            <div class="battle-info" style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin:15px 0; font-size:0.8em;">
                <div style="background:#222; padding:10px; border-radius:8px;">
                    <strong style="color:#ff4422">FRAQUEZAS</strong><br>
                    ${weaknesses.map(t => `<span class="type-badge ${t}" style="padding:2px 5px; font-size:0.7em">${t.toUpperCase()}</span>`).join(' ')}
                </div>
                <div style="background:#222; padding:10px; border-radius:8px;">
                    <strong style="color:#77cc55">VANTAGENS</strong><br>
                    ${strengths.map(t => `<span class="type-badge ${t}" style="padding:2px 5px; font-size:0.7em">${t.toUpperCase()}</span>`).join(' ')}
                </div>
            </div>

            <div class="evolution-chain" style="margin-top:20px;">
                <strong style="font-size:0.8em; color:#ffd700">LINHA EVOLUTIVA</strong>
                <div style="display:flex; justify-content:center; align-items:center; gap:10px; margin-top:10px;">
                    ${evolutions.map((evo, i) => `
                        <div style="text-align:center">
                            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evo.id}.png" style="width:50px; cursor:pointer" onclick="showDetail(${evo.id})">
                            <div style="font-size:0.6em">${evo.name.toUpperCase()}</div>
                        </div>
                        ${i < evolutions.length - 1 ? '<span style="color:#444">➔</span>' : ''}
                    `).join('')}
                </div>
            </div>

            <div class="modal-actions" style="margin-top:20px">
                <button class="action-btn" onclick="toggleShiny('${p.image}', '${p.shiny}')">✨ VER SHINY</button>
                <button class="action-btn" id="favModalBtn" onclick="toggleFavoriteModal(${p.id})" 
                    style="${faved ? 'background:#b8860b; box-shadow: 0 0 10px rgba(255,215,0,0.4);' : ''}">
                    ${faved ? '⭐ FAVORITADO' : '☆ FAVORITAR'}
                </button>
            </div>
        `;
    } catch (e) { content.innerHTML = "Erro ao carregar."; }
}

function toggleFavoriteModal(id) {
    toggleFavorite(id);
    const faved = isFavorited(id);
    const btn = document.getElementById('favModalBtn');
    if (btn) {
        btn.textContent = faved ? '⭐ FAVORITADO' : '☆ FAVORITAR';
        btn.style.background = faved ? '#b8860b' : '';
        btn.style.boxShadow = faved ? '0 0 10px rgba(255,215,0,0.4)' : '';
    }
}

function toggleShiny(normal, shiny) {
    const img = document.getElementById('modal-img');
    if (img) img.src = img.src === normal ? shiny : normal;
}

function randomPokemon() { showDetail(Math.floor(Math.random() * 1025) + 1); }
function closeModal() { document.getElementById('detailModal').classList.remove('show'); }

// ===== GRID DE FAVORITOS =====
function updateFavoritesGrid() {
    const favs = getFavorites();
    const grid = document.getElementById('favoritesGrid');
    if (!grid) return;
    if (!favs.length) {
        grid.innerHTML = '<p style="grid-column:1/-1; color:#555; text-align:center; font-family:Orbitron; font-size:0.8em; padding:40px;">Nenhum favorito ainda.<br><span style="color:#333; font-size:0.8em">Clique na ⭐ nos cards para favoritar!</span></p>';
        return;
    }
    grid.innerHTML = allPokemon.filter(p => favs.includes(p.id)).map(p => `
        <div class="pokemon-card favorited" onclick="showDetail(${p.id})">
            <button class="fav-btn active" onclick="toggleFavoriteCard(event, ${p.id})" title="Remover dos favoritos">⭐</button>
            <div class="pokemon-image"><img src="${p.image}"></div>
            <div class="pokemon-name">${p.name.toUpperCase()}</div>
            <div class="pokemon-id">#${String(p.id).padStart(4, '0')}</div>
        </div>
    `).join('');
}

// ===== COMPARAÇÃO =====
function openCompareSelector(slot) { activeSlot = slot; document.getElementById('compareSelectorModal').classList.add('show'); showRegions(); }
function closeCompareSelector() { document.getElementById('compareSelectorModal').classList.remove('show'); }

function showRegions() {
    document.getElementById('selectorTitle').innerText = "ESCOLHA A REGIÃO";
    document.getElementById('pokemonSelector').style.display = 'none';
    const reg = document.getElementById('regionSelector');
    reg.style.display = 'grid';
    reg.innerHTML = Object.keys(generationRanges).map(gen => `
        <button class="selector-btn" onclick="showPokemonByRegion(${gen})">${generationRanges[gen].name.toUpperCase()}<br><small>Geração ${gen}</small></button>
    `).join('');
}

function showPokemonByRegion(gen) {
    document.getElementById('selectorTitle').innerText = 'REGIÃO ' + generationRanges[gen].name.toUpperCase();
    document.getElementById('regionSelector').style.display = 'none';
    const pSel = document.getElementById('pokemonSelector');
    pSel.style.display = 'grid';
    const pokes = allPokemon.filter(p => p.id >= generationRanges[gen].start && p.id <= generationRanges[gen].end);
    pSel.innerHTML = `<button class="selector-btn" style="grid-column:1/-1" onclick="showRegions()">⬅ VOLTAR</button>` +
        pokes.map(p => `<div class="mini-poke-btn" onclick="selectForCompare(${p.id})"><img src="${p.image}"><div style="font-size:0.7em">${p.name.toUpperCase()}</div></div>`).join('');
}

async function selectForCompare(id) {
    let p = allPokemon.find(poke => poke.id === id);
    if (!p.stats.length) {
        const d = await fetch(POKE_API + '/pokemon/' + id).then(res => res.json());
        p.stats = d.stats;
    }
    compareSlots[activeSlot] = p;
    document.getElementById('result' + activeSlot).innerHTML = `<img src="${p.image}" style="width:120px"><div class="pokemon-name">${p.name.toUpperCase()}</div>`;
    closeCompareSelector();
    updateComparison();
}

function updateComparison() {
    if (!compareSlots[1] || !compareSlots[2]) return;
    const s1 = compareSlots[1].stats, s2 = compareSlots[2].stats;
    const statNames = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
    document.getElementById('comparison-stats').innerHTML = statNames.map((name, i) => {
        const v1 = s1[i].base_stat, v2 = s2[i].base_stat;
        return `
            <div class="stat-row">
                <div class="stat-val ${v1 > v2 ? 'winner' : ''}">${v1}</div>
                <div class="stat-label">${statTranslations[name]}</div>
                <div class="stat-val ${v2 > v1 ? 'winner' : ''}">${v2}</div>
            </div>
        `;
    }).join('') + `<button class="action-btn" style="width:100%; margin-top:20px" onclick="battleResult()">⚔️ QUEM VENCE?</button>`;
}

// ===== TELA DE VITÓRIA PERSONALIZADA =====
function battleResult() {
    const p1 = compareSlots[1];
    const p2 = compareSlots[2];
    if (!p1 || !p2) return;

    const total1 = p1.stats.reduce((acc, s) => acc + s.base_stat, 0);
    const total2 = p2.stats.reduce((acc, s) => acc + s.base_stat, 0);

    let winner, loser, winnerTotal, loserTotal;
    if (total1 > total2) {
        winner = p1; loser = p2; winnerTotal = total1; loserTotal = total2;
    } else if (total2 > total1) {
        winner = p2; loser = p1; winnerTotal = total2; loserTotal = total1;
    } else {
        // Empate
        showVictoryModal(null, total1, total2);
        return;
    }

    showVictoryModal(winner, winnerTotal, loserTotal, loser);
}

function showVictoryModal(winner, total1, total2, loser) {
    const modal = document.getElementById('victoryModal');
    const img = document.getElementById('victoryPokemonImg');
    const nameEl = document.getElementById('victoryPokemonName');
    const statsEl = document.getElementById('victoryStatsSummary');

    if (!winner) {
        // Empate
        img.src = compareSlots[1].image;
        nameEl.textContent = 'EMPATE!';
        statsEl.innerHTML = `<strong>Total de Stats:</strong> ${total1} × ${total2} — Igualmente poderosos!`;
    } else {
        img.src = winner.image;
        nameEl.textContent = winner.name.toUpperCase();
        const diff = total1 - total2;
        statsEl.innerHTML = `<strong>Total de Stats:</strong> ${total1} pts &nbsp;|&nbsp; Vantagem: +${diff} sobre ${loser.name.toUpperCase()}`;
    }

    // Gera partículas
    generateParticles();

    modal.classList.add('show');
    modal.style.display = 'flex';
}

function generateParticles() {
    const container = document.getElementById('victoryParticles');
    container.innerHTML = '';
    const colors = ['#ffd700', '#ff4422', '#ffffff', '#ff9900', '#ffee44'];
    for (let i = 0; i < 40; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        p.style.width = (Math.random() * 6 + 3) + 'px';
        p.style.height = p.style.width;
        p.style.animationDuration = (Math.random() * 3 + 2) + 's';
        p.style.animationDelay = (Math.random() * 2) + 's';
        container.appendChild(p);
    }
}

function closeVictoryModal() {
    const modal = document.getElementById('victoryModal');
    modal.style.display = 'none';
    modal.classList.remove('show');
    document.getElementById('victoryParticles').innerHTML = '';
}

// ===== ITENS =====
async function loadItems() {
    const grid = document.getElementById('itemGrid');
    if (!grid || grid.innerHTML.trim()) return;
    grid.innerHTML = '<div class="loading">Carregando itens...</div>';
    try {
        const r = await fetch(POKE_API + '/item?limit=50');
        const d = await r.json();
        const items = await Promise.all(d.results.map(item => fetch(item.url).then(r => r.json())));
        grid.innerHTML = items.map(item => `
            <div class="pokemon-card">
                <div class="pokemon-image"><img src="${item.sprites?.default || ''}" style="width:60px; image-rendering:pixelated"></div>
                <div class="pokemon-name">${typeof getTranslatedItemName === 'function' ? getTranslatedItemName(item.name) : item.name.toUpperCase()}</div>
                <div class="pokemon-id" style="font-size:0.7em; margin-top:5px; color:#555">${item.category?.name?.toUpperCase() || ''}</div>
            </div>
        `).join('');
    } catch (e) { grid.innerHTML = '<p style="color:#555">Erro ao carregar itens.</p>'; }
}

async function loadPokeballs() {
    const grid = document.getElementById('pokeballGrid');
    if (!grid || grid.innerHTML.trim()) return;
    grid.innerHTML = '<div class="loading">Carregando pokébolas...</div>';
    try {
        const ballNames = ['poke-ball', 'great-ball', 'ultra-ball', 'master-ball', 'safari-ball', 'net-ball', 'dive-ball', 'nest-ball', 'repeat-ball', 'timer-ball', 'luxury-ball', 'premier-ball', 'dusk-ball', 'heal-ball', 'quick-ball', 'cherish-ball'];
        const balls = await Promise.all(ballNames.map(name => fetch(POKE_API + '/item/' + name).then(r => r.json()).catch(() => null)));
        grid.innerHTML = balls.filter(Boolean).map(ball => `
            <div class="pokemon-card">
                <div class="pokemon-image"><img src="${ball.sprites?.default || ''}" style="width:60px; image-rendering:pixelated"></div>
                <div class="pokemon-name">${typeof getTranslatedItemName === 'function' ? getTranslatedItemName(ball.name) : ball.name.toUpperCase()}</div>
            </div>
        `).join('');
    } catch (e) { grid.innerHTML = '<p style="color:#555">Erro ao carregar pokébolas.</p>'; }
}
