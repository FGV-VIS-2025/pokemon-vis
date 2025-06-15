import { genderRateMap, generationMap, growthRateMap, habitatMap, pokemonTypeColors, pokemonTypeColorsRGBA } from "./consts.js";
import { getAllPokemons } from "./dataManager.js";
import { createHeatMapAta } from "./heatMapAta.js";
import { createHeatMapDef } from "./heatMapDef.js";
import { createKnnDiagram } from "./knnDiagram.js";
import { createRadarChart } from "./radarChart.js";


const contentScreen = document.getElementsByClassName("content-screen")[0];
let selectedPokemons = [];

let speciesDataPromise;
async function getSpeciesData() {
    if (!speciesDataPromise) {
        speciesDataPromise = d3.csv('../data/pokemon_species.csv', d => ({
            pokemon_id: +d.id,
            generation_id: +d.generation_id,
            habitat_id: +d.habitat_id,
            gender_rate: +d.gender_rate,
            capture_rate: +d.capture_rate,
            base_happiness: +d.base_happiness,
            hatch_counter: +d.hatch_counter,
            growth_rate_id: +d.growth_rate_id,
            is_baby: +d.is_baby,
            is_legendary: +d.is_legendary,
            is_mythical: +d.is_mythical
        }));
    }
    return speciesDataPromise;
}

window.addEventListener("resize", editPokemonsCard);

