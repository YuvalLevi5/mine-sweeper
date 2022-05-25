function buildBoard() {
    const board = createMat(gLevel.size);

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = {
                minesAroundCount: 0,
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
    if (gLevel.size === +newSize) return
    
    if (newSize === 8) {
        gLevel.mines = 12
        gLevel.flags = 12
    }
    if (newSize === 12) {
        gLevel.mines = 30
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

// function revealCell(elCell, location) {
    // elCell.classList.remove('hidden')

    // if (cell.isMine) {
    //   elCell.innerHTML = BOMB;
    //   return;
    // }
  
    // elCell.innerText = location.minesAroundCount === 0 ? ' ' : location.minesAroundCount;
//   }