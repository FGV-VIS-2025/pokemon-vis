import { getRegions } from "./data.js";

const regionsArray = await getRegions();
const regionsSelect = document.getElementById("regions-select");
const cardsContainer = document.getElementById("cards-container");
const contentScreen = document.getElementById("content-container");
const mapRealContainer = document.getElementById("map-real-container");

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

const colors = {"region-screen": "#3EDB2A", "route-screen": "#2AD2DB", "pokemon-screen": "#A11F62"}

export function changeContent(selectedButton){
  contentScreen.style.backgroundColor = colors[selectedButton.id];
}

const pokemonsArray = [
        { id: 1, id: 1, name: "Bulbasaur", tipo_1: "grass", tipo_2: "poison", regiao: "Kanto", nivel: 20, hp: 100 },
        { id: 10, name: "Charmander", tipo_1: "fire", tipo_2: "", regiao: "Kanto", nivel: 18, hp: 90 },
        { id: 100, name: "Squirtle", tipo_1: "water", tipo_2: "", regiao: "Kanto", nivel: 19, hp: 95 },
        { id: 1000, name: "Pikachu", tipo_1: "electric", tipo_2: "", regiao: "Kanto", nivel: 22, hp: 85 },
        { id: 1001, name: "Jigglypuff", tipo_1: "normal", tipo_2: "fairy", regiao: "Kanto", nivel: 15, hp: 78 },
        { id: 10001, name: "Meowth", tipo_1: "normal", tipo_2: "", regiao: "Kanto", nivel: 17, hp: 70 },
        { id: 10002, name: "Psyduck", tipo_1: "water", tipo_2: "", regiao: "Kanto", nivel: 21, hp: 88 },
        { id: 10003, name: "Machop", tipo_1: "fighting", tipo_2: "", regiao: "Kanto", nivel: 25, hp: 70 },
        { id: 10004, name: "Geodude", tipo_1: "rock", tipo_2: "ground", regiao: "Kanto", nivel: 23, hp: 92 },
        { id: 10005, name: "Gengar", tipo_1: "ghost", tipo_2: "poison", regiao: "Kanto", nivel: 30, hp: 20 },
        { id: 10006, name: "Onix", tipo_1: "rock", tipo_2: "ground", regiao: "Kanto", nivel: 28, hp: 25 },
        { id: 10007, name: "Magikarp", tipo_1: "water", tipo_2: "", regiao: "Kanto", nivel: 10, hp: 50 },
        { id: 10008, name: "Eevee", tipo_1: "normal", tipo_2: "", regiao: "Kanto", nivel: 16, hp: 75 },
        { id: 10009, name: "Snorlax", tipo_1: "normal", tipo_2: "", regiao: "Kanto", nivel: 35, hp: 26 },
        { id: 10010, name: "Dratini", tipo_1: "dragon", tipo_2: "", regiao: "Kanto", nivel: 26, hp: 98 },
        { id: 10011, name: "Mewtwo", tipo_1: "psychic", tipo_2: "", regiao: "Kanto", nivel: 50, hp: 85 },
        { id: 10012, name: "Chikorita", tipo_1: "grass", tipo_2: "", regiao: "Johto", nivel: 20, hp: 95 },
        { id: 10013, name: "Cyndaquil", tipo_1: "fire", tipo_2: "", regiao: "Johto", nivel: 18, hp: 88 },
        { id: 10014, name: "Totodile", tipo_1: "water", tipo_2: "", regiao: "Johto", nivel: 19, hp: 92 },
        { id: 10016, name: "Mareep", tipo_1: "electric", tipo_2: "", regiao: "Johto", nivel: 17, hp: 80 },
        { id: 10017, name: "Sudowoodo", tipo_1: "rock", tipo_2: "", regiao: "Johto", nivel: 24, hp: 96 },
        { id: 10018, name: "Togepi", tipo_1: "fairy", tipo_2: "", regiao: "Johto", nivel: 15, hp: 60 },
        { id: 10019, name: "Murkrow", tipo_1: "dark", tipo_2: "flying", regiao: "Johto", nivel: 22, hp: 78 },
        { id: 10020, name: "Wobbuffet", tipo_1: "psychic", tipo_2: "", regiao: "Johto", nivel: 28, hp: 21 },
        { id: 10015, name: "Larvitar", tipo_1: "rock", tipo_2: "ground", regiao: "Johto", nivel: 27, hp: 90 },
        { id: 10021, name: "Ho-Oh", tipo_1: "fire", tipo_2: "flying", regiao: "Johto", nivel: 50, hp: 65 }];

