import { renderBarChartByRegion } from "./barchart.js";
import { gameRegionVersions, getPokemonsByGeneration, regionToGeneration } from "./dataManager.js";
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

    // Container da direita para os sprites dos Pokémons
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
    const spritesTitle = document.createElement('h2');
    spritesTitle.textContent = "Pokémons da Região";
    spritesTitle.style.color = 'white';
    spritesTitle.style.marginBottom = '15px';
    spritesTitle.style.fontFamily = '"Pixelify Sans", sans-serif';
    rightContainer.appendChild(spritesTitle);

    // Grid para os sprites
    const spritesGrid = document.createElement('div');
    spritesGrid.id = 'pokemon-sprites-grid';
    spritesGrid.style.display = 'grid';
    spritesGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(96px, 1fr))';
    spritesGrid.style.gap = '10px';
    spritesGrid.style.width = '100%';
    spritesGrid.style.justifyItems = 'center';
    rightContainer.appendChild(spritesGrid);

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

    // Carrega os sprites dos Pokémons da região
    loadRegionPokemonSprites(id_region);
}

// Função para carregar os sprites dos Pokémons de uma região
async function loadRegionPokemonSprites(regionId) {
    try {
        // Converter ID de região para nome (necessário para usar funções do dataManager)
        const regionNames = Object.keys(gameRegionVersions);
        const regionName = regionNames[regionId - 1] || "Kanto"; // Assumindo que os IDs começam em 1

        // Obter todos os Pokémon da geração correspondente à região
        const pokemonsFromGeneration = await getPokemonsByGeneration(regionName);

        // Obter o elemento grid onde serão inseridos os sprites
        const spritesGrid = document.getElementById('pokemon-sprites-grid');
        if (!spritesGrid) return;

        // Limpar o grid antes de adicionar novos sprites
        spritesGrid.innerHTML = '';

        // Verificar se há Pokémon para exibir
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

        // Adicionar os sprites dos Pokémons
        pokemonsFromGeneration.forEach(pokemon => {
            // Criar um container para o sprite e número
            const spriteContainer = document.createElement('div');
            spriteContainer.className = 'pokemon-sprite-container';
            spriteContainer.style.display = 'flex';
            spriteContainer.style.flexDirection = 'column';
            spriteContainer.style.alignItems = 'center';
            spriteContainer.style.justifyContent = 'center';
            spriteContainer.style.cursor = 'pointer';

            // Criar o elemento de imagem com lazy loading
            const img = document.createElement('img');
            img.width = 96;
            img.height = 96;
            img.alt = `${pokemon.name} #${pokemon.pokemon_id}`;
            img.style.imageRendering = 'pixelated';

            // Usar dataset para lazy loading
            img.dataset.src = `../assets/pokemons/${pokemon.pokemon_id}.png`;
            // Inicialmente mostrar placeholder
            img.src = '../assets/ball.png';
            img.style.opacity = '0.7';
            img.classList.add('pokemon-sprite-lazy');

            // Adicionar número e nome do Pokémon abaixo da imagem
            const numberLabel = document.createElement('span');
            numberLabel.textContent = `#${pokemon.pokemon_id} ${pokemon.name}`;
            numberLabel.style.color = 'white';
            numberLabel.style.fontSize = '12px';
            numberLabel.style.marginTop = '5px';
            numberLabel.style.fontFamily = '"Pixelify Sans", sans-serif';
            numberLabel.style.textAlign = 'center';

            // Adicionar tooltip com nome do Pokémon
            img.title = `${pokemon.name} #${pokemon.pokemon_id}`;

            // Tratamento de erro para imagens não encontradas
            img.onerror = function () {
                this.src = '../assets/ball.png'; // Imagem de fallback
                this.style.opacity = '0.5';
            };

            // Adicionar elementos ao container
            spriteContainer.appendChild(img);
            spriteContainer.appendChild(numberLabel);

            // Adicionar o container ao grid
            spritesGrid.appendChild(spriteContainer);
        });

        // Adicionar contador de Pokémons
        const countMessage = document.createElement('div');
        countMessage.textContent = `Total: ${pokemonsFromGeneration.length} Pokémons da Geração ${regionToGeneration[regionName]}`;
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

        // Inicializa o lazy loading após adicionar todos os sprites
        initLazyLoading();
    } catch (error) {
        console.error('Erro ao carregar sprites dos Pokémons:', error);
        const spritesGrid = document.getElementById('pokemon-sprites-grid');
        if (spritesGrid) {
            spritesGrid.innerHTML = `<p style="color: white; text-align: center; padding: 20px; grid-column: 1 / -1;">Erro ao carregar Pokémons: ${error.message}</p>`;
        }
    }
}

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
