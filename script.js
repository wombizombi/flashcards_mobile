alert("JS is working");

let cards = [];
let currentIndex = 0;
let showingAnswer = false;

const DAY = 24 * 60 * 60 * 1000;

// Initialize SRS
function initSRS(card) {
    if (!card.interval) card.interval = 1;
    if (!card.due) card.due = Date.now();
}

// ----------------------
// SWIPE FUNCTIONALITY
// ----------------------
document.addEventListener("DOMContentLoaded", () => {

    const cardElement = document.querySelector(".card");
    if (!cardElement) return;

    let startX = 0;

    cardElement.addEventListener("touchstart", (e) => {
        startX = e.touches[0].clientX;
    });

    cardElement.addEventListener("touchmove", (e) => {
        let currentX = e.touches[0].clientX;
        let diff = currentX - startX;
        cardElement.style.transform = `translateX(${diff}px)`;
    });

    cardElement.addEventListener("touchend", (e) => {
        let endX = e.changedTouches[0].clientX;
        let diff = startX - endX;

        if (Math.abs(diff) > 50) {

            if (diff > 0) {
                cardElement.style.transform = "translateX(-100%)";
            } else {
                cardElement.style.transform = "translateX(100%)";
            }

            cardElement.style.opacity = "0";

            setTimeout(() => {
                if (diff > 0) {
                    nextCard();
                } else {
                    prevCard();
                }

                cardElement.style.transform = "translateX(0)";
                cardElement.style.opacity = "1";
            }, 200);
        } else {
            cardElement.style.transform = "translateX(0)";
        }
    });

});

// ----------------------
// LOAD CARDS
// ----------------------
async function loadCards() {
    const res = await fetch("comptia_flashcards.json");
    cards = await res.json();

    loadProgress();
    cards.forEach(initSRS);

    showCard();
}

// ----------------------
// SRS LOGIC
// ----------------------
function getDueCards() {
    const now = Date.now();
    return cards.filter(c => c.due <= now);
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
        return;
    }

    const currentCard = dueCards[currentIndex % dueCards.length];

    document.getElementById("mode").innerText = showingAnswer ? "ANSWER" : "QUESTION";
    document.getElementById("text").innerText =
        showingAnswer ? currentCard.answer : currentCard.question;

    document.getElementById("progress").innerText =
        `${currentIndex + 1} / ${dueCards.length}`;

    clearExplanation();
}

// ----------------------
// CARD CONTROLS
// ----------------------
function flip() {
    showingAnswer = !showingAnswer;
    showCard();
}

function next() {
    currentIndex = (currentIndex + 1) % cards.length;
    showingAnswer = false;
    showCard();
}

function prev() {
    currentIndex = (currentIndex - 1 + cards.length) % cards.length;
    showingAnswer = false;
    showCard();
}

function randomCard() {
    currentIndex = Math.floor(Math.random() * cards.length);
    showingAnswer = false;
    showCard();
}

function shuffleCards() {
    cards.sort(() => Math.random() - 0.5);
    currentIndex = 0;
    showCard();
}

function alphabetizeCards() {
    cards.sort((a, b) => a.question.localeCompare(b.question));
    currentIndex = 0;
    showCard();
}

// ----------------------
// EXPLANATION
// ----------------------
function explainCard() {
    const currentCard = cards[currentIndex];
    document.getElementById("explanation").innerText =
        `Explanation:\n${currentCard.answer}`;
}

function clearExplanation() {
    document.getElementById("explanation").innerText = "";
}

// ----------------------
// SRS BUTTONS
// ----------------------
function markAgain() {
    const currentCard = getDueCards()[currentIndex];
    currentCard.interval = 1;
    currentCard.due = Date.now() + DAY;

    nextCard();
}

function markGood() {
    const currentCard = getDueCards()[currentIndex];
    currentCard.interval = Math.round(currentCard.interval * 2);
    currentCard.due = Date.now() + currentCard.interval * DAY;

    nextCard();
}

function markEasy() {
    const currentCard = getDueCards()[currentIndex];
    currentCard.interval = Math.round(currentCard.interval * 3);
    currentCard.due = Date.now() + currentCard.interval * DAY;

    nextCard();
}

// ----------------------
// NAVIGATION (USED BY SWIPE)
// ----------------------
function nextCard() {
    currentIndex++;
    showingAnswer = false;
    saveProgress();
    showCard();
}

function prevCard() {
    currentIndex = (currentIndex - 1 + cards.length) % cards.length;
    showingAnswer = false;
    showCard();
}

// ----------------------
// STORAGE
// ----------------------
function saveProgress() {
    localStorage.setItem("flashcards", JSON.stringify(cards));
}

function loadProgress() {
    const saved = localStorage.getItem("flashcards");
    if (saved) {
        cards = JSON.parse(saved);
    }
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