let cards = [];
let currentIndex = 0;
let showingAnswer = false;

function loadCards() {
  fetch('comptia_flashcards.json')
    .then(res => res.json())
    .then(data => {
      cards = data;
      showCard();
    });
}

function showCard() {
  if (cards.length === 0) {
    document.getElementById('text').innerText = "🎉 No cards loaded!";
    document.getElementById('mode').innerText = "";
    document.getElementById('explanation').innerText = "";
    document.getElementById('progress').innerText = "";
    return;
  }

  const card = cards[currentIndex];
  document.getElementById('mode').innerText = showingAnswer ? "ANSWER" : "QUESTION";
  document.getElementById('text').innerText = showingAnswer ? card.answer : card.question;
  document.getElementById('explanation').innerText = showingAnswer ? card.answer : "";
  document.getElementById('progress').innerText = `${currentIndex + 1} / ${cards.length}`;
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

function markAgain() { next(); }
function markGood() { next(); }
function markEasy() { next(); }

document.getElementById('loadFile').addEventListener('change', function(e){
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    cards = JSON.parse(ev.target.result);
    currentIndex = 0;
    showingAnswer = false;
    showCard();
  };
  reader.readAsText(file);
});

function resetWeights() {
    if (!cards || cards.length === 0) return;

    // Reset each card's interval and due date
    cards.forEach(card => {
        card.interval = 0;         // reset weight
        card.due = Date.now();     // make it immediately due
    });

    // Reset to first card
    currentIndex = 0;
    showingAnswer = false;

    // Update display
    showCard();

    // Optional: save progress
    saveProgress();

    // Optional: confirm reset
    alert("All card weights have been reset!");
}

window.onload = loadCards;