export const pokemonTypeColorsRGBA = {
    water: 'rgba(74, 144, 226, 0.7)',    
    grass: 'rgba(126, 211, 33, 0.7)',     
    normal: 'rgba(155, 155, 155, 0.7)',   
    fighting: 'rgba(245, 166, 35, 0.7)',     
    psychic: 'rgba(243, 102, 185, 0.7)',   
    ice: 'rgba(91, 200, 229, 0.7)',       
    dragon: 'rgba(123, 98, 240, 0.7)',    
    dark: 'rgba(111, 111, 111, 0.7)',      
    fairy: 'rgba(238, 153, 172, 0.7)',     
    fire: 'rgba(194, 46, 40, 0.7)',  
    electric: 'rgba(247, 208, 44, 0.7)', 
    poison: 'rgba(163, 62, 161, 0.7)',
    ground: 'rgba(226, 191, 101, 0.7)',
    flying: 'rgba(169, 143, 243, 0.7)',
    bug: 'rgba(166, 185, 26, 0.7)',
    rock: 'rgba(182, 161, 54, 0.7)',
    ghost: 'rgba(115, 87, 151, 0.7)',
    steel: 'rgba(183, 183, 206, 0.7)',
};

export const pokemonTypeColors = {
    water: { primary: '#4A90E2', hover: '#2E6DA4' },    
    grass: { primary: '#7ED321', hover: '#5C9E18' },     
    normal: { primary: '#9B9B9B', hover: '#696969' },   
    fighting: { primary: '#F5A623', hover: '#C7841C' },     
    psychic: { primary: '#F366B9', hover: '#C44793' },   
    ice: { primary: '#5BC8E5', hover: '#3D93AD' },       
    dragon: { primary: '#7B62F0', hover: '#452AB1' },    
    dark: { primary: '#6F6F6F', hover: '#3D3D3D' },      
    fairy: { primary: '#EE99AC', hover: '#C27385' },     
    fire: { primary: '#C22E28', hover: '#821E1B' },  
    electric: { primary: '#F7D02C', hover: '#C8AB1D' }, 
    poison: { primary: '#A33EA1', hover: '#702A6F' },
    ground: { primary: '#E2BF65', hover: '#B7994E' },
    flying: { primary: '#A98FF3', hover: '#816AC7' },
    bug: { primary: '#A6B91A', hover: '#647012' },
    rock: { primary: '#B6A136', hover: '#7B6F23' },
    ghost: { primary: '#735797', hover: '#4B3762' },
    steel: { primary: '#B7B7CE', hover: '#8E8EAA' },
};

export const genderRateMap = {
    [-1]: "- : -",   // Sem gênero
    [0]: "1 : 0",    // 100% macho
    [1]: "7 : 1",    // 87.5% macho / 12.5% fêmea
    [2]: "3 : 1",    // 75% macho / 25% fêmea
    [3]: "5 : 3",    // 62.5% macho / 37.5% fêmea
    [4]: "1 : 1",    // 50% macho / 50% fêmea
    [5]: "3 : 5",    // 37.5% macho / 62.5% fêmea
    [6]: "1 : 3",    // 25% macho / 75% fêmea
    [7]: "1 : 7",    // 12.5% macho / 87.5% fêmea
    [8]: "0 : 1"     // 0% macho / 100% fêmea
};

export const growthRateMap = {
    1: {
        name: "Slow",
        description: "Cresce lentamente, requer 1.250.000 XP para atingir o nível 100."
    },
    2: {
        name: "Medium",
        description: "Crescimento padrão, requer 1.000.000 XP até o nível 100."
    },
    3: {
        name: "Fast",
        description: "Sobe de nível rapidamente, precisa de apenas 800.000 XP até o nível 100."
    },
    4: {
        name: "Medium Slow",
        description: "Começa rápido, desacelera no meio e acelera no final; requer 1.059.860 XP."
    },
    5: {
        name: "Erratic",
        description: "Crescimento inconsistente; precisa de 600.000 XP, sobe rápido em níveis baixos."
    },
    6: {
        name: "Fluctuating",
        description: "Muito lento no início, depois acelera; requer 1.640.000 XP até o nível 100."
    }
};

export const generationMap = {
    1: "I",
    2: "II",
    3: "III",
    4: "IV",
    5: "V",
    6: "VI",
    7: "VII",
    8: "VIII",
    9: "IX"
};

export const habitatMap = {
    1: "Cave",
    2: "Forest",
    3: "Grassland",
    4: "Mountain",
    5: "Rare",
    6: "Rough terrain",
    7: "Sea",
    8: "Urban",
    9: "Water's edge"
};