const pokemonTypeColors = {
    water: { primary: '#4A90E2', hover: '#2E6DA4' },    
    grass: { primary: '#7ED321', hover: '#5C9E18' },     
    normal: { primary: '#9B9B9B', hover: '#696969' },   
    fire: { primary: '#F5A623', hover: '#C7841C' },     
    psychic: { primary: '#F366B9', hover: '#C44793' },   
    ice: { primary: '#5BC8E5', hover: '#3D93AD' },       
    dragon: { primary: '#7B62F0', hover: '#452AB1' },    
    dark: { primary: '#6F6F6F', hover: '#3D3D3D' },      
    fairy: { primary: '#EE99AC', hover: '#C27385' },     
    fighting: { primary: '#C22E28', hover: '#821E1B' },  
    electric: { primary: '#F7D02C', hover: '#C8AB1D' }, 
    poison: { primary: '#A33EA1', hover: '#702A6F' },
    ground: { primary: '#E2BF65', hover: '#B7994E' },
    flying: { primary: '#A98FF3', hover: '#816AC7' },
    bug: { primary: '#A6B91A', hover: '#647012' },
    rock: { primary: '#B6A136', hover: '#7B6F23' },
    ghost: { primary: '#735797', hover: '#4B3762' },
    steel: { primary: '#B7B7CE', hover: '#8E8EAA' },
};

