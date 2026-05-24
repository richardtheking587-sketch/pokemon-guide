* { margin: 0; padding: 0; box-sizing: border-box; }
:root {
    --bg-dark: #0a0a0a; --card-bg: #151515; --primary-red: #ff1f1f;
    --accent-gold: #ffd700; --text-main: #ffffff; --text-dim: #999;
    --border: #222; --neon-red: 0 0 15px rgba(255, 31, 31, 0.5);
    --type-grass: #78C850; --type-poison: #A040A0; --type-fire: #F08030;
    --type-water: #6890F0; --type-electric: #F8D030;
}
body { font-family: 'Roboto', sans-serif; background-color: var(--bg-dark); color: var(--text-main); line-height: 1.6; }

/* BANNER COM BRILHO ANIME */
.anime-shine {
    position: relative;
    background: linear-gradient(90deg, #1a1a1a, #2a2a2a, #1a1a1a);
    border-bottom: 2px solid var(--accent-gold);
    padding: 10px; text-align: center; overflow: hidden;
}
.anime-shine::after {
    content: ''; position: absolute; top: -50%; left: -100%; width: 50px; height: 200%;
    background: rgba(255, 215, 0, 0.4); transform: rotate(30deg);
    animation: shineMove 3s infinite;
}
@keyframes shineMove { 0% { left: -100%; } 20% { left: 150%; } 100% { left: 150%; } }

.dev-badge { background: var(--accent-gold); color: #000; font-family: 'Orbitron'; font-size: 0.6em; padding: 2px 8px; border-radius: 10px; font-weight: bold; }
.container { max-width: 1200px; margin: 0 auto; padding: 20px; }

.header { padding: 20px; text-align: center; border-bottom: 2px solid var(--primary-red); margin-bottom: 30px; background: #111; border-radius: 15px; }
.logo-container { display: flex; align-items: center; justify-content: center; gap: 15px; }
.logo { font-family: 'Orbitron'; font-size: 2em; letter-spacing: 2px; }
.logo span { color: var(--primary-red); text-shadow: var(--neon-red); }

.spinning-pokeball {
    width: 40px; height: 40px; background: white; border: 3px solid black; border-radius: 50%;
    position: relative; overflow: hidden; animation: spin 3s linear infinite;
}
.spinning-pokeball::before {
    content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 50%;
    background: #ff1f1f; border-bottom: 3px solid black;
}
.spinning-pokeball::after {
    content: ''; position: absolute; top: 50%; left: 50%; width: 12px; height: 12px;
    background: white; border: 3px solid black; border-radius: 50%;
    transform: translate(-50%, -50%); z-index: 5;
}
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.main-nav { display: flex; justify-content: center; gap: 5px; margin-top: 20px; flex-wrap: wrap; }
.nav-btn { background: none; border: none; color: #666; font-family: 'Orbitron'; cursor: pointer; padding: 8px 15px; transition: 0.3s; font-size: 0.75em; }
.nav-btn.active, .nav-btn:hover { color: var(--primary-red); border-bottom: 2px solid var(--primary-red); }

.tab-content { display: none; }
.tab-content.active { display: block; animation: fadeIn 0.3s; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.pokemon-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; }
.pokemon-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 15px; padding: 15px; text-align: center; cursor: pointer; transition: 0.3s; position: relative; }
.pokemon-card:hover { border-color: var(--primary-red); transform: translateY(-5px); }

.fav-btn { position: absolute; top: 10px; right: 10px; background: none; border: none; cursor: pointer; font-size: 1.2em; color: #333; z-index: 10; }
.fav-btn.active { color: var(--accent-gold); }

/* FICHA DO POKÉMON REORGANIZADA */
.detail-modal-content { max-width: 500px !important; text-align: center; padding: 40px 20px !important; }
.detail-img { width: 180px; margin-bottom: 10px; filter: drop-shadow(0 10px 20px rgba(0,0,0,0.5)); }
.detail-name { font-family: 'Orbitron'; font-size: 1.8em; margin-bottom: 15px; color: white; }

.type-row { display: flex; justify-content: center; align-items: center; gap: 10px; margin-bottom: 25px; }
.type-tag {
    padding: 6px 15px; border-radius: 20px; font-size: 0.75em; font-weight: bold;
    color: white; text-transform: uppercase; border: 1px solid rgba(255,255,255,0.1);
}

/* BOTÃO SHINY REFORMULADO */
.shiny-btn-tag {
    background: linear-gradient(45deg, #ffd700, #ff00ff);
    color: white; border: none; padding: 6px 15px; border-radius: 20px;
    font-family: 'Orbitron'; font-size: 0.7em; font-weight: bold; cursor: pointer;
    box-shadow: 0 0 10px rgba(255, 0, 255, 0.3); transition: 0.3s;
}
.shiny-btn-tag:hover { transform: scale(1.1); box-shadow: 0 0 20px rgba(255, 215, 0, 0.5); }

/* ATRIBUTOS COM BRILHO */
.stats-container { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 30px; text-align: left; }
.stat-box {
    background: rgba(255, 255, 255, 0.05); padding: 10px; border-radius: 10px;
    border: 1px solid #333; transition: 0.3s;
}
.stat-box:hover { border-color: var(--accent-gold); box-shadow: 0 0 15px rgba(255, 215, 0, 0.2); }
.stat-box strong { color: var(--accent-gold); font-family: 'Orbitron'; font-size: 0.7em; display: block; margin-bottom: 3px; }
.stat-box span { font-weight: bold; font-size: 1.1em; color: white; text-shadow: 0 0 5px var(--accent-gold); }

/* LINHA EVOLUTIVA COM SETINHAS */
.evolution-row { display: flex; justify-content: center; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 20px; padding-top: 20px; border-top: 1px solid #222; }
.evo-unit { text-align: center; cursor: pointer; transition: 0.3s; }
.evo-unit:hover { transform: scale(1.1); }
.evo-unit img { width: 60px; border-radius: 50%; background: #1a1a1a; padding: 5px; border: 2px solid #333; }
.evo-unit div { font-size: 9px; color: #888; margin-top: 5px; font-family: 'Orbitron'; }
.evo-arrow { font-size: 1.2em; color: var(--accent-gold); font-weight: bold; }

/* TELA DE VITÓRIA CORRIGIDA */
.victory-ring-container { position: relative; width: 200px; height: 200px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; }
.victory-ring {
    position: absolute; width: 100%; height: 100%; border: 4px solid var(--accent-gold);
    border-radius: 50%; animation: spin 4s linear infinite; box-shadow: 0 0 30px var(--accent-gold);
}
#victoryImg { width: 140px; position: relative; z-index: 5; }

/* SELETOR DE POKÉMON */
.selector-modal-content { max-width: 450px !important; }
.mini-poke-card { overflow: hidden; }
.mini-poke-card div { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }

.dev-footer { background: #111; border-top: 2px solid var(--primary-red); padding: 30px 20px; text-align: center; margin-top: 40px; border-radius: 15px; }
.disclaimer-text { font-size: 0.7em; color: #666; max-width: 800px; margin: 0 auto; }

.modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 2000; align-items: center; justify-content: center; }
.modal.show { display: flex; }
.close { position: absolute; right: 20px; top: 10px; font-size: 30px; cursor: pointer; color: #555; }
