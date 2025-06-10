import { loadCards } from "./cardsPokedex.js";
import { getAllLocationsPokemonCount, getLocationAreaByLocation, getPokemonsByMultipleLocationAreas } from "./dataManager.js";
import { regionLocations } from "./mapsConsts.js";

const mapRealContainer = document.getElementsByClassName("map-left-screen")[0];
const locationElementMap = new Map();

mapRealContainer.addEventListener('locationSelected', async (event) => {
    const { locationId, title } = event.detail;

    const locationsAreaArray = await getLocationAreaByLocation(locationId);
    const pokemonsArray = await getPokemonsByMultipleLocationAreas(locationsAreaArray, "Kanto");
    loadCards(pokemonsArray);
});

export function buildMap(selectedRegion) {
    mapRealContainer.innerHTML = "";
    mapRealContainer.style.position = "relative";
    mapRealContainer.style.width = "100%";
    mapRealContainer.style.height = "100%";
    mapRealContainer.style.display = "flex";
    mapRealContainer.style.alignItems = "center";
    mapRealContainer.style.justifyContent = "center";

    let tooltip = document.createElement("div");
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

    // Track currently selected route element for highlight
    let currentSelectedEl = null;

    // Carregar a contagem de pokémons para todas as localizações da região atual
    let pokemonCountMap = new Map();

    async function loadPokemonCounts() {
        const counts = await getAllLocationsPokemonCount(selectedRegion.name);
        counts.forEach(item => {
            pokemonCountMap.set(item.locationId, item.count);
        });
        return counts;
    }

    function createAreaSVG(shape, coords, title, areaId) {
        return new Promise(resolve => {
            let el = null;
            if (shape === "rect" && coords.length === 4) {
                const [x1, y1, x2, y2] = coords;
                const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                rect.setAttribute("x", Math.min(x1, x2));
                rect.setAttribute("y", Math.min(y1, y2));
                rect.setAttribute("width", Math.abs(x2 - x1));
                rect.setAttribute("height", Math.abs(y2 - y1));
                // Apply base style: hidden by default
                rect.setAttribute("fill", "transparent");
                rect.setAttribute("stroke", "transparent");
                rect.setAttribute("stroke-width", "1");
                rect.style.transition = "fill 0.2s ease, stroke 0.2s ease, stroke-width 0.2s ease";
                rect.setAttribute("pointer-events", "auto");
                rect.setAttribute("data-title", title);
                rect.setAttribute("data-location-area-id", areaId);
                el = rect;
            } else if (shape === "poly" && coords.length >= 6) {
                const points = coords.reduce((acc, val, i) => {
                    if (i % 2 === 0) acc.push(`${val},${coords[i + 1]}`);
                    return acc;
                }, []).join(" ");
                const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
                polygon.setAttribute("points", points);
                // Apply base style: hidden by default
                polygon.setAttribute("fill", "transparent");
                polygon.setAttribute("stroke", "transparent");
                polygon.setAttribute("stroke-width", "1");
                polygon.style.transition = "fill 0.2s ease, stroke 0.2s ease, stroke-width 0.2s ease";
                polygon.setAttribute("pointer-events", "auto");
                polygon.setAttribute("data-title", title);
                polygon.setAttribute("data-location-area-id", areaId);
                el = polygon;
            }
            if (el) {
                // Verificar contagem de pokémons após carregar
                const updateCursorStyle = () => {
                    const pokemonCount = pokemonCountMap.get(areaId) || 0;
                    el.style.cursor = pokemonCount > 0 ? "pointer" : "default";
                };

                // Configurar inicialmente e atualizar quando os dados estiverem disponíveis
                updateCursorStyle();

                el.addEventListener("mouseenter", function (e) {
                    const pokemonCount = pokemonCountMap.get(areaId) || 0;

                    // Definir texto e estilo do tooltip com base na contagem de pokémons
                    if (pokemonCount === 0) {
                        tooltip.textContent = `${title} (0 Pokémons)`;
                        tooltip.style.color = "#aaa"; // Cor cinza para locais sem pokémons
                    } else {
                        tooltip.textContent = `${title} (${pokemonCount} Pokémons)`;
                        tooltip.style.color = "#fff"; // Cor branca normal
                    }

                    tooltip.style.display = "block";

                    // Aplicar destaque diferente para áreas sem pokémons
                    if (el !== currentSelectedEl) {
                        if (pokemonCount === 0) {
                            // Destaque mais suave/cinza para áreas sem pokémons
                            el.setAttribute("fill", "#77777755");
                            el.setAttribute("stroke", "#777777");
                            el.setAttribute("stroke-width", "1");
                        } else {
                            // Destaque normal para áreas com pokémons
                            el.setAttribute("fill", "#FFD70055");
                            el.setAttribute("stroke", "#FFD700");
                            el.setAttribute("stroke-width", "2");
                        }
                    }
                });
                el.addEventListener("mousemove", function (e) {
                    const rect = mapRealContainer.getBoundingClientRect();
                    tooltip.style.left = (e.clientX - rect.left + 10) + "px";
                    tooltip.style.top = (e.clientY - rect.top + 10) + "px";
                });
                el.addEventListener("mouseleave", function () {
                    tooltip.style.display = "none";
                    // Remove hover highlight if not selected
                    if (el !== currentSelectedEl) {
                        el.setAttribute("fill", "transparent");
                        el.setAttribute("stroke", "transparent");
                        el.setAttribute("stroke-width", "1");
                    }
                });
                el.addEventListener("click", function (e) {
                    e.stopPropagation();

                    // Verificar se há pokémons nesta localização
                    const pokemonCount = pokemonCountMap.get(areaId) || 0;

                    // Se não houver pokémons, não permite selecionar
                    if (pokemonCount === 0) {
                        return;
                    }

                    // Remove previous selection highlight
                    if (currentSelectedEl && currentSelectedEl !== el) {
                        currentSelectedEl.setAttribute("fill", "transparent");
                        currentSelectedEl.setAttribute("stroke", "transparent");
                        currentSelectedEl.setAttribute("stroke-width", "1");
                    }
                    // Apply selected highlight
                    currentSelectedEl = el;
                    el.setAttribute("fill", "#00CAFF55");
                    el.setAttribute("stroke", "#00CAFF");
                    el.setAttribute("stroke-width", "3");
                    // Notify selection
                    mapRealContainer.dispatchEvent(new CustomEvent('locationSelected', { detail: { locationId: areaId, title } }));
                });
            }
            if (el) {
                locationElementMap.set(areaId, el);
            }

            resolve(el);
        });
    }

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

        // Carregar contagem de pokémons antes de construir as áreas
        await loadPokemonCounts();

        const regionAreas = regionLocations[selectedRegion.name];
        if (regionAreas) {
            const areaRegex = /<area shape="(rect|poly)" coords="([^"]+)" title="([^"]+)"\s*id=(\d+)\s*\/?\>/g;
            let match;
            const areaPromises = [];
            while ((match = areaRegex.exec(regionAreas)) !== null) {
                const shape = match[1], coordsStr = match[2], title = match[3];
                const areaId = parseInt(match[4], 10);
                const coords = coordsStr.split(',').map(c => parseInt(c.trim()));
                areaPromises.push(createAreaSVG(shape, coords, title, areaId));
            }

            const svgElements = await Promise.all(areaPromises);
            svgElements.forEach(el => { if (el) svg.appendChild(el); });
        }
        mapRealContainer.appendChild(svg);
    };
}

export { locationElementMap };
