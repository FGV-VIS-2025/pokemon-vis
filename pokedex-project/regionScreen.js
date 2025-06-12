import { createPokemonCard } from "./cardsPokedex.js";
import { gameRegionVersions, getPokemonsByGeneration, regionToGeneration } from "./dataManager.js";
import { clearDistributionPlotFilter, drawDistributionPlot, updateDistributionPlot } from "./distributplot.js";
import { updateTypeChordByRegion } from "./types.js";

// Adicionar CSS para a tooltip de card do Pokémon
const style = document.createElement('style');
style.textContent = `
    .pokemon-tooltip-card {
        position: fixed;
        z-index: 1000;
        width: 220px;
        height: auto;
        pointer-events: none;
        transform: translate(10px, 10px);
        transition: opacity 0.2s ease;
        opacity: 0;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
        border-radius: 10px;
    }
    
    .pokemon-tooltip-card.active {
        opacity: 1;
    }
`;
document.head.appendChild(style);

const contentScreen = document.getElementsByClassName("content-screen")[0];

// Variável global para armazenar o ID da região atual
let currentRegionId = 3; // fallback Hoenn

function createRegionSearchBar(regionName = "Região Selecionada") {
    // Obter o número da geração correspondente
    const generationNumber = regionToGeneration[regionName] || "";
    const generationSuffix = generationNumber ? ` (${generationNumber}ª Geração)` : "";

    // Container principal da busca/info (similar ao locationScreen)
    const regionSearch = document.createElement("div");
    regionSearch.classList.add("region-search");
    regionSearch.style.width = "60%";
    regionSearch.style.padding = "10px";
    regionSearch.style.borderRadius = "12px";
    regionSearch.style.backgroundColor = "#1b1b1b";
    regionSearch.style.border = "4px solid #cccccc";
    regionSearch.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.1), inset 0 0 0 2px #000000, inset 0 0 0 4px #cccccc";
    regionSearch.style.display = "flex";
    regionSearch.style.alignItems = "center";
    regionSearch.style.gap = "15px";
    regionSearch.style.marginTop = "15px";
    regionSearch.style.marginBottom = "15px";
    regionSearch.style.position = "relative";
    regionSearch.style.fontFamily = '"Pixelify Sans", sans-serif';

    const regionIcon = document.createElement("img");
    regionIcon.src = "../assets/earth-globe.png";
    regionIcon.style.height = "32px";
    regionIcon.style.width = "32px";
    regionIcon.style.objectFit = "contain";
    regionIcon.style.flexShrink = "0";
    regionIcon.style.backgroundColor = "#1b1b1b";
    regionIcon.style.borderRadius = "6px";
    regionIcon.style.padding = "4px";

    // Campo de "busca" (só visual, mostra o nome da região)
    const regionDisplayBox = document.createElement("div");
    regionDisplayBox.style.flex = "1";
    regionDisplayBox.style.height = "40px";
    regionDisplayBox.style.padding = "0 12px";
    regionDisplayBox.style.border = "1px solid #3a3a3a";
    regionDisplayBox.style.borderRadius = "8px";
    regionDisplayBox.style.fontSize = "1rem";
    regionDisplayBox.style.backgroundColor = "#1b1b1b";
    regionDisplayBox.style.boxShadow = "inset 0 2px 6px rgba(0,0,0,0.2), 0 1px 3px rgba(255,255,255,0.1)";
    regionDisplayBox.style.display = "flex";
    regionDisplayBox.style.alignItems = "center";
    regionDisplayBox.style.justifyContent = "space-between";
    regionDisplayBox.style.fontWeight = "bold";
    regionDisplayBox.style.color = "#ffffff";
    regionDisplayBox.style.textShadow = "1px 1px 2px rgba(0,0,0,0.8)";

    // Nome da região (lado esquerdo)
    const regionNameSpan = document.createElement("span");
    regionNameSpan.textContent = regionName + generationSuffix;

    // Contador de pokémons (lado direito)
    const pokemonCountSpan = document.createElement("span");
    pokemonCountSpan.id = "region-pokemon-counter";
    pokemonCountSpan.style.fontSize = "0.9em";
    pokemonCountSpan.style.color = "#cccccc";
    pokemonCountSpan.style.fontWeight = "normal";
    pokemonCountSpan.textContent = "Carregando...";

    regionDisplayBox.appendChild(regionNameSpan);
    regionDisplayBox.appendChild(pokemonCountSpan);

    regionSearch.appendChild(regionIcon);
    regionSearch.appendChild(regionDisplayBox);

    return regionSearch;
}

// Cards removidos conforme solicitado



// Função de atualização dos cards removida