export async function createPokemonScreen() {
    const todosPokemons = await getAllPokemons();

    contentScreen.innerHTML = "";
    contentScreen.style.gap = "0";
    contentScreen.style.justifyContent = '';

    const pokemonSearch = document.createElement("div");
    pokemonSearch.classList.add("pokemons-search");

    const pokemonSearchBox = document.createElement("input");
    pokemonSearchBox.placeholder = "Search for your favorite Pokémon...";
    pokemonSearchBox.classList.add("pokemons-search-box");

    const pokemonSearchBoxImage = document.createElement("img");
    pokemonSearchBoxImage.src = "../assets/search.png";
    pokemonSearchBoxImage.classList.add("pokemons-search-img");

    const suggestionsList = document.createElement("ul");
    suggestionsList.classList.add("suggestions");
    suggestionsList.style.display = "none";

    function filterSuggestions() {
        const query = pokemonSearchBox.value.toLowerCase();
        suggestionsList.innerHTML = "";

        let filtered;
        if (query.length === 0) {
            filtered = todosPokemons.slice(0, 50);
        } else {
            filtered = todosPokemons.filter(p =>
                p.name.toLowerCase().includes(query)
            );
        }

        if (filtered.length === 0) {
            const li = document.createElement("li");
            li.textContent = "Pokémon Not Found";
            suggestionsList.appendChild(li);
            li.onclick = () => {
                suggestionsList.style.display = "none";
                pokemonSearch.style.borderBottomLeftRadius = "12px"
                pokemonSearch.style.borderBottomRightRadius = "12px"
                pokemonSearchBox.value = "";
            };
            return;
        }

        const fragment = document.createDocumentFragment();

        filtered.forEach(pokemon => {
            const li = document.createElement("li");
            li.classList.add("li");
            li.style.display = "flex";
            li.style.alignItems = "center";
            li.style.justifyContent = "space-between";

            const leftContainer = document.createElement("div");
            leftContainer.style.display = "flex";
            leftContainer.style.alignItems = "center";
            leftContainer.style.gap = "8px";

            const pokemonImg = document.createElement("img");
            pokemonImg.src = `../assets/pokemons/${pokemon.pokemon_id}.png`;
            pokemonImg.classList.add("search-gif");
            pokemonImg.style.imageRendering = 'pixelated';
            pokemonImg.onerror = function () {
                this.src = '../assets/ball.png';
                this.style.opacity = '0.5';
            };
            leftContainer.appendChild(pokemonImg);

            // Nome do pokémon
            const nameSpan = document.createElement("span");
            nameSpan.textContent = pokemon.name;
            leftContainer.appendChild(nameSpan);

            li.appendChild(leftContainer);

            // Container dos tipos à direita
            const typesContainer = document.createElement("div");
            typesContainer.style.display = "flex";
            typesContainer.style.gap = "2px";
            typesContainer.style.alignItems = "center";

            // Primeiro tipo
            const typeImg1 = document.createElement("img");
            typeImg1.src = `../assets/types/${pokemon.types[0].type_name}.png`;
            typeImg1.classList.add("search-type-img");
            typesContainer.appendChild(typeImg1);

            // Segundo tipo se existir
            if (pokemon.types[1]) {
                const typeImg2 = document.createElement("img");
                typeImg2.src = `../assets/types/${pokemon.types[1].type_name}.png`;
                typeImg2.classList.add("search-type-img");
                typesContainer.appendChild(typeImg2);
            }

            li.appendChild(typesContainer);

            li.style.backgroundColor = pokemonTypeColorsRGBA[pokemon.types[0].type_name];

            li.onclick = () => {
                pokemonSearchBox.value = pokemon.name;

                pokemonSearchBox.value = "";
                suggestionsList.style.display = "none";

                pokemonSearch.style.borderBottomLeftRadius = "12px"
                pokemonSearch.style.borderBottomRightRadius = "12px"

                if (selectedPokemons.length < 4 && !selectedPokemons.some(p => p.name === pokemon.name)) {
                    selectedPokemons.push(pokemon);
                    editPokemonsCard();
                }
            };

            fragment.appendChild(li);
        });

        suggestionsList.appendChild(fragment);

        // Mostrar indicador se há mais pokémons quando query está vazia
        if (query.length === 0 && todosPokemons.length > 50) {
            const moreIndicator = document.createElement("li");
            moreIndicator.textContent = `... e mais ${todosPokemons.length - 50} pokémons (digite para buscar)`;
            moreIndicator.style.fontStyle = "italic";
            moreIndicator.style.color = "#666";
            moreIndicator.style.textAlign = "center";
            moreIndicator.style.padding = "10px";
            suggestionsList.appendChild(moreIndicator);
        }
    }

    function showSuggestions() {
        pokemonSearch.style.borderBottomLeftRadius = "0px"
        pokemonSearch.style.borderBottomRightRadius = "0px"
        suggestionsList.style.display = "block";
        filterSuggestions();
    }

    function hideSuggestions() {
        pokemonSearch.style.borderBottomLeftRadius = "12px"
        pokemonSearch.style.borderBottomRightRadius = "12px"
        setTimeout(() => {
            suggestionsList.style.display = "none";
        }, 50);
    }

    // Associa eventos aos elementos
    pokemonSearchBox.oninput = filterSuggestions;
    pokemonSearchBox.onclick = showSuggestions;

    // Esconder sugestões ao clicar fora
    document.addEventListener("click", (e) => {
        const emptyCards = document.getElementsByClassName("pokemon-card-select");

        // Verifica se o clique foi dentro de alguma carta vazia
        const clickInsideEmptyCard = Array.from(emptyCards).some(card =>
            card.contains(e.target)
        );

        // Verifica se foi dentro da barra de busca
        const clickInsideSearch = pokemonSearch.contains(e.target);

        if (!clickInsideSearch && !clickInsideEmptyCard) {
            hideSuggestions();
        }
    });

    // Monta a estrutura
    pokemonSearch.appendChild(pokemonSearchBox);
    pokemonSearch.appendChild(pokemonSearchBoxImage);
    pokemonSearch.appendChild(suggestionsList);

    // área de seleção dos pokémons
    const pokemonsSelect = document.createElement("div");
    pokemonsSelect.classList.add("pokemons-select-2");

    // área com as descrições dos pokémons
    const pokemonsDescriptionArea = document.createElement("div");
    pokemonsDescriptionArea.classList.add("pokemons-description-area");

    // área externa para o primeiro gráfico
    const svgPai1 = document.createElement("div");
    svgPai1.classList.add("svg-pai-chart-1");

    // área para o primeiro gráfico (radar)
    const svg1 = document.createElement("svg");
    svg1.classList.add("svg-chart-1");
    svg1.appendChild(document.createElement("rect")).classList.add("svg-chart-1-rect-1");
    svgPai1.appendChild(svg1);

    const knn = document.createElement("div");
    knn.classList.add("knn");
    svgPai1.appendChild(knn);

    // área externa para o primeiro gráfico
    const svgPai2 = document.createElement("svg");
    svgPai2.classList.add("svg-pai-chart-2");

    // área para o primeiro gráfico (radar)
    const svg2 = document.createElement("svg");
    svg2.classList.add("svg-chart-2");
    svg2.appendChild(document.createElement("rect")).classList.add("svg-chart-2-rect-1");
    svgPai2.appendChild(svg2);

    contentScreen.appendChild(pokemonSearch);
    contentScreen.appendChild(pokemonsSelect);
    contentScreen.appendChild(pokemonsDescriptionArea);
    contentScreen.appendChild(svgPai1);
    contentScreen.appendChild(svgPai2);
}

