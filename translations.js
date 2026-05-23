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
    // DICIONÁRIO PALAVRA POR PALAVRA (Cobre quase todos os Pokémon)
    words: {
        "lives": "vive", "forests": "florestas", "mountains": "montanhas", "caves": "cavernas",
        "water": "água", "sea": "mar", "ocean": "oceano", "land": "terra", "sky": "céu",
        "power": "poder", "powerful": "poderoso", "speed": "velocidade", "fast": "rápido",
        "attacks": "ataca", "defends": "defende", "protects": "protege", "stores": "armazena",
        "energy": "energia", "electricity": "eletricidade", "fire": "fogo", "flames": "chamas",
        "heat": "calor", "cold": "frio", "ice": "gelo", "snow": "neve", "poison": "veneno",
        "poisonous": "venenoso", "strong": "forte", "weak": "fraco", "small": "pequeno",
        "large": "grande", "huge": "gigante", "tail": "cauda", "head": "cabeça",
        "wings": "asas", "body": "corpo", "skin": "pele", "fur": "pelagem",
        "claws": "garras", "teeth": "dentes", "mouth": "boca", "eyes": "olhos",
        "born": "nasce", "birth": "nascimento", "growth": "crescimento", "grows": "cresce",
        "evolves": "evolui", "evolution": "evolução", "legendary": "lendário", "mythical": "mítico",
        "said": "dito", "known": "conhecido", "called": "chamado", "found": "encontrado",
        "rare": "raro", "common": "comum", "wild": "selvagem", "tamer": "treinador",
        "battle": "batalha", "fight": "luta", "friend": "amigo", "loyal": "leal",
        "smart": "inteligente", "clever": "esperto", "brave": "corajoso", "angry": "bravo",
        "sleeps": "dorme", "eats": "come", "hunts": "caça", "flies": "voa", "swims": "nada",
        "it": "ele", "its": "seu", "their": "seu", "they": "eles", "with": "com", "from": "de",
        "under": "sob", "over": "sobre", "near": "perto", "between": "entre", "around": "ao redor",
        "strange": "estranho", "mysterious": "misterioso", "ancient": "antigo", "new": "novo",
        "back": "costas", "seed": "semente", "plant": "planta", "flower": "flor", "leaf": "folha"
    },
    // FRASES INTEIRAS (Para ficar mais natural)
    phrases: {
        "It is said that": "Diz-se que",
        "A Pokémon that": "Um Pokémon que",
        "When it is": "Quando está",
        "It can be": "Pode ser",
        "A strange seed was planted on its back at birth": "Uma semente estranha foi plantada em suas costas ao nascer",
        "The plant sprouts and grows with this POKéMON": "A planta brota e cresce com este POKÉMON"
    }
};

function translate(category, key) {
    return (translations[category] && translations[category][key.toLowerCase()]) || key;
}

function translateDescription(text) {
    if (!text) return "Sem descrição.";
    
    // 1. Limpa o texto (tira quebras de linha e símbolos estranhos)
    let t = text.replace(/\f/g, ' ').replace(/\n/g, ' ').replace(/\r/g, ' ');
    
    // 2. Traduz frases prontas primeiro (para ficar mais bonito)
    Object.keys(translations.phrases).forEach(phrase => {
        const regex = new RegExp(phrase, "gi");
        t = t.replace(regex, translations.phrases[phrase]);
    });

    // 3. Traduz palavra por palavra (para cobrir o que sobrar)
    let words = t.split(' ');
    let translatedWords = words.map(word => {
        // Tira pontuação para traduzir a palavra limpa
        let cleanWord = word.toLowerCase().replace(/[.,!?;()]/g, '');
        let punctuation = word.substring(cleanWord.length);
        
        if (translations.words[cleanWord]) {
            return translations.words[cleanWord] + punctuation;
        }
        return word;
    });

    return translatedWords.join(' ').replace(/POKéMON/g, "POKÉMON");
}
