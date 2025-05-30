import { pokemonTypeColors, genderRateMap, growthRateMap, habitatMap, generationMap } from "./consts.js";
import { RadarChart } from "./radarChart.js"

// Elementos do DOM
const contentScreen = document.getElementById("content-container");
const cardsContainer = document.getElementById("cards-container");

let selectedPokemons = [];
export let pokemonArrayGlobal;

// Joga na Página as Cartas da Região
export async function loadCards(pokemonsArray) {
    pokemonArrayGlobal = pokemonsArray;
    cardsContainer.innerHTML = "";

    for (const pokemon of pokemonsArray) {
        const card = createPokemonCard(pokemon);
        cardsContainer.appendChild(card);
    }
}

// Quando a aba pokemon é selecionada, cria o conteúdo dela
export function createPokemonScreen() {
    contentScreen.innerHTML = ``;
    contentScreen.style.backgroundColor = "black";

    const pokemonsSelect = document.createElement("div");
    pokemonsSelect.classList.add("pokemons-select");

    for (let i = 0; i < 4; i++) {
        pokemonsSelect.appendChild(createEmptyPokemonCard());
    }

    const pokemonsDescriptionArea = document.createElement("div");
    pokemonsDescriptionArea.classList.add("pokemons-description-area");

    for (let i = 0; i < 4; i++) {
        const desc = document.createElement("div");
        desc.classList.add("pokemon-description");
        desc.innerHTML = `Nome: blá blá bla <br>
                        Peso: blá blá bla <br>
                        Altura: blá blá bla <br>
                        Genero: blá blá bla <br>
                        Espécime: blá blá bla <br>
                        Tipo: blá blá bla <br>`;
        pokemonsDescriptionArea.appendChild(desc);
    }

    const svg1 = document.createElement("svg");
    svg1.classList.add("svg-chart-1");
    svg1.appendChild(document.createElement("rect")).classList.add("svg-chart-1-rect-1");

    const svg2 = document.createElement("svg");
    svg2.classList.add("svg-chart-2");
    svg2.appendChild(document.createElement("rect")).classList.add("svg-chart-1-rect-1");

    contentScreen.appendChild(pokemonsSelect);
    contentScreen.appendChild(pokemonsDescriptionArea);
    contentScreen.appendChild(svg1);
    contentScreen.appendChild(svg2);
}

function buildRadarDataFromPokemons(selectedPokemons) {
  const statLabels = [
    { key: "Hp_Stat", label: "Hp" },
    { key: "Attack_Stat", label: "Attack" },
    { key: "Defense_Stat", label: "Defense" },
    { key: "Special_Attack_Stat", label: "Special Attack" },
    { key: "Special_Defense_Stat", label: "Special Defense" },
    { key: "Speed_Stat", label: "Speed" }
  ];

  return selectedPokemons.map(pokemon => ({
    name: pokemon.Name || pokemon.name || "Unknown",
    axes: statLabels.map(stat => ({
      axis: stat.label,
      value: pokemon[stat.key],
      name: pokemon.Name || pokemon.name || "Unknown"
    }))
  }));
}

function createRadarChart(){
    const radarSvg = document.getElementsByClassName("svg-chart-1")[0];

    var margin = {top: 250, right: 250, bottom: 250, left: 250};

    const svgWidth = radarSvg.clientWidth;
    const svgHeight = radarSvg.clientHeight;

    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    var data = buildRadarDataFromPokemons(selectedPokemons);

    var names = selectedPokemons.map(pokemon => pokemon.Name || pokemon.name || "Unknown");

    var color = d3.scaleOrdinal()
        .range(["#EDC951", "#CC333F", "#00A0B0", "#6A4A3C"]);

    var radarChartOptions = {
        w: width,
        h: height,
        margin: margin,
        maxValue: 0.5,
        levels: 5,
        roundStrokes: true,
        color: color
    };

    RadarChart(".svg-chart-1", data, radarChartOptions, names);
}


// Atualiza as Cartas Após alguma Seleção
export function editPokemonsCard() {
    const pokemonsCardSelect = document.getElementsByClassName("pokemons-select")[0];
    pokemonsCardSelect.innerHTML = "";

    const pokemonsDescription = document.getElementsByClassName("pokemons-description-area")[0];
    pokemonsDescription.innerHTML = "";

    for (let i = 1; i <= 4; i++) {
        if (i <= selectedPokemons.length) {
        const selectedPokemon = selectedPokemons[i - 1];
            pokemonsCardSelect.appendChild(createSelectedPokemonCard(selectedPokemon));
            pokemonsDescription.appendChild(createSelectedPokemonDescription(selectedPokemon));
        } else {
            pokemonsCardSelect.appendChild(createEmptyPokemonCard());
            pokemonsDescription.appendChild(createEmptyDescription());
        }
    }

    if (selectedPokemons.length > 0){
        createRadarChart();
    }
}

