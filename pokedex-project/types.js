import { pokemonTypeColorsRGBA } from './consts.js';
import { getLocationAreaByLocation } from './dataManager.js';

export function renderTypeChord(containerSelector, typesData, pokemonTypesData, width = 960, height = 960) {
  // Limpa SVG anterior, se existir
  d3.select(containerSelector).selectAll("svg").remove();
  d3.select("body").selectAll(".tooltip").remove();

  const svg = d3.select(containerSelector)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("overflow", "visible");

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 120)
    .attr("text-anchor", "middle")
    .style("font-size", "25px")
    .style("fill", "white")
    .text("Número de pokémons por tipo");

  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .attr("id", "tooltip");

  const typeIdToName = {};
  typesData.forEach(d => {
    if (d.id && d.identifier) {
      typeIdToName[d.id] = d.identifier;
    }
  });

  const typeCounts = {};
  pokemonTypesData.forEach(d => {
    if (typeIdToName[d.type_id]) {
      typeCounts[typeIdToName[d.type_id]] = (typeCounts[typeIdToName[d.type_id]] || 0) + 1;
    }
  });

  const filteredTypeNames = Object.keys(typeCounts).sort();
  const typeIndex = {};
  filteredTypeNames.forEach((name, i) => typeIndex[name] = i);

  const matrix = Array.from({ length: filteredTypeNames.length }, () => Array(filteredTypeNames.length).fill(0));
  const pokemonMap = d3.group(pokemonTypesData, d => d.pokemon_id);

  for (const [pokemon_id, entries] of pokemonMap) {
    const names = entries.map(e => typeIdToName[e.type_id]).filter(name => filteredTypeNames.includes(name));
    if (names.length === 1) {
      const idx = typeIndex[names[0]];
      matrix[idx][idx]++;
    } else if (names.length === 2) {
      const [a, b] = names;
      const i = typeIndex[a], j = typeIndex[b];
      matrix[i][j]++;
      matrix[j][i]++;
    }
  }

  const color = typeName => pokemonTypeColorsRGBA[typeName] || 'rgba(200, 200, 200, 0.7)';

  const ribbonRadius = Math.min(width, height) * 0.5 - 200;
  const arcInnerRadius = ribbonRadius + 10;
  const arcOuterRadius = arcInnerRadius + 25;

  const chord = d3.chord().padAngle(0.03).sortSubgroups(d3.descending)(matrix);
  const arc = d3.arc().innerRadius(arcInnerRadius).outerRadius(arcOuterRadius);
  const ribbon = d3.ribbon().radius(ribbonRadius);

