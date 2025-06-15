import { tipoTraduzido, shape_id_to_name } from "./consts.js"

export async function createKnnDiagram(selectedPokemons) {
    const knnDiv = document.getElementsByClassName("knn")[0];
    const knnWidth = window.innerWidth;
    knnDiv.innerHTML = "";

    const tooltip = d3.select(".tooltip-knn");

    function showTooltip(htmlContent, event) {
        tooltip.html(htmlContent)
            .style("display", "block")
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY + 10) + "px");
    }

    function hideTooltip() {
        tooltip.style("display", "none");
    }

    knnDiv.style.border = "1px solid rgb(255, 255, 255)";
    knnDiv.style.width = "50%";
    knnDiv.style.display = "flex";
    knnDiv.style.alignItems = "center";
    knnDiv.style.flexDirection = "column";
    knnDiv.style.gap = "10px";
    knnDiv.style.padding = "15px";
    knnDiv.style.boxSizing = "border-box";

    const titleDiv = document.createElement("div");
    titleDiv.className = "knn-title";
    titleDiv.style.width = "90%"
    titleDiv.style.height = "10%"
    titleDiv.style.borderRadius = "10px";
    titleDiv.style.fontSize = `${knnWidth/120}px`;
    titleDiv.style.fontFamily = "Pixelify Sans, sans-serif";

    const titleText = document.createElement("h2");
    titleText.className = "knn-title-text";
    titleText.innerText = "Pokémons Mais Semelhantes (k-Nearest Neighbors)";
    titleText.style.textAlign = "center";
    titleText.style.color = "rgb(255, 255, 255)";
    
    titleDiv.appendChild(titleText);
    knnDiv.appendChild(titleDiv);

    for (let i = 0; i < selectedPokemons.length; i++){
        const pokemon = selectedPokemons[i];

        const knnRow = document.createElement("div");
        knnRow.className = "knn-row";

        // Estilo da linha dos knn
        knnRow.style.display = "flex";
        knnRow.style.alignItems = "center";
        knnRow.style.justifyContent = "center";
        knnRow.style.flexDirection = "row";
        knnRow.style.width = "100%"
        knnRow.style.height = "20%"
        knnRow.style.borderRadius = "10px";
        knnRow.style.gap = "5%";

        const pokemonDiv = document.createElement("div");
        pokemonDiv.className = "knn-pokemon-ind";
        pokemonDiv.style.height = "100%"
        pokemonDiv.style.aspectRatio = "1 / 1";
        pokemonDiv.style.borderRadius = "10px";
        pokemonDiv.style.display = "flex";
        pokemonDiv.style.alignItems = "center";
        pokemonDiv.style.justifyContent = "center";
        pokemonDiv.style.border = "1px solid rgb(255, 255, 255)";

        pokemonDiv.addEventListener("mouseover", (event) => {
            showTooltip(`<strong>ID: </strong>#${pokemon.pokemon_id}<br/>
                        <strong>Nome: </strong>${pokemon.name}<br/>
                        <strong>Genus: </strong>${pokemon.genus.split(" Pokémon")[0]}<br/>
                        <strong>Altura: </strong>${pokemon.height / 10} m<br/>
                        <strong>Peso: </strong>${pokemon.weight / 10} kg<br/>
                        <strong>Hp: </strong>${pokemon.Hp_Stat}<br/>
                        <strong>Ataque: </strong>${pokemon.Attack_Stat}<br/>
                        <strong>Defesa: </strong>${pokemon.Defense_Stat}<br/>
                        <strong>Ataque Especial: </strong>${pokemon.Special_Attack_Stat}<br/>
                        <strong>Defesa Especial: </strong>${pokemon.Special_Defense_Stat}<br/>
                        <strong>Velocidade: </strong>${pokemon.Speed_Stat}<br/>
                        <strong>Tipo 1 (2x): </strong>${tipoTraduzido[pokemon.types[0].type_name]}<br/>
                        <strong>Tipo 2 (2x): </strong>${pokemon.types[1]?.type_name ? tipoTraduzido[pokemon.types[1].type_name] : ""}<br/>
                        <strong>Formato: </strong>${shape_id_to_name[pokemon.shape_id]}<br/>
                        <strong>Baby: </strong>${pokemon.is_baby === 0 ? "Não" : "Sim"}<br/>
                        <strong>Mítico: </strong>${pokemon.is_mythical === 0 ? "Não" : "Sim"}<br/>
                        <strong>Lendário: </strong>${pokemon.is_legendary === 0 ? "Não" : "Sim"}<br/>`, event);});

        pokemonDiv.addEventListener("mousemove", showTooltip.bind(null, `<strong>ID: </strong>#${pokemon.pokemon_id}<br/>
                                                                        <strong>Nome: </strong>${pokemon.name}<br/>
                                                                        <strong>Genus: </strong>${pokemon.genus.split(" Pokémon")[0]}<br/>
                                                                        <strong>Altura: </strong>${pokemon.height / 10} m<br/>
                                                                        <strong>Peso: </strong>${pokemon.weight / 10} kg<br/>
                                                                        <strong>Hp: </strong>${pokemon.Hp_Stat}<br/>
                                                                        <strong>Ataque: </strong>${pokemon.Attack_Stat}<br/>
                                                                        <strong>Defesa: </strong>${pokemon.Defense_Stat}<br/>
                                                                        <strong>Ataque Especial: </strong>${pokemon.Special_Attack_Stat}<br/>
                                                                        <strong>Defesa Especial: </strong>${pokemon.Special_Defense_Stat}<br/>
                                                                        <strong>Velocidade: </strong>${pokemon.Speed_Stat}<br/>
                                                                        <strong>Tipo 1 (2x): </strong>${tipoTraduzido[pokemon.types[0].type_name]}<br/>
                                                                        <strong>Tipo 2 (2x): </strong>${pokemon.types[1]?.type_name ? tipoTraduzido[pokemon.types[1].type_name] : ""}<br/>
                                                                        <strong>Formato: </strong>${shape_id_to_name[pokemon.shape_id]}<br/>
                                                                        <strong>Baby: </strong>${pokemon.is_baby === 0 ? "Não" : "Sim"}<br/>
                                                                        <strong>Mítico: </strong>${pokemon.is_mythical === 0 ? "Não" : "Sim"}<br/>
                                                                        <strong>Lendário: </strong>${pokemon.is_legendary === 0 ? "Não" : "Sim"}<br/>`));

        pokemonDiv.addEventListener("mouseleave", hideTooltip);

        const pokemonImage = document.createElement("img");
        pokemonImage.src = `./assets/pokemons/${pokemon.pokemon_id}.png`
        pokemonImage.style.width = "85%";
        pokemonImage.style.height = "85%";
        pokemonDiv.appendChild(pokemonImage);

        const comparasionDiv = document.createElement("div");
        comparasionDiv.className = "knn-comparasion";
        comparasionDiv.style.width = "70%"
        comparasionDiv.style.height = "100%";
        comparasionDiv.style.borderRadius = "10px";
        comparasionDiv.style.gap = "2%";
        comparasionDiv.style.display = "flex";
        comparasionDiv.style.alignItems = "center";
        comparasionDiv.style.justifyContent = "center";
        comparasionDiv.style.flexDirection = "row";

        const knnData = await getKnnData(pokemon);

        for (let j = 0; j < 3; j++){
            const comparasionPokemon = document.createElement("div");
            comparasionPokemon.className = `knn-comparasion-ind`;

            comparasionPokemon.style.height = "100%"
            comparasionPokemon.style.aspectRatio = "1 / 1";
            comparasionPokemon.style.borderRadius = "10px";
            comparasionPokemon.style.display = "flex";
            comparasionPokemon.style.alignItems = "center";
            comparasionPokemon.style.justifyContent = "center";
            comparasionPokemon.style.border = "1px solid rgb(255, 255, 255)";

            comparasionPokemon.addEventListener("mouseover", (event) => {
                showTooltip(`<strong>ID: </strong>#${knnData[j].pokemon.id}<br/>
                            <strong>Nome: </strong>${knnData[j].pokemon.name}<br/>
                            <strong>Genus: </strong>${knnData[j].pokemon.genus.split(" Pokémon")[0]}<br/>
                            <strong>Altura: </strong>${knnData[j].pokemon.height / 10} m<br/>
                            <strong>Peso: </strong>${knnData[j].pokemon.weight / 10} kg<br/>
                            <strong>Hp: </strong>${knnData[j].pokemon.hp_stat}<br/>
                            <strong>Ataque: </strong>${knnData[j].pokemon.attack_stat}<br/>
                            <strong>Defesa: </strong>${knnData[j].pokemon.defense_stat}<br/>
                            <strong>Ataque Especial: </strong>${knnData[j].pokemon.special_attack_stat}<br/>
                            <strong>Defesa Especial: </strong>${knnData[j].pokemon.special_defense_stat}<br/>
                            <strong>Velocidade: </strong>${knnData[j].pokemon.speed_stat}<br/>
                            <strong>Tipo 1 (2x): </strong>${knnData[j].pokemon.type_1}<br/>
                            <strong>Tipo 2 (2x): </strong>${knnData[j].pokemon.type_2 == "" ? "" : knnData[j].pokemon.type_2}<br/>
                            <strong>Formato: </strong>${knnData[j].pokemon.shape}<br/>
                            <strong>Baby: </strong>${+knnData[j].pokemon.is_baby === 0 ? "Não" : "Sim"}<br/>
                            <strong>Mítico: </strong>${+knnData[j].pokemon.is_mythical === 0 ? "Não" : "Sim"}<br/>
                            <strong>Lendário: </strong>${+knnData[j].pokemon.is_legendary === 0 ? "Não" : "Sim"}<br/>`, event);});

            comparasionPokemon.addEventListener("mousemove", showTooltip.bind(null, `<strong>ID: </strong>#${knnData[j].pokemon.id}<br/>
                                                    <strong>Nome: </strong>${knnData[j].pokemon.name}<br/>
                                                    <strong>Genus: </strong>${knnData[j].pokemon.genus.split(" Pokémon")[0]}<br/>
                                                    <strong>Altura: </strong>${knnData[j].pokemon.height / 10} m<br/>
                                                    <strong>Peso: </strong>${knnData[j].pokemon.weight / 10} kg<br/>
                                                    <strong>Hp: </strong>${knnData[j].pokemon.hp_stat}<br/>
                                                    <strong>Ataque: </strong>${knnData[j].pokemon.attack_stat}<br/>
                                                    <strong>Defesa: </strong>${knnData[j].pokemon.defense_stat}<br/>
                                                    <strong>Ataque Especial: </strong>${knnData[j].pokemon.special_attack_stat}<br/>
                                                    <strong>Defesa Especial: </strong>${knnData[j].pokemon.special_defense_stat}<br/>
                                                    <strong>Velocidade: </strong>${knnData[j].pokemon.speed_stat}<br/>
                                                    <strong>Tipo 1 (2x): </strong>${knnData[j].pokemon.type_1}<br/>
                                                    <strong>Tipo 2 (2x): </strong>${knnData[j].pokemon.type_2 == "" ? "" : knnData[j].pokemon.type_2}<br/>
                                                    <strong>Formato: </strong>${knnData[j].pokemon.shape}<br/>
                                                    <strong>Baby: </strong>${+knnData[j].pokemon.is_baby === 0 ? "Não" : "Sim"}<br/>
                                                    <strong>Mítico: </strong>${+knnData[j].pokemon.is_mythical === 0 ? "Não" : "Sim"}<br/>
                                                    <strong>Lendário: </strong>${+knnData[j].pokemon.is_legendary === 0 ? "Não" : "Sim"}<br/>`));
                                                                            
            comparasionPokemon.addEventListener("mouseleave", hideTooltip);

            const pokemonImageComparasion = document.createElement("img");
            pokemonImageComparasion.src = `./assets/pokemons/${knnData[j].pokemon.id}.png`
            pokemonImageComparasion.style.width = "75%";
            pokemonImageComparasion.style.height = "75%";
            comparasionPokemon.appendChild(pokemonImageComparasion);

            comparasionDiv.appendChild(comparasionPokemon);
        }

        knnRow.appendChild(pokemonDiv);
        knnRow.appendChild(comparasionDiv);
        knnDiv.appendChild(knnRow);
    }
}

