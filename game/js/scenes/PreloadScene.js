// PreloadScene.js
class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    const { width, height } = this.scale;
    const loadingText = this.add.text(width / 2, height / 2, 'Loading...', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 1) Load tilemap(s)
    const chosenKey = window.PsycoRally.chosenTrackKey;
    // If you prefer, load all three right now:
    // this.load.tilemapTiledJSON('anilloMap', 'assets/tilemaps/anillo.json');
    // this.load.tilemapTiledJSON('jambaMap',  'assets/tilemaps/jamba.json');
    // this.load.tilemapTiledJSON('lubaloccMap','assets/tilemaps/lubalocc.json');
    // Then you can use whichever is chosen.

    if (chosenKey === 'anilloMap') {
      this.load.tilemapTiledJSON('anilloMap', 'game/assets/tilemaps/anillo.json');
    }
    else if (chosenKey === 'jambaMap') {
      this.load.tilemapTiledJSON('jambaMap', 'game/assets/tilemaps/jamba.json');
    }
    else if (chosenKey === 'lubaloccMap') {
      this.load.tilemapTiledJSON('lubaloccMap', 'game/assets/tilemaps/lubalocc.json');
    }

    // All maps presumably use the same tileset image
    this.load.image('gta2_tilesheet', 'game/assets/images/gta2_tilesheet.jpg');

    // 2) Load vehicle images
    const vehicle = window.PsycoRally.player.getVehicle();
    if (vehicle) {
      const assets = vehicle.getAssets(); // e.g. { images: { 'car-s': '...', 'car-se': '...' } }
      for (let key in assets.images) {
        this.load.image(key, assets.images[key]);
      }
    }

    // Optional: track load progress
    this.load.on('progress', (value) => {
      loadingText.setText(`Loading... ${Math.floor(value * 100)}%`);
    });
  }

  create() {
    // Move on
    this.scene.start('GameScene');
  }
}
window.PreloadScene = PreloadScene;
