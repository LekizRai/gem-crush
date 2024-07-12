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

    public doDestroyEffect(callback: () => void, x?: number, y?: number): Promise<void> {
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
                        this.destroy()
                    }
                    callback()
                    resolve()
                },
            })
        })
    }

    private addBurstingParticle(): void {
        const emitter = this.scene.add.particles(this.x, this.y, 'particle', {
            lifespan: 200,
            speed: { min: 100, max: 300 },
            scale: { start: 1, end: 1 },
            rotate: {min: 0, max: 360},
            blendMode: 'ADD',
            emitting: false,
        })
        this.parentContainer.add(emitter)
        emitter.explode(20, 0, 0)
    }
}
