import consts from '../consts/consts'
import LeftParticle from '../objects/LeftParticle'
import RightParticle from '../objects/RightParticle'
import GameplayScene from './GameplayScene'

export default class AchievementScene extends Phaser.Scene {
    private milestoneBoard: Phaser.GameObjects.Image
    private achievementWord: Phaser.GameObjects.Text
    private milestoneScore: Phaser.GameObjects.Text

    private leftConfetti: Phaser.GameObjects.Particles.ParticleEmitter
    private rightConfetti: Phaser.GameObjects.Particles.ParticleEmitter

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
            this.onWaiting = true
            this.doConfetti(500)
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

    private doConfetti(delay: number): void {
        this.leftConfetti = this.add.particles(-50, 900, 'leaf-particle', {
            particleClass: LeftParticle,
            delay: delay,
            lifespan: 2000,
            angle: { min: -120, max: -30 },
            speed: { min: 1500, max: 2500 },
            rotate: { min: 0, max: 360 },
            gravityY: 3000,
            gravityX: -3000,
            scale: { start: 0.8, end: 0 },
            emitting: false,
        })
        this.leftConfetti.explode(100)

        this.rightConfetti = this.add.particles(850, 900, 'leaf-particle', {
            particleClass: RightParticle,
            delay: delay,
            lifespan: 2000,
            angle: { min: 210, max: 300 },
            speed: { min: -2500, max: -1500 },
            rotate: { min: 0, max: 360 },
            gravityY: 3000,
            gravityX: 3000,
            scale: { start: 0.8, end: 0 },
            emitting: false,
        })
        this.rightConfetti.explode(100)
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
