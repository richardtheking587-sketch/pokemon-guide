const translations = {
    types: {
        normal: 'Normal', fire: 'Fogo', water: 'Água', grass: 'Grama', electric: 'Elétrico',
        ice: 'Gelo', fighting: 'Lutador', poison: 'Veneno', ground: 'Terra', flying: 'Voador',
        psychic: 'Psíquico', bug: 'Inseto', rock: 'Pedra', ghost: 'Fantasma', dragon: 'Dragão',
        dark: 'Sombrio', steel: 'Aço', fairy: 'Fada'
    },
    stats: {
        hp: 'HP', attack: 'Ataque', defense: 'Defesa',
        'special-attack': 'Atq. Especial', 'special-defense': 'Def. Especial', speed: 'Velocidade'
    }
};
function translate(cat, key) { return (translations[cat] && translations[cat][key.toLowerCase()]) || key; }
