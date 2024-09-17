//creat Critter class
class Critter {
    constructor(owner) {
        this.owner = owner;
        this.loc = {
            x: 0,
            y: 0,
            xs: 0,
            ys: 0,
            w: 48,
            h: 48
        }
        this.alive = true;
        this.health = {
            life: 254,
            heartbeats: 1,
            energy: 100
        }
        this.stats = {
            hunger: 33,
            boredom: 33,
            happiness: 33
        };
        this.traits = {
            BODY: 10,
            MIND: 10,
            SOUL: 10
        };
        this.stage = 0;
        this.heartrate = 600;
    }

}

//create a new game class
class Game {
    constructor(socketid, hostUser) {
        this.hostUser = hostUser;
        this.socketid = socketid;
        this.guests = [];
        this.critters = [new Critter(this.hostUser)];
        this.ticks = 0;
        this.debug = true;
    }

    step() {
        this.ticks += 1;
        // for each critter
        for (const critter of this.critters) {
            if (critter.alive) {
                critter.health.heartbeats += 1;
                // decrease hunger if roll against body
                if (this.roll(critter.traits.BODY)) {
                    critter.stats.hunger -= 1;
                }
                // decrease boredom if roll against mind
                if (this.roll(critter.traits.MIND)) {
                    critter.stats.boredom -= 1;
                }
                // decrease happiness if roll against soul
                if (this.roll(critter.traits.SOUL)) {
                    critter.stats.happiness -= 1;
                }
                //if any stat is less than 0, make it 0
                for (var stat in critter.stats) {
                    if (critter.stats[stat] < 0) {
                        critter.stats[stat] = 0;
                    }
                }
                if (this.ticks % critter.heartrate == 0) {
                    //for each stat, roll against it and decrease life if fail
                    for (var stat in critter.stats) {
                        if (this.roll(critter.stats[stat])) {
                            critter.health.life -= 1;
                        }
                    }
                }
                if (critter.alive && critter.health.life <= 0) {
                    critter.alive = false;
                }
            }
        }
    }

    roll(against) {
        return Math.round(Math.random() * 254) > against;
    }
}

// create a UI class
// class UI {
//     constructor() {
//         this.menu = document.getElementById("menu");
//         this.menu.style.display = "none";
//         this.menuShown = false;
//     }
//     showMenu() {
//         if (this.menuShown) {
//             this.menu.style.display = "none";
//             this.menuShown = false;
//             return;
//         } else {
//             this.menu.style.display = "block";
//             this.menuShown = true;
//         }
//     }
//     feed() {
//         game.critter.stats.hunger += 32;
//         if (game.critter.stats.hunger > 254) {
//             game.critter.stats.hunger = 254;
//         }
//     }
//     play() {
//         game.critter.stats.happiness += 32;
//         if (game.critter.stats.happiness > 254) {
//             game.critter.stats.happiness = 254;
//         }
//     }
//     study() {
//         game.critter.stats.boredom += 32;
//         if (game.critter.stats.boredom > 254) {
//             game.critter.stats.boredom = 254;
//         }
//     }

//     trainBODY() {
//         game.critter.traits.BODY += 32;
//         if (game.critter.traits.BODY > 254) {
//             game.critter.traits.BODY = 254;
//         }
//     }
//     trainMIND() {
//         game.critter.traits.MIND += 32;
//         if (game.critter.traits.MIND > 254) {
//             game.critter.traits.MIND = 254;
//         }
//     }
//     trainSOUL() {
//         game.critter.traits.SOUL += 32;
//         if (game.critter.traits.SOUL > 254) {
//             game.critter.traits.SOUL = 254;
//         }
//     }

// }

module.exports = {
    Critter,
    Game
};