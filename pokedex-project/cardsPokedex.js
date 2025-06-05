import { getLocationIdByName, getLocationAreaByLocation, getPokemonsByMultipleLocationAreas } from "./dataManager.js";
import { pokemonTypeColors } from "./consts.js";

// TRIGGER PARA MUDANÇA NA LOCALIZAÇÃO

const locationScreen = document.getElementsByClassName("location-screen")[0];
const regionScreen = document.getElementsByClassName("region-screen")[0];

const observer = new MutationObserver(async (mutationsList) => {
    for (const mutation of mutationsList) {
        if (mutation.type === "childList" || mutation.type === "characterData") {
            const locationId = await getLocationIdByName(locationScreen.textContent.trim());
            const locationsAreaArray = await getLocationAreaByLocation(locationId);
            const pokemonsArray = await getPokemonsByMultipleLocationAreas(locationsAreaArray, regionScreen.textContent.trim());
            loadCards(pokemonsArray);
        }
    }
});

observer.observe(locationScreen, {
  childList: true,
  characterData: true,
  subtree: true
});

// FUNCIONAMENTO DO CARROSSEL DE CARTAS
const homeButtonCards = document.getElementsByClassName("home-pokemon")[0];

homeButtonCards.addEventListener("click", () => {
    cardsContainer.scrollTo({
        left: 0,
        top: 0,
        behavior: "smooth"
    });
});

let count = 2;

let pokemonArrayGlobal;
const leftButtonCards = document.getElementsByClassName("left-pokemon")[0];
const rightButtonCards = document.getElementsByClassName("right-pokemon")[0];
const listOfCards = document.getElementsByClassName("card");

leftButtonCards.addEventListener("click", () => {
    if (pokemonArrayGlobal?.length > 3 && count > 2) {
        count--;
        if (listOfCards[count - 1]) {
            listOfCards[count - 1].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
        }
    }
});

rightButtonCards.addEventListener("click", () => {
    if (pokemonArrayGlobal?.length > 3 && count < pokemonArrayGlobal.length - 1) {
        count++;
        if (listOfCards[count - 1]) {
            listOfCards[count - 1].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
        }
    }
});


// FUNCIONAMENTO GERAL DAS CARTAS

const cardsContainer = document.getElementsByClassName("cards-display")[0];

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

    // // vai lidar com o click e a eventual seleção das cartas
    // card.addEventListener("click", () => {
    //     // verifica se a carta tá ativa, isso é, selecionada
    //     const isActive = card.classList.toggle("card-active");

    //     if (isActive) {
    //         // se já foram selecionadas cartas, não permite a seleção dessa carta 
    //         if (selectedPokemons.length >= 4) {
    //             alert("Você só pode selecionar até 4 pokémons. Deselecione algum para continuar.");
    //             card.classList.remove("card-active");
    //             return;
    //         }

    //         if (selectedPokemons.some(p => p.name === pokemon.name)) {
    //             card.classList.remove("card-active");
    //             return;
    //         }

    //         card.style.backgroundColor = colors.hover;
    //         card.style.transform = "translateY(-5px)";
    //         img.src = `../assets/pokemons/official-artwork/shiny/${pokemon.pokemon_id}.png`;
    //         selectedPokemons.push(pokemon);

    //     }
    //     else {
    //         selectedPokemons = selectedPokemons.filter(p => p.pokemon_id !== pokemon.pokemon_id);
    //         card.style.backgroundColor = colors.primary;
    //         card.style.transform = "translateY(+5px)";
    //         img.src = `../assets/pokemons/official-artwork/${pokemon.pokemon_id}.png`;
    //     }
    // });

    return card;
}