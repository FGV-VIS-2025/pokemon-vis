import { getLocationAreaByLocation, getLocationsByRegionName, getPokemonsByMultipleLocationAreas } from "./dataManager.js";
import { renderRadarChart } from "./radarChart.js";
import { renderLocationScatterPlot } from "./scatterPlot.js";

import { pokemonTypeColorsRGBA } from './consts.js';

const contentScreen = document.getElementsByClassName("content-screen")[0];

// Dados globais para o gráfico de radar
let encountersData, locationsData, pokemonStatsData, statsData, pokemonBasicData;

// Variável para armazenar o ID da localização atual
let currentLocationId = null;

// Variável para controlar pokémon selecionado (compartilhada com scatterPlot)
let selectedPokemonId = null;

// Variável para armazenar o valor máximo das stats da localização atual
let locationMaxStatValue = null;

// Carregar dados necessários para o gráfico de radar
Promise.all([
    d3.csv("../data/encounters.csv", d3.autoType),
    d3.csv("../data/locations.csv", d3.autoType),
    d3.csv("../data/pokemon_stats.csv", d3.autoType),
    d3.csv("../data/stats.csv", d3.autoType),
    d3.csv("../data/pokemon.csv", d3.autoType)
]).then(([encountersRaw, locations, pokemonStats, stats, pokemon]) => {
    // Filtra encounters para manter apenas pares únicos (location_area_id, pokemon_id)
    const seen = new Set();
    const filteredEncounters = [];

    for (const row of encountersRaw) {
        // Filtrar apenas pokémons até ID 721 (Kalos)
        if (row.pokemon_id <= 721) {
            const key = `${row.location_area_id}-${row.pokemon_id}`;
            if (!seen.has(key)) {
                seen.add(key);
                filteredEncounters.push(row);
            }
        }
    }

    encountersData = filteredEncounters;
    locationsData = locations;
    // Filtrar stats e pokemon também por ID 721
    pokemonStatsData = pokemonStats.filter(stat => stat.pokemon_id <= 721);
    statsData = stats;

    // Criar mapa dos dados básicos dos pokémons para acesso global
    pokemonBasicData = new Map();
    pokemon.filter(p => p.id <= 721).forEach(p => {
        pokemonBasicData.set(p.id, {
            id: p.id,
            identifier: p.identifier,
            height: p.height,
            weight: p.weight
        });
    });

    // Expor globalmente para uso nos tooltips
    window.pokemonBasicData = pokemonBasicData;
});

/**
 * Renderiza um radar chart com as Estatísticas Médias dos Pokémons dos pokémon da localização
 */
