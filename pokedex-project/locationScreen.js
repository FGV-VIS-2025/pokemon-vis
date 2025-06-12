import { getLocationAreaByLocation, getLocationsByRegionName, getPokemonsByMultipleLocationAreas } from "./dataManager.js";
import { renderRadarChart } from "./radarChart.js";
import { renderLocationScatterPlot } from "./scatterPlot.js";

import { pokemonTypeColorsRGBA } from './consts.js';

const contentScreen = document.getElementsByClassName("content-screen")[0];

// Dados globais para o gráfico de radar
let encountersData, locationsData, pokemonStatsData, statsData;

// Variável para armazenar o ID da localização atual
let currentLocationId = null;

// Variável para controlar pokémon selecionado (compartilhada com scatterPlot)
let selectedPokemonId = null;

// Carregar dados necessários para o gráfico de radar
Promise.all([
    d3.csv("../data/encounters.csv", d3.autoType),
    d3.csv("../data/locations.csv", d3.autoType),
    d3.csv("../data/pokemon_stats.csv", d3.autoType),
    d3.csv("../data/stats.csv", d3.autoType)
]).then(([encountersRaw, locations, pokemonStats, stats]) => {
    // Filtra encounters para manter apenas pares únicos (location_area_id, pokemon_id)
    const seen = new Set();
    const filteredEncounters = [];

    for (const row of encountersRaw) {
        const key = `${row.location_area_id}-${row.pokemon_id}`;
        if (!seen.has(key)) {
            seen.add(key);
            filteredEncounters.push(row);
        }
    }

    encountersData = filteredEncounters;
    locationsData = locations;
    pokemonStatsData = pokemonStats;
    statsData = stats;
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
            console.warn(`Nenhuma location_area encontrada para location_id ${locationId}`);
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
            console.warn(`Nenhum Pokémon encontrado para location_id ${locationId}`);
            return;
        }

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

        // Usar a função modular para renderizar com a cor do tipo mais comum
        renderRadarChart(
            "#radar-chart-location",
            "Estatísticas Médias dos Pokémons",
            statsArray,
            radarColor
        );

    } catch (error) {
        console.error("Erro ao calcular Estatísticas Médias dos Pokémons:", error);
    }
}

// Expor funções globalmente para integração com scatterPlot.js

// Expor variáveis globalmente para sincronização entre gráficos
window.getSelectedPokemonId = () => selectedPokemonId;
window.setSelectedPokemonId = (id) => { selectedPokemonId = id; };

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
    locationSearch.style.backgroundColor = "#f2f2f2";
    locationSearch.style.border = "2px solid #888888";
    locationSearch.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.1)";
    locationSearch.style.display = "flex";
    locationSearch.style.alignItems = "center";
    locationSearch.style.gap = "15px";
    locationSearch.style.marginTop = "20px";
    locationSearch.style.marginBottom = "20px";
    locationSearch.style.position = "relative";
    locationSearch.style.fontFamily = '"Pixelify Sans", sans-serif';

    const locationIcon = document.createElement("img");
    locationIcon.src = "../assets/compass.png";
    locationIcon.style.height = "32px";
    locationIcon.style.width = "32px";
    locationIcon.style.objectFit = "contain";
    locationIcon.style.flexShrink = "0";

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
        <img src="../assets/types/normal.png" style="height: 32px; margin-bottom: 8px;" id="most-common-type-img">
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
        <img src="../assets/earth-globe.png" style="height: 32px; margin-bottom: 8px;">
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
    chartContainer.style.gap = "20px";
    chartContainer.style.marginTop = "20px";
    chartContainer.style.marginBottom = "30px";

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
    scatterTitle.style.marginBottom = '10px';
    scatterTitle.style.marginTop = '0px';
    scatterTitle.style.fontFamily = '"Pixelify Sans", sans-serif';
    scatterTitle.style.fontSize = '1.1em';
    scatterTitle.style.textAlign = 'center';
    scatterTitle.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.7)';
    leftScatterContainer.appendChild(scatterTitle);

    // Container para o gráfico scatter plot
    const scatterChart = document.createElement('div');
    scatterChart.id = 'scatter-chart-container';
    scatterChart.style.width = '100%';
    scatterChart.style.height = 'calc(100% - 50px)';
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
    title.style.marginBottom = '10px';
    title.style.marginTop = '0px';
    title.style.fontFamily = '"Pixelify Sans", sans-serif';
    title.style.fontSize = '1.1em';
    title.style.textAlign = 'center';
    title.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.7)';
    rightContainer.appendChild(title);

    // Container para o gráfico de radar
    const radarChart = document.createElement('div');
    radarChart.id = 'radar-chart-location';
    radarChart.style.width = '100%';
    radarChart.style.height = 'calc(100% - 50px)';
    radarChart.style.display = 'flex';
    radarChart.style.justifyContent = 'center';
    radarChart.style.alignItems = 'center';
    radarChart.style.minHeight = '450px';
    radarChart.style.maxHeight = '450px';
    radarChart.style.padding = '30px';
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
