// GameScene.js
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // 1) Find track info from chosen key
    const chosenKey = window.PsycoRally.chosenTrackKey; // 'anilloMap', etc.
    const trackInfo = Tracks.find(t => t.key === chosenKey);

    // 2) Create tilemap
    this.map = this.make.tilemap({ key: chosenKey });
    const tileset = this.map.addTilesetImage('gta2_tilesheet', 'gta2_tilesheet');

    // Layer names must match what’s in your Tiled JSON
    this.trackLayer = this.map.createLayer('track_layer', tileset, 0, 0);
    this.dirtLayer = this.map.createLayer('dirt_layer', tileset, 0, 0);
    this.wallLayer = this.map.createLayer('wall_layer', tileset, 0, 0);
    this.waterLayer = this.map.createLayer('water_layer', tileset, 0, 0);
    this.partialsLayer = this.map.createLayer('partials_layer', tileset, 0, 0);

    // 3) Make wallLayer collidable
    if (this.wallLayer) {
      this.wallLayer.setCollisionByExclusion([-1]);
    }

    // 4) Create player sprite
    const playerVehicle = window.PsycoRally.player.getVehicle();
    // e.g. "car-s" or "tank-s" if you have that frame
    const initTexture = playerVehicle ? (playerVehicle.texture_prefix + 's') : null;

    // Use the track’s init position
    this.playerSprite = this.physics.add.sprite(trackInfo.initX, trackInfo.initY, initTexture);
    this.cameras.main.startFollow(this.playerSprite);

    // Add collision
    if (this.wallLayer) {
      this.physics.add.collider(this.playerSprite, this.wallLayer);
    }

    // 5) Basic UI
    this.laps = 0;
    this.totalLaps = trackInfo.laps;
    this.lapText = this.add.text(10, 10, `Lap: 0/${this.totalLaps}`, { color: '#fff' }).setScrollFactor(0);

    // Timer
    this.startTime = this.time.now;
    this.lastTime = this.time.now;
    this.bestLap = null;
    this.gameOverFlag = false;

    // input
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update(time, delta) {
    if (this.gameOverFlag) return;

    // dt in ms since last frame
    const now = this.time.now;
    const dt = now - this.lastTime;
    this.lastTime = now;

    // Move vehicle
    this.handleVehicleMovement(dt);

    // Check partial-lap logic
    this.checkPartialLap();
  }

  handleVehicleMovement(dt) {
    const vehicle = window.PsycoRally.player.getVehicle();
    if (!vehicle) return;

    const keys = {
      up: this.cursors.up.isDown,
      down: this.cursors.down.isDown,
      left: this.cursors.left.isDown,
      right: this.cursors.right.isDown
    };

    // Simple approach: assume 'road' unless you detect being on 'dirt' or 'water'
    let terrain = 'road';

    // If you want to sample the dirt layer tile at the player's position:
    const dirtTile = this.dirtLayer?.getTileAtWorldXY(this.playerSprite.x, this.playerSprite.y);
    if (dirtTile && dirtTile.index !== -1) {
      terrain = 'dirt';
    }
    const waterTile = this.waterLayer?.getTileAtWorldXY(this.playerSprite.x, this.playerSprite.y);
    if (waterTile && waterTile.index !== -1) {
      terrain = 'water';
    }

    // Let vehicle compute movement
    const moveData = vehicle.getMovementData(dt, keys, terrain);
    // update sprite position
    this.playerSprite.x += moveData.dx;
    this.playerSprite.y += moveData.dy;
    // update texture
    this.playerSprite.setTexture(moveData.texture);
  }

  checkPartialLap() {
    // Example partial-lap check: read tile from partials_layer
    // If tile index is something special (980, 1009, etc.), increment lap
    const tile = this.partialsLayer?.getTileAtWorldXY(this.playerSprite.x, this.playerSprite.y);
    if (!tile || tile.index === -1) return;

    // Suppose tile.index === 980 means start/finish line
    if (tile.index === 980) {
      this.laps++;
      this.lapText.setText(`Lap: ${this.laps}/${this.totalLaps}`);

      const lapTime = (this.time.now - this.startTime) / 1000;
      this.bestLap = this.bestLap ? Math.min(this.bestLap, lapTime) : lapTime;
      this.startTime = this.time.now;

      if (this.laps >= this.totalLaps) {
        this.endRace();
      }
    }
  }

  endRace() {
    this.gameOverFlag = true;
    const totalTime = (this.time.now - this.lastTime) / 1000;

    // Store result
    window.PsycoRally.raceResult = {
      total_time: totalTime,
      best_lap_time: this.bestLap
    };

    // Show a quick message
    this.add.text(50, 100, `FINISH! Total time: ${totalTime.toFixed(2)}s`, {
      color: '#ff0', fontSize: '28px'
    }).setScrollFactor(0);

    // Go to RankingScene in 2 seconds
    this.time.delayedCall(2000, () => {
      this.scene.start('RankingScene');
    });
  }
}
window.GameScene = GameScene;
