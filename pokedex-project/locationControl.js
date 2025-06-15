import { resetPokemonCarousel } from "./cardsPokedex.js";
import { getAllLocationsPokemonCount, getLocationsByRegionName } from "./dataManager.js";
import { locationElementMap } from "./mapManager.js";

const regionDisplay = document.getElementsByClassName("region-screen")[0];
const locationDisplay = document.getElementsByClassName("location-screen")[0];
const rightButtonRegion = document.getElementsByClassName("right-button")[0];
const leftButtonRegion = document.getElementsByClassName("left-button")[0];
const rightButton = document.getElementsByClassName("right-button")[1];
const leftButton = document.getElementsByClassName("left-button")[1];
const mapRealContainer = document.getElementsByClassName("map-left-screen")[0];

let i = 0;
let listOfLocations = [];
let locationsWithPokemon = [];
let cachedRegionName = null;

async function getLocationsWithPokemon(regionName) {
    if (cachedRegionName === regionName && locationsWithPokemon.length > 0) {
        return locationsWithPokemon;
    }

    const [allLocations, pokemonCounts] = await Promise.all([
        getLocationsByRegionName(regionName),
        getAllLocationsPokemonCount(regionName)
    ]);

    const countMap = new Map(pokemonCounts.map(item => [item.locationId, item.count]));

    const filtered = allLocations.filter(location => {
        const count = countMap.get(location.location_id) || 0;
        return count > 0;
    });

    cachedRegionName = regionName;
    locationsWithPokemon = filtered;

    return filtered;
}

async function initializeLocationsList() {
    const regionName = regionDisplay.textContent.trim();
    const filtered = await getLocationsWithPokemon(regionName);
    listOfLocations = filtered;

    if (listOfLocations.length > 0) {
        if (i >= listOfLocations.length) {
            i = 0;
        }

        locationDisplay.textContent = listOfLocations[i].location_name;

        const currentLocationId = listOfLocations[i].location_id;
        const el = locationElementMap.get(currentLocationId);
        if (el) {
            locationElementMap.forEach(element => {
                element.style.animation = "";
            });

            setTimeout(() => {
                el.dispatchEvent(new Event("click"));
                el.style.animation = "blink-border 1.5s infinite";
            }, 100);
        }
    } else {
        locationDisplay.textContent = "Sem localizações";
        i = 0;
    }
}

async function resetToFirstLocation() {
    const regionName = regionDisplay.textContent.trim();
    const filtered = await getLocationsWithPokemon(regionName);
    listOfLocations = filtered;

    if (listOfLocations.length > 0) {
        i = 0;
        locationDisplay.textContent = listOfLocations[0].location_name;

        const firstLocationId = listOfLocations[0].location_id;
        const el = locationElementMap.get(firstLocationId);
        if (el) {
            locationElementMap.forEach(element => {
                element.style.animation = "";
            });

            setTimeout(() => {
                el.dispatchEvent(new Event("click"));
                el.style.animation = "blink-border 1.5s infinite";
            }, 100);
        }

        // Resetar carrossel de pokémons
        resetPokemonCarousel();
    }
}

// Inicializar ao carregar
initializeLocationsList();

document.addEventListener('regionChanged', async (event) => {
    const currentRegionName = regionDisplay.textContent.trim();
    if (cachedRegionName !== currentRegionName) {
        await resetToFirstLocation();

        if (listOfLocations.length > 0) {
            dispatchLocationChangeEvent(listOfLocations[0].location_name);
        }
    }
});

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

    // Apenas sincronizar o índice sem reinicializar a lista
    const foundIndex = listOfLocations.findIndex(loc => loc.location_id === locationId);

    if (foundIndex !== -1) {
        i = foundIndex; // Sincronizar índice com a localização selecionada
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

        // Resetar carrossel de pokémons
        resetPokemonCarousel();
    } else {
        console.warn(`Localização com ID ${locationId} não encontrada na lista de localizações com pokémon.`);
    }
});

rightButtonRegion.addEventListener("click", async function () {
    // Salvar região anterior para verificar se mudou
    const previousRegion = cachedRegionName;

    // Aguardar um momento para a região ser atualizada
    setTimeout(async () => {
        const currentRegionName = regionDisplay.textContent.trim();

        // Só resetar se a região realmente mudou
        if (previousRegion !== currentRegionName) {
            await resetToFirstLocation(); // Usar função específica para reset
        }
    }, 100);
});

leftButtonRegion.addEventListener("click", async function () {
    // Salvar região anterior para verificar se mudou
    const previousRegion = cachedRegionName;

    // Aguardar um momento para a região ser atualizada
    setTimeout(async () => {
        const currentRegionName = regionDisplay.textContent.trim();

        // Só resetar se a região realmente mudou
        if (previousRegion !== currentRegionName) {
            await resetToFirstLocation(); // Usar função específica para reset
        }
    }, 100);
});

rightButton.addEventListener("click", function () {
    if (listOfLocations.length === 0) {
        return;
    }

    rightButton.style.transform = "scale(0.95)";
    setTimeout(() => {
        rightButton.style.transform = "scale(1)";
    }, 100);

    if (i < listOfLocations.length - 1) {
        i += 1;
    } else {
        i = 0;
    }

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

    // Resetar carrossel de pokémons
    resetPokemonCarousel();

});

leftButton.addEventListener("click", function () {
    if (listOfLocations.length === 0) {
        return;
    }

    leftButton.style.transform = "scale(0.95)";
    setTimeout(() => {
        leftButton.style.transform = "scale(1)";
    }, 100);

    if (i > 0) {
        i -= 1;
    } else {
        i = listOfLocations.length - 1;
    }

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

    dispatchLocationChangeEvent(listOfLocations[i].location_name);

    resetPokemonCarousel();
});
