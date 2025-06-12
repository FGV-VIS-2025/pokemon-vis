import { getLocationsByRegionName } from "./dataManager.js";
import { buildMap, locationElementMap } from "./mapManager.js";

const regionDisplay = document.getElementsByClassName("region-screen")[0];
const rightButtons = document.getElementsByClassName("right-button")[0];
const leftButtons = document.getElementsByClassName("left-button")[0];
const mapImage = document.getElementById("map-img");

let i = 0;

const listOfRegions = ["Kanto", "Johto", "Hoenn", "Sinnoh", "Unova", "Kalos"];

// Função para disparar evento de mudança de região
function dispatchRegionChangeEvent(regionName) {
    const event = new CustomEvent('regionChanged', {
        detail: { regionName, source: 'region_control' }
    });
    document.dispatchEvent(event);
}

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
    // Adicionar feedback visual
    rightButtons.style.transform = "scale(0.95)";
    setTimeout(() => {
        rightButtons.style.transform = "scale(1)";
    }, 100);

    if (i < listOfRegions.length - 1) {
        i += 1;
    } else {
        i = 0;
    }

    // Atualizar display da região
    regionDisplay.textContent = listOfRegions[i];
    mapImage.src = `../assets/maps/${listOfRegions[i]}.png`;

    // Selecionar primeira localização da nova região
    selectFirstLocation(listOfRegions[i]);

    // Disparar evento para outras partes do sistema
    dispatchRegionChangeEvent(listOfRegions[i]);

    console.log(`🎮 Região alterada para: ${listOfRegions[i]}`);
});

leftButtons.addEventListener("click", function () {
    // Adicionar feedback visual
    leftButtons.style.transform = "scale(0.95)";
    setTimeout(() => {
        leftButtons.style.transform = "scale(1)";
    }, 100);

    if (i > 0) {
        i -= 1;
    } else {
        i = listOfRegions.length - 1;
    }

    // Atualizar display da região
    regionDisplay.textContent = listOfRegions[i];
    mapImage.src = `../assets/maps/${listOfRegions[i]}.png`;

    // Selecionar primeira localização da nova região
    selectFirstLocation(listOfRegions[i]);

    // Disparar evento para outras partes do sistema
    dispatchRegionChangeEvent(listOfRegions[i]);

    console.log(`🎮 Região alterada para: ${listOfRegions[i]}`);
});