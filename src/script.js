import { loadRegions, loadCards } from "./utils.js";
import { getRoutesByRegionId } from "./data.js";

const regionsSelect = document.getElementById("regions-select");

const regionsArray = await loadRegions();
loadCards();

let selectedRegion = {
  id: regionsSelect.value,
  name: regionsSelect.options[regionsSelect.selectedIndex].textContent
};

regionsSelect.addEventListener("change", async (event) => {
  selectedRegion.id = regionsSelect.value;
  selectedRegion.name = regionsSelect.options[regionsSelect.selectedIndex].textContent;
  const routesArray = await getRoutesByRegionId(selectedRegion.id);
});
