// main.js

window.onload = function () {
  // Global object to store session data
  window.PsycoRally = {
    settings: new Settings(),
    player: new Player(),
    chosenTrackKey: null,
    raceResult: null
  };

  const config = {
    type: Phaser.AUTO,
    parent: 'gameContainer',
    backgroundColor: '#222',

    // Some default "design" resolution (16:9 is common).
    width: 960,
    height: 540,

    // Let Phaser scale to fit:
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },

    physics: {
      default: 'arcade',
      arcade: {
        debug: false
      }
    },

    // List all Scenes
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

  new Phaser.Game(config);
};
