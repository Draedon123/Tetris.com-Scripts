javascript: {
  let e = document.querySelector(
      "iframe[title='Tetris Game'], #gameIFrame, iframe[title='Tetris Mindbender Game']",
    ).contentWindow.mBPSApp,
    a = (function (e, t, n, r) {
      for (; n > 0; )
        if ((n--, !(e = Object.getPrototypeOf(e))))
          return console.error("Structure nonexistent");
      let o = Object.getOwnPropertyNames(e).filter(
        (t) =>
          "function" == typeof e[t] &&
          "x" === t[0] &&
          "x" === t[t.length - 1] &&
          r.test(e[t].toString()),
      );
      return (
        1 != o.length && console.error(`Found ${o.length} function signatures`),
        o[0]
      );
    })(e, 0, 2, /function\(\)\{return this.x\d+x\}/);
  a &&
    (e[a]()
      .getDictionaryWithKeyStringPath(
        "gameMgr.game.players.player-base.playerComponents.levels.params.levels",
      )
      .mValues.mObjects[29].mValue.setIntValueWithKeyStringPath(
        "endCondition.targetValue",
        1 / 0,
      ),
    console.log("Successfully changed config"));
}