function createEmptyDescription(){
    const desc = document.createElement("div");
    desc.classList.add("pokemon-description");
    desc.innerHTML = ``;
    return desc;
}

function createSelectedPokemonDescription(selectedPokemon){
    const desc = document.createElement("div");
    desc.classList.add("pokemon-description");
    desc.innerHTML = `
                    <div class="types-container">
                        <img class="type-img" src="../assets/description-types/${selectedPokemon.types[0].type_name}.png" />
                        ${selectedPokemon.types[1]?.type_name ? `<img class="type-img" src="../assets/description-types/${selectedPokemon.types[1].type_name}.png" />` : ''}
                    </div>
                    <div class="info-rows">
                        <div class="info-blocks">
                            <img src="../assets/block-info/governante.png" ></img>
                            ${selectedPokemon.height/10} m
                        </div>
                        <div class="info-blocks">
                            <img src="../assets/block-info/regua.png" ></img>
                            ${selectedPokemon.weight/10} kg
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

// Cria as Cartas Vazias
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

    return card;
}

// Cria as Cartas Após a Seleção
function createSelectedPokemonCard(pokemon) {
    const typeKey = pokemon.types[0].type_name;
    const colors = pokemonTypeColors[typeKey] || pokemonTypeColors.normal;

    const card = document.createElement("div");
    card.classList.add("pokemon-card-selected");
    card.style.backgroundColor = colors.primary;

    const img = document.createElement("img");
    img.src = `../assets/pokemons/official-artwork/${pokemon.pokemon_id}.png`;

    card.appendChild(img);

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

    card.addEventListener("click", () => {
        selectedPokemons = selectedPokemons.filter(p => p.pokemon_id !== pokemon.pokemon_id);
        loadCards(pokemonArrayGlobal);
        editPokemonsCard();
    });

    return card;
}

// Cartas da Localização Específica
export function createPokemonCard(pokemon) {
    const typeKey = pokemon.types[0].type_name;
    const colors = pokemonTypeColors[typeKey] || pokemonTypeColors.normal;

    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.type = typeKey;
    card.style.backgroundColor = colors.primary;

    // Top nav
    const topNav = document.createElement("div");
    topNav.classList.add("top-nav-card");

    const nameDisplay = document.createElement("div");
    nameDisplay.classList.add("pokemon-name-display");
    nameDisplay.textContent = pokemon.name;
    nameDisplay.style.fontWeight = "bold";

    topNav.appendChild(nameDisplay);
    card.appendChild(topNav);

    // Imagem
    const imgWrapper = document.createElement("div");
    imgWrapper.classList.add("pokemon-img-wrapper");
    imgWrapper.style.background = "url('../assets/background.png') center/cover no-repeat";

    const img = document.createElement("img");
    img.src = `../assets/pokemons/official-artwork/${pokemon.pokemon_id}.png`;
    img.classList.add("card-img");

    imgWrapper.appendChild(img);
    card.appendChild(imgWrapper);

    // Conteúdo
    const content = document.createElement("div");
    content.classList.add("card-content");
    content.innerHTML = `
        <div class="types-container">
        <img class="type-img" src="../assets/types/${pokemon.types[0].type_name}.png" />
        ${pokemon.types[1]?.type_name ? `<img class="type-img" src="../assets/types/${pokemon.types[1].type_name}.png" />` : ''}
        </div>
        ${pokemon.genus}<br>
        Min Level: ${pokemon.overall_min_level}<br>
        Max Level: ${pokemon.overall_max_level}<br>
    `;
    card.appendChild(content);

    // Hover
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

    // Seleção
    card.addEventListener("click", () => {
        const isActive = card.classList.toggle("card-active");

        if (isActive) {
            if (selectedPokemons.length >= 4) {
                alert("Você só pode selecionar até 4 pokémons. Deselecione algum para continuar.");
                card.classList.remove("card-active");
                return;
            }

            card.style.backgroundColor = colors.hover;
            img.src = `../assets/pokemons/official-artwork/shiny/${pokemon.pokemon_id}.png`;
            selectedPokemons.push(pokemon);

        } else {
            selectedPokemons = selectedPokemons.filter(p => p.pokemon_id !== pokemon.pokemon_id);
            card.style.backgroundColor = colors.primary;
            img.src = `../assets/pokemons/official-artwork/${pokemon.pokemon_id}.png`;
        }

        editPokemonsCard();
    });

    return card;
}
