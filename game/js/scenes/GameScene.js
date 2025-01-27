// GameScene.js

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this._gameOver = false;
  }

  create() {
    // track info
    const chosenKey = window.PsycoRally.chosenTrackKey;
    const track = Tracks.find(t => t.key === chosenKey);

    // load tilemap
    this.map = this.make.tilemap({ key: chosenKey });
    const tileset = this.map.addTilesetImage('gta2_tilesheet', 'gta2_tilesheet');

    this.trackLayer = this.map.createLayer('track_layer', tileset, 0, 0);
    this.dirtLayer = this.map.createLayer('dirt_layer', tileset, 0, 0);
    this.wallLayer = this.map.createLayer('wall_layer', tileset, 0, 0);
    this.waterLayer = this.map.createLayer('water_layer', tileset, 0, 0);
    this.partialsLayer = this.map.createLayer('partials_layer', tileset, 0, 0);

    if (this.wallLayer) {
      this.wallLayer.setCollisionByExclusion([-1]);
    }

    // player
    const v = window.PsycoRally.player.getVehicle();
    const initTexture = v ? (v.texture_prefix + 's') : null;
    this.playerSprite = this.physics.add.sprite(track.initX, track.initY, initTexture);
    this.cameras.main.startFollow(this.playerSprite);

    if (this.wallLayer) {
      this.physics.add.collider(this.playerSprite, this.wallLayer);
    }

    this.laps = 0;
    this.totalLaps = track.laps;
    this.startTime = this.time.now;
    this.lastTime = this.time.now;
    this.bestLap = null;

    this.lapText = this.add.text(10, 10, `Lap: 0/${this.totalLaps}`, {
      color: '#ffffff'
    }).setScrollFactor(0);

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update(time, delta) {
    if (this._gameOver) return;

    // replicate old dt logic
    const now = this.time.now;     // ms
    const deltaMs = now - this.lastTime; // ~16
    this.lastTime = now;

    // old code used dt=1 for 16ms
    const dt = deltaMs / 16;

    // movement
    this.handleVehicleMovement(dt);

    // partial laps
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

    // decide terrain
    let terrain = 'road';
    // quick check if we’re on dirt:
    const dirtTile = this.dirtLayer?.getTileAtWorldXY(this.playerSprite.x, this.playerSprite.y);
    if (dirtTile && dirtTile.index !== -1) {
      terrain = 'dirt';
    }
    const waterTile = this.waterLayer?.getTileAtWorldXY(this.playerSprite.x, this.playerSprite.y);
    if (waterTile && waterTile.index !== -1) {
      terrain = 'water';
    }

    const moveData = vehicle.getMovementData(dt, keys, terrain);
    this.playerSprite.x += moveData.dx;
    this.playerSprite.y += moveData.dy;
    this.playerSprite.setTexture(moveData.texture);
  }

  checkPartialLap() {
    const tile = this.partialsLayer?.getTileAtWorldXY(this.playerSprite.x, this.playerSprite.y);
    if (!tile || tile.index === -1) return;

    // example: tile.index===980 means start/finish line
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
    this._gameOver = true;
    const totalTime = (this.time.now - this.lastTime) / 1000;

    window.PsycoRally.raceResult = {
      total_time: totalTime,
      best_lap_time: this.bestLap
    };

    this.add.text(50, 100, `FINISH! ${totalTime.toFixed(2)}s`, {
      color: '#ff0', fontSize: '28px'
    }).setScrollFactor(0);

    this.time.delayedCall(2000, () => {
      this.scene.start('RankingScene');
    });
  }
}

window.GameScene = GameScene;
