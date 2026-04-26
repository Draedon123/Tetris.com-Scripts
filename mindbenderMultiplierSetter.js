javascript: {
  /**
   * Sets the mindbender multiplier to 10.
   * Should only be used once per refresh.
   * To change the multiplier (without reloading) to, e.g., 1, just put multiplier = 1 in the console.
   * The change will be reflected in the next game
   */
  let multiplier = 10;

  const app = document.querySelector(
    "iframe[title='Tetris Mindbender Game'], #gameIFrame",
  ).contentWindow.mBPSApp;
  const gameScene = app.mSceneMgr.getManagedScene("game");

  let gameManager = null;
  let timeout = null;
  delete gameScene.mGameMgr;

  function updateMultiplier() {
    gameManager.mGame.mPlayers.mObjects[0].mComponents.mObjects[0].mPlayer.mComponents.mObjects[3].mScoreComponent.setScoreMultiplier(
      multiplier,
    );
  }

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
      timeout = setTimeout(updateMultiplier, 500);
    },
    configurable: true,
  });
}
