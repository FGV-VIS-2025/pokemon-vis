import { createPokemonCard } from "./cardsPokedex.js";
import { gameRegionVersions, getPokemonsByGeneration } from "./dataManager.js";
import { drawDistributionPlot } from "./distributplot.js";
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

function createRegionInfoBar() {
    const regionInfo = document.createElement("div");
    regionInfo.classList.add("region-info-bar");
    regionInfo.style.width = "90%";
    regionInfo.style.padding = "15px";
    regionInfo.style.borderRadius = "12px";
    regionInfo.style.backgroundColor = "#f2f2f2";
    regionInfo.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.1)";
    regionInfo.style.display = "flex";
    regionInfo.style.alignItems = "center";
    regionInfo.style.gap = "15px";
    regionInfo.style.marginTop = "20px";
    regionInfo.style.marginBottom = "20px";
    regionInfo.style.position = "relative";
    regionInfo.style.justifyContent = "space-between";
    regionInfo.style.fontFamily = '"Pixelify Sans", sans-serif';
    regionInfo.style.fontSize = "1em";
    regionInfo.style.fontWeight = "600";
    regionInfo.style.color = "#333";

    const leftSection = document.createElement("div");
    leftSection.style.display = "flex";
    leftSection.style.alignItems = "center";
    leftSection.style.gap = "10px";

    const regionIcon = document.createElement("img");
    regionIcon.src = "../assets/earth-globe.png";
    regionIcon.style.height = "28px";
    regionIcon.style.width = "28px";
    regionIcon.style.objectFit = "contain";

    const regionText = document.createElement("span");
    regionText.textContent = "Explore os tipos de Pokémon da região";
    regionText.style.fontSize = "1.1em";

    leftSection.appendChild(regionIcon);
    leftSection.appendChild(regionText);

    const rightSection = document.createElement("div");
    rightSection.style.display = "flex";
    rightSection.style.alignItems = "center";
    rightSection.style.gap = "15px";

    // Contador de pokémons total
    const totalCounter = document.createElement("div");
    totalCounter.id = "total-pokemon-counter";
    totalCounter.style.display = "flex";
    totalCounter.style.alignItems = "center";
    totalCounter.style.gap = "5px";
    totalCounter.style.backgroundColor = "#e8e8e8";
    totalCounter.style.padding = "8px 12px";
    totalCounter.style.borderRadius = "8px";
    totalCounter.style.fontSize = "0.9em";
    totalCounter.innerHTML = `
        <img src="../assets/pokeball.png" style="width: 16px; height: 16px;">
        <span>Total: <strong id="total-count">0</strong></span>
    `;

    // Contador de pokémons filtrados
    const filteredCounter = document.createElement("div");
    filteredCounter.id = "filtered-pokemon-counter";
    filteredCounter.style.display = "flex";
    filteredCounter.style.alignItems = "center";
    filteredCounter.style.gap = "5px";
    filteredCounter.style.backgroundColor = "#dbeafe";
    filteredCounter.style.padding = "8px 12px";
    filteredCounter.style.borderRadius = "8px";
    filteredCounter.style.fontSize = "0.9em";
    filteredCounter.style.display = "none";
    filteredCounter.innerHTML = `
        <img src="../assets/chart.png" style="width: 16px; height: 16px;">
        <span>Filtrados: <strong id="filtered-count">0</strong></span>
    `;

    rightSection.appendChild(totalCounter);
    rightSection.appendChild(filteredCounter);

    regionInfo.appendChild(leftSection);
    regionInfo.appendChild(rightSection);

    return regionInfo;
}



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
    leftChordContainer.style.width = '48%';
    leftChordContainer.style.aspectRatio = '1 / 1';
    leftChordContainer.style.display = 'flex';
    leftChordContainer.style.flexDirection = 'column';
    leftChordContainer.style.justifyContent = 'flex-start';
    leftChordContainer.style.alignItems = 'center';
    leftChordContainer.style.backgroundColor = '#1b1b1b';
    leftChordContainer.style.borderRadius = '10px';
    leftChordContainer.style.border = '1px solid #ffffff';
    leftChordContainer.style.padding = '15px';
    leftChordContainer.style.boxSizing = 'border-box';

    // Título e instruções para o chord diagram
    const chordTitle = document.createElement('h3');
    chordTitle.textContent = "Relações Entre Tipos";
    chordTitle.style.color = 'white';
    chordTitle.style.marginBottom = '10px';
    chordTitle.style.fontFamily = '"Pixelify Sans", sans-serif';
    chordTitle.style.fontSize = '1.1em';
    chordTitle.style.textAlign = 'center';
    leftChordContainer.appendChild(chordTitle);

    const chordInstructions = document.createElement('p');
    chordInstructions.innerHTML = "Clique nos <strong>tipos</strong> ou <strong>conexões</strong> para filtrar os Pokémon";
    chordInstructions.style.color = '#cccccc';
    chordInstructions.style.fontSize = '0.8em';
    chordInstructions.style.textAlign = 'center';
    chordInstructions.style.marginBottom = '15px';
    chordInstructions.style.fontFamily = '"Pixelify Sans", sans-serif';
    chordInstructions.style.lineHeight = '1.2';
    leftChordContainer.appendChild(chordInstructions);

    // Container interno para o gráfico
    const chordGraphContainer = document.createElement('div');
    chordGraphContainer.id = 'chord-graph-container';
    chordGraphContainer.style.width = '100%';
    chordGraphContainer.style.height = '100%';
    chordGraphContainer.style.display = 'flex';
    chordGraphContainer.style.justifyContent = 'center';
    chordGraphContainer.style.alignItems = 'center';
    leftChordContainer.appendChild(chordGraphContainer);

    // Container para os sprites dos pokémons
    const rightContainer = document.createElement('div');
    rightContainer.id = 'right-region-container';
    rightContainer.style.width = '48%';
    rightContainer.style.aspectRatio = '1 / 1';
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
    spriteHeader.style.justifyContent = 'space-between';
    spriteHeader.style.alignItems = 'center';
    spriteHeader.style.marginBottom = '15px';

    const title = document.createElement('h3');
    title.textContent = "Pokémons da Região";
    title.style.color = 'white';
    title.style.margin = '0';
    title.style.fontFamily = '"Pixelify Sans", sans-serif';
    title.style.fontSize = '1.1em';

    // Botão para limpar filtro
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

    clearFilterBtn.addEventListener('mouseenter', () => {
        clearFilterBtn.style.backgroundColor = '#357abd';
    });
    clearFilterBtn.addEventListener('mouseleave', () => {
        clearFilterBtn.style.backgroundColor = '#4a90e2';
    });

    spriteHeader.appendChild(title);
    spriteHeader.appendChild(clearFilterBtn);
    rightContainer.appendChild(spriteHeader);

    // Container scrollável para os sprites
    const spriteScrollContainer = document.createElement('div');
    spriteScrollContainer.style.width = '100%';
    spriteScrollContainer.style.height = '100%';
    spriteScrollContainer.style.overflow = 'auto';
    spriteScrollContainer.style.scrollbarWidth = 'thin';

    // Grid para os sprites
    const grid = document.createElement('div');
    grid.id = 'pokemon-sprites-grid';
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(80px, 1fr))';
    grid.style.gap = '8px';
    grid.style.width = '100%';
    grid.style.justifyItems = 'center';
    grid.style.padding = '0 5px';
    spriteScrollContainer.appendChild(grid);
    rightContainer.appendChild(spriteScrollContainer);

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

    // Container para gráfico de distribuição (similar aos svg containers do pokemon screen)
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
    svg1.style.height = "600px";
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

    // Container interno para o gráfico de distribuição
    const barChartContainer = document.createElement('div');
    barChartContainer.id = 'bar-chart-container';
    barChartContainer.style.width = '100%';
    barChartContainer.style.height = '100%';
    barChartContainer.style.display = 'flex';
    barChartContainer.style.justifyContent = 'center';
    barChartContainer.style.alignItems = 'center';
    svg1.appendChild(barChartContainer);

    svgPai1.appendChild(svg1);
    additionalArea.appendChild(svgPai1);

    return additionalArea;
}