export async function renderStatRadarChart(locationId) {
    // Armazenar o ID da localização atual
    currentLocationId = locationId;

    try {
        const locationAreaIds_ = await getLocationAreaByLocation(locationId);

        if (locationAreaIds_.length === 0) {
            return;
        }

        // Determinar a região baseada na localização
        const regionName = await getRegionByLocationId(locationId);

        // Usar a mesma função que o scatter plot para obter os pokémon
        const pokemonsWithTypes = await getPokemonsByMultipleLocationAreas(
            locationAreaIds_, // usar o array completo retornado por getLocationAreaByLocation
            regionName
        );

        if (pokemonsWithTypes.length === 0) {
            return;
        }

        // Calcular o valor máximo de todas as stats de todos os pokémons da localização
        let maxStatValue = 0;
        pokemonsWithTypes.forEach(pokemon => {
            if (pokemon.Hp_Stat !== undefined &&
                pokemon.Attack_Stat !== undefined &&
                pokemon.Defense_Stat !== undefined &&
                pokemon.Special_Attack_Stat !== undefined &&
                pokemon.Special_Defense_Stat !== undefined &&
                pokemon.Speed_Stat !== undefined) {

                const pokemonStats = [
                    pokemon.Hp_Stat,
                    pokemon.Attack_Stat,
                    pokemon.Defense_Stat,
                    pokemon.Special_Attack_Stat,
                    pokemon.Special_Defense_Stat,
                    pokemon.Speed_Stat
                ];

                const pokemonMaxStat = Math.max(...pokemonStats);
                maxStatValue = Math.max(maxStatValue, pokemonMaxStat);
            }
        });

        // Armazenar o valor máximo globalmente para uso consistente
        locationMaxStatValue = maxStatValue;

        // Calcular Estatísticas Médias dos Pokémons usando os dados dos pokémon carregados
        const statSums = {
            'hp': 0,
            'attack': 0,
            'defense': 0,
            'special-attack': 0,
            'special-defense': 0,
            'speed': 0
        };

        let validPokemonCount = 0;

        // Para cada pokémon, somar suas estatísticas (cada pokémon conta apenas uma vez)
        pokemonsWithTypes.forEach(pokemon => {
            // Verificar se o pokémon tem dados de estatísticas do arquivo pokemon_stats_clean.csv
            if (pokemon.Hp_Stat !== undefined &&
                pokemon.Attack_Stat !== undefined &&
                pokemon.Defense_Stat !== undefined &&
                pokemon.Special_Attack_Stat !== undefined &&
                pokemon.Special_Defense_Stat !== undefined &&
                pokemon.Speed_Stat !== undefined) {

                statSums['hp'] += pokemon.Hp_Stat;
                statSums['attack'] += pokemon.Attack_Stat;
                statSums['defense'] += pokemon.Defense_Stat;
                statSums['special-attack'] += pokemon.Special_Attack_Stat;
                statSums['special-defense'] += pokemon.Special_Defense_Stat;
                statSums['speed'] += pokemon.Speed_Stat;

                validPokemonCount++;
            }
        });

        if (validPokemonCount === 0) {
            console.warn("Nenhuma estatística válida encontrada para os pokémon da localização.");
            return;
        }

        // Calcular médias
        const avgStats = {};
        Object.keys(statSums).forEach(stat => {
            avgStats[stat] = statSums[stat] / validPokemonCount;
        });

        // Determinar cor baseada no tipo mais comum na localização (usando os mesmos pokémon)
        let radarColor = "#4A90E2"; // cor padrão

        if (pokemonsWithTypes && pokemonsWithTypes.length > 0) {
            // Contar tipos primários
            // Contar tipos primários
            const typeCounts = {};
            pokemonsWithTypes.forEach(pokemon => {
                if (pokemon.types && pokemon.types.length > 0) {
                    const primaryType = pokemon.types[0].type_name;
                    typeCounts[primaryType] = (typeCounts[primaryType] || 0) + 1;
                }
            });

            // Encontrar o tipo mais comum
            const mostCommonType = Object.entries(typeCounts)
                .reduce((a, b) => typeCounts[a[0]] > typeCounts[b[0]] ? a : b)?.[0];

            if (mostCommonType && pokemonTypeColorsRGBA[mostCommonType]) {
                radarColor = pokemonTypeColorsRGBA[mostCommonType].replace('0.7)', '1)'); // remover transparência
            }
        }

        // Criar array de estatísticas na ordem correta: HP, Attack, Defense, Speed, Sp. Defense, Sp. Attack
        const statsArray = [
            { label: 'HP', value: Number(avgStats['hp'].toFixed(2)) || 0 },
            { label: 'Attack', value: Number(avgStats['attack'].toFixed(2)) || 0 },
            { label: 'Defense', value: Number(avgStats['defense'].toFixed(2)) || 0 },
            { label: 'Speed', value: Number(avgStats['speed'].toFixed(2)) || 0 },
            { label: 'Sp. Defense', value: Number(avgStats['special-defense'].toFixed(2)) || 0 },
            { label: 'Sp. Attack', value: Number(avgStats['special-attack'].toFixed(2)) || 0 }
        ];

        // Limpar container do radar antes de renderizar
        const container = document.querySelector("#radar-chart-location");
        if (container) container.innerHTML = '';

        // Usar a função modular para renderizar com a cor do tipo mais comum e valor máximo fixo
        const options = locationMaxStatValue ? { maxValue: locationMaxStatValue } : {};
        renderRadarChart(
            "#radar-chart-location",
            "Estatísticas Médias dos Pokémons",
            statsArray,
            radarColor,
            options // Passar o valor máximo calculado se disponível
        );

    } catch (error) {
        console.error("Erro ao calcular Estatísticas Médias dos Pokémons:", error);
    }
}

// Expor funções globalmente para integração com scatterPlot.js

// Expor variáveis globalmente para sincronização entre gráficos
window.getSelectedPokemonId = () => selectedPokemonId;
window.setSelectedPokemonId = (id) => { selectedPokemonId = id; };

// Expor o valor máximo das stats da localização
window.getLocationMaxStatValue = () => locationMaxStatValue;

// Função para determinar a região baseada na localização
async function getRegionByLocationId(locationId) {
    const regions = ["Kanto", "Johto", "Hoenn", "Sinnoh", "Unova", "Kalos"];

    for (const region of regions) {
        try {
            const locations = await getLocationsByRegionName(region);
            const foundLocation = locations.find(loc => loc.location_id === locationId);
            if (foundLocation) {
                return region;
            }
        } catch (error) {
            console.warn(`Erro ao buscar localização na região ${region}:`, error);
        }
    }

    return "Kanto"; // Fallback para Kanto se não encontrar
}

function createLocationSearchBar(locationName = "Localização Selecionada") {
    // Container principal da busca/info (similar ao pokemon search)
    const locationSearch = document.createElement("div");
    locationSearch.classList.add("location-search");
    locationSearch.style.width = "60%";
    locationSearch.style.padding = "10px";
    locationSearch.style.borderRadius = "12px";
    locationSearch.style.backgroundColor = "#1b1b1b";
    locationSearch.style.border = "4px solid #cccccc";
    locationSearch.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.1), inset 0 0 0 2px #000000, inset 0 0 0 4px #cccccc";
    locationSearch.style.display = "flex";
    locationSearch.style.alignItems = "center";
    locationSearch.style.gap = "15px";
    locationSearch.style.marginTop = "15px";
    locationSearch.style.marginBottom = "15px";
    locationSearch.style.position = "relative";
    locationSearch.style.fontFamily = '"Pixelify Sans", sans-serif';

    const locationIcon = document.createElement("img");
    locationIcon.src = "../assets/compass.png";
    locationIcon.style.height = "32px";
    locationIcon.style.width = "32px";
    locationIcon.style.objectFit = "contain";
    locationIcon.style.flexShrink = "0";
    locationIcon.style.backgroundColor = "#1b1b1b";
    locationIcon.style.borderRadius = "6px";
    locationIcon.style.padding = "4px";

    // Campo de "busca" (só visual, mostra o nome da localização)
    const locationDisplayBox = document.createElement("div");
    locationDisplayBox.style.flex = "1";
    locationDisplayBox.style.height = "40px";
    locationDisplayBox.style.padding = "0 12px";
    locationDisplayBox.style.border = "1px solid #3a3a3a";
    locationDisplayBox.style.borderRadius = "8px";
    locationDisplayBox.style.fontSize = "1rem";
    locationDisplayBox.style.backgroundColor = "#1b1b1b";
    locationDisplayBox.style.boxShadow = "inset 0 2px 6px rgba(0,0,0,0.2), 0 1px 3px rgba(255,255,255,0.1)";
    locationDisplayBox.style.display = "flex";
    locationDisplayBox.style.alignItems = "center";
    locationDisplayBox.style.fontWeight = "bold";
    locationDisplayBox.style.color = "#ffffff";
    locationDisplayBox.style.textShadow = "1px 1px 2px rgba(0,0,0,0.8)";
    locationDisplayBox.textContent = locationName;

    locationSearch.appendChild(locationIcon);
    locationSearch.appendChild(locationDisplayBox);

    return locationSearch;
}

