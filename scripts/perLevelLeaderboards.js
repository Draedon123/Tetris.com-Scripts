/**
 * Creates separate leaderboards for each starting level (1, 5, ..., 30)
 * Also allows level 30 to be selected without additional console
 * commands (i.e., through the level select button)
 */

(() => {
  const mBPSApp = document.getElementById("gameIFrame").contentWindow.mBPSApp;
  const highScoreManager = mBPSApp.mHighScoresMgr;
  const mainMenu = mBPSApp.mSceneMgr.getManagedScene("mainMenu");
  const options = mBPSApp.mSceneMgr.getManagedScene("options");
  const originalSetLevelIndex = mainMenu.setStartingLevelIndex.bind(mainMenu);
  const originalSavedDataId = mBPSApp.getSavedDataId();
  const validLevels = [1, 5, 10, 15, 20, 25, 30];

  mainMenu
    .getSceneParams()
    .setIntValueWithKeyStringPath(
      "viewHierarchy.views._BPSUIPanel:menu.content._BPSUIButton:level.maxLevelIndex",
      29,
    );

  let savedDataId = getSavedDataIdFromLevel(mainMenu.mStartingLevelIndex + 1);

  mBPSApp.getSavedDataId = () => savedDataId;

  highScoreManager.loadHighScoresFromPrefs();

  mainMenu.setStartingLevelIndex = function (index) {
    originalSetLevelIndex(index);

    const level = index + 1;
    savedDataId = getSavedDataIdFromLevel(level);
    highScoreManager.loadHighScoresFromPrefs();
  };

  options.x3765534826241065107x = () => {
    const currentSavedDataId = savedDataId;

    for (const level of validLevels) {
      savedDataId = getSavedDataIdFromLevel(level);
      options.saveLocalValuesToPrefsAndDispatch();
    }

    savedDataId = currentSavedDataId;
  };

  function getSavedDataIdFromLevel(level) {
    return originalSavedDataId + (level === 1 ? "" : `-custom-${level}`);
  }
})();
