(function() {
     
    //initialise variables 
    var canvas;
    var context;
    var width;
    var height;
    var interval_id;
    var cols, rows;
    var w = 10;
    var grid = [];
    var start =  false;
    var draw_speed = 33;
    var current;
    var stack = [];

    document.addEventListener('DOMContentLoaded', init, false);
    //wait until DOM content is loaded before calling init

    function init() {    
        //define variables
        canvas = document.querySelector('canvas');
        context = canvas.getContext('2d');
        width = canvas.width;
        height = canvas.height;
        setup();
        current = grid[0];
        window.addEventListener('keydown', begin, false);//listen for start button 
        window.addEventListener('keydown', end, false);//listen for finish button
		clearInterval(interval_id);
        interval_id = window.setInterval(draw, 33); 
    }
    
    function draw() {
        //for canvas animation
        current.visited=true;
        var next = current.checkNeighbours();
        if (next) {
            next.visited=true;
            if(next.i-current.i===1) {
                current.walls[1]=false;
                next.walls[3]=false;
            } else if (next.i-current.i===-1) {
                current.walls[3]=false;
                next.walls[1]=false;
            } else if (next.j-current.j===1) {
                current.walls[2]=false;
                next.walls[0]=false;
            } else if (next.j-current.j===-1) {
                current.walls[0]=false;
                next.walls[2]=false;
            }
            stack.push(current);
            current=next;
        } else {
            current = stack.pop();
        }
        context.clearRect(0, 0, width, height);//clear grid
        context.strokeStyle = 'black';
        for (var i = 0; i<grid.length; i++) {
            if (grid[i].visited) {
                context.fillStyle='green';
            } else {
                context.fillStyle='black'
            }
            context.fillRect(grid[i].i*w, grid[i].j*w, w, w);
            //context.lineWidth = 1;
            context.beginPath();
            if (grid[i].walls[0]) {
                context.moveTo(grid[i].i*w, grid[i].j*w);
                context.lineTo(grid[i].i*w+w, grid[i].j*w);
                context.stroke();
            }
            if (grid[i].walls[1]) {
                context.moveTo(grid[i].i*w+w, grid[i].j*w);
                context.lineTo(grid[i].i*w+w, grid[i].j*w+w);
                context.stroke();
            }
            if (grid[i].walls[2]) {
                context.moveTo(grid[i].i*w+w, grid[i].j*w+w);
                context.lineTo(grid[i].i*w, grid[i].j*w+w);
                context.stroke();
            }
            if (grid[i].walls[3]) {
                context.moveTo(grid[i].i*w, grid[i].j*w+w);
                context.lineTo(grid[i].i*w, grid[i].j*w);
                context.stroke();
            }
            
        }
        context.fillStyle='white';
        context.fillRect(current.i*w, current.j*w, w, w);
    }

    function setup() {
        cols = Math.floor(width/w);
        rows = Math.floor(height/w);
        for (var j=0; j<rows; j++) {
            for (var i=0; i<cols; i++) {
                var cell = new Cell(i, j);
                grid.push(cell);
            }
        }
    }


    function Cell(i, j) {
        this.i = i;
        this.j = j;
        this.walls = [true, true, true, true];
        this.visited = false;
        this.checkNeighbours = function() {
            var neighbours = [];
            var top = grid[index(i, j-1)];
            console.log(top);
            var right = grid[index(i+1, j)];
            var bottom = grid[index(i, j+1)];
            var left = grid[index(i-1, j)];
            if (top && !top.visited) {
                neighbours.push(top);
            }
            if (right && !right.visited) {
                neighbours.push(right);
            }
            if (bottom && !bottom.visited) {
                neighbours.push(bottom);
            }
            if (left && !left.visited) {
                neighbours.push(left);
            }
            if (neighbours.length > 0){
                return neighbours[Math.floor(Math.random()*neighbours.length)]
            } else {
                return undefined;
            }

        }
    }
    
    function index(i, j) {
        if (i < 0 || i > cols-1 || j < 0 || j > rows-1) {
            return -1;
        }
        return i + j * cols;
    } 



    function begin(event) {
        //If spacebar is pressed, start = true
        var keyCode = event.keyCode;
        if (keyCode === 32) {
            start = true;
        }   
    }

    function end(event) {
        //If esc is pressed, start = false
        var keyCode = event.keyCode;
        if (keyCode === 27) {
            start = false;
        }   
    }

     
    
})();