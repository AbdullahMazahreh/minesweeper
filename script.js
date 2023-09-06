const getContainer = document.querySelector(".container");
const getFlagsCounter = document.querySelector(".flags-counter");
const getBeginnerLevel = document.querySelector(".game-level-beginner");
const getIntermediateLevel = document.querySelector(".game-level-intermediate");
const getExpertLevel = document.querySelector(".game-level-expert");
const getFaceContainer = document.querySelector(".game-face");
const getTimeCounter = document.querySelector(".time-counter");

class MineSweeper {
  constructor(difficulty, rows, columns, mines) {
    this.difficulty = difficulty;
    this.rows = rows;
    this.columns = columns;
    this.mines = mines;
    this.flags = mines;
    this.minesContainer = new Set();
    this.checkedCells = new Set();
    this.createdCells = [];
    this.gameState = "Playing";
    this.cellsWithFlags = new Set();
    this.time = 0;
    this.startedTimer = null;
  }

  buildBoard = () => {
    this.resetTimer();
    this.handleTimer();
    this.startNewGame();

    const createTable = document.createElement("table");

    createTable.classList.add("game-container");

    for (let i = 0; i < this.rows; i++) {
      const createRow = document.createElement("tr");

      createRow.classList.add("game-row");

      for (let j = 0; j < this.columns; j++) {
        const createColumn = document.createElement("td");

        createColumn.classList.add(
          `game-cell_${i}_${j}`,
          "game-cell",
          "closed-cell"
        );

        createColumn.addEventListener("click", (e) => {
          const clickedOnCell = e.target;
          this.revealClickedCell(clickedOnCell);
        });
        createColumn.addEventListener("contextmenu", (e) => {
          const clickedOnCell = e.target;
          e.preventDefault();
          this.handleFlags(clickedOnCell);
        });

        createRow.append(createColumn);
      }
      this.createdCells.push(createRow);

      createTable.append(createRow);
    }
    getContainer.append(createTable);

    this.updateFlagsNumber();

    this.addMines(this.createdCells);
  };

  addMines = () => {
    for (let i = 0; i < this.mines; i++) {
      let newMineRow = Math.floor(Math.random() * this.rows);
      let newMineColumn = Math.floor(Math.random() * this.columns);

      while (
        this.minesContainer.has(
          this.createdCells[newMineRow].children[newMineColumn]
        )
      ) {
        newMineRow = Math.floor(Math.random() * this.rows);
        newMineColumn = Math.floor(Math.random() * this.columns);
      }
      this.minesContainer.add(
        this.createdCells[newMineRow].children[newMineColumn]
      );
    }
  };

