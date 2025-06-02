import { updateTypeChordByRegion } from "./types.js";
import { renderBarChartByRegion } from "./barchart.js";

const contentScreen = document.getElementById("content-container");

export function createRegionScreen(id_region) {
    contentScreen.innerHTML = '';
    contentScreen.style.backgroundColor = 'black';

    // Container do gráfico chord
    const chordContainer = document.createElement('div');
    chordContainer.id = 'region-chart-container';
    chordContainer.style.width = '100%';
    chordContainer.style.height = '600px';
    chordContainer.style.margin = 'auto';
    chordContainer.style.display = 'flex';
    chordContainer.style.justifyContent = 'center';
    chordContainer.style.alignItems = 'center';

    // Container do gráfico de barras (abaixo)
    const barChartContainer = document.createElement('div');
    barChartContainer.id = 'bar-chart-container';
    barChartContainer.style.width = '100%';
    barChartContainer.style.height = '600px';
    barChartContainer.style.margin = 'auto';
    barChartContainer.style.marginTop = '40px';
    barChartContainer.style.display = 'flex';
    barChartContainer.style.justifyContent = 'center';
    barChartContainer.style.alignItems = 'center';

    // Adiciona os containers no contentScreen
    contentScreen.appendChild(chordContainer);
    contentScreen.appendChild(barChartContainer);

    console.log(id_region);
    // Chama os renderizadores passando os ids dos containers correspondentes
    updateTypeChordByRegion(id_region);          // irá desenhar no #region-chart-container
    renderBarChartByRegion(id_region);            // irá desenhar no #bar-chart-container
}
