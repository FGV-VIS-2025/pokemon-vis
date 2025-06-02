export function drawStatBarChart(containerSelector, data) {
  const width = 800;
  const height = 400;
  const margin = { top: 40, right: 30, bottom: 60, left: 60 };

  d3.select(containerSelector).selectAll("*").remove();

  const svg = d3.select(containerSelector)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background", "white");

  const x = d3.scaleBand()
    .domain(data.map(d => d.stat))
    .range([margin.left, width - margin.right])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.mean)]).nice()
    .range([height - margin.bottom, margin.top]);

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  svg.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.stat))
      .attr("y", d => y(d.mean))
      .attr("width", x.bandwidth())
      .attr("height", d => y(0) - y(d.mean))
      .attr("fill", "teal");

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .attr("font-weight", "bold")
    .text("Média das Estatísticas dos Pokémon");
}

let encountersData, locationsData, pokemonStatsData, statsData;

Promise.all([
  d3.csv("../data/encounters.csv", d3.autoType),
  d3.csv("../data/locations.csv", d3.autoType),
  d3.csv("../data/pokemon_stats.csv", d3.autoType),
  d3.csv("../data/stats.csv", d3.autoType)
]).then(([encounters, locations, pokemonStats, stats]) => {
  // Filtra encounters para manter apenas pares únicos (location_area_id, pokemon_id)
  const seen = new Set();
  encountersData = encounters.filter(d => {
    const key = `${d.location_area_id}-${d.pokemon_id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  locationsData = locations;
  pokemonStatsData = pokemonStats;
  statsData = stats;
});

export function renderStatBarChart(locationId) {
  // Encontra os location_area_ids associados à location_id
  const locationAreas = locationsData.filter(l => l.location_id === locationId).map(l => l.id);

  // Filtra Pokémon encontrados nas location_areas da região
  const pokemonIds = new Set(
    encountersData
      .filter(e => locationAreas.includes(e.location_area_id))
      .map(e => e.pokemon_id)
  );

  // Filtra as 6 stats principais (id 1 a 6)
  const mainStatIds = new Set([1, 2, 3, 4, 5, 6]);

  // Coleta e agrupa stats dos pokémon encontrados
  const statSums = {};
  const statCounts = {};

  for (const entry of pokemonStatsData) {
    if (!pokemonIds.has(entry.pokemon_id)) continue;
    if (!mainStatIds.has(entry.stat_id)) continue;

    const statName = statsData.find(s => s.id === entry.stat_id)?.identifier;
    if (!statName) continue;

    statSums[statName] = (statSums[statName] || 0) + entry.base_stat;
    statCounts[statName] = (statCounts[statName] || 0) + 1;
  }

  // Prepara os dados finais para o gráfico
  const finalData = Object.keys(statSums).map(stat => ({
    stat,
    mean: statSums[stat] / statCounts[stat]
  }));

  drawStatBarChart('#bar-chart-location', finalData);
}
