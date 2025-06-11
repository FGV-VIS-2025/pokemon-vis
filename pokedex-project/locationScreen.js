import { renderStatBarChart } from "./statsBarChart.js";
import { updateTypeChordByLocation } from "./types.js";

const contentScreen = document.getElementsByClassName("content-screen")[0];

function createLocationInfoBar() {
    const locationInfo = document.createElement("div");
    locationInfo.classList.add("location-info-bar");
    locationInfo.style.width = "60%";
    locationInfo.style.padding = "10px";
    locationInfo.style.borderRadius = "12px";
    locationInfo.style.backgroundColor = "#f2f2f2";
    locationInfo.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.1)";
    locationInfo.style.display = "flex";
    locationInfo.style.alignItems = "center";
    locationInfo.style.gap = "10px";
    locationInfo.style.marginTop = "20px";
    locationInfo.style.marginBottom = "20px";
    locationInfo.style.position = "relative";
    locationInfo.style.justifyContent = "center";
    locationInfo.style.fontFamily = '"Pixelify Sans", sans-serif';
    locationInfo.style.fontSize = "1.2em";
    locationInfo.style.fontWeight = "bold";
    locationInfo.style.color = "#333";

    const locationIcon = document.createElement("img");
    locationIcon.src = "../assets/compass.png";
    locationIcon.style.height = "32px";
    locationIcon.style.width = "32px";
    locationIcon.style.objectFit = "contain";
    locationIcon.style.flexShrink = "0";

    const locationText = document.createElement("span");
    locationText.textContent = "Dados da Localização Selecionada";
    locationText.style.flex = "1";
    locationText.style.textAlign = "center";

    locationInfo.appendChild(locationIcon);
    locationInfo.appendChild(locationText);

    return locationInfo;
}

function createLocationCardsArea() {
    const cardsArea = document.createElement("div");
    cardsArea.classList.add("location-cards-area");
    cardsArea.style.width = "90%";
    cardsArea.style.display = "flex";
    cardsArea.style.alignItems = "center";
    cardsArea.style.justifyContent = "center";
    cardsArea.style.flexDirection = "row";
    cardsArea.style.gap = "10px";
    cardsArea.style.marginBottom = "20px";

    // Criar 4 cards informativos sobre a localização
    for (let i = 1; i <= 4; i++) {
        const card = document.createElement("div");
        card.classList.add("location-info-card");
        card.style.width = "25%";
        card.style.aspectRatio = "1/1";
        card.style.backgroundColor = "#d8d8d8";
        card.style.borderRadius = "20px";
        card.style.display = "flex";
        card.style.alignItems = "center";
        card.style.justifyContent = "center";
        card.style.flexDirection = "column";
        card.style.padding = "10px";
        card.style.boxSizing = "border-box";
        card.style.border = "2px solid #333";
        card.style.fontFamily = '"Pixelify Sans", sans-serif';
        card.style.textAlign = "center";
        card.style.fontSize = "0.9em";
        card.style.fontWeight = "600";

        // Adicionar conteúdo específico para cada card
        if (i === 1) {
            card.innerHTML = `
                <img src="../assets/pokeball.png" style="width: 40%; margin-bottom: 10px;">
                <div>Pokémons<br>Encontrados</div>
            `;
        } else if (i === 2) {
            card.innerHTML = `
                <img src="../assets/chart.png" style="width: 40%; margin-bottom: 10px;">
                <div>Tipos<br>Predominantes</div>
            `;
        } else if (i === 3) {
            card.innerHTML = `
                <img src="../assets/info.png" style="width: 40%; margin-bottom: 10px;">
                <div>Estatísticas<br>Médias</div>
            `;
        } else {
            card.innerHTML = `
                <img src="../assets/earth-globe.png" style="width: 40%; margin-bottom: 10px;">
                <div>Dados da<br>Região</div>
            `;
        }

        cardsArea.appendChild(card);
    }

    return cardsArea;
}

