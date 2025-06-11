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

function createChordContainer() {
    const leftChordContainer = document.createElement('div');
    leftChordContainer.id = 'region-chart-container';
    leftChordContainer.style.width = '48%';
    leftChordContainer.style.aspectRatio = '1 / 1';
    leftChordContainer.style.display = 'flex';
    leftChordContainer.style.justifyContent = 'center';
    leftChordContainer.style.alignItems = 'center';
    leftChordContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
    leftChordContainer.style.borderRadius = '10px';
    return leftChordContainer;
}

function createSpritesContainer() {
    const rightContainer = document.createElement('div');
    rightContainer.id = 'right-region-container';
    rightContainer.style.width = '48%';
    rightContainer.style.aspectRatio = '1 / 1';
    rightContainer.style.display = 'flex';
    rightContainer.style.flexDirection = 'column';
    rightContainer.style.justifyContent = 'flex-start';
    rightContainer.style.alignItems = 'center';
    rightContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
    rightContainer.style.borderRadius = '10px';
    rightContainer.style.padding = '20px';
    rightContainer.style.overflow = 'auto';

    // Título do container de sprites
    const title = document.createElement('h2');
    title.textContent = "Pokémons da Região";
    title.style.color = 'white';
    title.style.marginBottom = '15px';
    title.style.fontFamily = '"Pixelify Sans", sans-serif';
    rightContainer.appendChild(title);

    // Grid para os sprites
    const grid = document.createElement('div');
    grid.id = 'pokemon-sprites-grid';
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(96px, 1fr))';
    grid.style.gap = '10px';
    grid.style.width = '100%';
    grid.style.justifyItems = 'center';
    rightContainer.appendChild(grid);

    return rightContainer;
}

function createBarChartContainer() {
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
    return barChartContainer;
}

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

    // Modularizado: containers
    const leftChordContainer = createChordContainer();
    const rightContainer = createSpritesContainer();
    const barChartContainer = createBarChartContainer();

    // Adiciona os containers superiores ao topContainer
    topContainer.appendChild(leftChordContainer);
    topContainer.appendChild(rightContainer);

    // Adiciona os containers ao contentScreen
    contentScreen.appendChild(topContainer);
    contentScreen.appendChild(barChartContainer);

    // Chama os renderizadores passando os ids dos containers correspondentes
    updateTypeChordByRegion(id_region);          // irá desenhar no #region-chart-container

    // Carrega os pokémons da geração e desenha o boxplot
    getPokemonsByGeneration(Object.keys(gameRegionVersions)[id_region - 1] || "Kanto").then(pokemons => {
        drawDistributionPlot('#bar-chart-container', pokemons);
    });

    // Carrega os sprites dos Pokémons da região
    loadRegionPokemonSprites(id_region);
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
            noDataMessage.textContent = 'Nenhum Pokémon encontrado nesta geração.';
            noDataMessage.style.color = 'white';
            noDataMessage.style.gridColumn = '1 / -1';
            noDataMessage.style.textAlign = 'center';
            noDataMessage.style.padding = '20px';
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
            const img = document.createElement('img');
            img.width = 96;
            img.height = 96;
            img.alt = `${pokemon.name} #${pokemon.pokemon_id}`;
            img.style.imageRendering = 'pixelated';
            img.dataset.src = `../assets/pokemons/${pokemon.pokemon_id}.png`;
            img.src = '../assets/ball.png';
            img.style.opacity = '0.7';
            img.classList.add('pokemon-sprite-lazy');
            const numberLabel = document.createElement('span');
            numberLabel.textContent = `#${pokemon.pokemon_id} ${pokemon.name}`;
            numberLabel.style.color = 'white';
            numberLabel.style.fontSize = '12px';
            numberLabel.style.marginTop = '5px';
            numberLabel.style.fontFamily = '"Pixelify Sans", sans-serif';
            numberLabel.style.textAlign = 'center';
            img.title = `${pokemon.name} #${pokemon.pokemon_id}`;
            img.onerror = function () {
                this.src = '../assets/ball.png';
                this.style.opacity = '0.5';
            };
            spriteContainer.appendChild(img);
            spriteContainer.appendChild(numberLabel);
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
        // Adicionar contador de Pokémons
        const countMessage = document.createElement('div');
        countMessage.textContent = `Total: ${pokemonsFromGeneration.length} Pokémons exibidos`;
        countMessage.style.color = 'white';
        countMessage.style.fontFamily = '"Pixelify Sans", sans-serif';
        countMessage.style.fontSize = '16px';
        countMessage.style.padding = '15px';
        countMessage.style.textAlign = 'center';
        countMessage.style.gridColumn = '1 / -1';
        countMessage.style.marginTop = '20px';
        countMessage.style.fontWeight = 'bold';
        countMessage.style.borderTop = '1px solid rgba(255, 255, 255, 0.2)';
        spritesGrid.appendChild(countMessage);
        initLazyLoading();
    } catch (error) {
        console.error('Erro ao carregar sprites dos Pokémons:', error);
        const spritesGrid = document.getElementById('pokemon-sprites-grid');
        if (spritesGrid) {
            spritesGrid.innerHTML = `<p style="color: white; text-align: center; padding: 20px; grid-column: 1 / -1;">Erro ao carregar Pokémons: ${error.message}</p>`;
        }
    }
}

// Expor função global para integração com o diagrama de acordes
window.updateRegionSpritesGrid = (filteredPokemons, typeA, typeB) => {
    // Descobre a região atual pelo título do container
    const regionTitle = document.querySelector('#right-region-container h2');
    let regionId = 3; // fallback Hoenn
    if (regionTitle) {
        const regionNames = Object.keys(gameRegionVersions);
        for (let i = 0; i < regionNames.length; i++) {
            if (regionTitle.textContent.includes(regionNames[i])) {
                regionId = i + 1;
                break;
            }
        }
    }
    loadRegionPokemonSprites(regionId, filteredPokemons);
};

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
