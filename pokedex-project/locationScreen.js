import { renderStatBarChart } from "./statsBarChart.js";
import { updateTypeChordByLocation } from "./types.js";

const contentScreen = document.getElementsByClassName("content-screen")[0];

export function createLocationScreen(id_location = 28) {
    contentScreen.scrollTo(0, 0);
    contentScreen.innerHTML = '';
    contentScreen.style.gap = "50px";
    contentScreen.style.display = 'flex';
    contentScreen.style.justifyContent = 'center';
    contentScreen.style.alignItems = 'center';
    contentScreen.style.flexDirection = 'row';
    contentScreen.style.padding = '20px';

    // Div principal da esquerda - Gráfico de Acordes
    const leftDiv = document.createElement('div');
    leftDiv.id = 'location-left-div';
    leftDiv.style.width = '50%';
    leftDiv.style.height = '100%';
    leftDiv.style.display = 'flex';
    leftDiv.style.justifyContent = 'center';
    leftDiv.style.alignItems = 'center';
    leftDiv.style.flexDirection = 'column';

    const chartContainer = document.createElement('div');
    chartContainer.id = 'location-chart-container';
    chartContainer.style.width = '100%';
    chartContainer.style.height = '100%';
    chartContainer.style.display = 'flex';
    chartContainer.style.justifyContent = 'center';
    chartContainer.style.alignItems = 'center';

    leftDiv.appendChild(chartContainer);

    // Div principal da direita - Bar Chart
    const rightDiv = document.createElement('div');
    rightDiv.id = 'location-right-div';
    rightDiv.style.width = '50%';
    rightDiv.style.height = '100%';
    rightDiv.style.display = 'flex';
    rightDiv.style.justifyContent = 'center';
    rightDiv.style.alignItems = 'center';
    rightDiv.style.flexDirection = 'column';

    const barChartContainer = document.createElement('div');
    barChartContainer.id = 'bar-chart-location';
    barChartContainer.style.width = '100%';
    barChartContainer.style.height = '100%';
    barChartContainer.style.display = 'flex';
    barChartContainer.style.justifyContent = 'center';
    barChartContainer.style.alignItems = 'center';

    rightDiv.appendChild(barChartContainer);

    // Adiciona as duas divs principais na tela
    contentScreen.appendChild(leftDiv);
    contentScreen.appendChild(rightDiv);

    updateTypeChordByLocation(id_location);
    renderStatBarChart(id_location);
}
