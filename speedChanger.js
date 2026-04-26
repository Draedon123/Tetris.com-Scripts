javascript: {
  /**
   * Sets the game speed
   */

  const speed = prompt("Speed:");

  document.querySelector(
    "iframe[title='Tetris Game'], #gameIFrame",
  ).contentWindow.mBPSApp.mTimeScale = speed === "" ? 1 : parseFloat(speed);
}
