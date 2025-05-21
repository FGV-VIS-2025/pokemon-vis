import { loadRegions } from "./utils.js";

const regionsSelect = document.getElementById("regions-select");

const regionsArray = await loadRegions();
let selectedRegion = {
  id: regionsSelect.value,
  name: regionsSelect.options[regionsSelect.selectedIndex].textContent
};

regionsSelect.addEventListener("change", (event) => {
  selectedRegion.id = regionsSelect.value;
  selectedRegion.name = regionsSelect.options[regionsSelect.selectedIndex].textContent;
});
