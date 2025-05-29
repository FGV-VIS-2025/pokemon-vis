import { getRegions } from "./data.js";
import { pokemonTypeColors } from "./consts.js"

const regionsArray = await getRegions();
const regionsSelect = document.getElementById("regions-select");
const cardsContainer = document.getElementById("cards-container");
const contentScreen = document.getElementById("content-container");
const mapRealContainer = document.getElementById("map-real-container");

let selectedPokemons = [];
let pokemonArrayGlobal;

const regions = ["Kanto", "Johto", "Hoenn", "Sinnoh", "Unova"];

export async function loadRegions() {
  for (const eachRegion of regionsArray) {

    if (eachRegion.local_lan_id === 9 && regions.includes(eachRegion.name)) {
      const option = document.createElement("option");
      option.value = eachRegion.region_id;
      option.textContent = eachRegion.name;
      regionsSelect.appendChild(option);
    }
  }

  return regionsArray;
}

export function buildMap(selectedRegion){
  mapRealContainer.innerHTML = "";
  const img = document.createElement("img");
  img.src = `../assets/maps/${selectedRegion.name}.png`;
  mapRealContainer.appendChild(img);
}

function createPokemonScreen(){
    contentScreen.innerHTML = ``;
    contentScreen.style.backgroundColor = "black";
    const pokemonsSelect = document.createElement("div");
    pokemonsSelect.classList.add("pokemons-select");

    for (let i = 0; i < 4; i++){
        const pokemonCard = document.createElement("div");
        pokemonCard.classList.add("pokemon-card-select");

        pokemonCard.addEventListener("mouseenter", () => {
            pokemonCard.style.boxShadow = "0 8px 16px rgb(255, 255, 255)";
            pokemonCard.style.transform = "translateY(-5px)";
        });

        pokemonCard.addEventListener("mouseout", () => {
            pokemonCard.style.boxShadow = "none";
            pokemonCard.style.transform = "translateY(+5px)";
        });

        const plusButton = document.createElement("div");
        plusButton.classList.add("plus-button");

        plusButton.addEventListener("mouseenter", () => {
            pokemonCard.style.boxShadow = "0 8px 16px rgb(255, 255, 255)";
            pokemonCard.style.transform = "translateY(-5px)";
        });

        plusButton.addEventListener("mouseout", () => {
            pokemonCard.style.boxShadow = "none";
            pokemonCard.style.transform = "translateY(+5px)";
        });

        const img = document.createElement("img");
        img.src = "../assets/plus_button.png"

        plusButton.appendChild(img);
        pokemonCard.appendChild(plusButton);
        pokemonsSelect.appendChild(pokemonCard);
    }

    const pokemonsDescriptionArea = document.createElement("div");
    pokemonsDescriptionArea.classList.add("pokemons-description-area");

    for (let i = 0; i < 4; i++){
        const pokemonDescription = document.createElement("div");
        pokemonDescription.classList.add("pokemon-description");

        pokemonDescription.innerHTML = `Nome: blá blá bla <br>
                                        Peso: blá blá bla <br>
                                        Altura: blá blá bla <br>
                                        Genero: blá blá bla <br>
                                        Espécime: blá blá bla <br>
                                        Tipo: blá blá bla <br>`

        pokemonsDescriptionArea.appendChild(pokemonDescription);
    }

    const sgvChart1 = document.createElement("svg");
    sgvChart1.classList.add("svg-chart-1");

    const svgChart1Rect1 = document.createElement("rect");
    svgChart1Rect1.classList.add("svg-chart-1-rect-1");
    sgvChart1.appendChild(svgChart1Rect1);

    const sgvChart2 = document.createElement("svg");
    sgvChart2.classList.add("svg-chart-2");

    const svgChart2Rect1 = document.createElement("rect");
    svgChart2Rect1.classList.add("svg-chart-1-rect-1");
    sgvChart2.appendChild(svgChart2Rect1);

    contentScreen.appendChild(pokemonsSelect);
    contentScreen.appendChild(pokemonsDescriptionArea);
    contentScreen.appendChild(sgvChart1);
    contentScreen.appendChild(sgvChart2);
}

function editPokemonsCard(){
    const pokemonsCardSelect = document.getElementsByClassName("pokemons-select")[0];
    pokemonsCardSelect.innerHTML = "";
    const numberSelectedPokemons = selectedPokemons.length;

    for (let i = 1; i <= 4; i++){
        if (i <= numberSelectedPokemons){
            const selectedPokemon = selectedPokemons[i - 1];

            const typeKey = selectedPokemon.types[0].type_name;
            const colors = pokemonTypeColors[typeKey] || pokemonTypeColors.normal;

            const pokemonCard = document.createElement("div");
            pokemonCard.classList.add("pokemon-card-selected");

            pokemonCard.addEventListener("mouseenter", () => {
                pokemonCard.style.boxShadow = `0 8px 16px ${colors.primary}`;
                pokemonCard.style.transform = "translateY(-5px)";
            });

            pokemonCard.addEventListener("mouseout", () => {
                pokemonCard.style.boxShadow = "none";
                pokemonCard.style.transform = "translateY(+5px)";
            });
            
            pokemonCard.style.backgroundColor = colors.primary;

            const img = document.createElement("img");
            img.src = `../assets/pokemons/official-artwork/${selectedPokemon.pokemon_id}.png`;

            img.addEventListener("mouseenter", () => {
                pokemonCard.style.boxShadow = `0 8px 16px ${colors.primary}`;
                pokemonCard.style.transform = "translateY(-5px)";
            });

            pokemonCard.appendChild(img);

            pokemonCard.addEventListener("click", () => {
                selectedPokemons = selectedPokemons.filter(p => p.pokemon_id !== selectedPokemon.pokemon_id);
                loadCards(pokemonArrayGlobal);
                editPokemonsCard();
            });

            pokemonsCardSelect.appendChild(pokemonCard);

        } else{
            const pokemonCard = document.createElement("div");
            pokemonCard.classList.add("pokemon-card-select");

            pokemonCard.addEventListener("mouseenter", () => {
                pokemonCard.style.boxShadow = "0 8px 16px rgb(255, 255, 255)";
                pokemonCard.style.transform = "translateY(-5px)";
            });

            pokemonCard.addEventListener("mouseout", () => {
                pokemonCard.style.boxShadow = "none";
                pokemonCard.style.transform = "translateY(+5px)";
            });

            const plusButton = document.createElement("div");
            plusButton.classList.add("plus-button");

            plusButton.addEventListener("mouseenter", () => {
                pokemonCard.style.boxShadow = "0 8px 16px rgb(255, 255, 255)";
                pokemonCard.style.transform = "translateY(-5px)";
            });

            const img = document.createElement("img");
            img.src = "../assets/plus_button.png"

            plusButton.appendChild(img);
            pokemonCard.appendChild(plusButton);
            pokemonsCardSelect.appendChild(pokemonCard);
        }
    }
}

