import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { pokemonTypeColors } from "./consts.js";

let originalPokemonData = [];
let currentContainerSelector = '';

export function drawDistributionPlot(containerSelector, pokemons) {
    originalPokemonData = [...pokemons];
    currentContainerSelector = containerSelector;

    const stats = [
        { key: "Hp_Stat", label: "HP" },
        { key: "Attack_Stat", label: "Ataque" },
        { key: "Defense_Stat", label: "Defesa" },
        { key: "Special_Attack_Stat", label: "Ataque Esp." },
        { key: "Special_Defense_Stat", label: "Defesa Esp." },
        { key: "Speed_Stat", label: "Velocidade" }
    ];

    function getPokemonTypeColor(pokemon) {
        const primaryType = pokemon.types?.[0]?.type_name?.toLowerCase();
        if (primaryType && pokemonTypeColors[primaryType]) {
            return pokemonTypeColors[primaryType].primary;
        }
        return "#999999";
    }

    d3.select(containerSelector).selectAll("*").remove();

    d3.selectAll(".pokemon-tooltip").remove();

    const container = d3.select(containerSelector);
    const containerRect = container.node().getBoundingClientRect();
    const margin = { top: 40, right: 80, bottom: 80, left: 80 };
    const width = containerRect.width - margin.left - margin.right;
    const height = containerRect.height - margin.top - margin.bottom;

    const svg = container
        .append("svg")
        .attr("width", containerRect.width)
        .attr("height", containerRect.height)
        .style("background", "transparent");

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const preparedData = stats.map(stat => {
        return {
            stat: stat.label,
            key: stat.key,
            values: pokemons.map(p => +p[stat.key]).filter(v => !isNaN(v)),
            pokemons: pokemons
        };
    });

    const minValue = 0;
    const maxValue = 255;

    const x = d3.scaleBand()
        .domain(stats.map(s => s.label))
        .range([0, width])
        .padding(0.3);

    const y = d3.scaleLinear()
        .domain([minValue, maxValue])
        .nice()
        .range([height, 0]);

    const gridLines = g.append("g").attr("class", "grid-lines");

    gridLines.selectAll(".grid-line-x")
        .data(x.domain())
        .enter()
        .append("line")
        .attr("class", "grid-line-x")
        .attr("x1", d => x(d) + x.bandwidth() / 2)
        .attr("x2", d => x(d) + x.bandwidth() / 2)
        .attr("y1", 0)
        .attr("y2", height)
        .style("stroke", "#444")
        .style("stroke-width", 0.5)
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.3);

    // Linhas horizontais do grid
    gridLines.selectAll(".grid-line-y")
        .data(y.ticks(8))
        .enter()
        .append("line")
        .attr("class", "grid-line-y")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", d => y(d))
        .attr("y2", d => y(d))
        .style("stroke", "#444")
        .style("stroke-width", 0.5)
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.3);

    // Eixos com estilo melhorado para fundo escuro
    const xAxis = g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .style("color", "white");

    xAxis.selectAll("text")
        .style("fill", "white")
        .style("font-size", "12px");

    xAxis.selectAll("path, line")
        .style("stroke", "white")
        .style("stroke-width", 2);

    // Eixo Y
    const yAxis = g.append("g")
        .call(d3.axisLeft(y))
        .style("color", "white");

    yAxis.selectAll("text")
        .style("fill", "white")
        .style("font-size", "12px");

    yAxis.selectAll("path, line")
        .style("stroke", "white")
        .style("stroke-width", 2);

    // Configuração do histograma para violin plot
    const histogram = d3.bin()
        .domain(y.domain())
        .thresholds(y.ticks(20))
        .value(d => d);

    // Processar dados para o violin plot
    const violinData = preparedData.map(d => {
        const bins = histogram(d.values);
        return { stat: d.stat, bins: bins };
    });

    // Encontrar o maior número de valores em um bin para dimensionar corretamente
    let maxNum = 0;
    for (let item of violinData) {
        const lengths = item.bins.map(bin => bin.length);
        const longestBin = d3.max(lengths);
        if (longestBin > maxNum) maxNum = longestBin;
    }

    // Escala para a largura dos violins
    const xNum = d3.scaleLinear()
        .range([0, x.bandwidth() / 2])
        .domain([0, maxNum]);

    // Paleta de cores melhorada para fundo escuro
    const violinColor = "#00d4ff"; // Cor ciano consistente com o tema
    // Removida a escala de cor pointColor pois agora usamos cores dos tipos

    // Desenhar o violin plot com estilo melhorado
    g.selectAll("myViolin")
        .data(violinData)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${x(d.stat) + x.bandwidth() / 2},0)`)
        .append("path")
        .datum(d => d.bins)
        .style("stroke", "white")
        .style("stroke-width", 1)
        .style("fill", violinColor)
        .style("fill-opacity", 0.1)
        .style("filter", "drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.3))")
        .attr("d", d3.area()
            .x0(d => -xNum(d.length))
            .x1(d => xNum(d.length))
            .y(d => y(d.x0))
            .curve(d3.curveCatmullRom)
        );

    const jitterWidth = x.bandwidth() * 0.6;

    const allDataPoints = [];
    preparedData.forEach(statData => {
        statData.pokemons.forEach(pokemon => {
            const value = +pokemon[statData.key];
            if (!isNaN(value)) {
                allDataPoints.push({
                    stat: statData.stat,
                    value: value,
                    pokemon: pokemon,
                    color: getPokemonTypeColor(pokemon)
                });
            }
        });
    });

    violinData.forEach(d => {
        const values = preparedData.find(p => p.stat === d.stat).values;
        const mean = d3.mean(values);

        g.append("line")
            .attr("x1", x(d.stat) + x.bandwidth() / 2 - x.bandwidth() / 4)
            .attr("x2", x(d.stat) + x.bandwidth() / 2 + x.bandwidth() / 4)
            .attr("y1", y(mean))
            .attr("y2", y(mean))
            .attr("stroke", "#ffdd44")
            .attr("stroke-width", 4)
            .style("filter", "drop-shadow(0.5px 0.5px 1px rgba(0, 0, 0, 0.4))")
            .style("opacity", 0.25);
    });

    // Criar tooltip para mostrar sprite e nome do pokémon
    const tooltip = d3.select("body").append("div")
        .attr("class", "pokemon-tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background", "rgba(0, 0, 0, 0.9)")
        .style("color", "white")
        .style("padding", "10px")
        .style("border-radius", "8px")
        .style("border", "2px solid #00d4ff")
        .style("font-family", "Arial, sans-serif")
        .style("font-size", "14px")
        .style("text-align", "center")
        .style("pointer-events", "none")
        .style("z-index", "1000")
        .style("box-shadow", "0 4px 8px rgba(0, 0, 0, 0.3)");

    // Segundo: Adicionar pontos individuais com jitter e cores por tipo
    g.selectAll("indPoints")
        .data(allDataPoints)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.stat) + x.bandwidth() / 2 - (Math.random() - 0.5) * jitterWidth)
        .attr("cy", d => y(d.value))
        .attr("r", 4)
        .style("fill", d => d.color)
        .style("fill-opacity", 0.9)
        .style("stroke", "white")
        .style("stroke-width", 1.2)
        .style("filter", "drop-shadow(0.5px 0.5px 1px rgba(0, 0, 0, 0.3))")
        .style("cursor", "pointer")
        .on("mouseover", function (event, d) {
            // Destacar o ponto
            d3.select(this)
                .transition()
                .duration(200)
                .attr("r", 6)
                .style("stroke-width", 2);

            // Mostrar tooltip
            tooltip.transition()
                .duration(200)
                .style("opacity", 1);

            tooltip.html(`
                <img src="./assets/pokemons/${d.pokemon.pokemon_id}.png" 
                     alt="${d.pokemon.name}" 
                     style="width: 64px; height: 64px; image-rendering: pixelated;" 
                     onerror="this.style.display='none'">
                <br>
                <strong>${d.pokemon.name}</strong>
                <br>
                ${d.stat}: ${d.value}
            `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 70) + "px");
        })
        .on("mouseout", function (event, d) {
            // Voltar ao estado normal
            d3.select(this)
                .transition()
                .duration(200)
                .attr("r", 4)
                .style("stroke-width", 1.2);

            // Esconder tooltip
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Labels dos eixos com estilo consistente
    g.append("text")
        .attr("x", width / 2)
        .attr("y", height + 50)
        .attr("fill", "white")
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("text-shadow", "2px 2px 4px rgba(0, 0, 0, 0.7)")
        .text("Atributos");

    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("x", -height / 2)
        .attr("fill", "white")
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("text-shadow", "2px 2px 4px rgba(0, 0, 0, 0.7)")
        .text("Valor do Atributo");
}

/**
 * Atualiza o distributplot com dados filtrados
 * @param {Array} filteredPokemons - Array de Pokémon filtrados
 */
export function updateDistributionPlot(filteredPokemons) {
    if (!currentContainerSelector) {
        return;
    }

    const pokemonsToUse = filteredPokemons && filteredPokemons.length > 0
        ? filteredPokemons
        : originalPokemonData;

    drawDistributionPlot(currentContainerSelector, pokemonsToUse);
}

export function clearDistributionPlotFilter() {
    if (!currentContainerSelector || !originalPokemonData.length) {
        return;
    }

    drawDistributionPlot(currentContainerSelector, originalPokemonData);
}
