import { getLocationsByRegionName } from "./dataManager.js";
import { locationElementMap } from "./mapManager.js";


const regionDisplay = document.getElementsByClassName("region-screen")[0];
const locationDisplay = document.getElementsByClassName("location-screen")[0];
const rightButtonRegion = document.getElementsByClassName("right-button")[0];
const leftButtonRegion = document.getElementsByClassName("left-button")[0];
const rightButton = document.getElementsByClassName("right-button")[1];
const leftButton = document.getElementsByClassName("left-button")[1];
const mapRealContainer = document.getElementsByClassName("map-left-screen")[0];

mapRealContainer.addEventListener('locationSelected', async (event) => {
    const { locationId, title } = event.detail;

    listOfLocations = await getLocationsByRegionName(regionDisplay.textContent.trim());
    const foundIndex = listOfLocations.findIndex(loc => loc.location_id === locationId);

    if (foundIndex !== -1) {
        i = foundIndex;
        locationDisplay.textContent = listOfLocations[i].location_name;
    } else {
        console.warn(`Localização com ID ${locationId} não encontrada na lista da região atual.`);
    }
});


// SINCRONIA ENTRE REGION-SELECT E O LOCATION-SELECT
let i = 0;

let listOfLocations = await getLocationsByRegionName(regionDisplay.textContent.trim());
locationDisplay.textContent = listOfLocations[0].location_name;

rightButtonRegion.addEventListener("click", async function () {
    i = 0;
    listOfLocations = await getLocationsByRegionName(regionDisplay.textContent.trim());
    locationDisplay.textContent = listOfLocations[0].location_name;

    const currentLocationId = listOfLocations[i].location_id;
    const el = locationElementMap.get(currentLocationId);
    if (el) el.dispatchEvent(new Event("click"));
});

leftButtonRegion.addEventListener("click", async function () {
    i = 0;
    listOfLocations = await getLocationsByRegionName(regionDisplay.textContent.trim());
    locationDisplay.textContent = listOfLocations[0].location_name;

    const currentLocationId = listOfLocations[i].location_id;
    const el = locationElementMap.get(currentLocationId);
    if (el) el.dispatchEvent(new Event("click"));
});

rightButton.addEventListener("click", function () {
    if (i < listOfLocations.length - 1) {
        i += 1;
    } else {
        i = 0;
    }
    locationDisplay.textContent = listOfLocations[i].location_name;

    const currentLocationId = listOfLocations[i].location_id;
    const el = locationElementMap.get(currentLocationId);
    if (el) el.dispatchEvent(new Event("click"));
});

leftButton.addEventListener("click", function () {
    if (i > 0) {
        i -= 1;
    } else {
        i = listOfLocations.length - 1;
    }
    locationDisplay.textContent = listOfLocations[i].location_name;

    const currentLocationId = listOfLocations[i].location_id;
    const el = locationElementMap.get(currentLocationId);
    if (el) el.dispatchEvent(new Event("click"));
});
