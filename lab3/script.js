function random(n){
    return Math.floor(Math.random() * n);
}

function drawCircle(ctx, x, y, radius, fillStyle){
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = fillStyle;
    ctx.fill();
    ctx.lineWidth = 0;
    ctx.stroke();
}

class Particle{
    x = 0;
    y = 0;
    vx = 1;
    vy = 1;
    hue = 0;
    alpha = 0;
    decay = 0.015;
    active = true;

    constructor(x,y,vx,vy,hue,alpha,decay){
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.hue = hue;
        this.alpha = alpha;
        this.decay = decay;
    }

    update(gravity,canvasHeight){
        this.x += this.vx;
        this.y += this.vy;
        this.vy += gravity;
        this.vx += -this.vx * 0.1; // Opór powietrza......??
        this.alpha -= this.decay;
        if(this.alpha <= 0)
            this.active = false;
        // Odbijanie od podłoża
        if(this.y >= canvasHeight){
            this.vy *= -0.6;
            this.y = canvasHeight
        }
    }

    draw(ctx){
        drawCircle(ctx,this.x,this.y,3,`hsla(${this.hue},100%,50%,${this.alpha})`);
    }
}

class Firework{
    x = 0;
    y = 0;
    vx = 0;
    vy = 0;
    targetX = 0;
    targetY = 0;
    speed = 8;
    decay = 0.025;
    exploded = false;
    active = true;
    particleCount = 1;
    canvasWidth = 0;
    canvasHeight = 0;

    constructor(x,y,targetX,targetY,speed,particleCount,decay,canvasWidth,canvasHeight){
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.speed = speed;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.particleCount = particleCount;
        this.decay = decay;
        this.vx = ((targetX - x) / canvasWidth) * speed;
        this.vy = ((targetY - y) / canvasHeight) * speed;
    }

    explode(){
        const hue = random(360);
        let particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            particles.push( new Particle(
                this.x, this.y, // x, y
                random(40)-20, random(40)-20, // vx i vy w zakresie -20 <-> 20
                hue - (random(40)-20), 1, this.decay  // hue +-20, alpha, decay
            ));
        }
        return particles;
    }

    update(){
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
        if(Math.abs(this.x - this.targetX) < 10 && Math.abs(this.y - this.targetY) < 10){
            this.active = false;
            this.exploded = true;
        }
        // Failsafe - jeżeli dotknie wertykalnej krawędzi to detonuj
        if(this.y >= this.canvasHeight || this.y <= 0){
            this.vx = 0;
            this.vy = 0;
            this.targetY = this.y;
        }
        // Failsafe - jeżeli dotknie bocznej krawędzi to detonuj
        if(this.x >= this.canvasWidth || this.x <= 0){     
            this.vx = 0;
            this.vy = 0;
            this.targetY = this.x;
        }
    }

    draw(ctx){
        ctx.globalCompositeOperation = "lighter";
        drawCircle(ctx,this.x,this.y, 5, `hsl(0, 0%, 100%)`);
    }
}

class FireworkShow{
    particles = [];
    rockets = [];
    gravity = 0.98;
    particleCount = 10;
    decay = 0.025;
    auto = false;
    canvas;
    ctx;

    constructor(canvas,gravity,decay,particleCount){
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.gravity = gravity;
        this.decay = decay;
        this.particleCount = particleCount;
        // Obsługa kliknięcia myszką
        this.canvas.addEventListener("click", (e) => {
            const rect = canvas.getBoundingClientRect();
            const cx = e.clientX - rect.left;
            const cy = e.clientY - rect.top;
            this.spawnFirework(cx,cy);
        });
    }

    spawnFirework(cx, cy){
        console.log("Firework spawned at " + cx + " " + cy);
        this.rockets.push( new Firework(
            cx, this.canvas.height, // x, y
            cx, cy, // target x, target y
            8, // speed
            this.particleCount, this.decay, // particle count, particle decay
            this.canvas.width, this.canvas.height // canvas width, canvas height
        ) );
    }

    update(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.rockets.forEach(rocket => {
            rocket.draw(this.ctx);
            rocket.update();
            if(rocket.exploded === true){
                this.particles = this.particles.concat(rocket.explode());
            }
        });
        this.particles.forEach(particle => {
            particle.draw(this.ctx);
            particle.update(this.gravity,this.canvas.height);
        });
        this.rockets = this.rockets.filter(r => r.active);
        this.particles = this.particles.filter(p => p.active);

        requestAnimationFrame(() => this.update());
    }

    // Oddzielna funkcja żeby uniknąć aktualizowania decay co update()
    updateDecay(decay){
        this.decay = decay;
        this.particles.forEach(particle => {
            particle.decay = decay;
        });
    }

    // Auto pokaz
    autoShow(){
        setInterval(() => {
            if(!this.auto) return; // Jeżeli auto odznaczone to zabij
            const x = random(this.canvas.width);
            const y = random(this.canvas.height);
            this.spawnFirework(x, y);
        }, 1000);
    }

}

const autoBtn = document.getElementById("auto");
const particleSlider = document.getElementById("particleCount");
const decaySlider = document.getElementById("decay");
const pCountValue = document.getElementById("pCount_value");
const decayValue = document.getElementById("decay_value");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const fireworkShow = new FireworkShow(canvas,0.98,0.025,10);

decaySlider.addEventListener("input", () => {
    fireworkShow.updateDecay(decaySlider.value) 
    decayValue.innerText = decaySlider.value;
});
particleSlider.addEventListener("input", () => {
    fireworkShow.particleCount = particleSlider.value;
    pCountValue.innerText = fireworkShow.particleCount;
});
autoBtn.addEventListener("change", () => {
    fireworkShow.auto = autoBtn.checked;
    console.log("Auto? " + fireworkShow.auto);
});

fireworkShow.autoShow(); // Wywołanie jeden raz na start
fireworkShow.update();