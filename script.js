// =======================
// Flashcards JS
// =======================

// let decks = {};
let currentDeckName = "";
let cards = [];
let currentIndex = 0;
let showingAnswer = false;
let isEditing = false;
let explanationVisible = false;

const decks = [
  { name: "CompTIA Security+", file: "decks/sec_plus_acronymns.json" }
];

function populateDeckDropdown() {
    const deckSelect = document.getElementById("deckSelect");
    deckSelect.innerHTML = "";

    decks.forEach(deck => {
        const option = document.createElement("option");
        // GitHub deck → value is file path; uploaded deck → value is name
        option.value = deck.file || deck.name;
        option.textContent = deck.name;
        deckSelect.appendChild(option);
    });

    // Select last saved deck if available
    const savedDeck = localStorage.getItem("selectedDeck");
    if (savedDeck) {
        deckSelect.value = savedDeck;
    } else if (decks.length > 0) {
        // default to first deck
        deckSelect.value = decks[0].file || decks[0].name;
    }
}
console.log("Dropdown options:", deckSelect.options);

async function loadDeck(file) {
  try {
    const response = await fetch(file);
    const data = await response.json();

    cards = data;

    // set deck name based on file
    const deckObj = decks.find(d => d.file === file);
    currentDeckName = deckObj ? deckObj.name : "default";

    // check localStorage override
    const saved = localStorage.getItem(currentDeckName);
    if (saved) {
      cards = JSON.parse(saved);
    }

    currentIndex = 0;
    showingAnswer = false;

    showCard();
  } catch (err) {
    console.error("Error loading deck:", err);
  }
}

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

            // ✅ Add to decks array correctly
            decks.push({
                name: deckName,
                file: null,
                data: newCards
            });

            // ✅ Update dropdown
            const option = document.createElement("option");
            option.value = deckName;
            option.textContent = deckName;
            deckSelect.appendChild(option);

            // ✅ Load it immediately
            loadDeckFromData(deckName, newCards);

        } catch (err) {
            alert("Invalid JSON file.");
            console.error(err);
        }
    };
    reader.readAsText(file);
});

function loadDeckFromData(name, data) {
    currentDeckName = name;

    const saved = localStorage.getItem(name);
    cards = saved ? JSON.parse(saved) : data;

    currentIndex = 0;
    showingAnswer = false;

    showCard();
}

// =======================
// Deck selector
// =======================

function switchDeck() {
    const selectedValue = document.getElementById("deckSelect").value;

    // Save selected deck for next visit
    localStorage.setItem("selectedDeck", selectedValue);

    // Try to find GitHub deck by file
    let deckObj = decks.find(d => d.file === selectedValue);
    if (deckObj) {
        loadDeck(deckObj.file);
        return;
    }

    // Try to find uploaded deck by name
    deckObj = decks.find(d => d.name === selectedValue && d.data);
    if (deckObj) {
        loadDeckFromData(deckObj.name, deckObj.data);
        return;
    }

    // If not found, fallback to first deck
    if (decks.length > 0) {
        if (decks[0].file) {
            loadDeck(decks[0].file);
        } else if (decks[0].data) {
            loadDeckFromData(decks[0].name, decks[0].data);
        }
    }
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

async function showExplanation() {
  if (cards.length === 0) return;

  const card = cards[currentIndex];
  const explEl = document.getElementById("explanation");
  const btnEdit = document.getElementById("btnEdit");

  explEl.value = card.explanation && card.explanation.trim() !== ""
      ? card.explanation
      : "Loading AI explanation...";

  explEl.style.display = "block";
  explanationVisible = true;
  btnEdit.disabled = false;
  document.getElementById("btnUpdate").disabled = true;

  // Fetch AI explanation if not already saved
  if (!card.explanation || card.explanation.trim() === "") {
    const aiExpl = await fetchAIExplanation(card.question);
    card.explanation = aiExpl;
    explEl.value = aiExpl;
    // Save locally
    localStorage.setItem(currentDeckName, JSON.stringify(cards));
  }
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



// Call the Vercel backend to get AI explanation
async function fetchAIExplanation(question) {
  try {
    const res = await fetch("https://flashcards-mobile-rleawn91b-wombizombis-projects.vercel.app/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error);

    return data.explanation;
  } catch (err) {
    console.error("AI request failed:", err);
    return "AI explanation unavailable";
  }
}

// =======================
// Initialize
// =======================
document.addEventListener("DOMContentLoaded", () => {
    const deckSelect = document.getElementById("deckSelect");

    // Populate dropdown with all decks
    decks.forEach(deck => {
        const option = document.createElement("option");
        // use deck.file if it exists, else deck.name (uploaded decks)
        option.value = deck.file || deck.name;
        option.textContent = deck.name;
        deckSelect.appendChild(option);
    });

    // Load last selected deck if it exists
    const savedDeck = localStorage.getItem("selectedDeck");
    if (savedDeck) {
        // Try to find as GitHub deck
        let deckObj = decks.find(d => d.file === savedDeck);
        if (deckObj) {
            deckSelect.value = deckObj.file;
            loadDeck(deckObj.file);
            return;
        }

        // Try to find as uploaded deck
        deckObj = decks.find(d => d.name === savedDeck && d.data);
        if (deckObj) {
            deckSelect.value = deckObj.name;
            loadDeckFromData(deckObj.name, deckObj.data);
            return;
        }
    }

    // Default: load first deck
    if (decks.length > 0) {
        deckSelect.value = decks[0].file || decks[0].name;
        if (decks[0].file) {
            loadDeck(decks[0].file);
        } else if (decks[0].data) {
            loadDeckFromData(decks[0].name, decks[0].data);
        }
    }
});