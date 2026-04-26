const newHighestLevel = 45;

function newLevel(level, level30Data) {
  const object = structuredClone(level30Data);
  object.id = level.toString();
  object.displayName = level.toString();

  object["lockTimeMSEC@i"] = 150 - (level - 30) * 10;

  return object;
}

function setLevel(level) {
  const menu = document
    .querySelector("iframe[title='Tetris Game'], #gameIFrame")
    .contentWindow.mBPSApp.mSceneMgr.getManagedScene("mainMenu");

  menu.setStartingLevelIndex(level - 1);
}

(() => {
  const numFrom2Chars = function (r, n) {
    return r - 65 + 26 * (n - 65);
  };

  const _randomInt2 = function (r, n) {
    return (
      0 == (r %= 16777215) && (r = 1),
      0 == (n %= 16777215) && (n = 1),
      ((((65535 & (n = 36969 * (65535 & n) + (n >>> 16))) << 16) & 2147483647) +
        (65535 & (r = 18e3 * (65535 & r) + (r >>> 16)))) &
        2147483647
    );
  };

  const forceSignedInt32 = function (r) {
    return (r > 2147483647 && (r = r - 2147483647 - 2147483648 - 1), ~~r);
  };

  const randomInt2 = function (n, e) {
    var t = (n %= 16777215) + (e %= 16777215),
      i = 15449471 + e,
      a = n - e,
      u = 11366743 - e,
      s = _randomInt2(t, i),
      c = forceSignedInt32(s + e),
      o = _randomInt2(a, u),
      g = forceSignedInt32(o - e);
    return _randomInt2(c, g);
  };

  // x857637019956867372x
  const decode = function (n) {
    if (!n || "" == n) return "";
    var e,
      t,
      i = n.length,
      a = numFrom2Chars(n.charCodeAt(0), n.charCodeAt(1)),
      u = (i - 2) / 2;
    let r = "";
    for (var s = 1; s <= u; s++) {
      if (
        ((e = randomInt2(a, s - 1) % 420),
        (t = numFrom2Chars(n.charCodeAt(2 * s), n.charCodeAt(2 * s + 1)) - e) >
          255)
      )
        return "";
      if (t > 0) {
        r += String.fromCharCode(t);
      }
    }
    return r;
  };

  const stringToHash32 = function (r) {
    if ("" != r) {
      for (var n = 44017, e = r.length, t = 0; t < e; t++)
        n = r.charCodeAt(t) + (n << 6) + (n << 16) - n;
      return (n &= 2147483647);
    }
    return 0;
  };

  const nextNativeRandomInt = function () {
    return ~~(2147483647 * Math.random());
  };

  const nextNativeRandomIntInRange = function (n, e) {
    return n + (nextNativeRandomInt() % (e - n + 1));
  };

  const numTo2Chars_CharCode1 = function (r) {
    return 65 + (r % 26);
  };

  const numTo2Chars_CharCode2 = function (r) {
    return 65 + r / 26;
  };

  // x2616646503576873465x
  const encode = function (n, e) {
    if (!n || "" == n) return "";
    var t,
      i,
      a,
      u,
      s = n.length;
    t =
      e < 0
        ? stringToHash32(n) % 256
        : 0 == e
          ? nextNativeRandomIntInRange(0, 255)
          : e % 256;
    r = "";
    r += String.fromCharCode(numTo2Chars_CharCode1(t));
    r += String.fromCharCode(numTo2Chars_CharCode2(t));
    for (var c = 0; c < s; c++)
      ((i = randomInt2(t, c) % 420),
        (a = n.charCodeAt(c)) > 255 && (a = 0),
        (u = a + i),
        (r += String.fromCharCode(numTo2Chars_CharCode1(u))),
        (r += String.fromCharCode(numTo2Chars_CharCode2(u))));
    return r;
  };

  let handler = setInterval(() => {
    try {
      const iframe = document.querySelector(
        "iframe[title='Tetris Game'], #gameIFrame",
      );

      const OriginalXMLHttpRequest = iframe.contentWindow.XMLHttpRequest;
      iframe.contentWindow.XMLHttpRequest = function () {
        const xhr = new OriginalXMLHttpRequest();
        const originalOpen = xhr.open;

        xhr.open = function (method, url) {
          this._url = url;
          return originalOpen.apply(this, arguments);
        };

        const originalSend = xhr.send;
        xhr.send = function () {
          const originalOnReadyStateChange = this.onreadystatechange;

          this.onreadystatechange = function () {
            if (
              this.readyState === 4 &&
              /.*SJUNWRWEIRJFBRGPXFMNNQMLVRBKUFUT\.txt.*/.test(this._url)
            ) {
              const parsed = JSON.parse(decode(this.responseText));
              const levels =
                parsed.gameMgr.game.players["player-base"].playerComponents
                  .levels.params.levels;
              parsed.gameMgr.game.players[
                "player-base"
              ].playerComponents.levels.params.maxLevelId =
                newHighestLevel.toString();

              for (let i = 31; i <= newHighestLevel; i++) {
                const level = newLevel(i, levels[29]);

                levels.push(level);
              }

              const customLevelData = encode(JSON.stringify(parsed), -1);

              Object.defineProperty(this, "responseText", {
                writable: true,
                value: customLevelData,
              });

              console.log("\n\n\nPatched!\n\n\n");
            }

            if (originalOnReadyStateChange) {
              originalOnReadyStateChange.apply(this, arguments);
            }
          };
          return originalSend.apply(this, arguments);
        };
        return xhr;
      };

      clearInterval(handler);
    } catch (e) {
      console.log("Too early...");
    }
  }, 1);
})();
