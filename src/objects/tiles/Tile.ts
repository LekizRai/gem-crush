import consts from '../../consts/consts'
import { ImageConstructor } from '../../interfaces/image.interface'

export default class Tile extends Phaser.GameObjects.Image {
    private explosionType: string

    constructor(params: ImageConstructor) {
        super(params.scene, params.x, params.y, params.texture, params.frame)
        this.setInteractive()
        this.scene.add.existing(this)
        this.explosionType = consts.MATCH_TYPES[0]
    }

    public setExplosionType(type: string): void {
        this.explosionType = type
    }

    public getExplostionType(): string {
        return this.explosionType
    }

    public addGlow(color: number): void {
        const fx = this.postFX?.addGlow(color, 0, 0)
        this.scene.tweens.add({
            targets: fx,
            outerStrength: 8,
            // innerStrength: 8,
            duration: 500,
            yoyo: true,
            loop: -1,
            ease: Phaser.Math.Easing.Sine.InOut,
        })
        this.scene.tweens.add({
            targets: this,
            alpha: 0.8,
            duration: 500,
            yoyo: true,
            loop: -1,
            ease: Phaser.Math.Easing.Sine.InOut,
        })
    }

    public doDestroyEffect(callback: () => void, x?: number, y?: number): Promise<void> {
        if (!this.isTweening()) {
            this.scene.events.emit('tiledestroyed', 25)
            if (x && y) {
                return new Promise((resolve) => {
                    this.addBurstingParticle()
                    this.scene.add.tween({
                        targets: this,
                        x: x,
                        y: y,
                        scale: 0,
                        duration: 100,
                        ease: (k: number) => {
                            return Phaser.Math.Easing.Cubic.In(k)
                        },
                        repeat: 0,
                        onComplete: () => {
                            if (this.active) {
                                this.destroy()
                            }
                            callback()
                            resolve()
                        },
                    })
                })
            }
            return new Promise((resolve) => {
                this.addBurstingParticle()
                this.scene.add.tween({
                    targets: this,
                    scale: 0,
                    duration: 100,
                    ease: (k: number) => {
                        return Phaser.Math.Easing.Cubic.In(k)
                    },
                    repeat: 0,
                    onComplete: () => {
                        if (this.active) {
                            this.setVisible(false)
                            this.destroy()
                        }
                        callback()
                        resolve()
                    },
                })
            })
        }
        return Promise.resolve()
    }

    private addBurstingParticle(): void {
        const emitter = this.scene.add.particles(this.x, this.y, 'particle', {
            lifespan: 200,
            speed: { min: 100, max: 300 },
            scale: { start: 1, end: 1 },
            rotate: { min: 0, max: 360 },
            blendMode: 'ADD',
            emitting: false,
        })
        this.parentContainer.add(emitter)
        emitter.explode(20, 0, 0)
    }

    public isTweening(): boolean {
        const listOfTween = this.scene.tweens.getTweensOf(this)
        for (let i = 0; i < listOfTween.length; i++) {
            if (listOfTween[i].isActive()) {
                return true
            }
        }
        return false
    }
}
