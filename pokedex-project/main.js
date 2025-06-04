const folderImage = document.getElementById("folder");

folderImage.addEventListener("mouseenter", () => {
    folderImage.src = "../assets/open_folder.png";
});

folderImage.addEventListener("mouseleave", () => {
    folderImage.src = "../assets/folder.png";
});

const rightButtons = document.getElementsByClassName("right-button");
const leftButtons = document.getElementsByClassName("left-button");

for (let button of leftButtons) {
    const img = button.querySelector("img");
    button.addEventListener("click", () => {
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

for (let button of rightButtons) {
    const img = button.querySelector("img");
    button.addEventListener("click", () => {
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

const regionButton = document.getElementsByClassName("region-button")[0];
const locationButton = document.getElementsByClassName("location-button")[0];
const pokemonButton = document.getElementsByClassName("pokemons-button")[0];

const contentButtons = [regionButton, locationButton, pokemonButton];

for (let eachButton of contentButtons) {
    const img = eachButton.querySelector("img"); // pega a imagem dentro do botão

    eachButton.addEventListener("click", () => {
        if (!img) return; // caso não tenha imagem por algum motivo

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