import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

/**
 * Renderiza um violin plot com jitter dos 6 atributos dos Pokémon fornecidos.
 * @param {string} containerSelector - Seletor do container onde o gráfico será desenhado
 * @param {Array} pokemons - Array de objetos de Pokémon (cada um deve ter os atributos base)
 */
export function drawDistributionPlot(containerSelector, pokemons) {
    const stats = [
        { key: "Hp_Stat", label: "HP" },
        { key: "Attack_Stat", label: "Ataque" },
        { key: "Defense_Stat", label: "Defesa" },
        { key: "Special_Attack_Stat", label: "Sp. Atk" },
        { key: "Special_Defense_Stat", label: "Sp. Def" },
        { key: "Speed_Stat", label: "Velocidade" }
    ];

    const width = 800;
    const height = 400;
    const margin = { top: 40, right: 30, bottom: 60, left: 60 };

    d3.select(containerSelector).selectAll("*").remove();
    const svg = d3.select(containerSelector)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("background", "white");

    // Organizar dados para cada estatística
    const preparedData = stats.map(stat => {
        return {
            stat: stat.label,
            key: stat.key,
            values: pokemons.map(p => +p[stat.key]).filter(v => !isNaN(v))
        };
    });

    // Definir os limites fixos para os atributos dos Pokémon (1-255)
    const minValue = 0;  // Mínimo teórico é 1, mas usamos 0 para melhor visualização
    const maxValue = 255; // Máximo teórico para atributos de Pokémon

    const x = d3.scaleBand()
        .domain(stats.map(s => s.label))
        .range([margin.left, width - margin.right])
        .padding(0.3);

    const y = d3.scaleLinear()
        .domain([minValue, maxValue])
        .nice()
        .range([height - margin.bottom, margin.top]);

    // Eixo X
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));

    // Eixo Y
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

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

    // Cor para os pontos
    const myColor = d3.scaleSequential()
        .interpolator(d3.interpolateViridis)
        .domain([minValue, maxValue]);

    // Desenhar o violin plot
    svg.selectAll("myViolin")
        .data(violinData)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${x(d.stat) + x.bandwidth() / 2},0)`)
        .append("path")
        .datum(d => d.bins)
        .style("stroke", "none")
        .style("fill", "#69b3a2")
        .style("opacity", 0.8)
        .attr("d", d3.area()
            .x0(d => -xNum(d.length))
            .x1(d => xNum(d.length))
            .y(d => y(d.x0))
            .curve(d3.curveCatmullRom)  // Curva suave para aparência de violino
        );

    // Adicionar pontos individuais com jitter
    const jitterWidth = x.bandwidth() * 0.6;

    // Flatten os dados para adicionar todos os pontos
    const allDataPoints = [];
    preparedData.forEach(statData => {
        statData.values.forEach(value => {
            allDataPoints.push({
                stat: statData.stat,
                value: value
            });
        });
    });

    svg.selectAll("indPoints")
        .data(allDataPoints)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.stat) + x.bandwidth() / 2 - (Math.random() - 0.5) * jitterWidth)
        .attr("cy", d => y(d.value))
        .attr("r", 3)
        .style("fill", d => myColor(d.value))
        .style("opacity", 0.7)
        .attr("stroke", "white")
        .attr("stroke-width", 0.5);

    // Adicionar linha da mediana para cada estatística
    violinData.forEach(d => {
        const values = preparedData.find(p => p.stat === d.stat).values;
        const median = d3.median(values);

        svg.append("line")
            .attr("x1", x(d.stat) + x.bandwidth() / 2 - x.bandwidth() / 4)
            .attr("x2", x(d.stat) + x.bandwidth() / 2 + x.bandwidth() / 4)
            .attr("y1", y(median))
            .attr("y2", y(median))
            .attr("stroke", "#d7263d")
            .attr("stroke-width", 2);
    });

    // Adicionar legenda de cores
    const legendWidth = 150;
    const legendHeight = 15;
    const legendX = width - margin.right - legendWidth;
    const legendY = margin.top;

    // Gradiente para a legenda
    const defs = svg.append("defs");
    const linearGradient = defs.append("linearGradient")
        .attr("id", "stat-color-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");

    // Adicionar paradas de cor
    linearGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", myColor(minValue));

    linearGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", myColor(maxValue));

    // Retângulo da legenda com o gradiente
    svg.append("rect")
        .attr("x", legendX)
        .attr("y", legendY)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#stat-color-gradient)");

    // Texto para valores mínimo e máximo
    svg.append("text")
        .attr("x", legendX)
        .attr("y", legendY - 5)
        .style("text-anchor", "start")
        .style("font-size", "10px")
        .text("0");

    svg.append("text")
        .attr("x", legendX + legendWidth)
        .attr("y", legendY - 5)
        .style("text-anchor", "end")
        .style("font-size", "10px")
        .text("255");

    // Título da legenda
    svg.append("text")
        .attr("x", legendX + legendWidth / 2)
        .attr("y", legendY - 5)
        .style("text-anchor", "middle")
        .style("font-size", "10px")
        .text("Valor do Atributo");

    // Legenda para a linha de mediana
    svg.append("line")
        .attr("x1", legendX)
        .attr("x2", legendX + 20)
        .attr("y1", legendY + legendHeight + 15)
        .attr("y2", legendY + legendHeight + 15)
        .attr("stroke", "#d7263d")
        .attr("stroke-width", 2);

    svg.append("text")
        .attr("x", legendX + 25)
        .attr("y", legendY + legendHeight + 18)
        .style("text-anchor", "start")
        .style("font-size", "10px")
        .text("Mediana do atributo");

    // Título
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .text("Distribuição dos Atributos Base dos Pokémon (0-255)");
}
