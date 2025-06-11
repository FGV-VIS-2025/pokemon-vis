import { getLocationAreaByLocation } from './dataManager.js';
import { RadarChart } from './radarChart.js';

// Dados globais para o scatter plot
let encountersData, locationsData, pokemonData, pokemonStatsData, statsData;

// Estado global para controlar pokémon selecionado
let selectedPokemonId = null;
let currentLocationId = null;

// Carregar dados necessários para o scatter plot
Promise.all([
    d3.csv("../data/encounters.csv", d3.autoType),
    d3.csv("../data/locations.csv", d3.autoType),
    d3.csv("../data/pokemon.csv", d3.autoType),
    d3.csv("../data/pokemon_stats.csv", d3.autoType),
    d3.csv("../data/stats.csv", d3.autoType)
]).then(([encountersRaw, locations, pokemon, pokemonStats, stats]) => {
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
    pokemonData = pokemon;
    pokemonStatsData = pokemonStats;
    statsData = stats;
});

/**
 * Renderiza um scatter plot com peso x altura dos pokémons da localização
 */
export async function renderLocationScatterPlot(locationId, containerSelector) {
    if (!encountersData || !locationsData || !pokemonData || !pokemonStatsData || !statsData) {
        console.warn("Dados ainda não carregados para o scatter plot.");
        return;
    }

    // Armazenar o ID da localização atual
    currentLocationId = locationId;

    try {
        const locationAreaIds_ = await getLocationAreaByLocation(locationId);
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

        // Cria mapa dos dados dos pokémons
        const pokemonMap = new Map();
        pokemonData.forEach(p => {
            if (pokemonIds.has(p.id)) {
                pokemonMap.set(p.id, {
                    id: p.id,
                    identifier: p.identifier,
                    height: p.height,
                    weight: p.weight
                });
            }
        });

        // Calcula total de status para cada pokémon
        const pokemonStatsMap = new Map();
        pokemonStatsData.forEach(stat => {
            if (pokemonIds.has(stat.pokemon_id)) {
                if (!pokemonStatsMap.has(stat.pokemon_id)) {
                    pokemonStatsMap.set(stat.pokemon_id, 0);
                }
                pokemonStatsMap.set(stat.pokemon_id, pokemonStatsMap.get(stat.pokemon_id) + stat.base_stat);
            }
        });

        // Prepara dados para o scatter plot
        const scatterData = [];
        for (const pokemonId of pokemonIds) {
            const pokemon = pokemonMap.get(pokemonId);
            const totalStats = pokemonStatsMap.get(pokemonId);

            if (pokemon && totalStats && pokemon.height > 0 && pokemon.weight > 0) {
                scatterData.push({
                    id: pokemonId,
                    name: pokemon.identifier,
                    height: pokemon.height / 10, // Converte de decímetros para metros
                    weight: pokemon.weight / 10, // Converte de hectogramas para kg
                    totalStats: totalStats
                });
            }
        }

        if (scatterData.length === 0) {
            console.warn("Nenhum dado válido para o scatter plot");
            return;
        }

        // Renderiza o scatter plot
        drawScatterPlot(containerSelector, scatterData);

    } catch (error) {
        console.error("Erro ao renderizar scatter plot:", error);
    }
}

/**
 * Desenha o scatter plot com melhor visualização para fundo escuro
 */
