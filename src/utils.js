import { getRegions } from "./data.js";

export async function loadRegions() {

  const regionsArray = await getRegions();
  const regionsSelect = document.getElementById("regions-select");

  for (const cadaRegiao of regionsArray) {
    
    // only names in english
    if (cadaRegiao.local_lan_id == 9){
        const option = document.createElement("option");
        option.value = cadaRegiao.region_id;
        option.textContent = cadaRegiao.name;
        regionsSelect.appendChild(option);
    }
  }

  return regionsArray;
}
