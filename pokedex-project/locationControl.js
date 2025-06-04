import { getLocationsByRegionName } from "./dataManager.js";

const regionDisplay = document.getElementsByClassName("region-screen")[0];
const locationDisplay = document.getElementsByClassName("location-screen")[0];
const rightButtonRegion = document.getElementsByClassName("right-button")[0];
const leftButtonRegion = document.getElementsByClassName("left-button")[0];
const rightButton = document.getElementsByClassName("right-button")[1];
const leftButton = document.getElementsByClassName("left-button")[1];

// SINCRONIA ENTRE REGION-SELECT E O LOCATION-SELECT
let i = 0;

let listOfLocations = await getLocationsByRegionName(regionDisplay.textContent.trim());
locationDisplay.textContent = listOfLocations[0].location_name;

rightButtonRegion.addEventListener("click", async function () {
    i = 0;
    listOfLocations = await getLocationsByRegionName(regionDisplay.textContent.trim());
    locationDisplay.textContent = listOfLocations[0].location_name;
});

leftButtonRegion.addEventListener("click", async function () {
    i = 0;
    listOfLocations = await getLocationsByRegionName(regionDisplay.textContent.trim());
    locationDisplay.textContent = listOfLocations[0].location_name;
});

rightButton.addEventListener("click", function () {
    if (i < listOfLocations.length - 1) {
        i += 1;
    } else {
        i = 0;
    }
    locationDisplay.textContent = listOfLocations[i].location_name;
});

leftButton.addEventListener("click", function () {
    if (i > 0) {
        i -= 1;
    } else {
        i = listOfLocations.length - 1;
    }
    locationDisplay.textContent = listOfLocations[i].location_name;
});