function createLocationInfoCards(locationId) {
    // Container para cards de informação (similar ao pokemon cards)
    const locationInfoArea = document.createElement("div");
    locationInfoArea.classList.add("location-info-area");
    locationInfoArea.style.width = "60%";
    locationInfoArea.style.display = "flex";
    locationInfoArea.style.alignItems = "center";
    locationInfoArea.style.justifyContent = "center";
    locationInfoArea.style.flexDirection = "row";
    locationInfoArea.style.gap = "10px";
    locationInfoArea.style.marginBottom = "15px";

    // Card 1: Pokémon com maior stats total da localização
    const infoCard1 = document.createElement("div");
    infoCard1.classList.add("location-info-card");
    infoCard1.style.width = "25%";
    infoCard1.style.padding = "12px";
    infoCard1.style.backgroundColor = "#1b1b1b";
    infoCard1.style.borderRadius = "10px";
    infoCard1.style.border = "2px solid #ffffff";
    infoCard1.style.color = "#ffffff";
    infoCard1.style.display = "flex";
    infoCard1.style.flexDirection = "column";
    infoCard1.style.alignItems = "center";
    infoCard1.style.fontFamily = '"Pixelify Sans", sans-serif';
    infoCard1.style.fontSize = "0.8em";
    infoCard1.style.textAlign = "center";
    infoCard1.style.minHeight = "90px";
    infoCard1.style.justifyContent = "center";
    infoCard1.style.transition = "all 0.3s ease";
    infoCard1.style.cursor = "pointer";

    // Efeitos de hover para o card 1
    infoCard1.addEventListener("mouseenter", () => {
        infoCard1.style.transform = "translateY(-5px)";
        infoCard1.style.boxShadow = "0 8px 16px rgba(255, 255, 255, 0.2)";
    });
    infoCard1.addEventListener("mouseout", () => {
        infoCard1.style.transform = "translateY(0)";
        infoCard1.style.boxShadow = "none";
    });

    infoCard1.innerHTML = `
        <img id="strongest-pokemon-img" src="../assets/power.png" style="height: 56px; margin-bottom: 2px;">
        <div style="font-weight: bold; margin-bottom: 2px;">Maior Status Base</div>
        <div id="strongest-pokemon">Carregando...</div>
    `;

    // Card 2: Número de pokémon na localização
    const infoCard2 = document.createElement("div");
    infoCard2.classList.add("location-info-card");
    infoCard2.style.width = "25%";
    infoCard2.style.padding = "12px";
    infoCard2.style.backgroundColor = "#1b1b1b";
    infoCard2.style.borderRadius = "10px";
    infoCard2.style.border = "2px solid #ffffff";
    infoCard2.style.color = "#ffffff";
    infoCard2.style.display = "flex";
    infoCard2.style.flexDirection = "column";
    infoCard2.style.alignItems = "center";
    infoCard2.style.fontFamily = '"Pixelify Sans", sans-serif';
    infoCard2.style.fontSize = "0.8em";
    infoCard2.style.textAlign = "center";
    infoCard2.style.minHeight = "90px";
    infoCard2.style.justifyContent = "center";
    infoCard2.style.transition = "all 0.3s ease";
    infoCard2.style.cursor = "pointer";

    // Efeitos de hover para o card 2
    infoCard2.addEventListener("mouseenter", () => {
        infoCard2.style.transform = "translateY(-5px)";
        infoCard2.style.boxShadow = "0 8px 16px rgba(255, 255, 255, 0.2)";
    });
    infoCard2.addEventListener("mouseout", () => {
        infoCard2.style.transform = "translateY(0)";
        infoCard2.style.boxShadow = "none";
    });

    infoCard2.innerHTML = `
        <img src="../assets/pokeball.png" style="height: 32px; margin-bottom: 8px;">
        <div style="font-weight: bold; margin-bottom: 3px;">Pokémon</div>
        <div id="pokemon-count">Carregando...</div>
    `;

    // Card 3: Tipo mais comum
    const infoCard3 = document.createElement("div");
    infoCard3.classList.add("location-info-card");
    infoCard3.style.width = "25%";
    infoCard3.style.padding = "12px";
    infoCard3.style.backgroundColor = "#1b1b1b";
    infoCard3.style.borderRadius = "10px";
    infoCard3.style.border = "2px solid #ffffff";
    infoCard3.style.color = "#ffffff";
    infoCard3.style.display = "flex";
    infoCard3.style.flexDirection = "column";
    infoCard3.style.alignItems = "center";
    infoCard3.style.fontFamily = '"Pixelify Sans", sans-serif';
    infoCard3.style.fontSize = "0.8em";
    infoCard3.style.textAlign = "center";
    infoCard3.style.minHeight = "90px";
    infoCard3.style.justifyContent = "center";
    infoCard3.style.transition = "all 0.3s ease";
    infoCard3.style.cursor = "pointer";

    // Efeitos de hover para o card 3
    infoCard3.addEventListener("mouseenter", () => {
        infoCard3.style.transform = "translateY(-5px)";
        infoCard3.style.boxShadow = "0 8px 16px rgba(255, 255, 255, 0.2)";
    });
    infoCard3.addEventListener("mouseout", () => {
        infoCard3.style.transform = "translateY(0)";
        infoCard3.style.boxShadow = "none";
    });

    infoCard3.innerHTML = `
        <img src="assets/types/normal.png" style="height: 32px; margin-bottom: 8px;" id="most-common-type-img">
        <div style="font-weight: bold; margin-bottom: 3px;">Tipo Comum</div>
        <div id="most-common-type">Carregando...</div>
    `;

    const infoCard4 = document.createElement("div");
    infoCard4.classList.add("location-info-card");
    infoCard4.style.width = "25%";
    infoCard4.style.padding = "12px";
    infoCard4.style.backgroundColor = "#1b1b1b";
    infoCard4.style.borderRadius = "10px";
    infoCard4.style.border = "2px solid #ffffff";
    infoCard4.style.color = "#ffffff";
    infoCard4.style.display = "flex";
    infoCard4.style.flexDirection = "column";
    infoCard4.style.alignItems = "center";
    infoCard4.style.fontFamily = '"Pixelify Sans", sans-serif';
    infoCard4.style.fontSize = "0.8em";
    infoCard4.style.textAlign = "center";
    infoCard4.style.minHeight = "90px";
    infoCard4.style.justifyContent = "center";
    infoCard4.style.transition = "all 0.3s ease";
    infoCard4.style.cursor = "pointer";

    // Efeitos de hover para o card 4
    infoCard4.addEventListener("mouseenter", () => {
        infoCard4.style.transform = "translateY(-5px)";
        infoCard4.style.boxShadow = "0 8px 16px rgba(255, 255, 255, 0.2)";
    });
    infoCard4.addEventListener("mouseout", () => {
        infoCard4.style.transform = "translateY(0)";
        infoCard4.style.boxShadow = "none";
    });

    infoCard4.innerHTML = `
        <img src="assets/earth-globe.png" style="height: 32px; margin-bottom: 8px;">
        <div style="font-weight: bold; margin-bottom: 3px;">Sub-áreas</div>
        <div id="location-areas">Carregando...</div>
    `;

    locationInfoArea.appendChild(infoCard1);
    locationInfoArea.appendChild(infoCard2);
    locationInfoArea.appendChild(infoCard3);
    locationInfoArea.appendChild(infoCard4);

    return locationInfoArea;
}

