const velocity_scale = 0.03;
const G              = 0.005;
const restart_key    = 82;
const control_key    = 17;

class Planet {
    constructor(x, y, r, dx, dy, fixed, ctx) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.fixed = fixed;
        if (this.fixed){
            this.color = "#FA431D";
        }else{
            this.color = "#1BB5F8";
        }
        this.mass = (4/3) * Math.PI * Math.pow(r,3); 
        this.dx = dx;
        this.dy = dy;
        this.forcesX = 0;
        this.forcesY = 0;
        this.ctx = ctx
    }

    kinetic_energy(axis){
        var result = 0;
        if (axis=="x"){
            result = this.mass * Math.pow(this.dx,2)/2;
            if (this.dx<0){
                result = -result;
            }
        }
        if (axis=="y"){
            result = this.mass * Math.pow(this.dy,2)/2;
            if (this.dy<0){
                result = -result;
            }
        }
        return result;
    }

    enlarge(){
        this.r += 1;
        this.mass = (4/3) * Math.PI * Math.pow(this.r,3); 
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


	collided_body(other){
        var total_mass = this.mass + other.mass;
        this.x         = Math.floor(((other.x*other.mass) + (this.x*this.mass))/total_mass);
        this.y         = Math.floor(((other.y*other.mass) + (this.y*this.mass))/total_mass);
        this.r         = Math.floor(Math.cbrt(((3/4)*total_mass)/Math.PI)) ;

        var k_energy_x = (this.kinetic_energy("x") + other.kinetic_energy("x"));
        var k_energy_y = (this.kinetic_energy("y") + other.kinetic_energy("y"));

        this.dx        = Math.floor(Math.sqrt( 2 * Math.abs(k_energy_x) / total_mass));
        this.dy        = Math.floor(Math.sqrt( 2 * Math.abs(k_energy_y) / total_mass));

        if (k_energy_x<0){
            this.dx = - this.dx;
        }
        if (k_energy_y<0){
            this.dy = - this.dy;
        }
        this.mass      = total_mass;
    }

    draw(){
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        this.ctx.closePath();
    }

    move(){
        if (this.fixed==false){
            this.x += this.dx;
            this.y += this.dy;
            var ax = this.forcesX/this.mass;
            var ay = this.forcesY/this.mass;
            this.dx += ax;
            this.dy += ay;
            this.forcesX = 0;
            this.forcesY = 0;    
        }
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

var control_hover = false;

function canvas_resize(){
    c.height = window.innerHeight;
    c.width =  window.innerWidth;
    console.log("resized")
}

canvas_resize();

var planets = [];

function create_planet(event){
    var x = event.clientX;
    var y = event.clientY;
    planets.push(new Planet (x,y,10,0,0,control_hover,ctx));
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
    if (planets[planets.length-1] == null){
        clearInterval(mousedownID);
        mousedownID=-1;
    }
    else{
        planets[planets.length-1].enlarge();
    }
}

function key_up(event){
    if(event.keyCode==restart_key){
        planets=[];
    }
    if (event.keyCode==control_key){
        control_hover = false;
    }
}

function key_down(event){
    if (event.keyCode==control_key){
        control_hover = true;
    }
}

function collisions(){
    planets.pairs(function(pair){
        add_forces(planets[planets.indexOf(pair[0])],planets[planets.indexOf(pair[1])]);
        if (pair[0]==null){}
        else if(pair[0].collision(pair[1])){
            planets[planets.indexOf(pair[0])].collided_body(pair[1]);
            delete planets[planets.indexOf(pair[1])];
        }
    });
}

function add_forces(body1,body2){
    if((body1!=null)&&(body2!=null)){
        var dx = body2.x - body1.x;
        var dy = body2.y - body1.y;
        var r_squared = dx*dx + dy*dy;
        var r = Math.sqrt(r_squared);
        var force_magnitude = (G * body1.mass * body2.mass) / r_squared;
        var dx_normalized_scaled = (dx / r) * force_magnitude;
        var dy_normalized_scaled = (dy / r) * force_magnitude;
        body1.forcesX += dx_normalized_scaled;
        body1.forcesY += dy_normalized_scaled;
        body2.forcesX -= dx_normalized_scaled;
        body2.forcesY -= dy_normalized_scaled;    
    }
}

function stepper(){
    ctx.clearRect(0, 0, c.width, c.height);
    for (planet of planets){
        if (planet != null){
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
