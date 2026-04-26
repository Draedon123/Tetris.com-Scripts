javascript: {
  /**
   * Making a new browser bookmark with this as the url will allow you to restart the game with a click of a button
   * Once the game has loaded, you can click the bookmark you made, and the script will start working
  
   * If you want to change the key, you can just edit the const RESTART_KEY line,
   * ensuring that there are still double quotes around the key you put.
   * The default is "r"
   */
  const RESTART_KEY = "r";

  const iframe = document.querySelector(
    "iframe[title='Tetris Game'], #gameIFrame",
  );
  function restartGame(event) {
    if (event.key === RESTART_KEY.toLowerCase()) {
      iframe.contentWindow.mBPSApp.mSceneMgr
        .getManagedScene("mainMenu")
        .performPlay();
    }
  }
  document.addEventListener("keydown", restartGame);
  iframe.contentWindow.document
    .getElementById("GameCanvas")
    .addEventListener("keydown", restartGame);
}
