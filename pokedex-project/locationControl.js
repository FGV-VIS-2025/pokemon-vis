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

// Função para disparar evento de mudança de localização
function dispatchLocationChangeEvent(locationName) {
    const event = new CustomEvent('locationChanged', {
        detail: { locationName, source: 'location_control' }
    });
    document.dispatchEvent(event);
}

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
    // Adicionar feedback visual
    rightButton.style.transform = "scale(0.95)";
    setTimeout(() => {
        rightButton.style.transform = "scale(1)";
    }, 100);

    if (i < listOfLocations.length - 1) {
        i += 1;
    } else {
        i = 0;
    }

    // Atualizar display da localização
    locationDisplay.textContent = listOfLocations[i].location_name;

    // Atualizar elemento no mapa
    const currentLocationId = listOfLocations[i].location_id;
    const el = locationElementMap.get(currentLocationId);
    if (el) {
        // Remover animação de todos os elementos
        locationElementMap.forEach(element => {
            element.style.animation = "";
        });

        // Aplicar clique e animação ao novo elemento
        el.dispatchEvent(new Event("click"));
        el.style.animation = "blink-border 1.5s infinite";
    }

    // Disparar evento para outras partes do sistema
    dispatchLocationChangeEvent(listOfLocations[i].location_name);

    console.log(`📍 Localização alterada para: ${listOfLocations[i].location_name}`);
});

leftButton.addEventListener("click", function () {
    // Adicionar feedback visual
    leftButton.style.transform = "scale(0.95)";
    setTimeout(() => {
        leftButton.style.transform = "scale(1)";
    }, 100);

    if (i > 0) {
        i -= 1;
    } else {
        i = listOfLocations.length - 1;
    }

    // Atualizar display da localização
    locationDisplay.textContent = listOfLocations[i].location_name;

    // Atualizar elemento no mapa
    const currentLocationId = listOfLocations[i].location_id;
    const el = locationElementMap.get(currentLocationId);
    if (el) {
        // Remover animação de todos os elementos
        locationElementMap.forEach(element => {
            element.style.animation = "";
        });

        // Aplicar clique e animação ao novo elemento
        el.dispatchEvent(new Event("click"));
        el.style.animation = "blink-border 1.5s infinite";
    }

    // Disparar evento para outras partes do sistema
    dispatchLocationChangeEvent(listOfLocations[i].location_name);

    console.log(`📍 Localização alterada para: ${listOfLocations[i].location_name}`);
});
