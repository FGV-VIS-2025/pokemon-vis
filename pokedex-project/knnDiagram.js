export function createKnnDiagram(selectedPokemons) {
    const knnDiv = document.getElementsByClassName("knn")[0];
    knnDiv.innerHTML = "";

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
    titleDiv.style.fontSize = `15px`;
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
        pokemonDiv.className = "knn-row";
        pokemonDiv.style.height = "100%"
        pokemonDiv.style.aspectRatio = "1 / 1";
        pokemonDiv.style.borderRadius = "10px";
        pokemonDiv.style.display = "flex";
        pokemonDiv.style.alignItems = "center";
        pokemonDiv.style.justifyContent = "center";
        pokemonDiv.style.border = "1px solid rgb(255, 255, 255)";

        const pokemonImage = document.createElement("img");
        pokemonImage.src = `./assets/pokemons/${pokemon.pokemon_id}.png`
        pokemonImage.style.width = "95%";
        pokemonImage.style.height = "95%";
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

        const knnData = getKnnData(pokemon);

        for (let j = 0; j < 3; j++){
            const comparasionPokemon = document.createElement("div");
            comparasionPokemon.className = `knn-comparasion-${j}`;

            comparasionPokemon.className = "knn-row";
            comparasionPokemon.style.height = "100%"
            comparasionPokemon.style.aspectRatio = "1 / 1";
            comparasionPokemon.style.borderRadius = "10px";
            comparasionPokemon.style.display = "flex";
            comparasionPokemon.style.alignItems = "center";
            comparasionPokemon.style.justifyContent = "center";
            comparasionPokemon.style.border = "1px solid rgb(255, 255, 255)";

            const pokemonImageComparasion = document.createElement("img");
            pokemonImageComparasion.src = `./assets/pokemons/${knnData[j]}.png`
            pokemonImageComparasion.style.width = "95%";
            pokemonImageComparasion.style.height = "95%";
            comparasionPokemon.appendChild(pokemonImageComparasion);

            comparasionDiv.appendChild(comparasionPokemon);
        }

        knnRow.appendChild(pokemonDiv);
        knnRow.appendChild(comparasionDiv);
        knnDiv.appendChild(knnRow);
    }
}

function getKnnData(pokemon){
    return [100, 200, 300];
}