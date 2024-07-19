/*
- Add consts to consts.ts file
- Normalize grid height, not using grid length
- Using global emitter
- Spiral explosionin 3x3 explosion
*/

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
