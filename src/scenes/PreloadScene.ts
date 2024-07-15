export default class PreloadScene extends Phaser.Scene {
    private loadingBar: Phaser.GameObjects.Graphics
    private progressBar: Phaser.GameObjects.Graphics

    constructor() {
        super('preload')
    }

    public preload(): void {
        this.cameras.main.setBackgroundColor(0xffffff)
        this.add.image(0, 0, 'background').setOrigin(0)

        this.createLoadingbar()

        this.load.on(
            'progress',
            (value: number) => {
                this.progressBar.clear()
                this.progressBar.fillStyle(0xfff6d3, 1)
                this.progressBar.fillRect(
                    this.cameras.main.width / 4,
                    this.cameras.main.height / 2 - 16,
                    (this.cameras.main.width / 2) * value,
                    16
                )
            },
            this
        )

        this.load.on(
            'complete',
            () => {
                this.progressBar.destroy()
                this.loadingBar.destroy()
            },
            this
        )

        this.load.pack('preload', './assets/images/gems/pack.json', 'preload')
        this.load.image('ground', './assets/images/grounds/ground.png')
        this.load.image('selection', './assets/images/selection-frames/selection-frame.png')

        this.load.image('particle', './assets/images/particles/particle-1.png')
        this.load.image('smoke-particle', './assets/images/particles/particle-2.png')
        this.load.image('golden-particle', './assets/images/particles/particle-3.png')
        this.load.image('glass-particle', './assets/images/particles/particle-4.png')
        this.load.image('leaf-particle', './assets/images/particles/particle-5.png')

        this.load.image('progress-frame', './assets/images/progress-info/progress-frame.png')
        this.load.image('progress-body', './assets/images/progress-info/progress-body.png')
        this.load.image('progress-head', './assets/images/progress-info/progress-head.png')
        this.load.image('progress-tail', './assets/images/progress-info/progress-tail.png')
        this.load.image(
            'progress-milestone',
            './assets/images/progress-info/progress-milestone.png'
        )
        this.load.image('progress-score', './assets/images/progress-info/progress-score.png')
        this.load.image(
            'progress-achievement',
            './assets/images/progress-info/progress-achievement.png'
        )
    }

    public create(): void {
        this.scene.start('gameplay')
    }

    private createLoadingbar(): void {
        this.loadingBar = this.add.graphics()
        this.loadingBar.fillStyle(0x5dae47, 1)
        this.loadingBar.fillRect(
            this.cameras.main.width / 4 - 2,
            this.cameras.main.height / 2 - 18,
            this.cameras.main.width / 2 + 4,
            20
        )
        this.progressBar = this.add.graphics()
    }
}
