import consts from '../consts/consts'
import GameBoard from '../objects/game-board/GameBoard'
import ProgressInfo from '../objects/progress-info/ProgressInfo'

export default class GameplayScene extends Phaser.Scene {
    private gameBoard: GameBoard
    private progressInfo: ProgressInfo
    private lightDrop: Phaser.GameObjects.Particles.ParticleEmitter

    constructor() {
        super('gameplay')
    }

    public create(): void {
        this.cameras.main.setBackgroundColor(0xffffff)
        this.add.image(0, 0, 'background').setOrigin(0)

        this.gameBoard = new GameBoard(this, 60, 260)

        this.progressInfo = new ProgressInfo(this, 75, 60).setScale(0.5)

        this.lightDrop = this.add.particles(0, 0, 'particle', {
            x: { min: 0, max: 800 },
            lifespan: 10000,
            speed: { min: 100, max: 200 },
            scale: { start: 1, end: 1 },
            blendMode: 'ADD',
            quantity: 1,
            frequency: 100,
        })
        this.add.zone(0, 0, 800, 1000).setOrigin(0)
        this.scene.launch('achievement')
    }

    public update(time: number, timeInterval: number): void {
        this.gameBoard.update(time, timeInterval)
    }

    public finish(): void {
        this.lightDrop.setVisible(false)
        this.lightDrop.pause()
        this.cameras.main.alpha = 0.5
        this.gameBoard.finish()
        this.progressInfo.finish()
    }

    public restart(): void {
        this.lightDrop.setVisible(true)
        this.lightDrop.resume()
        this.cameras.main.alpha = 1
        this.gameBoard.restart()
        this.progressInfo.restart()
    }
}
