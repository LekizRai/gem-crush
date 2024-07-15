import Phaser from 'phaser'
import gameConfig from './config'

export default class Game extends Phaser.Game {
    constructor(config: Phaser.Types.Core.GameConfig) {
        super(config)
    }
}

window.addEventListener('load', () => {
    new Game(gameConfig)
})
