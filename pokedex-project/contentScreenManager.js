import { createRegionScreen } from "./regionScreen.js"
import { createLocationScreen } from "./locationScreen.js"
import { getRegionIdByName, getLocationIdByName } from "./dataManager.js";

const regionButton = document.getElementsByClassName("region-button")[0];
const locationButton = document.getElementsByClassName("location-button")[0];
const pokemonButton = document.getElementsByClassName("pokemons-button")[0];
const regionDisplay = document.getElementsByClassName("region-screen")[0];
const locationDisplay = document.getElementsByClassName("location-screen")[0];

regionButton.addEventListener("click", function () {
    loadMainContent(1);
    setTimeout(function () {document.getElementsByClassName("content-container")[0].scrollIntoView({ behavior: "smooth" })}, 150);
});

locationButton.addEventListener("click", function () {
    loadMainContent(2);
    setTimeout(function () {document.getElementsByClassName("content-container")[0].scrollIntoView({ behavior: "smooth" })}, 150);
});

pokemonButton.addEventListener("click", function () {
    loadMainContent(3);
    setTimeout(function () {document.getElementsByClassName("content-container")[0].scrollIntoView({ behavior: "smooth" })}, 150);
});

async function loadMainContent(key){
    if (key == 1){
        createRegionScreen(await getRegionIdByName(regionDisplay.textContent.trim()));
    } else if (key == 2) {
        createLocationScreen(await getLocationIdByName(locationDisplay.textContent.trim()));
    } else if (key == 3) {
        console.log("nada");
    } else {
        console.log("Falha ao criar a tela princial.")
    }
}