
const cardsContainer = document.getElementsByClassName("cards-display")[0];

window.onbeforeunload = function () {
    window.scrollTo(0, 0);
    cardsContainer.scrollTo({
        left: 0,
        top: 0,
        behavior: "smooth"
    });
};

// A inicialização do mapa e seleção da localização agora é feita no regionControl.js