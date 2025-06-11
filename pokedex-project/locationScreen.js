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
    if (!encountersData || !locationsData || !pokemonStatsData || !statsData) {
        console.warn("Dados ainda não carregados.");
        return;
    }

    // Armazenar o ID da localização atual
    currentLocationId = locationId;

    const locationAreaIds_ = await getLocationAreaByLocation(locationId);

    // Extrai os locationAreaId e coloca em um Set
    const locationAreaIdSet = new Set(locationAreaIds_.map(obj => obj.locationAreaId));

    if (locationAreaIdSet.size === 0) {
        console.warn(`Nenhuma location_area encontrada para location_id ${locationId}`);
        return;
    }

    // Filtra Pokémon encontrados nas location_areas associadas
    const pokemonIds = new Set(
        encountersData
            .filter(e => locationAreaIdSet.has(e.location_area_id))
            .map(e => e.pokemon_id)
    );

    if (pokemonIds.size === 0) {
        console.warn(`Nenhum Pokémon encontrado para location_id ${locationId}`);
        return;
    }

    const mainStatIds = new Set([1, 2, 3, 4, 5, 6]);

    const statSums = {};
    const statCounts = {};

    for (const entry of pokemonStatsData) {
        if (!pokemonIds.has(entry.pokemon_id)) continue;
        if (!mainStatIds.has(entry.stat_id)) continue;

        const statRow = statsData.find(s => s.id === entry.stat_id);
        if (!statRow || !statRow.identifier) continue;

        const statName = statRow.identifier;

        statSums[statName] = (statSums[statName] || 0) + entry.base_stat;
        statCounts[statName] = (statCounts[statName] || 0) + 1;
    }

    const avgStats = {};
    Object.keys(statSums).forEach(stat => {
        avgStats[stat] = statSums[stat] / statCounts[stat];
    });

    if (Object.keys(avgStats).length === 0) {
        console.warn("Nenhuma estatística disponível para os pokémon encontrados.");
        return;
    }

    // Determinar cor baseada no tipo mais comum na localização
    let radarColor = "#4A90E2"; // cor padrão

    try {
        // Buscar tipos dos pokémons da localização
        const pokemonTypes = await getPokemonsByMultipleLocationAreas(
            Array.from(locationAreaIdSet),
            "Kanto" // região padrão, pode ser melhorada
        );

        if (pokemonTypes && pokemonTypes.length > 0) {
            // Contar tipos primários
            const typeCounts = {};
            pokemonTypes.forEach(pokemon => {
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
    } catch (error) {
        console.warn("Erro ao determinar cor do tipo:", error);
    }

    // Mapeamento para os nomes usados no radar chart
    const statMapping = {
        'hp': 'HP',
        'attack': 'Attack',
        'defense': 'Defense',
        'speed': 'Speed',
        'special-defense': 'Sp. Defense',
        'special-attack': 'Sp. Attack'
    };

    // Criar array de estatísticas na ordem correta
    const statsArray = [
        { label: 'HP', value: avgStats['hp'] || 0 },
        { label: 'Attack', value: avgStats['attack'] || 0 },
        { label: 'Defense', value: avgStats['defense'] || 0 },
        { label: 'Speed', value: avgStats['speed'] || 0 },
        { label: 'Sp. Defense', value: avgStats['special-defense'] || 0 },
        { label: 'Sp. Attack', value: avgStats['special-attack'] || 0 }
    ];

    // Usar a função modular para renderizar com a cor do tipo mais comum
    renderRadarChart(
        "#radar-chart-location",
        "Estatísticas Médias",
        statsArray,
        radarColor
    );
}

// Função para limpar seleção do radar chart
function clearRadarSelection() {
    if (typeof currentLocationId !== 'undefined' && currentLocationId !== null) {
        // Limpar seleção visual do scatter plot também
        selectedPokemonId = null;

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

        // Re-renderizar as estatísticas médias da localização
        renderStatRadarChart(currentLocationId);

        // Ocultar o botão de limpar
        const clearBtn = document.getElementById('clear-radar-selection-btn');
        if (clearBtn) {
            clearBtn.style.display = 'none';
            clearBtn.style.opacity = '0.7';
        }

        // Restaurar título original
        const radarTitle = document.querySelector('#location-radar-container h2');
        if (radarTitle) {
            radarTitle.textContent = "Estatísticas Médias dos Pokémons";
        }
    }
}

// Função para mostrar/ocultar o botão de limpar seleção do radar
function toggleRadarClearButton(show = false) {
    const clearBtn = document.getElementById('clear-radar-selection-btn');
    if (clearBtn) {
        if (show) {
            clearBtn.style.display = 'block';
            clearBtn.style.opacity = '1';
        } else {
            clearBtn.style.display = 'none';
            clearBtn.style.opacity = '0.7';
        }
    }
}

// Expor funções globalmente para integração com scatterPlot.js
window.clearRadarSelection = clearRadarSelection;
window.toggleRadarClearButton = toggleRadarClearButton;

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
    leftScatterContainer.style.justifyContent = 'center';
    leftScatterContainer.style.alignItems = 'center';
    leftScatterContainer.style.backgroundColor = '#1b1b1b';
    leftScatterContainer.style.borderRadius = '20px';
    leftScatterContainer.style.border = '3px solid #ffffff';
    leftScatterContainer.style.padding = '25px';
    leftScatterContainer.style.boxSizing = 'border-box';
    leftScatterContainer.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.4)';
    leftScatterContainer.style.position = 'relative';

    // Título melhorado para o scatter plot
    const scatterTitle = document.createElement('div');
    scatterTitle.style.position = 'absolute';
    scatterTitle.style.top = '15px';
    scatterTitle.style.left = '50%';
    scatterTitle.style.transform = 'translateX(-50%)';
    scatterTitle.style.color = 'white';
    scatterTitle.style.fontFamily = '"Pixelify Sans", sans-serif';
    scatterTitle.style.fontSize = '1.3em';
    scatterTitle.style.fontWeight = 'bold';
    scatterTitle.style.textAlign = 'center';
    scatterTitle.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.7)';
    scatterTitle.textContent = 'Peso vs Altura dos Pokémons';
    leftScatterContainer.appendChild(scatterTitle);

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
    radarChart.style.height = 'calc(100% - 90px)'; // Altura ajustada para o botão
    radarChart.style.display = 'flex';
    radarChart.style.justifyContent = 'center';
    radarChart.style.alignItems = 'center';
    radarChart.style.minHeight = '450px'; // Altura mínima fixa para estabilidade
    radarChart.style.maxHeight = '450px'; // Altura máxima para evitar crescimento
    radarChart.style.padding = '30px'; // Padding aumentado para dar mais área aos labels
    radarChart.style.overflow = 'visible'; // Permitir tooltips fora do container
    radarChart.style.boxSizing = 'border-box';
    radarChart.style.position = 'relative';

    // Botão para limpar seleção no radar chart
    const clearRadarButton = document.createElement('button');
    clearRadarButton.id = 'clear-radar-selection-btn';
    clearRadarButton.innerHTML = '✕ Limpar Seleção';
    clearRadarButton.style.position = 'absolute';
    clearRadarButton.style.top = '10px';
    clearRadarButton.style.right = '10px';
    clearRadarButton.style.backgroundColor = '#4a90e2';
    clearRadarButton.style.color = 'white';
    clearRadarButton.style.border = 'none';
    clearRadarButton.style.padding = '6px 12px';
    clearRadarButton.style.borderRadius = '6px';
    clearRadarButton.style.fontSize = '0.8em';
    clearRadarButton.style.fontFamily = '"Pixelify Sans", sans-serif';
    clearRadarButton.style.cursor = 'pointer';
    clearRadarButton.style.transition = 'background-color 0.2s ease';
    clearRadarButton.style.zIndex = '1000';
    clearRadarButton.style.opacity = '0.7'; // Inicialmente semi-transparente
    clearRadarButton.style.display = 'none'; // Inicialmente oculto

    clearRadarButton.addEventListener('mouseenter', function () {
        this.style.backgroundColor = '#357abd';
    });

    clearRadarButton.addEventListener('mouseleave', function () {
        this.style.backgroundColor = '#4a90e2';
    });

    clearRadarButton.addEventListener('click', function () {
        // Função para limpar seleção e voltar às estatísticas médias
        if (typeof clearRadarSelection === 'function') {
            clearRadarSelection();
        } else {
            // Fallback caso a função global não esteja disponível
            if (currentLocationId) {
                renderStatRadarChart(currentLocationId);
                this.style.display = 'none';
                this.style.opacity = '0.7';
            }
        }
    });

    radarChart.appendChild(clearRadarButton);
    rightContainer.appendChild(radarChart);

    chartContainer.appendChild(leftScatterContainer);
    chartContainer.appendChild(rightContainer);

    return chartContainer;
}

