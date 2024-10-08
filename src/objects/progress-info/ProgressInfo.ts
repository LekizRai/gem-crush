import consts from '../../consts/consts'

export default class ProgressBar extends Phaser.GameObjects.Container {
    private progressFrame: Phaser.GameObjects.Image
    private progressBody: Phaser.GameObjects.Image
    private progressHead: Phaser.GameObjects.Image
    private progressTail: Phaser.GameObjects.Image
    private progressParticleEmitter: Phaser.GameObjects.Particles.ParticleEmitter
    private progressScoreFrame: Phaser.GameObjects.Image
    private progressScore: Phaser.GameObjects.Text

    private milestoneBoard: Phaser.GameObjects.Image
    private milestoneWord: Phaser.GameObjects.Text
    private milestoneScore: Phaser.GameObjects.Text

    private currentScore: number
    private currentMilestoneId: number

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y)
        scene.add.existing(this)

        this.currentScore = 0
        this.currentMilestoneId = 0

        this.initProgressBar()
        this.initMilestoneBoard()

        this.add(this.progressFrame)
        this.add(this.progressHead)
        this.add(this.progressTail)
        this.add(this.progressBody)
        this.add(this.progressScoreFrame)
        this.add(this.progressScore)
        this.add(this.milestoneBoard)
        this.add(this.milestoneWord)
        this.add(this.milestoneScore)
    }

    private initProgressBar(): void {
        this.scene.events.on('tiledestroyed', (value: number) => {
            let isDone: boolean = false
            if (this.currentScore + value >= consts.MILESTONES[this.currentMilestoneId]) {
                if (this.currentScore != consts.MILESTONES[this.currentMilestoneId]) {
                    isDone = true
                    this.currentScore = consts.MILESTONES[this.currentMilestoneId]
                }
            } else {
                this.currentScore += value
            }
            this.scene.add.tween({
                targets: this.progressBody,
                scaleX: (this.currentScore / consts.MILESTONES[this.currentMilestoneId]) * 2.085,
                duration: 200,
                onUpdate: () => {
                    this.progressTail.setX(15 + this.progressBody.displayWidth)
                    this.setDisplayProgressScore(this.currentScore)
                },
                onComplete: () => {
                    this.setDisplayProgressScore(this.currentScore)
                    if (isDone) {
                        this.scene.events.emit('milestoneachieved', this.currentMilestoneId)
                    }
                },
            })
        })

        this.progressFrame = this.scene.add.image(0, 125, 'progress-frame').setOrigin(0)
        this.progressHead = this.scene.add.image(9, 140, 'progress-head').setOrigin(0)
        this.progressTail = this.scene.add.image(19, 140, 'progress-tail').setOrigin(0)
        this.progressBody = this.scene.add
            .image(16, 140, 'progress-body')
            .setScale(0, 1)
            .setOrigin(0)
        this.progressScoreFrame = this.scene.add.image(100, 220, 'progress-score').setOrigin(0)
        this.progressScore = this.scene.add.text(120, 230, String(this.currentScore), {
            fontFamily: 'garamond',
            fontStyle: 'bold',
            fontSize: 64,
            color: '#efe1bb',
        })
        this.setDisplayProgressScore(this.currentScore)
    }

    private initMilestoneBoard(): void {
        this.milestoneBoard = this.scene.add.image(720, 0, 'progress-milestone').setOrigin(0)
        this.milestoneWord = this.scene.add.text(825, 60, 'MILESTONE', {
            fontFamily: 'garamond',
            fontStyle: 'bold',
            fontSize: 64,
            color: '#efe1bb',
        })

        this.milestoneScore = this.scene.add.text(
            0,
            160,
            String(consts.MILESTONES[this.currentMilestoneId]),
            {
                fontFamily: 'garamond',
                fontStyle: 'bold',
                fontSize: 100,
                color: '#efe1bb',
            }
        )
        this.setDisplayMilestoneScore()
    }

    public finish(): void {
        this.scene.add.tween({
            targets: this.progressBody,
            scaleX: 0,
            duration: 1000,
            onUpdate: () => {
                this.progressTail.setX(15 + this.progressBody.displayWidth)
                this.setDisplayProgressScore(Math.floor((this.scaleX / 2.085) * this.currentScore))
                this.currentScore = Math.floor((this.scaleX / 2.085) * this.currentScore)
            },
            onComplete: () => {
                this.currentScore = 0
                this.setDisplayProgressScore(this.currentScore)
            },
        })
    }

    public restart(): void {
        this.currentMilestoneId += 1
        if (this.currentMilestoneId >= 10) {
            this.currentMilestoneId = 0
        }
        this.setDisplayMilestoneScore()
    }

    private setDisplayProgressScore(score: number): void {
        this.progressScore.setText(String(score))
        this.progressScore.setX(275 - this.progressScore.displayWidth / 2)
    }

    private setDisplayMilestoneScore(): void {
        this.milestoneScore.setText(String(consts.MILESTONES[this.currentMilestoneId]))
        this.milestoneScore.setX(1020 - this.milestoneScore.displayWidth / 2)
    }
}
