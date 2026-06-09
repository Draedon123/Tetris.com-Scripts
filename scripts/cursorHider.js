javascript: {
  /**
   * Hides your cursor whenever a key is pressed or the mouse stops moving for some amount of time
   * Default is 3000ms.
   * Mouse reappears when the mouse moves
   */
  const MOUSE_DELAY_MS = 3000;

  const elements = [
    document.body,
    document
      .querySelector(
        "iframe[title='Tetris Game'], #gameIFrame, iframe[title='Tetris Mindbender Game']",
      )
      .contentDocument.getElementById("GameCanvas"),
  ];

  function registerEvents(element) {
    let mouseTimer = null;

    element.addEventListener("kedown", () => {
      setCursor("none");
    });

    element.addEventListener("mousemove", () => {
      setCursor("unset");

      if (mouseTimer !== null) {
        clearTimeout(mouseTimer);
        mouseTimer = null;
      }

      mouseTimer = setTimeout(() => {
        setCursor("none");
      }, MOUSE_DELAY_MS);
    });
  }

  function setCursor(style) {
    elements.forEach((element) => (element.style.cursor = style));
  }

  registerEvents(elements[0]);
  registerEvents(elements[1]);
}
