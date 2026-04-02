// =======================
// Flashcards JS
// =======================

let decks = {};           // store multiple decks by name
let currentDeckName = ""; // currently selected deck
let cards = [];           // current deck's cards
let currentIndex = 0;
let showingAnswer = false;

// =======================
// Load JSON deck from file
// =======================
function loadFilePrompt() {
    document.getElementById('loadFile').click();
}

document.getElementById('loadFile').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const newCards = JSON.parse(e.target.result);

            // Use filename as deck name
            const deckName = file.name.replace(/\.[^/.]+$/, "");
            decks[deckName] = newCards;
            currentDeckName = deckName;
            updateDeckSelector();
            switchDeck(deckName);
        } catch (err) {
            alert("Invalid JSON file.");
            console.error(err);
        }
    };
    reader.readAsText(file);
});

// =======================
// Deck selector
// =======================
function updateDeckSelector() {
    const select = document.getElementById("deckSelect");
    select.innerHTML = ""; // clear
    Object.keys(decks).forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });
    select.value = currentDeckName;
}

function switchDeck(name = null) {
    if (name) currentDeckName = name;
    else currentDeckName = document.getElementById("deckSelect").value;

    cards = decks[currentDeckName] || [];
    currentIndex = 0;
    showingAnswer = false;
    showCard();
}

// =======================
// Card Display
// =======================
function showCard() {
    const textEl = document.getElementById("text");
    const modeEl = document.getElementById("mode");
    const explEl = document.getElementById("explanation");
    const progressEl = document.getElementById("progress");

    if (cards.length === 0) {
        textEl.textContent = "📂 No cards in this deck!";
        modeEl.textContent = "";
        explEl.textContent = "";
        progressEl.textContent = "";
        return;
    }

    const card = cards[currentIndex];

    textEl.textContent = showingAnswer ? (card.answer || "") : (card.question || "");
    modeEl.textContent = showingAnswer ? "ANSWER" : "QUESTION";
    explEl.textContent = ""; // hide explanation by default

    progressEl.textContent = `${currentIndex + 1} / ${cards.length}`;
}

// =======================
// Navigation
// =======================
function prevCard() {
    if (cards.length === 0) return;
    currentIndex = (currentIndex - 1 + cards.length) % cards.length;
    showingAnswer = false;
    showCard();
}

function nextCard() {
    if (cards.length === 0) return;
    currentIndex = (currentIndex + 1) % cards.length;
    showingAnswer = false;
    showCard();
}

// =======================
// Flip / Explain
// =======================
function flipCard() {
    if (cards.length === 0) return;
    showingAnswer = !showingAnswer;
    showCard();
}

function showExplanation() {
    if (cards.length === 0) return;
    const card = cards[currentIndex];
    const explEl = document.getElementById("explanation");
    explEl.textContent = card.explanation || "No explanation provided.";
}

// =======================
// Sorting / Randomizing
// =======================
function alphabetizeCards() {
    if (cards.length === 0) return;
    cards.sort((a, b) => (a.question || "").localeCompare(b.question || ""));
    currentIndex = 0;
    showingAnswer = false;
    showCard();
}

function shuffleCards() {
    if (cards.length === 0) return;
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    currentIndex = 0;
    showingAnswer = false;
    showCard();
}

function randomCard() {
    if (cards.length === 0) return;
    currentIndex = Math.floor(Math.random() * cards.length);
    showingAnswer = false;
    showCard();
}

// =======================
// Keyboard Shortcuts
// =======================
document.addEventListener("keydown", (e) => {
    if (cards.length === 0) return;
    switch (e.key.toLowerCase()) {
        case "arrowleft": prevCard(); break;
        case "arrowright": nextCard(); break;
        case " ": e.preventDefault(); flipCard(); break;
        case "a": alphabetizeCards(); break;
        case "s": shuffleCards(); break;
        case "r": randomCard(); break;
        case "e": showExplanation(); break;
    }
});

// =======================
// Initialize (empty)
switchDeck();