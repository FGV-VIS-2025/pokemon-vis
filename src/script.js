import { loadRegions, changeContent, buildMap } from "./utils.js";
import { loadCards } from "./pokemonScreen.js";
import { getLocationsByRegionId, getLocationAreaByLocation, getPokemonsByMultipleLocationAreas } from "./data.js";

const regionsSelect = document.getElementById("regions-select");
const regionButton = document.getElementById("region-screen");
const locationButton = document.getElementById("location-screen");
const pokemonButton = document.getElementById("pokemon-screen");
const mapRealContainer = document.getElementById("map-real-container");

const buttons = [pokemonButton, locationButton, regionButton];

// Declare these variables globally 
let selectedRegion;
let locationsArray;
let selectedLocation;
let locationsAreaArray;
let pokemonsArray; 

// construção da página inicial
(async () => { 
    const regions = await loadRegions();
    selectedRegion = {id: regionsSelect.value, name: regionsSelect.options[regionsSelect.selectedIndex].textContent};

    changeContent(regionButton);
    buildMap(selectedRegion);

    locationsArray = await getLocationsByRegionId(selectedRegion.id);

    // ao carregar ele garante que não vai sortear uma vazia
    while (!selectedLocation || locationsArray.length === 0) {
        if (locationsArray.length > 0) {
            selectedLocation = locationsArray[Math.floor(Math.random() * locationsArray.length)];
        }
    }

    locationsAreaArray = await getLocationAreaByLocation(selectedLocation.location_id);
    pokemonsArray = await getPokemonsByMultipleLocationAreas(locationsAreaArray);
    loadCards(pokemonsArray);

    if (regionButton.classList.contains("active")) {
        changeContent(regionButton, +selectedRegion.id);
    }

    if (locationButton.classList.contains("active")) {
        changeContent(locationButton, +selectedRegion.id, +selectedLocation.location_id);
    }
})();

// construção da página dinamicamente
regionsSelect.addEventListener("change", async (event) => {
    selectedRegion.id = regionsSelect.value;
    selectedRegion.name = regionsSelect.options[regionsSelect.selectedIndex].textContent;
    buildMap(selectedRegion);

    locationsArray = await getLocationsByRegionId(selectedRegion.id);

    // ao carregar ele garante que não vai sortear uma vazia
    while (!selectedLocation || locationsArray.length === 0) {
        if (locationsArray.length > 0) {
            selectedLocation = locationsArray[Math.floor(Math.random() * locationsArray.length)];
        }
    }

    locationsAreaArray = await getLocationAreaByLocation(selectedLocation.location_id);
    pokemonsArray = await getPokemonsByMultipleLocationAreas(locationsAreaArray);
    loadCards(pokemonsArray);

    if (regionButton.classList.contains("active")) {
        changeContent(regionButton, +selectedRegion.id);
    }

    if (locationButton.classList.contains("active")) {
        changeContent(locationButton, +selectedRegion.id, +selectedLocation.location_id);
    }
});

regionButton.addEventListener("click", (event) => {
    buttons.forEach(btn => btn.classList.remove("active"));
    regionButton.classList.add("active");
    changeContent(regionButton, +selectedRegion.id);
});

locationButton.addEventListener("click", (event) => {
    buttons.forEach(btn => btn.classList.remove("active"));
    locationButton.classList.add("active");
    changeContent(locationButton, +selectedRegion.id, +selectedLocation.location_id);
});

pokemonButton.addEventListener("click", (event) => {
    buttons.forEach(btn => btn.classList.remove("active"));
    pokemonButton.classList.add("active");
    changeContent(pokemonButton);
});

mapRealContainer.addEventListener('locationSelected', async (event) => {
    const { locationId, title } = event.detail;
    
    selectedLocation.location_id = locationId;
    locationsAreaArray = await getLocationAreaByLocation(selectedLocation.location_id);
    pokemonsArray = await getPokemonsByMultipleLocationAreas(locationsAreaArray);
    loadCards(pokemonsArray);

    if (locationButton.classList.contains("active")) {
        changeContent(locationButton, +selectedRegion.id, +selectedLocation.location_id);
    }
});