import { resetPokemonCarousel } from "./cardsPokedex.js";
import { getAllLocationsPokemonCount, getLocationsByRegionName } from "./dataManager.js";
import { locationElementMap } from "./mapManager.js";

const regionDisplay = document.getElementsByClassName("region-screen")[0];
const locationDisplay = document.getElementsByClassName("location-screen")[0];
const rightButtonRegion = document.getElementsByClassName("right-button")[0];
const leftButtonRegion = document.getElementsByClassName("left-button")[0];
const rightButton = document.getElementsByClassName("right-button")[1];
const leftButton = document.getElementsByClassName("left-button")[1];
const mapRealContainer = document.getElementsByClassName("map-left-screen")[0];

// Variáveis globais para controle de localização
let i = 0;
let listOfLocations = [];
let locationsWithPokemon = []; // Lista filtrada apenas com localizações que têm pokémon
let cachedRegionName = null; // Cache para evitar recálculos desnecessários

// Função para filtrar localizações que têm pokémon
async function getLocationsWithPokemon(regionName) {
    // Verificar se já temos os dados em cache para esta região
    if (cachedRegionName === regionName && locationsWithPokemon.length > 0) {
        return locationsWithPokemon;
    }

    const [allLocations, pokemonCounts] = await Promise.all([
        getLocationsByRegionName(regionName),
        getAllLocationsPokemonCount(regionName)
    ]);

    // Criar um mapa de contagem de pokémons por locationId
    const countMap = new Map(pokemonCounts.map(item => [item.locationId, item.count]));

    // Filtrar apenas localizações que têm pokémon (count > 0)
    const filtered = allLocations.filter(location => {
        const count = countMap.get(location.location_id) || 0;
        return count > 0;
    });

    // Atualizar cache
    cachedRegionName = regionName;
    locationsWithPokemon = filtered;

    console.log(`🔍 Filtradas ${filtered.length} localizações com pokémon de ${allLocations.length} total na região ${regionName}`);

    return filtered;
}

// Inicializar lista de localizações com pokémon
async function initializeLocationsList() {
    const regionName = regionDisplay.textContent.trim();
    const filtered = await getLocationsWithPokemon(regionName);
    listOfLocations = filtered; // Usar apenas localizações com pokémon

    if (listOfLocations.length > 0) {
        // Só resetar o índice se estivermos iniciando pela primeira vez ou se a lista mudou
        if (i >= listOfLocations.length) {
            i = 0; // Reset apenas se o índice atual for inválido
        }

        locationDisplay.textContent = listOfLocations[i].location_name;

        // Tentar selecionar a localização no mapa
        const currentLocationId = listOfLocations[i].location_id;
        const el = locationElementMap.get(currentLocationId);
        if (el) {
            // Remover animação de todos os elementos
            locationElementMap.forEach(element => {
                element.style.animation = "";
            });

            // Aplicar clique e animação ao elemento atual
            setTimeout(() => {
                el.dispatchEvent(new Event("click"));
                el.style.animation = "blink-border 1.5s infinite";
            }, 100);
        }

        console.log(`📍 Lista de localizações inicializada: ${listOfLocations.length} localizações com pokémon (índice atual: ${i})`);
    } else {
        console.warn(`⚠️ Nenhuma localização com pokémon encontrada na região: ${regionName}`);
        locationDisplay.textContent = "Sem localizações";
        i = 0;
    }
}

// Função específica para resetar para a primeira localização (usado quando região muda)
async function resetToFirstLocation() {
    const regionName = regionDisplay.textContent.trim();
    const filtered = await getLocationsWithPokemon(regionName);
    listOfLocations = filtered;

    if (listOfLocations.length > 0) {
        i = 0; // Forçar reset para primeira localização
        locationDisplay.textContent = listOfLocations[0].location_name;

        const firstLocationId = listOfLocations[0].location_id;
        const el = locationElementMap.get(firstLocationId);
        if (el) {
            locationElementMap.forEach(element => {
                element.style.animation = "";
            });

            setTimeout(() => {
                el.dispatchEvent(new Event("click"));
                el.style.animation = "blink-border 1.5s infinite";
            }, 100);
        }

        // Resetar carrossel de pokémons
        resetPokemonCarousel();

        console.log(`🔄 Reset para primeira localização: ${listOfLocations[0].location_name}`);
    }
}

// Inicializar ao carregar
initializeLocationsList();

// Listener para mudanças de região (quando os botões left/right da região são usados)
document.addEventListener('regionChanged', async (event) => {
    console.log('🌍 Região mudou, atualizando lista de localizações...');

    // Só atualizar se realmente mudou de região
    const currentRegionName = regionDisplay.textContent.trim();
    if (cachedRegionName !== currentRegionName) {
        await resetToFirstLocation(); // Usar função específica para reset

        // Disparar evento para outras partes do sistema se houver localizações
        if (listOfLocations.length > 0) {
            dispatchLocationChangeEvent(listOfLocations[0].location_name);
        }
    }
});

// Função para disparar evento de mudança de localização
function dispatchLocationChangeEvent(locationName) {
    const event = new CustomEvent('locationChanged', {
        detail: { locationName, source: 'location_control' }
    });
    document.dispatchEvent(event);
}