// Função para atualizar cards de informação com dados reais
async function updateLocationInfoCards(locationId) {
    try {
        // Obter área de localização
        const locationAreaIds = await getLocationAreaByLocation(locationId);

        // Determinar a região baseada na localização (apenas para buscar os pokémon)
        const regionName = await getRegionByLocationId(locationId);

        // Obter pokémon da localização
        const pokemonsWithTypes = await getPokemonsByMultipleLocationAreas(
            locationAreaIds,
            regionName
        );

        // Atualizar contagem de pokémon
        document.getElementById('pokemon-count').textContent = `${pokemonsWithTypes.length} espécies`;

        // Calcular pokémon com maior stats total
        let strongestPokemon = null;
        let strongestPokemonId = null;
        let maxStatsTotal = 0;

        pokemonsWithTypes.forEach(pokemon => {
            if (pokemon.Hp_Stat !== undefined &&
                pokemon.Attack_Stat !== undefined &&
                pokemon.Defense_Stat !== undefined &&
                pokemon.Special_Attack_Stat !== undefined &&
                pokemon.Special_Defense_Stat !== undefined &&
                pokemon.Speed_Stat !== undefined) {

                const statsTotal = pokemon.Hp_Stat + pokemon.Attack_Stat + pokemon.Defense_Stat +
                    pokemon.Special_Attack_Stat + pokemon.Special_Defense_Stat + pokemon.Speed_Stat;

                if (statsTotal > maxStatsTotal) {
                    maxStatsTotal = statsTotal;
                    strongestPokemon = pokemon.name;
                    strongestPokemonId = pokemon.pokemon_id;
                }
            }
        });

        if (strongestPokemon && strongestPokemonId) {
            document.getElementById('strongest-pokemon').textContent = strongestPokemon.charAt(0).toUpperCase() + strongestPokemon.slice(1);
            // Atualizar a imagem do pokémon mais forte
            const strongestPokemonImg = document.getElementById('strongest-pokemon-img');
            if (strongestPokemonImg) {
                strongestPokemonImg.src = `../assets/pokemons/${strongestPokemonId}.png`;
                strongestPokemonImg.style.objectFit = "contain";
                strongestPokemonImg.onerror = function () {
                    // Fallback para o ícone de power se a imagem não for encontrada
                    this.src = "../assets/power.png";
                };
            }

            // Adicionar tooltip e funcionalidade de clique ao card do pokémon mais forte
            const strongestPokemonCard = document.querySelector('.location-info-card');
            if (strongestPokemonCard) {
                // Encontrar os dados do pokémon mais forte
                const strongestPokemonData = pokemonsWithTypes.find(p => p.pokemon_id === strongestPokemonId);

                if (strongestPokemonData) {
                    setupStrongestPokemonInteraction(strongestPokemonCard, strongestPokemonData, maxStatsTotal);
                }
            }
        } else {
            document.getElementById('strongest-pokemon').textContent = "N/A";
            // Manter o ícone de power se não encontrar pokémon
            const strongestPokemonImg = document.getElementById('strongest-pokemon-img');
            if (strongestPokemonImg) {
                strongestPokemonImg.src = "../assets/power.png";
            }
        }

        // Calcular tipo mais comum
        const typeCounts = {};
        pokemonsWithTypes.forEach(pokemon => {
            if (pokemon.types && pokemon.types.length > 0) {
                const primaryType = pokemon.types[0].type_name;
                typeCounts[primaryType] = (typeCounts[primaryType] || 0) + 1;
            }
        });

        const mostCommonType = Object.entries(typeCounts)
            .reduce((a, b) => typeCounts[a[0]] > typeCounts[b[0]] ? a : b)?.[0];

        if (mostCommonType) {
            document.getElementById('most-common-type').textContent = mostCommonType.charAt(0).toUpperCase() + mostCommonType.slice(1);
            document.getElementById('most-common-type-img').src = `../assets/types/${mostCommonType}.png`;
        }

        // Calcular número de áreas da localização
        document.getElementById('location-areas').textContent = `${locationAreaIds.length} área${locationAreaIds.length !== 1 ? 's' : ''}`;

    } catch (error) {
        console.error("Erro ao atualizar cards de informação:", error);
    }
}

