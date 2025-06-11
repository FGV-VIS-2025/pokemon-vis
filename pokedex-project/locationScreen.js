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
 * Renderiza um radar chart com as estatísticas médias dos pokémon da localização
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

        // Calcular estatísticas médias usando os dados dos pokémon carregados
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
            "Estatísticas Médias",
            statsArray,
            radarColor
        );

    } catch (error) {
        console.error("Erro ao calcular estatísticas médias:", error);
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

function createLocationInfoBar(locationName = "Localização Selecionada") {
    const locationInfo = document.createElement("div");
    locationInfo.classList.add("location-info-bar");
    locationInfo.style.width = "70%";
    locationInfo.style.padding = "15px";
    locationInfo.style.borderRadius = "12px";
    locationInfo.style.backgroundColor = "#f2f2f2";
    locationInfo.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.1)";
    locationInfo.style.display = "flex";
    locationInfo.style.alignItems = "center";
    locationInfo.style.gap = "15px";
    locationInfo.style.marginTop = "20px";
    locationInfo.style.marginBottom = "20px";
    locationInfo.style.position = "relative";
    locationInfo.style.justifyContent = "center";
    locationInfo.style.fontFamily = '"Pixelify Sans", sans-serif';
    locationInfo.style.fontSize = "1.3em";
    locationInfo.style.fontWeight = "bold";
    locationInfo.style.color = "#333";

    const locationIcon = document.createElement("img");
    locationIcon.src = "../assets/compass.png";
    locationIcon.style.height = "36px";
    locationIcon.style.width = "36px";
    locationIcon.style.objectFit = "contain";
    locationIcon.style.flexShrink = "0";

    const locationText = document.createElement("span");
    locationText.textContent = locationName;
    locationText.style.flex = "1";
    locationText.style.textAlign = "center";
    locationText.id = "location-title";

    locationInfo.appendChild(locationIcon);
    locationInfo.appendChild(locationText);

    return locationInfo;
}

// Função removida - cards não são mais necessários

function createChartContainer() {
    const chartContainer = document.createElement("div");
    chartContainer.classList.add("location-chart-container");
    chartContainer.style.width = "95%";
    chartContainer.style.height = "70vh"; // Altura fixa baseada na viewport
    chartContainer.style.display = "flex";
    chartContainer.style.alignItems = "center";
    chartContainer.style.justifyContent = "center";
    chartContainer.style.flexDirection = "row";
    chartContainer.style.gap = "25px";
    chartContainer.style.marginTop = "30px";
    chartContainer.style.marginBottom = "30px";

    // Container expandido para o scatter plot
    const leftScatterContainer = document.createElement('div');
    leftScatterContainer.id = 'location-scatter-container';
    leftScatterContainer.style.width = '58%'; // Aumentado para maior destaque
    leftScatterContainer.style.height = '100%';
    leftScatterContainer.style.display = 'flex';
    leftScatterContainer.style.flexDirection = 'column';
    leftScatterContainer.style.justifyContent = 'center';
    leftScatterContainer.style.alignItems = 'center';
    leftScatterContainer.style.backgroundColor = '#1b1b1b';
    leftScatterContainer.style.borderRadius = '20px';
    leftScatterContainer.style.border = '3px solid #ffffff';
    leftScatterContainer.style.padding = '15px';
    leftScatterContainer.style.boxSizing = 'border-box';
    leftScatterContainer.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.4)';

    // Título do container de scatter plot (mesma lógica do radar chart)
    const scatterTitle = document.createElement('h2');
    scatterTitle.textContent = "Dimensões dos Pokémons na Localização";
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
    rightContainer.style.width = '42%'; // Balanceado com o scatter plot
    rightContainer.style.height = '100%';
    rightContainer.style.display = 'flex';
    rightContainer.style.flexDirection = 'column';
    rightContainer.style.justifyContent = 'center';
    rightContainer.style.alignItems = 'center';
    rightContainer.style.backgroundColor = '#1b1b1b';
    rightContainer.style.borderRadius = '20px';
    rightContainer.style.border = '3px solid #ffffff';
    rightContainer.style.padding = '15px'; // Reduzido padding para mais espaço
    rightContainer.style.boxSizing = 'border-box';
    rightContainer.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.4)';

    // Título melhorado do container de radar chart
    const title = document.createElement('h2');
    title.textContent = "Estatísticas Médias dos Pokémons";
    title.style.color = 'white';
    title.style.marginBottom = '10px'; // Reduzido margin
    title.style.marginTop = '0px';
    title.style.fontFamily = '"Pixelify Sans", sans-serif';
    title.style.fontSize = '1.1em'; // Reduzido ligeiramente o tamanho da fonte
    title.style.textAlign = 'center';
    title.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.7)';
    rightContainer.appendChild(title);

    // Container ajustado para o gráfico de radar
    const radarChart = document.createElement('div');
    radarChart.id = 'radar-chart-location';
    radarChart.style.width = '100%';
    radarChart.style.height = 'calc(100% - 50px)'; // Altura ajustada sem botão
    radarChart.style.display = 'flex';
    radarChart.style.justifyContent = 'center';
    radarChart.style.alignItems = 'center';
    radarChart.style.minHeight = '450px'; // Altura mínima fixa para estabilidade
    radarChart.style.maxHeight = '450px'; // Altura máxima para evitar crescimento
    radarChart.style.padding = '30px'; // Padding aumentado para dar mais área aos labels
    radarChart.style.overflow = 'visible'; // Permitir tooltips fora do container
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
            const locations = await getLocationsByRegionName("Kanto"); // Assumindo Kanto por padrão
            const location = locations.find(loc => loc.location_id === id_location);
            if (location) {
                locationName = location.location_name;
            }
        } catch (error) {
            console.warn("Erro ao buscar nome da localização:", error);
        }

        // Limpar loading e criar elementos
        contentScreen.innerHTML = '';

        // Criar elementos da interface
        const locationInfo = createLocationInfoBar(locationName);
        const chartContainer = createChartContainer();

        // Adicionar todos os elementos ao contentScreen
        contentScreen.appendChild(locationInfo);
        contentScreen.appendChild(chartContainer);

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
