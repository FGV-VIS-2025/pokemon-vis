// Importações
import { getRegions } from "./data.js";
import { regionLocations } from "./maps.js";
import { createPokemonScreen, editPokemonsCard } from "./pokemonScreen.js";
import { createRegionScreen } from "./regionScreen.js";
import { createLocationScreen } from "./locationScreen.js";

// Elementos do DOM
const regionsSelect = document.getElementById("regions-select");
const contentScreen = document.getElementById("content-container");
const mapRealContainer = document.getElementById("map-real-container");

// Variáveis globais
const regions = ["Kanto", "Johto", "Hoenn", "Sinnoh", "Unova", "Kalos"];
const colors = {
    "region-screen": "#3EDB2A",
    "location-screen": "#2AD2DB",
    "pokemon-screen": "#A11F62"
};

// Funções Principais
export async function loadRegions() {
    const regionsArray = await getRegions();
    regionsArray
        .filter(eachRegion => eachRegion.local_lan_id === 9 && regions.includes(eachRegion.name))
        .forEach(eachRegion => {
            const option = document.createElement("option");
            option.value = eachRegion.region_id;
            option.textContent = eachRegion.name;
            regionsSelect.appendChild(option);
        });
    return regionsArray;
}

export function buildMap(selectedRegion) {
    mapRealContainer.innerHTML = "";
    mapRealContainer.style.position = "relative";
    mapRealContainer.style.width = "100%";
    mapRealContainer.style.height = "100%";
    mapRealContainer.style.aspectRatio = "auto";

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
    img.src = `./assets/maps/${selectedRegion.name}.png`;
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


    function createAreaSVG(shape, coords, title) {
        return new Promise(resolve => {
            let el = null;
            if (shape === "rect" && coords.length === 4) {
                const [x1, y1, x2, y2] = coords;
                const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                rect.setAttribute("x", Math.min(x1, x2));
                rect.setAttribute("y", Math.min(y1, y2));
                rect.setAttribute("width", Math.abs(x2 - x1));
                rect.setAttribute("height", Math.abs(y2 - y1));
                rect.setAttribute("fill", "#FFD70088");
                rect.setAttribute("stroke", "#FF0000");
                rect.setAttribute("stroke-width", "2");
                rect.setAttribute("pointer-events", "auto");
                rect.setAttribute("data-title", title);
                el = rect;
            } else if (shape === "poly" && coords.length >= 6) {
                const points = coords.reduce((acc, val, i) => {
                    if (i % 2 === 0) acc.push(`${val},${coords[i + 1]}`);
                    return acc;
                }, []).join(" ");
                const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
                polygon.setAttribute("points", points);
                polygon.setAttribute("fill", "#FFD70088");
                polygon.setAttribute("stroke", "#FF0000");
                polygon.setAttribute("stroke-width", "2");
                polygon.setAttribute("pointer-events", "auto");
                polygon.setAttribute("data-title", title);
                el = polygon;
            }
            if (el) {
                el.addEventListener("mouseenter", function (e) {
                    tooltip.textContent = title;
                    tooltip.style.display = "block";
                });
                el.addEventListener("mousemove", function (e) {
                    const rect = mapRealContainer.getBoundingClientRect();
                    tooltip.style.left = (e.clientX - rect.left + 10) + "px";
                    tooltip.style.top = (e.clientY - rect.top + 10) + "px";
                });
                el.addEventListener("mouseleave", function () {
                    tooltip.style.display = "none";
                });
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

        const regionAreas = regionLocations[selectedRegion.name];
        if (regionAreas) {
            const areaRegex = /<area shape="(rect|poly)" coords="([^"]+)" title="([^"]+)"\s*\/?/g;
            let match;
            const areaPromises = [];
            while ((match = areaRegex.exec(regionAreas)) !== null) {
                const [shape, coordsStr, title] = [match[1], match[2], match[3]];
                const coords = coordsStr.split(',').map(c => parseInt(c.trim()));
                areaPromises.push(createAreaSVG(shape, coords, title));
            }

            const svgElements = await Promise.all(areaPromises);
            svgElements.forEach(el => { if (el) svg.appendChild(el); });
        }
        mapRealContainer.appendChild(svg);
    };
}

export function changeContent(selectedButton) {
    if (selectedButton.id === "pokemon-screen") {
        createPokemonScreen();
        editPokemonsCard();
    } else if (selectedButton.id === "region-screen") {
        createRegionScreen(3);
    } else if (selectedButton.id === "location-screen") {
        createLocationScreen(28);
    } else {
        contentScreen.innerHTML = ``;
        contentScreen.style.backgroundColor = colors[selectedButton.id];
    }
}