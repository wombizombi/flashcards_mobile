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
  const card = cards[currentIndex];
  const cardElement = document.getElementById('card');

  document.getElementById('textFront').innerText = card.question;
  document.getElementById('textBack').innerText = card.answer;
  document.getElementById('explanationBack').innerText = card.answer;

  document.getElementById('progress').innerText = `${currentIndex + 1} / ${cards.length}`;
  cardElement.classList.remove('flipped');
  showingAnswer = false;
}

function flip() {
  document.getElementById('card').classList.toggle('flipped');
  showingAnswer = !showingAnswer;
}

function next() {
  currentIndex = (currentIndex + 1) % cards.length;
  showCard();
}

function prev() {
  currentIndex = (currentIndex - 1 + cards.length) % cards.length;
  showCard();
}

function markAgain() { next(); }
function markGood() { next(); }
function markEasy() { next(); }

window.onload = loadCards;