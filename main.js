//creat Gotchi class
class Gotchi {
    constructor(game) {
        this.game = game;
        this.alive = true;
        this.x = 0;
        this.y = 0;
        this.xSpeed = 1;
        this.ySpeed = 1;
        this.width = 48;
        this.height = 48;
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
    beat() {
        if (this.game.ticks % 100 == 0) {
            this.health.heartbeats += 1;
            // decrease hunger if roll against body
            if (this.game.roll(this.traits.BODY)) {
                this.stats.hunger -= 1;
                if (game.debug) game.ui.output("Getting Hungry");
            }
            // decrease boredom if roll against mind
            if (this.game.roll(this.traits.MIND)) {
                this.stats.boredom -= 1;
                if (game.debug) game.ui.output("Getting Bored");
            }
            // decrease happiness if roll against soul
            if (this.game.roll(this.traits.SOUL)) {
                this.stats.happiness -= 1;
                if (game.debug) game.ui.output("Getting Sad");
            }
            //if any stat is less than 0, make it 0
            for (var stat in this.stats) {
                if (this.stats[stat] < 0) {
                    this.stats[stat] = 0;
                }
            }
        }
        if (this.game.ticks % this.heartrate == 0) {
            //for each stat, roll against it and decrease life if fail
            for (var stat in this.stats) {
                if (this.game.roll(this.stats[stat])) {
                    this.health.life -= 1;
                    if (game.debug) game.ui.output("Getting deader: " + stat);
                }
            }
        }
        if (this.alive && this.health.life <= 0) {
            this.alive = false;
            if (game.debug) game.ui.output("Gotchi is Dead");
        }
        if (!this.alive) {
            //hide the menu if the gotchi is dead
            game.ui.menu.style.display = "none";
            //show the dead menu
            var deadMenu = document.getElementById("deadMenu");
            deadMenu.style.display = "block";
        }
    }
    move() {
        this.x += this.xSpeed;
        this.y += this.ySpeed;
        if (this.x + this.width > canvasWidth || this.x < 0) {
            this.xSpeed = -this.xSpeed;
        }
        if (this.y + this.height > canvasHeight || this.y < 0) {
            this.ySpeed = -this.ySpeed;
        }
    }
    draw() {
        //fillstyle is the BODY MIND SOUL as RGB
        ctx.fillStyle = "rgb(" + this.traits.BODY + "," + this.traits.MIND + "," + this.traits.SOUL + ")";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

//create a new game class
class Game {
    constructor() {
        this.ui = new UI();
        this.gotchi = new Gotchi(this);
        this.ticks = 0;
        this.debug = true;
    }
    step() {
        this.ticks += 1;
        if (this.gotchi.alive) {
            this.gotchi.beat();
            this.gotchi.move();
        }
    }
    healthDraw() {
        //get health div
        var health = document.getElementById("health");
        //set health div to empty
        health.innerHTML = "";
        //draw number of health.heartbeats, with commas
        health.innerHTML = "Heart Beats: " + this.gotchi.health.heartbeats.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        //for each health property write the value
        for (var prop in this.gotchi.health) {
            health.innerHTML += "<br>" + prop + ": " + this.gotchi.health[prop];
        }
    }
    statDraw() {
        //get stats div
        var stats = document.getElementById("stats");
        //set stats div to empty
        stats.innerHTML = "";
        //draw number of health.heartbeats, with commas
        stats.innerHTML = "Heart Beats: " + this.gotchi.health.heartbeats.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        //create a new div for each stat
        for (var stat in this.gotchi.stats) {
            var statDiv = document.createElement("div");
            // Stat name with capital first letter and number out of 254
            statDiv.innerHTML = stat.charAt(0).toUpperCase() + stat.slice(1) + ": " + this.gotchi.stats[stat] + "/254<br>";
            //draw full hearts
            for (let statVal = 0; statVal < Math.floor((this.gotchi.stats[stat] + 32) / 64); statVal++) {
                //add a heart image to the div
                var heart = document.createElement("img");
                heart.src = "img/h_full.png";
                heart.width = 36;
                heart.height = 24;
                statDiv.appendChild(heart);
            }
            //draw half hearts
            if (this.gotchi.stats[stat] % 64 > 0 && this.gotchi.stats[stat] % 64 < 32) {
                //add a heart image to the div
                var heart = document.createElement("img");
                heart.src = "img/h_half.png";
                heart.width = 36;
                heart.height = 24;
                statDiv.appendChild(heart);
            }
            // draw remaing hearts as empty
            for (let statVal = 0; statVal <= 3 - this.gotchi.stats[stat] / 64; statVal++) {
                //add a heart image to the div
                var heart = document.createElement("img");
                heart.src = "img/h_empty.png";
                heart.width = 36;
                heart.height = 24;
                statDiv.appendChild(heart);
            }
            //add the div to the stats
            stats.appendChild(statDiv);
        }

    }
    traitDraw() {
        //get traits div
        var traits = document.getElementById("traits");
        //set traits div to empty
        traits.innerHTML = "";
        //create a new div for each trait
        for (var trait in this.gotchi.traits) {
            var traitDiv = document.createElement("div");
            traitDiv.innerHTML = trait + ": " + this.gotchi.traits[trait] + "<br>";
            //add a progress bar to the div
            var bar = document.createElement("progress");
            bar.max = 254;
            bar.value = this.gotchi.traits[trait];
            traitDiv.appendChild(bar);
            //add the div to the traits
            traits.appendChild(traitDiv);
        }
    }
    draw() {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        this.gotchi.draw();
    }
    roll(against) {
        return Math.round(Math.random() * 254) > against;
    }
}

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
        game.gotchi.stats.hunger += 32;
        if (game.gotchi.stats.hunger > 254) {
            game.gotchi.stats.hunger = 254;
        }
    }
    play() {
        game.gotchi.stats.happiness += 32;
        if (game.gotchi.stats.happiness > 254) {
            game.gotchi.stats.happiness = 254;
        }
    }
    study() {
        game.gotchi.stats.boredom += 32;
        if (game.gotchi.stats.boredom > 254) {
            game.gotchi.stats.boredom = 254;
        }
    }

    trainBODY() {
        game.gotchi.traits.BODY += 32;
        if (game.gotchi.traits.BODY > 254) {
            game.gotchi.traits.BODY = 254;
        }
    }
    trainMIND() {
        game.gotchi.traits.MIND += 32;
        if (game.gotchi.traits.MIND > 254) {
            game.gotchi.traits.MIND = 254;
        }
    }
    trainSOUL() {
        game.gotchi.traits.SOUL += 32;
        if (game.gotchi.traits.SOUL > 254) {
            game.gotchi.traits.SOUL = 254;
        }
    }
    output(text) {
        var output = document.getElementById("output");
        let holdText = output.innerHTML;
        output.innerHTML = text + "<br>";
        output.innerHTML += holdText;
    }
}

//get canvsScreen by id
var canvas = document.getElementById("canvasScreen");
var ctx = canvas.getContext("2d");

//get the canvas width and height
var canvasWidth = canvas.width;
var canvasHeight = canvas.height;

//create a new game object
var game = new Game();

//create a new player object
var gotchi = new Gotchi();

//create a game loop
function gameLoop() {
    game.step();
    game.healthDraw();
    game.statDraw();
    game.traitDraw();
    game.draw();
    requestAnimationFrame(gameLoop);
}

//start the game loop
gameLoop();