/**
 * Função que atualiza a pokemon-screen caso seja selecionado/desselecionado algum pokémon.
 */
export async function editPokemonsCard() {
    // seleciona a região dos cards inferiores
    const pokemonsCardSelect = document.getElementsByClassName("pokemons-select-2")[0];
    pokemonsCardSelect.innerHTML = "";

    // seleciona a região das descrições 
    const pokemonsDescription = document.getElementsByClassName("pokemons-description-area")[0];
    pokemonsDescription.innerHTML = "";

    // itera para construção das 4 colunas
    for (let i = 1; i <= 4; i++) {

        pokemonsDescription.style.marginBottom = "20px";

        // para cada pokémon selecionado, cria os cards e descrição personalizados
        if (i <= selectedPokemons.length) {
            const selectedPokemon = selectedPokemons[i - 1];
            pokemonsCardSelect.appendChild(createSelectedPokemonCard(selectedPokemon));
            // Agora aguardamos o carregamento de dados adicionais
            const desc = await createSelectedPokemonDescription(selectedPokemon);
            pokemonsDescription.appendChild(desc);
        }
        // para os restantes, cria as versões vazias
        else {
            pokemonsCardSelect.appendChild(createEmptyPokemonCard());
            pokemonsDescription.appendChild(createEmptyDescription());
        }
    }

    // caso ao menos algum pokémon tenha sido selecionado, cria o gráfico de radar
    if (selectedPokemons.length > 0) {
        createRadarChart(selectedPokemons);
        createHeatMapDef(selectedPokemons);
        createHeatMapAta(selectedPokemons);
        createKnnDiagram(selectedPokemons);
    } else {
        const radarSvg = document.getElementsByClassName("svg-chart-1")[0];
        radarSvg.innerHTML = "";
        radarSvg.style.border = 0;
        radarSvg.style.display = "none";
        radarSvg.style.width = "0px";
        const radarPaiSvg = document.getElementsByClassName("svg-pai-chart-1")[0];
        radarPaiSvg.style.padding = 0;
        radarPaiSvg.style.marginBottom = 0;
        const heatSvg = document.getElementsByClassName("svg-chart-2")[0];
        heatSvg.innerHTML = "";
        heatSvg.style.border = 0;
        const heatPaiSvg = document.getElementsByClassName("svg-pai-chart-2")[0];
        heatPaiSvg.style.padding = 0;
        heatPaiSvg.style.marginBottom = 0;
        pokemonsDescription.style.marginBottom = 0;
        const knn = document.getElementsByClassName("knn")[0];
        knn.innerHTML = "";
        knn.style.display = "none";
        knn.style.border = 0;
        knn.style.width = "0px";
    }
}

/**
 * Constroi a div da descrição vazia, garantindo que ela vai ser invisível. 
 * 
 * @returns Retorna a div da descrição vazia.
 */
function createEmptyDescription() {
    const desc = document.createElement("div");
    desc.classList.add("pokemon-description");
    desc.innerHTML = ``;
    desc.style.opacity = 0;
    return desc;
}

/**
 * Função que cria a descrição de um pokémon específico.
 * 
 * @param {*} selectedPokemon - Dados do pokémon que vão ser usados para construção da descrição dele
 * @returns Retorna a div da descrição personalizada. 
 */
