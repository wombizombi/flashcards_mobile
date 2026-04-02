alert("JS is working");
let cards = [];
let currentIndex = 0;
let showingAnswer = false;

const DAY = 24 * 60 * 60 * 1000;

function initSRS(card) {
    if (!card.interval) card.interval = 1;
    if (!card.due) card.due = Date.now();
}

let startX = 0;
let endX = 0;

const card = document.querySelector(".card");

card.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
});

card.addEventListener("touchmove", (e) => {
    endX = e.touches[0].clientX;
});

card.addEventListener("touchend", () => {
    let diff = startX - endX;

    if (Math.abs(diff) > 50) {

        if (diff > 0) {
            // Swipe LEFT → animate left
            card.style.transform = "translateX(-100%)";
        } else {
            // Swipe RIGHT → animate right
            card.style.transform = "translateX(100%)";
        }

        card.style.opacity = "0";

        setTimeout(() => {
            if (diff > 0) {
                nextCard();
            } else {
                prevCard();
            }

            // Reset position
            card.style.transform = "translateX(0)";
            card.style.opacity = "1";
        }, 200);
    }
});

card.addEventListener("touchmove", (e) => {
    endX = e.touches[0].clientX;
    let diff = endX - startX;

    card.style.transform = `translateX(${diff}px)`;
});

// Load default JSON
async function loadCards() {
    const res = await fetch("comptia_flashcards.json");
    cards = await res.json();

    loadProgress();
    cards.forEach(initSRS);

    showCard();
}

function getDueCards() {
    const now = Date.now();
    return cards.filter(c => c.due <= now);
}

function showCard() {
    const dueCards = getDueCards();

    if (dueCards.length === 0) {
        document.getElementById("text").innerText = "🎉 All caught up!";
        document.getElementById("mode").innerText = "";
        document.getElementById("progress").innerText = "";
        return;
    }

    const card = dueCards[currentIndex % dueCards.length];

    document.getElementById("mode").innerText = showingAnswer ? "ANSWER" : "QUESTION";
    document.getElementById("text").innerText =
        showingAnswer ? card.answer : card.question;

    document.getElementById("progress").innerText =
        `${currentIndex + 1} / ${dueCards.length}`;

    clearExplanation();
}

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

// Explain (GitHub Pages safe fallback)
function explainCard() {
    const card = cards[currentIndex];
    document.getElementById("explanation").innerText =
        `Explanation:\n${card.answer}`;
}

// Clear explanation
function clearExplanation() {
    document.getElementById("explanation").innerText = "";
}

function markAgain() {
    const card = getDueCards()[currentIndex];
    card.interval = 1;
    card.due = Date.now() + DAY;

    nextCard();
}

function markGood() {
    const card = getDueCards()[currentIndex];
    card.interval = Math.round(card.interval * 2);
    card.due = Date.now() + card.interval * DAY;

    nextCard();
}

function markEasy() {
    const card = getDueCards()[currentIndex];
    card.interval = Math.round(card.interval * 3);
    card.due = Date.now() + card.interval * DAY;

    nextCard();
}

function nextCard() {
    currentIndex++;
    showingAnswer = false;
    saveProgress();
    showCard();
}

function saveProgress() {
    localStorage.setItem("flashcards", JSON.stringify(cards));
}

function loadProgress() {
    const saved = localStorage.getItem("flashcards");
    if (saved) {
        cards = JSON.parse(saved);
    }
}

// Load JSON from file
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

// Keyboard shortcuts (desktop)
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

function nextCard() {
    currentIndex = (currentIndex + 1) % flashcards.length;
    loadCard();
}

function prevCard() {
    currentIndex = (currentIndex - 1 + flashcards.length) % flashcards.length;
    loadCard();
}



loadCards();