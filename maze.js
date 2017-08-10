(function() {
     
    //initialise variables 
    var canvas;
    var context;
    var width;
    var height;
    var interval_id;
    var cols, rows;
    var w = 20;
    var grid = [];
    var begin_solve =  false;
    var draw_speed = 33;
    var current;
    var stack = [];
    var maze_complete = false;
    var open_set = [];
    var closed_set = [];
    var start;
    var end;
    var path =[];

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
        start = grid[0];
        end = grid[grid.length-1];
        open_set.push(start);
        window.addEventListener('keydown', begin, false);//listen for start button 
        window.addEventListener('keydown', end, false);//listen for finish button
		clearInterval(interval_id);
        interval_id = window.setInterval(draw, draw_speed); 
    }
    
    function draw() {
        current.visited=true;
        var next = current.checkNeighboursDraw();//randomly select next neighbour
        if (next) { //if one exists
            next.visited=true;
            //check which direction neighbour is in
            if(next.i-current.i===1) {
                //neighbour is right
                current.walls[1]=false;
                next.walls[3]=false;
            } else if (next.i-current.i===-1) {
                //neighbour is left
                current.walls[3]=false;
                next.walls[1]=false;
            } else if (next.j-current.j===1) {
                //neighbor is down
                current.walls[2]=false;
                next.walls[0]=false;
            } else if (next.j-current.j===-1) {
                //neighbour is up
                current.walls[0]=false;
                next.walls[2]=false;
            }
            stack.push(current);
            current=next;
            //push current cell to stack and move to neighbour 
        } else {
            //if no non-visited neighbours
            if (stack.length>0) {
                current = stack.pop();
                //pop off last position and assign to current
            } else {
                //maze generation is completed
                maze_complete = true;
                draw_speed = 100;
            }
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
            context.beginPath();
            //draw walls of cell object
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
        context.fillRect(current.i*w, current.j*w, w, w);//current cell

        if (maze_complete && begin_solve) {
            //maze generated, hit spacebar to begin solve
            if (open_set.length > 0) {
                //open_set contains viable cell options to reach goal
                var winner = 0;
                //winner is cell in open_set which is closest to the goal
                //determined by f(n) = g(n) + h(n)
                for (var i=0; i<open_set.length; i++) {
                    if (open_set[i].f < open_set[winner.f]) {
                        winner = i; 
                    }
                }
                current = open_set[winner];
                if (current === end) {
                    console.log('Maze Complete!');
                    clearInterval(interval_id);
                }
                removeFromArray(open_set, current);
                closed_set.push(current);

                var solveNeighbours = current.checkNeighboursSolve();
                for (var i=0; i<solveNeighbours.length; i++) {
                    var neighbour = solveNeighbours[i];
                    if (!closed_set.includes(neighbour)) {
                        var temp_g = current.g + 1;
                        if (open_set.includes(neighbour)) {
                            if (temp_g < neighbour.g) {
                                neighbour.g = temp_g;
                            }
                        } else {
                            neighbour.g = temp_g;
                            open_set.push(neighbour);
                        }

                        neighbour.h = heuristic(neighbour, end);
                        neighbour.f = neighbour.g + neighbour.h;
                        neighbour.previous = current;
                    }
                }

            } else {
                console.log('No Solution');
            }

            path = [];
            var temp = current;
            path.push(temp);
            while (temp.previous) {
                path.push(temp.previous);
                temp = temp.previous;
            }

            for (var i=0; i < path.length; i++) {
                context.fillStyle ='white';
                context.fillRect(path[i].i*w, path[i].j*w, w, w);
            

                context.beginPath();
                if (path[i].walls[0]) {
                    context.moveTo(path[i].i*w, path[i].j*w);
                    context.lineTo(path[i].i*w+w, path[i].j*w);
                    context.stroke();
                }
                if (path[i].walls[1]) {
                    context.moveTo(path[i].i*w+w, path[i].j*w);
                    context.lineTo(path[i].i*w+w, path[i].j*w+w);
                    context.stroke();
                }
                if (path[i].walls[2]) {
                    context.moveTo(path[i].i*w+w, path[i].j*w+w);
                    context.lineTo(path[i].i*w, path[i].j*w+w);
                    context.stroke();
                }
                if (path[i].walls[3]) {
                    context.moveTo(path[i].i*w, path[i].j*w+w);
                    context.lineTo(path[i].i*w, path[i].j*w);
                    context.stroke();
                }
            }
            //clearInterval(interval_id);

        }
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
        this.checkNeighboursDraw = function() {
            var neighbours = [];
            var top = grid[index(i, j-1)];
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
        this.f = 0;
        this.g = 0;
        this.h = 0;
        this.previous = undefined;
        this.checkNeighboursSolve = function() {
            var neighbours = [];
            var top = grid[index(i, j-1)];
            var right = grid[index(i+1, j)];
            var bottom = grid[index(i, j+1)];
            var left = grid[index(i-1, j)];
            if (top && !top.walls[2]) {
                neighbours.push(top);
            }
            if (right && !right.walls[3]) {
                neighbours.push(right);
            }
            if (bottom && !bottom.walls[0]) {
                neighbours.push(bottom);
            }
            if (left && !left.walls[1]) {
                neighbours.push(left);
            }
            if (neighbours.length > 0){
                return neighbours
            }

        }
    }
    
    function index(i, j) {
        if (i < 0 || i > cols-1 || j < 0 || j > rows-1) {
            return -1;
        }
        return i + j * cols;
    } 

    function removeFromArray(arr, item) {
        for (var i = arr.length-1; i >= 0; i--) {
            if (arr[i]===item) {
                arr.splice(i, 1);
            }
        }
    }

    function heuristic(a, b) {
        var i = a.i - b.i;
        var j = a.j - b.j;
        var d = Math.sqrt(a*a + b*b);
        return d;
    }

    function begin(event) {
        //If spacebar is pressed, start = true
        var keyCode = event.keyCode;
        if (keyCode === 32) {
            begin_solve = true;
        }   
    }

    function end(event) {
        //If esc is pressed, start = false
        var keyCode = event.keyCode;
        if (keyCode === 27) {
            begin_solve = false;
        }   
    }

     
    
})();