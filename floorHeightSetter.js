javascript: {
  /**
   * Fills in the bottom n rows of the matrix.
   * To change the floor height of the next game, enter setHeight() into the console and follow the prompt.
   * To change the colour of the floor, enter minoColour = x, where x is a number from 1 to 7, inclusive
   */
  let minoColour = 1;
  const app = document.querySelector("iframe[title='Tetris Game'], #gameIFrame")
    .contentWindow.mBPSApp;
  const gameScene = app.mSceneMgr.getManagedScene("game");
  let height = 0;

  setHeight();

  function setField() {
    const game = gameScene.mGameMgr.mGame.mPlayers.mObjects[0];

    game.mMatrixMinoMatchPattern.mY = height;

    for (let y = 0; y < height; y++) {
      const method = (
        game.mPieceFactory.x1870197110890883719x ??
        game.mPieceFactory.x3045176153931957276x
      )?.bind(game.mPieceFactory);

      for (let x = 0; x < 10; x++) {
        const mino = method(minoColour).mMinos.mObjects[0];
        game.mMatrix.insertMinoAt(mino, x, y);
      }
    }
  }

  function setHeight() {
    const response = prompt("Height:");
    height = response === "" ? 0 : parseInt(response);
  }

  let gameManager = null;
  let timeout = null;
  delete gameScene.mGameMgr;

  Object.defineProperty(gameScene, "mGameMgr", {
    get() {
      return gameManager;
    },
    set(newValue) {
      gameManager = newValue;

      if (timeout !== null) {
        clearTimeout(timeout);
      }

      if (newValue === null) {
        return;
      }

      timeout = setTimeout(setField, 500);
    },
    configurable: true,
  });
}