function createChartContainer() {
    const chartContainer = document.createElement("div");
    chartContainer.classList.add("location-chart-container");
    chartContainer.style.width = "90%";
    chartContainer.style.display = "flex";
    chartContainer.style.alignItems = "center";
    chartContainer.style.justifyContent = "center";
    chartContainer.style.flexDirection = "row";
    chartContainer.style.gap = "10px";
    chartContainer.style.marginBottom = "20px";

    // Container esquerdo para o chord diagram
    const leftChordContainer = document.createElement('div');
    leftChordContainer.id = 'location-chart-container';
    leftChordContainer.style.width = '48%';
    leftChordContainer.style.aspectRatio = '1 / 1';
    leftChordContainer.style.display = 'flex';
    leftChordContainer.style.justifyContent = 'center';
    leftChordContainer.style.alignItems = 'center';
    leftChordContainer.style.backgroundColor = '#1b1b1b';
    leftChordContainer.style.borderRadius = '10px';
    leftChordContainer.style.border = '1px solid #ffffff';
    leftChordContainer.style.padding = '15px';
    leftChordContainer.style.boxSizing = 'border-box';

    // Container direito para o bar chart
    const rightContainer = document.createElement('div');
    rightContainer.id = 'location-bar-container';
    rightContainer.style.width = '48%';
    rightContainer.style.aspectRatio = '1 / 1';
    rightContainer.style.display = 'flex';
    rightContainer.style.flexDirection = 'column';
    rightContainer.style.justifyContent = 'center';
    rightContainer.style.alignItems = 'center';
    rightContainer.style.backgroundColor = '#1b1b1b';
    rightContainer.style.borderRadius = '10px';
    rightContainer.style.border = '1px solid #ffffff';
    rightContainer.style.padding = '15px';
    rightContainer.style.boxSizing = 'border-box';

    // Título do container de bar chart
    const title = document.createElement('h2');
    title.textContent = "Estatísticas dos Pokémons";
    title.style.color = 'white';
    title.style.marginBottom = '15px';
    title.style.fontFamily = '"Pixelify Sans", sans-serif';
    title.style.fontSize = '1.2em';
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

    chartContainer.appendChild(leftChordContainer);
    chartContainer.appendChild(rightContainer);

    return chartContainer;
}

function createAdditionalChartsArea() {
    const additionalArea = document.createElement("div");
    additionalArea.classList.add("location-additional-charts");
    additionalArea.style.width = "90%";
    additionalArea.style.display = "flex";
    additionalArea.style.alignItems = "center";
    additionalArea.style.justifyContent = "center";
    additionalArea.style.flexDirection = "column";
    additionalArea.style.gap = "20px";

    // Container para gráficos adicionais (similar aos svg containers do pokemon screen)
    const svgPai1 = document.createElement("svg");
    svgPai1.classList.add("svg-pai-chart-1");
    svgPai1.style.width = "100%";
    svgPai1.style.height = "auto";
    svgPai1.style.backgroundColor = "#1b1b1b";
    svgPai1.style.borderRadius = "10px";
    svgPai1.style.boxSizing = "border-box";
    svgPai1.style.padding = "15px";
    svgPai1.style.display = "flex";
    svgPai1.style.alignItems = "center";
    svgPai1.style.justifyContent = "center";
    svgPai1.style.flexDirection = "column";
    svgPai1.style.marginBottom = "20px";
    svgPai1.style.border = "1px solid #ffffff";

    const svg1 = document.createElement("svg");
    svg1.classList.add("svg-chart-1");
    svg1.style.width = "100%";
    svg1.style.height = "auto";
    svg1.style.backgroundColor = "rgb(49, 49, 49)";
    svg1.style.borderRadius = "10px";
    svg1.style.border = "1px solid rgb(255, 255, 255)";
    svg1.style.display = "flex";
    svg1.style.alignItems = "center";
    svg1.style.justifyContent = "center";
    svg1.style.flexDirection = "row";
    svg1.style.boxSizing = "border-box";
    svg1.style.padding = "15px";
    svg1.appendChild(document.createElement("rect")).classList.add("svg-chart-1-rect-1");
    svgPai1.appendChild(svg1);

    additionalArea.appendChild(svgPai1);

    return additionalArea;
}

export function createLocationScreen(id_location = 28) {
    contentScreen.scrollTo(0, 0);
    contentScreen.innerHTML = '';
    contentScreen.style.gap = "0";
    contentScreen.style.justifyContent = '';
    contentScreen.style.display = 'flex';
    contentScreen.style.flexDirection = 'column';
    contentScreen.style.alignItems = 'center';

    // Criar elementos seguindo o padrão do pokemonScreen
    const locationInfo = createLocationInfoBar();
    const cardsArea = createLocationCardsArea();
    const chartContainer = createChartContainer();
    const additionalArea = createAdditionalChartsArea();

    // Adicionar todos os elementos ao contentScreen
    contentScreen.appendChild(locationInfo);
    contentScreen.appendChild(cardsArea);
    contentScreen.appendChild(chartContainer);
    contentScreen.appendChild(additionalArea);

    // Chama os renderizadores passando os ids dos containers correspondentes
    updateTypeChordByLocation(id_location);
    renderStatBarChart(id_location);
}
