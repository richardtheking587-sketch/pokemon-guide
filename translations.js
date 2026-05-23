const translations = {
    // Tradução dos Tipos
    types: {
        normal: 'Normal',
        fire: 'Fogo',
        water: 'Água',
        grass: 'Grama',
        electric: 'Elétrico',
        ice: 'Gelo',
        fighting: 'Lutador',
        poison: 'Veneno',
        ground: 'Terra',
        flying: 'Voador',
        psychic: 'Psíquico',
        bug: 'Inseto',
        rock: 'Pedra',
        ghost: 'Fantasma',
        dragon: 'Dragão',
        dark: 'Sombrio',
        steel: 'Aço',
        fairy: 'Fada'
    },
    // Tradução das Estatísticas
    stats: {
        hp: 'HP',
        attack: 'Ataque',
        defense: 'Defesa',
        'special-attack': 'Atq. Especial',
        'special-defense': 'Def. Especial',
        speed: 'Velocidade'
    }
};

// Função que o script usa para traduzir
function translate(category, key) {
    return (translations[category] && translations[category][key.toLowerCase()]) || key;
}
