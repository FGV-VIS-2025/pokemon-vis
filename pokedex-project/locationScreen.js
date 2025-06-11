import { renderStatBarChart } from "./statsBarChart.js";
import { updateTypeChordByLocation } from "./types.js";

const contentScreen = document.getElementsByClassName("content-screen")[0];

function createChordContainer() {
    const leftChordContainer = document.createElement('div');
    leftChordContainer.id = 'location-chart-container';
    leftChordContainer.style.width = '48%';
    leftChordContainer.style.aspectRatio = '1 / 1';
    leftChordContainer.style.display = 'flex';
    leftChordContainer.style.justifyContent = 'center';
    leftChordContainer.style.alignItems = 'center';
    leftChordContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
    leftChordContainer.style.borderRadius = '10px';
    return leftChordContainer;
}

function createBarChartContainer() {
    const rightContainer = document.createElement('div');
    rightContainer.id = 'location-bar-container';
    rightContainer.style.width = '48%';
    rightContainer.style.aspectRatio = '1 / 1';
    rightContainer.style.display = 'flex';
    rightContainer.style.flexDirection = 'column';
    rightContainer.style.justifyContent = 'center';
    rightContainer.style.alignItems = 'center';
    rightContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
    rightContainer.style.borderRadius = '10px';
    rightContainer.style.padding = '20px';

    // Título do container de bar chart
    const title = document.createElement('h2');
    title.textContent = "Estatísticas dos Pokémons";
    title.style.color = 'white';
    title.style.marginBottom = '15px';
    title.style.fontFamily = '"Pixelify Sans", sans-serif';
    rightContainer.appendChild(title);

    // Container para o gráfico de barras
    const barChart = document.createElement('div');
    barChart.id = 'bar-chart-location';
    barChart.style.width = '100%';
    barChart.style.height = '100%';
    barChart.style.display = 'flex';
    barChart.style.justifyContent = 'center';
    barChart.style.alignItems = 'center';
    rightContainer.appendChild(barChart);

    return rightContainer;
}

export function createLocationScreen(id_location = 28) {
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

    // Modularizado: containers
    const leftChordContainer = createChordContainer();
    const rightContainer = createBarChartContainer();

    // Adiciona os containers superiores ao topContainer
    topContainer.appendChild(leftChordContainer);
    topContainer.appendChild(rightContainer);

    // Adiciona os containers ao contentScreen
    contentScreen.appendChild(topContainer);

    // Chama os renderizadores passando os ids dos containers correspondentes
    updateTypeChordByLocation(id_location);
    renderStatBarChart(id_location);
}
