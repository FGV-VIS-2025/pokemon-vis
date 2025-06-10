import { renderBarChartByRegion } from "./barchart.js";
import { gameRegionVersions, getLocationAreaByLocation, getLocationsByRegionName, getPokemonsByMultipleLocationAreas } from "./dataManager.js";
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

        // Obter todas as localizações da região
        const locations = await getLocationsByRegionName(regionName);

        // Conjunto para armazenar IDs únicos de Pokémon
        const uniquePokemonIds = new Set();

        // Para cada localização, obter as áreas e seus Pokémons
        for (const location of locations) {
            // Obter áreas da localização
            const locationAreas = await getLocationAreaByLocation(location.location_id);

            // Se houver áreas, obter seus Pokémons
            if (locationAreas && locationAreas.length > 0) {
                // Obter Pokémons das áreas desta localização
                const pokemons = await getPokemonsByMultipleLocationAreas(locationAreas, regionName);

                // Adicionar IDs únicos ao conjunto
                pokemons.forEach(pokemon => {
                    uniquePokemonIds.add(pokemon.pokemon_id);
                });
            }
        }

        // Converter o conjunto para um array e ordenar
        const pokemonIds = Array.from(uniquePokemonIds).sort((a, b) => a - b);

        // Obter o elemento grid onde serão inseridos os sprites
        const spritesGrid = document.getElementById('pokemon-sprites-grid');
        if (!spritesGrid) return;

        // Limpar o grid antes de adicionar novos sprites
        spritesGrid.innerHTML = '';

        // Adicionar os sprites dos Pokémons
        pokemonIds.forEach(pokemonId => {
            // Criar um container para o sprite e número
            const spriteContainer = document.createElement('div');
            spriteContainer.className = 'pokemon-sprite-container';
            spriteContainer.style.display = 'flex';
            spriteContainer.style.flexDirection = 'column';
            spriteContainer.style.alignItems = 'center';
            spriteContainer.style.justifyContent = 'center';
            spriteContainer.style.cursor = 'pointer';

            // Criar o elemento de imagem
            const img = document.createElement('img');
            img.src = `../assets/pokemons/${pokemonId}.png`;
            img.width = 96;
            img.height = 96;
            img.alt = `Pokémon #${pokemonId}`;
            img.style.imageRendering = 'pixelated'; // Para manter o visual pixelado

            // Adicionar número do Pokémon abaixo da imagem
            const numberLabel = document.createElement('span');
            numberLabel.textContent = `#${pokemonId}`;
            numberLabel.style.color = 'white';
            numberLabel.style.fontSize = '12px';
            numberLabel.style.marginTop = '5px';
            numberLabel.style.fontFamily = '"Pixelify Sans", sans-serif';

            // Adicionar tooltip com nome do Pokémon (se disponível)
            img.title = `Pokémon #${pokemonId}`;

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

        // Mensagem se nenhum Pokémon for encontrado
        if (pokemonIds.length === 0) {
            const noDataMessage = document.createElement('p');
            noDataMessage.textContent = 'Nenhum Pokémon encontrado nesta região.';
            noDataMessage.style.color = 'white';
            noDataMessage.style.gridColumn = '1 / -1';
            noDataMessage.style.textAlign = 'center';
            noDataMessage.style.padding = '20px';
            spritesGrid.appendChild(noDataMessage);
        } else {
            // Adicionar contador de Pokémons
            const countMessage = document.createElement('div');
            countMessage.textContent = `Total: ${pokemonIds.length} Pokémons`;
            countMessage.style.color = 'white';
            countMessage.style.gridColumn = '1 / -1';
            countMessage.style.textAlign = 'center';
            countMessage.style.padding = '15px 0';
            countMessage.style.fontWeight = 'bold';
            countMessage.style.borderTop = '1px solid rgba(255, 255, 255, 0.2)';
            countMessage.style.marginTop = '15px';
            spritesGrid.appendChild(countMessage);
        }
    } catch (error) {
        console.error('Erro ao carregar sprites dos Pokémons:', error);
        const spritesGrid = document.getElementById('pokemon-sprites-grid');
        if (spritesGrid) {
            spritesGrid.innerHTML = '<p style="color: white; text-align: center;">Erro ao carregar dados dos Pokémons.</p>';
        }
    }
}
