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
    .text("Média das Estatísticas dos Pokémon da Localização");

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - margin.bottom / 4)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .text("Estatística");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", margin.left / 3)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .text("Média");

}

let encountersData, locationsData, pokemonStatsData, statsData;

Promise.all([
  d3.csv("../data/encounters.csv", d3.autoType),
  d3.csv("../data/locations.csv", d3.autoType),
  d3.csv("../data/pokemon_stats.csv", d3.autoType),
  d3.csv("../data/stats.csv", d3.autoType)
]).then(([encountersRaw, locations, pokemonStats, stats]) => {
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
  pokemonStatsData = pokemonStats;
  statsData = stats;
});

export function renderStatBarChart(locationId) {
  if (!encountersData || !locationsData || !pokemonStatsData || !statsData) {
    console.warn("Dados ainda não carregados.");
    return;
  }

  // Encontra os location_area_ids associados à location_id
  const locationAreas = locationsData
    .filter(l => l.id === locationId)
    .map(l => l.id);

  if (locationAreas.length === 0) {
    console.warn(`Nenhuma location_area encontrada para location_id ${locationId}`);
    return;
  }

  // Filtra Pokémon encontrados nas location_areas da região
  const pokemonIds = new Set(
    encountersData
      .filter(e => locationAreas.includes(e.location_area_id))
      .map(e => e.pokemon_id)
  );

  if (pokemonIds.size === 0) {
    console.warn(`Nenhum Pokémon encontrado para location_id ${locationId}`);
    return;
  }

  const mainStatIds = new Set([1, 2, 3, 4, 5, 6]);

  const statSums = {};
  const statCounts = {};

  for (const entry of pokemonStatsData) {
    if (!pokemonIds.has(entry.pokemon_id)) continue;
    if (!mainStatIds.has(entry.stat_id)) continue;

    const statRow = statsData.find(s => s.id === entry.stat_id);
    if (!statRow || !statRow.identifier) continue;

    const statName = statRow.identifier;

    statSums[statName] = (statSums[statName] || 0) + entry.base_stat;
    statCounts[statName] = (statCounts[statName] || 0) + 1;
  }

  const finalData = Object.keys(statSums).map(stat => ({
    stat,
    mean: statSums[stat] / statCounts[stat]
  }));

  if (finalData.length === 0) {
    console.warn("Nenhuma estatística disponível para os pokémon encontrados.");
    return;
  }

  drawStatBarChart('#bar-chart-location', finalData);
}
