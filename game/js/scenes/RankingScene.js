// RankingScene.js
class RankingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'RankingScene' });
  }

  create() {
    const { width, height } = this.scale;
    const result = window.PsycoRally.raceResult || {
      total_time: 0,
      best_lap_time: 0
    };

    this.add.text(width / 2, 100,
      `${window.PsycoRally.player.getName()}, your total time is ${result.total_time.toFixed(2)}s\nBest lap time: ${result.best_lap_time?.toFixed(2) || 0}`,
      { fontSize: '20px', color: '#ffffff', align: 'center' }
    ).setOrigin(0.5);

    // Press ENTER to restart from intro
    this.add.text(width / 2, height - 50, 'Press ENTER to restart', {
      fontSize: '16px', color: '#cccccc'
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown-ENTER', () => {
      this.scene.start('IntroScene');
    });
  }
}
window.RankingScene = RankingScene;