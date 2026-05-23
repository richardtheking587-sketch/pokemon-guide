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
    // Dicionário de tradução para as descrições
    phrases: {
        "Very smart and very vengeful": "Muito inteligente e vingativo",
        "it has a brave and trustworthy nature": "tem uma natureza brava e confiável",
        "A strange seed was planted on its back": "Uma semente estranha foi plantada em suas costas",
        "at birth": "ao nascer",
        "The plant blooms": "A planta floresce",
        "by absorbing sunlight": "absorvendo a luz solar",
        "It can fly": "Ele pode voar",
        "extremely fast": "extremamente rápido",
        "loves to eat": "adora comer",
        "it is said that": "diz-se que",
        "evolves from": "evolui de",
        "it uses its": "ele usa seu",
        "to protect itself": "para se proteger",
        "Grabbing one of its many tails": "Segurar uma de suas muitas caudas",
        "could result in a 1000-year curse": "pode resultar em uma maldição de 1000 anos",
        "Highly intelligent": "Altamente inteligente",
        "It lives in": "Ele vive em",
        "forests": "florestas",
        "mountains": "montanhas",
        "caves": "cavernas",
        "near water": "perto da água"
    }
};

function translate(category, key) {
    return (translations[category] && translations[category][key.toLowerCase()]) || key;
}

// Função especial para traduzir textos longos
function translateDescription(text) {
    let translatedText = text;
    Object.keys(translations.phrases).forEach(englishPhrase => {
        const regex = new RegExp(englishPhrase, "gi");
        translatedText = translatedText.replace(regex, translations.phrases[englishPhrase]);
    });
    return translatedText;
}