function createInteractionHints() {
    const hintsContainer = document.createElement("div");
    hintsContainer.classList.add("interaction-hints");
    hintsContainer.style.width = "90%";
    hintsContainer.style.padding = "15px";
    hintsContainer.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
    hintsContainer.style.borderRadius = "10px";
    hintsContainer.style.marginBottom = "20px";
    hintsContainer.style.fontFamily = '"Pixelify Sans", sans-serif';
    hintsContainer.style.fontSize = "0.9em";
    hintsContainer.style.color = "#555";
    hintsContainer.style.textAlign = "center";
    hintsContainer.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";

    const hintsText = document.createElement("div");
    hintsText.innerHTML = `
        <strong>💡 Dicas de Interação:</strong><br>
        • Passe o mouse sobre os <span style="color: #2196F3; font-weight: bold;">pontos</span> para ver detalhes dos pokémons<br>
        • O <span style="color: #FF9800; font-weight: bold;">tamanho</span> dos pontos representa o total de estatísticas<br>
        • A <span style="color: #4CAF50; font-weight: bold;">cor</span> dos pontos representa o tipo primário do pokémon
    `;
    hintsText.style.lineHeight = "1.5";

    hintsContainer.appendChild(hintsText);
    return hintsContainer;
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
        const hintsContainer = createInteractionHints();

        // Adicionar todos os elementos ao contentScreen
        contentScreen.appendChild(locationInfo);
        contentScreen.appendChild(chartContainer);
        contentScreen.appendChild(hintsContainer);

        // Chama os renderizadores passando os ids dos containers correspondentes
        setTimeout(() => {
            renderLocationScatterPlot(id_location, '#location-scatter-container');
            renderStatRadarChart(id_location);
        }, 100); // Pequeno delay para garantir que os containers estejam no DOM

        // Adicionar listener para redimensionamento da janela
        const resizeHandler = () => {
            // Debounce para evitar muitos re-renders
            clearTimeout(window.locationScreenResizeTimeout);
            window.locationScreenResizeTimeout = setTimeout(() => {
                if (document.getElementById('location-scatter-container') &&
                    document.getElementById('radar-chart-location')) {
                    renderLocationScatterPlot(id_location, '#location-scatter-container');
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
