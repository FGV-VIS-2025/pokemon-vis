import { tipoPtEn, tipoTraduzido } from "./consts.js";

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
    titleDiv.style.fontSize = `${knnWidth / 120}px`;

    const titleText = document.createElement("h2");
    titleText.className = "knn-title-text";
    titleText.innerText = "Pokémons Mais Semelhantes (k-Nearest Neighbors)";
    titleText.style.textAlign = "center";
    titleText.style.color = "rgb(255, 255, 255)";

    titleDiv.appendChild(titleText);
    knnDiv.appendChild(titleDiv);

    for (let i = 0; i < selectedPokemons.length; i++) {
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
            const genus = pokemon.genus ? pokemon.genus.split(" Pokémon")[0] : "Desconhecido";
            const tipos = pokemon.types.map(type => traduzirTipoParaEn(tipoTraduzido[type.type_name] || type.type_name)).join(", ");
            const altura = pokemon.height / 10;
            const peso = pokemon.weight / 10;
            const lendario = pokemon.is_legendary === 0 ? "Não" : "Sim";

            const tooltipContent = `<strong>${pokemon.name}</strong> #${pokemon.pokemon_id}<br/>
                <strong>Genética:</strong> ${genus}<br/>
                <strong>Tipos:</strong> ${tipos}<br/>
                <strong>Altura:</strong> ${altura}m | <strong>Peso:</strong> ${peso}kg<br/>
                <strong>Lendário:</strong> ${lendario}<br/>
                <strong>HP:</strong> ${pokemon.Hp_Stat} | <strong>ATK:</strong> ${pokemon.Attack_Stat} | <strong>DEF:</strong> ${pokemon.Defense_Stat}<br/>
                <strong>SP.ATK:</strong> ${pokemon.Special_Attack_Stat} | <strong>SP.DEF:</strong> ${pokemon.Special_Defense_Stat} | <strong>SPD:</strong> ${pokemon.Speed_Stat}`;
            showTooltip(tooltipContent, event);
        });

        pokemonDiv.addEventListener("mousemove", (event) => {
            const genus = pokemon.genus ? pokemon.genus.split(" Pokémon")[0] : "Desconhecido";
            const tipos = pokemon.types.map(type => traduzirTipoParaEn(tipoTraduzido[type.type_name] || type.type_name)).join(", ");
            const altura = pokemon.height / 10;
            const peso = pokemon.weight / 10;
            const lendario = pokemon.is_legendary === 0 ? "Não" : "Sim";

            const tooltipContent = `<strong>${pokemon.name}</strong> #${pokemon.pokemon_id}<br/>
                <strong>Genética:</strong> ${genus}<br/>
                <strong>Tipos:</strong> ${tipos}<br/>
                <strong>Altura:</strong> ${altura}m | <strong>Peso:</strong> ${peso}kg<br/>
                <strong>Lendário:</strong> ${lendario}<br/>
                <strong>HP:</strong> ${pokemon.Hp_Stat} | <strong>ATK:</strong> ${pokemon.Attack_Stat} | <strong>DEF:</strong> ${pokemon.Defense_Stat}<br/>
                <strong>SP.ATK:</strong> ${pokemon.Special_Attack_Stat} | <strong>SP.DEF:</strong> ${pokemon.Special_Defense_Stat} | <strong>SPD:</strong> ${pokemon.Speed_Stat}`;
            showTooltip(tooltipContent, event);
        });

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

        for (let j = 0; j < 3; j++) {
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
                const genus = knnData[j].pokemon.genus ? knnData[j].pokemon.genus.split(" Pokémon")[0] : "Desconhecido";
                const tipo1 = traduzirTipoParaEn(knnData[j].pokemon.type_1);
                const tipo2 = traduzirTipoParaEn(knnData[j].pokemon.type_2);
                const tipos = [tipo1, tipo2].filter(t => t && t !== "").join(", ");
                const altura = knnData[j].pokemon.height / 10;
                const peso = knnData[j].pokemon.weight / 10;
                const lendario = +knnData[j].pokemon.is_legendary === 0 ? "Não" : "Sim";

                const tooltipContent = `<strong>${knnData[j].pokemon.name}</strong> #${knnData[j].pokemon.id}<br/>
                    <strong>Genética:</strong> ${genus}<br/>
                    <strong>Tipos:</strong> ${tipos}<br/>
                    <strong>Altura:</strong> ${altura}m | <strong>Peso:</strong> ${peso}kg<br/>
                    <strong>Lendário:</strong> ${lendario}<br/>
                    <strong>HP:</strong> ${knnData[j].pokemon.hp_stat} | <strong>ATK:</strong> ${knnData[j].pokemon.attack_stat} | <strong>DEF:</strong> ${knnData[j].pokemon.defense_stat}<br/>
                    <strong>SP.ATK:</strong> ${knnData[j].pokemon.special_attack_stat} | <strong>SP.DEF:</strong> ${knnData[j].pokemon.special_defense_stat} | <strong>SPD:</strong> ${knnData[j].pokemon.speed_stat}`;
                showTooltip(tooltipContent, event);
            });

            comparasionPokemon.addEventListener("mousemove", (event) => {
                const genus = knnData[j].pokemon.genus ? knnData[j].pokemon.genus.split(" Pokémon")[0] : "Desconhecido";
                const tipo1 = traduzirTipoParaEn(knnData[j].pokemon.type_1);
                const tipo2 = traduzirTipoParaEn(knnData[j].pokemon.type_2);
                const tipos = [tipo1, tipo2].filter(t => t && t !== "").join(", ");
                const altura = knnData[j].pokemon.height / 10;
                const peso = knnData[j].pokemon.weight / 10;
                const lendario = +knnData[j].pokemon.is_legendary === 0 ? "Não" : "Sim";

                const tooltipContent = `<strong>${knnData[j].pokemon.name}</strong> #${knnData[j].pokemon.id}<br/>
                    <strong>Genética:</strong> ${genus}<br/>
                    <strong>Tipos:</strong> ${tipos}<br/>
                    <strong>Altura:</strong> ${altura}m | <strong>Peso:</strong> ${peso}kg<br/>
                    <strong>Lendário:</strong> ${lendario}<br/>
                    <strong>HP:</strong> ${knnData[j].pokemon.hp_stat} | <strong>ATK:</strong> ${knnData[j].pokemon.attack_stat} | <strong>DEF:</strong> ${knnData[j].pokemon.defense_stat}<br/>
                    <strong>SP.ATK:</strong> ${knnData[j].pokemon.special_attack_stat} | <strong>SP.DEF:</strong> ${knnData[j].pokemon.special_defense_stat} | <strong>SPD:</strong> ${knnData[j].pokemon.speed_stat}`;
                showTooltip(tooltipContent, event);
            });

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
            const fetchPromise = d3.csv(path, parser);
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
            if (f !== "type_1" && f !== "type_2" && f !== "genus") {
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
        // Função para encontrar todos os pokémons da mesma linha evolutiva
        function getEvolutionLineIds(targetId, targetEvolucao) {
            const lineIds = new Set();

            // Encontrar o primeiro pokémon da linha evolutiva (evolucao == 0)
            let firstPokemonId = +targetId;
            let currentEvolucao = +targetEvolucao;

            // Percorrer para trás até encontrar o primeiro da linha
            while (currentEvolucao !== 0) {
                firstPokemonId = currentEvolucao;
                const parentPokemon = pokemons.find(p => +p.id === currentEvolucao);
                if (parentPokemon) {
                    currentEvolucao = +parentPokemon.evolucao;
                } else {
                    break; // Sair se não encontrar o parent
                }
            }

            // Agora percorrer toda a linha evolutiva a partir do primeiro
            const toProcess = [firstPokemonId];
            const processed = new Set();

            while (toProcess.length > 0) {
                const currentId = toProcess.pop();
                if (processed.has(currentId)) continue;

                processed.add(currentId);
                lineIds.add(currentId);

                // Encontrar todas as evoluções diretas deste pokémon
                pokemons.forEach(p => {
                    if (+p.evolucao === currentId && !processed.has(+p.id)) {
                        toProcess.push(+p.id);
                    }
                });
            }

            return lineIds;
        }

        // Obter todos os IDs da linha evolutiva do pokémon alvo
        const targetEvolutionLineIds = getEvolutionLineIds(targetPokemon.id, targetPokemon.evolucao);

        return pokemons
            .filter(p =>
                p.id !== targetPokemon.id &&
                +p.evolucao == 0 &&
                +p.id <= 721 &&  // Apenas pokémons até Kalos (ID 721)
                !targetEvolutionLineIds.has(+p.id) // Excluir mesma linha evolutiva
            )
            .map(p => ({ pokemon: p, dist: distance(p, targetPokemon) }))
            .sort((a, b) => a.dist - b.dist)
            .slice(0, k);
    }

    try {
        const data = await loadCsv("./knn_data.csv", d => d);
        // Filtrar apenas pokémons até ID 721 (Kalos)
        const filteredData = data.filter(p => +p.id <= 721);
        const target = filteredData.find(p => +p.id === +pokemon.pokemon_id);

        if (!target) {
            console.error("Pokémon alvo não encontrado:", pokemon.pokemon_id);
            return;
        }

        const nearest = findNearest(filteredData, target, 3);

        return nearest;
    } catch (err) {
        console.error("Erro em getKnnData:", err);
    }
}

// Função utilitária para traduzir tipo PT->EN
export function traduzirTipoParaEn(tipo) {
    return tipoPtEn[tipo] || tipo;
}
