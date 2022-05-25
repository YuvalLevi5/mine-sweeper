'use strict'
const ET = ''
const BOMB = '💣'
const FLAG = '🚩'

var flagsCounter
var gHelp = 0
var gTimerInterval
var gBoard
var gLevel = {
    size: 4,
    mines: 2,
    flags: 2,
}
var gGame = {
    isOn: false,
    showCount: 0,
    markedCount: 0,
}

function init() {
    flagsCounter = 2
    gBoard = buildBoard()
    renderBoard(gBoard)
}

function resetGame() {
    gHelp = 0
    flagsCounter = gLevel.flags
    console.log('flagsCounter: ', flagsCounter)
    gGame.isOn = false
    clearInterval(gTimerInterval)
    var elSpan = document.querySelector('.timer')
    elSpan.innerText = '0.000'
    var elButton = document.querySelector('.game')
    elButton.innerText = '🙂'
    gBoard = buildBoard()
    renderBoard(gBoard)
}

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
    // console.log(strHTML);

    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

function cellClicked(elCell, i, j, content) {
    console.log('gLevel: ', gLevel)
    if (gHelp === 0) {
        if (!gGame.isOn) {
            gGame.isOn = true;
            startTimer()
        }

        if (gBoard[i][j].isMarked) return

        if (gBoard[i][j].isShown) return


        gBoard[i][j].isShown = true
        if (gBoard[i][j].minesAroundCount === 0) {
            elCell.innerText = ' '
            expendCell(gBoard , i, j)
        } else elCell.innerText = content



        elCell.classList.remove('hidden')
        chekGameLost(elCell)



        if (checkGameOver()) {
            gGame.isOn = false
            clearInterval(gTimerInterval)
            gHelp = 1
        }
    }

}

function cellMarked(ev, elCell) {
    if (!gGame.isOn) {
        gGame.isOn = true;
        startTimer()
    }
    ev.preventDefault()


    // console.log('elCell.id: ' , elCell.id)
    var pos = getCellPlace(elCell.id)
    var currCell = gBoard[pos.i][pos.j]
    // console.log('currCell: ' , currCell)

    if (currCell.isShown) return



    if (currCell.isMarked) {
        currCell.isMarked = false
        elCell.innerText = ''
        flagsCounter++
    } else {
        if (flagsCounter === 0) return
        else {
            currCell.isMarked = true;
            elCell.innerHTML = FLAG;
            flagsCounter--
            console.log('gLevel.flags: ', gLevel.flags)
        }
    }

}

function checkGameOver() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var curCell = gBoard[i][j];
            if (
                (!curCell.isMarked && curCell.isMine) ||
                (!curCell.isShown && !curCell.isMine)
            ) {
                return false;
            }
        }
    }
    var elButton = document.querySelector('.game')
    elButton.innerText = '🥳'
    return true;
}

function chekGameLost(elCell) {
    if (elCell.innerText === BOMB) {

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



function expendCell(board, rowIdx, coldIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = coldIdx - 1; j <= coldIdx + 1; j++) {
            if (j < 0 || j >= board[i].length) continue

            var cell = '#' + getById({ i, j })
            var elCell = document.querySelector(cell)

            gBoard[i][j].isShown = true

            revealCell(elCell, gBoard[i][j])
        }

    }

}

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

function startTimer() {

    var startTime = Date.now()

    gTimerInterval = setInterval(() => {
        var seconds = ((Date.now() - startTime) / 1000).toFixed(3)
        var elSpan = document.querySelector('.timer')
        elSpan.innerText = seconds

    }, 59)
}


function randomMines(board) {

    for (var i = 0; i < gLevel.mines; i++) {
        var randCell = board[rand(0, board.length)][rand(0, board.length)]
        randCell.isMine = true
    }
}

function rand(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min) + min)
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (board[i][j].isMine) continue

            var negs = getMinesAroundCounts(board, i, j)
            board[i][j].minesAroundCount = negs
        }
    }

}

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

function getCellPlace(cellId) {
    var cell = cellId.split('-')
    var coord = {
        i: +cell[1],
        j: +cell[2],
    }
    return coord
}

function getById(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j;
    return cellClass;
}

function revealCell(elCell, location) {
    elCell.classList.remove('hidden')

    if (location.isMine) {
        elCell.innerHTML = BOMB;
        return;
    }

    elCell.innerText = location.minesAroundCount === 0 ? ' ' : location.minesAroundCount;
}