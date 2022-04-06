let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let levels = [300, 500, 700, 900, 1100]
let size = 20

let width = Math.floor(window.innerWidth / size) % 2 !== 0 ? Math.floor(window.innerWidth / size) * size : Math.floor(window.innerWidth / size - 1) * size
let height = Math.floor(window.innerHeight / size) % 2 !== 0 ? Math.floor(window.innerHeight / size) * size : Math.floor(window.innerHeight / size - 1) * size

//width = height = 900

let rows = height / size;
let columns = width / size;
let level = 0

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

class Maze{

    field = []
    stack = []
    path = []
    flag = false

    constructor(rows, columns){
        this.rows = rows;
        this.columns = columns;
        canvas.width = width
        canvas.height = height

        for(let i = 0; i < rows; i++){
            this.field[i] = [];
            for(let j = 0; j < columns; j++){
                this.field[i][j] = {
                    cords: {x: j, y: i},
                    wall: i % 2 == 0 || j % 2 == 0,
                    visited: false,
                }
                this.field[i][j].visible = this.field[i][j].wall
            }
        }

        this.cells = this.field
            .map(row => row.filter(cell => !cell.wall))
            .filter(row => row.length > 0)

        for(let i = 0; i < this.cells.length; i++){
            for(let j = 0; j < this.cells[i].length; j++){
                this.cells[i][j].cellCords = {x: j, y: i}
            }
        }

        this.stack.push(this.cells[0][0])
        this.path.push(this.cells[0][0])
        this.cells[0][0].visited = true
    }

    calculate(cell){
        let neighbors = this.getNotVisitedNeighbors(cell.cellCords.x, cell.cellCords.y)
        if(cell.cords == this.field[this.rows-2][this.columns-2].cords)this.flag = true
        if(neighbors.length > 0){
            let next = neighbors[randomInt(0, neighbors.length-1)]
            next.visited = true
            let side = this.checkSide(cell, next)
            this.field[cell.cords.y + side.y][cell.cords.x + side.x].visible = false
            this.stack.push(next)
            if(!this.flag)this.path.push(next)
            this.calculate(next)
        }else if(this.stack.length > 0){
            let last = this.stack.pop()
            this.calculate(last)
        }
    }

    checkSide(cell1, cell2){
        if(cell1.cellCords.x == cell2.cellCords.x){
            return cell1.cellCords.y < cell2.cellCords.y ? {x: 0, y: 1} : {x: 0, y: -1}
        }else{
            return cell1.cellCords.x < cell2.cellCords.x ? {x: 1, y: 0} : {x: -1, y: 0}
        }
    }

    getNotVisitedNeighbors(x, y){
        let neighbors = []

        if(y > 0 && !this.cells?.[y-1]?.[x]?.visited){
            neighbors.push(this.cells[y-1][x])
        }
        if(y < this.rows-1 && !this.cells?.[y+1]?.[x]?.visited){
            neighbors.push(this.cells?.[y+1]?.[x])
        }
        if(x > 0 && !this.cells?.[y]?.[x-1]?.visited){
            neighbors.push(this.cells?.[y]?.[x-1])
        }
        if(x < this.columns-1 && !this.cells[y][x+1]?.visited){
            neighbors.push(this.cells[y][x+1])
        }

        return neighbors.filter(neighbor => neighbor)
    }

    drawField(){
        let {rows, columns} = this;
        for(let i = 0; i < rows; i++){
            for(let j = 0; j < columns; j++){
                if(this.field[i][j].wall && this.field[i][j].visible){
                    ctx.fillStyle = "#000000";
                    ctx.fillRect(j * size, i * size, size, size);
                }
            }
        }
    }

    drawCells(color, ...cells){
        for(let i = 0; i < cells.length; i++){
            let cell = cells[i];
            ctx.fillStyle = color;
            ctx.fillRect(cell.cords.x * size, cell.cords.y * size, size, size);
        }
    }

}

let maze = new Maze(rows, columns);
maze.calculate(maze.cells[0][0])
maze.drawField()

let currentCell = maze.field[1][1]

function move(currentCell){
    ctx.clearRect(0, 0, width, height)
    maze.drawField()
    ctx.beginPath()
    ctx.fillStyle = "black"
    ctx.arc(currentCell.cords.x * size + size/2, currentCell.cords.y * size + size/2, width > height ? width : height, 0, 2 * Math.PI)
    ctx.lineWidth = (width > height ? width : height) * 1.5
    ctx.stroke()
    maze.drawCells('red', currentCell)
    if(currentCell.cords.x == maze.columns - 2 && currentCell.cords.y == maze.rows - 2){
        // level++
        // width = height = levels[level]
        // rows = columns = levels[level] / size
        // maze = new Maze(rows, columns);
        // maze.calculate(maze.cells[0][0])
        // maze.drawField()
        // currentCell = maze.field[1][1]
        alert("You win!")
    }
}

document.addEventListener("keydown", e => {
    maze.drawCells("lime", currentCell)

    if(e.code == "ArrowLeft" || e.code == 'KeyA'){
        currentCell = !maze.field?.[currentCell.cords.y]?.[currentCell.cords.x - 1]?.visible ? maze.field[currentCell.cords.y][currentCell.cords.x - 1] : currentCell
    }
    if(e.code == "ArrowRight" || e.code == 'KeyD'){
        currentCell = !maze.field?.[currentCell.cords.y]?.[currentCell.cords.x + 1]?.visible ? maze.field[currentCell.cords.y][currentCell.cords.x + 1] : currentCell
    }
    if(e.code == "ArrowUp" || e.code == 'KeyW'){
        currentCell = !maze.field?.[currentCell.cords.y - 1]?.[currentCell.cords.x]?.visible ? maze.field[currentCell.cords.y - 1][currentCell.cords.x] : currentCell
    }
    if(e.code == "ArrowDown" || e.code == 'KeyS'){
        currentCell = !maze.field?.[currentCell.cords.y + 1]?.[currentCell.cords.x]?.visible ? maze.field[currentCell.cords.y + 1][currentCell.cords.x] : currentCell
    }

    move(currentCell)
})

container.addEventListener('swipe', function (e) {
    console.log(e.detail);
    if(e.detail.directions.left){
        currentCell = !maze.field?.[currentCell.cords.y]?.[currentCell.cords.x - 1]?.visible ? maze.field[currentCell.cords.y][currentCell.cords.x - 1] : currentCell
    }
    if(e.detail.directions.right){
        currentCell = !maze.field?.[currentCell.cords.y]?.[currentCell.cords.x + 1]?.visible ? maze.field[currentCell.cords.y][currentCell.cords.x + 1] : currentCell
    }
    if(e.detail.directions.top){
        currentCell = !maze.field?.[currentCell.cords.y - 1]?.[currentCell.cords.x]?.visible ? maze.field[currentCell.cords.y - 1][currentCell.cords.x] : currentCell
    }
    if(e.detail.directions.bottom){
        currentCell = !maze.field?.[currentCell.cords.y + 1]?.[currentCell.cords.x]?.visible ? maze.field[currentCell.cords.y + 1][currentCell.cords.x] : currentCell
    }

    move(currentCell)
});


//maze.drawCells('red',...maze.path)

