export default class LeftParticle extends Phaser.GameObjects.Particles.Particle {
    constructor(emitter: Phaser.GameObjects.Particles.ParticleEmitter) {
        super(emitter)
    }

    public update(delta: number, step: number, processors: any): any {
        if (this.velocityX <= 0) {
            this.velocityX = 50
            this.velocityY = 50
            this.accelerationX = Phaser.Math.RND.between(-2000, 2000)
            this.accelerationY = Phaser.Math.RND.between(-2000, 2000)
        }

        if (this.lifeCurrent <= 0) {
            if (this.holdCurrent > 0) {
                this.holdCurrent -= delta

                return this.holdCurrent <= 0
            } else {
                return true
            }
        }

        if (this.delayCurrent > 0) {
            this.delayCurrent -= delta

            return false
        }

        this.anims.update(0, delta)

        var emitter = this.emitter
        var ops = emitter.ops

        var t = 1 - this.lifeCurrent / this.life

        this.lifeT = t

        this.x = ops.x.onUpdate(this, 'x', t, this.x)
        this.y = ops.y.onUpdate(this, 'y', t, this.y)

        if (emitter.moveTo) {
            var mx = ops.moveToX.onUpdate(this, 'moveToX', t, emitter.moveToX as number)
            var my = ops.moveToY.onUpdate(this, 'moveToY', t, emitter.moveToY as number)
            var lifeS = this.lifeCurrent / 1000

            this.velocityX = (mx - this.x) / lifeS
            this.velocityY = (my - this.y) / lifeS
        }

        this.computeVelocity(emitter, delta, step, processors, t)

        this.scaleX = ops.scaleX.onUpdate(this, 'scaleX', t, this.scaleX)

        if (ops.scaleY.active) {
            this.scaleY = ops.scaleY.onUpdate(this, 'scaleY', t, this.scaleY)
        } else {
            this.scaleY = this.scaleX
        }

        this.angle = ops.rotate.onUpdate(this, 'rotate', t, this.angle)

        this.rotation = DegToRad(this.angle)

        if (emitter.getDeathZone(this)) {
            this.lifeCurrent = 0
            return true
        }

        this.alpha = Clamp(ops.alpha.onUpdate(this, 'alpha', t, this.alpha), 0, 1)

        if (ops.color.active) {
            this.tint = ops.color.onUpdate(this, 'color', t, this.tint)
        } else {
            this.tint = ops.tint.onUpdate(this, 'tint', t, this.tint)
        }

        this.lifeCurrent -= delta

        return this.lifeCurrent <= 0 && this.holdCurrent <= 0
    }
}

var Clamp = function (value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value))
}

var DegToRad = function (degrees: number) {
    return (degrees / 180) * Math.PI
}
