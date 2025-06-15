import { getLocationIdByName, getRegionIdByName } from "./dataManager.js";
import { createLocationScreen } from "./locationScreen.js";
import { buildMap } from "./mapManager.js";
import { createPokemonScreen, editPokemonsCard } from "./pokemonScreen.js";
import { createRegionScreen } from "./regionScreen.js";
import { screenStateManager } from "./screenStateManager.js";

const regionButton = document.getElementsByClassName("region-button")[0];
const locationButton = document.getElementsByClassName("location-button")[0];
const pokemonButton = document.getElementsByClassName("pokemons-button")[0];
const regionDisplay = document.getElementsByClassName("region-screen")[0];
const locationDisplay = document.getElementsByClassName("location-screen")[0];

async function loadMainContent(key) {
    try {
        if (key == 1) {
            createRegionScreen(await getRegionIdByName(regionDisplay.textContent.trim()));
        } else if (key == 2) {
            createLocationScreen(await getLocationIdByName(locationDisplay.textContent.trim()));
        } else if (key == 3) {
            await createPokemonScreen();
            setTimeout(() => {
                editPokemonsCard();
            }, 10);
        }
    } catch (error) {
        console.error("Erro ao carregar conteúdo:", error);
    }
}

// Função para garantir que o mapa esteja carregado para a região atual
async function ensureMapIsLoaded() {
    const currentRegionName = regionDisplay.textContent.trim();
    await buildMap({ name: currentRegionName });
}

// Inicializar o mapa e carregar a region screen por padrão quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar um momento para garantir que todos os elementos estejam carregados
    setTimeout(async () => {
        await ensureMapIsLoaded();
        
        screenStateManager.setActiveScreen('region');
        
        await loadMainContent(1);
    }, 500);
});

// Event listeners para os botões principais com integração ao estado
regionButton.addEventListener("click", async function () {
    screenStateManager.setActiveScreen('region');

    // Garantir que o mapa esteja carregado para a região atual
    await ensureMapIsLoaded();

    loadMainContent(1);
    setTimeout(function () { document.getElementsByClassName("content-container")[0].scrollIntoView({ behavior: "smooth" }) }, 150);
});

locationButton.addEventListener("click", async function () {
    screenStateManager.setActiveScreen('location');

    // Garantir que o mapa esteja carregado para a região atual
    await ensureMapIsLoaded();

    loadMainContent(2);
    setTimeout(function () { document.getElementsByClassName("content-container")[0].scrollIntoView({ behavior: "smooth" }) }, 150);
});

pokemonButton.addEventListener("click", async function () {
    screenStateManager.setActiveScreen('pokemon');

    // Garantir que o mapa esteja carregado para a região atual
    await ensureMapIsLoaded();

    loadMainContent(3);
    setTimeout(function () { document.getElementsByClassName("content-container")[0].scrollIntoView({ behavior: "smooth" }) }, 150);
});

// Expor funções para debugging
window.forceUpdateActiveScreen = () => screenStateManager.forceUpdate();
window.getScreenStatus = () => screenStateManager.getStatus();