export default class InitScene extends Phaser.Scene {
    constructor() {
        super('init')
    }

    public preload(): void {
        this.load.image('background', './assets/images/backgrounds/background.png')
    }

    public create(): void {
        this.scene.start('preload')
    }
}