function createChartContainer() {
    const chartContainer = document.createElement("div");
    chartContainer.classList.add("location-chart-container");
    chartContainer.style.width = "90%";
    chartContainer.style.height = "70vh";
    chartContainer.style.display = "flex";
    chartContainer.style.alignItems = "center";
    chartContainer.style.justifyContent = "center";
    chartContainer.style.flexDirection = "row";
    chartContainer.style.gap = "15px";
    chartContainer.style.marginTop = "15px";
    chartContainer.style.marginBottom = "20px";

    // Container expandido para o scatter plot
    const leftScatterContainer = document.createElement('div');
    leftScatterContainer.id = 'location-scatter-container';
    leftScatterContainer.style.width = '58%';
    leftScatterContainer.style.height = '100%';
    leftScatterContainer.style.display = 'flex';
    leftScatterContainer.style.flexDirection = 'column';
    leftScatterContainer.style.justifyContent = 'center';
    leftScatterContainer.style.alignItems = 'center';
    leftScatterContainer.style.backgroundColor = '#1b1b1b';
    leftScatterContainer.style.borderRadius = '15px';
    leftScatterContainer.style.border = '2px solid #ffffff';
    leftScatterContainer.style.padding = '15px';
    leftScatterContainer.style.boxSizing = 'border-box';
    leftScatterContainer.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)';

    // Título do container de scatter plot
    const scatterTitle = document.createElement('h2');
    scatterTitle.textContent = "Tamanho e Stats Totais dos Pokémons";
    scatterTitle.style.color = 'white';
    scatterTitle.style.marginBottom = '5px';
    scatterTitle.style.marginTop = '0px';
    scatterTitle.style.fontFamily = '"Pixelify Sans", sans-serif';
    scatterTitle.style.fontSize = '1.0em';
    scatterTitle.style.textAlign = 'center';
    scatterTitle.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.7)';
    leftScatterContainer.appendChild(scatterTitle);

    // Container para o gráfico scatter plot
    const scatterChart = document.createElement('div');
    scatterChart.id = 'scatter-chart-container';
    scatterChart.style.width = '100%';
    scatterChart.style.height = 'calc(100% - 35px)';
    scatterChart.style.display = 'flex';
    scatterChart.style.justifyContent = 'center';
    scatterChart.style.alignItems = 'center';
    scatterChart.style.minHeight = '450px';
    scatterChart.style.maxHeight = '450px';
    scatterChart.style.overflow = 'visible';
    scatterChart.style.boxSizing = 'border-box';
    scatterChart.style.position = 'relative';

    leftScatterContainer.appendChild(scatterChart);

    // Container expandido para o radar chart
    const rightContainer = document.createElement('div');
    rightContainer.id = 'location-radar-container';
    rightContainer.style.width = '42%';
    rightContainer.style.height = '100%';
    rightContainer.style.display = 'flex';
    rightContainer.style.flexDirection = 'column';
    rightContainer.style.justifyContent = 'center';
    rightContainer.style.alignItems = 'center';
    rightContainer.style.backgroundColor = '#1b1b1b';
    rightContainer.style.borderRadius = '15px';
    rightContainer.style.border = '2px solid #ffffff';
    rightContainer.style.padding = '15px';
    rightContainer.style.boxSizing = 'border-box';
    rightContainer.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)';

    // Título do container de radar chart
    const title = document.createElement('h2');
    title.textContent = "Estatísticas Médias dos Pokémons";
    title.style.color = 'white';
    title.style.marginBottom = '5px';
    title.style.marginTop = '0px';
    title.style.fontFamily = '"Pixelify Sans", sans-serif';
    title.style.fontSize = '1.0em';
    title.style.textAlign = 'center';
    title.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.7)';
    rightContainer.appendChild(title);

    // Container para o gráfico de radar
    const radarChart = document.createElement('div');
    radarChart.id = 'radar-chart-location';
    radarChart.style.width = '100%';
    radarChart.style.height = 'calc(100% - 35px)';
    radarChart.style.display = 'flex';
    radarChart.style.justifyContent = 'center';
    radarChart.style.alignItems = 'center';
    radarChart.style.minHeight = '450px';
    radarChart.style.maxHeight = '450px';
    radarChart.style.padding = '10px 30px 50px 30px';
    radarChart.style.overflow = 'visible';
    radarChart.style.boxSizing = 'border-box';
    radarChart.style.position = 'relative';

    rightContainer.appendChild(radarChart);

    chartContainer.appendChild(leftScatterContainer);
    chartContainer.appendChild(rightContainer);

    return chartContainer;
}

