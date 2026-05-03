/**
 * To set your scoreboard, just change the values under SCORES while keeping the format [SCORE, "OPTIONAL_NAME"].
 * Order doesn't matter as the script sorts it for you.
 * Then reload the page to see the updated scoreboard.
 * Note that this will completely wipe your current scoreboard and replace it with the new one.
 * This means that if you're trying to add one new score, you have to copy in the other four scores you want to keep
 */

// prettier-ignore
const SCORES = [
  [1000000],
  [3000000, "asd"],
  [2000000],
]
.sort((a, b) => b[0] - a[0])

const highScoreManager = document.querySelector(
  "iframe[title='Tetris Game'], #gameIFrame",
).contentWindow.mBPSApp.mHighScoresMgr;
highScoreManager.resetHighScores();
const highScores =
  highScoreManager.mHighScoresDictionary.mValues.mObjects[1].mValue.mValues
    .mObjects;

for (let i = 0; i < SCORES.length; i++) {
  const [score, name] = SCORES[i];
  const entry = highScores[i].mValue.mValues.mObjects;
  entry[1].mValue = score;
  if (name !== undefined) {
    entry[0].mValue = name;
  }
}

highScoreManager.saveHighScoresToPrefs();
