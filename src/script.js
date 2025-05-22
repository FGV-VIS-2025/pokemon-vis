import { loadRegions, loadCards } from "./utils.js";
import { getRoutesByRegionId } from "./data.js";

const regionsSelect = document.getElementById("regions-select");
const regionButton = document.getElementById("region-screen");
const routeButton = document.getElementById("route-screen");
const pokemonButton = document.getElementById("pokemon-screen");
const buttons = [pokemonButton, routeButton, regionButton];

const regionsArray = await loadRegions();
loadCards();

let selectedRegion = {
  id: regionsSelect.value,
  name: regionsSelect.options[regionsSelect.selectedIndex].textContent
};

regionsSelect.addEventListener("change", async (event) => {
  selectedRegion.id = regionsSelect.value;
  selectedRegion.name = regionsSelect.options[regionsSelect.selectedIndex].textContent;
  const routesArray = await getRoutesByRegionId(selectedRegion.id);
});

regionButton.addEventListener("click", (event) => {
    buttons.forEach(btn => btn.classList.remove("active"));
    regionButton.classList.add("active");
});

routeButton.addEventListener("click", (event) => {
    buttons.forEach(btn => btn.classList.remove("active"));
    routeButton.classList.add("active");
});

pokemonButton.addEventListener("click", (event) => {
    buttons.forEach(btn => btn.classList.remove("active"));
    pokemonButton.classList.add("active");
});