import { getLocationsByRegionName } from "./dataManager.js";
import { buildMap, locationElementMap } from "./mapManager.js";

const regionDisplay = document.getElementsByClassName("region-screen")[0];
const rightButtons = document.getElementsByClassName("right-button")[0];
const leftButtons = document.getElementsByClassName("left-button")[0];
const mapImage = document.getElementById("map-img");

let i = 0;

const listOfRegions = ["Kanto", "Johto", "Hoenn", "Sinnoh", "Unova", "Kalos"];

// Função auxiliar para selecionar a primeira localização após carregar o mapa
async function selectFirstLocation(regionName) {
    try {
        // Constrói o mapa e espera ele ser carregado completamente
        await buildMap({ name: regionName });

        // Obtém a lista de localizações da região
        const locations = await getLocationsByRegionName(regionName);

        if (locations && locations.length > 0) {
            // Pega o ID da primeira localização
            const firstLocationId = locations[0].location_id;

            // Aguarda um momento para garantir que o mapa esteja totalmente carregado
            setTimeout(() => {
                const el = locationElementMap.get(firstLocationId);
                if (el) {
                    // Selecionar a localização
                    el.dispatchEvent(new Event("click"));
                    
                    // Garantir que a animação seja aplicada
                    el.style.animation = "blink-border 1.5s infinite";
                }
            }, 500);
        }
    } catch (error) {
        console.error("Erro ao selecionar a primeira localização:", error);
    }
}

// Seleciona a primeira localização para a região inicial ao carregar a página
selectFirstLocation("Kanto");

rightButtons.addEventListener("click", function () {
    if (i < listOfRegions.length - 1) {
        i += 1;
    } else {
        i = 0;
    }
    regionDisplay.textContent = listOfRegions[i];
    mapImage.src = `../assets/maps/${listOfRegions[i]}.png`;
    selectFirstLocation(listOfRegions[i]);
});

leftButtons.addEventListener("click", function () {
    if (i > 0) {
        i -= 1;
    } else {
        i = listOfRegions.length - 1;
    }
    regionDisplay.textContent = listOfRegions[i];
    mapImage.src = `../assets/maps/${listOfRegions[i]}.png`;
    selectFirstLocation(listOfRegions[i]);
});