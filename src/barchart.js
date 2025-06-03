export function drawBarChart(containerSelector, data) {
  const width = 800;
  const height = 400;
  const margin = { top: 60, right: 30, bottom: 100, left: 70 };

  // Limpa qualquer gráfico anterior
  d3.select(containerSelector).selectAll("*").remove();

  const svg = d3.select(containerSelector)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background-color", "white"); // Fundo branco

  // Escalas
  const x = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([margin.left, width - margin.right])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.count)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  // Eixo X
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .style("font-size", "12px");

  // Eixo Y
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .selectAll("text")
      .style("font-size", "12px");

  // Rótulo do eixo Y
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", margin.left - 30)
    .attr("dy", "-1em")
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Frequência");

  // Título
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .style("font-weight", "bold")
    .text("5 Pokémons mais comuns e 5 Pokémons mais raros da Região");

  // Barras
  svg.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.name))
      .attr("y", d => y(d.count))
      .attr("width", x.bandwidth())
      .attr("height", d => y(0) - y(d.count))
      .attr("fill", "steelblue");

  // Rótulo do eixo X
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - margin.bottom + 80)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Pokémon");
}


let encountersData, locationsData, pokemonData;

Promise.all([
  d3.csv("./data/encounters.csv", d3.autoType),
  d3.csv("./data/locations.csv", d3.autoType),
  d3.csv("./data/pokemon.csv", d3.autoType)
]).then(([encountersRaw, locations, pokemons]) => {
  // Filtra encounters para manter apenas pares únicos (location_area_id, pokemon_id)
  const seen = new Set();
  const encounters = [];

  for (const row of encountersRaw) {
    const key = `${row.location_area_id}-${row.pokemon_id}`;
    if (!seen.has(key)) {
      seen.add(key);
      encounters.push(row);
    }
  }

  // Armazena os dados filtrados
  encountersData = encounters;
  locationsData = locations;
  pokemonData = pokemons;
});
export function renderBarChartByRegion(regionId) {
  if (!encountersData || !pokemonData || !locationsData) return;

  // Filtragem por região
  const regionLocationIds = new Set(
    locationsData.filter(loc => loc.region_id === regionId).map(loc => loc.id)
  );
  const filteredEncounters = encountersData.filter(e =>
    regionLocationIds.has(e.location_area_id)
  );

  const countMap = {};
  for (const e of filteredEncounters) {
    countMap[e.pokemon_id] = (countMap[e.pokemon_id] || 0) + 1;
  }

  const countArray = Object.entries(countMap).map(([id, count]) => ({
    id: +id,
    count,
    name: pokemonData.find(p => p.id === +id)?.identifier || `#${id}`
  }));

  const sorted = countArray.sort((a, b) => b.count - a.count);
  const top5 = sorted.slice(0, 5);
  const bottom5 = sorted.slice(-5);
  const finalData = [...top5, ...bottom5];

  drawBarChart('#bar-chart-container', finalData);
}

