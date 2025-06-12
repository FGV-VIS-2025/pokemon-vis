const rightButtons = document.getElementsByClassName("right-button");
const leftButtons = document.getElementsByClassName("left-button");
const regionButton = document.getElementsByClassName("region-button")[0];
const locationButton = document.getElementsByClassName("location-button")[0];
const pokemonButton = document.getElementsByClassName("pokemons-button")[0];
const folderButton = document.getElementsByClassName("botao-4")[0];
const leftPokemonButton = document.getElementsByClassName("left-pokemon")[0];
const rightPokemonButton = document.getElementsByClassName("home-pokemon")[0];
const homePokemonButton = document.getElementsByClassName("right-pokemon")[0];
const infoButton = document.getElementsByClassName("info-button")[0];
const scrollButton = document.getElementsByClassName("scroll-button")[0];
const linkedinButtons = document.getElementsByClassName("linkedin-button");
const githubButtons = document.getElementsByClassName("github-button");
const pokedexButtons = document.getElementsByClassName("real-content-button")[0];

const contentButtons = [regionButton, 
                        locationButton, 
                        pokemonButton, 
                        folderButton, 
                        leftPokemonButton, 
                        homePokemonButton, 
                        rightPokemonButton, 
                        scrollButton, 
                        infoButton,
                        pokedexButtons];

function animatedButtons(arrayOfButtons){
    for (let eachButton of arrayOfButtons) {
    const img = eachButton.querySelector("img");

    eachButton.addEventListener("click", () => {
        if (!img) return; 

        img.style.transition = "transform 0.1s, box-shadow 0.1s, opacity 0.1s";

        img.style.transform = "translate(2px, 2px) scale(0.95)";
        img.style.boxShadow = "inset 0 2px 4px rgba(0, 0, 0, 0.2)";
        img.style.opacity = "0.85";

        setTimeout(() => {
            img.style.transform = "translate(0, 0) scale(1)";
            img.style.boxShadow = "";
            img.style.opacity = "1";
        }, 150);
    });
}
}

// CHAMADAS
animatedButtons(leftButtons);
animatedButtons(rightButtons);
animatedButtons(contentButtons);
animatedButtons(linkedinButtons);
animatedButtons(githubButtons);

// SCROLL AUTOMÁTICO
scrollButton.addEventListener("click", function () {
  setTimeout(function () {document.getElementsByClassName("content-container")[0].scrollIntoView({ behavior: "smooth" })}, 150);
});

infoButton.addEventListener("click", function () {
  setTimeout(function () {document.getElementsByClassName("authors-container")[0].scrollIntoView({ behavior: "smooth" })}, 150);
});

pokedexButtons.addEventListener("click", function () {
    setTimeout(function () {document.getElementsByClassName("pokedex-container")[0].scrollIntoView({ behavior: "smooth" })}, 150);
});

// BOTÕES AUTORES
const linkedinAlessandra = document.getElementById("linkedin-alessandra");
const githubAlessandra = document.getElementById("github-alessandra");
const linkedinMatheus = document.getElementById("linkedin-matheus");
const githubMatheus = document.getElementById("github-matheus");
const linkedinSillas = document.getElementById("linkedin-sillas");
const githubSillas = document.getElementById("github-sillas");

linkedinAlessandra.addEventListener("click", function () {
    setTimeout(function () {
        window.open("https://www.linkedin.com/in/alessandra-bello-soares/", "_blank");
    }, 150);
});

githubAlessandra.addEventListener("click", function () {
    setTimeout(function () {
        window.open("https://github.com/AlessandraBello", "_blank");
    }, 150);
});

linkedinMatheus.addEventListener("click", function () {
    setTimeout(function () {
        window.open("https://www.linkedin.com/in/matheus-carvalho-11095430b/", "_blank");
    }, 150);
});

githubMatheus.addEventListener("click", function () {
    setTimeout(function () {
        window.open("https://github.com/MatCarvalho21", "_blank");
    }, 150);
});

linkedinSillas.addEventListener("click", function () {
    setTimeout(function () {
        window.open("https://www.linkedin.com/in/scrocha/", "_blank");
    }, 150);
});

githubSillas.addEventListener("click", function () {
    setTimeout(function () {
        window.open("https://github.com/scrocha", "_blank");
    }, 150);
});

// FOLDER
folderButton.addEventListener("click", function () {
    setTimeout(function () {
        window.open("https://github.com/FGV-VIS-2025/pokemon-vis", "_blank");
    }, 150);
});
