import { updateTypeChordByLocation } from "./types.js";
import { renderStatBarChart } from "./statsBarChart.js";

const contentScreen = document.getElementsByClassName("content-screen")[0];

export function createLocationScreen(id_location = 28) {
    contentScreen.innerHTML = '';
    contentScreen.style.gap = "100px";
    contentScreen.style.display = 'flex';
    contentScreen.style.justifyContent = 'center';
    contentScreen.style.alignItems = 'center';
    contentScreen.style.flexDirection = 'column';

    const chartContainer = document.createElement('div');
    chartContainer.id = 'location-chart-container';
    chartContainer.style.width = '100%';
    chartContainer.style.height = '1200px';
    chartContainer.style.margin = 'auto';
    chartContainer.style.display = 'flex';
    chartContainer.style.marginTop = '700px';
    chartContainer.style.justifyContent = 'center';
    chartContainer.style.alignItems = 'center';

    const barChartContainer = document.createElement('div');
    barChartContainer.id = 'bar-chart-location';
    barChartContainer.style.width = '100%';
    barChartContainer.style.height = '800px';
    barChartContainer.style.margin = 'auto';
    barChartContainer.style.display = 'flex';
    barChartContainer.style.justifyContent = 'center';
    barChartContainer.style.alignItems = 'center';
    barChartContainer.style.marginBottom = '100px';

    // Adiciona ambos os gráficos na tela
    contentScreen.appendChild(chartContainer);
    contentScreen.appendChild(barChartContainer);

    updateTypeChordByLocation(id_location);
    renderStatBarChart(id_location);
}
