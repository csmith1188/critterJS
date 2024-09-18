//require sqlite3
const sqlite3 = require('sqlite3').verbose();
//create a new database
let db = new sqlite3.Database('data/database.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

//create a player class
class Player {
    constructor(username) {
        this.username = username;
    }
}

//creat Critter class
class Critter {
    constructor(owner) {
        this.owner = owner;
        this.command = "";
        db.get('SELECT * FROM critters WHERE owner = ?', [owner.username], (err, critter) => {
            if (err) {
                console.error(err.message);
            } else if (!critter) {
                this.resetCritter();
                db.run('INSERT INTO critters (owner, alive, life, heartbeats, energy, GLUT, PRIDE, SLOTH, hunger, boredom, happiness, BODY, MIND, SOUL, stage, heartrate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [owner.username, this.alive, this.health.life, this.health.heartbeats, this.health.energy, this.vices.GLUT, this.vices.PRIDE, this.vices.SLOTH, this.stats.hunger, this.stats.boredom, this.stats.happiness, this.traits.BODY, this.traits.MIND, this.traits.SOUL, this.stage, this.heartrate], (err) => {
                        if (err) {
                            console.error(err.message);
                        }
                    });
            } else {
                this.loc = {
                    x: 0,
                    y: 0,
                    xs: 1,
                    ys: 1,
                    w: 48,
                    h: 48
                }
                this.alive = true;
                this.health = {
                    life: critter.life,
                    heartbeats: critter.heartbeats,
                    energy: critter.energy
                }
                this.vices = {
                    GLUT: critter.GLUT,
                    PRIDE: critter.PRIDE,
                    SLOTH: critter.SLOTH
                }
                this.stats = {
                    hunger: critter.hunger,
                    boredom: critter.boredom,
                    happiness: critter.happiness
                };
                this.traits = {
                    BODY: critter.BODY,
                    MIND: critter.MIND,
                    SOUL: critter.SOUL
                };
                this.stage = critter.stage;
                this.heartrate = critter.heartrate;
            }
        });
    }

    resetCritter() {
        this.loc = {
            x: 0,
            y: 0,
            xs: 1,
            ys: 1,
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
        this.vices = {
            GLUT: 0,
            PRIDE: 0,
            SLOTH: 0
        }
        this.stage = 0;
        this.heartrate = 20;
    }
}

//create a new game class
class Game {
    constructor(hostUser) {
        this.hostUser = hostUser;
        this.players = [new Player(this.hostUser)];
        this.critters = [];
        this.ticks = 0;
        this.debug = true;
    }

    step() {
        this.ticks += 1;
        // for each critter
        for (const critter of this.critters) {
            if (critter.alive) {
                critter.health.heartbeats += this.ticks % 2;
                // decrease hunger if roll against body
                if (!this.roll(critter.traits.BODY)) critter.stats.hunger -= 1;
                if (this.roll(critter.vices.GLUT)) critter.stats.hunger -= 1;
                // decrease boredom if roll against mind
                if (!this.roll(critter.traits.MIND)) critter.stats.boredom -= 1;
                if (this.roll(critter.vices.PRIDE)) critter.stats.boredom -= 1;
                // decrease happiness if roll against soul
                if (!this.roll(critter.traits.SOUL)) critter.stats.happiness -= 1;
                if (this.roll(critter.vices.SLOTH)) critter.stats.happiness -= 1;
                //if any stat is less than 0, make it 0
                for (var stat in critter.stats) {
                    if (critter.stats[stat] < 0) {
                        critter.stats[stat] = 0;
                    }
                }
                //energy
                if (this.roll(critter.traits.BODY)) critter.health.energy += 1;
                critter.health.energy += 1;
                if (critter.health.energy > 254) critter.health.energy = 254;
                if (this.ticks % critter.heartrate == 0) {
                    //for each stat, roll against it and decrease life if fail
                    for (var stat in critter.stats) {
                        if (!this.roll(critter.stats[stat])) {
                            critter.health.life -= 1;
                        }
                    }
                }
                if (critter.alive && critter.health.life <= 0) {
                    critter.alive = false;
                }
                switch (critter.command) {
                    case 'feed':
                        if (critter.health.energy > 10) {
                            critter.health.energy -= 10;
                            if (!this.roll(critter.traits.BODY)) {
                                critter.traits.BODY += 1;
                            }
                            if (critter.stats.hunger > 192) {
                                critter.vices.GLUT += 1;
                                if (critter.vices.GLUT > 254) critter.vices.GLUT = 254;
                            }
                            critter.stats.hunger += 32;
                            if (critter.stats.hunger > 254) critter.stats.hunger = 254;
                        }
                        break;
                    case 'study':
                        if (critter.health.energy > 10) {
                            critter.health.energy -= 10;
                            if (!this.roll(critter.traits.MIND)) {
                                critter.traits.MIND += 1;
                            }
                            if (critter.stats.boredom > 192) {
                                critter.vices.PRIDE += 1;
                                if (critter.vices.PRIDE > 254) critter.vices.PRIDE = 254;
                            }
                            critter.stats.boredom += 32;
                            if (critter.stats.boredom > 254) critter.stats.boredom = 254;
                        }
                        break;
                    case 'play':
                        if (critter.health.energy > 10) {
                            critter.health.energy -= 10;
                            if (!this.roll(critter.traits.SOUL)) {
                                critter.traits.SOUL += 1;
                            }
                            if (critter.stats.happiness > 192) {
                                critter.vices.SLOTH += 1;
                                if (critter.vices.SLOTH > 254) critter.vices.SLOTH = 254;
                            }
                            critter.stats.happiness += 32;
                            if (critter.stats.happiness > 254) critter.stats.happiness = 254;
                        }
                        break;
                    default:
                        break;
                }
                critter.command = "";
                critter.loc.x += critter.loc.xs;
                critter.loc.y += critter.loc.ys;
                if (critter.loc.x + critter.loc.w > 640 || critter.loc.x < 0) {
                    critter.loc.xs = -critter.loc.xs;
                }
                if (critter.loc.y + critter.loc.h > 640 || critter.loc.y < 0) {
                    critter.loc.ys = -critter.loc.ys;
                }
                db.run('UPDATE critters SET alive = ?, life = ?, heartbeats = ?, energy = ?, GLUT = ?, PRIDE = ?, SLOTH = ?, hunger = ?, boredom = ?, happiness = ?, BODY = ?, MIND = ?, SOUL = ?, stage = ?, heartrate = ? WHERE owner = ?',
                    [critter.alive, critter.health.life, critter.health.heartbeats, critter.health.energy, critter.vices.GLUT, critter.vices.PRIDE, critter.vices.SLOTH, critter.stats.hunger, critter.stats.boredom, critter.stats.happiness, critter.traits.BODY, critter.traits.MIND, critter.traits.SOUL, critter.stage, critter.heartrate, critter.owner.username],
                    (err) => {
                        if (err) {
                            console.error(err.message);
                        }
                    });
            }
        }
    }

    roll(against) {
        return Math.round(Math.random() * 254) < against;
    }
}

module.exports = {
    Critter,
    Game
};