let jModalMainMenu;
let jModalChangeCharacter;
let ModalChangeCharacter;
let ModalMainMenu;
let SubtitlePhrase;
let BibooRoll;

let savedCharacter = localStorage.getItem('savedCharacter');

const phrases = [
    'the gaaaame!!',
    'you shall not play',
    'la sopa del macaco',
    'best score buys dinner',
    'the end is near',
    `today is ${new Date().toDateString()}!!`,
    'bro moment',
    'bruuuuh',
    'sticking out ur gyatt for nerizzler',
    'youre so biboo tax',
    'i just wanna be your shiori',
    'youre so bau bau',
    'oh hello there pebble',
    'window cleaner laugh',
    'beeeeejou',
    'koseki bijou'
]

$(document).ready(function (){
    InitializeVars();
    RunMenuAnimation();

    ShowMainMenu();
});

function InitializeVars(){
    jModalMainMenu = $('#ModalMainMenu');
    ModalMainMenu = new bootstrap.Modal(jModalMainMenu);
    SubtitlePhrase = $('#SubtitlePhrase');
    BibooRoll = $('#BibooRoll');
    jModalChangeCharacter = $('#ModalChooseCharacter');
    ModalChangeCharacter = new bootstrap.Modal(jModalChangeCharacter);
}

function RunMenuAnimation(){
  const h1 = document.querySelector('.breath-text');

  const span = (text, index) => {
    const node = document.createElement('span');
    node.textContent = text;
    node.style.setProperty('--index', index);
    return node;
  };

  const byLetter = (text) => [...text].map(span);

  const split = byLetter(h1.textContent);
  h1.textContent = ''; // Clear original text
  split.forEach(letter => h1.appendChild(letter));
}

function OpenChangeCharacterModal(){
  ModalMainMenu.hide();
  ModalChangeCharacter.show();

  SetCharacterSelects(savedCharacter);
}

function HideCharacterSelect(){
    let selectedCharacterUI = $('#CarouselCharacters .active').data('characterindex');
    localStorage.setItem('savedCharacter', selectedCharacterUI);
    savedCharacter = selectedCharacterUI;

    ModalChangeCharacter.hide();

    ShowMainMenu();
}

function ShowMainMenu(){
    let randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    SubtitlePhrase.text(`${randomPhrase}!!`);

    LoadCharacter(savedCharacter);

    ModalMainMenu.show();
}

function StartGameplay(){
    //location.href = 'gameplay.html';
    StartGame();
    ModalMainMenu.hide();
}