function createRegionDescription() {
    const descriptionArea = document.createElement("div");
    descriptionArea.classList.add("region-description-area");
    descriptionArea.style.width = "90%";
    descriptionArea.style.display = "flex";
    descriptionArea.style.alignItems = "flex-start";
    descriptionArea.style.justifyContent = "center";
    descriptionArea.style.flexDirection = "row";
    descriptionArea.style.gap = "15px";
    descriptionArea.style.marginBottom = "20px";

    // Container para o chord diagram
    const leftChordContainer = document.createElement('div');
    leftChordContainer.id = 'region-chart-container';
    leftChordContainer.style.width = '50%';
    leftChordContainer.style.height = '600px'; // Altura fixa para garantir uniformidade
    leftChordContainer.style.display = 'flex';
    leftChordContainer.style.flexDirection = 'column';
    leftChordContainer.style.justifyContent = 'flex-start';
    leftChordContainer.style.alignItems = 'center';
    leftChordContainer.style.backgroundColor = '#1b1b1b';
    leftChordContainer.style.borderRadius = '10px';
    leftChordContainer.style.border = '1px solid #ffffff';
    leftChordContainer.style.padding = '15px';
    leftChordContainer.style.boxSizing = 'border-box';

    // Título e instruções para o chord diagram (ultra compactos)
    const chordTitle = document.createElement('h2');
    chordTitle.textContent = "Relações Entre Tipos";
    chordTitle.style.color = 'white';
    chordTitle.style.marginBottom = '2px';
    chordTitle.style.marginTop = '0px';
    chordTitle.style.fontFamily = '"Pixelify Sans", sans-serif';
    chordTitle.style.fontSize = '1.0em';
    chordTitle.style.textAlign = 'center';
    chordTitle.style.lineHeight = '1.1';
    chordTitle.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.7)';
    leftChordContainer.appendChild(chordTitle);

    const chordInstructions = document.createElement('p');
    chordInstructions.innerHTML = "Clique nos <strong>tipos</strong> ou <strong>conexões</strong> para filtrar";
    chordInstructions.style.color = '#cccccc';
    chordInstructions.style.fontSize = '1em';
    chordInstructions.style.textAlign = 'center';
    chordInstructions.style.marginBottom = '3px';
    chordInstructions.style.marginTop = '0px';
    chordInstructions.style.fontFamily = '"Pixelify Sans", sans-serif';
    chordInstructions.style.lineHeight = '1.0';
    leftChordContainer.appendChild(chordInstructions);

    // Container interno para o gráfico (máximo espaço)
    const chordGraphContainer = document.createElement('div');
    chordGraphContainer.id = 'chord-graph-container';
    chordGraphContainer.style.width = '100%';
    chordGraphContainer.style.height = 'calc(100% - 28px)'; // Reduzir significativamente a compensação
    chordGraphContainer.style.display = 'flex';
    chordGraphContainer.style.justifyContent = 'center';
    chordGraphContainer.style.alignItems = 'center';
    chordGraphContainer.style.minHeight = '350px'; // Altura mínima maior para o gráfico
    leftChordContainer.appendChild(chordGraphContainer);

    // Container para os sprites dos pokémons
    const rightContainer = document.createElement('div');
    rightContainer.id = 'right-region-container';
    rightContainer.style.width = '50%';
    rightContainer.style.height = '600px'; // Altura fixa igual ao container do chord
    rightContainer.style.display = 'flex';
    rightContainer.style.flexDirection = 'column';
    rightContainer.style.justifyContent = 'flex-start';
    rightContainer.style.alignItems = 'center';
    rightContainer.style.backgroundColor = '#1b1b1b';
    rightContainer.style.borderRadius = '10px';
    rightContainer.style.border = '1px solid #ffffff';
    rightContainer.style.padding = '15px';
    rightContainer.style.boxSizing = 'border-box';
    rightContainer.style.overflow = 'hidden';

    // Header do container de sprites
    const spriteHeader = document.createElement('div');
    spriteHeader.style.width = '100%';
    spriteHeader.style.display = 'flex';
    spriteHeader.style.justifyContent = 'center';
    spriteHeader.style.alignItems = 'center';
    spriteHeader.style.marginBottom = '15px';
    spriteHeader.style.position = 'relative';

    const title = document.createElement('h2');
    title.textContent = "Pokémon da Geração";
    title.style.color = 'white';
    title.style.marginBottom = '5px';
    title.style.marginTop = '0px';
    title.style.fontFamily = '"Pixelify Sans", sans-serif';
    title.style.fontSize = '1.0em';
    title.style.textAlign = 'center';
    title.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.7)';

    // Botão para limpar filtro (posicionado absolutamente para não afetar o centro do título)
    const clearFilterBtn = document.createElement('button');
    clearFilterBtn.id = 'clear-region-filter-btn';
    clearFilterBtn.innerHTML = '✕ Limpar Filtro';
    clearFilterBtn.style.backgroundColor = '#4a90e2';
    clearFilterBtn.style.color = 'white';
    clearFilterBtn.style.border = 'none';
    clearFilterBtn.style.padding = '6px 12px';
    clearFilterBtn.style.borderRadius = '6px';
    clearFilterBtn.style.fontSize = '0.8em';
    clearFilterBtn.style.fontFamily = '"Pixelify Sans", sans-serif';
    clearFilterBtn.style.cursor = 'pointer';
    clearFilterBtn.style.display = 'none';
    clearFilterBtn.style.transition = 'background-color 0.2s ease';
    clearFilterBtn.style.position = 'absolute';
    clearFilterBtn.style.right = '0';
    clearFilterBtn.style.top = '0';

    clearFilterBtn.addEventListener('mouseenter', () => {
        clearFilterBtn.style.backgroundColor = '#357abd';
    });
    clearFilterBtn.addEventListener('mouseleave', () => {
        clearFilterBtn.style.backgroundColor = '#4a90e2';
    });

    spriteHeader.appendChild(title);
    spriteHeader.appendChild(clearFilterBtn);
    rightContainer.appendChild(spriteHeader);

    // Container para o grid (sem scroll)
    const spriteGridContainer = document.createElement('div');
    spriteGridContainer.style.width = '100%';
    spriteGridContainer.style.height = 'calc(100% - 50px)'; // Espaço para navegação na parte inferior
    spriteGridContainer.style.overflow = 'hidden'; // Remove o scroll
    spriteGridContainer.style.position = 'relative';

    // Grid para os sprites (tamanho fixo para paginação)
    const grid = document.createElement('div');
    grid.id = 'pokemon-sprites-grid';
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(6, 1fr)'; // 6 colunas fixas
    grid.style.gridTemplateRows = 'repeat(4, 1fr)'; // 4 linhas fixas = 24 pokémon por página
    grid.style.gap = '8px';
    grid.style.width = '100%';
    grid.style.height = '100%';
    grid.style.justifyItems = 'center';
    grid.style.alignItems = 'center';
    grid.style.padding = '5px';
    grid.style.boxSizing = 'border-box';

    spriteGridContainer.appendChild(grid);
    rightContainer.appendChild(spriteGridContainer);

    // Container para navegação por páginas (movido para baixo)
    const navigationContainer = document.createElement('div');
    navigationContainer.style.width = '100%';
    navigationContainer.style.height = '40px';
    navigationContainer.style.display = 'flex';
    navigationContainer.style.justifyContent = 'center';
    navigationContainer.style.alignItems = 'center';
    navigationContainer.style.gap = '20px';
    navigationContainer.style.marginTop = '5px';

    // Botão anterior
    const prevButton = document.createElement('button');
    prevButton.id = 'pokemon-prev-btn';
    prevButton.innerHTML = '◀ Anterior';
    prevButton.style.backgroundColor = 'transparent';
    prevButton.style.color = '#ffffff';
    prevButton.style.border = '2px solid #ffffff';
    prevButton.style.borderRadius = '8px';
    prevButton.style.padding = '8px 16px';
    prevButton.style.cursor = 'pointer';
    prevButton.style.fontSize = '12px';
    prevButton.style.fontFamily = '"Pixelify Sans", sans-serif';
    prevButton.style.fontWeight = '600';
    prevButton.style.display = 'flex';
    prevButton.style.alignItems = 'center';
    prevButton.style.justifyContent = 'center';
    prevButton.style.gap = '8px';
    prevButton.style.transition = 'all 0.3s ease';
    prevButton.style.minWidth = '100px';
    prevButton.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.7)';
    prevButton.style.letterSpacing = '0.5px';

    // Indicador de página
    const pageIndicator = document.createElement('div');
    pageIndicator.id = 'pokemon-page-indicator';
    pageIndicator.style.color = '#ffffff';
    pageIndicator.style.fontSize = '14px';
    pageIndicator.style.fontFamily = '"Pixelify Sans", sans-serif';
    pageIndicator.style.fontWeight = '700';
    pageIndicator.style.minWidth = '80px';
    pageIndicator.style.textAlign = 'center';
    pageIndicator.style.backgroundColor = 'transparent';
    pageIndicator.style.padding = '8px 16px';
    pageIndicator.style.borderRadius = '8px';
    pageIndicator.style.border = '2px solid rgba(255, 255, 255, 0.6)';
    pageIndicator.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.8)';
    pageIndicator.style.letterSpacing = '1px';
    pageIndicator.textContent = '1 / 1';

    // Botão próximo
    const nextButton = document.createElement('button');
    nextButton.id = 'pokemon-next-btn';
    nextButton.innerHTML = 'Próximo ▶';
    nextButton.style.backgroundColor = 'transparent';
    nextButton.style.color = '#ffffff';
    nextButton.style.border = '2px solid #ffffff';
    nextButton.style.borderRadius = '8px';
    nextButton.style.padding = '8px 16px';
    nextButton.style.cursor = 'pointer';
    nextButton.style.fontSize = '12px';
    nextButton.style.fontFamily = '"Pixelify Sans", sans-serif';
    nextButton.style.fontWeight = '600';
    nextButton.style.display = 'flex';
    nextButton.style.alignItems = 'center';
    nextButton.style.justifyContent = 'center';
    nextButton.style.gap = '8px';
    nextButton.style.transition = 'all 0.3s ease';
    nextButton.style.minWidth = '100px';
    nextButton.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.7)';
    nextButton.style.letterSpacing = '0.5px';

    // Efeitos hover melhorados para os botões
    prevButton.addEventListener('mouseenter', () => {
        if (!prevButton.disabled) {
            prevButton.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            prevButton.style.borderColor = '#00d4ff';
            prevButton.style.color = '#00d4ff';
            prevButton.style.transform = 'translateY(-2px) scale(1.05)';
            prevButton.style.boxShadow = '0 6px 20px rgba(0, 212, 255, 0.3)';
        }
    });
    prevButton.addEventListener('mouseleave', () => {
        if (!prevButton.disabled) {
            prevButton.style.backgroundColor = 'transparent';
            prevButton.style.borderColor = '#ffffff';
            prevButton.style.color = '#ffffff';
            prevButton.style.transform = 'translateY(0) scale(1)';
            prevButton.style.boxShadow = 'none';
        }
    });

    // Adicionar listener de clique para prevButton
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderCurrentPage();
            updateButtonStates();

            // Manter o efeito hover após o clique se o mouse ainda estiver sobre o botão
            setTimeout(() => {
                if (prevButton.matches(':hover') && !prevButton.disabled) {
                    prevButton.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    prevButton.style.borderColor = '#00d4ff';
                    prevButton.style.color = '#00d4ff';
                    prevButton.style.transform = 'translateY(-2px) scale(1.05)';
                    prevButton.style.boxShadow = '0 6px 20px rgba(0, 212, 255, 0.3)';
                }
            }, 100);
        }
    });

    nextButton.addEventListener('mouseenter', () => {
        if (!nextButton.disabled) {
            nextButton.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            nextButton.style.borderColor = '#00d4ff';
            nextButton.style.color = '#00d4ff';
            nextButton.style.transform = 'translateY(-2px) scale(1.05)';
            nextButton.style.boxShadow = '0 6px 20px rgba(0, 212, 255, 0.3)';
        }
    });
    nextButton.addEventListener('mouseleave', () => {
        if (!nextButton.disabled) {
            nextButton.style.backgroundColor = 'transparent';
            nextButton.style.borderColor = '#ffffff';
            nextButton.style.color = '#ffffff';
            nextButton.style.transform = 'translateY(0) scale(1)';
            nextButton.style.boxShadow = 'none';
        }
    });

    // Adicionar listener de clique para nextButton
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderCurrentPage();
            updateButtonStates();

            // Manter o efeito hover após o clique se o mouse ainda estiver sobre o botão
            setTimeout(() => {
                if (nextButton.matches(':hover') && !nextButton.disabled) {
                    nextButton.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    nextButton.style.borderColor = '#00d4ff';
                    nextButton.style.color = '#00d4ff';
                    nextButton.style.transform = 'translateY(-2px) scale(1.05)';
                    nextButton.style.boxShadow = '0 6px 20px rgba(0, 212, 255, 0.3)';
                }
            }, 100);
        }
    });

    navigationContainer.appendChild(prevButton);
    navigationContainer.appendChild(pageIndicator);
    navigationContainer.appendChild(nextButton);
    rightContainer.appendChild(navigationContainer);

    descriptionArea.appendChild(leftChordContainer);
    descriptionArea.appendChild(rightContainer);

    return descriptionArea;
}

