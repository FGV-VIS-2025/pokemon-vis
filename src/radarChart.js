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
        labelFactor: 1.25,
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
        .attr("class", "radar" + className);

    // adição do título no gráfico
    svg.append("text")
        .attr("x", (cfg.w + cfg.margin.left + cfg.margin.right) / 2)
        .attr("y", cfg.margin.top / 3)
        .attr("text-anchor", "middle")
        .style("font-size", "30px")
        .style("font-weight", "bold")
        .style("fill", "#ffffff")
        .text("Pokémon Attribute Comparison");

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
        .style("font-size", "25px")
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
        .style("font-size", "30px")
        .attr("fill", "#ffffff")
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
        .style("opacity", 0.8);

    // Configuração do texto da tooltip
    var tooltipText = tooltip.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("fill", "black");

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
        .on('mouseover', function(event, d) {
            
            // faz o tooltip aparecer na camada superior
            tooltip.node().parentNode.appendChild(tooltip.node());

            d3.selectAll(".radarArea")
                .transition().duration(200)
                .style("fill-opacity", 0.1);
            d3.select(this)
                .transition().duration(200)
                .style("fill-opacity", 0.7);

            tooltip.style("opacity", 1);

            // define o título da tooltip simples (só o nome do pokémon)
            tooltipText.text(d[0].name);

            // ajusta a largura do tooltip com base no tanto de texto
            const bbox = tooltipText.node().getBBox();
            const padding = 10;
            tooltipRect
                .attr("width", bbox.width + padding * 2)
                .attr("x", - (bbox.width / 2) - padding);

            
            // move o tooltip para onde o mouse está passando
            const [x, y] = d3.pointer(event);
            tooltip.attr('transform', `translate(${x},${y - 40})`);
        })

        .on('mousemove', function(event) {
            // atualiza a posição do tooltip
            const [x, y] = d3.pointer(event);
            tooltip.attr('transform', `translate(${x},${y - 40})`);
        })

        .on('mouseout', function() {
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
    blobWrapper.each(function(dataSeries, seriesIndex) {
        d3.select(this).selectAll(".radarCircle")
            .data(dataSeries)
            .enter().append("circle")
            .attr("class", "radarCircle")
            .attr("r", cfg.dotRadius)
            .attr("cx", (d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr("cy", (d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2))
            .style("fill", cfg.color(seriesIndex))
            .style("fill-opacity", 0.8);
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
        .on("mouseover", function(event, d) {
            var newX = parseFloat(d3.select(this).attr('cx'));
            var newY = parseFloat(d3.select(this).attr('cy')) - 25;

            tooltip.attr("transform", `translate(${newX},${newY})`);
            tooltipText.text(`${d.name}: ${d.value}`);

            // ajuste da largura da tooltip com base na largura do texto
            const bbox = tooltipText.node().getBBox();
            const padding = 8;
            tooltipRect
                .attr("width", bbox.width + padding * 2)
                .attr("x", - (bbox.width / 2) - padding);

            tooltip.style("opacity", 1);
        })
        // esconde o tooltip ao tirar o mouse
        .on("mouseout", function() {
            tooltip.style("opacity", 0);
        });

    // Função auxiliar que quebra automaticamente a linha do texto do svg para não ultrapassar a largura do gráfico
    function wrap(text, width) {
        text.each(function() {
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
