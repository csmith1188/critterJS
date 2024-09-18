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
    command(command) {
        socket.emit('userCommand', { command: command });
    }

    output(text) {
        var output = document.getElementById("output");
        let holdText = output.innerHTML;
        output.innerHTML = text + "<br>";
        output.innerHTML += holdText;
    }

    resetCritter() {
        socket.emit('resetCritter', { hostUser: game.hostUser });
    }
}

var ui = new UI();