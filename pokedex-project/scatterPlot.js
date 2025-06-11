import { getLocationAreaByLocation } from './dataManager.js';

// Dados globais para o scatter plot
let encountersData, locationsData, pokemonData, pokemonStatsData;

// Carregar dados necessários para o scatter plot
Promise.all([
    d3.csv("../data/encounters.csv", d3.autoType),
    d3.csv("../data/locations.csv", d3.autoType),
    d3.csv("../data/pokemon.csv", d3.autoType),
    d3.csv("../data/pokemon_stats.csv", d3.autoType)
]).then(([encountersRaw, locations, pokemon, pokemonStats]) => {
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
});

/**
 * Renderiza um scatter plot com peso x altura dos pokémons da localização
 */
export async function renderLocationScatterPlot(locationId, containerSelector) {
    if (!encountersData || !locationsData || !pokemonData || !pokemonStatsData) {
        console.warn("Dados ainda não carregados para o scatter plot.");
        return;
    }

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
                    weight: p.weight,
                    base_experience: p.base_experience
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
                    totalStats: totalStats,
                    base_experience: pokemon.base_experience
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
 * Desenha o scatter plot
 */
function drawScatterPlot(containerSelector, data) {
    // Limpa o container
    d3.select(containerSelector).selectAll("*").remove();

    // Dimensões
    const container = d3.select(containerSelector);
    const containerRect = container.node().getBoundingClientRect();
    const margin = { top: 60, right: 80, bottom: 80, left: 80 };
    const width = containerRect.width - margin.left - margin.right;
    const height = containerRect.height - margin.top - margin.bottom;

    // Cria SVG
    const svg = container
        .append("svg")
        .attr("width", containerRect.width)
        .attr("height", containerRect.height);

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
        .range([4, 20]);

    // Escala de cores baseada no total de stats
    const colorScale = d3.scaleSequential(d3.interpolateViridis)
        .domain(d3.extent(data, d => d.totalStats));

    // Adiciona eixos
    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .style("fill", "white");

    g.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("fill", "white")
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Peso (kg)");

    g.append("g")
        .call(d3.axisLeft(yScale))
        .selectAll("text")
        .style("fill", "white");

    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("x", -height / 2)
        .attr("fill", "white")
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Altura (m)");

    // Título
    svg.append("text")
        .attr("x", containerRect.width / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("fill", "white")
        .text("Peso vs Altura dos Pokémons");

    // Tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "scatter-tooltip")
        .style("position", "absolute")
        .style("background", "rgba(0, 0, 0, 0.8)")
        .style("color", "white")
        .style("padding", "10px")
        .style("border-radius", "5px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("z-index", "1000");

    // Adiciona pontos
    g.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScale(d.weight))
        .attr("cy", d => yScale(d.height))
        .attr("r", d => radiusScale(d.totalStats))
        .style("fill", d => colorScale(d.totalStats))
        .style("fill-opacity", 0.7)
        .style("stroke", "white")
        .style("stroke-width", 1)
        .style("cursor", "pointer")
        .on("mouseover", function (event, d) {
            d3.select(this)
                .style("stroke-width", 3)
                .style("fill-opacity", 1);

            tooltip.transition()
                .duration(200)
                .style("opacity", 1);

            tooltip.html(`
                <strong>${d.name.charAt(0).toUpperCase() + d.name.slice(1)}</strong><br/>
                <strong>Peso:</strong> ${d.weight.toFixed(1)} kg<br/>
                <strong>Altura:</strong> ${d.height.toFixed(1)} m<br/>
                <strong>Total Stats:</strong> ${d.totalStats}<br/>
                <strong>Base Experience:</strong> ${d.base_experience || 'N/A'}
            `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mousemove", function (event) {
            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function () {
            d3.select(this)
                .style("stroke-width", 1)
                .style("fill-opacity", 0.7);

            tooltip.transition()
                .duration(300)
                .style("opacity", 0);
        });

    // Legenda para o tamanho dos pontos
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${containerRect.width - 150}, ${margin.top})`);

    legend.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .style("font-size", "12px")
        .style("fill", "white")
        .style("font-weight", "bold")
        .text("Tamanho = Total Stats");

    const legendData = [
        { stats: d3.min(data, d => d.totalStats), label: "Menor" },
        { stats: d3.mean(data, d => d.totalStats), label: "Médio" },
        { stats: d3.max(data, d => d.totalStats), label: "Maior" }
    ];

    const legendItems = legend.selectAll(".legend-item")
        .data(legendData)
        .enter().append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${20 + i * 25})`);

    legendItems.append("circle")
        .attr("cx", 10)
        .attr("cy", 0)
        .attr("r", d => radiusScale(d.stats))
        .style("fill", d => colorScale(d.stats))
        .style("fill-opacity", 0.7)
        .style("stroke", "white")
        .style("stroke-width", 1);

    legendItems.append("text")
        .attr("x", 30)
        .attr("y", 5)
        .style("font-size", "10px")
        .style("fill", "white")
        .text(d => `${d.label} (${Math.round(d.stats)})`);

    // Legenda para cores
    const colorLegend = svg.append("g")
        .attr("class", "color-legend")
        .attr("transform", `translate(${containerRect.width - 150}, ${margin.top + 120})`);

    colorLegend.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .style("font-size", "12px")
        .style("fill", "white")
        .style("font-weight", "bold")
        .text("Cor = Total Stats");

    // Gradiente para a legenda de cores
    const defs = svg.append("defs");
    const linearGradient = defs.append("linearGradient")
        .attr("id", "color-gradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0).attr("y1", 0)
        .attr("x2", 0).attr("y2", 50);

    linearGradient.selectAll("stop")
        .data(colorScale.ticks().map((t, i, n) => ({ offset: `${100 * i / n.length}%`, color: colorScale(t) })))
        .enter().append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

    colorLegend.append("rect")
        .attr("x", 10)
        .attr("y", 10)
        .attr("width", 20)
        .attr("height", 50)
        .style("fill", "url(#color-gradient)");

    colorLegend.append("text")
        .attr("x", 35)
        .attr("y", 20)
        .style("font-size", "10px")
        .style("fill", "white")
        .text(Math.round(d3.max(data, d => d.totalStats)));

    colorLegend.append("text")
        .attr("x", 35)
        .attr("y", 55)
        .style("font-size", "10px")
        .style("fill", "white")
        .text(Math.round(d3.min(data, d => d.totalStats)));
}
