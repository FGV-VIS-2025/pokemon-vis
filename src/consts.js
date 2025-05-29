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