function createAdditionalChartsArea() {
    const additionalArea = document.createElement("div");
    additionalArea.classList.add("region-additional-charts");
    additionalArea.style.width = "90%";
    additionalArea.style.display = "flex";
    additionalArea.style.alignItems = "center";
    additionalArea.style.justifyContent = "center";
    additionalArea.style.flexDirection = "column";
    additionalArea.style.gap = "20px";

    // Container para gráfico de distribuição padronizado
    const distributionContainer = document.createElement("div");
    distributionContainer.classList.add("distribution-chart-container");
    distributionContainer.style.width = "100%";
    distributionContainer.style.height = "80vh"; // Aumentado de 70vh para 80vh
    distributionContainer.style.display = "flex";
    distributionContainer.style.flexDirection = "column";
    distributionContainer.style.justifyContent = "center";
    distributionContainer.style.alignItems = "center";
    distributionContainer.style.backgroundColor = "#1b1b1b";
    distributionContainer.style.borderRadius = "15px";
    distributionContainer.style.border = "2px solid #ffffff";
    distributionContainer.style.padding = "15px";
    distributionContainer.style.boxSizing = "border-box";
    distributionContainer.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.3)";
    distributionContainer.style.marginBottom = "20px";

    // Título do container de distribuição (padronizado)
    const distributionTitle = document.createElement('h2');
    distributionTitle.textContent = "Distribuição de Atributos dos Pokémons";
    distributionTitle.style.color = 'white';
    distributionTitle.style.marginBottom = '5px';
    distributionTitle.style.marginTop = '0px';
    distributionTitle.style.fontFamily = '"Pixelify Sans", sans-serif';
    distributionTitle.style.fontSize = '1.0em';
    distributionTitle.style.textAlign = 'center';
    distributionTitle.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.7)';
    distributionContainer.appendChild(distributionTitle);

    // Container interno para o gráfico de distribuição
    const barChartContainer = document.createElement('div');
    barChartContainer.id = 'bar-chart-container';
    barChartContainer.style.width = '100%';
    barChartContainer.style.height = 'calc(100% - 35px)';
    barChartContainer.style.display = 'flex';
    barChartContainer.style.justifyContent = 'center';
    barChartContainer.style.alignItems = 'center';
    barChartContainer.style.minHeight = '450px';
    barChartContainer.style.overflow = 'visible';
    barChartContainer.style.boxSizing = 'border-box';
    barChartContainer.style.position = 'relative';
    distributionContainer.appendChild(barChartContainer);

    additionalArea.appendChild(distributionContainer);

    return additionalArea;
}

