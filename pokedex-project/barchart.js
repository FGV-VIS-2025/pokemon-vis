import { getPokemonsByGeneration, regionToGeneration } from './dataManager.js';

export function drawBarChart(containerSelector, data) {
  const width = 800;
  const height = 400;
  const margin = { top: 60, right: 30, bottom: 100, left: 70 };

  d3.select(containerSelector).selectAll("*").remove();

  const svg = d3.select(containerSelector)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background-color", "white");

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
  d3.csv("../data/encounters.csv", d3.autoType),
  d3.csv("../data/locations.csv", d3.autoType),
  d3.csv("../data/pokemon.csv", d3.autoType)
]).then(([encountersRaw, locations, pokemons]) => {
  // Filtra encounters para manter apenas pares únicos (location_area_id, pokemon_id)
  const seen = new Set();
  const encounters = [];

  for (const row of encountersRaw) {
    // Filtrar apenas pokémons até ID 721 (Kalos)
    if (row.pokemon_id <= 721) {
      const key = `${row.location_area_id}-${row.pokemon_id}`;
      if (!seen.has(key)) {
        seen.add(key);
        encounters.push(row);
      }
    }
  }

  // Armazena os dados filtrados
  encountersData = encounters;
  locationsData = locations;
  pokemonData = pokemons.filter(p => p.id <= 721);
});
export async function renderBarChartByRegion(regionId) {
  try {
    const regionNames = ["Kanto", "Johto", "Hoenn", "Sinnoh", "Unova", "Kalos"];
    const regionName = regionNames[regionId - 1] || "Kanto";

    const pokemonsFromGeneration = await getPokemonsByGeneration(regionName);

    if (!pokemonsFromGeneration || pokemonsFromGeneration.length === 0) {
      console.warn(`Nenhum Pokémon encontrado para a geração da região ${regionName}`);

      const container = d3.select('#bar-chart-container');
      container.selectAll("*").remove();

      container.append("div")
        .style("width", "100%")
        .style("height", "100%")
        .style("display", "flex")
        .style("justify-content", "center")
        .style("align-items", "center")
        .style("color", "white")
        .style("text-align", "center")
        .style("padding", "20px")
        .text(`Não foi possível carregar os dados dos Pokémon da região ${regionName}.`);

      return;
    }

    // Contar Pokémon por tipo
    const typeCountMap = {};

    // Para cada Pokémon, contabilizar seus tipos
    pokemonsFromGeneration.forEach(pokemon => {
      if (pokemon.types && pokemon.types.length) {
        pokemon.types.forEach(typeInfo => {
          const typeName = typeInfo.type_name;
          // Capitalizar o nome do tipo
          const typeNameCapitalized = typeName.charAt(0).toUpperCase() + typeName.slice(1);
          typeCountMap[typeNameCapitalized] = (typeCountMap[typeNameCapitalized] || 0) + 1;
        });
      }
    });

    // Converter para array e ordenar por contagem
    const typeCountArray = Object.entries(typeCountMap).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count);

    // Definir título do gráfico
    const title = `Distribuição de Tipos na Geração ${regionToGeneration[regionName]} (${regionName})`;

    // Desenhar o gráfico com os dados processados
    drawBarChart('#bar-chart-container', typeCountArray);

    // Adicionar título ao gráfico
    d3.select('#bar-chart-container svg')
      .append("text")
      .attr("x", 400)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .style("fill", "black")
      .text(title);

  } catch (error) {
    console.error('Erro ao renderizar gráfico de barras por região:', error);

    // Mostrar mensagem de erro no gráfico
    const container = d3.select('#bar-chart-container');
    container.selectAll("*").remove();

    container.append("div")
      .style("width", "100%")
      .style("height", "100%")
      .style("display", "flex")
      .style("justify-content", "center")
      .style("align-items", "center")
      .style("color", "white")
      .style("text-align", "center")
      .style("padding", "20px")
      .text(`Erro ao carregar dados: ${error.message}`);
  }
}

