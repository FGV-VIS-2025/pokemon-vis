import { loadRegions, changeContent, buildMap } from "./utils.js";
import { loadCards } from "./pokemonScreen.js";
import { getLocationsByRegionId, getLocationAreaByLocation, getPokemonsIdByLocationAreaId } from "./data.js";

const regionsSelect = document.getElementById("regions-select");
const regionButton = document.getElementById("region-screen");
const routeButton = document.getElementById("location-screen");
const pokemonButton = document.getElementById("pokemon-screen");

const buttons = [pokemonButton, routeButton, regionButton];

// Declare these variables globally 
let selectedRegion;
let locationsArray;
let selectedLocation;
let locationsAreaArray;
let selectedLocationArea;
let pokemonsArray; 

// construção da página inicial
(async () => { 
    const regions = await loadRegions();
    selectedRegion = {id: regionsSelect.value, name: regionsSelect.options[regionsSelect.selectedIndex].textContent};

    changeContent(regionButton);
    buildMap(selectedRegion);

    locationsArray = await getLocationsByRegionId(selectedRegion.id);
    selectedLocation = locationsArray[Math.floor(Math.random() * locationsArray.length)];
    locationsAreaArray = await getLocationAreaByLocation(selectedLocation.location_id);
    selectedLocationArea = locationsAreaArray[Math.floor(Math.random() * locationsAreaArray.length)].locationAreaId;
    pokemonsArray = await getPokemonsIdByLocationAreaId(selectedLocationArea);
    loadCards(pokemonsArray);
})();

// construção da página dinamicamente
regionsSelect.addEventListener("change", async (event) => {
  selectedRegion.id = regionsSelect.value;
  selectedRegion.name = regionsSelect.options[regionsSelect.selectedIndex].textContent;
  buildMap(selectedRegion);

  locationsArray = await getLocationsByRegionId(selectedRegion.id);
  selectedLocation = locationsArray[Math.floor(Math.random() * locationsArray.length)];
  locationsAreaArray = await getLocationAreaByLocation(selectedLocation.location_id);
  selectedLocationArea = locationsAreaArray[Math.floor(Math.random() * locationsAreaArray.length)].locationAreaId;
  pokemonsArray = await getPokemonsIdByLocationAreaId(selectedLocationArea);
  loadCards(pokemonsArray);
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