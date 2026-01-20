

function StartGame(){
    GiveLife($('#GameCharacter'));
}

function GiveLife(characterToLive){

    let topPos = parseInt(characterToLive.css('top')) || 0;
    let leftPos = parseInt(characterToLive.css('left')) || 0;
    const speed = 50;
    const duration = 100;

    $(document).on('keydown', function(e){
        const key = e.key.toLowerCase();

        switch(key){
            case 'w':
                topPos -= speed;
                break;                
            case 'a':
                leftPos -= speed;
                break;
            case 's':
                topPos += speed;
                break;
            case 'd':
                 leftPos += speed;
                break;
            default: return;
        }
    
        characterToLive.stop(true, false).animate({
            top: `${topPos}px`,
            left: `${leftPos}px`
        }, duration);
    });
}