import { pokemonTypeColorsRGBA } from './consts.js';
import { getLocationAreaByLocation, getPokemonsByGeneration } from './dataManager.js';

export function renderTypeChord(containerSelector, typesData, pokemonTypesData, width = 960, height = 960, pokemonsFromGeneration = [], onFilter = null) {
  d3.select(containerSelector).selectAll("svg").remove();
  d3.select("body").selectAll(".tooltip").remove();

  const svg = d3.select(containerSelector)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("overflow", "visible");

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

  const margin = Math.min(width, height) * 0.10;
  const ribbonRadius = Math.min(width, height) * 0.462;
  const arcInnerRadius = ribbonRadius + 6;
  const arcOuterRadius = arcInnerRadius + 16;

  const chord = d3.chord().padAngle(0.03).sortSubgroups(d3.descending)(matrix);
  const arc = d3.arc().innerRadius(arcInnerRadius).outerRadius(arcOuterRadius);
  const ribbon = d3.ribbon().radius(ribbonRadius);

  const g = svg.append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  const group = g.append("g")
    .attr("class", "groups")
    .selectAll("g")
    .data(chord.groups)
    .join("g")
    .attr("class", "group");

  group.append("path")
    .attr("fill", d => color(filteredTypeNames[d.index]))
    .attr("d", arc)
    .style("cursor", "pointer")
    .attr("data-type", d => filteredTypeNames[d.index])
    .on("mouseover", function (event, d) {
      d3.select(this).classed("fade", false).classed("active", true);
      d3.selectAll(".group path").filter(function () { return this !== event.currentTarget; }).classed("fade", true);
      tooltip
        .style("opacity", 1)
        .html(`<strong>${filteredTypeNames[d.index].charAt(0).toUpperCase() + filteredTypeNames[d.index].slice(1)}</strong><br>${typeCounts[filteredTypeNames[d.index]]} Pokémon`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function () {
      d3.selectAll(".group path").classed("fade", false).classed("active", false);
      tooltip.style("opacity", 0);
      // Se houver filtro, reativa destaque do filtro
      if (currentFilter && currentFilter.length === 2) {
        d3.selectAll(".group path").filter(function () {
          return currentFilter.includes(d3.select(this).attr("data-type"));
        }).classed("active", true);
      } else if (currentFilter && currentFilter.length === 1) {
        d3.selectAll(".group path").filter(function () {
          return d3.select(this).attr("data-type") === currentFilter[0];
        }).classed("active", true);
      }
    })
    .on("click", (event, d) => {
      const typeName = filteredTypeNames[d.index];
      filterSpritesByTypes(typeName);
      d3.selectAll(".group path").classed("active", false);
      if (currentFilter && currentFilter.length === 2) {
        d3.selectAll(".group path").filter(function () {
          return currentFilter.includes(d3.select(this).attr("data-type"));
        }).classed("active", true);
      } else {
        d3.select(event.currentTarget).classed("active", true);
      }
    });

  // Adiciona o texto com os nomes dos tipos na parte exterior do círculo
  group.append("text")
    .each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
    .attr("dy", ".35em")
    .attr("transform", d => `
      rotate(${(d.angle * 180 / Math.PI - 90)})
      translate(${arcOuterRadius + Math.min(width, height) * 0.02})
      ${d.angle > Math.PI ? "rotate(180)" : ""}
    `)
    .attr("text-anchor", d => d.angle > Math.PI ? "end" : "start")
    .attr("fill", "white")
    .text(d => filteredTypeNames[d.index].charAt(0).toUpperCase() + filteredTypeNames[d.index].slice(1))
    .style("font-size", `${Math.min(width, height) * 0.025}px`) // Tamanho um pouco menor
    .style("font-weight", "bold");

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
    .style("cursor", "pointer")
    .on("mouseover", function (event, d) {
      d3.selectAll(".ribbon").classed("fade", true);
      d3.select(this).classed("fade", false);
      d3.selectAll(".group path").classed("fade", true);
      group.filter(g => g.index === d.source.index || g.index === d.target.index)
        .select("path").classed("fade", false);
      tooltip
        .style("opacity", 1)
        .html(`
          <strong>${filteredTypeNames[d.source.index].charAt(0).toUpperCase() + filteredTypeNames[d.source.index].slice(1)}</strong> + 
          <strong>${filteredTypeNames[d.target.index].charAt(0).toUpperCase() + filteredTypeNames[d.target.index].slice(1)}</strong><br>
          ${d.source.value} Pokémon
        `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", () => {
      d3.selectAll(".ribbon").classed("fade", false);
      d3.selectAll(".group path").classed("fade", false).classed("active", false);
      tooltip.style("opacity", 0);
      if (currentFilter && currentFilter.length === 2) {
        d3.selectAll(".group path").filter(function () {
          return currentFilter.includes(d3.select(this).attr("data-type"));
        }).classed("active", true);
      } else if (currentFilter && currentFilter.length === 1) {
        d3.selectAll(".group path").filter(function () {
          return d3.select(this).attr("data-type") === currentFilter[0];
        }).classed("active", true);
      }
    })
    .on("click", (event, d) => {
      const typeA = filteredTypeNames[d.source.index];
      const typeB = filteredTypeNames[d.target.index];
      filterSpritesByTypes(typeA, typeB);
      d3.selectAll(".group path").classed("active", false);
      d3.selectAll(".group path").filter(function () {
        return currentFilter && currentFilter.length === 2 && currentFilter.includes(d3.select(this).attr("data-type"));
      }).classed("active", true);
    });

  let currentFilter = null;

  function filterSpritesByTypes(typeA, typeB = null) {
    if (!Array.isArray(pokemonsFromGeneration) || pokemonsFromGeneration.length === 0) return;
    let filtered = [];
    if (typeB) {
      filtered = pokemonsFromGeneration.filter(p => {
        if (!p.types) return false;
        const tnames = p.types.map(t => t.type_name);
        return tnames.includes(typeA) && tnames.includes(typeB);
      });
    } else {
      filtered = pokemonsFromGeneration.filter(p => {
        if (!p.types) return false;
        return p.types.some(t => t.type_name === typeA);
      });
    }
    if (onFilter) onFilter(filtered, typeA, typeB);
    currentFilter = typeB ? [typeA, typeB] : [typeA];
    showClearFilterButton();
  }

  function clearSpritesFilter() {
    if (onFilter) onFilter(pokemonsFromGeneration, null, null);
    currentFilter = null;
    hideClearFilterButton();
    d3.selectAll(".group path").classed("active", false);
  }

  // Usar o botão de filtro existente do regionScreen
  function showClearFilterButton() {
    // Dispara evento para mostrar o botão do regionScreen
    if (window.showClearFilterButton) {
      window.showClearFilterButton();
    }
  }

  function hideClearFilterButton() {
    // Dispara evento para esconder o botão do regionScreen
    if (window.hideClearFilterButton) {
      window.hideClearFilterButton();
    }
  }

  // CSS para destaque
  const style = document.createElement('style');
  style.innerHTML = `
    .group path.active {
      stroke: #fff;
      stroke-width: 4px;
      filter: drop-shadow(0 0 8px #fff8);
      opacity: 1 !important;
    }
    .group path.fade {
      opacity: 0.3;
    }
  `;
  document.head.appendChild(style);

  // Expor função global para integração externa (opcional)
  window.clearSpritesFilter = clearSpritesFilter;
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
  typesData = types;
  pokemonTypesData = pokemonTypes;
  encountersData = encounters;
  locationsData = locations;
});

export async function updateTypeChordByRegion(regionId) {
  if (!typesData || !pokemonTypesData) return;
  try {
    // Converter ID de região para nome
    const regionNames = ["Kanto", "Johto", "Hoenn", "Sinnoh", "Unova", "Kalos"];
    const regionName = regionNames[regionId - 1] || "Kanto"; // Assumindo que os IDs começam em 1

    // Obter todos os Pokémon da geração correspondente à região
    const pokemonsFromGeneration = await getPokemonsByGeneration(regionName);

    // Se não houver Pokémon, exibir mensagem no gráfico
    if (!pokemonsFromGeneration || pokemonsFromGeneration.length === 0) {
      console.warn(`Nenhum Pokémon encontrado para a geração da região ${regionName}`);

      // Limpar o container e mostrar mensagem de erro
      const container = d3.select('#chord-graph-container');
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

    // Obter IDs únicos dos Pokémon da geração
    const regionPokemonIds = new Set(pokemonsFromGeneration.map(p => p.pokemon_id));
    const filteredPokemonTypes = pokemonTypesData.filter(pt => regionPokemonIds.has(pt.pokemon_id));

    // Calcular o tamanho do container dinamicamente
    const container = document.getElementById('chord-graph-container');
    let width = 320; // Tamanho padrão reduzido
    let height = 320;

    if (container) {
      const containerRect = container.getBoundingClientRect();
      const containerWidth = containerRect.width || container.offsetWidth;
      const containerHeight = containerRect.height || container.offsetHeight;

      // Usar o menor entre largura e altura para manter o diagrama quadrado
      // e deixar uma margem maior de 60px de cada lado para garantir que labels não saiam
      const availableSize = Math.min(containerWidth - 120, containerHeight - 120);
      width = height = Math.max(250, availableSize); // Tamanho mínimo reduzido para 250px
    }

    // Renderizar o diagrama de acordes com os dados filtrados e tamanho dinâmico
    renderTypeChord('#chord-graph-container', typesData, filteredPokemonTypes, width, height, pokemonsFromGeneration, (filtered, typeA, typeB) => {
      // Atualiza os sprites ao lado
      if (typeof window.updateRegionSpritesGrid === 'function') {
        window.updateRegionSpritesGrid(filtered, typeA, typeB);
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar diagrama de acordes por região:', error);

    // Mostrar mensagem de erro no gráfico
    const container = d3.select('#chord-graph-container');
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