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

    // Limpar o container
    d3.select(containerSelector).selectAll("*").remove();

    // Obter dimensões do container
    const container = d3.select(containerSelector);
    const containerRect = container.node().getBoundingClientRect();
    const margin = { top: 40, right: 80, bottom: 80, left: 80 }; // Reduzida margem superior de 80 para 40
    const width = containerRect.width - margin.left - margin.right;
    const height = containerRect.height - margin.top - margin.bottom;

    // Criar SVG com fundo transparente para integração
    const svg = container
        .append("svg")
        .attr("width", containerRect.width)
        .attr("height", containerRect.height)
        .style("background", "transparent");

    // Grupo principal
    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

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
        .range([0, width])
        .padding(0.3);

    const y = d3.scaleLinear()
        .domain([minValue, maxValue])
        .nice()
        .range([height, 0]);

    // Grid de fundo no estilo da página
    const gridLines = g.append("g").attr("class", "grid-lines");

    // Linhas verticais do grid
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
        .style("font-family", '"Pixelify Sans", sans-serif')
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
        .style("font-family", '"Pixelify Sans", sans-serif')
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
    const pointColor = d3.scaleSequential()
        .interpolator(d3.interpolatePlasma)
        .domain([minValue, maxValue]);

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
        .style("fill-opacity", 0.6)
        .style("filter", "drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5))")
        .attr("d", d3.area()
            .x0(d => -xNum(d.length))
            .x1(d => xNum(d.length))
            .y(d => y(d.x0))
            .curve(d3.curveCatmullRom)  // Curva suave para aparência de violino
        );

    // Adicionar pontos individuais com jitter e estilo melhorado
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

    g.selectAll("indPoints")
        .data(allDataPoints)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.stat) + x.bandwidth() / 2 - (Math.random() - 0.5) * jitterWidth)
        .attr("cy", d => y(d.value))
        .attr("r", 2.5)
        .style("fill", d => pointColor(d.value))
        .style("fill-opacity", 0.8)
        .style("stroke", "white")
        .style("stroke-width", 0.5)
        .style("filter", "drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.5))");

    // Adicionar linha da mediana para cada estatística com estilo melhorado
    violinData.forEach(d => {
        const values = preparedData.find(p => p.stat === d.stat).values;
        const median = d3.median(values);

        g.append("line")
            .attr("x1", x(d.stat) + x.bandwidth() / 2 - x.bandwidth() / 4)
            .attr("x2", x(d.stat) + x.bandwidth() / 2 + x.bandwidth() / 4)
            .attr("y1", y(median))
            .attr("y2", y(median))
            .attr("stroke", "#ffdd44")
            .attr("stroke-width", 3)
            .style("filter", "drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.7))");
    });

    // Labels dos eixos com estilo consistente
    g.append("text")
        .attr("x", width / 2)
        .attr("y", height + 50)
        .attr("fill", "white")
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("font-family", '"Pixelify Sans", sans-serif')
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
        .style("font-family", '"Pixelify Sans", sans-serif')
        .style("text-shadow", "2px 2px 4px rgba(0, 0, 0, 0.7)")
        .text("Valor do Atributo");
}
