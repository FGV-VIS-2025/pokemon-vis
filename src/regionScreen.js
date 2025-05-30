import { updateTypeChordByRegion } from "./types.js";

const contentScreen = document.getElementById("content-container");

export function createRegionScreen(id_region) {
    contentScreen.innerHTML = '';
    contentScreen.style.backgroundColor = 'black';

    const chartContainer = document.createElement('div');
    chartContainer.id = 'region-chart-container';
    chartContainer.style.width = '100%';
    chartContainer.style.height = '600px';  // pode ajustar conforme precisar
    chartContainer.style.margin = 'auto';

    contentScreen.appendChild(chartContainer);

    // Supondo que você exporte da types.js uma função chamada renderRegionChart que
    // recebe o id do container onde desenhar o gráfico:
    console.log(id_region);
    updateTypeChordByRegion(id_region);
}
