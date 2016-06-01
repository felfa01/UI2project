var dictionary = {
    "english": {
        "rotate": "Try to spin the big cube!",
        "jumping": "Well done! Now try to drag one of the small objects!",
        "drop": "Now drop the small object on the large cubes side with the same color!",
        "tutorialOn": "Tutorial On",
        "tutorialOff": "Tutorial Off",
        "soundOn": "Sound On",
        "soundOff": "Sound Off",
        "winText": "Congratulations!",
        "playAgain": "Play Again"
    },
    "svenska": {
        "rotate": "Försök att snurra den stora kuben!",
        "jumping": "Bra jobbat! Försök nu att dra en av de små figurerna!",
        "drop": "Släpp nu den lilla figuren på den stora kubens sida med samma färg!",
        "tutorialOn": "Genomgång På",
        "tutorialOff": "Genomgång Av",
        "soundOn": "Ljud På",
        "soundOff": "Ljud Av",
        "winText": "Grattis!",
        "playAgain": "Spela Igen"
    }
}

// Translate the text in html elements with attribute langKey according to dictionary above
function translate(lang) {
  sessionStorage.setItem("lang", lang);
  $(".lang").each(function() {
    $(this).html(dictionary[lang][$(this).attr("langKey")])
  })
};