async function createSelectedPokemonDescription(selectedPokemon) {
    const desc = document.createElement("div");
    desc.classList.add("pokemon-description");

    // Carregar dados de espécies da vez
    const speciesList = await getSpeciesData();
    const species = speciesList.find(s => s.pokemon_id === selectedPokemon.pokemon_id) || {};

    const heightM = selectedPokemon.height / 10;
    const weightKg = selectedPokemon.weight / 10;
    const genderRate = genderRateMap[species.gender_rate] || "-";
    const hatchCount = species.hatch_counter ?? 0;
    const generation = generationMap[species.generation_id] || '-';
    const habitat = habitatMap[species.habitat_id] || '-';
    const captureRate = species.capture_rate ?? '-';
    const growthRateName = growthRateMap[species.growth_rate_id]?.name || '-';
    const baseHappiness = species.base_happiness ?? '-';
    const isBaby = species.is_baby === 1 ? "Sim" : "Não";
    const isLegendary = species.is_legendary === 1 ? "Sim" : "Não";
    const isMythical = species.is_mythical === 1 ? "Sim" : "Não";

    desc.innerHTML = `
                    <div class="types-container">
                        <img class="type-img" src="../assets/description-types/${selectedPokemon.types[0].type_name}.png" />
                        ${selectedPokemon.types[1] ? `<img class="type-img" src="../assets/description-types/${selectedPokemon.types[1].type_name}.png" />` : ''}
                    </div>
                    <div class="info-rows">
                        <div class="info-blocks">
                            <img src="../assets/block-info/governante.png" />
                            ${heightM} m
                        </div>
                        <div class="info-blocks">
                            <img src="../assets/block-info/regua.png" />
                            ${weightKg} kg
                        </div>
                    </div>
                    <div class="info-rows">
                        <div class="info-blocks">
                            <img src="../assets/block-info/genders.png" />
                            ${genderRate}
                        </div>
                        <div class="info-blocks">
                            <img src="../assets/block-info/relogio.png" />
                            ${hatchCount} ciclos
                        </div>
                    </div>
                    <div class="info-rows-2">
                        <div class="info-table">
                            <div class="info-row">
                                <div class="info-label"><strong>Nome:</strong></div>
                                <div class="info-value">${selectedPokemon.name}</div>
                            </div>
                            <div class="info-row">
                                <div class="info-label"><strong>Genus:</strong></div>
                                <div class="info-value">${selectedPokemon.genus.split(" Pokémon")[0]}</div>
                            </div>
                            <div class="info-row">
                                <div class="info-label"><strong>Geração:</strong></div>
                                <div class="info-value">${generation}</div>
                            </div>
                            <div class="info-row">
                                <div class="info-label"><strong>Taxa de Captura:</strong></div>
                                <div class="info-value">${captureRate}</div>
                            </div>
                            <div class="info-row">
                                <div class="info-label"><strong>Lendário:</strong></div>
                                <div class="info-value">${isLegendary}</div>
                            </div>
                        </div>
                    </div>`;

    return desc;
}

/**
 * Cria cartas vazias com o botão plus para seleção de pokémon.
 * @returns {HTMLElement} Elemento da carta vazia
 */
function createEmptyPokemonCard() {
    const card = document.createElement("div");
    card.classList.add("pokemon-card-select");

    const plusButton = document.createElement("div");
    plusButton.classList.add("plus-button");

    const img = document.createElement("img");
    img.src = "../assets/plus_button.png";

    plusButton.appendChild(img);
    card.appendChild(plusButton);

    [card, plusButton].forEach(elem => {
        elem.addEventListener("mouseenter", () => {
            card.style.boxShadow = "0 8px 16px rgb(255, 255, 255)";
            card.style.transform = "translateY(-5px)";
        });
        elem.addEventListener("mouseout", () => {
            card.style.boxShadow = "none";
            card.style.transform = "translateY(+5px)";
        });
    });

    card.addEventListener("click", () => {
        const target = document.getElementsByClassName("pokemons-search-box")[0];
        if (target) {
            target.focus();
            target.click();
        } else {
            console.warn("Elemento de busca não encontrado.");
        }
    });

    return card;
}

/**
 * Constrói a carta inferior com base em um pokémon selecionado.
 * @param {Object} pokemon - Dados do pokémon
 * @returns {HTMLElement} Elemento da carta
 */
function createSelectedPokemonCard(pokemon) {
    const typeKey = pokemon.types[0].type_name;
    const colors = pokemonTypeColors[typeKey] || pokemonTypeColors.normal;

    const card = document.createElement("div");
    card.classList.add("pokemon-card-selected");
    card.style.backgroundColor = colors.primary;

    // seleção da imagem de cada pokémon
    const img = document.createElement("img");
    img.src = `../assets/pokemons/official-artwork/${pokemon.pokemon_id}.png`;

    card.appendChild(img);

    // adição de um evento e em caso de hover, adicona uma translação e uma sombra
    [card, img].forEach(elem => {
        elem.addEventListener("mouseenter", () => {
            card.style.boxShadow = `0 8px 16px ${colors.primary}`;
            card.style.transform = "translateY(-5px)";
        });
        elem.addEventListener("mouseout", () => {
            card.style.boxShadow = "none";
            card.style.transform = "translateY(+5px)";
        });
    });

    // em caso de clique, o pokémon é removido dos selecionados e toda a página é refeita
    card.addEventListener("click", () => {
        selectedPokemons = selectedPokemons.filter(p => p.pokemon_id !== pokemon.pokemon_id);
        editPokemonsCard();
    });

    return card;
}