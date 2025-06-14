import { pokemonTypeColorsRadar } from "./consts.js";

/**
 * Função modular para renderizar radar chart
 * @param {string} containerSelector - Seletor do container (ex: "#radar-chart-location")
 * @param {string} title - Título a ser exibido
 * @param {Array} stats - Array com estatísticas no formato [{label, value}, ...]
 * @param {string} color - Cor do gráfico (hex)
 * @param {Object} options - Opções adicionais (opcional)
 */
export function renderRadarChart(containerSelector, title, stats, color = "#4A90E2", options = {}) {
    // Configurações padrão
    const defaultOptions = {
        width: 350,
        height: 350,
        margin: { top: 40, right: 40, bottom: 40, left: 40 },
        levels: 6,
        maxValue: 0,
        labelFactor: 1.2,
        wrapWidth: 60,
        opacityArea: 0.35,
        dotRadius: 4,
        strokeWidth: 2,
        roundStrokes: true
    };

    // Mesclar opções
    const cfg = { ...defaultOptions, ...options };

    // Ajustar dimensões se o container for específico
    const container = document.querySelector(containerSelector);
    if (container && containerSelector.includes('location')) {
        // Usar dimensões fixas para evitar crescimento progressivo do gráfico
        const fixedChartSize = 320; // Tamanho fixo para consistência

        cfg.width = fixedChartSize;
        cfg.height = fixedChartSize;
        cfg.margin = {
            top: 60,     // Margem fixa para dar espaço aos labels
            right: 60,
            bottom: 60,
            left: 60
        };
        cfg.labelFactor = 1.2; // Mantido em 1.2 conforme solicitado
        cfg.wrapWidth = 65; // Área de wrap fixa para os labels
        cfg.dotRadius = 4;
        cfg.strokeWidth = 2;
    }

    // Formatar dados para o radar chart
    const axes = stats.map(stat => ({
        axis: stat.label,
        value: stat.value || 0,
        name: title
    }));

    const radarData = [{
        name: title,
        axes: axes,
        total: axes.reduce((sum, stat) => sum + (stat.value || 0), 0),
        color: color
    }];

    // Configurações do radar chart
    const radarChartOptions = {
        w: cfg.width,
        h: cfg.height,
        margin: cfg.margin,
        maxValue: cfg.maxValue,
        levels: cfg.levels,
        roundStrokes: cfg.roundStrokes,
        color: d3.scaleOrdinal().range([color]),
        labelFactor: cfg.labelFactor,
        wrapWidth: cfg.wrapWidth,
        dotRadius: cfg.dotRadius,
        strokeWidth: cfg.strokeWidth,
        opacityArea: cfg.opacityArea,
        tooltipOffset: Math.max(15, cfg.width * 0.05)
    };

    // Renderizar o radar chart
    RadarChart(containerSelector, radarData, radarChartOptions);
}

/**
 * Função que tem como objetivo formatar os dados para um formato amigável para a construção do gráfico de radar.
 * 
 * @param {*} selectedPokemons - Array com todos os pokémons selecionados e que vão compor o gráfico de radar. 
 * @returns 
 */
function buildRadarDataFromPokemons(selectedPokemons) {
    const statLabels = [
        { key: "Hp_Stat", label: "HP" },
        { key: "Attack_Stat", label: "Attack" },
        { key: "Defense_Stat", label: "Defense" },
        { key: "Speed_Stat", label: "Speed" },
        { key: "Special_Defense_Stat", label: "Sp. Defense" },
        { key: "Special_Attack_Stat", label: "Sp. Attack" }
    ];

    const tiposVistos = {};
    const formattedData = selectedPokemons.map(pokemon => {
        const name = pokemon.Name || pokemon.name || "Unknown";
        const axes = statLabels.map(stat => ({
            axis: stat.label,
            value: pokemon[stat.key],
            name: name
        }));
        const total = axes.reduce((sum, stat) => sum + (stat.value || 0), 0);

        const tipo = pokemon.types[0].type_name;
        if (!tiposVistos[tipo]) tiposVistos[tipo] = 0;
        tiposVistos[tipo]++;
        const cor = pokemonTypeColorsRadar[tipo]?.[String(tiposVistos[tipo])] ?? "#000000";

        return { name, axes, total, color: cor };
    });

    formattedData.sort((a, b) => b.total - a.total);
    return formattedData;
}

/**
 * Função responsável por configurar as variáveis necessárias e chamar a função que de fato cria o gráfico de radar.
 */