export async function createRegionScreen(id_region = 3) {
    // Armazenar o ID da região atual globalmente
    currentRegionId = id_region;

    // Limpar tooltips e listeners anteriores
    cleanupPreviousTooltips();

    contentScreen.scrollTo(0, 0);
    contentScreen.innerHTML = '';
    contentScreen.style.gap = "0";
    contentScreen.style.justifyContent = '';
    contentScreen.style.display = 'flex';
    contentScreen.style.flexDirection = 'column';
    contentScreen.style.alignItems = 'center';

    // Mostrar loading inicial
    const loadingDiv = document.createElement("div");
    loadingDiv.style.color = "white";
    loadingDiv.style.fontSize = "1.2em";
    loadingDiv.style.fontFamily = '"Pixelify Sans", sans-serif';
    loadingDiv.style.textAlign = "center";
    loadingDiv.style.marginTop = "50px";
    loadingDiv.textContent = "Carregando dados da região...";
    contentScreen.appendChild(loadingDiv);

    try {
        // Buscar nome da região
        const regionNames = Object.keys(gameRegionVersions);
        const regionName = regionNames[id_region - 1] || "Kanto";

        // Limpar loading e criar elementos
        contentScreen.innerHTML = '';

        // Criar elementos seguindo o padrão das outras telas
        const regionSearchBar = createRegionSearchBar(regionName);
        const descriptionArea = createRegionDescription();
        const additionalArea = createAdditionalChartsArea();

        // Adicionar todos os elementos ao contentScreen
        contentScreen.appendChild(regionSearchBar);
        contentScreen.appendChild(descriptionArea);
        contentScreen.appendChild(additionalArea);

        // Chama os renderizadores passando os ids dos containers correspondentes
        setTimeout(() => {
            updateTypeChordByRegion(id_region);          // irá desenhar no #chord-graph-container

            // Carrega os pokémons da geração e desenha o boxplot
            getPokemonsByGeneration(regionName).then(pokemons => {
                drawDistributionPlot('#bar-chart-container', pokemons);
            });

            // Carrega os sprites dos Pokémons da região
            loadRegionPokemonSprites(id_region);

            // Configurar o botão de limpar filtro
            setupClearFilterButton();

            // Debug para detectar elementos fantasmas (apenas em desenvolvimento)
            setTimeout(debugGhostElements, 1000);
        }, 200); // Aumentar delay para garantir que os containers estejam renderizados com tamanho correto

    } catch (error) {
        console.error("Erro ao criar tela de região:", error);
        contentScreen.innerHTML = `
            <div style="color: white; text-align: center; margin-top: 50px; font-family: 'Pixelify Sans', sans-serif;">
                <h2>Erro ao carregar dados</h2>
                <p>Não foi possível carregar os dados da região.</p>
                <p style="font-size: 0.9em; opacity: 0.7;">ID da região: ${id_region}</p>
            </div>
        `;
    }
}

