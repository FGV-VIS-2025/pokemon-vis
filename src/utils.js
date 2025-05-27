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
        { id: 1001, name: "Jigglypuff", tipo_1: "normal", tipo_2: "fairy", regiao: "Kanto", nivel: 15, hp: 120 },
        { id: 10001, name: "Meowth", tipo_1: "normal", tipo_2: "", regiao: "Kanto", nivel: 17, hp: 70 },
        { id: 10002, name: "Psyduck", tipo_1: "water", tipo_2: "", regiao: "Kanto", nivel: 21, hp: 88 },
        { id: 10003, name: "Machop", tipo_1: "fighting", tipo_2: "", regiao: "Kanto", nivel: 25, hp: 110 },
        { id: 10004, name: "Geodude", tipo_1: "rock", tipo_2: "ground", regiao: "Kanto", nivel: 23, hp: 92 },
        { id: 10005, name: "Gengar", tipo_1: "ghost", tipo_2: "poison", regiao: "Kanto", nivel: 30, hp: 130 },
        { id: 10006, name: "Onix", tipo_1: "rock", tipo_2: "ground", regiao: "Kanto", nivel: 28, hp: 150 },
        { id: 10007, name: "Magikarp", tipo_1: "water", tipo_2: "", regiao: "Kanto", nivel: 10, hp: 50 },
        { id: 10008, name: "Eevee", tipo_1: "normal", tipo_2: "", regiao: "Kanto", nivel: 16, hp: 75 },
        { id: 10009, name: "Snorlax", tipo_1: "normal", tipo_2: "", regiao: "Kanto", nivel: 35, hp: 200 },
        { id: 10010, name: "Dratini", tipo_1: "dragon", tipo_2: "", regiao: "Kanto", nivel: 26, hp: 98 },
        { id: 10011, name: "Mewtwo", tipo_1: "psychic", tipo_2: "", regiao: "Kanto", nivel: 50, hp: 250 },
        { id: 10012, name: "Chikorita", tipo_1: "grass", tipo_2: "", regiao: "Johto", nivel: 20, hp: 95 },
        { id: 10013, name: "Cyndaquil", tipo_1: "fire", tipo_2: "", regiao: "Johto", nivel: 18, hp: 88 },
        { id: 10014, name: "Totodile", tipo_1: "water", tipo_2: "", regiao: "Johto", nivel: 19, hp: 92 },
        { id: 10016, name: "Mareep", tipo_1: "electric", tipo_2: "", regiao: "Johto", nivel: 17, hp: 80 },
        { id: 10017, name: "Sudowoodo", tipo_1: "rock", tipo_2: "", regiao: "Johto", nivel: 24, hp: 105 },
        { id: 10018, name: "Togepi", tipo_1: "fairy", tipo_2: "", regiao: "Johto", nivel: 15, hp: 60 },
        { id: 10019, name: "Murkrow", tipo_1: "dark", tipo_2: "flying", regiao: "Johto", nivel: 22, hp: 78 },
        { id: 10020, name: "Wobbuffet", tipo_1: "psychic", tipo_2: "", regiao: "Johto", nivel: 28, hp: 180 },
        { id: 10015, name: "Larvitar", tipo_1: "rock", tipo_2: "ground", regiao: "Johto", nivel: 27, hp: 90 },
        { id: 10021, name: "Ho-Oh", tipo_1: "fire", tipo_2: "flying", regiao: "Johto", nivel: 50, hp: 240 }];

export async function loadCards() {
    cardsContainer.innerHTML = ""; 

    for (const eachPokemon of pokemonsArray) {
        const card = document.createElement("div");
        card.classList.add("card");

        const img = document.createElement("img");
        img.src = `../assets/pokemons/${eachPokemon.id}.png`;
        img.classList.add("card-img");
        card.appendChild(img);

        const contentDiv = document.createElement("div");
        contentDiv.classList.add("card-content");
        contentDiv.innerHTML = `
            <div class="types-container">
                <img class="type-img" src="../assets/types/${eachPokemon.tipo_1}.png" />
                ${eachPokemon.tipo_2 ? `<img class="type-img" src="../assets/types/${eachPokemon.tipo_2}.png" />` : ''}
            </div>
            Nome: ${eachPokemon.name}<br>
            Região: ${eachPokemon.regiao}<br>
            Nível: ${eachPokemon.nivel}<br>
            Hp: ${eachPokemon.hp}
        `;
        card.appendChild(contentDiv);

        card.addEventListener("click", () => {
            const allCards = document.querySelectorAll(".card");
            allCards.forEach(c => c.classList.remove("card-active"));
            card.classList.add("card-active");
        });

        cardsContainer.appendChild(card);
    }
}