export async function createLocationScreen(id_location = 28) {
    contentScreen.scrollTo(0, 0);
    contentScreen.innerHTML = '';
    contentScreen.style.gap = "0";
    contentScreen.style.justifyContent = '';
    contentScreen.style.display = 'flex';
    contentScreen.style.flexDirection = 'column';
    contentScreen.style.alignItems = 'center';

    // Mostrar loading inicial
    const loadingDiv = document.createElement("div");
    loadingDiv.style.color = "white";
    loadingDiv.style.fontSize = "1.2em";
    loadingDiv.style.fontFamily = '"Pixelify Sans", sans-serif';
    loadingDiv.style.textAlign = "center";
    loadingDiv.style.marginTop = "50px";
    loadingDiv.textContent = "Carregando dados da localização...";
    contentScreen.appendChild(loadingDiv);

    try {
        // Buscar informações da localização
        let locationName = "Localização Selecionada";
        try {
            const regions = ["Kanto", "Johto", "Hoenn", "Sinnoh", "Unova", "Kalos"];
            for (const region of regions) {
                try {
                    const locations = await getLocationsByRegionName(region);
                    const location = locations.find(loc => loc.location_id === id_location);
                    if (location) {
                        locationName = location.location_name;
                        break;
                    }
                } catch (error) {
                    console.warn(`Erro ao buscar localização na região ${region}:`, error);
                }
            }
        } catch (error) {
            console.warn("Erro ao buscar nome da localização:", error);
        }

        // Limpar loading e criar elementos
        contentScreen.innerHTML = '';

        // Criar elementos da interface
        const locationSearchBar = createLocationSearchBar(locationName);
        const locationInfoCards = createLocationInfoCards(id_location);
        const chartContainer = createChartContainer();

        // Adicionar todos os elementos ao contentScreen
        contentScreen.appendChild(locationSearchBar);
        contentScreen.appendChild(locationInfoCards);
        contentScreen.appendChild(chartContainer);

        // Atualizar cards com dados reais
        await updateLocationInfoCards(id_location);

        // Chama os renderizadores passando os ids dos containers correspondentes
        setTimeout(() => {
            renderLocationScatterPlot(id_location, '#scatter-chart-container');
            renderStatRadarChart(id_location);
        }, 100); // Pequeno delay para garantir que os containers estejam no DOM

        // Adicionar listener para redimensionamento da janela
        const resizeHandler = () => {
            // Debounce para evitar muitos re-renders
            clearTimeout(window.locationScreenResizeTimeout);
            window.locationScreenResizeTimeout = setTimeout(() => {
                if (document.getElementById('scatter-chart-container') &&
                    document.getElementById('radar-chart-location')) {
                    renderLocationScatterPlot(id_location, '#scatter-chart-container');
                    renderStatRadarChart(id_location);
                }
            }, 300);
        };

        // Remover listener anterior se existir
        if (window.locationScreenResizeHandler) {
            window.removeEventListener('resize', window.locationScreenResizeHandler);
        }

        // Adicionar novo listener
        window.locationScreenResizeHandler = resizeHandler;
        window.addEventListener('resize', resizeHandler);

    } catch (error) {
        console.error("Erro ao criar tela de localização:", error);
        contentScreen.innerHTML = `
            <div style="color: white; text-align: center; margin-top: 50px; font-family: 'Pixelify Sans', sans-serif;">
                <h2>Erro ao carregar dados</h2>
                <p>Não foi possível carregar os dados da localização.</p>
                <p style="font-size: 0.9em; opacity: 0.7;">ID da localização: ${id_location}</p>
            </div>
        `;
    }
}

