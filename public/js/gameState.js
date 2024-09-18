//creat Critter class
class Critter {
    constructor(owner) {
        this.owner = owner;
        this.alive = true;
    }

    draw() {
        //fillstyle is the BODY MIND SOUL as RGB
        ctx.fillStyle = "rgb(" + this.traits.BODY + "," + this.traits.MIND + "," + this.traits.SOUL + ")";
        ctx.fillRect(this.loc.x, this.loc.y, this.loc.w, this.loc.h);
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
                foundCritter.vices = critter.vices;
                foundCritter.stage = critter.stage;
                foundCritter.heartrate = critter.heartrate;
            }

        }
        //update the ticks
        this.ticks = data.ticks;
        //update the debug
        this.debug = data.debug;
        this.drawAll();
        //This player's critter
        let critter = this.critters.find(c => c.owner == this.hostUser);
        if (critter.alive && critter.health.life <= 0) {
            critter.alive = false;
        }
        if (!critter.alive) {
            //hide the menu if the critter is dead
            document.getElementById('menu').style.display = "none";
            //show the dead menu
            var deadMenu = document.getElementById("deadMenu");
            deadMenu.style.display = "block";
        }
    }

    drawAll() {
        this.healthDraw();
        this.statDraw();
        this.traitDraw();
        this.viceDraw();
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
        health.innerHTML += "<br>Energy<br>";
        var energy = document.createElement("progress");
        energy.max = 254;
        energy.value = critter.health.energy;
        health.appendChild(energy);
        //add a life bar
        health.innerHTML += "<br>Life<br>";
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
            // statDiv.innerHTML = stat.charAt(0).toUpperCase() + stat.slice(1) + ": " + critter.stats[stat] + "/254<br>";
            // Stat name
            statDiv.innerHTML = stat.charAt(0).toUpperCase() + stat.slice(1) + ": <br>";
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
            traitDiv.innerHTML = trait;
            //add a progress bar to the div
            var bar = document.createElement("progress");
            bar.max = 254;
            bar.value = critter.traits[trait];
            traitDiv.appendChild(bar);
            //add the div to the traits
            traits.appendChild(traitDiv);
        }
    }

    viceDraw() {
        //get the critter from the list who's owner's name matches this token's name
        let critter = this.critters.find(c => c.owner == this.hostUser);
        //get vices div
        var vices = document.getElementById("vices");
        //set vices div to empty
        vices.innerHTML = "";
        //create a new div for each vice
        for (var vice in critter.vices) {
            var viceDiv = document.createElement("div");
            viceDiv.innerHTML = vice;
            //add a progress bar to the div
            var bar = document.createElement("progress");
            bar.max = 254;
            bar.value = critter.vices[vice];
            viceDiv.appendChild(bar);
            //add the div to the vices
            vices.appendChild(viceDiv);
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
