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

    // We'll store typed text in a local string
    this.typedName = '';

    // Show typed name on screen
    this.nameText = this.add.text(width / 2, height / 2, '', {
      fontSize: '30px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // Instructions
    this.add.text(width / 2, height - 50, 'Type on keyboard, press ENTER to confirm', {
      fontSize: '16px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // Listen for keys
    this.input.keyboard.on('keydown', (event) => {
      if (event.key === 'Enter') {
        // If user pressed Enter and we have at least one character
        if (this.typedName.length > 0) {
          window.PsycoRally.player.setName(this.typedName);
          this.scene.start('ChooseVehicleScene');
        }
      }
      else if (event.key === 'Backspace') {
        // remove last character
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
