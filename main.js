let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let levels = [300, 500, 700, 900, 1100]
let size = 20 //Math.floor(document.documentElement.clientWidth * document.documentElement.clientHeight / 100000)
let light = confirm('Turn off the lights?')
let width = Math.floor(document.documentElement.clientWidth / size) % 2 !== 0 ? Math.floor(document.documentElement.clientWidth / size) * size : Math.floor(document.documentElement.clientWidth / size - 1) * size
let height = Math.floor(document.documentElement.clientHeight / size) % 2 !== 0 ? Math.floor(document.documentElement.clientHeight / size) * size : Math.floor(document.documentElement.clientHeight / size - 1) * size

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
                    ctx.fillStyle = '#000';
                    ctx.fillRect(j * size, i * size, size, size);
                }
            }
        }
    }

    drawCells(color, ...cells){

        for(let i = 0; i < cells.length; i++){
            let cell = cells[i];
            if(typeof color == 'string'){
                ctx.fillStyle = color;
                ctx.fillRect(cell.cords.x * size, cell.cords.y * size, size, size)
            }else{
                ctx.drawImage(color, cell.cords.x * size, cell.cords.y * size, size, size)
            }
        }
    }

}

let maze = new Maze(rows, columns);
maze.calculate(maze.cells[0][0])
//for(let i = 0; i < 200; i++){
   // let wall = getRandomWall()
   // console.log(wall)
   // wall.visible = false
//}
maze.drawField()
maze.drawCells('lime', maze.path[0], maze.path[maze.path.length-1])

function getRandomWall(){
    let wall = maze.field[randomInt(1, maze.rows-2)][randomInt(1, maze.columns-2)]
    while(!wall.wall){
        wall = maze.field[randomInt(1, maze.rows-2)][randomInt(1, maze.columns-2)]
    }
    return wall
}

let currentCell = maze.field[1][1]

drawCircle(currentCell)
function drawCircle(currentCell){
    if(!light)return
    ctx.beginPath()
    ctx.fillStyle = "black"
    ctx.arc(currentCell.cords.x * size + size/2, currentCell.cords.y * size + size/2, width > height ? width : height, 0, 2 * Math.PI)
    ctx.lineWidth = (width > height ? width : height) * 1.5
    ctx.stroke()
}

function move(currentCell){
    ctx.clearRect(0, 0, width, height)
    maze.drawField()
    drawCircle(currentCell)
    maze.drawCells(man, currentCell)
    maze.drawCells('lime', maze.path[0], maze.path[maze.path.length-1])
    if(currentCell.cords.x == maze.columns - 2 && currentCell.cords.y == maze.rows - 2){
        // level++
        // width = height = levels[level]
        // rows = columns = levels[level] / size
        // maze = new Maze(rows, columns);
        // maze.calculate(maze.cells[0][0])
        // maze.drawField()
        // currentCell = maze.field[1][1]
        alert("You win!")
        document.location.reload()
    }
}

document.addEventListener("keydown", e => {
    maze.drawCells("lime", currentCell)
    ctx.drawImage(man, 50, 50)
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

let codes = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']
  
let man = new Image()
man.src = 'man.png'



// setInterval( () => {
//     let event = new KeyboardEvent('keydown', {
//         bubbles: true,
//         cancelable: true,
//         key: codes[Math.floor(Math.random() * codes.length)],
//         code: codes[Math.floor(Math.random() * codes.length)]
//     })

//     document.dispatchEvent(event)

// }, 10)


//maze.drawCells('red',...maze.path)

