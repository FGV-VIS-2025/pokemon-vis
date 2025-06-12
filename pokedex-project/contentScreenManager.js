import { getLocationIdByName, getRegionIdByName } from "./dataManager.js";
import { createLocationScreen } from "./locationScreen.js";
import { createPokemonScreen, editPokemonsCard } from "./pokemonScreen.js";
import { createRegionScreen } from "./regionScreen.js";
import { screenStateManager } from "./screenStateManager.js";

const regionButton = document.getElementsByClassName("region-button")[0];
const locationButton = document.getElementsByClassName("location-button")[0];
const pokemonButton = document.getElementsByClassName("pokemons-button")[0];
const regionDisplay = document.getElementsByClassName("region-screen")[0];
const locationDisplay = document.getElementsByClassName("location-screen")[0];

// Event listeners para os botões principais com integração ao estado
regionButton.addEventListener("click", function () {
    screenStateManager.setActiveScreen('region');
    loadMainContent(1);
    setTimeout(function () { document.getElementsByClassName("content-container")[0].scrollIntoView({ behavior: "smooth" }) }, 150);
});

locationButton.addEventListener("click", function () {
    screenStateManager.setActiveScreen('location');
    loadMainContent(2);
    setTimeout(function () { document.getElementsByClassName("content-container")[0].scrollIntoView({ behavior: "smooth" }) }, 150);
});

pokemonButton.addEventListener("click", function () {
    screenStateManager.setActiveScreen('pokemon');
    loadMainContent(3);
    setTimeout(function () { document.getElementsByClassName("content-container")[0].scrollIntoView({ behavior: "smooth" }) }, 150);
});

// Função principal para carregar conteúdo
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

// Expor funções para debugging
window.forceUpdateActiveScreen = () => screenStateManager.forceUpdate();
window.getScreenStatus = () => screenStateManager.getStatus();