export function createRegionScreen(id_region = 3) {
    contentScreen.scrollTo(0, 0);
    contentScreen.innerHTML = '';
    contentScreen.style.gap = "0";
    contentScreen.style.justifyContent = '';
    contentScreen.style.display = 'flex';
    contentScreen.style.flexDirection = 'column';
    contentScreen.style.alignItems = 'center';

    // Criar elementos seguindo o padrão melhorado
    const regionInfo = createRegionInfoBar();
    const descriptionArea = createRegionDescription();
    const additionalArea = createAdditionalChartsArea();

    // Adicionar todos os elementos ao contentScreen
    contentScreen.appendChild(regionInfo);
    contentScreen.appendChild(descriptionArea);
    contentScreen.appendChild(additionalArea);

    // Chama os renderizadores passando os ids dos containers correspondentes
    updateTypeChordByRegion(id_region);          // irá desenhar no #chord-graph-container

    // Carrega os pokémons da geração e desenha o boxplot
    getPokemonsByGeneration(Object.keys(gameRegionVersions)[id_region - 1] || "Kanto").then(pokemons => {
        drawDistributionPlot('#bar-chart-container', pokemons);
        // Atualiza o contador total
        updatePokemonCounters(pokemons.length, 0);
    });

    // Carrega os sprites dos Pokémons da região
    loadRegionPokemonSprites(id_region);

    // Configurar o botão de limpar filtro
    setupClearFilterButton();
}

