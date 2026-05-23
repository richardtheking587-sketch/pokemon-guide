const translations = {
    stats: { 'hp': 'HP', 'attack': 'Ataque', 'defense': 'Defesa', 'special-attack': 'Atq. Especial', 'special-defense': 'Def. Especial', 'speed': 'Velocidade' },
    words: { "when":"quando", "the":"o", "a":"um", "an":"um", "on":"em", "in":"em", "at":"em", "to":"para", "of":"de", "and":"e", "is":"é", "are":"são", "with":"com", "bulb":"bulbo", "back":"costas", "grows":"cresce", "large":"grande", "appears":"parece", "lose":"perder", "ability":"habilidade", "stand":"ficar", "hind":"traseiras", "legs":"pernas" },
    phrases: { "When the bulb on its back grows large, it appears to lose the ability to stand on its hind legs.": "Quando o bulbo em suas costas cresce bastante, ele parece perder a habilidade de ficar sobre as patas traseiras." }
};

const itemNamesPT = { "potion": "Poção", "super-potion": "Super Poção", "hyper-potion": "Hiper Poção", "max-potion": "Poção Máxima", "revive": "Reviver", "rare-candy": "Doce Raro", "sun-stone": "Pedra do Sol", "moon-stone": "Pedra da Lua", "fire-stone": "Pedra de Fogo", "thunder-stone": "Pedra do Trovão", "water-stone": "Pedra da Água", "poke-ball": "Poké Bola", "great-ball": "Grande Bola", "ultra-ball": "Ultra Bola", "master-ball": "Master Ball" };

function getTranslatedItemName(name) { return itemNamesPT[name] || name.toUpperCase().replace(/-/g, ' '); }

function translateDescription(text) {
    if (!text) return "Descrição não disponível.";
    let t = text.replace(/\f/g, ' ').replace(/\n/g, ' ').replace(/\r/g, ' ').trim();
    Object.keys(translations.phrases).forEach(phrase => {
        const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "gi");
        t = t.replace(regex, translations.phrases[phrase]);
    });
    let words = t.split(' ').map(word => {
        const clean = word.toLowerCase().replace(/[.,!?;:()]/g, '');
        const punctuation = word.match(/[.,!?;:()]+$/)?.[0] || '';
        return translations.words[clean] ? translations.words[clean] + punctuation : word;
    });
    return words.join(' ');
}
