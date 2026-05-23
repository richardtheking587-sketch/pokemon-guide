const translations = {
    types: {
        normal: 'Normal', fire: 'Fogo', water: 'Água', grass: 'Grama',
        electric: 'Elétrico', ice: 'Gelo', fighting: 'Lutador', poison: 'Veneno',
        ground: 'Terra', flying: 'Voador', psychic: 'Psíquico', bug: 'Inseto',
        rock: 'Pedra', ghost: 'Fantasma', dragon: 'Dragão', dark: 'Sombrio',
        steel: 'Aço', fairy: 'Fada'
    },
    stats: {
        hp: 'HP', attack: 'Ataque', defense: 'Defesa',
        'special-attack': 'Atq. Especial', 'special-defense': 'Def. Especial', speed: 'Velocidade'
    },
    phrases: {
        // Biologia e Corpo
        "A strange seed was planted on its back": "Uma semente estranha foi plantada em suas costas",
        "at birth": "ao nascer", "The plant sprouts": "A planta brota", "and grows with": "e cresce com",
        "Very smart and very vengeful": "Muito inteligente e vingativo",
        "Grabbing one of its many tails": "Segurar uma de suas muitas caudas",
        "could result in a 1000-year curse": "pode resultar em uma maldição de 1000 anos",
        "Highly intelligent": "Altamente inteligente", "It lives in": "Ele vive em",
        "forests": "florestas", "mountains": "montanhas", "caves": "cavernas",
        "near water": "perto da água", "The plant blooms": "A planta floresce",
        "by absorbing sunlight": "absorvendo a luz solar",
        "It has a": "Ele tem um", "It can": "Ele pode", "It uses": "Ele usa",
        "When it": "Quando ele", "If it": "Se ele", "tamer": "treinador",
        "battle": "batalha", "wild": "selvagem", "evolution": "evolução",
        "power": "poder", "speed": "velocidade", "strength": "força",
        "body": "corpo", "tail": "cauda", "head": "cabeça", "wings": "asas",
        "fire": "fogo", "water": "água", "electricity": "eletricidade",
        "It stores": "Ele armazena", "It sleeps": "Ele dorme", "It eats": "Ele come",
        "flames": "chamas", "poisonous": "venenoso", "powerful": "poderoso",
        "It is said": "Diz-se", "legendary": "lendário", "mythical": "mítico",

        // Itens e Pokébolas
        "A device for catching wild Pokémon": "Dispositivo para capturar Pokémon selvagens.",
        "The best Ball": "A melhor bola de todas.", "without fail": "sem falhar (100% de chance)",
        "Restores HP": "Restaura HP", "Heals": "Cura", "revives": "revive",
        "fainted": "desmaiado", "candy": "doce", "raises the level": "aumenta o nível",
        "A good, high-performance Ball": "Uma bola de alta performance com melhor taxa de sucesso.",
        "An ultra-performance Ball": "Uma bola de ultra performance. Excelente para Pokémon difíceis.",
        "A medicine that revives": "Um remédio que revive", "Restores 10 HP": "Restaura 10 de HP",
        "Restores 20 HP": "Restaura 20 de HP", "Restores 50 HP": "Restaura 50 de HP",
        "Restores 200 HP": "Restaura 200 de HP", "Fully restores": "Restaura totalmente"
    }
};

function translate(category, key) {
    return (translations[category] && translations[category][key.toLowerCase()]) || key;
}

function translateDescription(text) {
    if (!text) return "Informação não disponível.";
    let t = text.replace(/\f/g, ' ').replace(/\n/g, ' ').replace(/\r/g, ' '); 
    
    // Tradução inteligente por substituição de termos
    Object.keys(translations.phrases).forEach(en => {
        const regex = new RegExp(en, "gi");
        t = t.replace(regex, translations.phrases[en]);
    });
    
    t = t.replace(/POKéMON/g, "POKÉMON");
    return t;
}
