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

    const chosenKey = window.PsycoRally.chosenTrackKey;
    // If you prefer, load all .json tilemaps here, or just one:
    if (chosenKey === 'anilloMap') {
      this.load.tilemapTiledJSON('anilloMap', 'game/assets/tilemaps/anillo.json');
    } else if (chosenKey === 'jambaMap') {
      this.load.tilemapTiledJSON('jambaMap', 'game/assets/tilemaps/jamba.json');
    } else if (chosenKey === 'lubaloccMap') {
      this.load.tilemapTiledJSON('lubaloccMap', 'game/assets/tilemaps/lubalocc.json');
    }

    // Tileset image (common)
    this.load.image('gta2_tilesheet', 'game/assets/images/gta2_tilesheet.jpg');

    // Vehicle images
    const vehicle = window.PsycoRally.player.getVehicle();
    if (vehicle) {
      const assets = vehicle.getAssets();
      for (let key in assets.images) {
        this.load.image(key, assets.images[key]);
      }
    }

    this.load.on('progress', (value) => {
      loadingText.setText(`Loading... ${Math.floor(value * 100)}%`);
    });
  }

  create() {
    this.scene.start('GameScene');
  }
}

window.PreloadScene = PreloadScene;
