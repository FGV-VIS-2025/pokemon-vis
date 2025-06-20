import { getDefensiveMultipliers, tipoTraduzido } from "./consts.js";

function getDataHeatMap(selectedPokemons) {
    const data = {};
    for (const eachPokemon of selectedPokemons) {
        const tipo1 = eachPokemon.types[0].type_name;
        const tipo2 = eachPokemon.types[1]?.type_name || null;
        const dataDict = getDefensiveMultipliers(tipo1, tipo2);
        data[eachPokemon.name] = {
            multipliers: dataDict,
            pokemon: eachPokemon
        };
    }
    return data;
}

function transformDataForHeatMap(data) {
    const transformed = [];

    for (const [pokemonName, info] of Object.entries(data)) {
        for (const [type, multiplier] of Object.entries(info.multipliers)) {
            transformed.push({
                group: pokemonName,
                variable: type,
                value: multiplier,
                pokemon: info.pokemon
            });
        }
    }

    return transformed;
}

export function createHeatMapDef(selectedPokemons) {
    d3.select(".svg-chart-2").selectAll("*").remove();

    const heatPaiSvgElement = document.getElementsByClassName("svg-pai-chart-2")[0];
    const existingLegendDefense = heatPaiSvgElement.querySelector('.heatmap-legend-defense');
    if (existingLegendDefense) existingLegendDefense.remove();

    const heatSvg = document.getElementsByClassName("svg-chart-2")[0];
    const heatPaiSvg = document.getElementsByClassName("svg-pai-chart-2")[0];

    heatSvg.style.border = "1px solid rgb(255, 255, 255)";
    heatPaiSvg.style.padding = "15px";
    heatPaiSvg.style.marginBottom = "20px";

    const svgWidth = heatSvg.clientWidth * 0.45;
    const svgHeight = svgWidth;

    const rawData = getDataHeatMap(selectedPokemons);
    const data = transformDataForHeatMap(rawData);

    const pokemons = Object.keys(rawData);
    const types = Object.keys(Object.values(rawData)[0].multipliers);

    const margin = { top: svgWidth / 7, right: svgWidth / 45, bottom: svgWidth / 45, left: svgWidth / 14 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    const svg = d3.select(".svg-chart-2")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // adição do título no gráfico
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -svgWidth / 14)  // Acima do gráfico
        .attr("text-anchor", "middle")
        .style("font-size", `${svgWidth / 35}px`)
        .style("font-weight", "bold")
        .style("fill", "#ffffff")
        .text("Comparação da Efetividade das Defesas");

    // Escala X (Pokémons)
    const x = d3.scaleBand()
        .range([0, width])
        .domain(pokemons)
        .padding(0.05);

    // Coloca os nomes dos pokémons NO TOPO
    svg.append("g")
        .call(d3.axisTop(x))
        .selectAll("text")
        .style("text-anchor", "center")
        .style("font-size", `${svgWidth / 40}px`)
        .style("fill", "#ffffff");

    // Escala Y (Tipos)
    const y = d3.scaleBand()
        .range([0, height])
        .domain(types)
        .padding(0.05);

    const tooltipTypes = d3.select(".tooltip-types");

    types.forEach(tipo => {
        svg.append("image")
            .attr("xlink:href", `./assets/icon-types/${tipo}.svg`)
            .attr("x", -width / 20)
            .attr("y", y(tipo) + y.bandwidth() / 2 - width / 50)
            .attr("width", width / 25)
            .attr("height", width / 25)
            .on("mouseover", (event) => {
                tooltipTypes.transition().duration(200).style("opacity", 1);
                tooltipTypes.text(tipoTraduzido[tipo]);
            })
            .on("mousemove", (event) => {
                tooltipTypes
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px");
            })
            .on("mouseout", () => {
                tooltipTypes.transition().duration(200).style("opacity", 0);
            });
    });

    const myColor = d3.scaleLinear()
        .domain([0, 1, 4])
        .range(["#2196f3", "#ffffff", "#f44336"]);

    // --- Tooltip setup ---
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0); // Initially hidden

    // Heatmap cells
    svg.selectAll(".cell") // Use a class for selection
        .data(data, d => d.group + ':' + d.variable + ':' + d.pokemon)
        .enter()
        .append("rect")
        .attr("class", "cell") // Add the class
        .attr("x", d => x(d.group))
        .attr("y", d => y(d.variable))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .style("fill", d => myColor(d.value))
        .style("stroke", "#555")
        .style("cursor", "pointer") // Indicate interactivity

        // Mouse events for tooltip
        .on("mouseover", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .95);
            tooltip.html(`
            <center><img src="assets/pokemons/${d.pokemon.pokemon_id}.png" class="heat-map-img"></img></center><br/>
            <strong>Pokémon:</strong> ${d.group}<br/>
            <strong>Tipo Atacante:</strong> ${tipoTraduzido[d.variable]}<br/>
            <strong>Efetividade:</strong> ${d.value}x
        `)
                .style("left", (event.pageX + 10) + "px") // Position near mouse
                .style("top", (event.pageY - 28) + "px"); // Position near mouse
        })

        .on("mousemove", function (event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })

        .on("mouseleave", function (event, d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Add text on top of each cell
    svg.selectAll(".cell-label")
        .data(data, d => d.group + ':' + d.variable + ':' + d.pokemon)
        .enter()
        .append("text")
        .attr("class", "cell-label")
        .attr("x", d => x(d.group) + x.bandwidth() / 2)
        .attr("y", d => y(d.variable) + y.bandwidth() / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central") // vertical centering
        .style("fill", "#000") // ou ajuste com base no contraste da célula
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("font-family", "Arial, sans-serif")
        .text(d => `${d.value}x`);

    const heatPaiSvgSelection = d3.select(".svg-pai-chart-2");

    const legendContainer = heatPaiSvgSelection
        .append("div")
        .attr("class", "heatmap-legend-defense")
        .style("margin-top", "15px")
        .style("padding", "15px")
        .style("background", "rgba(0, 0, 0, 0.8)")
        .style("border", "1px solid rgb(255, 255, 255)")
        .style("border-radius", "12px")
        .style("color", "#ffffff")
        .style("font-size", "12px")
        .style("text-align", "center")
        .style("width", "100%")
        .style("box-sizing", "border-box");

    legendContainer.append("div")
        .style("font-weight", "bold")
        .style("margin-bottom", "12px")
        .style("text-align", "center")
        .style("font-size", "14px")
        .text("Efetividade das Defesas:");

    const legendItems = legendContainer.append("div")
        .style("display", "flex")
        .style("justify-content", "space-around")
        .style("flex-wrap", "wrap")
        .style("gap", "10px");

    const legendData = [
        { multiplier: "0x", color: "#2196f3", description: "Imune (Não recebe dano)" },
        { multiplier: "0.5x", color: "#87ceeb", description: "Resistente (Dano recebido reduzido)" },
        { multiplier: "1x", color: "#ffffff", description: "Efetividade Normal" },
        { multiplier: "2x", color: "#ffb3ba", description: "Fraco (Dano recebido aumentado)" },
        { multiplier: "4x", color: "#f44336", description: "Muito fraco (Dano recebido muito aumentado)" }
    ];

    legendData.forEach(item => {
        const legendItem = legendItems.append("div")
            .style("display", "flex")
            .style("align-items", "center")
            .style("gap", "5px")
            .style("flex-direction", "column")
            .style("text-align", "center")
            .style("justify-content", "center");

        legendItem.append("div")
            .style("width", "15px")
            .style("height", "15px")
            .style("background-color", item.color)
            .style("border", "1px solid #555")
            .style("border-radius", "3px")
            .style("margin-bottom", "3px");

        legendItem.append("span")
            .style("font-size", "10px")
            .style("line-height", "1.2")
            .style("text-align", "center")
            .style("font-weight", "bold")
            .text(`${item.multiplier}`);

        legendItem.append("span")
            .style("font-size", "9px")
            .style("line-height", "1.1")
            .style("text-align", "center")
            .style("max-width", "120px")
            .style("word-wrap", "break-word")
            .text(item.description);
    });
}