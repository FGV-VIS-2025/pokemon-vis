import { genderRateMap, generationMap, growthRateMap, habitatMap, pokemonTypeColors, pokemonTypeColorsRadar, pokemonTypeColorsRGBA } from "./consts.js";
import { getAllPokemons } from "./data.js";
import { RadarChart } from "./radarChart.js";

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
    pokemonSearchBoxImage.src = "./assets/search.png";
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
            img.src = `./assets/types/${pokemon.types[0].type_name}.png`
            img.classList.add("search-type-img");
            li.appendChild(img);

            li.appendChild(document.createTextNode(pokemon.name));

            const img2 = document.createElement("img");
            img2.src = `./assets/gifs/${pokemon.pokemon_id}.gif`
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

    // área para o segundo gráfico
    const svg2 = document.createElement("svg");
    svg2.classList.add("svg-chart-2");
    svg2.appendChild(document.createElement("rect")).classList.add("svg-chart-1-rect-1");

    contentScreen.appendChild(pokemonSearch);
    contentScreen.appendChild(pokemonsSelect);
    contentScreen.appendChild(pokemonsDescriptionArea);
    contentScreen.appendChild(svgPai1);
    contentScreen.appendChild(svg2);
}

/**
 * Função que tem como objetivo formatar os dados para um formato amigável para a construção do gráfico de radar.
 * 
 * @param {*} selectedPokemons - Array com todos os pokémons selecionados e que vão compor o gráfico de radar. 
 * @returns 
 */
function buildRadarDataFromPokemons(selectedPokemons) {
    // stats que vão ser consideradas
    const statLabels = [
        { key: "Hp_Stat", label: "Hp" },
        { key: "Attack_Stat", label: "Attack" },
        { key: "Defense_Stat", label: "Defense" },
        { key: "Special_Attack_Stat", label: "Special Attack" },
        { key: "Special_Defense_Stat", label: "Special Defense" },
        { key: "Speed_Stat", label: "Speed" }
    ];

    // mapeia e calcula total
    const formattedData = selectedPokemons.map(pokemon => {
        const name = pokemon.Name || pokemon.name || "Unknown";

        const axes = statLabels.map(stat => ({
            axis: stat.label,
            value: pokemon[stat.key],
            name: name
        }));

        const total = axes.reduce((sum, stat) => sum + (stat.value || 0), 0);

        return { name, axes, total };
    });

    // ordena por total decrescente
    formattedData.sort((a, b) => b.total - a.total);

    return formattedData;
}

/**
 * Função que define a cor que um pokémon vai ter no gráfico de radar com base no seu tipo.
 * 
 * @param {*} selectedPokemons - Array com os pokémons selecionados
 * @returns Retorna um array com as cores que vão ser usadas no gráfico de radar
 */
function getColorRadarChart(selectedPokemons) {
    const tiposVistos = [];
    const cores = [];

    for (const pokemon of selectedPokemons) {
        const nomeTipo = pokemon.types[0].type_name;
        const numeroOcorrencias = tiposVistos.filter(t => t === nomeTipo).length;
        tiposVistos.push(nomeTipo);

        const cor = pokemonTypeColorsRadar[nomeTipo]?.[String(numeroOcorrencias + 1)] ?? '#000000';
        cores.push(cor);
    }

    return cores;
}


/**
 * Função responsável por configurar as variáveis necessárias e chamar a função que de fato cria o gráfico de radar.
 */
