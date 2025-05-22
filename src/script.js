import { loadRegions, loadCards, changeContent } from "./utils.js";
import { getRoutesByRegionId } from "./data.js";

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

// construção da página dinamicamente
regionsSelect.addEventListener("change", async (event) => {
  selectedRegion.id = regionsSelect.value;
  selectedRegion.name = regionsSelect.options[regionsSelect.selectedIndex].textContent;
  const routesArray = await getRoutesByRegionId(selectedRegion.id);
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