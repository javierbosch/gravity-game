const velocity_scale = 0.03;

class Planet {
    constructor(x, y, r, dx, dy, ctx) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.mass = (4/3) * Math.PI * Math.pow(r,3); 
        this.dx = dx;
        this.dy = dy;
        this.forcesX = 0;
        this.forcesY = 0;
        this.ctx = ctx
        console.log("created"); //gives the default message
    }

    enlarge(){
        this.r += 1;
    }
    
    set_velocity(event){
        this.dx = Math.floor((this.x - event.clientX)*velocity_scale);
        this.dy = Math.floor((this.y - event.clientY)*velocity_scale);
    }

    collision(other){
        if (other==null || this==null){
            return false;
        }
        else{
            var distance = Math.sqrt ( Math.pow(this.x - other.x,2) + Math.pow(this.y - other.y,2));
            var total_r  = this.r + other.r;
            return distance<total_r;    
        }
    }


	collided_body(other,another){
        this.mass = other.mass + another.mass;
        this.x    = (other.x*other.mass + another.x*another.mass)/this.mass;
        this.y    = (other.y*other.mass + another.y*another.mass)/this.mass;
        this.radius = Math.floor(Math.pow(((3/4)*this.mass)/Math.PI,1/3));
        this.dx = 0;
        this.dy = 0;
    }

    draw(){
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        this.ctx.fillStyle = "#0095DD";
        this.ctx.fill();
        this.ctx.closePath();
    }

    move(){
        this.x += this.dx;
        this.y += this.dy;
    }

    step(){    
        this.draw();
        this.move();
    }

}

Array.prototype.pairs = function (func) {
    for (var i = 0; i < this.length - 1; i++) {
        for (var j = i; j < this.length - 1; j++) {
            func([this[i], this[j+1]]);
        }
    }
}


var c   = document.getElementById("canvas");
var ctx = c.getContext("2d");

function canvas_resize(){
    c.height = window.innerHeight;
    c.width =  window.innerWidth;
    console.log("resized")
}

canvas_resize();

var planets = [];

var test1 = new Planet(500,200,50,-3,3,ctx);
var test2 = new Planet(200,50,30,2,3,ctx);

planets.push(test1);
planets.push(test2);

  
function create_planet(event){
    var x = event.clientX;
    var y = event.clientY;
    planets.push(new Planet (x,y,30,0,0,ctx));
}

var mousedownID = -1;

function mouse_down(event) {
    if(mousedownID==-1){
        create_planet(event)
        mousedownID = setInterval(whilemousedown, 20);
    }
}

function mouse_up(event){
    if(mousedownID!=-1) {
        clearInterval(mousedownID);
        planets[planets.length-1].set_velocity(event);
        mousedownID=-1;
    }
}

function whilemousedown() {
    planets[planets.length-1].enlarge();
}

function collisions(){
    planets.pairs(function(pair){
        if (pair[0]==null){}
        else if(pair[0].collision(pair[1])){
            var temp = new Planet (0,0,0,0,0,ctx);
            temp.collided_body(pair[0], pair[1]);
            console.log(temp);
            planets.push(temp);
            delete planets[planets.indexOf(pair[0])];
            delete planets[planets.indexOf(pair[1])];
        }
    });
}

function stepper(){
    ctx.clearRect(0, 0, c.width, c.height);
    for (planet of planets){
        if (planet != null){
            console.log(planet);
            planet.step();
        }
    }
}

function main_loop() {
    setInterval(function(){ 
        collisions();
        stepper();
    }, 33);
}


main_loop();

