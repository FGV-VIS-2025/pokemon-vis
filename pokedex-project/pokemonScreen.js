import { getAllPokemons } from "./dataManager.js";
import { pokemonTypeColorsRGBA } from "./consts.js";

const contentScreen = document.getElementsByClassName("content-screen")[0];
let selectedPokemons = [];

/**
 * Vai construir os elementos básicos da 'pokemon-screen'. 
 */
export async function createPokemonScreen() {
    const todosPokemons = await getAllPokemons();

    contentScreen.innerHTML = "";
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