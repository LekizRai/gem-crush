import consts from '../consts/consts'
import ConfettiManager from '../objects/confetti/ConfettiManager'
import GameplayScene from './GameplayScene'

export default class AchievementScene extends Phaser.Scene {
    private milestoneBoard: Phaser.GameObjects.Image
    private achievementWord: Phaser.GameObjects.Text
    private milestoneScore: Phaser.GameObjects.Text

    private leftConfetti: ConfettiManager
    private rightConfetti: ConfettiManager

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
            .image(400, 0, 'progress-achievement')
            .setScale(0.6)
            .setVisible(false)
        this.achievementWord = this.add
            .text(270, 0, 'ACHIEVEMENT', {
                fontFamily: 'garamond',
                fontStyle: 'bold',
                fontSize: 32,
                color: '#efe1bb',
            })
            .setVisible(false)
        this.milestoneScore = this.add
            .text(0, 0, '0', {
                fontFamily: 'garamond',
                fontStyle: 'bold',
                fontSize: 80,
                color: '#efe1bb',
            })
            .setVisible(false)

        this.scene.get('gameplay').events.on('milestoneachieved', (milestoneId: number) => {
            this.sound.play('victory')
            this.onWaiting = true
            setTimeout(() => {
                this.doConfetti()
            }, 500)
            this.dropMilestoneBoard(milestoneId)
            const gameplayScene = this.scene.get('gameplay')
            if (gameplayScene instanceof GameplayScene) {
                gameplayScene.finish()
            }
        })
    }

    public update(time: number, timeInterval: number): void {
        if (this.onWaiting) {
            if (this.waitingTime > 3000) {
                this.waitingTime = 0
                this.onWaiting = false
                this.add.tween({
                    targets: this.milestoneBoard,
                    y: 1400,
                    duration: 1000,
                    ease: Phaser.Math.Easing.Back.InOut,
                })
                this.add.tween({
                    targets: this.achievementWord,
                    y: 1400,
                    duration: 1000,
                    ease: Phaser.Math.Easing.Back.InOut,
                })
                this.add.tween({
                    targets: this.milestoneScore,
                    y: 1400,
                    duration: 1000,
                    ease: Phaser.Math.Easing.Back.InOut,
                    onComplete: () => {
                        this.milestoneBoard.setVisible(false)
                        this.achievementWord.setVisible(false)
                        const gameplayScene = this.scene.get('gameplay')
                        if (gameplayScene instanceof GameplayScene) {
                            gameplayScene.restart()
                        }
                    },
                })
            } else {
                this.waitingTime += timeInterval
            }
        }
    }

    private doConfetti(): void {
        this.leftConfetti = new ConfettiManager(this, -120, -30)
        this.rightConfetti = new ConfettiManager(this, 210, 300)
        this.leftConfetti.burst(-50, 900)
        this.rightConfetti.burst(850, 900)
    }

    private dropMilestoneBoard(milestoneId: number): void {
        this.milestoneBoard.setVisible(true)
        this.achievementWord.setVisible(true)
        this.milestoneScore.setVisible(true)
        this.milestoneScore.setText(String(consts.MILESTONES[milestoneId]))
        this.milestoneScore.setX(400 - this.milestoneScore.displayWidth / 2)
        this.milestoneBoard.setY(-300)
        this.achievementWord.setY(-300)
        this.milestoneScore.setY(-300)

        this.add.tween({
            targets: this.milestoneBoard,
            y: 600,
            duration: 1000,
            ease: Phaser.Math.Easing.Back.InOut,
        })
        this.add.tween({
            targets: this.achievementWord,
            y: 400,
            duration: 1000,
            ease: Phaser.Math.Easing.Back.InOut,
        })
        this.add.tween({
            targets: this.milestoneScore,
            y: 550,
            duration: 1000,
            ease: Phaser.Math.Easing.Back.InOut,
        })
    }
}
