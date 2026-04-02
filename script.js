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
    let startY = 0;

    cardElement.addEventListener("touchstart", (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });

    cardElement.addEventListener("touchmove", (e) => {
        let currentX = e.touches[0].clientX;
        let currentY = e.touches[0].clientY;

        let diffX = currentX - startX;
        let diffY = currentY - startY;

        if (diffX > 0) {
        cardElement.style.background = "#d4edda"; // green
        } else if (diffX < 0) {
        cardElement.style.background = "#f8d7da"; // red
        } else if (diffY < 0) {
        cardElement.style.background = "#d1ecf1"; // blue
        }

        // Move card with finger
        cardElement.style.transform = `translate(${diffX}px, ${diffY}px)`;
    });

    cardElement.addEventListener("touchend", (e) => {
        let endX = e.changedTouches[0].clientX;
        let endY = e.changedTouches[0].clientY;

        let diffX = endX - startX;
        let diffY = endY - startY;

        const threshold = 60;

        // Determine swipe direction
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Horizontal swipe
            if (Math.abs(diffX) > threshold) {

                if (diffX > 0) {
                    // 👉 RIGHT = GOOD
                    cardElement.style.transform = "translateX(120%)";
                    cardElement.style.opacity = "0";

                    setTimeout(() => {
                        markGood();
                        resetCard();
                    }, 200);

                } else {
                    // 👈 LEFT = AGAIN
                    cardElement.style.transform = "translateX(-120%)";
                    cardElement.style.opacity = "0";

                    setTimeout(() => {
                        markAgain();
                        resetCard();
                    }, 200);
                }
                return;
            }
        } else {
            // Vertical swipe
            if (Math.abs(diffY) > threshold && diffY < 0) {
                // ⬆️ UP = EASY
                cardElement.style.transform = "translateY(-120%)";
                cardElement.style.opacity = "0";

                setTimeout(() => {
                    markEasy();
                    resetCard();
                }, 200);

                return;
            }
        }

        // Snap back if not enough swipe
        resetCard();
    });

    function resetCard() {
        cardElement.style.transform = "translate(0, 0)";
        cardElement.style.opacity = "1";
        cardElement.style.background = "white";
    }

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

    if (currentIndex >= dueCards.length) {
    currentIndex = 0;
}

const currentCard = dueCards[currentIndex];

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
    const dueCards = getDueCards();
    currentIndex = (currentIndex + 1) % dueCards.length;
    showCard();
}

function prev() {
    const dueCards = getDueCards();
    currentIndex = (currentIndex - 1 + dueCards.length) % dueCards.length;
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