function drawScatterPlot(containerSelector, data) {
    // Limpa o container
    d3.select(containerSelector).selectAll("*").remove();

    // Dimensões
    const container = d3.select(containerSelector);
    const containerRect = container.node().getBoundingClientRect();
    const margin = { top: 80, right: 100, bottom: 80, left: 80 };
    const width = containerRect.width - margin.left - margin.right;
    const height = containerRect.height - margin.top - margin.bottom;

    // Cria SVG principal
    const svg = container
        .append("svg")
        .attr("width", containerRect.width)
        .attr("height", containerRect.height)
        .style("background", "transparent");

    // Grupo principal
    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Escalas
    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.weight))
        .range([0, width])
        .nice();

    const yScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.height))
        .range([height, 0])
        .nice();

    const radiusScale = d3.scaleSqrt()
        .domain(d3.extent(data, d => d.totalStats))
        .range([6, 24]);

    // Escala de cores vibrantes para fundo escuro
    const colorScale = d3.scaleSequential()
        .domain(d3.extent(data, d => d.totalStats))
        .interpolator(d3.interpolateTurbo);

    // Grid de fundo
    const gridLines = g.append("g").attr("class", "grid-lines");

    // Linhas verticais do grid
    gridLines.selectAll(".grid-line-x")
        .data(xScale.ticks(8))
        .enter()
        .append("line")
        .attr("class", "grid-line-x")
        .attr("x1", d => xScale(d))
        .attr("x2", d => xScale(d))
        .attr("y1", 0)
        .attr("y2", height)
        .style("stroke", "#444")
        .style("stroke-width", 0.5)
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.3);

    // Linhas horizontais do grid
    gridLines.selectAll(".grid-line-y")
        .data(yScale.ticks(8))
        .enter()
        .append("line")
        .attr("class", "grid-line-y")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", d => yScale(d))
        .attr("y2", d => yScale(d))
        .style("stroke", "#444")
        .style("stroke-width", 0.5)
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.3);

    // Eixos com estilo melhorado
    const xAxis = g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(8))
        .style("color", "white");

    xAxis.selectAll("text")
        .style("fill", "white")
        .style("font-family", '"Pixelify Sans", sans-serif')
        .style("font-size", "12px");

    xAxis.selectAll("path, line")
        .style("stroke", "white")
        .style("stroke-width", 2);

    const yAxis = g.append("g")
        .call(d3.axisLeft(yScale).ticks(8))
        .style("color", "white");

    yAxis.selectAll("text")
        .style("fill", "white")
        .style("font-family", '"Pixelify Sans", sans-serif')
        .style("font-size", "12px");

    yAxis.selectAll("path, line")
        .style("stroke", "white")
        .style("stroke-width", 2);

    // Labels dos eixos
    g.append("text")
        .attr("x", width / 2)
        .attr("y", height + 50)
        .attr("fill", "white")
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .style("font-family", '"Pixelify Sans", sans-serif')
        .text("Peso (kg)");

    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("x", -height / 2)
        .attr("fill", "white")
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .style("font-family", '"Pixelify Sans", sans-serif')
        .text("Altura (m)");

    // Tooltip melhorado
    const tooltip = d3.select("body").append("div")
        .attr("class", "scatter-tooltip")
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

    // Pontos do scatter plot
    const dots = g.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScale(d.weight))
        .attr("cy", d => yScale(d.height))
        .attr("r", d => radiusScale(d.totalStats))
        .style("fill", d => colorScale(d.totalStats))
        .style("fill-opacity", 0.8)
        .style("stroke", "white")
        .style("stroke-width", d => selectedPokemonId === d.id ? 4 : 2)
        .style("cursor", "pointer")
        .style("filter", "drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5))")
        .on("mouseover", function (event, d) {
            if (selectedPokemonId !== d.id) {
                d3.select(this)
                    .style("stroke-width", 3)
                    .style("fill-opacity", 1)
                    .style("filter", "drop-shadow(3px 3px 6px rgba(0, 0, 0, 0.7))");
            }

            tooltip.transition()
                .duration(200)
                .style("opacity", 1);

            tooltip.html(`
                <div style="text-align: center;">
                    <strong style="font-size: 15px; color: #ffdd44;">${d.name.charAt(0).toUpperCase() + d.name.slice(1)}</strong><br/>
                    <div style="margin: 8px 0; font-size: 12px;">
                        <div><strong>Peso:</strong> ${d.weight.toFixed(1)} kg</div>
                        <div><strong>Altura:</strong> ${d.height.toFixed(1)} m</div>
                        <div><strong>Total Stats:</strong> ${d.totalStats}</div>
                    </div>
                    <div style="font-size: 11px; color: #ccc; margin-top: 8px;">
                        Clique para ver estatísticas detalhadas
                    </div>
                </div>
            `)
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mousemove", function (event) {
            tooltip
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function (event, d) {
            if (selectedPokemonId !== d.id) {
                d3.select(this)
                    .style("stroke-width", 2)
                    .style("fill-opacity", 0.8)
                    .style("filter", "drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5))");
            }

            tooltip.transition()
                .duration(300)
                .style("opacity", 0);
        })
        .on("click", function (event, d) {
            // Limpar seleção anterior
            dots.style("stroke-width", 2)
                .style("fill-opacity", 0.8);

            // Marcar novo pokémon selecionado
            selectedPokemonId = d.id;
            d3.select(this)
                .style("stroke-width", 4)
                .style("fill-opacity", 1);

            // Renderizar estatísticas do pokémon
            renderPokemonStats(d.id);
        });

    // Botão para limpar seleção (estilo similar ao regionScreen)
    const clearButton = container
        .append("div")
        .style("position", "absolute")
        .style("top", "15px")
        .style("right", "15px")
        .style("cursor", "pointer")
        .style("opacity", selectedPokemonId ? 1 : 0.6)
        .style("z-index", "1000");

    const clearButtonElement = clearButton
        .append("button")
        .style("background-color", "#4a90e2")
        .style("color", "white")
        .style("border", "none")
        .style("padding", "6px 12px")
        .style("border-radius", "6px")
        .style("font-size", "0.8em")
        .style("font-family", '"Pixelify Sans", sans-serif')
        .style("cursor", "pointer")
        .style("transition", "background-color 0.2s ease")
        .text("✕ Limpar Seleção");

    clearButtonElement
        .on("mouseenter", function () {
            d3.select(this).style("background-color", "#357abd");
        })
        .on("mouseleave", function () {
            d3.select(this).style("background-color", "#4a90e2");
        });

    clearButton.on("click", function () {
        selectedPokemonId = null;
        dots.style("stroke-width", 2)
            .style("fill-opacity", 0.8);
        clearPokemonStats();
        clearButton.style("opacity", 0.6);
    });
}

