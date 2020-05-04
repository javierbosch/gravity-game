class Planet {
    constructor(positionX, positionY, radius, velocityX, velocityY, canvas) {
        this.positionX = positionX;
        this.positionY = positionY;
        this.radius = radius;
        this.mass = (4/3) * Math.PI * Math.pow(radius,3); 
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.forcesX = 0;
        this.forcesY = 0;
        this.ctx = canvas.getContext("2d");
        console.log("created"); //gives the default message
    }

    draw(){
        this.ctx.beginPath();
        this.ctx.arc(this.positionX, this.positionY, this.radius, 0, 2 * Math.PI);
        this.ctx.stroke();
    }

    move(){
        this.positionX += this.velocityX;
        this.positionY += this.velocityY;
    }

}

function wait(ms){
    var d = new Date();
    var d2 = null;
    do { 
        d2 = new Date(); 
    }
    while(d2-d < ms);
}

var c = document.getElementById("myCanvas");

var planets = [];

planets.push(new Planet(500,200,50,-3,3,c));

while (true){

    for (planet of planets){
        planet.draw();
        planet.move();
    }
}
