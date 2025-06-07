import { buildMap } from "./mapManager.js";

const regionDisplay = document.getElementsByClassName("region-screen")[0];
const rightButtons = document.getElementsByClassName("right-button")[0];
const leftButtons = document.getElementsByClassName("left-button")[0];
const mapImage = document.getElementById("map-img");

let i = 0;

const listOfRegions = ["Kanto", "Johto", "Hoenn", "Sinnoh", "Unova", "Kalos"];

rightButtons.addEventListener("click", function () {
    if (i < listOfRegions.length - 1){
        i+=1;
    } else {
        i = 0;
    }
    regionDisplay.textContent = listOfRegions[i];
    mapImage.src = `../assets/maps/${listOfRegions[i]}.png`
    buildMap({ name: listOfRegions[i] });
});

leftButtons.addEventListener("click", function () {
    if (i > 0){
        i -= 1;
    } else {
        i = listOfRegions.length - 1;
    }
    regionDisplay.textContent = listOfRegions[i];
    mapImage.src = `../assets/maps/${listOfRegions[i]}.png`
    buildMap({ name: listOfRegions[i] });
});