// Event listener para quando uma localização é selecionada no mapa
mapRealContainer.addEventListener('locationSelected', async (event) => {
    const { locationId, title } = event.detail;

    // Apenas sincronizar o índice sem reinicializar a lista
    const foundIndex = listOfLocations.findIndex(loc => loc.location_id === locationId);

    if (foundIndex !== -1) {
        i = foundIndex; // Sincronizar índice com a localização selecionada
        locationDisplay.textContent = listOfLocations[i].location_name;

        // Remove animação de todos os elementos anteriores
        locationElementMap.forEach(el => {
            el.style.animation = "";
        });

        // Aplica animação ao elemento selecionado
        const el = locationElementMap.get(locationId);
        if (el) {
            el.style.animation = "blink-border 1.5s infinite";
        }

        // Resetar carrossel de pokémons
        resetPokemonCarousel();

        console.log(`📍 Localização selecionada via mapa: ${listOfLocations[i].location_name} (índice: ${i})`);
    } else {
        console.warn(`Localização com ID ${locationId} não encontrada na lista de localizações com pokémon.`);
    }
});

rightButtonRegion.addEventListener("click", async function () {
    // Salvar região anterior para verificar se mudou
    const previousRegion = cachedRegionName;

    // Aguardar um momento para a região ser atualizada
    setTimeout(async () => {
        const currentRegionName = regionDisplay.textContent.trim();

        // Só resetar se a região realmente mudou
        if (previousRegion !== currentRegionName) {
            await resetToFirstLocation(); // Usar função específica para reset
        }
    }, 100);
});

leftButtonRegion.addEventListener("click", async function () {
    // Salvar região anterior para verificar se mudou
    const previousRegion = cachedRegionName;

    // Aguardar um momento para a região ser atualizada
    setTimeout(async () => {
        const currentRegionName = regionDisplay.textContent.trim();

        // Só resetar se a região realmente mudou
        if (previousRegion !== currentRegionName) {
            await resetToFirstLocation(); // Usar função específica para reset
        }
    }, 100);
});

rightButton.addEventListener("click", function () {
    // Verificar se há localizações disponíveis
    if (listOfLocations.length === 0) {
        console.warn("Nenhuma localização com pokémon disponível na região atual");
        return;
    }

    console.log(`➡️ Botão direito clicado. Índice atual: ${i}, Total: ${listOfLocations.length}`);

    // Adicionar feedback visual
    rightButton.style.transform = "scale(0.95)";
    setTimeout(() => {
        rightButton.style.transform = "scale(1)";
    }, 100);

    if (i < listOfLocations.length - 1) {
        i += 1;
    } else {
        i = 0;
    }

    console.log(`➡️ Novo índice: ${i}, Nova localização: ${listOfLocations[i].location_name}`);

    // Atualizar display da localização
    locationDisplay.textContent = listOfLocations[i].location_name;

    // Atualizar elemento no mapa
    const currentLocationId = listOfLocations[i].location_id;
    const el = locationElementMap.get(currentLocationId);
    if (el) {
        // Remover animação de todos os elementos
        locationElementMap.forEach(element => {
            element.style.animation = "";
        });

        // Aplicar clique e animação ao novo elemento
        el.dispatchEvent(new Event("click"));
        el.style.animation = "blink-border 1.5s infinite";
    }

    // Disparar evento para outras partes do sistema
    dispatchLocationChangeEvent(listOfLocations[i].location_name);

    // Resetar carrossel de pokémons
    resetPokemonCarousel();

    console.log(`📍 Localização alterada para: ${listOfLocations[i].location_name}`);
});

leftButton.addEventListener("click", function () {
    // Verificar se há localizações disponíveis
    if (listOfLocations.length === 0) {
        console.warn("Nenhuma localização com pokémon disponível na região atual");
        return;
    }

    console.log(`⬅️ Botão esquerdo clicado. Índice atual: ${i}, Total: ${listOfLocations.length}`);

    // Adicionar feedback visual
    leftButton.style.transform = "scale(0.95)";
    setTimeout(() => {
        leftButton.style.transform = "scale(1)";
    }, 100);

    if (i > 0) {
        i -= 1;
    } else {
        i = listOfLocations.length - 1;
    }

    console.log(`⬅️ Novo índice: ${i}, Nova localização: ${listOfLocations[i].location_name}`);

    // Atualizar display da localização
    locationDisplay.textContent = listOfLocations[i].location_name;

    // Atualizar elemento no mapa
    const currentLocationId = listOfLocations[i].location_id;
    const el = locationElementMap.get(currentLocationId);
    if (el) {
        // Remover animação de todos os elementos
        locationElementMap.forEach(element => {
            element.style.animation = "";
        });

        // Aplicar clique e animação ao novo elemento
        el.dispatchEvent(new Event("click"));
        el.style.animation = "blink-border 1.5s infinite";
    }

    // Disparar evento para outras partes do sistema
    dispatchLocationChangeEvent(listOfLocations[i].location_name);

    // Resetar carrossel de pokémons
    resetPokemonCarousel();

    console.log(`📍 Localização alterada para: ${listOfLocations[i].location_name}`);
});