export const pokemonTypeColorsRadar = {
    "water":  { "1": '#4A90E2', "2": '#74B3F0', "3": '#4A90E2', "4": '#2E6DA4' },
    "grass":  { "1": '#7ED321', "2": '#A4E957', "3": '#7ED321', "4": '#5C9E18' },
    "normal": { "1": '#9B9B9B', "2": '#C0C0C0', "3": '#9B9B9B', "4": '#696969' },
    "fighting": { "1": '#F5A623', "2": '#FFD47D', "3": '#F5A623', "4": '#C7841C' },
    "psychic": { "1": '#F366B9', "2": '#FF9BD3', "3": '#F366B9', "4": '#C44793' },
    "ice":    { "1": '#5BC8E5', "2": '#91E1F5', "3": '#5BC8E5', "4": '#3D93AD' },
    "dragon": { "1": '#7B62F0', "2": '#A08BF7', "3": '#7B62F0', "4": '#452AB1' },
    "dark":   { "1": '#6F6F6F', "2": '#A0A0A0', "3": '#6F6F6F', "4": '#3D3D3D' },
    "fairy":  { "1": '#EE99AC', "2": '#F7C3CF', "3": '#EE99AC', "4": '#C27385' },
    "fire":   { "1": '#C22E28', "2": '#E85C56', "3": '#C22E28', "4": '#821E1B' },
    "electric": { "1": '#F7D02C', "2": '#FBE66C', "3": '#F7D02C', "4": '#C8AB1D' },
    "poison": { "1": '#A33EA1', "2": '#CA6AC7', "3": '#A33EA1', "4": '#702A6F' },
    "ground": { "1": '#E2BF65', "2": '#F5D988', "3": '#E2BF65', "4": '#B7994E' },
    "flying": { "1": '#A98FF3', "2": '#C6B5F9', "3": '#A98FF3', "4": '#816AC7' },
    "bug":    { "1": '#A6B91A', "2": '#C7D949', "3": '#A6B91A', "4": '#647012' },
    "rock":   { "1": '#B6A136', "2": '#D3C067', "3": '#B6A136', "4": '#7B6F23' },
    "ghost":  { "1": '#735797', "2": '#9C84BD', "3": '#735797', "4": '#4B3762' },
    "steel":  { "1": '#B7B7CE', "2": '#D2D2E3', "3": '#B7B7CE', "4": '#8E8EAA' },
};

export const types = [
    "normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison",
    "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon",
    "dark", "steel", "fairy"
];

export function getDefensiveMultipliers(type1, type2 = null) {

  const typeChart = {
    normal:     { rock: 0.5, ghost: 0, steel: 0.5 },
    fire:       { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
    water:      { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
    electric:   { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
    grass:      { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
    ice:        { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
    fighting:   { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
    poison:     { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
    ground:     { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
    flying:     { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
    psychic:    { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
    bug:        { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
    rock:       { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
    ghost:      { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
    dragon:     { dragon: 2, steel: 0.5, fairy: 0 },
    dark:       { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
    steel:      { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, fairy: 2, steel: 0.5 },
    fairy:      { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
  };

  const result = {};

  for (const attackType of types) {
    let multiplier = 1;

    // Contra tipo 1
    if (typeChart[attackType]?.[type1]) {
      multiplier *= typeChart[attackType][type1];
    }

    // Contra tipo 2, se houver
    if (type2 && typeChart[attackType]?.[type2]) {
      multiplier *= typeChart[attackType][type2];
    }

    // Arredondar para evitar problemas com ponto flutuante
    multiplier = Math.round(multiplier * 100) / 100;

    result[attackType] = multiplier;
  }

  return result;
}

export function getOffensiveMultipliers(type1, type2 = null) {
  const typeChart = {
    normal:     { rock: 0.5, ghost: 0, steel: 0.5 },
    fire:       { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
    water:      { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
    electric:   { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
    grass:      { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
    ice:        { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
    fighting:   { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
    poison:     { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
    ground:     { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
    flying:     { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
    psychic:    { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
    bug:        { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
    rock:       { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
    ghost:      { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
    dragon:     { dragon: 2, steel: 0.5, fairy: 0 },
    dark:       { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
    steel:      { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, fairy: 2, steel: 0.5 },
    fairy:      { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
  };

  const typesDefensivos = Object.keys(typeChart);
  const result = {};

  for (const defenderType of typesDefensivos) {
    let multiplier = 1;

    if (type1 && typeChart[type1]?.[defenderType] !== undefined) {
      multiplier *= typeChart[type1][defenderType];
    }

    if (type2 && typeChart[type2]?.[defenderType] !== undefined) {
      multiplier *= typeChart[type2][defenderType];
    }

    multiplier = Math.round(multiplier * 100) / 100;
    result[defenderType] = multiplier;
  }

  return result;
}
