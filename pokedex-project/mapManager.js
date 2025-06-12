import { loadCards } from "./cardsPokedex.js";
import { getAllLocationsPokemonCount, getLocationAreaByLocation, getPokemonsByMultipleLocationAreas } from "./dataManager.js";
import { regionLocations } from "./mapsConsts.js";

const mapRealContainer = document.getElementsByClassName("map-left-screen")[0];
const locationElementMap = new Map();
const pokemonCountCache = new Map();

// Função para inicializar os dados de uma região
async function initializeRegionData(regionName) {
    if (!pokemonCountCache.has(regionName)) {
        const counts = await getAllLocationsPokemonCount(regionName);
        const countMap = new Map(counts.map(item => [item.locationId, item.count]));
        pokemonCountCache.set(regionName, countMap);
    }
    return pokemonCountCache.get(regionName);
}

mapRealContainer.addEventListener('locationSelected', async (event) => {
    const { locationId, title } = event.detail;

    try {
        // Atualizar interface para mostrar o carregamento
        const cardsContainer = document.getElementsByClassName("cards-display")[0];
        if (cardsContainer) {
            cardsContainer.innerHTML = "<div style='text-align: center; padding: 20px;'>Carregando Pokémons...</div>";
        }

        // Buscar áreas de localização e nome da região em paralelo
        const [locationsAreaArray, regionName] = await Promise.all([
            getLocationAreaByLocation(locationId),
            Promise.resolve(document.getElementsByClassName("region-screen")[0].textContent.trim())
        ]);

        if (!locationsAreaArray || locationsAreaArray.length === 0) {
            console.warn(`Nenhuma área de localização encontrada para o ID: ${locationId}`);
            loadCards([]);
            return;
        }

        // Buscar pokémons nestas áreas
        const pokemonsArray = await getPokemonsByMultipleLocationAreas(locationsAreaArray, regionName);
        loadCards(pokemonsArray);
    } catch (error) {
        console.error("Erro ao carregar Pokémons:", error);
        loadCards([]);
    }
});

async function createAreaSVG(shape, coords, title, areaId, pokemonCountMap) {
    let el = null;

    if (shape === "rect" && coords.length === 4) {
        const [x1, y1, x2, y2] = coords;
        el = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        el.setAttribute("x", Math.min(x1, x2));
        el.setAttribute("y", Math.min(y1, y2));
        el.setAttribute("width", Math.abs(x2 - x1));
        el.setAttribute("height", Math.abs(y2 - y1));
    } else if (shape === "poly" && coords.length >= 6) {
        const points = coords.reduce((acc, val, i) =>
            i % 2 === 0 ? acc + ` ${val},` : acc + val, '').trim();
        el = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        el.setAttribute("points", points);
    }

    if (el) {
        el.setAttribute("fill", "transparent");
        el.setAttribute("stroke", "transparent");
        el.setAttribute("stroke-width", "1");
        el.style.transition = "fill 0.2s ease, stroke 0.2s ease, stroke-width 0.2s ease";
        el.setAttribute("pointer-events", "auto");
        el.setAttribute("data-title", title);
        el.setAttribute("data-location-area-id", areaId);

        const pokemonCount = pokemonCountMap.get(areaId) || 0;
        el.style.cursor = pokemonCount > 0 ? "pointer" : "default";

        setupElementEventListeners(el, title, areaId, pokemonCount);
        locationElementMap.set(areaId, el);
    }

    return el;
}

