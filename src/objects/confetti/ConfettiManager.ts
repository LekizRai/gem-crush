import ConfettiParticle from './ConfettiParticle'

export default class ConfettiManager {
    private scene: Phaser.Scene
    private emitter: Phaser.GameObjects.Particles.ParticleEmitter

    constructor(scene: Phaser.Scene, minAngle: number, maxAngle: number, isLeft: boolean) {
        this.scene = scene
        this.createEmitter(minAngle, maxAngle, isLeft)
    }

    private createEmitter(minAngle: number, maxAngle: number, isLeft: boolean) {
        let gravityX = 3000
        if (isLeft) gravityX = -gravityX
        const config: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig = {
            lifespan: 3000,
            speed: { min: 1000, max: 3000 },
            angle: { min: minAngle, max: maxAngle },
            accelerationX: gravityX,
            accelerationY: 3000,
            quantity: 50,
            scaleX: { min : 0.5, max: 1 },
            scaleY: { min: 0.5, max: 1 },
            particleClass: ConfettiParticle,
        }

        this.emitter = this.scene.add.particles(0, 0, 'leaf-particle', config)
        this.emitter.setDepth(10)
        this.emitter.stop()
    }

    public burst(x: number, y: number) {
        this.emitter.setPosition(x, y)
        this.emitter.explode()
    }
}
