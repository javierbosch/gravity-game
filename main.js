const velocity_scale = 0.03;
const G              = 0.005;
const restart_key    = 82;
const control_key    = 17;
const generation_key = 71;
const multiple_generation_key = 65;


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
        else if (axis=="y"){
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
        
        this.forcesX=0;
        this.forcesY=0;
        if(other.fixed){
            this.fixed=true;
            this.color = "#FA431D";
        }
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

function create_random_planet(){
    console.log("juian")
    x = Math.floor(Math.random() * c.width);
    y = Math.floor(Math.random() * c.height);
    size = Math.floor((Math.random()* 7) + 3);
    planets.push(new Planet (x,y,size,0,0,false,ctx));
}

function generate_planets(amount){
    for(i=0;i<amount;i++){
        create_random_planet();
    }
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
    if (event.keyCode==generation_key){
        create_random_planet();
    }
    if (event.keyCode==multiple_generation_key){
        generate_planets(400);
    }
}

function key_down(event){
    if (event.keyCode==control_key){
        control_hover = true;
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

function calculate_forces(){
    for(i=0; i<planets.length;i++){
        if(planets[i]!=null){
            for(j=0; j<planets.length;j++){
                if((planets[j]!=null)&&(planets[i]!==planets[j])){
                    var dx = planets[j].x - planets[i].x;
                    var dy = planets[j].y - planets[i].y;
                    var r_squared = dx*dx + dy*dy;
                    var r = Math.sqrt(r_squared);
                    var force_magnitude = (G * planets[i].mass * planets[j].mass) / r_squared;
                    var dx_normalized_scaled = (dx / r) * force_magnitude;
                    var dy_normalized_scaled = (dy / r) * force_magnitude;
                    planets[i].forcesX += dx_normalized_scaled;
                    planets[i].forcesY += dy_normalized_scaled;    

                    if(planets[i].collision(planets[j])){
                        console.log(planets[i]);
                        console.log(planets[j]);
                        planets[i].collided_body(planets[j]);
                        planets = planets.slice(0, j).concat(planets.slice(j + 1, planets.length));
                        console.log(planets[i]);
                    }
                
           
                }
            }
        }
    }
}
    


function main_loop() {
    setInterval(function(){ 
        calculate_forces();
        stepper();
    }, 33);
}


main_loop();
