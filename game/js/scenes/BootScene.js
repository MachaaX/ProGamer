// BootScene.js

class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // If you want a quick loading icon:
    this.load.image('preloadbar', 'game/assets/images/preloader-bar.png');
  }

  create() {
    // Move on to Intro
    this.scene.start('IntroScene');
  }
}

window.BootScene = BootScene;
