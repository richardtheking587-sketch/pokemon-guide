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
    // DICIONÁRIO DE TRADUÇÃO UNIVERSAL (PT-BR)
    phrases: {
        // Biologia e Comportamento
        "A strange seed was planted on its back at birth": "Uma semente estranha foi plantada em suas costas ao nascer",
        "The plant sprouts and grows with this POKéMON": "A planta brota e cresce com este POKÉMON",
        "Very smart and very vengeful": "Muito inteligente e vingativo",
        "it is said that": "diz-se que",
        "Grabbing one of its many tails": "Segurar uma de suas muitas caudas",
        "could result in a 1000-year curse": "pode resultar em uma maldição de 1000 anos",
        "Highly intelligent": "Altamente inteligente",
        "It lives in": "Ele vive em",
        "forests": "florestas",
        "mountains": "montanhas",
        "caves": "cavernas",
        "near water": "perto da água",
        "at birth": "ao nascer",
        "The plant blooms": "A planta floresce",
        "by absorbing sunlight": "absorvendo a luz solar",
        "It can": "Ele pode",
        "It has": "Ele tem",
        "It uses": "Ele usa",
        "When it": "Quando ele",
        "If it": "Se ele",
        "tamer": "treinador",
        "battle": "batalha",
        "wild": "selvagem",
        "evolution": "evolução",
        "power": "poder",
        "speed": "velocidade",
        "strength": "força",
        "body": "corpo",
        "tail": "cauda",
        "head": "cabeça",
        "wings": "asas",
        "fire": "fogo",
        "water": "água",
        "electricity": "eletricidade",
        
        // Itens e Pokébolas
        "A device for catching wild Pokémon": "Dispositivo para capturar Pokémon selvagens.",
        "The best Ball": "A melhor bola de todas.",
        "without fail": "sem falhar (100% de chance)",
        "Restores HP": "Restaura HP",
        "Heals": "Cura",
        "revives": "revive",
        "fainted": "desmaiado",
        "candy": "doce",
        "raises the level": "aumenta o nível"
    }
};

function translate(category, key) {
    return (translations[category] && translations[category][key.toLowerCase()]) || key;
}

function translateDescription(text) {
    if (!text) return "Informação não disponível.";
    
    // Limpeza de texto da API
    let t = text.replace(/\f/g, ' ').replace(/\n/g, ' ').replace(/\r/g, ' '); 
    
    // Aplica as traduções do dicionário
    Object.keys(translations.phrases).forEach(en => {
        const regex = new RegExp(en, "gi");
        t = t.replace(regex, translations.phrases[en]);
    });
    
    // Pequenos ajustes de gramática automática
    t = t.replace(/POKéMON/g, "POKÉMON");
    
    return t;
}
