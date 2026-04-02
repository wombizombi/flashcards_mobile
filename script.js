let decks = {};       // { deckName: [cards] }
let currentDeck = ""; // currently selected deck
let cards = [];       // current deck cards
let currentIndex = 0;
let showingAnswer = false;

// ----------------------
// CARD DISPLAY
// ----------------------
function showCard() {
    if (!cards || cards.length === 0) {
        document.getElementById("text").innerText = "No cards loaded!";
        document.getElementById("mode").innerText = "";
        document.getElementById("explanation").innerText = "";
        document.getElementById("progress").innerText = "";
        return;
    }

    const card = cards[currentIndex];
    document.getElementById("mode").innerText = showingAnswer ? "ANSWER" : "QUESTION";
    document.getElementById("text").innerText = showingAnswer ? card.answer : card.question;
    document.getElementById("explanation").innerText = ""; // hide explanation by default

    document.getElementById("progress").innerText = `${currentIndex+1} / ${cards.length}`;
}

function flipCard() {
    showingAnswer = !showingAnswer;
    showCard();
}

function nextCard() {
    currentIndex = (currentIndex + 1) % cards.length;
    showingAnswer = false;
    showCard();
}

function prevCard() {
    currentIndex = (currentIndex - 1 + cards.length) % cards.length;
    showingAnswer = false;
    showCard();
}

function alphabetizeCards() {
    cards.sort((a,b)=>a.question.localeCompare(b.question));
    currentIndex = 0;
    showingAnswer = false;
    showCard();
}

function shuffleCards() {
    cards.sort(()=>Math.random()-0.5);
    currentIndex = 0;
    showingAnswer = false;
    showCard();
}

function randomCard() {
    currentIndex = Math.floor(Math.random() * cards.length);
    showingAnswer = false;
    showCard();
}

function showExplanation() {
    const card = cards[currentIndex];
    document.getElementById("explanation").innerText = card.explanation || "No explanation available.";
}

// ----------------------
// LOAD DECKS
// ----------------------
function loadFilePrompt() {
    document.getElementById("loadFile").click();
}

document.getElementById("loadFile").addEventListener("change", function(e){
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt){
        const newCards = JSON.parse(evt.target.result);
        const deckName = file.name;
        decks[deckName] = newCards;
        currentDeck = deckName;
        cards = decks[deckName];
        currentIndex = 0;
        showingAnswer = false;
        updateDeckSelector();
        showCard();
    }
    reader.readAsText(file);
});

function updateDeckSelector() {
    const select = document.getElementById("deckSelect");
    select.innerHTML = "";
    for (let deckName in decks) {
        const option = document.createElement("option");
        option.value = deckName;
        option.innerText = deckName;
        if (deckName === currentDeck) option.selected = true;
        select.appendChild(option);
    }
}

function switchDeck() {
    const select = document.getElementById("deckSelect");
    currentDeck = select.value;
    cards = decks[currentDeck];
    currentIndex = 0;
    showingAnswer = false;
    showCard();
}

// ----------------------
// INITIALIZATION
// ----------------------
showCard();