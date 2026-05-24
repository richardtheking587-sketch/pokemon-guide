* { margin: 0; padding: 0; box-sizing: border-box; }
:root {
    --bg-dark: #0a0a0a; --card-bg: #151515; --primary-red: #ff1f1f;
    --accent-gold: #ffd700; --text-main: #ffffff; --text-dim: #999;
    --border: #222; --neon-red: 0 0 15px rgba(255, 31, 31, 0.5);
}
body { font-family: 'Roboto', sans-serif; background-color: var(--bg-dark); color: var(--text-main); line-height: 1.6; }

/* BANNER COM BRILHO */
.glow-effect {
    position: relative;
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
    animation: glowPulse 3s infinite alternate;
}
@keyframes glowPulse {
    from { box-shadow: 0 0 10px rgba(255, 215, 0, 0.1); }
    to { box-shadow: 0 0 30px rgba(255, 215, 0, 0.4); }
}

.dev-banner { background: #1a1a1a; border-bottom: 2px solid var(--accent-gold); padding: 8px; text-align: center; }
.dev-badge { background: var(--accent-gold); color: #000; font-family: 'Orbitron'; font-size: 0.6em; padding: 2px 8px; border-radius: 10px; font-weight: bold; }
.container { max-width: 1200px; margin: 0 auto; padding: 20px; }

.header { padding: 20px; text-align: center; border-bottom: 2px solid var(--primary-red); margin-bottom: 30px; background: #111; border-radius: 15px; }
.logo-container { display: flex; align-items: center; justify-content: center; gap: 15px; }
.logo { font-family: 'Orbitron'; font-size: 2em; letter-spacing: 2px; }
.logo span { color: var(--primary-red); text-shadow: var(--neon-red); }

/* POKÉBOLA GIRATÓRIA ANTIGA */
.spinning-pokeball {
    width: 40px; height: 40px;
    background: white; border: 3px solid black; border-radius: 50%;
    position: relative; overflow: hidden;
    animation: spin 3s linear infinite;
}
.spinning-pokeball::before {
    content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 50%;
    background: #ff1f1f; border-bottom: 3px solid black;
}
.spinning-pokeball::after {
    content: ''; position: absolute; top: 50%; left: 50%;
    width: 12px; height: 12px; background: white;
    border: 3px solid black; border-radius: 50%;
    transform: translate(-50%, -50%); z-index: 5;
}
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.main-nav { display: flex; justify-content: center; gap: 5px; margin-top: 20px; flex-wrap: wrap; }
.nav-btn { background: none; border: none; color: #666; font-family: 'Orbitron'; cursor: pointer; padding: 8px 15px; transition: 0.3s; font-size: 0.75em; }
.nav-btn.active, .nav-btn:hover { color: var(--primary-red); border-bottom: 2px solid var(--primary-red); }

.tab-content { display: none; }
.tab-content.active { display: block; animation: fadeIn 0.3s; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.search-box { display: flex; justify-content: center; gap: 10px; margin-bottom: 30px; flex-wrap: wrap; padding: 15px; background: #111; border-radius: 12px; }
.search-box input, .search-box select { padding: 10px; background: #1a1a1a; border: 1px solid #333; color: #fff; border-radius: 8px; outline: none; }

.pokemon-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; }
.pokemon-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 15px; padding: 15px; text-align: center; cursor: pointer; transition: 0.3s; position: relative; }
.pokemon-card:hover { border-color: var(--primary-red); transform: translateY(-5px); box-shadow: var(--neon-red); }

.fav-btn { position: absolute; top: 10px; right: 10px; background: none; border: none; cursor: pointer; font-size: 1.1em; color: #333; transition: 0.2s; z-index: 10; }
.fav-btn.active { color: var(--accent-gold); }

.pokemon-image img { width: 90px; filter: drop-shadow(0 5px 10px #000); }
.pokemon-name { font-family: 'Orbitron'; font-size: 0.8em; margin-top: 10px; font-weight: bold; }

/* COMPARAÇÃO */
.compare-container { display: flex; justify-content: center; align-items: center; gap: 15px; margin: 20px 0; flex-wrap: wrap; }
.compare-slot { width: 160px; height: 220px; background: #111; border: 2px dashed #333; border-radius: 15px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; }
.compare-slot:hover { border-color: var(--primary-red); background: #151515; }
.vs-circle { width: 50px; height: 50px; background: var(--primary-red); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-family: 'Orbitron'; box-shadow: var(--neon-red); }

.comparison-details { max-width: 500px; margin: 20px auto; background: #111; padding: 20px; border-radius: 15px; border: 1px solid #222; }
.stat-comparison-row { display: grid; grid-template-columns: 1fr 2fr 1fr; gap: 10px; align-items: center; margin-bottom: 12px; }
.stat-bar-bg { background: #222; height: 8px; border-radius: 4px; position: relative; }
.stat-bar-fill { height: 100%; border-radius: 4px; background: var(--primary-red); }
.stat-num { font-size: 0.9em; font-weight: bold; font-family: 'Orbitron'; text-align: center; }
.stat-num.winner { color: var(--accent-gold); }

/* SELETOR MODAL */
.selector-modal-content { max-width: 400px !important; padding: 20px !important; }
.region-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.selector-btn { background: #1a1a1a; border: 1px solid #333; color: #fff; padding: 10px; border-radius: 8px; cursor: pointer; font-family: 'Orbitron'; font-size: 0.7em; }
.poke-selector-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; max-height: 400px; overflow-y: auto; }
.mini-poke-card { background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 5px; text-align: center; cursor: pointer; }
.mini-poke-card img { width: 40px; }

/* MODAL DE VITÓRIA */
.victory-card { background: #111; border: 2px solid var(--accent-gold); border-radius: 20px; padding: 30px; text-align: center; width: 300px; }
.victory-header { font-family: 'Orbitron'; font-size: 1.5em; color: var(--accent-gold); margin-bottom: 20px; }
.victory-ring { position: absolute; width: 150px; height: 150px; border: 3px solid var(--accent-gold); border-radius: 50%; left: 50%; top: 50%; transform: translate(-50%, -50%); animation: spin 4s linear infinite; opacity: 0.3; }
#victoryImg { width: 120px; position: relative; z-index: 2; }

.modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 2000; align-items: center; justify-content: center; }
.modal.show { display: flex; }
.modal-content { background: #111; border: 1px solid #333; border-radius: 20px; padding: 30px; width: 90%; max-width: 600px; position: relative; max-height: 90vh; overflow-y: auto; }
.close { position: absolute; right: 20px; top: 10px; font-size: 30px; cursor: pointer; color: #555; }

.action-btn { background: var(--primary-red); color: #fff; border: none; padding: 8px 15px; border-radius: 8px; font-family: 'Orbitron'; cursor: pointer; font-size: 0.8em; font-weight: bold; }

.evolution-chain { margin-top: 20px; border-top: 1px solid #222; padding-top: 15px; }
.evo-list { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; }
.evo-item { text-align: center; cursor: pointer; width: 70px; }
.evo-item img { width: 45px; border-radius: 50%; background: #1a1a1a; padding: 5px; border: 1px solid #333; }

.dev-footer { background: #111; border-top: 2px solid var(--primary-red); padding: 20px; text-align: center; margin-top: 40px; border-radius: 15px; }

@media (max-width: 480px) {
    .pokemon-grid { grid-template-columns: repeat(2, 1fr); }
    .compare-slot { width: 140px; height: 180px; }
    .poke-selector-grid { grid-template-columns: repeat(3, 1fr); }
}
