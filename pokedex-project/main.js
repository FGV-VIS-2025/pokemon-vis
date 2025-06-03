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
    button.addEventListener("click", () => {
        button.style.transition = "transform 0.1s, box-shadow 0.1s, opacity 0.1s";

        button.style.transform = "translate(2px, 2px) scale(0.95)";
        button.style.boxShadow = "inset 0 2px 4px rgba(0, 0, 0, 0.2)";
        button.style.opacity = "0.85";

        setTimeout(() => {
            button.style.transform = "translate(0, 0) scale(1)";
            button.style.boxShadow = "";
            button.style.opacity = "1";
        }, 150);
    });
}

for (let button of rightButtons) {
    button.addEventListener("click", () => {
        button.style.transition = "transform 0.1s, box-shadow 0.1s, opacity 0.1s";

        button.style.transform = "translate(2px, 2px) scale(0.95)";
        button.style.boxShadow = "inset 0 2px 4px rgba(0, 0, 0, 0.2)";
        button.style.opacity = "0.85";

        setTimeout(() => {
            button.style.transform = "translate(0, 0) scale(1)";
            button.style.boxShadow = "";
            button.style.opacity = "1";
        }, 150);
    });
}
