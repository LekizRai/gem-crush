import GameplayScene from './GameplayScene'

export default class AchievementScene extends Phaser.Scene {
    private milestoneBoard: Phaser.GameObjects.Image

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
            .image(400, 500, 'progress-achievement')
            .setScale(0.8)
            .setVisible(false)
        this.scene.get('gameplay').events.on('milestoneachieved', () => {
            this.onWaiting = true
            this.milestoneBoard.setVisible(true)
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
