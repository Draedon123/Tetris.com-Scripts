javascript: {
  /**
   * Sets the seed
   * Leave the prompt blank to use a random seed
   */

  const seed = prompt("Seed:");
  const originalRandom = Math.random;

  document.querySelector(
    "iframe[title='Tetris Game'], #gameIFrame",
  ).contentWindow.Math.random = () =>
    seed === "" ? originalRandom() : parseFloat(seed);
}
