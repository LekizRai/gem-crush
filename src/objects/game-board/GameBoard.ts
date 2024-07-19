import consts from '../../consts/consts'
import utils from './boardUtils'
import Tile from '../tiles/Tile'
import TileFactory from '../tiles/TileFactory'
import MatchType from '../matches/MatchType'

type Shape = Phaser.Geom.Triangle | Phaser.Geom.Circle | Phaser.Geom.Rectangle

export default class GameBoard extends Phaser.GameObjects.Container {
    private groundGrid: Phaser.GameObjects.Image[][]
    private tileGrid: Tile[][]
    private haveTile: boolean[][]
    private tilePosition: { x: number; y: number }[][]

    private tileFactory: TileFactory

    private firstSelectedTile: Tile | undefined
    private secondSelectedTile: Tile | undefined

    private onSwapping: boolean = false
    private emptiesInColumn: number[] = []

    private secondSwapping: boolean = false

    private idlingTime: number = 0

    private firstSelectionFrame: Phaser.GameObjects.Image
    private secondSelectionFrame: Phaser.GameObjects.Image

    private haveSpecialTile: boolean

    private isDown: boolean

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y)
        scene.add.existing(this)

        this.scene.input.on('gameobjectdown', this.down, this)
        this.scene.input.on('pointerup', this.up, this)
        this.scene.input.on('gameobjectover', this.over, this)
        this.scene.input.on('gameobjectout', this.out, this)

        this.tileFactory = new TileFactory(scene)

        this.groundGrid = []
        this.tileGrid = []
        this.haveTile = []
        this.tilePosition = []
        for (let i = 0; i < consts.GRID_HEIGHT; i++) {
            this.groundGrid[i] = []
            this.tileGrid[i] = []
            this.haveTile[i] = []
            this.tilePosition[i] = []
            for (let j = 0; j < consts.GRID_WIDTH; j++) {
                this.groundGrid[i][j] = this.scene.add.image(utils.j2x(j), utils.i2y(i), 'ground')
                this.add(this.groundGrid[i][j])
            }
        }

        for (let i = 0; i < consts.GRID_HEIGHT; i++) {
            for (let j = 0; j < consts.GRID_WIDTH; j++) {
                this.tilePosition[i][j] = { x: utils.j2x(j), y: utils.i2y(i) }
                this.tileGrid[i][j] = this.tileFactory.createRandomTile(utils.j2x(j), utils.i2y(i))
                this.haveTile[i][j] = true
                this.add(this.tileGrid[i][j])
            }
        }

        this.haveSpecialTile = false

        this.onSwapping = true
        this.doRandomShuffle()

        this.firstSelectionFrame = this.scene.add.image(0, 0, 'selection').setVisible(false)
        this.secondSelectionFrame = this.scene.add.image(0, 0, 'selection').setVisible(false)
        this.add(this.firstSelectionFrame)
        this.add(this.secondSelectionFrame)

        this.scene.add.tween({
            targets: this.firstSelectionFrame,
            scale: 0.9,
            yoyo: true,
            duration: 200,
            ease: Phaser.Math.Easing.Cubic.In,
            repeat: -1,
            persist: true,
        })

        this.scene.add.tween({
            targets: this.secondSelectionFrame,
            scale: 0.9,
            yoyo: true,
            duration: 200,
            ease: Phaser.Math.Easing.Cubic.In,
            repeat: -1,
            persist: true,
        })

        for (let i: number = 0; i < 8; i++) {
            this.emptiesInColumn.push(0)
        }

        this.isDown = false
    }

    public finish(): void {
        for (let i = 0; i < consts.GRID_HEIGHT; i++) {
            for (let j = 0; j < consts.GRID_WIDTH; j++) {
                this.scene.tweens.killTweensOf(this.tileGrid[i][j])
                this.tileGrid[i][j].setScale(1)
                this.scene.add.tween({
                    targets: this.tileGrid[i][j],
                    x: 346,
                    y: 346,
                    delay: (i * 8 + j) * 20,
                    duration: 500,
                    onComplete: () => {
                        this.tileGrid[i][j].destroy()
                        this.haveTile[i][j] = false
                    },
                })
            }
        }
    }

    public restart(): void {
        this.onSwapping = true
        this.scene.events.emit('prohibitscore')
        for (let i = 0; i < consts.GRID_HEIGHT; i++) {
            for (let j = 0; j < consts.GRID_WIDTH; j++) {
                this.tilePosition[i][j] = { x: utils.j2x(j), y: utils.i2y(i) }
                this.tileGrid[i][j] = this.tileFactory.createRandomTile(utils.j2x(j), utils.i2y(i))
                this.haveTile[i][j] = true
                this.add(this.tileGrid[i][j])
            }
        }
        this.doRandomShuffle()
    }

    private reset(): void {
        this.idlingTime = 0
        this.firstSelectionFrame.setVisible(false)
        this.secondSelectionFrame.setVisible(false)
        for (let i = 0; i < this.tileGrid.length; i++) {
            for (let j = 0; j < this.tileGrid[i].length; j++) {
                this.scene.tweens.killTweensOf(this.tileGrid[i][j])
                this.tileGrid[i][j].setScale(1)
                this.tileGrid[i][j].setX(this.tilePosition[i][j].x)
                this.tileGrid[i][j].setY(this.tilePosition[i][j].y)
            }
        }
    }

    private async down(pointer: Phaser.Input.Pointer, tile: Tile): Promise<void> {
        this.isDown = true
        if (!this.onSwapping) {
            this.reset()
            if (!this.firstSelectedTile) {
                this.firstSelectionFrame.setVisible(true)
                this.firstSelectionFrame.setPosition(tile.x, tile.y)
                this.firstSelectedTile = tile
            } else {
                if (this.firstSelectedTile != tile) {
                    this.firstSelectionFrame.setVisible(false)
                    this.secondSelectedTile = tile

                    const dx = Math.floor(
                        Math.abs(this.firstSelectedTile.x - this.secondSelectedTile.x) /
                            consts.TILE_WIDTH
                    )
                    const dy = Math.floor(
                        Math.abs(this.firstSelectedTile.y - this.secondSelectedTile.y) /
                            consts.TILE_HEIGHT
                    )
                    if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
                        this.onSwapping = true
                        await this.swapTiles()
                        this.firstSelectedTile = undefined
                    } else {
                        this.firstSelectionFrame.setVisible(true)
                        this.firstSelectionFrame.setPosition(tile.x, tile.y)
                        this.firstSelectedTile = tile
                    }
                } else {
                    this.firstSelectionFrame.setVisible(false)
                    this.firstSelectedTile = undefined
                }
            }
        }
    }

    private up(pointer: Phaser.Input.Pointer): void {
        this.isDown = false
    }

    private async over(pointer: Phaser.Input.Pointer, tile: Tile): Promise<void> {
        if (!this.onSwapping) {
            if (this.isDown) {
                if (this.firstSelectedTile) {
                    if (this.firstSelectedTile != tile) {
                        this.firstSelectionFrame.setVisible(false)
                        this.secondSelectedTile = tile

                        const dx = Math.floor(
                            Math.abs(this.firstSelectedTile.x - this.secondSelectedTile.x) /
                                consts.TILE_WIDTH
                        )
                        const dy = Math.floor(
                            Math.abs(this.firstSelectedTile.y - this.secondSelectedTile.y) /
                                consts.TILE_HEIGHT
                        )
                        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
                            this.onSwapping = true
                            await this.swapTiles()
                            this.firstSelectedTile = undefined
                        } else {
                            this.firstSelectionFrame.setVisible(true)
                            this.firstSelectionFrame.setPosition(tile.x, tile.y)
                            this.firstSelectedTile = tile
                        }
                    } else {
                        this.firstSelectionFrame.setVisible(true)
                        this.firstSelectionFrame.setPosition(tile.x, tile.y)
                        this.firstSelectedTile = tile
                    }
                }
            } else if (tile != this.firstSelectedTile) {
                this.scene.add.tween({
                    targets: tile,
                    scale: 1.2,
                    duration: 100,
                    repeat: 0,
                })
            }
        }
    }

    private out(pointer: Phaser.Input.Pointer, tile: Tile): void {
        if (!this.onSwapping) {
            this.scene.add.tween({
                targets: tile,
                scale: 1,
                duration: 100,
                repeat: 0,
            })
        }
    }

    private async doSwapTiles(): Promise<void> {
        let promises: Promise<void>[] = []
        promises.push(
            new Promise((resolve) => {
                this.scene.add.tween({
                    targets: this.firstSelectedTile,
                    x: this.secondSelectedTile?.x,
                    y: this.secondSelectedTile?.y,
                    duration: 200,
                    ease: Phaser.Math.Easing.Cubic.InOut,
                    repeat: 0,
                    yoyo: false,
                    onComplete: () => {
                        resolve()
                    },
                })
            })
        )

        promises.push(
            new Promise((resolve) => {
                this.scene.add.tween({
                    targets: this.secondSelectedTile,
                    x: this.firstSelectedTile?.x,
                    y: this.firstSelectedTile?.y,
                    duration: 200,
                    ease: Phaser.Math.Easing.Cubic.InOut,
                    repeat: 0,
                    yoyo: false,
                    onComplete: () => {
                        resolve()
                    },
                })
            })
        )
        await Promise.all(promises)
    }

    private async swapTiles(): Promise<void> {
        if (this.firstSelectedTile && this.secondSelectedTile) {
            const firstTilePosition = {
                x: this.firstSelectedTile.x,
                y: this.firstSelectedTile.y,
            }

            const secondTilePosition = {
                x: this.secondSelectedTile.x,
                y: this.secondSelectedTile.y,
            }

            if (this.firstSelectedTile.getExplostionType() == consts.MATCH_TYPES[4]) {
                this.haveSpecialTile = true
            }
            if (this.secondSelectedTile.getExplostionType() == consts.MATCH_TYPES[4]) {
                this.haveSpecialTile = true
            }

            this.tileGrid[utils.y2i(firstTilePosition.y)][utils.x2j(firstTilePosition.x)] =
                this.secondSelectedTile
            this.tileGrid[utils.y2i(secondTilePosition.y)][utils.x2j(secondTilePosition.x)] =
                this.firstSelectedTile

            await this.doSwapTiles()

            if (!this.secondSwapping) {
                await this.checkMatches()
            } else {
                this.secondSwapping = false
            }

            this.firstSelectedTile =
                this.tileGrid[utils.y2i(firstTilePosition.y)][utils.x2j(firstTilePosition.x)]
            this.secondSelectedTile =
                this.tileGrid[utils.y2i(secondTilePosition.y)][utils.x2j(secondTilePosition.x)]
        } else {
            this.secondSwapping = false
        }
    }

    private async checkMatches(): Promise<void> {
        this.reset()
        const matchTypes = this.getMatches(this.tileGrid)

        if (matchTypes.length > 0 || this.haveSpecialTile) {
            this.haveSpecialTile = false
            await this.removeTile(matchTypes)
            await this.refillTile()
            await this.tileUp()
            await this.checkMatches()
        } else {
            this.secondSwapping = true
            await this.swapTiles()
            await this.tileUp()
            this.scene.events.emit('allowscore')
            this.onSwapping = false
        }
    }

    private async refillTile(): Promise<void> {
        this.idlingTime = 0
        let promises: Promise<void>[] = []

        for (let i: number = 0; i < 8; i++) {
            this.emptiesInColumn[i] = 0
        }

        for (let y = this.tileGrid.length - 1; y >= 0; y--) {
            for (let x = 0; x < this.tileGrid[y].length; x++) {
                if (this.haveTile[y][x]) {
                    if (this.emptiesInColumn[x] > 0) {
                        promises.push(
                            this.moveWithTweenTo(
                                this.tileGrid[y][x],
                                y + this.emptiesInColumn[x],
                                x
                            )
                        )
                        this.tileGrid[y + this.emptiesInColumn[x]][x] = this.tileGrid[y][x]
                        this.haveTile[y + this.emptiesInColumn[x]][x] = true
                        this.haveTile[y][x] = false
                    }
                } else {
                    this.emptiesInColumn[x] += 1
                }
            }
        }

        for (let y = this.tileGrid.length - 1; y >= 0; y--) {
            for (let x = 0; x < this.tileGrid[y].length; x++) {
                if (!this.haveTile[y][x]) {
                    if (this.emptiesInColumn[x] > 0) {
                        const tile = this.tileFactory.createRandomTile(
                            utils.j2x(x),
                            utils.i2y(y - this.emptiesInColumn[x])
                        )
                        this.add(tile)
                        promises.push(this.moveWithTweenTo(tile, y, x))
                        this.tileGrid[y][x] = tile
                        this.haveTile[y][x] = true
                    }
                }
            }
        }
        await Promise.all(promises)
    }

    private async tileUp(): Promise<void> {
        this.idlingTime = 0
        this.firstSelectedTile = undefined
        this.secondSelectedTile = undefined
    }

    private moveWithTweenTo(target: Tile, i: number, j: number): Promise<void> {
        return new Promise((resolve) => {
            this.scene.add.tween({
                targets: target,
                y: utils.i2y(i),
                ease: Phaser.Math.Easing.Quadratic.Out,
                duration: (1000 * this.emptiesInColumn[j]) / 8,
                repeat: 0,
                yoyo: false,
                onComplete: () => {
                    resolve()
                },
            })
        })
    }

    private async removeTile(matchTypes: MatchType[]): Promise<void> {
        let promises: Promise<void>[] = []
        if (this.firstSelectedTile && this.secondSelectedTile) {
            if (this.firstSelectedTile.texture) {
                this.haveSpecialTile = false
                this.doMatchFiveExplosion(promises, this.firstSelectedTile)
            }
            if (this.secondSelectedTile.getExplostionType() == consts.MATCH_TYPES[4]) {
                this.haveSpecialTile = false
                this.doMatchFiveExplosion(promises, this.secondSelectedTile)
            }
        }

        for (let i = 0; i < matchTypes.length; i++) {
            switch (matchTypes[i].getMatchType()) {
                // Case explosion 0 - 3 tiles
                case consts.MATCH_TYPES[0]: {
                    matchTypes[i].getTileList().forEach((tile: Tile) => {
                        if (tile.getExplostionType() != consts.MATCH_TYPES[0]) {
                            this.doExplosion(promises, tile)
                        }
                    })
                    matchTypes[i].getTileList().forEach((tile: Tile) => {
                        promises.push(
                            tile.doDestroyEffect(() => {
                                this.haveTile[utils.y2i(tile.y)][utils.x2j(tile.x)] = false
                            })
                        )
                    })
                    break
                }

                // Case explosion 1 - 4 horizontal tiles
                case consts.MATCH_TYPES[1]: {
                    const mergedIntoTile: Tile = matchTypes[i].getMergedIntoTile()
                    matchTypes[i].getTileList().forEach((tile: Tile) => {
                        const tileI = utils.y2i(tile.y)
                        const tileJ = utils.x2j(tile.x)
                        if (tile != mergedIntoTile) {
                            promises.push(
                                tile.doDestroyEffect(
                                    () => {
                                        this.haveTile[tileI][tileJ] = false
                                    },
                                    0,
                                    mergedIntoTile.x,
                                    mergedIntoTile.y
                                )
                            )
                        } else {
                            mergedIntoTile.setExplosionType(matchTypes[i].getMatchType())
                            mergedIntoTile.addGlow(0xffffff)
                        }
                    })
                    break
                }

                // Case explosion 2 - 4 vertical tiles
                case consts.MATCH_TYPES[2]: {
                    const mergedIntoTile: Tile = matchTypes[i].getMergedIntoTile()
                    matchTypes[i].getTileList().forEach((tile: Tile) => {
                        const tileI = utils.y2i(tile.y)
                        const tileJ = utils.x2j(tile.x)
                        if (tile != mergedIntoTile) {
                            promises.push(
                                tile.doDestroyEffect(
                                    () => {
                                        this.haveTile[tileI][tileJ] = false
                                    },
                                    0,
                                    mergedIntoTile.x,
                                    mergedIntoTile.y
                                )
                            )
                        } else {
                            mergedIntoTile.setExplosionType(matchTypes[i].getMatchType())
                            mergedIntoTile.addGlow(0xffffff)
                        }
                    })
                    break
                }

                // Case explosion 3 - 5 straight tiles
                case consts.MATCH_TYPES[3]: {
                    const mergedIntoTile: Tile = matchTypes[i].getMergedIntoTile()
                    matchTypes[i].getTileList().forEach((tile: Tile) => {
                        const tileI = utils.y2i(tile.y)
                        const tileJ = utils.x2j(tile.x)
                        if (tile != mergedIntoTile) {
                            promises.push(
                                tile.doDestroyEffect(
                                    () => {
                                        this.haveTile[tileI][tileJ] = false
                                    },
                                    0,
                                    mergedIntoTile.x,
                                    mergedIntoTile.y
                                )
                            )
                        } else {
                            mergedIntoTile.setExplosionType(matchTypes[i].getMatchType())
                            mergedIntoTile.addGlow(0xff0000)
                        }
                    })
                    break
                }

                // Case explosion 4 - 5 special tiles
                case consts.MATCH_TYPES[4]: {
                    const mergedIntoTile: Tile = matchTypes[i].getMergedIntoTile()
                    mergedIntoTile.setTileTexture(6)
                    matchTypes[i].getTileList().forEach((tile: Tile) => {
                        const tileI = utils.y2i(tile.y)
                        const tileJ = utils.x2j(tile.x)
                        if (tile != mergedIntoTile) {
                            promises.push(
                                tile.doDestroyEffect(
                                    () => {
                                        this.haveTile[tileI][tileJ] = false
                                    },
                                    0,
                                    mergedIntoTile.x,
                                    mergedIntoTile.y
                                )
                            )
                        } else {
                            mergedIntoTile.setExplosionType(matchTypes[i].getMatchType())
                            mergedIntoTile.addGlow(0xffffff)
                        }
                    })
                    break
                }
            }
        }

        await Promise.all(promises)
    }

    private doRandomShuffle(): void {
        this.idlingTime = 0
        let count = 64
        let tileList: Tile[] = []
        for (let i = 0; i < this.tileGrid.length; i++) {
            for (let j = 0; j < this.tileGrid[0].length; j++) {
                tileList.push(this.tileGrid[i][j])
            }
        }
        tileList = utils.shuffle(tileList)

        const shapeType = Phaser.Math.RND.between(1, 3)
        let shape: Shape
        let step: number = 0
        let previousTime: number = window.performance.now()
        if (shapeType == 1) {
            shape = new Phaser.Geom.Triangle(346, 150, 100, 520, 592, 520)
        } else if (shapeType == 2) {
            shape = new Phaser.Geom.Circle(346, 346, 246)
        } else {
            shape = new Phaser.Geom.Rectangle(121, 121, 450, 450)
        }
        this.placeOnShape(tileList, shape)

        this.scene.tweens.add({
            targets: shape,
            scale: 1,
            ease: 'Quintic.easeInOut',
            duration: 2000,
            onUpdate: () => {
                const currentTime = window.performance.now()
                const timeInterval = currentTime - previousTime
                previousTime = currentTime

                if (step + timeInterval > 15) {
                    step = 0
                    const firstTile = tileList.shift()
                    if (firstTile) {
                        tileList.push(firstTile)
                        this.placeOnShape(tileList, shape)
                    }
                } else {
                    step += timeInterval
                }
            },
            onComplete: () => {
                for (let i = 0; i < this.tileGrid.length; i++) {
                    for (let j = 0; j < this.tileGrid[0].length; j++) {
                        this.tileGrid[i][j] = tileList[i * this.tileGrid.length + j]
                        this.scene.add.tween({
                            targets: tileList[i * this.tileGrid.length + j],
                            x: this.tilePosition[i][j].x,
                            y: this.tilePosition[i][j].y,
                            duration: 700,
                            delay: 200,
                            onComplete: () => {
                                count--
                                if (count == 0) {
                                    this.checkMatches()
                                }
                            },
                        })
                    }
                }
            },
        })
    }

    private placeOnShape(tileList: Tile[], shape: Shape): void {
        if (shape instanceof Phaser.Geom.Triangle) {
            Phaser.Actions.PlaceOnTriangle(tileList, shape)
        } else if (shape instanceof Phaser.Geom.Circle) {
            Phaser.Actions.PlaceOnCircle(tileList, shape)
        } else if (shape instanceof Phaser.Geom.Rectangle) {
            Phaser.Actions.PlaceOnRectangle(tileList, shape)
        }
    }

    private getMatches(tileGrid: Tile[][]): MatchType[] {
        this.idlingTime = 0
        const matchTypes: MatchType[] = []

        const matches: Tile[][] = []
        let haveChecked: boolean[] = []
        let checkedTileList: Tile[] = []

        let groups: Tile[] = []

        for (let i = 0; i < tileGrid.length; i++) {
            groups = []
            for (let j = 0; j < tileGrid[i].length; j++) {
                if (j < tileGrid[i].length - 2) {
                    if (tileGrid[i][j] && tileGrid[i][j + 1] && tileGrid[i][j + 2]) {
                        if (
                            tileGrid[i][j].texture.key === tileGrid[i][j + 1].texture.key &&
                            tileGrid[i][j + 1].texture.key === tileGrid[i][j + 2].texture.key
                        ) {
                            if (groups.length > 0) {
                                if (groups.indexOf(tileGrid[i][j]) == -1) {
                                    matches.push(groups)
                                    haveChecked.push(false)
                                    groups = []
                                }
                            }

                            if (groups.indexOf(tileGrid[i][j]) == -1) {
                                groups.push(tileGrid[i][j])
                            }

                            if (groups.indexOf(tileGrid[i][j + 1]) == -1) {
                                groups.push(tileGrid[i][j + 1])
                            }

                            if (groups.indexOf(tileGrid[i][j + 2]) == -1) {
                                groups.push(tileGrid[i][j + 2])
                            }
                        }
                    }
                }
            }
            if (groups.length > 0) {
                matches.push(groups)
                haveChecked.push(false)
            }
        }

        for (let j = 0; j < tileGrid[0].length; j++) {
            groups = []
            for (let i = 0; i < tileGrid.length; i++) {
                if (i < tileGrid.length - 2)
                    if (tileGrid[i][j] && tileGrid[i + 1][j] && tileGrid[i + 2][j]) {
                        if (
                            tileGrid[i][j].texture.key === tileGrid[i + 1][j].texture.key &&
                            tileGrid[i + 1][j].texture.key === tileGrid[i + 2][j].texture.key
                        ) {
                            if (groups.length > 0) {
                                if (groups.indexOf(tileGrid[i][j]) == -1) {
                                    matches.push(groups)
                                    haveChecked.push(false)
                                    groups = []
                                }
                            }

                            if (groups.indexOf(tileGrid[i][j]) == -1) {
                                groups.push(tileGrid[i][j])
                            }
                            if (groups.indexOf(tileGrid[i + 1][j]) == -1) {
                                groups.push(tileGrid[i + 1][j])
                            }
                            if (groups.indexOf(tileGrid[i + 2][j]) == -1) {
                                groups.push(tileGrid[i + 2][j])
                            }
                        }
                    }
            }
            if (groups.length > 0) {
                matches.push(groups)
                haveChecked.push(false)
            }
        }

        // Check for special 5 matching shape
        for (let i = 0; i < matches.length - 1; i++) {
            if (haveChecked[i]) continue
            const firstMatch = utils.difference(matches[i], checkedTileList)
            if (firstMatch.length < 3) continue
            for (let j = i + 1; j < matches.length; j++) {
                if (haveChecked[j]) continue
                const secondMatch = utils.difference(matches[j], checkedTileList)
                if (secondMatch.length < 3) continue
                const intersectMatch = utils.intersect(firstMatch, secondMatch)
                const unionMatch = utils.union(firstMatch, secondMatch)
                if (intersectMatch.length > 0) {
                    haveChecked[i] = true
                    haveChecked[j] = true
                    if (this.firstSelectedTile && unionMatch.indexOf(this.firstSelectedTile) > -1) {
                        matchTypes.push(new MatchType(unionMatch, this.firstSelectedTile))
                    } else if (
                        this.secondSelectedTile &&
                        unionMatch.indexOf(this.secondSelectedTile) > -1
                    ) {
                        matchTypes.push(new MatchType(unionMatch, this.secondSelectedTile))
                    } else {
                        matchTypes.push(new MatchType(unionMatch, intersectMatch[0]))
                    }
                    unionMatch.forEach((tile: Tile) => {
                        checkedTileList.push(tile)
                    })
                    break
                }
            }
        }

        for (let i = 0; i < matches.length; i++) {
            if (haveChecked[i]) continue
            const match = utils.difference(matches[i], checkedTileList)
            if (match.length < 3) continue
            if (this.firstSelectedTile && match.indexOf(this.firstSelectedTile) > -1) {
                matchTypes.push(new MatchType(match, this.firstSelectedTile))
            } else if (this.secondSelectedTile && match.indexOf(this.secondSelectedTile) > -1) {
                matchTypes.push(new MatchType(match, this.secondSelectedTile))
            } else {
                const len: number = match.length
                matchTypes.push(new MatchType(match, match[Math.floor(len / 2)]))
            }
            match.forEach((tile: Tile) => {
                checkedTileList.push(tile)
            })
        }

        return matchTypes
    }

    public displayHint(): boolean {
        let flag: boolean = false
        for (let i = 0; i < this.tileGrid.length; i++) {
            for (let j = 0; j < this.tileGrid[0].length; j++) {
                if (this.doHintSwap(i, j, i + 1, j)) {
                    this.firstSelectionFrame.setPosition(utils.j2x(j), utils.i2y(i))
                    this.secondSelectionFrame.setPosition(utils.j2x(j), utils.i2y(i + 1))
                    this.firstSelectionFrame.setVisible(true)
                    this.secondSelectionFrame.setVisible(true)
                    flag = true
                    break
                } else if (this.doHintSwap(i, j, i - 1, j)) {
                    this.firstSelectionFrame.setPosition(utils.j2x(j), utils.i2y(i))
                    this.secondSelectionFrame.setPosition(utils.j2x(j), utils.i2y(i - 1))
                    this.firstSelectionFrame.setVisible(true)
                    this.secondSelectionFrame.setVisible(true)
                    flag = true
                    break
                } else if (this.doHintSwap(i, j, i, j + 1)) {
                    this.firstSelectionFrame.setPosition(utils.j2x(j), utils.i2y(i))
                    this.secondSelectionFrame.setPosition(utils.j2x(j + 1), utils.i2y(i))
                    this.firstSelectionFrame.setVisible(true)
                    this.secondSelectionFrame.setVisible(true)
                    flag = true
                    break
                } else if (this.doHintSwap(i, j, i, j - 1)) {
                    this.firstSelectionFrame.setPosition(utils.j2x(j), utils.i2y(i))
                    this.secondSelectionFrame.setPosition(utils.j2x(j - 1), utils.i2y(i))
                    this.firstSelectionFrame.setVisible(true)
                    this.secondSelectionFrame.setVisible(true)
                    flag = true
                    break
                }
            }
            if (flag) break
        }
        return flag
    }

    public doHintSwap(x1: number, y1: number, x2: number, y2: number) {
        if (x2 < 0 || x2 >= this.tileGrid.length) return false
        if (y2 < 0 || y2 >= this.tileGrid[0].length) return false
        let tile = this.tileGrid[x1][y1]
        this.tileGrid[x1][y1] = this.tileGrid[x2][y2]
        this.tileGrid[x2][y2] = tile

        let returnedStatus = this.haveMatch()

        tile = this.tileGrid[x2][y2]
        this.tileGrid[x2][y2] = this.tileGrid[x1][y1]
        this.tileGrid[x1][y1] = tile

        return returnedStatus
    }

    private haveMatch(): boolean {
        for (let i = 0; i < this.tileGrid.length; i++) {
            for (let j = 0; j < this.tileGrid[i].length; j++) {
                if (j < this.tileGrid[i].length - 2) {
                    if (this.tileGrid[i][j] && this.tileGrid[i][j + 1] && this.tileGrid[i][j + 2]) {
                        if (
                            this.tileGrid[i][j].texture.key ===
                                this.tileGrid[i][j + 1].texture.key &&
                            this.tileGrid[i][j + 1].texture.key ===
                                this.tileGrid[i][j + 2].texture.key
                        ) {
                            return true
                        }
                    }
                }
            }
        }

        for (let j = 0; j < this.tileGrid[0].length; j++) {
            for (let i = 0; i < this.tileGrid.length; i++) {
                if (i < this.tileGrid.length - 2)
                    if (this.tileGrid[i][j] && this.tileGrid[i + 1][j] && this.tileGrid[i + 2][j]) {
                        if (
                            this.tileGrid[i][j].texture.key ===
                                this.tileGrid[i + 1][j].texture.key &&
                            this.tileGrid[i + 1][j].texture.key ===
                                this.tileGrid[i + 2][j].texture.key
                        ) {
                            return true
                        }
                    }
            }
        }
        return false
    }

    private doIdling(): void {
        const idlingStyle = Phaser.Math.RND.between(1, 2)
        for (let i = 0; i < consts.GRID_WIDTH; i++) {
            for (let j = 0; j < consts.GRID_HEIGHT; j++) {
                this.scene.add.tween({
                    targets: this.groundGrid[i][j],
                    y: this.groundGrid[i][j].y + 10,
                    alpha: 0.2,
                    duration: 200,
                    delay: idlingStyle == 1 ? (i + j) * 100 : j * 150,
                    yoyo: true,
                    repeat: 0,
                    onComplete: () => {
                        this.idlingTime = 0
                    },
                })
            }
        }
    }

    public update(time: number, timeInterval: number) {
        if (this.idlingTime > 5000) {
            this.idlingTime = 0
            if (!this.displayHint()) {
                this.restart()
            } else {
                this.doIdling()
            }
        } else {
            this.idlingTime += timeInterval
        }
    }

    private doExplosion(promises: Promise<void>[], tile: Tile): void {
        this.idlingTime = 0
        if (
            tile.getExplostionType() == consts.MATCH_TYPES[1] ||
            tile.getExplostionType() == consts.MATCH_TYPES[2]
        ) {
            this.doMatchFourExplosion(promises, tile)
        } else {
            this.doMatchFiveExplosion(promises, tile)
        }
    }

    private doMatchFourExplosion(promises: Promise<void>[], tile: Tile): void {
        this.idlingTime = 0
        const tileI = utils.y2i(tile.y)
        const tileJ = utils.x2j(tile.x)

        // Do horizontal explosion
        if (tile.getExplostionType() == consts.MATCH_TYPES[1]) {
            for (let j = 0; j < consts.GRID_WIDTH; j++) {
                promises.push(
                    this.tileGrid[tileI][j].doDestroyEffect(() => {
                        this.haveTile[tileI][j] = false
                    }, utils.explostionDelay(tile, this.tileGrid[tileI][j]))
                )
            }
        } // Do vertical explosion
        else if (tile.getExplostionType() == consts.MATCH_TYPES[2]) {
            for (let i = 0; i < consts.GRID_HEIGHT; i++) {
                promises.push(
                    this.tileGrid[i][tileJ].doDestroyEffect(() => {
                        this.haveTile[i][tileJ] = false
                    }, utils.explostionDelay(tile, this.tileGrid[i][tileJ]))
                )
            }
        }
    }

    private doMatchFiveExplosion(promises: Promise<void>[], tile: Tile): void {
        this.idlingTime = 0
        const tileI = utils.y2i(tile.y)
        const tileJ = utils.x2j(tile.x)

        // Do same tiles explosion
        if (tile.getExplostionType() == consts.MATCH_TYPES[3]) {
            for (let i = 0; i < consts.GRID_HEIGHT; i++) {
                for (let j = 0; j < consts.GRID_WIDTH; j++) {
                    if (this.tileGrid[i][j].texture == tile.texture) {
                        promises.push(
                            this.tileGrid[i][j].doDestroyEffect(() => {
                                this.haveTile[i][j] = false
                            })
                        )
                    }
                }
            }
        } // Do 3x3 explosion
        else if (tile.getExplostionType() == consts.MATCH_TYPES[4]) {
            for (let i = tileI - 1; i <= tileI + 1; i++) {
                for (let j = tileJ - 1; j <= tileJ + 1; j++) {
                    if (i >= 0 && i < consts.GRID_WIDTH && j >= 0 && j < consts.GRID_WIDTH) {
                        promises.push(
                            this.tileGrid[i][j].doDestroyEffect(() => {
                                this.haveTile[i][j] = false
                            })
                        )
                    }
                }
            }
        }
    }
}
