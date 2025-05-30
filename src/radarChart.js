export function RadarChart(id, data, options, names) {
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
        opacityCircles: 0.1,
        strokeWidth: 2,
        roundStrokes: false,
        color: d3.scaleOrdinal(d3.schemeCategory10)
    };

    if ('undefined' !== typeof options) {
        for (var i in options) {
            if ('undefined' !== typeof options[i]) { cfg[i] = options[i]; }
        }
    }

    var maxValue = Math.max(cfg.maxValue, d3.max(data, d => d3.max(d.axes, o => o.value)));

    var allAxis = data[0].axes.map(i => i.axis),
        total = allAxis.length,
        radius = Math.min(cfg.w / 2, cfg.h / 2),
        Format = d3.format('d'),
        angleSlice = Math.PI * 2 / total;

    var rScale = d3.scaleLinear()
        .range([0, radius])
        .domain([0, maxValue]);

    d3.select(id).select("svg").remove();

    var svg = d3.select(id).append("svg")
        .attr("width", cfg.w + cfg.margin.left + cfg.margin.right)
        .attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
        .attr("class", "radar" + id);

    var g = svg.append("g")
        .attr("transform", `translate(${cfg.w / 2 + cfg.margin.left},${cfg.h / 2 + cfg.margin.top})`);

    // Glow filter (sem alterações)
    var filter = g.append('defs').append('filter').attr('id', 'glow'),
        feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur'),
        feMerge = filter.append('feMerge'),
        feMergeNode_1 = feMerge.append('feMergeNode').attr('in', 'coloredBlur'),
        feMergeNode_2 = feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Grid circles
    var axisGrid = g.append("g").attr("class", "axisWrapper");

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

    // Axes
    var axis = axisGrid.selectAll(".axis")
        .data(allAxis)
        .enter()
        .append("g")
        .attr("class", "axis");

    axis.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", (d, i) => rScale(maxValue * 1.1) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr("y2", (d, i) => rScale(maxValue * 1.1) * Math.sin(angleSlice * i - Math.PI / 2))
        .style("stroke", "white")
        .style("stroke-width", "2px");

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

    // Tooltip com retângulo branco atrás
    var tooltip = g.append("g")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var tooltipRect = tooltip.append("rect")
        .attr("x", 0) // vamos ajustar depois
        .attr("y", -25)
        .attr("height", 35)
        .attr("rx", 5)
        .attr("ry", 5)
        .style("fill", "white")
        .style("opacity", 0.8);

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

    // Blobs
    var blobWrapper = g.selectAll(".radarWrapper")
        .data(data.map(d => d.axes))
        .enter().append("g")
        .attr("class", "radarWrapper");

    blobWrapper.append("path")
        .attr("class", "radarArea")
        .attr("d", d => radarLine(d))
        .style("fill", (d, i) => cfg.color(i))
        .style("fill-opacity", cfg.opacityArea)
        .on('mouseover', function(event, d) {
            // Move o tooltip para o fim do grupo pai (g) para ficar no topo da pilha de renderização
            tooltip.node().parentNode.appendChild(tooltip.node());

            d3.selectAll(".radarArea")
                .transition().duration(200)
                .style("fill-opacity", 0.1);
            d3.select(this)
                .transition().duration(200)
                .style("fill-opacity", 0.7);

            tooltip.style("opacity", 1);

            // Define texto
            tooltipText.text(d[0].name);

            // Ajusta largura do retângulo baseado no texto
            const bbox = tooltipText.node().getBBox();
            const padding = 10;
            tooltipRect
                .attr("width", bbox.width + padding * 2)
                .attr("x", - (bbox.width / 2) - padding);

            // Move tooltip para posição do mouse (relativo ao grupo g)
            const [x, y] = d3.pointer(event);
            tooltip.attr('transform', `translate(${x},${y - 40})`);
        })
        .on('mousemove', function(event) {
            // Atualiza posição do tooltip enquanto o mouse se move
            const [x, y] = d3.pointer(event);
            tooltip.attr('transform', `translate(${x},${y - 40})`);
        })
        .on('mouseout', function() {
            d3.selectAll(".radarArea")
                .transition().duration(200)
                .style("fill-opacity", cfg.opacityArea);

            tooltip.style("opacity", 0);
        });


    blobWrapper.append("path")
        .attr("class", "radarStroke")
        .attr("d", d => radarLine(d))
        .style("stroke-width", cfg.strokeWidth + "px")
        .style("stroke", (d, i) => cfg.color(i))
        .style("fill", "none")
        .style("filter", "url(#glow)");

    // Circles
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

    // Invisible circles for tooltip
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
        .on("mouseover", function(event, d) {
            var newX = parseFloat(d3.select(this).attr('cx'));
            var newY = parseFloat(d3.select(this).attr('cy')) - 25;

            tooltip.attr("transform", `translate(${newX},${newY})`);
            tooltipText.text(`${d.name}: ${d.value}`);

            // Pega o bbox do texto e ajusta o retângulo
            const bbox = tooltipText.node().getBBox();
            const padding = 8;
            tooltipRect
                .attr("width", bbox.width + padding * 2)
                .attr("x", - (bbox.width / 2) - padding);

            tooltip.style("opacity", 1);
        })
        .on("mouseout", function() {
            tooltip.style("opacity", 0);
        });

    // Wrap helper function (sem alterações)
    function wrap(text, width) {
        text.each(function() {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.4, // ems
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
