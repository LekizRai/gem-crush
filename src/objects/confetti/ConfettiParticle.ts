class ConfettiParticle extends Phaser.GameObjects.Particles.Particle {
    private drag: number
    private swayPhase: number
    private swayFrequency: number
    private swayAmplitude: number
    private maxVeY: number
    private isDropped: boolean
    private isDown: boolean
 
    constructor(emitter: Phaser.GameObjects.Particles.ParticleEmitter) {
        super(emitter)
        this.drag = 0.99
        this.swayAmplitude = Phaser.Math.Between(5, 7)
        this.swayFrequency = Phaser.Math.FloatBetween(0.01, 0.03)
        this.swayPhase = Phaser.Math.FloatBetween(0, Math.PI * 2)
        this.maxVeY = Number.MAX_VALUE
        this.isDropped = false
        this.isDown = false
    }
 
    update(
        delta: number,
        step: number,
        processors: Phaser.GameObjects.Particles.ParticleProcessor[]
    ): boolean {
        const result = super.update(delta, step, processors)
        const deltaTime = delta / 1000
 
        if (this.maxVeY > this.velocityY) {
            this.maxVeY = this.velocityY
        }
 
        this.swayPhase += this.swayFrequency
        if (Math.abs(this.velocityY) < Math.abs(this.maxVeY) * 0.999) {
            if (!this.isDown) {
                this.velocityY = Phaser.Math.Linear(this.velocityY, 0, deltaTime * 3)
            }
 
            if (this.velocityY > 100 || this.isDown) {
                this.alpha -= deltaTime * 0.2
                this.velocityY = 100
                this.isDown = true
            }
            this.x += Math.sin(this.swayPhase) * this.swayAmplitude * deltaTime
            this.angle += 100 * deltaTime
            this.isDropped = true
        } else if (!this.isDropped) {
            this.angle += 30 * deltaTime
            this.velocityY *= this.drag
        }
        this.velocityX = Phaser.Math.Linear(this.velocityX, 0, deltaTime * 3)
 
        return result
    }
}
 
export default ConfettiParticle