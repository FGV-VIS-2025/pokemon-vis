const rightButtons = document.getElementsByClassName("right-button");
const leftButtons = document.getElementsByClassName("left-button");
const regionButton = document.getElementsByClassName("region-button")[0];
const locationButton = document.getElementsByClassName("location-button")[0];
const pokemonButton = document.getElementsByClassName("pokemons-button")[0];
const folderButton = document.getElementsByClassName("botao-4")[0];
const leftPokemonButton = document.getElementsByClassName("left-pokemon")[0];
const rightPokemonButton = document.getElementsByClassName("home-pokemon")[0];
const homePokemonButton = document.getElementsByClassName("right-pokemon")[0];
const authorsButton = document.getElementsByClassName("authors-button")[0];
const scrollButton = document.getElementsByClassName("scroll-button")[0];

const contentButtons = [regionButton, locationButton, pokemonButton, folderButton, leftPokemonButton, homePokemonButton, rightPokemonButton, scrollButton, authorsButton];

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

// SCROLL AUTOMÁTICO
scrollButton.addEventListener("click", function () {
  document.getElementsByClassName("content-container")[0].scrollIntoView({ behavior: "smooth" });
});

authorsButton.addEventListener("click", function () {
  document.getElementsByClassName("authors-container")[0].scrollIntoView({ behavior: "smooth" });
});