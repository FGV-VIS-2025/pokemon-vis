import { getLocationAreaByLocation, getLocationsByRegionName } from "./dataManager.js";
import { RadarChart } from "./radarChart.js";
import { renderLocationScatterPlot } from "./scatterPlot.js";

const contentScreen = document.getElementsByClassName("content-screen")[0];

// Dados globais para o gráfico de radar
let encountersData, locationsData, pokemonStatsData, statsData;

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
async function renderStatRadarChart(locationId) {
    if (!encountersData || !locationsData || !pokemonStatsData || !statsData) {
        console.warn("Dados ainda não carregados.");
        return;
    }

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

    // Mapeamento para os nomes usados no radar chart
    const statMapping = {
        'hp': 'Hp_Stat',
        'attack': 'Attack_Stat',
        'defense': 'Defense_Stat',
        'special-attack': 'Special_Attack_Stat',
        'special-defense': 'Special_Defense_Stat',
        'speed': 'Speed_Stat'
    };

    // Criar objeto com formato esperado pelo radar chart
    const pokemonMedio = {
        name: "Estatísticas Médias",
        types: [{ type_name: "normal" }] // tipo neutro para cor padrão
    };

    // Adicionar as estatísticas no formato esperado
    Object.keys(statMapping).forEach(statKey => {
        const radarKey = statMapping[statKey];
        pokemonMedio[radarKey] = avgStats[statKey] || 0;
    });

    // Formatar dados para o radar chart (similar ao buildRadarDataFromPokemons)
    const statLabels = [
        { key: "Hp_Stat", label: "HP" },
        { key: "Attack_Stat", label: "Attack" },
        { key: "Defense_Stat", label: "Defense" },
        { key: "Speed_Stat", label: "Speed" },
        { key: "Special_Defense_Stat", label: "Sp. Defense" },
        { key: "Special_Attack_Stat", label: "Sp. Attack" }
    ];

    const axes = statLabels.map(stat => ({
        axis: stat.label,
        value: pokemonMedio[stat.key] || 0,
        name: pokemonMedio.name
    }));

    const radarData = [{
        name: pokemonMedio.name,
        axes: axes,
        total: axes.reduce((sum, stat) => sum + (stat.value || 0), 0),
        color: "#4A90E2" // Cor azul para estatísticas médias
    }];    // Configurar e renderizar o radar chart
    const container = document.getElementById('radar-chart-location');
    if (!container) return;

    // Dimensionamento dinâmico baseado no container
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Usar 75% do espaço disponível para o gráfico, deixando 25% para os labels
    const availableSize = Math.min(containerWidth, containerHeight);
    const chartSize = availableSize * 0.75;

    // Margens proporcionais para os labels das estatísticas
    const marginSize = availableSize * 0.125; // 12.5% do tamanho disponível para margens
    const margin = { top: marginSize, right: marginSize, bottom: marginSize, left: marginSize };
    const width = chartSize;
    const height = chartSize;

    const color = d3.scaleOrdinal().range([radarData[0].color]);

    const radarChartOptions = {
        w: width,
        h: height,
        margin: margin,
        maxValue: 0,
        levels: 6,
        roundStrokes: true,
        color: color,
        labelFactor: 1.25, // Proporção adequada para labels
        wrapWidth: Math.max(60, containerWidth * 0.15), // Largura responsiva para wrap
        dotRadius: Math.max(3, chartSize * 0.01), // Tamanho dos pontos proporcional
        strokeWidth: Math.max(2, chartSize * 0.005), // Espessura das linhas proporcional
        opacityArea: 0.4,
        tooltipOffset: Math.max(20, chartSize * 0.05) // Offset proporcional
    };

    RadarChart("#radar-chart-location", radarData, radarChartOptions);
}

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
    radarChart.style.height = 'calc(100% - 40px)'; // Altura ajustada
    radarChart.style.display = 'flex';
    radarChart.style.justifyContent = 'center';
    radarChart.style.alignItems = 'center';
    radarChart.style.minHeight = '350px'; // Altura mínima reduzida
    radarChart.style.padding = '20px'; // Padding aumentado para os labels
    radarChart.style.overflow = 'visible'; // Permitir tooltips fora do container
    radarChart.style.boxSizing = 'border-box';
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
        • A <span style="color: #4CAF50; font-weight: bold;">cor</span> também indica o total de estatísticas (escala viridis)
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
