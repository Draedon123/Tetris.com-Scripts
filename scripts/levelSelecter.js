javascript: {
  const menu = document
    .querySelector("iframe[title='Tetris Game'], #gameIFrame")
    .contentWindow.mBPSApp.mSceneMgr.getManagedScene("mainMenu");
  menu.setStartingLevelIndex(parseInt(prompt("Level?:")) - 1);
  menu.performPlay();
}
