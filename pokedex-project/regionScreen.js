import { renderBarChartByRegion } from "./barchart.js";
import { updateTypeChordByRegion } from "./types.js";

const contentScreen = document.getElementsByClassName("content-screen")[0];

export function createRegionScreen(id_region = 3) {
    contentScreen.scrollTo(0, 0);
    contentScreen.innerHTML = '';
    contentScreen.style.display = 'flex';
    contentScreen.style.flexDirection = 'column';
    contentScreen.style.justifyContent = 'flex-start';
    contentScreen.style.alignItems = 'center';
    contentScreen.style.gap = "50px";
    contentScreen.style.padding = "50px 0";

    // Container para as duas divs superiores (lado a lado)
    const topContainer = document.createElement('div');
    topContainer.style.display = 'flex';
    topContainer.style.width = '100%';
    topContainer.style.justifyContent = 'center';
    topContainer.style.gap = '20px';
    topContainer.style.marginBottom = '50px';

    // Container da esquerda para o gráfico chord
    const leftChordContainer = document.createElement('div');
    leftChordContainer.id = 'region-chart-container';
    leftChordContainer.style.width = '48%';
    leftChordContainer.style.aspectRatio = '1 / 1';
    leftChordContainer.style.display = 'flex';
    leftChordContainer.style.justifyContent = 'center';
    leftChordContainer.style.alignItems = 'center';
    leftChordContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
    leftChordContainer.style.borderRadius = '10px';

    // Container da direita (vazio por enquanto)
    const rightContainer = document.createElement('div');
    rightContainer.id = 'right-region-container';
    rightContainer.style.width = '48%';
    rightContainer.style.aspectRatio = '1 / 1';
    rightContainer.style.display = 'flex';
    rightContainer.style.justifyContent = 'center';
    rightContainer.style.alignItems = 'center';
    rightContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
    rightContainer.style.borderRadius = '10px';

    // Container inferior para o gráfico de barras
    const barChartContainer = document.createElement('div');
    barChartContainer.id = 'bar-chart-container';
    barChartContainer.style.width = '98%';
    barChartContainer.style.height = '600px';
    barChartContainer.style.display = 'flex';
    barChartContainer.style.justifyContent = 'center';
    barChartContainer.style.alignItems = 'center';
    barChartContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
    barChartContainer.style.borderRadius = '10px';
    barChartContainer.style.marginBottom = '50px';

    // Adiciona os containers superiores ao topContainer
    topContainer.appendChild(leftChordContainer);
    topContainer.appendChild(rightContainer);

    // Adiciona os containers ao contentScreen
    contentScreen.appendChild(topContainer);
    contentScreen.appendChild(barChartContainer);

    // Chama os renderizadores passando os ids dos containers correspondentes
    updateTypeChordByRegion(id_region);          // irá desenhar no #region-chart-container
    renderBarChartByRegion(id_region);            // irá desenhar no #bar-chart-container
}
