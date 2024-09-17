// create a UI class
class UI {
    constructor() {
        this.menu = document.getElementById("menu");
        this.menu.style.display = "none";
        this.menuShown = false;
    }
    showMenu() {
        if (this.menuShown) {
            this.menu.style.display = "none";
            this.menuShown = false;
            return;
        } else {
            this.menu.style.display = "block";
            this.menuShown = true;
        }
    }
    feed() {
        game.critter.stats.hunger += 32;
        if (game.critter.stats.hunger > 254) {
            game.critter.stats.hunger = 254;
        }
    }
    play() {
        game.critter.stats.happiness += 32;
        if (game.critter.stats.happiness > 254) {
            game.critter.stats.happiness = 254;
        }
    }
    study() {
        game.critter.stats.boredom += 32;
        if (game.critter.stats.boredom > 254) {
            game.critter.stats.boredom = 254;
        }
    }

    trainBODY() {
        game.critter.traits.BODY += 32;
        if (game.critter.traits.BODY > 254) {
            game.critter.traits.BODY = 254;
        }
    }
    trainMIND() {
        game.critter.traits.MIND += 32;
        if (game.critter.traits.MIND > 254) {
            game.critter.traits.MIND = 254;
        }
    }
    trainSOUL() {
        game.critter.traits.SOUL += 32;
        if (game.critter.traits.SOUL > 254) {
            game.critter.traits.SOUL = 254;
        }
    }
    output(text) {
        var output = document.getElementById("output");
        let holdText = output.innerHTML;
        output.innerHTML = text + "<br>";
        output.innerHTML += holdText;
    }
}