// Função para carregar os sprites dos Pokémons de uma região com paginação
let currentPage = 1;
let totalPages = 1;
let currentPokemonsList = [];
const pokemonsPerPage = 24; // 6 colunas x 4 linhas

async function loadRegionPokemonSprites(regionId, pokemonsList = null) {
    try {
        const regionNames = Object.keys(gameRegionVersions);
        const regionName = regionNames[regionId - 1] || "Kanto";
        // Se receber uma lista filtrada, usa ela, senão busca todos da geração
        const pokemonsFromGeneration = pokemonsList || await getPokemonsByGeneration(regionName);

        // Armazena a lista atual e reseta a página
        currentPokemonsList = pokemonsFromGeneration;
        currentPage = 1;
        totalPages = Math.ceil(pokemonsFromGeneration.length / pokemonsPerPage);

        // Atualiza a interface
        renderCurrentPage();
        setupPaginationControls();

        // Atualizar contadores
        const isFiltered = pokemonsList !== null;
        if (isFiltered) {
            updatePokemonCounters(null, pokemonsFromGeneration.length);
            showClearFilterButton();
        } else {
            updatePokemonCounters(pokemonsFromGeneration.length, 0);
            hideClearFilterButton();
        }

    } catch (error) {
        console.error('Erro ao carregar sprites dos Pokémon:', error);
        const spritesGrid = document.getElementById('pokemon-sprites-grid');
        if (spritesGrid) {
            spritesGrid.innerHTML = `<p style="color: white; text-align: center; padding: 20px; grid-column: 1 / -1;">Erro ao carregar Pokémon: ${error.message}</p>`;
        }
    }
}

// Função para renderizar a página atual
function renderCurrentPage() {
    const spritesGrid = document.getElementById('pokemon-sprites-grid');
    if (!spritesGrid) return;

    spritesGrid.innerHTML = '';

    if (currentPokemonsList.length === 0) {
        const noDataMessage = document.createElement('p');
        noDataMessage.textContent = 'Nenhum Pokémon encontrado para os tipos selecionados.';
        noDataMessage.style.color = 'white';
        noDataMessage.style.gridColumn = '1 / -1';
        noDataMessage.style.gridRow = '1 / -1';
        noDataMessage.style.textAlign = 'center';
        noDataMessage.style.padding = '20px';
        noDataMessage.style.fontFamily = '"Pixelify Sans", sans-serif';
        noDataMessage.style.alignSelf = 'center';
        noDataMessage.style.justifySelf = 'center';
        spritesGrid.appendChild(noDataMessage);
        updatePageIndicator();
        return;
    }

    // Calcula o índice inicial e final para a página atual
    const startIndex = (currentPage - 1) * pokemonsPerPage;
    const endIndex = Math.min(startIndex + pokemonsPerPage, currentPokemonsList.length);
    const pokemonsOnPage = currentPokemonsList.slice(startIndex, endIndex);

    pokemonsOnPage.forEach(pokemon => {
        const spriteContainer = document.createElement('div');
        spriteContainer.className = 'pokemon-sprite-container';
        spriteContainer.style.display = 'flex';
        spriteContainer.style.flexDirection = 'column';
        spriteContainer.style.alignItems = 'center';
        spriteContainer.style.justifyContent = 'center';
        spriteContainer.style.cursor = 'pointer';
        spriteContainer.style.padding = '5px';
        spriteContainer.style.borderRadius = '8px';
        spriteContainer.style.transition = 'background-color 0.2s ease, transform 0.2s ease';
        spriteContainer.style.height = '100%';
        spriteContainer.style.width = '100%';

        // Efeito hover melhorado
        spriteContainer.addEventListener('mouseenter', () => {
            spriteContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            spriteContainer.style.transform = 'scale(1.05)';
        });

        spriteContainer.addEventListener('mouseleave', () => {
            spriteContainer.style.backgroundColor = 'transparent';
            spriteContainer.style.transform = 'scale(1)';
        });

        const img = document.createElement('img');
        img.style.width = '60px';
        img.style.height = '60px';
        img.alt = `${pokemon.name} #${pokemon.pokemon_id}`;
        img.style.imageRendering = 'pixelated';
        img.dataset.src = `../assets/pokemons/${pokemon.pokemon_id}.png`;
        img.src = '../assets/ball.png';
        img.style.opacity = '0.7';
        img.classList.add('pokemon-sprite-lazy');

        const numberLabel = document.createElement('span');
        numberLabel.textContent = `#${pokemon.pokemon_id}`;
        numberLabel.style.color = '#cccccc';
        numberLabel.style.fontSize = '9px';
        numberLabel.style.marginTop = '2px';
        numberLabel.style.fontFamily = '"Pixelify Sans", sans-serif';
        numberLabel.style.textAlign = 'center';

        const nameLabel = document.createElement('span');
        nameLabel.textContent = pokemon.name;
        nameLabel.style.color = 'white';
        nameLabel.style.fontSize = '9px';
        nameLabel.style.fontFamily = '"Pixelify Sans", sans-serif';
        nameLabel.style.textAlign = 'center';
        nameLabel.style.fontWeight = '600';
        nameLabel.style.maxWidth = '70px';
        nameLabel.style.overflow = 'hidden';
        nameLabel.style.textOverflow = 'ellipsis';
        nameLabel.style.whiteSpace = 'nowrap';

        img.title = `${pokemon.name} #${pokemon.pokemon_id}`;
        img.onerror = function () {
            this.src = '../assets/ball.png';
            this.style.opacity = '0.5';
        };

        spriteContainer.appendChild(img);
        spriteContainer.appendChild(numberLabel);
        spriteContainer.appendChild(nameLabel);
        spritesGrid.appendChild(spriteContainer);

        // Adicionar eventos para mostrar/esconder a tooltip do card
        spriteContainer.addEventListener('mouseenter', (event) => {
            showPokemonCardTooltip(pokemon, event);
        });

        spriteContainer.addEventListener('mouseleave', () => {
            hidePokemonCardTooltip();
        });

        // Remover o listener individual de mousemove para evitar conflitos
    });

    updatePageIndicator();
    initLazyLoading();
}

