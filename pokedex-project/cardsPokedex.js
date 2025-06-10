import { pokemonTypeColors } from "./consts.js";

// Os cards agora são carregados apenas pelo event listener locationSelected em mapManager.js

// FUNCIONAMENTO DO CARROSSEL DE CARTAS
const homeButtonCards = document.getElementsByClassName("home-pokemon")[0];

homeButtonCards.addEventListener("click", () => {
    count = 2;
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
    pokemonArrayGlobal = pokemonsArray || [];
    cardsContainer.innerHTML = "";

    // Verificar se há pokémons para exibir
    if (!pokemonsArray || pokemonsArray.length === 0) {
        // Criar mensagem de "nenhum pokémon encontrado"
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

    // Criar cards para cada pokémon encontrado
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
    // Verificação de segurança
    if (!pokemon || !pokemon.types || !pokemon.types.length) {
        console.warn("Dados de Pokémon inválidos", pokemon);

        // Criar um card genérico para evitar erros
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
    img.alt = pokemon.name || "Pokémon";
    img.onerror = function () {
        // Usar uma imagem padrão se a imagem do pokémon não for encontrada
        this.src = "../assets/pokeball.png";
        this.style.width = "50%";
        this.style.height = "auto";
        this.style.opacity = "0.7";
    };
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

            // Adicionar tratamento de erro para imagem shiny também
            img.onerror = function () {
                this.src = `../assets/pokemons/official-artwork/${pokemon.pokemon_id}.png`;
                // Se a imagem normal também falhar, usar pokeball
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

            // Restaurar tratamento de erro original para imagem normal
            img.onerror = function () {
                this.src = "../assets/pokeball.png";
                this.style.width = "50%";
                this.style.height = "auto";
                this.style.opacity = "0.7";
            };
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