export async function loadCards() {
    cardsContainer.innerHTML = "";

    for (const eachPokemon of pokemonsArray) {
        const card = document.createElement("div");
        card.classList.add("card");

        // Determina a chave do tipo e obtém as cores
        const typeKey = eachPokemon.tipo_1.toLowerCase();
        // Fallback para 'normal' se o tipo não for encontrado no dicionário
        const colors = pokemonTypeColors[typeKey] || pokemonTypeColors.normal; 

        // Armazena o tipo da carta no dataset para fácil recuperação ao resetar
        card.dataset.type = typeKey;

        // Define a cor de fundo inicial da carta com base na cor primária do tipo
        card.style.backgroundColor = colors.primary;

        const topNav = document.createElement("div");
        topNav.classList.add("top-nav-card"); 

        const nameDisplay = document.createElement("div");
        nameDisplay.classList.add("pokemon-name-display");
        nameDisplay.textContent = eachPokemon.name; 
        topNav.appendChild(nameDisplay);

        const hpDisplay = document.createElement("div");
        hpDisplay.classList.add("pokemon-hp-icons");

        const hpPerHeart = 20; 
        const maxHearts = 5; 

        const fullHearts = Math.floor(eachPokemon.hp / hpPerHeart);
        const hasHalfHeart = (eachPokemon.hp % hpPerHeart) > 0;

        for (let i = 0; i < fullHearts; i++) {
            const heartImg = document.createElement("img");
            heartImg.src = `../assets/heart.png`; 
            heartImg.classList.add("hp-icon");
            hpDisplay.appendChild(heartImg);
        }

        if (hasHalfHeart) {
            const halfHeartImg = document.createElement("img");
            halfHeartImg.src = `../assets/half_heart.png`;
            halfHeartImg.classList.add("hp-icon");
            hpDisplay.appendChild(halfHeartImg);
        }

        const currentHeartsDisplayed = fullHearts + (hasHalfHeart ? 1 : 0);
        const emptyHearts = maxHearts - currentHeartsDisplayed;

        for (let i = 0; i < emptyHearts; i++) {
            const emptyHeartImg = document.createElement("img");
            emptyHeartImg.src = `../assets/empty_heart.png`;
            emptyHeartImg.classList.add("hp-icon");
            hpDisplay.appendChild(emptyHeartImg);
        }

        topNav.appendChild(hpDisplay);
        card.appendChild(topNav);

        const imgWrapper = document.createElement("div");
        imgWrapper.classList.add("pokemon-img-wrapper");
        imgWrapper.style.backgroundImage = `url('../assets/background.png')`;
        imgWrapper.style.backgroundSize = `cover`; 
        imgWrapper.style.backgroundPosition = `center`; 
        imgWrapper.style.backgroundRepeat = `no-repeat`;


        const img = document.createElement("img");
        img.src = `../assets/pokemons/${eachPokemon.id}.png`;
        img.classList.add("card-img");

        imgWrapper.appendChild(img);
        card.appendChild(imgWrapper);


        const contentDiv = document.createElement("div");
        contentDiv.classList.add("card-content");
        contentDiv.innerHTML = `
            <div class="types-container">
                <img class="type-img" src="../assets/types/${eachPokemon.tipo_1}.png" />
                ${eachPokemon.tipo_2 ? `<img class="type-img" src="../assets/types/${eachPokemon.tipo_2}.png" />` : ''}
            </div>
            Região: ${eachPokemon.regiao}<br>
            Nível: ${eachPokemon.nivel}<br>
            Hp: ${eachPokemon.hp}
        `;
        card.appendChild(contentDiv);

        // --- Event Listeners para Cores de Hover e Clique ---

        // Mouse Enter (Mouse entra na carta)
        card.addEventListener("mouseenter", () => {
            // Aplica a cor de hover SOMENTE se a carta NÃO estiver ativa (selecionada)
            if (!card.classList.contains("card-active")) {
                card.style.backgroundColor = colors.hover;
            }
        });

        // Mouse Leave (Mouse sai da carta)
        card.addEventListener("mouseleave", () => {
            // Volta para a cor primária SOMENTE se a carta NÃO estiver ativa (selecionada)
            if (!card.classList.contains("card-active")) {
                card.style.backgroundColor = colors.primary;
            }
        });

        // Evento de Clique
        card.addEventListener("click", () => {
            // PROBLEMA 1: Se a carta clicada já está ativa, o usuário quer desmarcá-la
            if (card.classList.contains("card-active")) {
                // Remove a seleção de TODAS as cartas
                const allCards = document.querySelectorAll(".card");
                allCards.forEach(c => {
                    c.classList.remove("card-active");
                    // Volta a cor de todas as cartas para a primária, usando o tipo armazenado no dataset
                    const cardTypeKey = c.dataset.type || 'normal';
                    const cardColors = pokemonTypeColors[cardTypeKey] || pokemonTypeColors.normal;
                    c.style.backgroundColor = cardColors.primary;
                });
                return; // Encerra a função, pois a deseleção foi concluída
            }

            // Se chegamos aqui, uma NOVA carta está sendo selecionada (ou uma diferente da anterior)
            const allCards = document.querySelectorAll(".card");
            allCards.forEach(c => {
                c.classList.remove("card-active");
                // Volta as cartas anteriormente ativas/hovered para a cor primária
                const cardTypeKey = c.dataset.type || 'normal';
                const cardColors = pokemonTypeColors[cardTypeKey] || pokemonTypeColors.normal;
                c.style.backgroundColor = cardColors.primary;
            });

            // Define a carta clicada como ativa
            card.classList.add("card-active");
            // Define sua cor de fundo para a cor de hover (ela permanecerá assim enquanto ativa)
            card.style.backgroundColor = colors.hover;
        });

        cardsContainer.appendChild(card);
    }
}