// Função para carregar os sprites dos Pokémons de uma região
async function loadRegionPokemonSprites(regionId, pokemonsList = null) {
    try {
        const regionNames = Object.keys(gameRegionVersions);
        const regionName = regionNames[regionId - 1] || "Kanto";
        // Se receber uma lista filtrada, usa ela, senão busca todos da geração
        const pokemonsFromGeneration = pokemonsList || await getPokemonsByGeneration(regionName);
        const spritesGrid = document.getElementById('pokemon-sprites-grid');
        if (!spritesGrid) return;

        spritesGrid.innerHTML = '';

        if (pokemonsFromGeneration.length === 0) {
            const noDataMessage = document.createElement('p');
            noDataMessage.textContent = 'Nenhum Pokémon encontrado para os tipos selecionados.';
            noDataMessage.style.color = 'white';
            noDataMessage.style.gridColumn = '1 / -1';
            noDataMessage.style.textAlign = 'center';
            noDataMessage.style.padding = '20px';
            noDataMessage.style.fontFamily = '"Pixelify Sans", sans-serif';
            spritesGrid.appendChild(noDataMessage);
            return;
        }

        pokemonsFromGeneration.forEach(pokemon => {
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
            img.width = 72;
            img.height = 72;
            img.alt = `${pokemon.name} #${pokemon.pokemon_id}`;
            img.style.imageRendering = 'pixelated';
            img.dataset.src = `../assets/pokemons/${pokemon.pokemon_id}.png`;
            img.src = '../assets/ball.png';
            img.style.opacity = '0.7';
            img.classList.add('pokemon-sprite-lazy');

            const numberLabel = document.createElement('span');
            numberLabel.textContent = `#${pokemon.pokemon_id}`;
            numberLabel.style.color = '#cccccc';
            numberLabel.style.fontSize = '10px';
            numberLabel.style.marginTop = '3px';
            numberLabel.style.fontFamily = '"Pixelify Sans", sans-serif';
            numberLabel.style.textAlign = 'center';

            const nameLabel = document.createElement('span');
            nameLabel.textContent = pokemon.name;
            nameLabel.style.color = 'white';
            nameLabel.style.fontSize = '10px';
            nameLabel.style.fontFamily = '"Pixelify Sans", sans-serif';
            nameLabel.style.textAlign = 'center';
            nameLabel.style.fontWeight = '600';
            nameLabel.style.maxWidth = '80px';
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

            spriteContainer.addEventListener('mousemove', (event) => {
                moveTooltip(event);
            });
        });

        // Atualizar contadores
        const isFiltered = pokemonsList !== null;
        if (isFiltered) {
            updatePokemonCounters(null, pokemonsFromGeneration.length);
            showClearFilterButton();
        } else {
            updatePokemonCounters(pokemonsFromGeneration.length, 0);
            hideClearFilterButton();
        }

        initLazyLoading();
    } catch (error) {
        console.error('Erro ao carregar sprites dos Pokémons:', error);
        const spritesGrid = document.getElementById('pokemon-sprites-grid');
        if (spritesGrid) {
            spritesGrid.innerHTML = `<p style="color: white; text-align: center; padding: 20px; grid-column: 1 / -1;">Erro ao carregar Pokémons: ${error.message}</p>`;
        }
    }
}

