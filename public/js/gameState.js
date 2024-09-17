//creat Critter class
class Critter {
    constructor(owner) {
        this.owner = owner;
        this.alive = true;
        this.loc = {
            x: 0,
            y: 0,
            xs: 0,
            ys: 0,
            w: 48,
            h: 48
        }
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

    move() {
        if (this.alive) {
            this.x += this.xSpeed;
            this.y += this.ySpeed;
            if (this.x + this.width > canvasWidth || this.x < 0) {
                this.xSpeed = -this.xSpeed;
            }
            if (this.y + this.height > canvasHeight || this.y < 0) {
                this.ySpeed = -this.ySpeed;
            }
        }
    }

    draw() {
        //fillstyle is the BODY MIND SOUL as RGB
        ctx.fillStyle = "rgb(" + this.traits.BODY + "," + this.traits.MIND + "," + this.traits.SOUL + ")";
        ctx.fillRect(this.loc.x, this.loc.y, this.loc.w, this.loc.h);
        if (this.alive && this.health.life <= 0) {
            this.alive = false;
            if (game.debug) game.ui.output("Critter is Dead");
        }
        if (!this.alive) {
            //hide the menu if the critter is dead
            game.ui.menu.style.display = "none";
            //show the dead menu
            var deadMenu = document.getElementById("deadMenu");
            deadMenu.style.display = "block";
        }
    }
}

//create a new game class
class Game {
    constructor(socketid) {
        // this.hostUser = hostUser;
        this.socketid = socketid;
        this.guests = [];
        this.critters = [];
        this.ticks = 0;
        this.debug = true;
    }

    update(data) {
        //for each critter
        for (const critter of data.critters) {
            //if the critter is not in the game, add it
            if (!this.critters.some(c => c.id == critter.id)) {
                this.critters.push(new Critter(critter.id));
            }
            //if the critter is in the game, update it
            let foundCritter = this.critters.find(c => c.id == critter.id);
            if (foundCritter) {
                foundCritter.loc = critter.loc;
                foundCritter.health = critter.health;
                foundCritter.stats = critter.stats;
                foundCritter.traits = critter.traits;
                foundCritter.stage = critter.stage;
                foundCritter.heartrate = critter.heartrate;
            }

        }
        //update the ticks
        this.ticks = data.ticks;
        //update the debug
        this.debug = data.debug;
        this.drawAll();
    }

    drawAll() {
        this.healthDraw();
        this.statDraw();
        this.traitDraw();
        this.draw();
    }

    healthDraw() {
        //get the critter from the list who's owner's name matches this token's name
        let critter = this.critters.find(c => c.owner == this.hostUser);
        //get health div
        var health = document.getElementById("health");
        //set health div to empty
        health.innerHTML = "";
        //draw number of health.heartbeats, with commas
        health.innerHTML = "Heart Beats: " + critter.health.heartbeats.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        //add an energy bar
        var energy = document.createElement("progress");
        energy.max = 254;
        energy.value = critter.health.energy;
        health.appendChild(energy);
        //add a life bar
        var life = document.createElement("progress");
        life.max = 254;
        life.value = critter.health.life;
        health.appendChild(life);
    }

    statDraw() {
        //get the critter from the list who's owner's name matches this token's name
        let critter = this.critters.find(c => c.owner == this.hostUser);
        //get stats div
        var stats = document.getElementById("stats");
        //set stats div to empty
        stats.innerHTML = "";
        //create a new div for each stat
        for (var stat in critter.stats) {
            var statDiv = document.createElement("div");
            // Stat name with capital first letter and number out of 254
            statDiv.innerHTML = stat.charAt(0).toUpperCase() + stat.slice(1) + ": " + critter.stats[stat] + "/254<br>";
            //draw full hearts
            for (let statVal = 0; statVal < Math.floor((critter.stats[stat] + 32) / 64); statVal++) {
                //add a heart image to the div
                var heart = document.createElement("img");
                heart.src = "img/h_full.png";
                heart.width = 36;
                heart.height = 24;
                statDiv.appendChild(heart);
            }
            //draw half hearts
            if (critter.stats[stat] % 64 > 0 && critter.stats[stat] % 64 < 32) {
                //add a heart image to the div
                var heart = document.createElement("img");
                heart.src = "img/h_half.png";
                heart.width = 36;
                heart.height = 24;
                statDiv.appendChild(heart);
            }
            // draw remaing hearts as empty
            for (let statVal = 0; statVal <= 3 - critter.stats[stat] / 64; statVal++) {
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
        //get the critter from the list who's owner's name matches this token's name
        let critter = this.critters.find(c => c.owner == this.hostUser);
        //get traits div
        var traits = document.getElementById("traits");
        //set traits div to empty
        traits.innerHTML = "";
        //create a new div for each trait
        for (var trait in critter.traits) {
            var traitDiv = document.createElement("div");
            traitDiv.innerHTML = trait + ": " + critter.traits[trait] + "<br>";
            //add a progress bar to the div
            var bar = document.createElement("progress");
            bar.max = 254;
            bar.value = critter.traits[trait];
            traitDiv.appendChild(bar);
            //add the div to the traits
            traits.appendChild(traitDiv);
        }
    }

    draw() {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        //draw each critter
        for (let critter of this.critters) {
            critter.draw();
        }
    }

    roll(against) {
        return Math.round(Math.random() * 254) > against;
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
