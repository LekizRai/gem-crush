import GameBoard from '../objects/game-board/GameBoard'
import MyParticle from '../objects/MyParticle'
import ProgressInfo from '../objects/progress-info/ProgressInfo'
import Tile from '../objects/tiles/Tile'

export default class GameplayScene extends Phaser.Scene {
    private gameBoard: GameBoard
    private progressInfo: ProgressInfo

    private test: Phaser.GameObjects.Particles.ParticleEmitter

    constructor() {
        super('gameplay')
    }

    public create(): void {
        this.add.image(0, 0, 'background').setOrigin(0)

        this.gameBoard = new GameBoard(this, 60, 260)
        this.progressInfo = new ProgressInfo(this, 75, 60).setScale(0.5)
        this.add.zone(0, 0, 800, 1000).setOrigin(0)
        this.scene.launch('achievement')

        this.test = this.add.particles(0, 500, 'particle', {
            particleClass: MyParticle,
            lifespan: 10000,
            angle: { min: -60, max: -30 },
            speed: { min: 1000, max: 2000 },
            rotate: { min: 0, max: 360 },
            gravityY: 3000,
            gravityX: -3000,
            scale: { start: 1, end: 1 },
            emitting: false,
            emitCallback: (particle: Phaser.GameObjects.Particles.Particle) => {
                console.log(particle)
            },
        })
        this.test.explode(30)
    }

    public update(time: number, timeInterval: number): void {
        this.gameBoard.update(time, timeInterval)
    }

    public finish(): void {
        this.gameBoard.finish()
        this.progressInfo.finish()
    }

    public restart(): void {
        this.gameBoard.restart()
        this.progressInfo.restart()
    }
}
