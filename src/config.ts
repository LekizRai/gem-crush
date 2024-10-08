import InitScene from './scenes/InitScene'
import PreloadScene from './scenes/PreloadScene'
import GameplayScene from './scenes/GameplayScene'
import AchievementScene from './scenes/AchievementScene'

const gameConfig: Phaser.Types.Core.GameConfig = {
    title: 'Candy crush',
    url: 'https://github.com/digitsensitive/phaser3-typescript',
    version: '0.0.1',
    width: 800,
    height: 1000,
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    parent: 'game',
    scene: [InitScene, PreloadScene, GameplayScene, AchievementScene],
    backgroundColor: '#de3412',
    render: { pixelArt: false, antialias: true },
}

export default gameConfig
