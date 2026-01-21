let ImgCharacterPreview;
let CarouselCharacters;
const imgString = 'resources/selection';

const characters = [
    { name: 'Koseki Bijou', alias: 'Biboo' },
    { name: 'Nerissa Ravencroft', alias: 'Rissa' },
    { name: 'Mococo Abyssgard', alias: 'Moco-chan' },
    { name: 'Fuwawa Abyssgard', alias: 'Fuwawa' },
    { name: 'Shiori Novella', alias: 'Shiori' },
    { name: 'Hakos Baelz', alias: 'Bae' },
    { name: 'Ouro Kronii', alias: 'Kronii' },
    { name: 'IRyS', alias: 'Irys' },
    { name: 'Nanashi Mumei', alias: 'Moom' },
    { name: 'Ceres Fauna', alias: 'Fauna' },
    { name: 'Tsukumo Sana', alias: 'Sana' },
    { name: 'Takanashi Kiara', alias: 'Wawa' },
    { name: 'Mori Calliope', alias: 'Dad' },
    { name: "Ninomae Ina'nis", alias: 'Ina' },
    { name: 'Gawr Gura', alias: 'Gooba' },
    { name: 'Amelia Watson', alias: 'Ame' }
]

function LoadCharacter(characterIndex){
    let ImgCharacterPreview = $('#ImgCharacterPreview');

    let characterObj = characters[characterIndex];
    console.log(characterObj);

    if(characterObj != undefined){
        ImgCharacterPreview.attr('src', `${imgString}/${characterObj.alias}.png`);
    }
    else{
        ImgCharacterPreview.attr('src', `${imgString}/Biboo.png`);
    }
}

function SetCharacterSelects(characterIndex){
    let CarouselCharacters = $('#CarouselCharacters .carousel-inner');

    CarouselCharacters.empty();

    if(characterIndex == undefined){
        characterIndex = 0;
    }

    $.each(characters, function(i, characterObj){
        CarouselCharacters.append(`
            <div class="carousel-item ${i == characterIndex ? 'active' : ''}" style="max-height: 30rem; max-width: 30rem;" data-characterindex="${i}">
                <img src="${imgString}/${characterObj.alias}.png" class="d-block w-100" style="max-width: 100%;max-height: 26rem; object-fit: contain;">
            </div>
        `);
    });
}