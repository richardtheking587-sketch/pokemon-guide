const translations = {
    // Tradução dos Tipos
    types: {
        normal: 'Normal', fire: 'Fogo', water: 'Água', grass: 'Grama',
        electric: 'Elétrico', ice: 'Gelo', fighting: 'Lutador', poison: 'Veneno',
        ground: 'Terra', flying: 'Voador', psychic: 'Psíquico', bug: 'Inseto',
        rock: 'Pedra', ghost: 'Fantasma', dragon: 'Dragão', dark: 'Sombrio',
        steel: 'Aço', fairy: 'Fada'
    },
    // Tradução das Estatísticas
    stats: {
        hp: 'HP', attack: 'Ataque', defense: 'Defesa',
        'special-attack': 'Atq. Especial', 'special-defense': 'Def. Especial', speed: 'Velocidade'
    },
    // Dicionário de frases comuns para tradução automática
    phrases: {
        "A device for catching wild Pokémon": "Um dispositivo para capturar Pokémon selvagens",
        "The best Ball": "A melhor Bola",
        "It will catch any Pokémon without fail": "Captura qualquer Pokémon sem falhar",
        "Restores HP": "Restaura HP",
        "Heals any burn": "Cura qualquer queimadura",
        "Brings a faint": "Traz de volta um Pokémon desmaiado",
        "A rare candy that": "Um doce raro que",
        "raises the level": "aumenta o nível",
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
        "A strange seed was planted on its back": "Uma semente estranha foi plantada em suas costas",
        "at birth": "ao nascer",
        "The plant blooms": "A planta floresce",
        "by absorbing sunlight": "absorvendo a luz solar"
    }
};

// Função para traduzir tipos e estatísticas
function translate(category, key) {
    return (translations[category] && translations[category][key.toLowerCase()]) || key;
}

// Função para traduzir descrições longas
function translateDescription(text) {
    if (!text) return "Sem descrição disponível.";
    let t = text.replace(/\f/g, ' '); // Limpa caracteres estranhos da API
    
    // Procura cada frase em inglês no nosso dicionário e substitui
    Object.keys(translations.phrases).forEach(en => {
        const regex = new RegExp(en, "gi");
        t = t.replace(regex, translations.phrases[en]);
    });
    
    return t;
}
