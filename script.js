/*

// =======================
// Flashcards JS
// =======================

let decks = {};           // store multiple decks by name
let currentDeckName = ""; // currently selected deck
let cards = [];           // current deck's cards
let currentIndex = 0;
let showingAnswer = false;
let isEditing = false;
let explanationVisible = false;

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

    // 🔥 Try localStorage first
    const saved = localStorage.getItem(currentDeckName);

    if (saved) {
        cards = JSON.parse(saved);
    } else {
        cards = decks[currentDeckName] || [];
    }

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

    const btnEdit = document.getElementById("btnEdit");
    const btnUpdate = document.getElementById("btnUpdate");

    if (cards.length === 0) {
        textEl.innerText = "No cards loaded!";
        modeEl.innerText = "";
        explEl.value = "";
        progressEl.innerText = "";
        return;
    }

    const card = cards[currentIndex];

    textEl.innerText = showingAnswer ? card.answer : card.question;
    modeEl.innerText = showingAnswer ? "ANSWER" : "QUESTION";

    // 🔥 Reset explanation UI
    explEl.style.display = "none";
    explEl.setAttribute("readonly", true);
    explEl.value = "";

    explanationVisible = false;
    isEditing = false;

    // 🔥 Disable buttons
    btnEdit.disabled = true;
    btnUpdate.disabled = true;

    progressEl.innerText = `${currentIndex + 1} / ${cards.length}`;
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

    const btnEdit = document.getElementById("btnEdit");

    // 🔥 Always show something
    explEl.value = card.explanation && card.explanation.trim() !== ""
        ? card.explanation
        : "No explanation available";

    explEl.style.display = "block";

    explanationVisible = true;

    // 🔥 Enable edit now
    btnEdit.disabled = false;
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


function editCard() {
    if (!explanationVisible) return;

    const explEl = document.getElementById("explanation");
    const btnUpdate = document.getElementById("btnUpdate");

    // If placeholder text, clear it
    if (explEl.value === "No explanation available") {
        explEl.value = "";
    }

    explEl.removeAttribute("readonly");
    explEl.focus();

    isEditing = true;

    // 🔥 Enable update
    btnUpdate.disabled = false;
}

// ----------------------
// SAVE CHANGES (IN MEMORY + DOWNLOAD)
// ----------------------
function saveCard() {
    if (!isEditing || cards.length === 0) return;

    const explEl = document.getElementById("explanation");
    const card = cards[currentIndex];

    // 🔥 Only thing being saved
    card.explanation = explEl.value;

    explEl.setAttribute("readonly", true);
    isEditing = false;

    alert("Explanation saved (downloading file)");

    downloadDeck();
}

// ----------------------
// DOWNLOAD UPDATED JSON
// ----------------------
function downloadDeck() {
    const dataStr = JSON.stringify(cards, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = (currentDeckName || "flashcards") + "_updated.json";
    a.click();

    URL.revokeObjectURL(url);
}

function updateCard() {
    if (!isEditing || cards.length === 0) return;

    const explEl = document.getElementById("explanation");
    const card = cards[currentIndex];

    card.explanation = explEl.value;

    explEl.setAttribute("readonly", true);
    isEditing = false;

    // 🔥 AUTO SAVE
    localStorage.setItem(currentDeckName, JSON.stringify(cards));

    alert("Saved locally!");
}

// =======================
// Initialize (empty)
switchDeck();
*/

// =======================
// Flashcards JS
// =======================

let decks = {};
let currentDeckName = "";
let cards = [];
let currentIndex = 0;
let showingAnswer = false;
let isEditing = false;
let explanationVisible = false;

// =======================
// Load JSON deck
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
    select.innerHTML = "";
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

    const saved = localStorage.getItem(currentDeckName);
    cards = saved ? JSON.parse(saved) : decks[currentDeckName] || [];

    currentIndex = 0;
    showingAnswer = false;
    explanationVisible = false;
    isEditing = false;

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

    const btnEdit = document.getElementById("btnEdit");
    const btnUpdate = document.getElementById("btnUpdate");

    if (cards.length === 0) {
        textEl.innerText = "No cards loaded!";
        modeEl.innerText = "";
        explEl.style.display = "none";
        progressEl.innerText = "";
        btnEdit.disabled = true;
        btnUpdate.disabled = true;
        return;
    }

    const card = cards[currentIndex];

    textEl.innerText = showingAnswer ? card.answer : card.question;
    modeEl.innerText = showingAnswer ? "ANSWER" : "QUESTION";

    // Reset explanation UI
    explEl.style.display = "none";
    explEl.setAttribute("readonly", true);
    explEl.value = "";

    explanationVisible = false;
    isEditing = false;

    btnEdit.disabled = true;
    btnUpdate.disabled = true;

    progressEl.innerText = `${currentIndex + 1} / ${cards.length}`;
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

function randomCard() {
    if (cards.length === 0) return;
    currentIndex = Math.floor(Math.random() * cards.length);
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
    const btnEdit = document.getElementById("btnEdit");

    explEl.value = card.explanation && card.explanation.trim() !== ""
        ? card.explanation
        : "No explanation available";

    explEl.style.display = "block";

    explanationVisible = true;
    btnEdit.disabled = false;
    document.getElementById("btnUpdate").disabled = true;
}

// =======================
// Edit / Update
// =======================
function editCard() {
    if (!explanationVisible) return;
    const explEl = document.getElementById("explanation");
    const btnUpdate = document.getElementById("btnUpdate");

    if (explEl.value === "No explanation available") explEl.value = "";

    explEl.removeAttribute("readonly");
    explEl.focus();

    isEditing = true;
    btnUpdate.disabled = false;
}

function updateCard() {
    if (!isEditing || cards.length === 0) return;
    const card = cards[currentIndex];
    const explEl = document.getElementById("explanation");

    card.explanation = explEl.value;

    explEl.setAttribute("readonly", true);
    isEditing = false;
    document.getElementById("btnUpdate").disabled = true;

    // Save locally
    localStorage.setItem(currentDeckName, JSON.stringify(cards));
}

// =======================
// Save / Download
// =======================
function saveCard() {
    if (cards.length === 0) return;

    // Make sure latest explanation is saved in memory
    const card = cards[currentIndex];
    const explEl = document.getElementById("explanation");
    if (explanationVisible && explEl.value.trim() !== "") {
        card.explanation = explEl.value;
    }

    // Download JSON
    const dataStr = JSON.stringify(cards, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (currentDeckName || "flashcards") + "_updated.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// =======================
// Sorting
// =======================
function alphabetizeCards() {
    cards.sort((a, b) => (a.question || "").localeCompare(b.question || ""));
    currentIndex = 0;
    showingAnswer = false;
    showCard();
}

function shuffleCards() {
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    currentIndex = 0;
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
// Initialize
// =======================
switchDeck();