function setupElementEventListeners(el, title, areaId, pokemonCount) {
    const tooltip = document.querySelector('.map-tooltip') || createTooltip();

    el.addEventListener("mouseenter", () => {
        tooltip.textContent = pokemonCount > 0
            ? `${title} (${pokemonCount} Pokémons)`
            : `${title} (Sem Pokémons)`;
        tooltip.style.display = "block";

        if (el !== currentSelectedEl) {
            el.setAttribute("fill", pokemonCount > 0 ? "#ffffff33" : "#ff000033");
            el.setAttribute("stroke", pokemonCount > 0 ? "#ffffff" : "#ff0000");
        }
    });

    el.addEventListener("mousemove", (e) => {
        const rect = mapRealContainer.getBoundingClientRect();
        tooltip.style.left = (e.clientX - rect.left + 10) + "px";
        tooltip.style.top = (e.clientY - rect.top + 10) + "px";
    });

    el.addEventListener("mouseleave", () => {
        tooltip.style.display = "none";
        if (el !== currentSelectedEl) {
            el.setAttribute("fill", "transparent");
            el.setAttribute("stroke", "transparent");
        }
    });

    el.addEventListener("click", () => {
        if (pokemonCount > 0) {
            if (currentSelectedEl) {
                currentSelectedEl.setAttribute("fill", "transparent");
                currentSelectedEl.setAttribute("stroke", "transparent");
            }
            currentSelectedEl = el;
            el.setAttribute("fill", "#ffffff66");
            el.setAttribute("stroke", "#ffffff");
            el.setAttribute("stroke-width", "2");

            mapRealContainer.dispatchEvent(new CustomEvent('locationSelected', {
                detail: { locationId: areaId, title }
            }));
        }
    });
}

function createTooltip() {
    const tooltip = document.createElement("div");
    tooltip.className = 'map-tooltip';
    Object.assign(tooltip.style, {
        position: "absolute",
        background: "#222",
        color: "#fff",
        padding: "4px 8px",
        borderRadius: "4px",
        pointerEvents: "none",
        fontSize: "14px",
        zIndex: 10,
        display: "none",
        whiteSpace: "nowrap",
        boxShadow: "0 2px 8px #0006"
    });
    mapRealContainer.appendChild(tooltip);
    return tooltip;
}

export function buildMap(selectedRegion) {
    return new Promise(async (resolveMapBuild) => {
        // Inicializar dados da região em paralelo com a construção do mapa
        const pokemonCountMapPromise = initializeRegionData(selectedRegion.name);

        mapRealContainer.innerHTML = "";
        mapRealContainer.style.position = "relative";
        mapRealContainer.style.width = "100%";
        mapRealContainer.style.height = "100%";
        mapRealContainer.style.display = "flex";
        mapRealContainer.style.alignItems = "center";
        mapRealContainer.style.justifyContent = "center";

        createTooltip();

        const img = document.createElement("img");
        img.src = `../assets/maps/${selectedRegion.name}.png`;
        Object.assign(img.style, {
            position: "absolute",
            zIndex: 1,
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            objectFit: "contain"
        });
        mapRealContainer.appendChild(img);

        img.onload = async function () {
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            Object.assign(svg.style, {
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 2,
                width: "100%",
                height: "100%"
            });
            svg.setAttribute("viewBox", `0 0 ${img.naturalWidth} ${img.naturalHeight}`);
            svg.setAttribute("pointer-events", "none");

            const [pokemonCountMap, regionAreas] = await Promise.all([
                pokemonCountMapPromise,
                Promise.resolve(regionLocations[selectedRegion.name])
            ]);

            if (regionAreas) {
                const areaRegex = /<area shape="(rect|poly)" coords="([^"]+)" title="([^"]+)"\s*id=(\d+)\s*\/?\>/g;
                const areaPromises = [];
                let match;

                while ((match = areaRegex.exec(regionAreas)) !== null) {
                    const [_, shape, coordsStr, title, areaId] = match;
                    const coords = coordsStr.split(',').map(c => parseInt(c.trim()));
                    areaPromises.push(createAreaSVG(shape, coords, title, parseInt(areaId, 10), pokemonCountMap));
                }

                const svgElements = await Promise.all(areaPromises);
                const svgContainer = document.createDocumentFragment();
                svgElements.forEach(el => {
                    if (el) {
                        svgContainer.appendChild(el);
                    }
                });
                svg.appendChild(svgContainer);
            }
            mapRealContainer.appendChild(svg);
            resolveMapBuild();
        };
    });
}

let currentSelectedEl = null;

export function selectLocationOnMap(locationId) {
    const el = locationElementMap.get(locationId);
    if (el) {
        el.dispatchEvent(new Event("click"));
        return true;
    }
    return false;
}

export { locationElementMap };
