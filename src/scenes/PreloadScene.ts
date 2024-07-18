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

        this.load.audio('explosion', './assets/audios/explosion.mp3')
        this.load.audio('victory', './assets/audios/victory.mp3')
        this.load.audio('theme', './assets/audios/theme.mp3')

        this.load.pack('preload', './assets/images/pack.json', 'preload')
    }

    public create(): void {
        this.sound.add('explosion')
        this.sound.add('victory')
        this.sound.add('theme')
        
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
