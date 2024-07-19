import ConfettiParticle from './ConfettiParticle'

export default class ConfettiManager {
    private scene: Phaser.Scene
    private emitter: Phaser.GameObjects.Particles.ParticleEmitter

    constructor(scene: Phaser.Scene, minAngle: number, maxAngle: number) {
        this.scene = scene
        this.createEmitter(minAngle, maxAngle)
    }

    private createEmitter(minAngle: number, maxAngle: number) {
        const config: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig = {
            lifespan: 2000,
            speed: { min: 1500, max: 3500 },
            accelerationY: 1000,
            angle: { min: minAngle, max: maxAngle },
            alpha: { start: 1, end: 0 },
            quantity: 40,
            scaleX: { min: 0.5, max: 1 },
            scaleY: { min: 0.5, max: 1 },
            particleClass: ConfettiParticle,
        }

        this.emitter = this.scene.add.particles(0, 0, 'leaf-particle', config)
        this.emitter.setDepth(10)
        this.emitter.setScale(0.8)
        this.emitter.stop()
    }

    public burst(x: number, y: number) {
        this.emitter.setPosition(x, y)
        this.emitter.explode()
    }
}
