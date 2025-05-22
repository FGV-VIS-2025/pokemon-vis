import { loadRegions, loadCards, changeContent } from "./utils.js";
import { getLocationsByRegionId, getLocationAreaByLocation } from "./data.js";

const regionsSelect = document.getElementById("regions-select");
const regionButton = document.getElementById("region-screen");
const routeButton = document.getElementById("route-screen");
const pokemonButton = document.getElementById("pokemon-screen");

const buttons = [pokemonButton, routeButton, regionButton];

// construção da página inicial
const regionsArray = await loadRegions();
loadCards();
changeContent(regionButton);
let selectedRegion = {id: regionsSelect.value, name: regionsSelect.options[regionsSelect.selectedIndex].textContent};
let locationsArray = await getLocationsByRegionId(selectedRegion.id);
let selectedLocation = locationsArray[0];
let locationsAreaArray = await getLocationAreaByLocation(selectedLocation.location_id);

// construção da página dinamicamente
regionsSelect.addEventListener("change", async (event) => {
  selectedRegion.id = regionsSelect.value;
  selectedRegion.name = regionsSelect.options[regionsSelect.selectedIndex].textContent;
  locationsArray = await getLocationsByRegionId(selectedRegion.id);
  // tô usando a primeira pq não temos um filtro de location ainda
  selectedLocation = locationsArray[0];
  locationsAreaArray = await getLocationAreaByLocation(selectedLocation.location_id);
});

regionButton.addEventListener("click", (event) => {
    buttons.forEach(btn => btn.classList.remove("active"));
    regionButton.classList.add("active");
    changeContent(regionButton);
});

routeButton.addEventListener("click", (event) => {
    buttons.forEach(btn => btn.classList.remove("active"));
    routeButton.classList.add("active");
    changeContent(routeButton);
});

pokemonButton.addEventListener("click", (event) => {
    buttons.forEach(btn => btn.classList.remove("active"));
    pokemonButton.classList.add("active");
    changeContent(pokemonButton);
});