/**
 * Renderiza as estatísticas de um pokémon específico no radar chart
 */
async function renderPokemonStats(pokemonId) {
    if (!pokemonStatsData || !statsData) {
        console.warn("Dados de estatísticas não carregados.");
        return;
    }

    try {
        // Buscar dados do pokémon
        const pokemon = pokemonData.find(p => p.id === pokemonId);
        if (!pokemon) {
            console.warn(`Pokémon com ID ${pokemonId} não encontrado.`);
            return;
        }

        // Mapear IDs de estatísticas para nomes
        const mainStatIds = new Set([1, 2, 3, 4, 5, 6]);
        const statMapping = {
            1: 'Hp_Stat',      // hp
            2: 'Attack_Stat',  // attack  
            3: 'Defense_Stat', // defense
            4: 'Special_Attack_Stat',  // special-attack
            5: 'Special_Defense_Stat', // special-defense
            6: 'Speed_Stat'    // speed
        };

        const statLabels = {
            1: 'HP',
            2: 'Attack',
            3: 'Defense',
            4: 'Sp. Attack',
            5: 'Sp. Defense',
            6: 'Speed'
        };

        // Criar objeto pokémon com estatísticas
        const pokemonWithStats = {
            name: pokemon.identifier.charAt(0).toUpperCase() + pokemon.identifier.slice(1),
            types: [{ type_name: "normal" }] // tipo neutro para cor padrão
        };

        // Buscar estatísticas do pokémon
        const pokemonStats = pokemonStatsData.filter(stat =>
            stat.pokemon_id === pokemonId && mainStatIds.has(stat.stat_id)
        );

        pokemonStats.forEach(stat => {
            const statKey = statMapping[stat.stat_id];
            if (statKey) {
                pokemonWithStats[statKey] = stat.base_stat;
            }
        });

        // Formatar dados para o radar chart
        const axes = Object.entries(statLabels).map(([statId, label]) => {
            const statKey = statMapping[parseInt(statId)];
            return {
                axis: label,
                value: pokemonWithStats[statKey] || 0,
                name: pokemonWithStats.name
            };
        });

        const radarData = [{
            name: pokemonWithStats.name,
            axes: axes,
            total: axes.reduce((sum, stat) => sum + (stat.value || 0), 0),
            color: "#ff6b6b" // Cor vermelha para pokémon selecionado
        }];

        // Configurar e renderizar o radar chart com dimensões FIXAS
        const container = document.getElementById('radar-chart-location');
        if (!container) return;

        // DIMENSÕES FIXAS - não recalcular baseado no container
        const fixedSize = 280; // Tamanho fixo do gráfico
        const fixedMargin = 40; // Margem fixa

        const margin = { top: fixedMargin, right: fixedMargin, bottom: fixedMargin, left: fixedMargin };
        const width = fixedSize;
        const height = fixedSize;

        const color = d3.scaleOrdinal().range([radarData[0].color]);

        const radarChartOptions = {
            w: width,
            h: height,
            margin: margin,
            maxValue: 0,
            levels: 6,
            roundStrokes: true,
            color: color,
            labelFactor: 1.25,
            wrapWidth: 60, // Valor fixo
            dotRadius: 4,  // Valor fixo
            strokeWidth: 2, // Valor fixo
            opacityArea: 0.4,
            tooltipOffset: 20 // Valor fixo
        };

        RadarChart("#radar-chart-location", radarData, radarChartOptions);

        // Atualizar título do container do radar
        const radarTitle = document.querySelector('#location-radar-container h2');
        if (radarTitle) {
            radarTitle.textContent = `Estatísticas de ${pokemonWithStats.name}`;
        }

    } catch (error) {
        console.error("Erro ao renderizar estatísticas do pokémon:", error);
    }
}

