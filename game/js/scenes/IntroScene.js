// IntroScene.js

class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroScene' });
  }

  create() {
    const { width, height } = this.scale;

    this.add.text(width / 2, height / 2, 'PSYCO RALLY (Phaser 3)', {
      fontSize: '32px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    this.add.text(width / 2, height - 40, 'Click to start', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.scene.start('ChooseNameScene');
    });
  }
}

window.IntroScene = IntroScene;
