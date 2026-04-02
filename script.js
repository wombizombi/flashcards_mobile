let cards = [];
let currentIndex = 0;
let showingAnswer = false;

const DAY = 24 * 60 * 60 * 1000;

// ----------------------
// LOAD CARDS
// ----------------------
async function loadCards() {
    const res = await fetch("comptia_flashcards.json");
    cards = await res.json();
    cards.forEach(initSRS);
    loadProgress();
    showCard();
}

// ----------------------
// SRS INIT
// ----------------------
function initSRS(card) {
    if (!card.interval) card.interval = 1;
    if (!card.due) card.due = Date.now();
}

// ----------------------
// DISPLAY CARD
// ----------------------
function showCard() {
    const dueCards = getDueCards();
    if (dueCards.length === 0) {
        document.getElementById("text").innerText = "🎉 All caught up!";
        document.getElementById("mode").innerText = "";
        document.getElementById("progress").innerText = "";
        document.getElementById("explanation").innerText = "";
        return;
    }

    const card = dueCards[currentIndex];
    document.getElementById("mode").innerText = showingAnswer ? "ANSWER" : "QUESTION";
    document.getElementById("text").innerText = showingAnswer ? card.answer : card.question;
    document.getElementById("explanation").innerText = ""; // clear explanation
    document.getElementById("progress").innerText = `${currentIndex + 1} / ${dueCards.length}`;
}

// ----------------------
// NAVIGATION
// ----------------------
function next() {
    const dueCards = getDueCards();
    currentIndex = (currentIndex + 1) % dueCards.length;
    showingAnswer = false;
    showCard();
}

function prev() {
    const dueCards = getDueCards();
    currentIndex = (currentIndex - 1 + dueCards.length) % dueCards.length;
    showingAnswer = false;
    showCard();
}

// ----------------------
// FLIP
// ----------------------
function flip() {
    showingAnswer = !showingAnswer;
    showCard();
}

// ----------------------
// EXTRA BUTTONS
// ----------------------
function randomCard() {
    currentIndex = Math.floor(Math.random() * cards.length);
    showingAnswer = false;
    showCard();
}

function shuffleCards() {
    cards.sort(() => Math.random() - 0.5);
    currentIndex = 0;
    showingAnswer = false;
    showCard();
}

function alphabetizeCards() {
    cards.sort((a, b) => a.question.localeCompare(b.question));
    currentIndex = 0;
    showingAnswer = false;
    showCard();
}

function explainCard() {
    const card = getDueCards()[currentIndex];
    document.getElementById("explanation").innerText = `Explanation:\n${card.answer}`;
}

function resetWeights() {
    cards.forEach(card => card.interval = 0);
    showCard();
}

// ----------------------
// SRS BUTTONS
// ----------------------
function getDueCards() {
    const now = Date.now();
    return cards.filter(c => c.due <= now);
}

function markAgain() {
    const card = getDueCards()[currentIndex];
    card.interval = 1;
    card.due = Date.now() + DAY;
    next();
}

function markGood() {
    const card = getDueCards()[currentIndex];
    card.interval = Math.round(card.interval * 2);
    card.due = Date.now() + card.interval * DAY;
    next();
}

function markEasy() {
    const card = getDueCards()[currentIndex];
    card.interval = Math.round(card.interval * 3);
    card.due = Date.now() + card.interval * DAY;
    next();
}

// ----------------------
// STORAGE
// ----------------------
function saveProgress() {
    localStorage.setItem("flashcards", JSON.stringify(cards));
}

function loadProgress() {
    const saved = localStorage.getItem("flashcards");
    if (saved) cards = JSON.parse(saved);
}

// ----------------------
// FILE UPLOAD
// ----------------------
document.getElementById('loadFile').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        cards = JSON.parse(e.target.result);
        cards.forEach(initSRS);
        currentIndex = 0;
        showingAnswer = false;
        showCard();
    };
    reader.readAsText(file);
});

// ----------------------
// KEYBOARD SHORTCUTS
// ----------------------
document.addEventListener("keydown", function(e) {
    switch(e.key.toLowerCase()) {
        case "arrowleft": prev(); break;
        case "arrowright": next(); break;
        case " ": e.preventDefault(); flip(); break;
        case "r": randomCard(); break;
        case "s": shuffleCards(); break;
        case "a": alphabetizeCards(); break;
        case "e": explainCard(); break;
        case "1": markAgain(); break;
        case "2": markGood(); break;
        case "3": markEasy(); break;
    }
});

// ----------------------
loadCards();    