// Função para atualizar o indicador de página
function updatePageIndicator() {
    const pageIndicator = document.getElementById('pokemon-page-indicator');
    if (pageIndicator) {
        pageIndicator.textContent = `${currentPage} / ${totalPages}`;
    }
}

// Função para configurar os controles de paginação
function setupPaginationControls() {
    const prevButton = document.getElementById('pokemon-prev-btn');
    const nextButton = document.getElementById('pokemon-next-btn');

    if (prevButton && nextButton) {
        // Remove listeners anteriores
        prevButton.replaceWith(prevButton.cloneNode(true));
        nextButton.replaceWith(nextButton.cloneNode(true));

        // Pega os novos elementos
        const newPrevButton = document.getElementById('pokemon-prev-btn');
        const newNextButton = document.getElementById('pokemon-next-btn');

        // Adiciona novos listeners
        newPrevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderCurrentPage();
                updateButtonStates();

                // Manter o efeito hover após o clique se o mouse ainda estiver sobre o botão
                setTimeout(() => {
                    if (newPrevButton.matches(':hover') && !newPrevButton.disabled) {
                        newPrevButton.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        newPrevButton.style.borderColor = '#00d4ff';
                        newPrevButton.style.color = '#00d4ff';
                        newPrevButton.style.transform = 'translateY(-2px) scale(1.05)';
                        newPrevButton.style.boxShadow = '0 6px 20px rgba(0, 212, 255, 0.3)';
                    }
                }, 100);
            }
        });

        newNextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderCurrentPage();
                updateButtonStates();

                // Manter o efeito hover após o clique se o mouse ainda estiver sobre o botão
                setTimeout(() => {
                    if (newNextButton.matches(':hover') && !newNextButton.disabled) {
                        newNextButton.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        newNextButton.style.borderColor = '#00d4ff';
                        newNextButton.style.color = '#00d4ff';
                        newNextButton.style.transform = 'translateY(-2px) scale(1.05)';
                        newNextButton.style.boxShadow = '0 6px 20px rgba(0, 212, 255, 0.3)';
                    }
                }, 100);
            }
        });

        // Re-adiciona os efeitos hover melhorados
        newPrevButton.addEventListener('mouseenter', () => {
            if (!newPrevButton.disabled) {
                newPrevButton.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                newPrevButton.style.borderColor = '#00d4ff';
                newPrevButton.style.color = '#00d4ff';
                newPrevButton.style.transform = 'translateY(-2px) scale(1.05)';
                newPrevButton.style.boxShadow = '0 6px 20px rgba(0, 212, 255, 0.3)';
            }
        });
        newPrevButton.addEventListener('mouseleave', () => {
            if (!newPrevButton.disabled) {
                newPrevButton.style.backgroundColor = 'transparent';
                newPrevButton.style.borderColor = '#ffffff';
                newPrevButton.style.color = '#ffffff';
                newPrevButton.style.transform = 'translateY(0) scale(1)';
                newPrevButton.style.boxShadow = 'none';
            }
        });

        newNextButton.addEventListener('mouseenter', () => {
            if (!newNextButton.disabled) {
                newNextButton.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                newNextButton.style.borderColor = '#00d4ff';
                newNextButton.style.color = '#00d4ff';
                newNextButton.style.transform = 'translateY(-2px) scale(1.05)';
                newNextButton.style.boxShadow = '0 6px 20px rgba(0, 212, 255, 0.3)';
            }
        });
        newNextButton.addEventListener('mouseleave', () => {
            if (!newNextButton.disabled) {
                newNextButton.style.backgroundColor = 'transparent';
                newNextButton.style.borderColor = '#ffffff';
                newNextButton.style.color = '#ffffff';
                newNextButton.style.transform = 'translateY(0) scale(1)';
                newNextButton.style.boxShadow = 'none';
            }
        });

        updateButtonStates();
    }
}

