import { updateTypeChordByLocation } from "./types.js";
import { renderStatBarChart } from "./statsBarChart.js";

const contentScreen = document.getElementById("content-container");

export function createLocationScreen(id_location) {
    contentScreen.innerHTML = '';
    contentScreen.style.backgroundColor = 'black';

    const chartContainer = document.createElement('div');
    chartContainer.id = 'location-chart-container';
    chartContainer.style.width = '100%';
    chartContainer.style.height = '600px';
    chartContainer.style.margin = 'auto';
    chartContainer.style.display = 'flex';
    chartContainer.style.justifyContent = 'center';
    chartContainer.style.alignItems = 'center';

    const barChartContainer = document.createElement('div');
    barChartContainer.id = 'bar-chart-location';
    barChartContainer.style.width = '100%';
    barChartContainer.style.height = '600px';
    barChartContainer.style.margin = 'auto';
    barChartContainer.style.marginTop = '40px';
    barChartContainer.style.display = 'flex';
    barChartContainer.style.justifyContent = 'center';
    barChartContainer.style.alignItems = 'center';

    // Adiciona ambos os gráficos na tela
    contentScreen.appendChild(chartContainer);
    contentScreen.appendChild(barChartContainer);

    console.log(id_location);
    updateTypeChordByLocation(id_location);
    renderStatBarChart(id_location);
}
