class Clock {
    x = 0;
    y = 0;
    ctx = null;

    constructor(x,y,ctx) {
        this.x = x;
        this.y = y;
        this.ctx = ctx;
    }

    // Rysowanie tarczy zegara, w tym "czyszczenie" obrazu przy odświeżeniu
    draw() {
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 500, 500);
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 250, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.save();
        ctx.translate(this.x,this.y);
        for(let i = 0; i < 12; i++){
            ctx.rotate(Math.PI/6);
            ctx.beginPath(); ctx.moveTo(240,0);
            ctx.lineTo(200,0);
            ctx.stroke();
        }
        ctx.restore();
    }
}

class Hand {
    x = 0;
    y = 0;
    length = 0; // Długość wskazówki
    thick = 1; // Grubość wskazówki
    ctx = null;
    
    constructor(x,y,length,thick,ctx) {
        this.x = x;
        this.y = y;
        this.length = length;
        this.thick = thick;
        this.ctx = ctx;
    }

    // Rysowanie wskazówki
    draw(time) {
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = this.thick;
        ctx.translate(this.x,this.y);
        ctx.rotate(time * Math.PI/30);
        ctx.moveTo(0,0);
        ctx.lineTo(0,-this.length);
        ctx.stroke();
        ctx.restore();
    }
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const c = new Clock(250,250,ctx);
const sh = new Hand(250,250,180,1,ctx);
const mh = new Hand(250,250,160,2,ctx);
const hh = new Hand(250,250,120,4,ctx);
let stop = -1;

// Pętla animacji
function animate(){
    c.draw();
    let d = new Date();
    let hour = d.getHours() * 5;
    let minute = d.getMinutes();
    let second = d.getSeconds();
    let milis = d.getMilliseconds();
    sh.draw(second + (milis/1000));
    mh.draw(minute);
    hh.draw(hour);
    if(stop == -1)
        requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

// Funkcja obsługi spacji
window.addEventListener("keydown", (event) => {
    if (event.key == " "){
        stop = stop * -1;
        requestAnimationFrame(animate);
    }
});