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
    // DICIONÁRIO DE ELITE: Pokébolas e Itens
    phrases: {
        // Pokébolas
        "A device for catching wild Pokémon": "Dispositivo para capturar Pokémon selvagens.",
        "A good, high-performance Ball": "Uma bola de alta performance com melhor taxa de sucesso.",
        "An ultra-performance Ball": "Uma bola de ultra performance. Excelente para Pokémon difíceis.",
        "The best Ball with the ultimate level of performance": "A melhor bola de todas. Captura qualquer Pokémon sem falhar (100% de chance).",
        "A Ball for use in the Safari Zone": "Uma bola especial usada apenas na Zona Safari.",
        "A comfortable Ball that makes a Pokémon quickly grow friendly": "Uma bola luxuosa que torna o Pokémon amigável mais rápido.",
        "A somewhat rare Ball that has been made as a commemorative item": "Uma bola rara comemorativa. Tem a mesma taxa de uma Pokébola comum.",
        "A Ball that works especially well on weaker Pokémon": "Funciona muito melhor em Pokémon de nível baixo.",
        "Works well on Pokémon that are found in caves or at night": "Funciona 3x melhor em cavernas ou durante a noite.",
        "Works well on Pokémon encountered while fishing or surfing": "Ideal para Pokémon aquáticos (pescando ou surfando).",
        "A Ball that works better the more turns a battle takes": "Fica mais potente quanto mais turnos a batalha durar.",
        "A Ball that works better on Pokémon you've caught before": "Melhor chance em Pokémon que você já capturou antes.",
        "A Ball that makes it easier to catch Pokémon at the start of a battle": "Excelente para capturar logo no primeiro turno da batalha.",

        // Itens de Cura e Atributos
        "Restores HP by 20 points": "Restaura 20 pontos de HP.",
        "Restores HP by 50 points": "Restaura 50 pontos de HP.",
        "Restores HP by 200 points": "Restaura 200 pontos de HP.",
        "A medicine that revives a fainted Pokémon": "Revive um Pokémon desmaiado com metade do HP.",
        "Fully restores the HP of a fainted Pokémon": "Revive um Pokémon desmaiado com HP total.",
        "Heals all the status problems": "Cura todos os problemas de status (paralisia, sono, etc).",
        "A candy that is packed with energy": "Um doce energético que aumenta o nível do Pokémon em 1.",
        "An item to be held by a Pokémon": "Item que aumenta a experiência ganha em batalhas.",
        "A stone that causes certain species of Pokémon to evolve": "Uma pedra especial que força a evolução de certas espécies.",
        
        // Frutas (Berries)
        "A Berry to be consumed by a Pokémon": "Uma fruta que pode ser comida para curar status ou HP.",
        "If held by a Pokémon, it can be used to heal confusion": "Se segurada, cura a confusão automaticamente.",
        "Restores 10 HP": "Restaura 10 de HP em batalha."
    }
};

function translate(category, key) {
    return (translations[category] && translations[category][key.toLowerCase()]) || key;
}

function translateDescription(text) {
    if (!text) return "Informação não disponível.";
    let t = text.replace(/\f/g, ' '); 
    
    // Procura e substitui cada termo técnico pelo nosso em Português
    Object.keys(translations.phrases).forEach(en => {
        const regex = new RegExp(en, "gi");
        t = t.replace(regex, translations.phrases[en]);
    });
    
    return t;
}
