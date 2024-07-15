import GameBoard from '../objects/game-board/GameBoard'
import ProgressInfo from '../objects/progress-info/ProgressInfo'

export default class GameplayScene extends Phaser.Scene {
    private gameBoard: GameBoard
    private progressInfo: ProgressInfo

    constructor() {
        super('gameplay')
    }

    public create(): void {
        this.cameras.main.setBackgroundColor(0xffffff)
        this.add.image(0, 0, 'background').setOrigin(0)

        this.gameBoard = new GameBoard(this, 60, 260)

        this.progressInfo = new ProgressInfo(this, 75, 60).setScale(0.5)

        this.add.zone(0, 0, 800, 1000).setOrigin(0)
        this.scene.launch('achievement')
    }

    public update(time: number, timeInterval: number): void {
        this.gameBoard.update(time, timeInterval)
    }

    public finish(): void {
        this.cameras.main.alpha = 0.5
        this.gameBoard.finish()
        this.progressInfo.finish()
    }

    public restart(): void {
        this.cameras.main.alpha = 1
        this.gameBoard.restart()
        this.progressInfo.restart()
    }
}
