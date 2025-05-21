import { getRegions } from "./data.js";

const regionsArray = await getRegions();
const regionsSelect = document.getElementById("regions-select");
const cardsContainer = document.getElementById("cards-container");

export async function loadRegions() {
  for (const eachRegion of regionsArray) {

    // only names in english
    if (eachRegion.local_lan_id == 9){
        const option = document.createElement("option");
        option.value = eachRegion.region_id;
        option.textContent = eachRegion.name;
        regionsSelect.appendChild(option);
    }
  }

  return regionsArray;
}

const pokemonsArray = ["Pikachu", "Balinha", "Zézinho", "Huguinho", "Yuri Saporito", "Camacho", "Thiago", "Pinho", "Flávio"]

export async function loadCards() {

    for (const eachPokemon of pokemonsArray) {
        const card = document.createElement("div");
        card.classList.add("card");

        const p = document.createElement("p");
        p.textContent = eachPokemon;

        card.appendChild(p);
        cardsContainer.appendChild(card);
    }
}