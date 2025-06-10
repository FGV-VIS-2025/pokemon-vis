import { getLocationsByRegionName } from "./dataManager.js";
import { locationElementMap } from "./mapManager.js";


const regionDisplay = document.getElementsByClassName("region-screen")[0];
const locationDisplay = document.getElementsByClassName("location-screen")[0];
const rightButtonRegion = document.getElementsByClassName("right-button")[0];
const leftButtonRegion = document.getElementsByClassName("left-button")[0];
const rightButton = document.getElementsByClassName("right-button")[1];
const leftButton = document.getElementsByClassName("left-button")[1];
const mapRealContainer = document.getElementsByClassName("map-left-screen")[0];

// Variáveis globais para controle de localização
let i = 0;
let listOfLocations = await getLocationsByRegionName(regionDisplay.textContent.trim());
locationDisplay.textContent = listOfLocations[0].location_name;

// Event listener para quando uma localização é selecionada no mapa
mapRealContainer.addEventListener('locationSelected', async (event) => {
    const { locationId, title } = event.detail;

    // Atualiza a lista de localizações da região atual
    listOfLocations = await getLocationsByRegionName(regionDisplay.textContent.trim());
    const foundIndex = listOfLocations.findIndex(loc => loc.location_id === locationId);

    if (foundIndex !== -1) {
        i = foundIndex;
        locationDisplay.textContent = listOfLocations[i].location_name;

        // Remove animação de todos os elementos anteriores
        locationElementMap.forEach(el => {
            el.style.animation = "";
        });

        // Aplica animação ao elemento selecionado
        const el = locationElementMap.get(locationId);
        if (el) {
            el.style.animation = "blink-border 1.5s infinite";
        }
    } else {
        console.warn(`Localização com ID ${locationId} não encontrada na lista da região atual.`);
    }
});

rightButtonRegion.addEventListener("click", async function () {
    i = 0;
    listOfLocations = await getLocationsByRegionName(regionDisplay.textContent.trim());
    locationDisplay.textContent = listOfLocations[0].location_name;

    const currentLocationId = listOfLocations[i].location_id;
    const el = locationElementMap.get(currentLocationId);
    if (el) {
        el.dispatchEvent(new Event("click"));
        // Garantir que a animação seja aplicada
        el.style.animation = "blink-border 1.5s infinite";
    }
});

leftButtonRegion.addEventListener("click", async function () {
    i = 0;
    listOfLocations = await getLocationsByRegionName(regionDisplay.textContent.trim());
    locationDisplay.textContent = listOfLocations[0].location_name;

    const currentLocationId = listOfLocations[i].location_id;
    const el = locationElementMap.get(currentLocationId);
    if (el) {
        el.dispatchEvent(new Event("click"));
        // Garantir que a animação seja aplicada
        el.style.animation = "blink-border 1.5s infinite";
    }
});

rightButton.addEventListener("click", function () {
    if (i < listOfLocations.length - 1) {
        i += 1;
    } else {
        i = 0;
    }
    locationDisplay.textContent = listOfLocations[i].location_name;

    const currentLocationId = listOfLocations[i].location_id;
    const el = locationElementMap.get(currentLocationId);
    if (el) {
        el.dispatchEvent(new Event("click"));
        // Garantir que a animação seja aplicada
        el.style.animation = "blink-border 1.5s infinite";
    }
});

leftButton.addEventListener("click", function () {
    if (i > 0) {
        i -= 1;
    } else {
        i = listOfLocations.length - 1;
    }
    locationDisplay.textContent = listOfLocations[i].location_name;

    const currentLocationId = listOfLocations[i].location_id;
    const el = locationElementMap.get(currentLocationId);
    if (el) {
        el.dispatchEvent(new Event("click"));
        // Garantir que a animação seja aplicada
        el.style.animation = "blink-border 1.5s infinite";
    }
});
