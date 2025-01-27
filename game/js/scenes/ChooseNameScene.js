// ChooseNameScene.js

class ChooseNameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ChooseNameScene' });
  }

  create() {
    const { width, height } = this.scale;

    this.add.text(width / 2, 50, 'Enter Your Name', {
      fontSize: '28px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.typedName = '';

    this.nameText = this.add.text(width / 2, height / 2, '', {
      fontSize: '30px',
      color: '#00ff00'
    }).setOrigin(0.5);

    this.add.text(width / 2, height - 40, 'Type & press ENTER', {
      fontSize: '16px',
      color: '#cccccc'
    }).setOrigin(0.5);

    this.input.keyboard.on('keydown', (event) => {
      if (event.key === 'Enter') {
        if (this.typedName.length > 0) {
          window.PsycoRally.player.setName(this.typedName);
          this.scene.start('ChooseVehicleScene');
        }
      }
      else if (event.key === 'Backspace') {
        this.typedName = this.typedName.slice(0, -1);
      }
      else if (/^[a-zA-Z0-9]$/.test(event.key)) {
        this.typedName += event.key;
      }
      this.nameText.setText(this.typedName);
    });
  }
}

window.ChooseNameScene = ChooseNameScene;
