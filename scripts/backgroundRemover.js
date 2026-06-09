javascript: {
  /**
   * Sets the background colour to white on the official tetris.com site
   */
  const background = document.querySelector("section");
  background.style.backgroundColor = "#ffffff";
  background.classList.remove(
    [...background.classList].find((x) => x.startsWith("bg-gradient-")),
  );
}