export function createRadarChart(selectedPokemons) {
    const radarSvg = document.getElementsByClassName("svg-chart-1")[0];
    const radarPaiSvg = document.getElementsByClassName("svg-pai-chart-1")[0];

    radarSvg.style.border = "1px solid rgb(255, 255, 255)";
    radarSvg.style.width = "50%";
    radarSvg.style.display = "flex";
    radarSvg.style.justifyContent = "center";
    radarPaiSvg.style.alignItems = "center";
    radarPaiSvg.style.padding = "15px";
    radarPaiSvg.style.marginBottom = "20px";

    const svgWidth = radarSvg.clientWidth * 0.45 * 2;
    const margin = { top: svgWidth / 5, right: svgWidth / 5, bottom: svgWidth / 5, left: svgWidth / 5 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgWidth - margin.top - margin.bottom;

    const data = buildRadarDataFromPokemons(selectedPokemons);

    const color = d3.scaleOrdinal().range(data.map(p => p.color));

    const radarChartOptions = {
        w: width,
        h: height,
        margin: margin,
        maxValue: 0.5,
        levels: 8,
        roundStrokes: true,
        color: color
    };

    RadarChart(".svg-chart-1", data, radarChartOptions);
}

/**
 * Essa função é responsável por construir o gráfico de radar da página de comparação dos pokémons.
 * 
 * @param {*} className - O nome da classe do svg em que vai ser construído o gráfico
 * @param {*} data - A estrutura de dados que vai contruir o gráfico
 * @param {*} options - Uma série de configurações do gráfico de radar
 */
export function RadarChart(className, data, options) {

    // Configurações globais padrão
    var cfg = {
        w: 600,
        h: 600,
        margin: { top: 20, right: 20, bottom: 20, left: 20 },
        levels: 3,
        maxValue: 0,
        labelFactor: 1.22, // Aumentado para afastar mais os labels
        wrapWidth: 60,
        opacityArea: 0.35,
        dotRadius: 4,
        opacityCircles: 0.025,
        strokeWidth: 2,
        roundStrokes: false,
        color: d3.scaleOrdinal(d3.schemeCategory10)
    };

    // Caso não forem passadas opções, ele usa as globais
    if ('undefined' !== typeof options) {
        for (var i in options) {
            if ('undefined' !== typeof options[i]) { cfg[i] = options[i]; }
        }
    }

    // Valor do círculo mais externo
    var maxValue = Math.max(cfg.maxValue, d3.max(data, d => d3.max(d.axes, o => o.value)));

    // Atribuição dos dados aos eixos
    var allAxis = data[0].axes.map(i => i.axis),
        total = allAxis.length,
        radius = Math.min(cfg.w / 2, cfg.h / 2),
        Format = d3.format('d'),
        angleSlice = Math.PI * 2 / total;

    // Definição da escala do gráfico
    var rScale = d3.scaleLinear()
        .range([0, radius])
        .domain([0, maxValue]);

    // Definição do tamanho e do posicionamento do gráfico
    d3.select(className).select("svg").remove();

    var svg = d3.select(className).append("svg")
        .attr("width", cfg.w + cfg.margin.left + cfg.margin.right)
        .attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
        .attr("class", "radar" + className)
        .style("max-width", "100%")
        .style("max-height", "100%")
        .style("overflow", "visible");

    // adição do título no gráfico
    var g = svg.append("g")
        .attr("transform", `translate(${cfg.w / 2 + cfg.margin.left},${cfg.h / 2 + cfg.margin.top})`);

    // Glow filter (sem alterações)
    var filter = g.append('defs').append('filter').attr('id', 'glow'),
        feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur'),
        feMerge = filter.append('feMerge'),
        feMergeNode_1 = feMerge.append('feMergeNode').attr('in', 'coloredBlur'),
        feMergeNode_2 = feMerge.append('feMergeNode').attr('in', 'SourceGraphic');


    // Construção dos circulos
    var axisGrid = g.append("g").attr("class", "axisWrapper");

    // Configuração dos círculos para cada nível 
    axisGrid.selectAll(".levels")
        .data(d3.range(1, (cfg.levels + 1)).reverse())
        .enter()
        .append("circle")
        .attr("class", "gridCircle")
        .attr("r", d => radius / cfg.levels * d)
        .style("fill", "#CDCDCD")
        .style("stroke", "#CDCDCD")
        .style("fill-opacity", cfg.opacityCircles)
        .style("filter", "url(#glow)");

    // Configuração dos labels de cada nível
    axisGrid.selectAll(".axisLabel")
        .data(d3.range(1, (cfg.levels + 1)).reverse())
        .enter().append("text")
        .attr("class", "axisLabel")
        .attr("x", 4)
        .attr("y", d => -d * radius / cfg.levels)
        .attr("dy", "0.4em")
        .style("font-size", `${(cfg.w + cfg.margin.left + cfg.margin.right) / 50}px`)
        .style("font-weight", "bold")
        .attr("fill", "#ffffff")
        .text(d => Format(maxValue * d / cfg.levels));

    // Configuração dos eixos
    var axis = axisGrid.selectAll(".axis")
        .data(allAxis)
        .enter()
        .append("g")
        .attr("class", "axis");

    // Configuração das linhas dos eixos
    axis.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", (d, i) => rScale(maxValue * 1.1) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr("y2", (d, i) => rScale(maxValue * 1.1) * Math.sin(angleSlice * i - Math.PI / 2))
        .style("stroke", "white")
        .style("stroke-width", "2px");

    // Configuração dos títulos dos eixos
    axis.append("text")
        .attr("class", "legend")
        .style("font-size", `${(cfg.w + cfg.margin.left + cfg.margin.right) / 42}px`)
        .attr("fill", "#ffffff")
        .style("stroke", "#000000")
        .style("stroke-width", "4px")
        .style("stroke-linejoin", "round")
        .style("stroke-linecap", "round")
        .style("paint-order", "stroke fill")
        .style("font-weight", "bold")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("x", (d, i) => rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr("y", (d, i) => rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice * i - Math.PI / 2))
        .text(d => d)
        .call(wrap, cfg.wrapWidth);

    // Configuração do tooltip que mostra os dados ao realizar o "hover"
    var tooltip = g.append("g")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Configuração do retângulo da tooltip
    var tooltipRect = tooltip.append("rect")
        .attr("x", 0)
        .attr("y", -25)
        .attr("height", 35)
        .attr("rx", 5)
        .attr("ry", 5)
        .style("fill", "white")
        .style("opacity", 0.95)
        .style("stroke", "#333")
        .style("stroke-width", "1px")
        .style("filter", "drop-shadow(2px 2px 4px rgba(0,0,0,0.3))");

    // Configuração do texto da tooltip
    var tooltipText = tooltip.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", "14px")
        .style("font-weight", "600")
        .style("fill", "#333")
        .style("font-family", "Arial, sans-serif");

    // Radar line
    var radarLine = d3.lineRadial()
        .curve(cfg.roundStrokes ? d3.curveCardinalClosed : d3.curveLinearClosed)
        .radius(d => rScale(d.value))
        .angle((d, i) => i * angleSlice);

    // Seleção/Construção dos elementos do gráfico
    var blobWrapper = g.selectAll(".radarWrapper")
        .data(data.map(d => d.axes))
        .enter().append("g")
        .attr("class", "radarWrapper");

    // Confgurações das áreas do gráfico
    blobWrapper.append("path")
        .attr("class", "radarArea")
        .attr("d", d => radarLine(d))
        .style("fill", (d, i) => cfg.color(i))
        .style("fill-opacity", cfg.opacityArea)
        .on('mouseover', function (event, d) {

            // faz o tooltip aparecer na camada superior
            tooltip.node().parentNode.appendChild(tooltip.node());

            d3.selectAll(".radarArea")
                .transition().duration(200)
                .style("fill-opacity", 0.1);
            d3.select(this)
                .transition().duration(200)
                .style("fill-opacity", 0.7);

            tooltip.style("opacity", 1);

            // Melhorar o título da tooltip com informação mais detalhada
            const pokemonName = d[0].name;
            const totalStats = d.reduce((sum, stat) => sum + (stat.value || 0), 0);
            tooltipText.text(`${pokemonName} (Total: ${totalStats})`);

            // ajusta a largura do tooltip com base no tanto de texto
            const bbox = tooltipText.node().getBBox();
            const padding = 12;
            tooltipRect
                .attr("width", bbox.width + padding * 2)
                .attr("x", - (bbox.width / 2) - padding)
                .attr("height", bbox.height + padding)
                .attr("y", - (bbox.height / 2) - padding / 2);


            // move o tooltip para onde o mouse está passando, com ajuste de posição
            const [x, y] = d3.pointer(event);
            let tooltipX = x;
            let tooltipY = y - 45;

            // Ajustar posição para evitar cortes
            const tooltipOffset = cfg.tooltipOffset || 40;
            if (x > cfg.w * 0.8) tooltipX = x - bbox.width / 2 - padding;
            if (x < cfg.w * 0.2) tooltipX = x + bbox.width / 2 + padding;
            if (y < cfg.h * 0.2) tooltipY = y + tooltipOffset;

            tooltip.attr('transform', `translate(${tooltipX},${tooltipY})`);
        })

        .on('mousemove', function (event, d) {
            // atualiza a posição do tooltip com posicionamento inteligente
            const [x, y] = d3.pointer(event);
            const bbox = tooltipText.node().getBBox();
            const padding = 12;

            let tooltipX = x;
            let tooltipY = y - 45;

            // Ajustar posição para evitar cortes
            const tooltipOffset = cfg.tooltipOffset || 40;
            if (x > cfg.w * 0.8) tooltipX = x - bbox.width / 2 - padding;
            if (x < cfg.w * 0.2) tooltipX = x + bbox.width / 2 + padding;
            if (y < cfg.h * 0.2) tooltipY = y + tooltipOffset;

            tooltip.attr('transform', `translate(${tooltipX},${tooltipY})`);
        })

        .on('mouseout', function () {
            // ajusta a opacidade da área do gráfico para o padrão e esconde o tooltip
            d3.selectAll(".radarArea")
                .transition().duration(200)
                .style("fill-opacity", cfg.opacityArea);

            tooltip.style("opacity", 0);
        });


    // Configuração das linhas que envolvem a área do gráfico
    blobWrapper.append("path")
        .attr("class", "radarStroke")
        .attr("d", d => radarLine(d))
        .style("stroke-width", cfg.strokeWidth + "px")
        .style("stroke", (d, i) => cfg.color(i))
        .style("fill", "none")
        .style("filter", "url(#glow)");

    // Configuração dos cículos do gráfico 
    blobWrapper.each(function (dataSeries, seriesIndex) {
        d3.select(this).selectAll(".radarCircle")
            .data(dataSeries)
            .enter().append("circle")
            .attr("class", "radarCircle")
            .attr("r", cfg.dotRadius * 1.5)
            .attr("cx", (d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr("cy", (d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2))
            .style("fill", cfg.color(seriesIndex))
            .style("fill-opacity", 1)
            .style("stroke", "white");
    });

    // Configuração do tooltip para os círculos
    var blobCircleWrapper = g.selectAll(".radarCircleWrapper")
        .data(data.map(d => d.axes))
        .enter().append("g")
        .attr("class", "radarCircleWrapper");

    blobCircleWrapper.selectAll(".radarInvisibleCircle")
        .data(d => d)
        .enter().append("circle")
        .attr("class", "radarInvisibleCircle")
        .attr("r", cfg.dotRadius * 1.5)
        .attr("cx", (d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr("cy", (d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2))
        .style("fill", "none")
        .style("pointer-events", "all")

        // ao passar o mouse sobre um dos círculos, vai exibir o nome do pokemón e seu valor 
        .on("mouseover", function (event, d) {
            var newX = parseFloat(d3.select(this).attr('cx'));
            var newY = parseFloat(d3.select(this).attr('cy'));

            // Ajustar posição do tooltip para evitar cortes nas bordas
            const tooltipOffset = cfg.tooltipOffset || 35;
            const svgBounds = g.node().getBoundingClientRect();
            const containerBounds = document.querySelector(className).getBoundingClientRect();

            // Calcular posição do tooltip com base na posição do ponto e limites do container
            let tooltipX = newX;
            let tooltipY = newY - tooltipOffset;

            // Verificar se o tooltip sairia das bordas e ajustar
            if (newX > cfg.w * 0.7) tooltipX = newX - 80; // Se muito à direita, mover para esquerda
            if (newX < cfg.w * 0.3) tooltipX = newX + 80; // Se muito à esquerda, mover para direita
            if (newY < cfg.h * 0.3) tooltipY = newY + tooltipOffset; // Se muito acima, mostrar abaixo

            tooltip.attr("transform", `translate(${tooltipX},${tooltipY})`);

            // Melhorar o texto do tooltip para incluir o nome da estatística
            tooltipText.text(`${d.axis}: ${d.value}`);

            // ajuste da largura da tooltip com base na largura do texto
            const bbox = tooltipText.node().getBBox();
            const padding = 10;
            tooltipRect
                .attr("width", bbox.width + padding * 2)
                .attr("x", - (bbox.width / 2) - padding)
                .attr("height", bbox.height + padding)
                .attr("y", - (bbox.height / 2) - padding / 2);

            tooltip.style("opacity", 1);
        })
        // esconde o tooltip ao tirar o mouse
        .on("mouseout", function () {
            tooltip.style("opacity", 0);
        });

    // Função auxiliar que quebra automaticamente a linha do texto do svg para não ultrapassar a largura do gráfico
    function wrap(text, width) {
        text.each(function () {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.4,
                y = text.attr("y"),
                x = text.attr("x"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });
    }
}
