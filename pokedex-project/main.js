import { getLocationIdByName, getLocationAreaByLocation, getPokemonsByMultipleLocationAreas } from "./dataManager.js";
import { loadCards } from "./cardsPokedex.js";

const cardsContainer = document.getElementsByClassName("cards-display")[0];

window.onbeforeunload = function () {
    window.scrollTo(0, 0);
    cardsContainer.scrollTo({
        left: 0,
        top: 0,
        behavior: "smooth"
    });
};

// Primeiras Cards a Aparecer na Página
const locationId = await getLocationIdByName("Celadon City")
const locationsAreaArray = await getLocationAreaByLocation(locationId);
const pokemonsArray = await getPokemonsByMultipleLocationAreas(locationsAreaArray, "Kanto");
loadCards(pokemonsArray);