// Função para configurar tooltip e interação do card do pokémon mais forte
function setupStrongestPokemonInteraction(cardElement, pokemonData, totalStats) {
    // Obter dados básicos do pokémon (altura e peso)
    let pokemonBasicData = null;
    if (pokemonData && pokemonData.pokemon_id) {
        // Buscar dados básicos nos dados globais carregados
        if (window.pokemonBasicData && window.pokemonBasicData.get) {
            pokemonBasicData = window.pokemonBasicData.get(pokemonData.pokemon_id);
        }
    }

    // Event listeners para o tooltip
    cardElement.addEventListener("mouseenter", (event) => {
        // Remover tooltip anterior se existir
        d3.selectAll(".strongest-pokemon-tooltip").remove();

        // Criar novo tooltip
        const newTooltip = d3.select("body").append("div")
            .attr("class", "strongest-pokemon-tooltip")
            .style("position", "absolute")
            .style("background", "rgba(20, 20, 20, 0.95)")
            .style("color", "white")
            .style("padding", "12px")
            .style("border-radius", "8px")
            .style("font-size", "13px")
            .style("font-family", '"Pixelify Sans", sans-serif')
            .style("pointer-events", "none")
            .style("opacity", 0)
            .style("z-index", "1000")
            .style("border", "2px solid #fff")
            .style("box-shadow", "0 4px 20px rgba(0, 0, 0, 0.8)");

        newTooltip.transition()
            .duration(200)
            .style("opacity", 1);

        const pokemonName = pokemonData.name || "Pokémon";
        const pokemonTypes = pokemonData.types && pokemonData.types.length > 0
            ? pokemonData.types.map(t => t.type_name.charAt(0).toUpperCase() + t.type_name.slice(1)).join(', ')
            : 'Desconhecido';

        let tooltipContent = `
            <div style="text-align: center;">
                <strong style="font-size: 15px; color: #ffdd44; margin-bottom: 10px; display: block;">${pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1)}</strong>
                <div style="margin-bottom: 10px;">
                    <img src="../assets/pokemons/${pokemonData.pokemon_id}.png" 
                         style="width: 96px; height: 96px; image-rendering: pixelated;" 
                         onerror="this.src='../assets/ball.png'; this.style.opacity='0.7';"
                         alt="${pokemonName}">
                </div>
                <div style="margin: 8px 0; font-size: 12px;">
                    <div><strong>Tipo:</strong> ${pokemonTypes}</div>`;

        // Adicionar altura e peso se disponíveis
        if (pokemonBasicData) {
            tooltipContent += `
                    <div><strong>Peso:</strong> ${(pokemonBasicData.weight / 10).toFixed(2)} kg</div>
                    <div><strong>Altura:</strong> ${(pokemonBasicData.height / 10).toFixed(2)} m</div>`;
        }

        tooltipContent += `
                    <div><strong>Total Stats:</strong> ${totalStats}</div>
                </div>
                <div style="font-size: 11px; color: #ccc; margin-top: 8px;">
                    Clique para ver estatísticas detalhadas
                </div>
            </div>
        `;

        newTooltip.html(tooltipContent)
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 10) + "px");
    });

    cardElement.addEventListener("mousemove", (event) => {
        const activeTooltip = d3.select(".strongest-pokemon-tooltip");
        if (!activeTooltip.empty()) {
            activeTooltip
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 10) + "px");
        }
    });

    cardElement.addEventListener("mouseleave", () => {
        d3.selectAll(".strongest-pokemon-tooltip")
            .transition()
            .duration(300)
            .style("opacity", 0)
            .remove();
    });

    // Event listener para clique - renderizar estatísticas no radar
    cardElement.addEventListener("click", () => {
        if (pokemonData && pokemonData.pokemon_id) {
            renderStrongestPokemonStats(pokemonData.pokemon_id, pokemonData.name);

            // Sincronizar seleção com scatter plot se existir
            if (window.setSelectedPokemonId) {
                window.setSelectedPokemonId(pokemonData.pokemon_id);
            }

            // Atualizar visualmente o scatter plot se existir
            const scatterContainer = document.querySelector('#location-scatter-container');
            if (scatterContainer) {
                const dots = scatterContainer.querySelectorAll('.dot');
                dots.forEach(dot => {
                    d3.select(dot)
                        .style("stroke-width", 2)
                        .style("fill-opacity", 0.8);
                });

                // Destacar o pokémon selecionado no scatter plot
                const selectedDot = scatterContainer.querySelector(`[data-pokemon-id="${pokemonData.pokemon_id}"]`);
                if (selectedDot) {
                    d3.select(selectedDot)
                        .style("stroke-width", 4)
                        .style("fill-opacity", 1);
                }
            }
        }
    });
}

