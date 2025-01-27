// IntroScene.js
class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroScene' });
  }

  create() {
    const { width, height } = this.scale;

    this.add.text(width / 2, height / 2, 'PSYCO RALLY\n(Phaser 3)', {
      fontSize: '32px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    this.add.text(width / 2, height - 50, 'Click anywhere to start', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Once user clicks, move to next scene
    this.input.once('pointerdown', () => {
      this.scene.start('ChooseNameScene');
    });
  }
}
window.IntroScene = IntroScene;