const colors = {"region-screen": "#3EDB2A", "route-screen": "#2AD2DB", "pokemon-screen": "#A11F62"}

export function changeContent(selectedButton){
  if (selectedButton.id == "pokemon-screen"){
    createPokemonScreen();
  } else {
    contentScreen.innerHTML = ``;
    contentScreen.style.backgroundColor = colors[selectedButton.id];
  }
}

export async function loadCards(pokemonsArray) {
    pokemonArrayGlobal = pokemonsArray;
    cardsContainer.innerHTML = "";

    for (const eachPokemon of pokemonsArray) {
        const card = document.createElement("div");
        card.classList.add("card");

        const typeKey = eachPokemon.types[0].type_name;
        const colors = pokemonTypeColors[typeKey] || pokemonTypeColors.normal;

        card.dataset.type = typeKey;
        card.style.backgroundColor = colors.primary;

        const topNav = document.createElement("div");
        topNav.classList.add("top-nav-card");

        const nameDisplay = document.createElement("div");
        nameDisplay.classList.add("pokemon-name-display");
        nameDisplay.textContent = eachPokemon.name;
        nameDisplay.style.fontWeight = "bold";
        topNav.appendChild(nameDisplay);
        card.appendChild(topNav);

        const imgWrapper = document.createElement("div");
        imgWrapper.classList.add("pokemon-img-wrapper");
        imgWrapper.style.backgroundImage = `url('../assets/background.png')`;
        imgWrapper.style.backgroundSize = `cover`;
        imgWrapper.style.backgroundPosition = `center`;
        imgWrapper.style.backgroundRepeat = `no-repeat`;

        const img = document.createElement("img");
        img.src = `../assets/pokemons/official-artwork/${eachPokemon.pokemon_id}.png`;
        img.classList.add("card-img");

        imgWrapper.appendChild(img);
        card.appendChild(imgWrapper);

        const contentDiv = document.createElement("div");
        contentDiv.classList.add("card-content");
        contentDiv.innerHTML = `
            <div class="types-container">
                <img class="type-img" src="../assets/types/${eachPokemon.types[0].type_name}.png" />
                ${eachPokemon.types[1]?.type_name ? `<img class="type-img" src="../assets/types/${eachPokemon.types[1].type_name}.png" />` : ''}
            </div>
            ${eachPokemon.genus}<br>
            Min Level: ${eachPokemon.overall_min_level}<br>
            Max Level: ${eachPokemon.overall_max_level}<br>
        `;
        card.appendChild(contentDiv);

        // Hover Events
        card.addEventListener("mouseenter", () => {
            if (!card.classList.contains("card-active")) {
                card.style.backgroundColor = colors.hover;
                card.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.4)";
                card.style.transform = "translateY(-5px)";
                img.src = `../assets/pokemons/official-artwork/shiny/${eachPokemon.pokemon_id}.png`;
            }
        });

        card.addEventListener("mouseleave", () => {
            if (!card.classList.contains("card-active")) {
                card.style.backgroundColor = colors.primary;
                card.style.boxShadow = "none";
                card.style.transform = "translateY(+5px)";
                img.src = `../assets/pokemons/official-artwork/${eachPokemon.pokemon_id}.png`;
            }
        });

        // Click Event
        card.addEventListener("click", () => {
            const isActive = card.classList.contains("card-active");

            if (isActive) {
                // Deseleciona o card
                card.classList.remove("card-active");
                card.style.backgroundColor = colors.primary;
                card.style.boxShadow = "none";
                card.style.transform = "translateY(+5px)";
                img.src = `../assets/pokemons/official-artwork/${eachPokemon.pokemon_id}.png`;

                // Remove do array
                selectedPokemons = selectedPokemons.filter(p => p.pokemon_id !== eachPokemon.pokemon_id);
            } else {
                if (selectedPokemons.length >= 4) {
                    alert("Você só pode selecionar até 4 pokémons. Deselecione algum para continuar.");
                    return;
                }

                // Seleciona o card
                card.classList.add("card-active");
                card.style.backgroundColor = colors.hover;
                card.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.4)";
                card.style.transform = "translateY(-5px)";
                img.src = `../assets/pokemons/official-artwork/shiny/${eachPokemon.pokemon_id}.png`;

                // Adiciona ao array
                selectedPokemons.push(eachPokemon);
            }

            editPokemonsCard();
        });

        cardsContainer.appendChild(card);
    }
}