// Função para renderizar estatísticas do pokémon mais forte no radar
async function renderStrongestPokemonStats(pokemonId, pokemonName) {
    if (!pokemonStatsData || !statsData) {
        console.warn("Dados de estatísticas não carregados.");
        return;
    }

    try {
        // Mapear IDs de estatísticas para nomes
        const mainStatIds = new Set([1, 2, 3, 4, 5, 6]);
        const statMapping = {
            1: 'HP',          // hp
            2: 'Attack',      // attack  
            3: 'Defense',     // defense
            4: 'Sp. Attack',  // special-attack
            5: 'Sp. Defense', // special-defense
            6: 'Speed'        // speed
        };

        // Buscar estatísticas do pokémon
        const pokemonStats = pokemonStatsData.filter(stat =>
            stat.pokemon_id === pokemonId && mainStatIds.has(stat.stat_id)
        );

        // Criar array de estatísticas na ordem correta: HP, Attack, Defense, Speed, Sp. Defense, Sp. Attack
        const statsArray = [
            { label: 'HP', value: 0 },
            { label: 'Attack', value: 0 },
            { label: 'Defense', value: 0 },
            { label: 'Speed', value: 0 },
            { label: 'Sp. Defense', value: 0 },
            { label: 'Sp. Attack', value: 0 }
        ];

        // Preencher os valores das estatísticas
        pokemonStats.forEach(stat => {
            const statLabel = statMapping[stat.stat_id];
            const statIndex = statsArray.findIndex(s => s.label === statLabel);
            if (statIndex >= 0) {
                statsArray[statIndex].value = stat.base_stat;
            }
        });

        // Buscar dados do pokémon para determinar a cor baseada no tipo
        let radarColor = "#4A90E2"; // cor padrão

        // Tentar encontrar o pokémon nos dados da localização atual para obter tipos
        if (currentLocationId) {
            try {
                const locationAreaIds_ = await getLocationAreaByLocation(currentLocationId);
                const regionName = await getRegionByLocationId(currentLocationId);
                const pokemonsWithTypes = await getPokemonsByMultipleLocationAreas(
                    locationAreaIds_,
                    regionName
                );

                const pokemonFromData = pokemonsWithTypes.find(p => p.pokemon_id === pokemonId);
                if (pokemonFromData && pokemonFromData.types && pokemonFromData.types.length > 0) {
                    const primaryType = pokemonFromData.types[0].type_name;
                    radarColor = pokemonTypeColorsRGBA[primaryType] ?
                        pokemonTypeColorsRGBA[primaryType].replace('0.7)', '1)') : // remover transparência
                        "#4A90E2";
                }
            } catch (error) {
                console.warn("Erro ao buscar tipos do pokémon:", error);
            }
        }

        // Limpar container do radar antes de renderizar
        const container = document.querySelector("#radar-chart-location");
        if (container) container.innerHTML = '';

        const formattedPokemonName = pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1);

        // Usar a função modular para renderizar com a cor do tipo e valor máximo fixo da localização
        const options = locationMaxStatValue ? { maxValue: locationMaxStatValue } : {};
        renderRadarChart(
            "#radar-chart-location",
            formattedPokemonName,
            statsArray,
            radarColor,
            options // Usar o mesmo valor máximo da localização se disponível
        );

        // Atualizar título do container do radar
        const radarTitle = document.querySelector('#location-radar-container h2');
        if (radarTitle) {
            radarTitle.textContent = `Estatísticas de ${formattedPokemonName}`;
        }

        // Mostrar botão de limpar seleção do radar se não existir
        let clearRadarBtn = document.getElementById('clear-radar-selection-btn');
        if (!clearRadarBtn) {
            clearRadarBtn = createClearRadarButton();
        }
        clearRadarBtn.style.display = 'block';
        clearRadarBtn.style.opacity = '1';

        // Também destacar o botão do scatter plot se existir
        const scatterContainer = document.querySelector('#location-scatter-container');
        if (scatterContainer) {
            const clearScatterBtn = scatterContainer.querySelector('.clear-button');
            if (clearScatterBtn) {
                clearScatterBtn.style.opacity = '1';
            }
        }

    } catch (error) {
        console.error("Erro ao renderizar estatísticas do pokémon mais forte:", error);
    }
}

// Função para criar botão de limpar seleção do radar
function createClearRadarButton() {
    const radarContainer = document.querySelector('#location-radar-container');
    if (!radarContainer) return null;

    const clearButton = document.createElement('div');
    clearButton.id = 'clear-radar-selection-btn';
    clearButton.style.position = 'absolute';
    clearButton.style.top = '15px';
    clearButton.style.right = '15px';
    clearButton.style.cursor = 'pointer';
    clearButton.style.opacity = '0.7';
    clearButton.style.zIndex = '1000';
    clearButton.style.display = 'none';

    const buttonElement = document.createElement('button');
    buttonElement.style.backgroundColor = '#4a90e2';
    buttonElement.style.color = 'white';
    buttonElement.style.border = 'none';
    buttonElement.style.padding = '6px 12px';
    buttonElement.style.borderRadius = '6px';
    buttonElement.style.fontSize = '0.8em';
    buttonElement.style.fontFamily = '"Pixelify Sans", sans-serif';
    buttonElement.style.cursor = 'pointer';
    buttonElement.style.transition = 'background-color 0.2s ease';
    buttonElement.textContent = '✕ Limpar Seleção';

    buttonElement.addEventListener('mouseenter', () => {
        buttonElement.style.backgroundColor = '#357abd';
    });

    buttonElement.addEventListener('mouseleave', () => {
        buttonElement.style.backgroundColor = '#4a90e2';
    });

    buttonElement.addEventListener('click', async () => {
        // Limpar seleção
        selectedPokemonId = null;
        if (window.setSelectedPokemonId) {
            window.setSelectedPokemonId(null);
        }

        // Limpar seleção visual do scatter plot
        const scatterContainer = document.querySelector('#location-scatter-container');
        if (scatterContainer) {
            const dots = scatterContainer.querySelectorAll('.dot');
            dots.forEach(dot => {
                d3.select(dot)
                    .style("stroke-width", 2)
                    .style("fill-opacity", 0.8);
            });

            // Atualizar botão do scatter plot
            const clearScatterBtn = scatterContainer.querySelector('.clear-button');
            if (clearScatterBtn) {
                clearScatterBtn.style.opacity = '0.6';
            }
        }

        // Voltar para estatísticas médias
        if (currentLocationId) {
            const radarContainer = document.querySelector("#radar-chart-location");
            if (radarContainer) radarContainer.innerHTML = '';

            try {
                await renderStatRadarChart(currentLocationId);
            } catch (error) {
                console.error("Erro ao carregar estatísticas médias:", error);
            }

            // Restaurar título original
            const radarTitle = document.querySelector('#location-radar-container h2');
            if (radarTitle) {
                radarTitle.textContent = "Estatísticas Médias dos Pokémons";
            }

            // Ocultar botão de limpar seleção do radar
            clearButton.style.display = 'none';
            clearButton.style.opacity = '0.7';
        }
    });

    clearButton.appendChild(buttonElement);
    radarContainer.appendChild(clearButton);

    return clearButton;
}
