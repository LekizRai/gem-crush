import GameplayScene from './GameplayScene'

export default class AchievementScene extends Phaser.Scene {
    private milestoneBoard: Phaser.GameObjects.Image
    private achievementWord: Phaser.GameObjects.Text

    private test: Phaser.GameObjects.Particles.ParticleEmitter

    private onWaiting: boolean
    private waitingTime: number

    constructor() {
        super('achievement')
    }

    public preload(): void {}

    public create(): void {
        this.onWaiting = false
        this.waitingTime = 0

        this.milestoneBoard = this.add
            .image(400, 600, 'progress-achievement')
            .setScale(0.6)
            .setVisible(false)
        this.achievementWord = this.add.text(270, 400, 'ACHIEVEMENT', {
            fontFamily: 'garamond',
            fontStyle: 'bold',
            fontSize: 32,
            color: '#efe1bb',
        })
        this.scene.get('gameplay').events.on('milestoneachieved', () => {
            this.onWaiting = true
            this.milestoneBoard.setVisible(true)
            const gameplayScene = this.scene.get('gameplay')
            if (gameplayScene instanceof GameplayScene) {
                gameplayScene.finish()
            }
        })
    }

    public update(time: number, timeInterval: number): void {
        if (this.onWaiting) {
            if (this.waitingTime > 2000) {
                this.waitingTime = 0
                this.onWaiting = false
                this.milestoneBoard.setVisible(false)
                const gameplayScene = this.scene.get('gameplay')
                if (gameplayScene instanceof GameplayScene) {
                    gameplayScene.restart()
                }
            } else {
                this.waitingTime += timeInterval
            }
        }
    }
}