const g = svg.append("g")
  .attr("transform", `translate(${width / 2},${height / 2 + 80})`);

  const group = g.append("g")
    .attr("class", "groups")
    .selectAll("g")
    .data(chord.groups)
    .join("g")
    .attr("class", "group");

  group.append("path")
    .attr("fill", d => color(filteredTypeNames[d.index]))
    .attr("d", arc);

  group.append("text")
    .each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
    .attr("dy", ".35em")
    .attr("transform", d => `
      rotate(${(d.angle * 180 / Math.PI - 90)})
      translate(${arcOuterRadius + 10})
      ${d.angle > Math.PI ? "rotate(180)" : ""}
    `)
    .attr("text-anchor", d => d.angle > Math.PI ? "end" : "start")
    .attr("fill", "white")
    .text(d => filteredTypeNames[d.index]);

  const defs = svg.append("defs");
  chord.forEach((d, i) => {
    const gradID = "grad" + i;
    const grad = defs.append("linearGradient")
      .attr("id", gradID)
      .attr("gradientUnits", "userSpaceOnUse");

    const r = ribbonRadius;
    const sourceAngle = (d.source.startAngle + d.source.endAngle) / 2 - Math.PI / 2;
    const targetAngle = (d.target.startAngle + d.target.endAngle) / 2 - Math.PI / 2;

    grad.attr("x1", Math.cos(sourceAngle) * r)
      .attr("y1", Math.sin(sourceAngle) * r)
      .attr("x2", Math.cos(targetAngle) * r)
      .attr("y2", Math.sin(targetAngle) * r);

    grad.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", color(filteredTypeNames[d.source.index]));

    grad.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", color(filteredTypeNames[d.target.index]));
  });

  g.append("g")
    .attr("class", "ribbons")
    .selectAll("path")
    .data(chord)
    .join("path")
    .attr("class", "ribbon")
    .attr("d", ribbon)
    .attr("fill", (d, i) => `url(#grad${i})`)
    .attr("stroke", "none")
    .on("mouseover", function (event, d) {
      d3.selectAll(".ribbon").classed("fade", true);
      d3.select(this).classed("fade", false);

      d3.selectAll(".group path").classed("fade", true);
      group.filter(g => g.index === d.source.index || g.index === d.target.index)
        .select("path").classed("fade", false);

      tooltip
        .style("opacity", 1)
        .html(`
          <strong>${filteredTypeNames[d.source.index]}</strong> + 
          <strong>${filteredTypeNames[d.target.index]}</strong><br>
          ${d.source.value} Pokémon
        `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", () => {
      d3.selectAll(".ribbon").classed("fade", false);
      d3.selectAll(".group path").classed("fade", false);
      tooltip.style("opacity", 0);
    });
    
}

let typesData, pokemonTypesData, encountersData, locationsData;

Promise.all([
  d3.csv("../data/types.csv", d3.autoType),
  d3.csv("../data/pokemon_types.csv", d3.autoType),
  d3.csv("../data/encounters.csv", d3.autoType),
  d3.csv("../data/locations.csv", d3.autoType)
]).then(([types, pokemonTypes, encountersRaw, locations]) => {
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
  typesData = types;
  pokemonTypesData = pokemonTypes;
  encountersData = encounters;
  locationsData = locations;
});

export function updateTypeChordByRegion(regionId) {
  if (!typesData || !pokemonTypesData || !encountersData || !locationsData) return;

  const regionLocations = locationsData.filter(loc => loc.region_id === regionId);
  const locationAreaIds = new Set(regionLocations.map(loc => loc.id));
  const filteredEncounters = encountersData.filter(e => locationAreaIds.has(e.location_area_id));
  const regionPokemonIds = new Set(filteredEncounters.map(e => e.pokemon_id));
  const filteredPokemonTypes = pokemonTypesData.filter(pt => regionPokemonIds.has(pt.pokemon_id));

  renderTypeChord('#region-chart-container', typesData, filteredPokemonTypes);
}

export async function updateTypeChordByLocation(locationId) {
  if (!typesData || !pokemonTypesData || !encountersData || !locationsData) return;

  // 1. Filtra as location areas que pertencem à location selecionada
  const locationAreaIds = new Set(
    locationsData
      .filter(loc => loc.id === locationId)
      .map(loc => loc.id)
  );

  const locationAreaIds_ = await getLocationAreaByLocation(locationId);

  // Extrair os IDs em um `Set` para busca mais eficiente
  const areaIdSet = new Set(locationAreaIds_.map(obj => obj.locationAreaId));

  // Filtrar encounters com esses location_area_id
  const filteredEncounters = encountersData.filter(e =>
    areaIdSet.has(e.location_area_id)
  );

  // 3. Pegar os Pokémon únicos dessa location
  const locationPokemonIds = new Set(filteredEncounters.map(e => e.pokemon_id));

  // 4. Filtrar os tipos dos Pokémon
  const filteredPokemonTypes = pokemonTypesData.filter(pt =>
    locationPokemonIds.has(pt.pokemon_id)
  );

  // 5. Atualizar o gráfico
  renderTypeChord('#location-chart-container', typesData, filteredPokemonTypes);
}