// Função para atualizar o estado dos botões (habilitado/desabilitado)
function updateButtonStates() {
    const prevButton = document.getElementById('pokemon-prev-btn');
    const nextButton = document.getElementById('pokemon-next-btn');

    if (prevButton) {
        const isDisabled = currentPage <= 1;
        prevButton.disabled = isDisabled;

        if (isDisabled) {
            prevButton.style.opacity = '0.3';
            prevButton.style.cursor = 'not-allowed';
            prevButton.style.backgroundColor = 'transparent';
            prevButton.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            prevButton.style.color = 'rgba(255, 255, 255, 0.4)';
            prevButton.style.transform = 'none';
            prevButton.style.boxShadow = 'none';
        } else {
            prevButton.style.opacity = '1';
            prevButton.style.cursor = 'pointer';
            prevButton.style.backgroundColor = 'transparent';
            prevButton.style.borderColor = '#ffffff';
            prevButton.style.color = '#ffffff';
            prevButton.style.boxShadow = 'none';
        }
    }

    if (nextButton) {
        const isDisabled = currentPage >= totalPages;
        nextButton.disabled = isDisabled;

        if (isDisabled) {
            nextButton.style.opacity = '0.3';
            nextButton.style.cursor = 'not-allowed';
            nextButton.style.backgroundColor = 'transparent';
            nextButton.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            nextButton.style.color = 'rgba(255, 255, 255, 0.4)';
            nextButton.style.transform = 'none';
            nextButton.style.boxShadow = 'none';
        } else {
            nextButton.style.opacity = '1';
            nextButton.style.cursor = 'pointer';
            nextButton.style.backgroundColor = 'transparent';
            nextButton.style.borderColor = '#ffffff';
            nextButton.style.color = '#ffffff';
            nextButton.style.boxShadow = 'none';
        }
    }
}

// Funções utilitárias para melhorar a interação
function updatePokemonCounters(totalCount, filteredCount) {
    const counterElement = document.getElementById('region-pokemon-counter');
    if (counterElement) {
        if (filteredCount > 0) {
            // Quando há filtro aplicado, mostra quantos estão filtrados
            counterElement.textContent = `${filteredCount} Pokémon`;
            counterElement.style.color = "#00d4ff"; // Cor ciano para indicar filtro ativo
        } else if (totalCount > 0) {
            // Quando não há filtro, mostra o total
            counterElement.textContent = `${totalCount} Pokémon`;
            counterElement.style.color = "#cccccc"; // Cor normal
        } else {
            // Estado de carregamento ou erro
            counterElement.textContent = "Carregando...";
            counterElement.style.color = "#cccccc";
        }
    }
}

function showClearFilterButton() {
    const clearBtn = document.getElementById('clear-region-filter-btn');
    if (clearBtn) {
        clearBtn.style.display = 'block';
    }
}

function hideClearFilterButton() {
    const clearBtn = document.getElementById('clear-region-filter-btn');
    if (clearBtn) {
        clearBtn.style.display = 'none';
    }
}

// Expor as funções globalmente para integração com types.js
window.showClearFilterButton = showClearFilterButton;
window.hideClearFilterButton = hideClearFilterButton;

function setupClearFilterButton() {
    const clearBtn = document.getElementById('clear-region-filter-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            // Limpar filtros do chord diagram
            if (window.clearSpritesFilter) {
                window.clearSpritesFilter();
            }
            hideClearFilterButton();

            // Reset para a primeira página
            currentPage = 1;
            // Usar o ID da região atual em vez de hardcode
            loadRegionPokemonSprites(currentRegionId);

            // Resetar contadores
            updatePokemonCounters(null, 0);

            // Limpar filtros do distributplot
            clearDistributionPlotFilter();
        });
    }
}

// Expor função global para integração com o diagrama de acordes
window.updateRegionSpritesGrid = (filteredPokemons, typeA, typeB) => {
    // Reset para a primeira página quando aplicar filtros
    currentPage = 1;
    // Usar o ID da região atual em vez de tentar descobrir via DOM
    loadRegionPokemonSprites(currentRegionId, filteredPokemons);

    // Atualizar também o distributplot com os dados filtrados
    updateDistributionPlot(filteredPokemons);
};

// ...existing code...

// Função para inicializar o lazy loading de imagens (adaptada para paginação)
function initLazyLoading() {
    // Opções para o Intersection Observer
    const options = {
        root: document.getElementById('pokemon-sprites-grid'),
        rootMargin: '0px',
        threshold: 0.1
    };

    // Callback para quando uma imagem se torna visível
    const onIntersection = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.style.opacity = '1';
                img.onload = () => {
                    img.classList.remove('pokemon-sprite-lazy');
                };
                // Parar de observar após carregar
                observer.unobserve(img);
            }
        });
    };

    // Criar o observer
    const observer = new IntersectionObserver(onIntersection, options);

    // Observar todas as imagens com a classe pokemon-sprite-lazy da página atual
    document.querySelectorAll('#pokemon-sprites-grid .pokemon-sprite-lazy').forEach(img => {
        observer.observe(img);
    });
}

// Função para criar a tooltip do card de Pokémon
function createTooltipCard() {
    // Cria o elemento tooltip que vai conter o card
    const tooltipCard = document.createElement('div');
    tooltipCard.classList.add('pokemon-tooltip-card');
    document.body.appendChild(tooltipCard);

    return tooltipCard;
}

// Variável para controlar o listener global de mousemove
let globalMouseMoveActive = false;

// Função para debugar elementos fantasmas (dev helper)
function debugGhostElements() {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        console.log('🔍 Debugging ghost elements...');

        // Encontrar todos os elementos com listeners de evento
        const elementsWithListeners = document.querySelectorAll('*');
        const problematicElements = [];

        elementsWithListeners.forEach(element => {
            const style = window.getComputedStyle(element);

            // Verificar elementos posicionados que podem estar causando problemas
            if (style.position === 'absolute' || style.position === 'fixed') {
                if (style.pointerEvents !== 'none' &&
                    (style.opacity === '0' || style.visibility === 'hidden' ||
                        element.offsetWidth === 0 || element.offsetHeight === 0)) {
                    problematicElements.push({
                        element,
                        reason: 'Invisible but clickable positioned element',
                        styles: {
                            position: style.position,
                            opacity: style.opacity,
                            visibility: style.visibility,
                            pointerEvents: style.pointerEvents,
                            width: element.offsetWidth,
                            height: element.offsetHeight
                        }
                    });
                }
            }
        });

        if (problematicElements.length > 0) {
            console.warn('⚠️ Found potentially problematic elements:', problematicElements);
            // Opcional: remover elementos problemáticos automaticamente
            problematicElements.forEach(({ element }) => {
                if (element && !element.classList.contains('pokemon-tooltip-card')) {
                    element.style.pointerEvents = 'none';
                    console.log('🔧 Fixed element by setting pointer-events: none', element);
                }
            });
        } else {
            console.log('✅ No ghost elements detected');
        }
    }
}

