// main.js

window.onload = function () {
  // A global object to store ephemeral data (selected name, track, vehicle, etc.)
  // This is a simple alternative to the old "gamesession" object.
  window.PsycoRally = {
    settings: new Settings(),
    player: new Player(),
    chosenTrackKey: null,     // e.g. "anilloMap" or "jambaMap" or "lubaloccMap"
    raceResult: null          // stored after finishing (time, best lap, etc.)
  };

  const config = {
    type: Phaser.AUTO,
    width: 900,
    height: 500,
    parent: 'gameContainer',
    backgroundColor: '#222',
    physics: {
      default: 'arcade',
      arcade: { debug: false }
    },
    // List all Scenes in the order you first want them used
    scene: [
      BootScene,
      IntroScene,
      ChooseNameScene,
      ChooseVehicleScene,
      ChooseTrackScene,
      PreloadScene,
      GameScene,
      RankingScene
    ]
  };

  const game = new Phaser.Game(config);
};