  revealClickedCell = (clickedOnCell) => {
    if (
      this.gameState === "Lost" ||
      this.gameState === "Win" ||
      clickedOnCell === null ||
      this.cellsWithFlags.has(clickedOnCell)
    ) {
      return;
    }

    clickedOnCell.classList.add("game-cell-on-click");

    if (this.minesContainer.has(clickedOnCell)) {
      this.gameState = "Lost";
      this.handleGameLost(clickedOnCell);
      return;
    }

    const minesCount = this.findNumberOfMinesAroundCell(clickedOnCell);

    this.handleGameWin();

    if (!this.checkedCells.has(clickedOnCell)) {
      this.checkedCells.add(clickedOnCell);
    }

    const colors = {
      1: "blue",
      2: "green",
      3: "red",
      4: "darkblue",
      5: "brown",
      6: "cyan",
      7: "black",
      8: "grey",
    };

    if (minesCount > 0) {
      clickedOnCell.textContent = minesCount;
      clickedOnCell.style.color = colors[minesCount];
    } else {
      clickedOnCell.textContent = minesCount;
      clickedOnCell.style.fontSize = "0px";
    }

    if (minesCount > 0 || clickedOnCell.textContent !== "0") {
      return;
    }

    const neighbors = [
      [1, 0],
      [-1, 0],
      [-1, -1],
      [0, -1],
      [0, 1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ];

    const cellLocation = clickedOnCell.classList[0].split("_");
    const clickedCellRow = parseInt(cellLocation[1]);
    const clickedCellColumn = parseInt(cellLocation[2]);

    neighbors.forEach((neighbor) => {
      const newCellToCheck = document.querySelector(
        `.game-cell_${clickedCellRow + neighbor[0]}_${
          clickedCellColumn + neighbor[1]
        }`
      );
      if (!this.checkedCells.has(newCellToCheck)) {
        this.checkedCells.add(newCellToCheck);
        this.revealClickedCell(newCellToCheck);
      }
    });
  };

  findNumberOfMinesAroundCell = (clickedOnCell) => {
    const cellLocation = clickedOnCell.classList[0].split("_");
    const clickedCellRow = parseInt(cellLocation[1]);
    const clickedCellColumn = parseInt(cellLocation[2]);

    let minesCount = 0;
    for (let i = clickedCellRow - 1; i <= clickedCellRow + 1; i++) {
      for (let j = clickedCellColumn - 1; j <= clickedCellColumn + 1; j++) {
        if (
          this.minesContainer.has(
            document.querySelector(`.game-cell_${i}_${j}`)
          )
        ) {
          minesCount++;
        }
      }
    }
    return minesCount;
  };

  handleFlags = (clickedOnCell) => {
    if (this.gameState === "Lost" || this.gameState === "Win") {
      return;
    }

    if (clickedOnCell.textContent === "🚩") {
      clickedOnCell.textContent = "";
      this.flags++;
      this.cellsWithFlags.delete(clickedOnCell);
      this.updateFlagsNumber();
    } else if (clickedOnCell.textContent === "" && this.flags > 0) {
      clickedOnCell.textContent = "🚩";
      this.cellsWithFlags.add(clickedOnCell);
      this.flags--;
      this.updateFlagsNumber();
    }
  };

  updateFlagsNumber = () => (getFlagsCounter.textContent = this.flags);

  startNewGame = () => {
    getContainer.innerHTML = "";
    getFaceContainer.textContent = "😊";
    this.flags = this.mines;
    this.minesContainer = new Set();
    this.checkedCells = new Set();
    this.createdCells = [];
    this.gameState = "Playing";
    this.cellsWithFlags = new Set();
    getTimeCounter.textContent = 0;
  };

  handleGameWin = () => {
    if (this.checkedCells.size === this.rows * this.columns - this.mines) {
      getFaceContainer.textContent = "😎";
      this.gameState = "Win";
      clearInterval(this.startedTimer);
    }
  };

  handleGameLost = (clickedOnCell) => {
    getFaceContainer.textContent = "😵";

    clickedOnCell.style.backgroundColor = "red";
    for (let cell of this.minesContainer) {
      cell.textContent = "💣";
      cell.classList.add("game-cell-on-click");
    }
    clearInterval(this.startedTimer);
  };

  handleTimer = () => {
    this.startedTimer = setInterval(() => {
      getTimeCounter.textContent = this.time;
      this.time++;
    }, 1000);
  };

  resetTimer = () => {
    clearInterval(this.startedTimer);
    this.startedTimer = null;
    this.time = 0;
  };
}

const difficulties = {
  beginner: new MineSweeper("Beginner", 9, 9, 10),
  intermediate: new MineSweeper("Intermediate", 16, 16, 40),
  expert: new MineSweeper("expert", 16, 30, 99),
};

difficulties.beginner.buildBoard();

const startGame = {
  beginner: getBeginnerLevel,
  intermediate: getIntermediateLevel,
  expert: getExpertLevel,
};

for (let key in startGame) {
  startGame[key].addEventListener("click", () => {
    for (let newKey in startGame) {
      difficulties[newKey].resetTimer();
    }
    difficulties[key].buildBoard();
  });
}
