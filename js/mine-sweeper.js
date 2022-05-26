'use strict'
const ET = ''
const BOMB = '💣'
const FLAG = '🚩'
const LIFE = '❤️'
const HINT = '💡'


var markedCells
var openCells
var lifeCounter
var flagsCounter
var gHelp = 0
var gTimerInterval
var gBoard
var gHintCounter
var gLevel = {
    size: 4,
    mines: 2,
    flags: 2,
}
var gGame = {
    isOn: false,

}

// on load function
function init() {
    lifeCounter = 3
    flagsCounter = 2
    markedCells = 2
    openCells = 0
    gHintCounter = 3
    renderLives()
    renderHints()
    
    gBoard = buildBoard()
    renderBoard(gBoard)
    
    // safeCell(gBoard)
    // safeClick()
}

// reset the game
function resetGame() {
    gHintCounter = 3
    gHelp = 0
    lifeCounter = 3
    openCells = 0
    flagsCounter = gLevel.flags
    markedCells = gLevel.flags
    gGame.isOn = false

    var elFlags = document.querySelector('.flags')
    elFlags.innerText = markedCells

    var elScore = document.querySelector('.score')
    elScore.innerText = openCells

    renderHints()
    renderLives()
    clearInterval(gTimerInterval)

    var elSpan = document.querySelector('.timer')
    elSpan.innerText = '0.000'

    var elButton = document.querySelector('.game')
    elButton.innerText = '🙂'

    gBoard = buildBoard()
    renderBoard(gBoard)
}

// take the board from the model and put it in the dom
function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < board[0].length; j++) {
            var classList = board[i][j].isShown ? '' : 'hidden';
            var content = board[i][j].isMine ? 'BOMB' : board[i][j].minesAroundCount;

            strHTML +=
                `\t<td id="cell-${i}-${j}"
            class="cell ${classList}"
            onclick="cellClicked(this , ${i}, ${j}, ${content})"
            oncontextmenu="cellMarked(event, this)"></td>\n`;
        }
        strHTML += '</tr>\n';
    }

    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

// do and check on clicked cell
function cellClicked(elCell, i, j, content) {
    if (gHelp === 0) {
        if (!gGame.isOn) {
            gGame.isOn = true;
            startTimer()
        }

        if (gBoard[i][j].isMarked) return

        if (gBoard[i][j].isShown) return



        gBoard[i][j].isShown = true
        elCell.classList.remove('hidden')

        if (gBoard[i][j].minesAroundCount === 0) {
            openCells++
            elCell.innerText = ' '
            expendCell(gBoard, i, j)
        } else {
            elCell.innerText = content
            openCells++
        }


        if (elCell.innerText === BOMB) {
            openCells--
            lifeCounter--
            renderLives()

            gBoard[i][j].isMarked = true
            markedCells--
            flagsCounter--
            var elFlags = document.querySelector('.flags')
            elFlags.innerText = markedCells

            if (chekGameLost(elCell)) {
                return gHelp = 1
            }
        }

        var elScore = document.querySelector('.score')
        elScore.innerText = openCells

        safeCell()

        console.log('openCells++: ', openCells)
        if (checkGameOver()) {
            gGame.isOn = false
            clearInterval(gTimerInterval)
            gHelp = 1
        }
    }

}

// mark the cell with flag
function cellMarked(ev, elCell) {
    if (gHelp === 0) {
        if (!gGame.isOn) {
            gGame.isOn = true;
            startTimer()
        }
        ev.preventDefault()


        var pos = getCellPlace(elCell.id)
        var currCell = gBoard[pos.i][pos.j]

        if (currCell.isShown) return

        var elFlags = document.querySelector('.flags')


        if (currCell.isMarked) {
            currCell.isMarked = false
            elCell.innerText = ''
            flagsCounter++
            markedCells++
        } else {
            if (flagsCounter === 0) return
            else {
                currCell.isMarked = true;
                elCell.innerHTML = FLAG;
                flagsCounter--
                markedCells--
            }
        }
        elFlags.innerText = markedCells

        if (checkGameOver()) {
            gGame.isOn = false
            clearInterval(gTimerInterval)
            gHelp = 1
        }
    }


}

//chek if the player finished the game and won! 
function checkGameOver() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var curCell = gBoard[i][j];
            if (
                (!curCell.isMarked && curCell.isMine) ||
                (!curCell.isShown && !curCell.isMine)
            )
                return false;

        }
    }
    var elButton = document.querySelector('.game')
    elButton.innerText = '🥳'
    return true;
}

// chek if the game if the player clicked on a Bomb and reveal all the cells if the player lost
function chekGameLost(elCell) {
    if (lifeCounter === 0) {

        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[0].length; j++) {
                if (gBoard[i][j].isShown) continue;

                // Model
                gBoard[i][j].isShown = true;

                // DOM
                var cellId = '#' + getById({ i, j });
                var elCell = document.querySelector(cellId);

                revealCell(elCell, gBoard[i][j]);
            }

        }
        var elButton = document.querySelector('.game')
        elButton.innerText = '🥺'
        gGame.isOn = false
        clearInterval(gTimerInterval)
        gHelp = 1
    } else {
        return false
    }
}