function createRadarChart() {
    // seleção do svg-pai onde vai ser construido o gráfico
    const radarSvg = document.getElementsByClassName("svg-chart-1")[0];
    const radarPaiSvg = document.getElementsByClassName("svg-pai-chart-1")[0];

    radarSvg.style.border = "1px solid rgb(255, 255, 255)";
    radarPaiSvg.style.padding = "15px";
    radarPaiSvg.style.marginBottom = "20px";

    // definição das dimensões do gráfico com base no svg-pai
    const svgWidth = radarSvg.clientWidth;

    // valores de margem
    var margin = { top: svgWidth / 5, right: svgWidth / 5, bottom: svgWidth / 5, left: svgWidth / 5 };

    var width = svgWidth - margin.left - margin.right;
    var height = svgWidth - margin.top - margin.bottom;

    // formatação dos dados
    var data = buildRadarDataFromPokemons(selectedPokemons);

    // cores que vão ser usadas
    var color = d3.scaleOrdinal()
        .range(getColorRadarChart(selectedPokemons));

    // configurações de gráfico
    var radarChartOptions = {
        w: width,
        h: height,
        margin: margin,
        maxValue: 0.5,
        levels: 8,
        roundStrokes: true,
        color: color
    };

    // chamada da função que de fato cria o gráfico
    RadarChart(".svg-chart-1", data, radarChartOptions);
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
        createRadarChart();
    } else {
        const radarSvg = document.getElementsByClassName("svg-chart-1")[0];
        radarSvg.innerHTML = "";
        radarSvg.style.border = 0;
        const radarPaiSvg = document.getElementsByClassName("svg-pai-chart-1")[0];
        radarPaiSvg.style.padding = 0;
        radarPaiSvg.style.marginBottom = 0;
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
                        <img class="type-img" src="./assets/description-types/${selectedPokemon.types[0].type_name}.png" />
                        ${selectedPokemon.types[1]?.type_name ? `<img class="type-img" src="./assets/description-types/${selectedPokemon.types[1].type_name}.png" />` : ''}                        </div>
                    <div class="info-rows">
                        <div class="info-blocks">
                            <img src="./assets/block-info/governante.png" ></img>
                            ${selectedPokemon.height / 10} m
                        </div>
                        <div class="info-blocks">
                            <img src="./assets/block-info/regua.png" ></img>
                            ${selectedPokemon.weight / 10} kg
                        </div>
                    </div>
                    <div class="info-rows">
                        <div class="info-blocks">
                            <img src="./assets/block-info/genders.png" ></img>
                            ${genderRateMap[selectedPokemon.gender_rate]}
                        </div>
                        <div class="info-blocks">
                            <img src="./assets/block-info/relogio.png" ></img>
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
    img.src = "./assets/plus_button.png";

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
    img.src = `./assets/pokemons/official-artwork/${pokemon.pokemon_id}.png`;

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
    imgWrapper.style.background = "url('./assets/background.png') center/cover no-repeat";

    const img = document.createElement("img");
    img.src = `./assets/pokemons/official-artwork/${pokemon.pokemon_id}.png`;
    img.classList.add("card-img");

    imgWrapper.appendChild(img);
    card.appendChild(imgWrapper);

    // criação do conteúdo inferior da carta (tipo e infos de níveis)
    const content = document.createElement("div");
    content.classList.add("card-content");
    content.innerHTML = `
        <div class="types-container">
        <img class="type-img" src="./assets/types/${pokemon.types[0].type_name}.png" />
        ${pokemon.types[1]?.type_name ? `<img class="type-img" src="./assets/types/${pokemon.types[1].type_name}.png" />` : ''}
        </div>
        Min Level: ${pokemon.overall_min_level}<br>
        Max Level: ${pokemon.overall_max_level}<br>
    `;
    card.appendChild(content);

    // configurações de hover, adicionando sombra, translação, troca da cor e troca da versão da imagem (shiny)
    card.addEventListener("mouseenter", () => {
        if (!card.classList.contains("card-active")) {
            card.style.backgroundColor = colors.hover;
            card.style.boxShadow = "0 8px 16px rgba(0,0,0,0.4)";
            card.style.transform = "translateY(-5px)";
            img.src = `./assets/pokemons/official-artwork/shiny/${pokemon.pokemon_id}.png`;
        }
    });

    card.addEventListener("mouseleave", () => {
        if (!card.classList.contains("card-active")) {
            card.style.backgroundColor = colors.primary;
            card.style.boxShadow = "none";
            card.style.transform = "translateY(+5px)";
            img.src = `./assets/pokemons/official-artwork/${pokemon.pokemon_id}.png`;
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

            card.style.backgroundColor = colors.hover;
            card.style.transform = "translateY(-5px)";
            img.src = `./assets/pokemons/official-artwork/shiny/${pokemon.pokemon_id}.png`;
            selectedPokemons.push(pokemon);

        }
        else {
            selectedPokemons = selectedPokemons.filter(p => p.pokemon_id !== pokemon.pokemon_id);
            card.style.backgroundColor = colors.primary;
            card.style.transform = "translateY(+5px)";
            img.src = `./assets/pokemons/official-artwork/${pokemon.pokemon_id}.png`;
        }

        editPokemonsCard();
    });

    return card;
}