/**
 * Limpa as estatísticas do pokémon e volta para as estatísticas médias
 */
async function clearPokemonStats() {
    if (currentLocationId) {
        // Renderizar novamente as estatísticas médias usando a função local com dimensões fixas
        try {
            await renderLocationStatRadarChart(currentLocationId);
        } catch (error) {
            console.error("Erro ao carregar estatísticas médias:", error);
        }

        // Restaurar título original
        const radarTitle = document.querySelector('#location-radar-container h2');
        if (radarTitle) {
            radarTitle.textContent = "Estatísticas Médias dos Pokémons";
        }
    }
}

/**
 * Renderiza um radar chart com as estatísticas médias dos pokémon da localização
 * Versão com dimensões fixas para evitar redimensionamento
 */
async function renderLocationStatRadarChart(locationId) {
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
        types: [{ type_name: "normal" }]
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
        color: "#4A90E2"
    }];

    // Configurar e renderizar o radar chart com dimensões FIXAS
    const container = document.getElementById('radar-chart-location');
    if (!container) return;

    // DIMENSÕES FIXAS - não recalcular baseado no container
    const fixedSize = 280; // Tamanho fixo do gráfico
    const fixedMargin = 40; // Margem fixa

    const margin = { top: fixedMargin, right: fixedMargin, bottom: fixedMargin, left: fixedMargin };
    const width = fixedSize;
    const height = fixedSize;

    const color = d3.scaleOrdinal().range([radarData[0].color]);

    const radarChartOptions = {
        w: width,
        h: height,
        margin: margin,
        maxValue: 0,
        levels: 6,
        roundStrokes: true,
        color: color,
        labelFactor: 1.25,
        wrapWidth: 60, // Valor fixo
        dotRadius: 4,  // Valor fixo
        strokeWidth: 2, // Valor fixo
        opacityArea: 0.4,
        tooltipOffset: 20 // Valor fixo
    };

    RadarChart("#radar-chart-location", radarData, radarChartOptions);
}