// Funções utilitárias para melhorar a interação
function updatePokemonCounters(totalCount, filteredCount) {
    const totalCountEl = document.getElementById('total-count');
    const filteredCountEl = document.getElementById('filtered-count');
    const filteredCounter = document.getElementById('filtered-pokemon-counter');

    if (totalCount !== null && totalCountEl) {
        totalCountEl.textContent = totalCount;
    }

    if (filteredCountEl && filteredCounter) {
        if (filteredCount > 0) {
            filteredCountEl.textContent = filteredCount;
            filteredCounter.style.display = 'flex';
        } else {
            filteredCounter.style.display = 'none';
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

            // Recarregar todos os pokémons da região
            const regionNames = Object.keys(gameRegionVersions);
            const currentRegion = document.querySelector('.region-screen')?.textContent?.trim() || 'Kanto';
            const regionIndex = regionNames.indexOf(currentRegion);
            const regionId = regionIndex >= 0 ? regionIndex + 1 : 3;

            loadRegionPokemonSprites(regionId);
        });
    }
}

// Expor função global para integração com o diagrama de acordes
window.updateRegionSpritesGrid = (filteredPokemons, typeA, typeB) => {
    // Descobre a região atual pelo título do container
    const regionDisplay = document.querySelector('.region-screen');
    let regionId = 3; // fallback Hoenn

    if (regionDisplay) {
        const regionNames = Object.keys(gameRegionVersions);
        const currentRegion = regionDisplay.textContent.trim();
        const regionIndex = regionNames.indexOf(currentRegion);
        if (regionIndex >= 0) {
            regionId = regionIndex + 1;
        }
    }

    loadRegionPokemonSprites(regionId, filteredPokemons);
};

// ...existing code...

// Função para inicializar o lazy loading de imagens
function initLazyLoading() {
    // Opções para o Intersection Observer
    const options = {
        root: document.getElementById('right-region-container'),
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

    // Observar todas as imagens com a classe pokemon-sprite-lazy
    document.querySelectorAll('.pokemon-sprite-lazy').forEach(img => {
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
    tooltipCard.style.left = `${event.clientX}px`;
    tooltipCard.style.top = `${event.clientY}px`;

    // Ativa a tooltip
    tooltipCard.classList.add('active');
}

// Função para esconder o tooltip com o card do Pokémon
function hidePokemonCardTooltip() {
    const tooltipCard = document.querySelector('.pokemon-tooltip-card');
    if (tooltipCard) {
        tooltipCard.classList.remove('active');
    }
}

// Função para mover o tooltip com o mouse
function moveTooltip(event) {
    const tooltipCard = document.querySelector('.pokemon-tooltip-card.active');
    if (tooltipCard) {
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
}

// Adiciona o listener para mover o tooltip com o mouse
document.addEventListener('mousemove', moveTooltip);
