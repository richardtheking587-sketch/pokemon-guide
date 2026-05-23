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
        "could result in a 1000-year curse": "pode resultar em uma maldição de 1000 anos"
    }
};

function translate(category, key) {
    return (translations[category] && translations[category][key.toLowerCase()]) || key;
}

function translateDescription(text) {
    let t = text.replace(/\f/g, ' ');
    Object.keys(translations.phrases).forEach(en => {
        const regex = new RegExp(en, "gi");
        t = t.replace(regex, translations.phrases[en]);
    });
    return t;
}