// get a cell that's innerText = ' ' and reveal the non mines negs cell's around it
function expendCell(board, rowIdx, coldIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = coldIdx - 1; j <= coldIdx + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            if (!board[i][j].isShown) openCells++

            var cell = '#' + getById({ i, j })
            var elCell = document.querySelector(cell)

            gBoard[i][j].isShown = true

            revealCell(elCell, gBoard[i][j])
        }

    }

}

// get a mar+trix from the creatMat function, out information in evert cell, put random mines (random mines function)
// and update  the mines around each cell with set mine negs count function
function buildBoard() {
    const board = createMat(gLevel.size);

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = {
                minesAroundCount: '',
                isShown: false,
                isMine: false,
                isMarked: false,
            };
            board[i][j] = cell
        }
    }
    randomMines(board)
    setMinesNegsCount(board)
    return board;
}

// start second and miliseconds timer
function startTimer() {

    var startTime = Date.now()

    gTimerInterval = setInterval(() => {
        var seconds = ((Date.now() - startTime) / 1000).toFixed(3)
        var elSpan = document.querySelector('.timer')
        elSpan.innerText = seconds

    }, 59)
}

// put mines in the random places by the asked size (gLevel.mines)
function randomMines(board) {

    for (var i = 0; i < gLevel.mines; i++) {
        var randCell = board[rand(0, board.length)][rand(0, board.length)]
        randCell.isMine = true
    }
}

// gives a random number
function rand(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min) + min)
}


// chek if the cell is mine and if the cell isn't then the func update the cell mines negs
function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (board[i][j].isMine) continue

            var negs = getMinesAroundCounts(board, i, j)
            board[i][j].minesAroundCount = negs
        }
    }

}

// count the mines negs and return
function getMinesAroundCounts(board, rowIdx, colIdx) {
    var negsCount = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            if (i === rowIdx && j === colIdx) continue

            var currCell = board[i][j]
            if (currCell.isMine) negsCount++
        }
    }
    return negsCount
}

// creat matrix 
function createMat(size) {
    var mat = []
    for (var i = 0; i < size; i++) {
        mat[i] = []
        for (var j = 0; j < size; j++) {
            mat[i][j] = ''
        }
    }
    return mat
}

// change the board size, flags and mines
function changeBoard(elInput) {
    // console.log('elInput.value: ', elInput.value)
    var newSize = elInput.value ** 0.5
    if (newSize === 4) {
        gLevel.mines = 2
        gLevel.flags = 2
    } else if (newSize === 8) {
        gLevel.mines = 12
        gLevel.flags = 12
    } else if (newSize === 12) {
        gLevel.mines = 30
        gLevel.flags = 30
    }
    gLevel.size = newSize

    resetGame()
}

// get cell Id (cell-i-j) and return its cord in the model {i , j}
function getCellPlace(cellId) {
    var cell = cellId.split('-')
    var coord = {
        i: +cell[1],
        j: +cell[2],
    }
    return coord
}

// get {i , j} and return as class cell-i-j
function getById(location) {
    var cellId = 'cell-' + location.i + '-' + location.j;
    return cellId;
}



// get a domCell and modelCell => change innerText
function revealCell(elCell, location) {
    elCell.classList.remove('hidden')

    if (location.isMine) {
        elCell.innerText = BOMB;
        return;
    }

    elCell.innerText = location.minesAroundCount === 0 ? ' ' : location.minesAroundCount;
}


function unRevealCell(location) {
    var cellId = '#' + getById(location)
    var elCell = document.querySelector(cellId)
    console.log('elCell: ' , elCell)


    elCell.classList.add('hidden');
    elCell.innerText = ''
}



function renderLives() {
    var elLives = document.querySelector('.lives');
    var strHTML = '';
    for (var i = 0; i < lifeCounter; i++) {
        strHTML += LIFE;
        // console.log('strHTML: ', strHTML)
    }

    elLives.innerText = strHTML;
}




function renderHints () {
    var elHints = document.querySelector('.hints')
    var strHTML = ''
    for(var i = 0; i < gHintCounter; i++) {
        strHTML += HINT
    }
    console.log('strHTML: ' , strHTML)
    elHints.innerText = strHTML
}



function safeClick() {
    gHintCounter--
    renderHints()

    var cellCoord = safeCell()
    var currCell = '#' + getById(cellCoord)

    var gCell = gBoard[cellCoord.i][cellCoord.j]
    var elCell = document.querySelector(currCell)


    revealCell(elCell, gCell)

    setTimeout(() => {
        unRevealCell(cellCoord)
    }, 500);




}


function safeCell() {
    var safeCells = [];
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            //   console.log('board[i][j]: ' , board[i][j])
            if (!gBoard[i][j].isMine) safeCells.push({ i, j });
        }
    }
    //   console.log('safeCells: ' , safeCells)
    return safeCells[rand(0, safeCells.length)];
}