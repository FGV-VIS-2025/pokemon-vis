import { pokemonTypeColors } from "./consts.js";

const homeButtonCards = document.getElementsByClassName("home-pokemon")[0];

homeButtonCards.addEventListener("click", () => {
    count = 1;
    cardsContainer.scrollTo({
        left: 0,
        top: 0,
        behavior: "smooth"
    });
});

let count = 1;

export function resetPokemonCarousel() {
    count = 1;
    setTimeout(() => {
        cardsContainer.scrollTo({
            left: 0,
            top: 0,
            behavior: "smooth"
        });
    }, 100);
}

let pokemonArrayGlobal;
const leftButtonCards = document.getElementsByClassName("left-pokemon")[0];
const rightButtonCards = document.getElementsByClassName("right-pokemon")[0];
const listOfCards = document.getElementsByClassName("card");

leftButtonCards.addEventListener("click", () => {
    if (pokemonArrayGlobal?.length > 3 && count > 1) {
        count--;
        if (listOfCards[count]) {
            listOfCards[count].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
        }
    }
});

rightButtonCards.addEventListener("click", () => {
    if (pokemonArrayGlobal?.length > 3 && count < pokemonArrayGlobal.length - 1) {
        count++;
        if (listOfCards[count]) {
            listOfCards[count].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
        }
    }
});

const cardsContainer = document.getElementsByClassName("cards-display")[0];

/**
 * Constrói as cartas dos pokémons na parte superior da página.
 * @param {Array} pokemonsArray - Array com dados dos pokémons 
 */
export async function loadCards(pokemonsArray) {
    pokemonArrayGlobal = pokemonsArray || [];
    cardsContainer.innerHTML = "";

    if (!pokemonsArray || pokemonsArray.length === 0) {
        const emptyMessage = document.createElement("div");
        emptyMessage.classList.add("empty-cards-message");
        emptyMessage.textContent = "Nenhum Pokémon encontrado nesta localização.";
        emptyMessage.style.textAlign = "center";
        emptyMessage.style.padding = "20px";
        emptyMessage.style.color = "#777";
        emptyMessage.style.width = "100%";
        cardsContainer.appendChild(emptyMessage);
        return;
    }

    for (const pokemon of pokemonsArray) {
        const card = createPokemonCard(pokemon);
        cardsContainer.appendChild(card);
    }
}

/**
 * Cria uma carta individual do pokémon.
 * @param {Object} pokemon - Dados do pokémon
 * @returns {HTMLElement} Elemento da carta
 */
export function createPokemonCard(pokemon) {
    if (!pokemon || !pokemon.types || !pokemon.types.length) {
        const errorCard = document.createElement("div");
        errorCard.classList.add("card");
        errorCard.style.backgroundColor = "#ddd";

        const errorMessage = document.createElement("div");
        errorMessage.textContent = "Dados insuficientes";
        errorMessage.style.padding = "20px";
        errorMessage.style.textAlign = "center";

        errorCard.appendChild(errorMessage);
        return errorCard;
    }

    const typeKey = pokemon.types[0].type_name;
    const colors = pokemonTypeColors[typeKey] || pokemonTypeColors.normal;

    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.type = typeKey;
    card.style.backgroundColor = colors.primary;

    const topNav = document.createElement("div");
    topNav.classList.add("top-nav-card");

    const nameDisplay = document.createElement("div");
    nameDisplay.classList.add("pokemon-name-display");
    nameDisplay.textContent = pokemon.name;
    nameDisplay.style.fontWeight = "bold";

    topNav.appendChild(nameDisplay);
    card.appendChild(topNav);

    const imgWrapper = document.createElement("div");
    imgWrapper.classList.add("pokemon-img-wrapper");
    imgWrapper.style.background = "url('../assets/background.png') center/cover no-repeat";

    const img = document.createElement("img");
    img.src = `../assets/pokemons/official-artwork/${pokemon.pokemon_id}.png`;
    img.alt = pokemon.name || "Pokémon";
    img.onerror = function () {
        this.src = "../assets/pokeball.png";
        this.style.width = "50%";
        this.style.height = "auto";
        this.style.opacity = "0.7";
    };
    img.classList.add("card-img");

    imgWrapper.appendChild(img);
    card.appendChild(imgWrapper);

    const content = document.createElement("div");
    content.classList.add("card-content");
    content.innerHTML = `
        <div class="types-container">
        <img class="type-img" src="../assets/types/${pokemon.types[0].type_name}.png" />
        ${pokemon.types[1]?.type_name ? `<img class="type-img" src="../assets/types/${pokemon.types[1].type_name}.png" />` : ''}
        </div>
    `;
    card.appendChild(content);

    card.addEventListener("mouseenter", () => {
        if (!card.classList.contains("card-active")) {
            card.style.backgroundColor = colors.hover;
            card.style.boxShadow = "0 8px 16px rgba(0,0,0,0.4)";
            card.style.transform = "translateY(-5px)";
            img.src = `../assets/pokemons/official-artwork/shiny/${pokemon.pokemon_id}.png`;

            img.onerror = function () {
                this.src = `../assets/pokemons/official-artwork/${pokemon.pokemon_id}.png`;
                this.onerror = function () {
                    this.src = "../assets/pokeball.png";
                    this.style.width = "50%";
                    this.style.height = "auto";
                    this.style.opacity = "0.7";
                };
            };
        }
    });

    card.addEventListener("mouseleave", () => {
        if (!card.classList.contains("card-active")) {
            card.style.backgroundColor = colors.primary;
            card.style.boxShadow = "none";
            card.style.transform = "translateY(+5px)";
            img.src = `../assets/pokemons/official-artwork/${pokemon.pokemon_id}.png`;

            img.onerror = function () {
                this.src = "../assets/pokeball.png";
                this.style.width = "50%";
                this.style.height = "auto";
                this.style.opacity = "0.7";
            };
        }
    });

    return card;
}