const csvCache = new Map();

async function loadCsv(path, parser) {
    try {
        if (!csvCache.has(path)) {
            // Usar Promise com timeout para evitar travamentos
            const fetchPromise = new Promise((resolve, reject) => {
                d3.csv(path, parser)
                    .then(data => {
                        resolve(data);
                    })
                    .catch(error => {
                        console.error(`Erro ao carregar ${path}:`, error);
                        reject(error);
                    });

                // Timeout de 5 segundos para evitar travamentos
                setTimeout(() => reject(new Error(`Timeout ao carregar ${path}`)), 5000);
            });

            csvCache.set(path, fetchPromise);
        }
        return await csvCache.get(path);
    } catch (error) {
        console.error(`Falha ao carregar ${path}:`, error);
        return [];
    }
}

async function getKnnData(pokemon) {
    const numericFeatures = [
        "height_norm", "weight_norm",
        "hp_stat_norm", "attack_stat_norm", "defense_stat_norm",
        "special_attack_stat_norm", "special_defense_stat_norm", "speed_stat_norm"
    ];

    const categoricalFeatures = [
        "is_baby", "is_legendary", "is_mythical", "type_1", "type_2", "shape", "genus"
    ];

    function distance(p1, p2) {
        let dist = 0;

        numericFeatures.forEach(f => {
            const diff = parseFloat(p1[f]) - parseFloat(p2[f]);
            dist += diff * diff;
        });

        categoricalFeatures.forEach(f => {
            if (f !== "type_1" && f !== "type_2" && f!== "genus") {
                dist += (p1[f] !== p2[f]) ? 1.5 : 0;
            }
        });

        const typeWeight = 3;
        const genusWeight = 1.5;
        dist += (p1["type_1"] !== p2["type_1"] ? typeWeight : 0);
        dist += (p1["type_2"] !== p2["type_2"] ? typeWeight : 0);
        dist += (p1["genus"] !== p2["genus"] ? genusWeight : 0);

        return Math.sqrt(dist);
    }


    function findNearest(pokemons, targetPokemon, k = 3) {
        return pokemons
            .filter(p => 
                p.id !== targetPokemon.id && 
                +p.evolucao == 0
            )
            .map(p => ({ pokemon: p, dist: distance(p, targetPokemon) }))
            .sort((a, b) => a.dist - b.dist)
            .slice(0, k);
    }

    try {
        const data = await loadCsv("../knn_data.csv", d => d); 
        const target = data.find(p => +p.id === +pokemon.pokemon_id);

        if (!target) {
            console.error("Pokémon alvo não encontrado:", pokemon.pokemon_id);
            return;
        }

        const nearest = findNearest(data, target, 3);

        return nearest;
    } catch (err) {
        console.error("Erro em getKnnData:", err);
    }
}
