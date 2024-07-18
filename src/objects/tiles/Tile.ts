import consts from '../../consts/consts'
import { ImageConstructor } from '../../interfaces/image.interface'

export default class Tile extends Phaser.GameObjects.Image {
    private explosionType: string
    private allowScore: boolean

    constructor(params: ImageConstructor) {
        super(params.scene, params.x, params.y, params.texture, params.frame)
        this.setInteractive()
        this.scene.add.existing(this)
        this.explosionType = consts.MATCH_TYPES[0]
        this.allowScore = false

        this.scene.events.on('prohibitscore', () => {
            this.allowScore = false
        })

        this.scene.events.on('allowscore', () => {
            this.allowScore = true
        })
    }

    public setExplosionType(type: string): void {
        this.explosionType = type
    }

    public getExplostionType(): string {
        return this.explosionType
    }

    public setTileTexture(id: number): void {
        if (id <= 6) {
            this.setTexture(consts.TILE_TYPES[id])
        }
    }

    public addGlow(color: number): void {
        const fx = this.postFX?.addGlow(color, 0, 0)
        this.scene.tweens.add({
            targets: fx,
            outerStrength: 8,
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

    public doDestroyEffect(
        callback: () => void,
        delay: number = 0,
        x?: number,
        y?: number
    ): Promise<void> {
        if (!this.isTweening()) {
            if (this.allowScore) {
                this.scene.events.emit('tiledestroyed', 25)
            }
            if (x && y) {
                return new Promise((resolve) => {
                    this.addBurstingParticle(delay)
                    this.scene.add.tween({
                        targets: this,
                        x: x,
                        y: y,
                        scale: 0,
                        duration: 200,
                        delay: delay,
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
                        onStart: () => {
                            this.scene.sound.play('explosion')
                        },
                    })
                })
            }
            return new Promise((resolve) => {
                this.addBurstingParticle(delay)
                this.scene.add.tween({
                    targets: this,
                    scale: 0,
                    duration: 200,
                    delay: delay,
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
                    onStart: () => {
                        this.scene.sound.play('explosion')
                    },
                })
            })
        }
        return Promise.resolve()
    }

    private addBurstingParticle(delay: number): void {
        const emitter = this.scene.add.particles(this.x, this.y, 'particle', {
            lifespan: 200,
            speed: { min: 200, max: 400 },
            scale: { start: 1, end: 1 },
            rotate: { min: 0, max: 360 },
            blendMode: 'ADD',
            emitting: false,
        })
        this.parentContainer.add(emitter)
        setTimeout(() => {
            emitter.explode(40, 0, 0)
        }, delay)
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
