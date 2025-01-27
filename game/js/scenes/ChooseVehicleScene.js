// ChooseVehicleScene.js
class ChooseVehicleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ChooseVehicleScene' });
  }

  create() {
    const { width, height } = this.scale;

    this.vehicles = Garage.getVehicles(); // from garage.js
    this.currentIndex = 0;

    this.add.text(width / 2, 50,
      `${window.PsycoRally.player.getName()}, choose your vehicle`,
      { fontSize: '20px', color: '#ffffff' }
    ).setOrigin(0.5);

    this.vehicleText = this.add.text(width / 2, height / 2, '', {
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5);

    this.add.text(width / 2, height - 50, 'Press LEFT/RIGHT, then ENTER', {
      fontSize: '16px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // Show initial vehicle name
    this.updateVehicleText();

    // Keyboard input
    this.input.keyboard.on('keydown-LEFT', () => {
      this.currentIndex = (this.currentIndex + this.vehicles.length - 1) % this.vehicles.length;
      this.updateVehicleText();
    });
    this.input.keyboard.on('keydown-RIGHT', () => {
      this.currentIndex = (this.currentIndex + 1) % this.vehicles.length;
      this.updateVehicleText();
    });
    this.input.keyboard.on('keydown-ENTER', () => {
      const chosen = this.vehicles[this.currentIndex];
      window.PsycoRally.player.setVehicle(chosen);
      this.scene.start('ChooseTrackScene');
    });
  }

  updateVehicleText() {
    const v = this.vehicles[this.currentIndex];
    this.vehicleText.setText(v.name.toUpperCase());
  }
}
window.ChooseVehicleScene = ChooseVehicleScene;
