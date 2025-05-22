import { getRegions } from "./data.js";

const regionsArray = await getRegions();
const regionsSelect = document.getElementById("regions-select");
const cardsContainer = document.getElementById("cards-container");

export async function loadRegions() {
  for (const eachRegion of regionsArray) {

    // only names in english
    if (eachRegion.local_lan_id == 9){
        const option = document.createElement("option");
        option.value = eachRegion.region_id;
        option.textContent = eachRegion.name;
        regionsSelect.appendChild(option);
    }
  }

  return regionsArray;
}

const pokemonsArray = [
  { name: "Pikachu", ataque: 100, defesa: 50, tipo: "Raio", regiao: "Raiolândia", nivel: 25, hp: 120 },
  { name: "Balinha", ataque: 70, defesa: 40, tipo: "Fada", regiao: "Doçurópolis", nivel: 18, hp: 90 },
  { name: "Zézinho", ataque: 90, defesa: 60, tipo: "Normal", regiao: "Zezelândia", nivel: 22, hp: 110 },
  { name: "Huguinho", ataque: 85, defesa: 55, tipo: "Água", regiao: "Lagoa Azul", nivel: 20, hp: 105 },
  { name: "Yuri Saporito", ataque: 110, defesa: 80, tipo: "Fogo", regiao: "Sapora", nivel: 28, hp: 130 },
  { name: "Camacho", ataque: 95, defesa: 45, tipo: "Lutador", regiao: "Pancadópolis", nivel: 24, hp: 115 },
  { name: "Thiago", ataque: 75, defesa: 85, tipo: "Aço", regiao: "Metalúrgia", nivel: 23, hp: 125 },
  { name: "Pinho", ataque: 60, defesa: 70, tipo: "Grama", regiao: "Pinheiral", nivel: 19, hp: 100 },
  { name: "Flávio", ataque: 88, defesa: 77, tipo: "Terra", regiao: "Terranópolis", nivel: 21, hp: 108 },
  { name: "Marola", ataque: 92, defesa: 66, tipo: "Água", regiao: "Praialândia", nivel: 24, hp: 112 },
  { name: "Drakno", ataque: 120, defesa: 90, tipo: "Dragão", regiao: "Montedragão", nivel: 30, hp: 140 },
  { name: "Ventus", ataque: 80, defesa: 50, tipo: "Voador", regiao: "Altos Ventos", nivel: 22, hp: 105 },
  { name: "Nocturno", ataque: 95, defesa: 60, tipo: "Noturno", regiao: "Sombrolândia", nivel: 26, hp: 115 },
  { name: "Cactu", ataque: 70, defesa: 90, tipo: "Grama", regiao: "Desertópolis", nivel: 20, hp: 100 },
  { name: "Geleião", ataque: 60, defesa: 40, tipo: "Gelo", regiao: "Gelolândia", nivel: 18, hp: 85 },
  { name: "Voltran", ataque: 105, defesa: 70, tipo: "Elétrico", regiao: "Voltagem", nivel: 27, hp: 125 },
  { name: "Pedregulho", ataque: 85, defesa: 95, tipo: "Rocha", regiao: "Pedrália", nivel: 23, hp: 118 },
  { name: "Sombrio", ataque: 90, defesa: 65, tipo: "Fantasma", regiao: "Necrópole", nivel: 25, hp: 110 },
  { name: "Pluminha", ataque: 50, defesa: 60, tipo: "Voador", regiao: "Aerolândia", nivel: 17, hp: 95 },
  { name: "Lunara", ataque: 98, defesa: 72, tipo: "Psíquico", regiao: "Astralis", nivel: 26, hp: 120 }
];

export async function loadCards() {
    cardsContainer.innerHTML = ""; 

    for (const eachPokemon of pokemonsArray) {
        const card = document.createElement("div");
        card.classList.add("card");

        const img = document.createElement("img");
        img.src = "../assets/pokemon.png";
        img.classList.add("card-img");
        card.appendChild(img);

        const p = document.createElement("p");
        p.innerHTML = `
            Nome: ${eachPokemon.name}<br>
            Ataque: ${eachPokemon.ataque}<br>
            Defesa: ${eachPokemon.defesa}<br>
            Tipo: ${eachPokemon.tipo}<br>
            Região: ${eachPokemon.regiao}<br>
            Nível: ${eachPokemon.nivel}<br>
            Hp: ${eachPokemon.hp}
        `;
        card.appendChild(p);

        card.addEventListener("click", () => {
            const allCards = document.querySelectorAll(".card");
            allCards.forEach(c => c.classList.remove("card-active"));
            card.classList.add("card-active");
        });

        cardsContainer.appendChild(card);
    }
}
