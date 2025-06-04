import { updateTypeChordByRegion } from "./types.js";
import { renderBarChartByRegion } from "./barchart.js";

const contentScreen = document.getElementsByClassName("content-screen")[0];

export function createRegionScreen(id_region = 3) {

    console.log(id_region);
    contentScreen.innerHTML = '';
    contentScreen.style.gap = "100px";
    contentScreen.style.display = 'flex';
    contentScreen.style.justifyContent = 'center';
    contentScreen.style.alignItems = 'center';
    contentScreen.style.flexDirection = 'column';

    // Container do gráfico chord
    const chordContainer = document.createElement('div');
    chordContainer.id = 'region-chart-container';
    chordContainer.style.width = '100%';
    chordContainer.style.height = '1200px';
    chordContainer.style.margin = 'auto';
    chordContainer.style.display = 'flex';
    chordContainer.style.marginTop = '700px';
    chordContainer.style.justifyContent = 'center';
    chordContainer.style.alignItems = 'center';

    // Container do gráfico de barras (abaixo)
    const barChartContainer = document.createElement('div');
    barChartContainer.id = 'bar-chart-container';
    barChartContainer.style.width = '100%';
    barChartContainer.style.height = '800px';
    barChartContainer.style.margin = 'auto';
    barChartContainer.style.display = 'flex';
    barChartContainer.style.justifyContent = 'center';
    barChartContainer.style.alignItems = 'center';
    barChartContainer.style.marginBottom = '100px';


    // Adiciona os containers no contentScreen
    contentScreen.appendChild(chordContainer);
    contentScreen.appendChild(barChartContainer);

    // Chama os renderizadores passando os ids dos containers correspondentes
    updateTypeChordByRegion(id_region);          // irá desenhar no #region-chart-container
    renderBarChartByRegion(id_region);            // irá desenhar no #bar-chart-container
}
