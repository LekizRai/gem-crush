export default class ConfettiParticle extends Phaser.GameObjects.Particles.Particle {
    private drag: number
    private speed: number
    private gravity: number
    private swayPhase: number
    private swayFrequency: number
    private swayAmplitude: number
    private rotationSpeed: number
    private verticalSpeed: number

    constructor(emitter: Phaser.GameObjects.Particles.ParticleEmitter) {
        super(emitter)
        this.drag = 0.99
        this.speed = 1000
        this.gravity = 20
        this.swayAmplitude = Phaser.Math.Between(5, 7)
        this.swayFrequency = Phaser.Math.FloatBetween(0.01, 0.03)
        this.rotationSpeed = Phaser.Math.FloatBetween(5, 10)
        this.swayPhase = Phaser.Math.FloatBetween(0, Math.PI * 2)
        this.verticalSpeed = Phaser.Math.FloatBetween(0.2, 0.5)
    }

    public update(
        delta: number,
        step: number,
        processors: Phaser.GameObjects.Particles.ParticleProcessor[]
    ): boolean {
        const result = super.update(delta, step, processors)
        const deltaTime = delta / 1000

        this.velocityX *= this.drag
        this.velocityY *= this.drag
        this.velocityY += this.verticalSpeed

        this.swayPhase += this.swayFrequency
        if (Math.abs(this.velocityX) < 40) {
            this.accelerationX = 0
        }
        if (Math.abs(this.velocityY) < 100) {
            this.velocityY = 100
            this.accelerationY = 0
            this.x += Math.sin(this.swayPhase) * this.swayAmplitude * deltaTime
            this.angle += 150 * deltaTime
            this.alpha = Math.max(this.alpha - 0.7 * deltaTime, 0)
        } else {
            this.angle += 50 * deltaTime
        }

        return result
    }
}
