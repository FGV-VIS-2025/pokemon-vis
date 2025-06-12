import { genderRateMap, 
        generationMap, 
        growthRateMap, 
        habitatMap, 
        pokemonTypeColors, 
        pokemonTypeColorsRadar, 
        pokemonTypeColorsRGBA } from "./consts.js";

import { getAllPokemons } from "./data.js";
import { createRadarChart } from "./radarChart.js";
import { createHeatMap } from "./heatMapDef.js";
import { createHeatMapAta } from "./heatMapAta.js";

// Elementos do DOM
const contentScreen = document.getElementById("content-container");
const cardsContainer = document.getElementById("cards-container");

let selectedPokemons = [];
let pokemonArrayGlobal;


/**
 * Vai construir as cartas dos pokémons na parte superior da página.
 * 
 * @param {*} pokemonsArray - Recebe um array com dados dos pokémons 
 */
export async function loadCards(pokemonsArray) {
    pokemonArrayGlobal = pokemonsArray;
    cardsContainer.innerHTML = "";

    for (const pokemon of pokemonsArray) {
        const card = createPokemonCard(pokemon);
        cardsContainer.appendChild(card);
    }
}

/**
 * Vai construir os elementos básicos da 'pokemon-screen'. 
 */
export async function createPokemonScreen() {
    const todosPokemons = await getAllPokemons();

    contentScreen.innerHTML = "";
    contentScreen.style.backgroundColor = "black";
    // cria os elementos
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

    // Funções dentro do escopo para acessar variáveis locais
    function filterSuggestions() {
        const query = pokemonSearchBox.value.toLowerCase();
        suggestionsList.innerHTML = "";

        const filtered = todosPokemons.filter(p =>
            p.name.toLowerCase().includes(query)
        );

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

        filtered.forEach(pokemon => {
            const li = document.createElement("li");
            li.classList.add("li");

            const img = document.createElement("img");
            img.src = `../assets/types/${pokemon.types[0].type_name}.png`
            img.classList.add("search-type-img");
            li.appendChild(img);

            li.appendChild(document.createTextNode(pokemon.name));

            const img2 = document.createElement("img");
            img2.src = `../assets/gifs/${pokemon.pokemon_id}.gif`
            img2.classList.add("search-gif");
            li.appendChild(img2);

            li.style.backgroundColor = pokemonTypeColorsRGBA[pokemon.types[0].type_name];

            li.onclick = () => {
                pokemonSearchBox.value = pokemon.name;

                if (selectedPokemons.length < 4 && !selectedPokemons.some(p => p.name === pokemon.name)) {
                    selectedPokemons.push(pokemon);
                    editPokemonsCard();
                }

                pokemonSearchBox.value = "";
                suggestionsList.style.display = "none";

                pokemonSearch.style.borderBottomLeftRadius = "12px"
                pokemonSearch.style.borderBottomRightRadius = "12px"

            };
            suggestionsList.appendChild(li);
        });
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
    pokemonsSelect.classList.add("pokemons-select");

    // área com as descrições dos pokémons
    const pokemonsDescriptionArea = document.createElement("div");
    pokemonsDescriptionArea.classList.add("pokemons-description-area");

    // área externa para o primeiro gráfico
    const svgPai1 = document.createElement("svg");
    svgPai1.classList.add("svg-pai-chart-1");

    // área para o primeiro gráfico (radar)
    const svg1 = document.createElement("svg");
    svg1.classList.add("svg-chart-1");
    svg1.appendChild(document.createElement("rect")).classList.add("svg-chart-1-rect-1");
    svgPai1.appendChild(svg1);

    // área externa para o primeiro gráfico
    const svgPai2 = document.createElement("svg");
    svgPai2.classList.add("svg-pai-chart-2");

    // área para o primeiro gráfico (radar)
    const svg2 = document.createElement("svg");
    svg2.classList.add("svg-chart-2");
    svg2.appendChild(document.createElement("rect")).classList.add("svg-chart-2-rect-1");
    svgPai2.appendChild(svg2);

    // área externa para o primeiro gráfico
    const svgPai3 = document.createElement("svg");
    svgPai3.classList.add("svg-pai-chart-3");

    // área para o primeiro gráfico (radar)
    const svg3 = document.createElement("svg");
    svg3.classList.add("svg-chart-3");
    svg3.appendChild(document.createElement("rect")).classList.add("svg-chart-3-rect-1");
    svgPai3.appendChild(svg3);

    contentScreen.appendChild(pokemonSearch);
    contentScreen.appendChild(pokemonsSelect);
    contentScreen.appendChild(pokemonsDescriptionArea);
    contentScreen.appendChild(svgPai1);
    contentScreen.appendChild(svgPai2);
    contentScreen.appendChild(svgPai3);
}

/**
 * Função que tem como objetivo formatar os dados para um formato amigável para a construção do gráfico de radar.
 * 
 * @param {*} selectedPokemons - Array com todos os pokémons selecionados e que vão compor o gráfico de radar. 
 * @returns 
 */
function buildRadarDataFromPokemons(selectedPokemons) {
    const statLabels = [
        { key: "Hp_Stat", label: "Hp" },
        { key: "Attack_Stat", label: "Attack" },
        { key: "Defense_Stat", label: "Defense" },
        { key: "Special_Attack_Stat", label: "Special Attack" },
        { key: "Special_Defense_Stat", label: "Special Defense" },
        { key: "Speed_Stat", label: "Speed" }
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

// ao mudar a tela de tamanho, reconstroi tudo para parecer dinâmico
window.addEventListener("resize", editPokemonsCard);

/**
 * Função que atualiza a pokemon-screen caso seja selecionado/desselecionado algum pokémon.
 */
export function editPokemonsCard() {
    // seleciona a região dos cards inferiores
    const pokemonsCardSelect = document.getElementsByClassName("pokemons-select")[0];
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
            pokemonsDescription.appendChild(createSelectedPokemonDescription(selectedPokemon));
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
        createHeatMap(selectedPokemons);
        createHeatMapAta(selectedPokemons);
    } else {
        const radarSvg = document.getElementsByClassName("svg-chart-1")[0];
        radarSvg.innerHTML = "";
        radarSvg.style.border = 0;
        const radarPaiSvg = document.getElementsByClassName("svg-pai-chart-1")[0];
        radarPaiSvg.style.padding = 0;
        radarPaiSvg.style.marginBottom = 0;
        const heatSvg = document.getElementsByClassName("svg-chart-2")[0];
        heatSvg.innerHTML = "";
        heatSvg.style.border = 0;
        const heatPaiSvg = document.getElementsByClassName("svg-pai-chart-2")[0];
        heatPaiSvg.style.padding = 0;
        heatPaiSvg.style.marginBottom = 0;
        const heatSvg2 = document.getElementsByClassName("svg-chart-3")[0];
        heatSvg2.innerHTML = "";
        heatSvg2.style.border = 0;
        const heatPaiSvg2 = document.getElementsByClassName("svg-pai-chart-3")[0];
        heatPaiSvg2.style.padding = 0;
        heatPaiSvg2.style.marginBottom = 0;
        pokemonsDescription.style.marginBottom = 0;
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
function createSelectedPokemonDescription(selectedPokemon) {
    // construção da div das descrições
    const desc = document.createElement("div");
    desc.classList.add("pokemon-description");

    // configuração de todo o html da div com as infos personalizadas
    desc.innerHTML = `
                    <div class="types-container">
                        <img class="type-img" src="../assets/description-types/${selectedPokemon.types[0].type_name}.png" />
                        ${selectedPokemon.types[1]?.type_name ? `<img class="type-img" src="../assets/description-types/${selectedPokemon.types[1].type_name}.png" />` : ''}                        </div>
                    <div class="info-rows">
                        <div class="info-blocks">
                            <img src="../assets/block-info/governante.png" ></img>
                            ${selectedPokemon.height / 10} m
                        </div>
                        <div class="info-blocks">
                            <img src="../assets/block-info/regua.png" ></img>
                            ${selectedPokemon.weight / 10} kg
                        </div>
                    </div>
                    <div class="info-rows">
                        <div class="info-blocks">
                            <img src="../assets/block-info/genders.png" ></img>
                            ${genderRateMap[selectedPokemon.gender_rate]}
                        </div>
                        <div class="info-blocks">
                            <img src="../assets/block-info/relogio.png" ></img>
                            ${selectedPokemon.hatch_counter} ciclos
                        </div>
                    </div>
                    <div class="info-rows-2">
                        <div class="info-blocks-2-menor">
                            Name:<br>
                            Genus:<br>
                            Generation:<br>
                            Habitat:<br>
                            Capture Rate:<br>
                            Growth Rate:<br>
                            B. Happiness:<br>
                            Is Baby:<br>
                            Is Legendary:<br>
                            Is Mythical:<br>
                        </div>
                        <div class="info-blocks-2-maior">
                            ${selectedPokemon.name}<br>
                            ${selectedPokemon.genus.split(" Pokémon")[0]}<br>
                            ${generationMap[selectedPokemon.generation_id]}<br>
                            ${habitatMap[selectedPokemon.habitat_id]}<br>
                            ${selectedPokemon.capture_rate}<br>
                            ${growthRateMap[selectedPokemon.growth_rate_id].name}<br>
                            ${selectedPokemon.base_happiness}<br>
                            ${selectedPokemon.is_baby == 0 ? "No" : "Yes"}<br>
                            ${selectedPokemon.is_legendary == 0 ? "No" : "Yes"}<br>
                            ${selectedPokemon.is_mythical == 0 ? "No" : "Yes"}<br>
                        </div>
                    </div>`;

    return desc;
}

/**
 * Função que cria as cartas (inferiores) vazias, ou seja, as cartas com o plus sign. 
 * 
 * @returns Retorna a div da carta vazia.
 */
// TODO Ao cliar em uma carta vazia, vai ser possível entrar no modo de busca e selecionar um pokémon novo
function createEmptyPokemonCard() {
    // criação da div geral
    const card = document.createElement("div");
    card.classList.add("pokemon-card-select");

    // criação da div da imagem
    const plusButton = document.createElement("div");
    plusButton.classList.add("plus-button");

    // imagem do plus sign usada
    const img = document.createElement("img");
    img.src = "../assets/plus_button.png";

    plusButton.appendChild(img);
    card.appendChild(plusButton);

    // adição de um evento e em caso de hover, adicona uma translação e uma sombra
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

    // clique que leva para a barra de pesquisa
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
 * Função vai construir a carta (inferior) com base em um pokémon selecionado. 
 * 
 * @param {*} pokemon - Dados do pokémon em questão que vai ser construída a carta. 
 * @returns Retorna a div em questão.
 */
function createSelectedPokemonCard(pokemon) {
    // seleção da cor da carta
    const typeKey = pokemon.types[0].type_name;
    const colors = pokemonTypeColors[typeKey] || pokemonTypeColors.normal;

    // criação da div da carta
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
        loadCards(pokemonArrayGlobal);
        editPokemonsCard();
    });

    return card;
}

/**
 * Função que cria, individualmente, as cartas superiores.
 * 
 * @param {*} pokemon - Dados do pokémon em questão que vai ser construída a carta (superior) personalizada
 * @returns Retorna a div da carta em questão
 */
export function createPokemonCard(pokemon) {
    // seleção da cor base da cata
    const typeKey = pokemon.types[0].type_name;
    const colors = pokemonTypeColors[typeKey] || pokemonTypeColors.normal;

    // criação da div da carta
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.type = typeKey;
    card.style.backgroundColor = colors.primary;

    // criação e configuração do cabeçalho da carta (que contém o nome do pokémon)
    const topNav = document.createElement("div");
    topNav.classList.add("top-nav-card");

    const nameDisplay = document.createElement("div");
    nameDisplay.classList.add("pokemon-name-display");
    nameDisplay.textContent = pokemon.name;
    nameDisplay.style.fontWeight = "bold";

    topNav.appendChild(nameDisplay);
    card.appendChild(topNav);

    // criação e configuração das imagens da carta (laboratório e do próprio pokémon)
    const imgWrapper = document.createElement("div");
    imgWrapper.classList.add("pokemon-img-wrapper");
    imgWrapper.style.background = "url('../assets/background.png') center/cover no-repeat";

    const img = document.createElement("img");
    img.src = `../assets/pokemons/official-artwork/${pokemon.pokemon_id}.png`;
    img.classList.add("card-img");

    imgWrapper.appendChild(img);
    card.appendChild(imgWrapper);

    // criação do conteúdo inferior da carta (tipo e infos de níveis)
    const content = document.createElement("div");
    content.classList.add("card-content");
    content.innerHTML = `
        <div class="types-container">
        <img class="type-img" src="../assets/types/${pokemon.types[0].type_name}.png" />
        ${pokemon.types[1]?.type_name ? `<img class="type-img" src="../assets/types/${pokemon.types[1].type_name}.png" />` : ''}
        </div>
        Min Lvl: ${pokemon.overall_min_level}<br>
        Max Lvl: ${pokemon.overall_max_level}<br>
    `;
    card.appendChild(content);

    // configurações de hover, adicionando sombra, translação, troca da cor e troca da versão da imagem (shiny)
    card.addEventListener("mouseenter", () => {
        if (!card.classList.contains("card-active")) {
            card.style.backgroundColor = colors.hover;
            card.style.boxShadow = "0 8px 16px rgba(0,0,0,0.4)";
            card.style.transform = "translateY(-5px)";
            img.src = `../assets/pokemons/official-artwork/shiny/${pokemon.pokemon_id}.png`;
        }
    });

    card.addEventListener("mouseleave", () => {
        if (!card.classList.contains("card-active")) {
            card.style.backgroundColor = colors.primary;
            card.style.boxShadow = "none";
            card.style.transform = "translateY(+5px)";
            img.src = `../assets/pokemons/official-artwork/${pokemon.pokemon_id}.png`;
        }
    });

    // vai lidar com o click e a eventual seleção das cartas
    card.addEventListener("click", () => {
        // verifica se a carta tá ativa, isso é, selecionada
        const isActive = card.classList.toggle("card-active");

        if (isActive) {
            // se já foram selecionadas cartas, não permite a seleção dessa carta 
            if (selectedPokemons.length >= 4) {
                alert("Você só pode selecionar até 4 pokémons. Deselecione algum para continuar.");
                card.classList.remove("card-active");
                return;
            }

            if (selectedPokemons.some(p => p.name === pokemon.name)) {
                card.classList.remove("card-active");
                return;
            }

            card.style.backgroundColor = colors.hover;
            card.style.transform = "translateY(-5px)";
            img.src = `../assets/pokemons/official-artwork/shiny/${pokemon.pokemon_id}.png`;
            selectedPokemons.push(pokemon);

        }
        else {
            selectedPokemons = selectedPokemons.filter(p => p.pokemon_id !== pokemon.pokemon_id);
            card.style.backgroundColor = colors.primary;
            card.style.transform = "translateY(+5px)";
            img.src = `../assets/pokemons/official-artwork/${pokemon.pokemon_id}.png`;
        }

        editPokemonsCard();
    });

    return card;
}
 