// Função para limpar tooltips e listeners anteriores
function cleanupPreviousTooltips() {
    // Remove tooltips existentes da regionScreen
    const existingTooltips = document.querySelectorAll('.pokemon-tooltip-card');
    existingTooltips.forEach(tooltip => tooltip.remove());

    // Remove tooltips do types.js (chord diagram)
    const existingChordTooltips = document.querySelectorAll('.tooltip, #tooltip');
    existingChordTooltips.forEach(tooltip => tooltip.remove());

    // Remove tooltips de outros componentes (scatter, heatmaps, etc.)
    const existingOtherTooltips = document.querySelectorAll('.strongest-pokemon-tooltip, .d3-tooltip');
    existingOtherTooltips.forEach(tooltip => tooltip.remove());

    // Remove elementos D3.js órfãos que podem estar causando problemas
    const orphanedD3Elements = document.querySelectorAll('svg:empty, g:empty');
    orphanedD3Elements.forEach(element => {
        if (element.parentNode && !element.hasChildNodes()) {
            element.remove();
        }
    });

    // Remove listener global se ativo
    if (globalMouseMoveActive) {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        globalMouseMoveActive = false;
    }

    // Limpar qualquer estado de hover ou seleção anterior
    const activeElements = document.querySelectorAll('.active, .fade');
    activeElements.forEach(element => {
        element.classList.remove('active', 'fade');
    });

    // Forçar limpeza de any overflow ou elementos posicionados de forma absoluta órfãos
    const orphanedElements = document.querySelectorAll('[style*="position: absolute"]:not(.pokemon-tooltip-card)');
    orphanedElements.forEach(element => {
        // Verificar se o elemento está realmente órfão (sem parent container válido)
        const parentContainer = element.closest('.content-screen, .region-chart-container, .location-screen, .pokemon-screen');
        if (!parentContainer || parentContainer.innerHTML.trim() === '') {
            element.remove();
        }
    });
}

// Função para mostrar o tooltip com o card do Pokémon
function showPokemonCardTooltip(pokemon, event) {
    // Pega ou cria a tooltip
    let tooltipCard = document.querySelector('.pokemon-tooltip-card');
    if (!tooltipCard) {
        tooltipCard = createTooltipCard();
    }

    // Limpa o conteúdo atual
    tooltipCard.innerHTML = '';

    // Cria o card do Pokémon usando a função do cardsPokedex.js
    const card = createPokemonCard(pokemon);

    // Ajusta o card para servir como tooltip
    card.style.margin = '0';
    card.style.transform = 'none';
    card.style.transition = 'none';

    // Adiciona o card na tooltip
    tooltipCard.appendChild(card);

    // Posiciona a tooltip de acordo com a posição do mouse
    updateTooltipPosition(tooltipCard, event);

    // Ativa a tooltip
    tooltipCard.classList.add('active');

    // Ativa o listener global de mousemove apenas quando necessário
    if (!globalMouseMoveActive) {
        document.addEventListener('mousemove', handleGlobalMouseMove);
        globalMouseMoveActive = true;
    }
}

// Função para esconder o tooltip com o card do Pokémon
function hidePokemonCardTooltip() {
    const tooltipCard = document.querySelector('.pokemon-tooltip-card');
    if (tooltipCard) {
        tooltipCard.classList.remove('active');

        // Remove o listener global quando não há tooltip ativa
        if (globalMouseMoveActive) {
            document.removeEventListener('mousemove', handleGlobalMouseMove);
            globalMouseMoveActive = false;
        }
    }
}

// Função otimizada para lidar com mousemove global
function handleGlobalMouseMove(event) {
    const tooltipCard = document.querySelector('.pokemon-tooltip-card.active');
    if (tooltipCard) {
        updateTooltipPosition(tooltipCard, event);
    } else {
        // Se não há tooltip ativa, remove o listener para otimizar performance
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        globalMouseMoveActive = false;
    }
}

// Função para atualizar posição da tooltip
function updateTooltipPosition(tooltipCard, event) {
    // Calcula a posição para que o tooltip não saia da tela
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const tooltipWidth = tooltipCard.offsetWidth;
    const tooltipHeight = tooltipCard.offsetHeight;

    let left = event.clientX + 15;
    let top = event.clientY + 15;

    // Ajusta a posição se o tooltip estiver saindo da tela
    if (left + tooltipWidth > windowWidth - 20) {
        left = event.clientX - tooltipWidth - 15;
    }

    if (top + tooltipHeight > windowHeight - 20) {
        top = event.clientY - tooltipHeight - 15;
    }

    tooltipCard.style.left = `${left}px`;
    tooltipCard.style.top = `${top}px`;
}

// Função legada mantida para compatibilidade (agora chama a otimizada)
function moveTooltip(event) {
    const tooltipCard = document.querySelector('.pokemon-tooltip-card.active');
    if (tooltipCard) {
        updateTooltipPosition(tooltipCard, event);
    }
}

// Sistema de tooltip otimizado - listeners controlados dinamicamente
