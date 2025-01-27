// BootScene.js
class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // If you want to show a quick loading image or bar, load it here:
    this.load.image('preloadbar', 'game/assets/images/preloader-bar.png');
  }

  create() {
    // Scale settings or background color:
    this.scale.displaySize.setAspectRatio(900 / 500);
    this.scale.refresh();

    // Move on to the Intro scene
    this.scene.start('IntroScene');
  }
}
window.BootScene = BootScene;
