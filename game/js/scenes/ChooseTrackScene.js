// ChooseTrackScene.js

class ChooseTrackScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ChooseTrackScene' });
  }

  create() {
    const { width, height } = this.scale;
    this.tracks = Tracks;
    this.currentIndex = 0;

    this.add.text(width / 2, 50,
      `${window.PsycoRally.player.getName()}, choose a track`,
      { fontSize: '20px', color: '#ffffff' }
    ).setOrigin(0.5);

    this.add.text(width / 2, height - 40, 'LEFT/RIGHT & ENTER', {
      fontSize: '16px',
      color: '#cccccc'
    }).setOrigin(0.5);

    this.trackText = this.add.text(width / 2, height / 2, '', {
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5);

    this.updateTrackText();

    this.input.keyboard.on('keydown-LEFT', () => {
      this.currentIndex = (this.currentIndex + this.tracks.length - 1) % this.tracks.length;
      this.updateTrackText();
    });
    this.input.keyboard.on('keydown-RIGHT', () => {
      this.currentIndex = (this.currentIndex + 1) % this.tracks.length;
      this.updateTrackText();
    });
    this.input.keyboard.on('keydown-ENTER', () => {
      window.PsycoRally.chosenTrackKey = this.tracks[this.currentIndex].key;
      this.scene.start('PreloadScene');
    });
  }

  updateTrackText() {
    this.trackText.setText(this.tracks[this.currentIndex].name);
  }
}

window.ChooseTrackScene = ChooseTrackScene;
