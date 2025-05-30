// Importações
import { getRegions } from "./data.js";
import { createPokemonScreen, editPokemonsCard } from "./pokemonScreen.js"
import { createRegionScreen } from "./regionScreen.js"; 

// Elementos do DOM
const regionsSelect = document.getElementById("regions-select");
const contentScreen = document.getElementById("content-container");
const mapRealContainer = document.getElementById("map-real-container");

// Variáveis globais
const regions = ["Kanto", "Johto", "Hoenn", "Sinnoh", "Unova"];
const colors = {
  "region-screen": "#3EDB2A",
  "location-screen": "#2AD2DB",
  "pokemon-screen": "#A11F62"
};

// Funções Principais
export async function loadRegions() {
    const regionsArray = await getRegions();

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

export function buildMap(selectedRegion) {
    mapRealContainer.innerHTML = "";
    const img = document.createElement("img");
    img.src = `../assets/maps/${selectedRegion.name}.png`;
    mapRealContainer.appendChild(img);
}

export function changeContent(selectedButton) {
    if (selectedButton.id === "pokemon-screen") {
        createPokemonScreen();
        editPokemonsCard();
    } else if (selectedButton.id === "region-screen"){
        createRegionScreen(regionsSelect.value);
    } else {
        contentScreen.innerHTML = ``;
        contentScreen.style.backgroundColor = colors[selectedButton.id];
    }
}