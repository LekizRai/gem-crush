import consts from '../../consts/consts'
import utils from './boardUtils'
import Tile from '../tiles/Tile'
import TileFactory from '../tiles/TileFactory'
import MatchType from '../matches/MatchType'

export default class GameBoard extends Phaser.GameObjects.Container {
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

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y)
        scene.add.existing(this)

        this.scene.input.on('gameobjectdown', this.click, this)
        this.scene.input.on('gameobjectover', this.over, this)
        this.scene.input.on('gameobjectout', this.out, this)

        this.tileFactory = new TileFactory(scene)

        this.tileGrid = []
        this.haveTile = []
        this.tilePosition = []
        for (let i = 0; i < consts.GRID_HEIGHT; i++) {
            this.tileGrid[i] = []
            this.haveTile[i] = []
            this.tilePosition[i] = []
            for (let j = 0; j < consts.GRID_WIDTH; j++) {
                const ground = this.scene.add.image(utils.j2x(j), utils.i2y(i), 'ground')
                this.add(ground)
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

        this.randomShuffle()

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
    }

    public restart(): void {
        this.reset()
        this.randomShuffle()
    }

    private reset(): void {
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

    private async click(pointer: Phaser.Input.Pointer, tile: Tile): Promise<void> {
        this.idlingTime = 0
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
                    }
                    this.firstSelectedTile = undefined
                }
            }
        }
    }

    private over(pointer: Phaser.Input.Pointer, tile: Tile): void {
        if (!this.onSwapping) {
            if (tile != this.firstSelectedTile) {
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
                    duration: 100,
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
                    duration: 100,
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
        this.idlingTime = 0
        const matchTypes = this.getMatches(this.tileGrid)

        if (matchTypes.length > 0) {
            await this.removeTile(matchTypes)
            await this.refillTile()
            await this.tileUp()
            await this.checkMatches()
        } else {
            this.secondSwapping = true
            await this.swapTiles()
            this.tileUp()
            this.onSwapping = false
        }
    }

    private async refillTile(): Promise<void> {
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
        this.firstSelectedTile = undefined
        this.secondSelectedTile = undefined
    }

    private moveWithTweenTo(target: Tile, i: number, j: number): Promise<void> {
        return new Promise((resolve) => {
            this.scene.add.tween({
                targets: target,
                y: utils.i2y(i),
                ease: (k: number) => {
                    return Phaser.Math.Easing.Cubic.In(k)
                },
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
        for (let i = 0; i < matchTypes.length; i++) {
            switch (matchTypes[i].getMatchType()) {
                // Case explosion 0
                case consts.MATCH_TYPES[0]: {
                    matchTypes[i].getTileList().forEach((tile: Tile) => {
                        if (tile.getExplostionType() != consts.MATCH_TYPES[0]) {
                            this.doExplosion(promises, tile)
                        }
                        promises.push(
                            tile.doDestroyEffect(() => {
                                this.haveTile[utils.y2i(tile.y)][utils.x2j(tile.x)] = false
                            })
                        )
                    })
                    break
                }

                // Case explosion 1
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
                                    mergedIntoTile.x,
                                    mergedIntoTile.y
                                )
                            )
                        } else {
                            mergedIntoTile.preFX?.setPadding(32)
                            mergedIntoTile.preFX?.addGlow()
                        }
                    })
                    break
                }

                // Case explosion 2
                case consts.MATCH_TYPES[2]: {
                    console.log('Type 2')
                    const mergedIntoTile: Tile = matchTypes[i].getMergedIntoTile()
                    matchTypes[i].getTileList().forEach((tile: Tile) => {
                        if (tile.getExplostionType() != consts.MATCH_TYPES[0]) {
                            this.doExplosion(promises, tile)
                        }
                        const tileI = utils.y2i(tile.y)
                        const tileJ = utils.x2j(tile.x)
                        if (tile != mergedIntoTile) {
                            promises.push(
                                tile.doDestroyEffect(
                                    () => {
                                        this.haveTile[tileI][tileJ] = false
                                    },
                                    mergedIntoTile.x,
                                    mergedIntoTile.y
                                )
                            )
                        } else {
                            mergedIntoTile.preFX?.setPadding(32)
                            mergedIntoTile.preFX?.addGlow()
                        }
                    })
                    break
                }

                // Case explosion 3
                case consts.MATCH_TYPES[3]: {
                    const mergedIntoTile: Tile = matchTypes[i].getMergedIntoTile()
                    matchTypes[i].getTileList().forEach((tile: Tile) => {
                        if (tile.getExplostionType() != consts.MATCH_TYPES[0]) {
                            this.doExplosion(promises, tile)
                        }
                        const tileI = utils.y2i(tile.y)
                        const tileJ = utils.x2j(tile.x)
                        if (tile != mergedIntoTile) {
                            promises.push(
                                tile.doDestroyEffect(
                                    () => {
                                        this.haveTile[tileI][tileJ] = false
                                    },
                                    mergedIntoTile.x,
                                    mergedIntoTile.y
                                )
                            )
                        } else {
                            mergedIntoTile.preFX?.setPadding(32)
                            mergedIntoTile.preFX?.addGlow()
                        }
                    })
                    break
                }

                // Case explosion 4
                case consts.MATCH_TYPES[4]: {
                    console.log('Type 4')
                    const mergedIntoTile: Tile = matchTypes[i].getMergedIntoTile()
                    matchTypes[i].getTileList().forEach((tile: Tile) => {
                        if (tile.getExplostionType() != consts.MATCH_TYPES[0]) {
                            this.doExplosion(promises, tile)
                        }
                        const tileI = utils.y2i(tile.y)
                        const tileJ = utils.x2j(tile.x)
                        if (tile != mergedIntoTile) {
                            promises.push(
                                tile.doDestroyEffect(
                                    () => {
                                        this.haveTile[tileI][tileJ] = false
                                    },
                                    mergedIntoTile.x,
                                    mergedIntoTile.y
                                )
                            )
                        } else {
                            mergedIntoTile.preFX?.setPadding(32)
                            mergedIntoTile.preFX?.addGlow()
                        }
                    })
                    break
                }
            }
        }

        await Promise.all(promises)
    }

    private randomShuffle(): void {
        let count = 64
        let tileList: Tile[] = []
        for (let i = 0; i < this.tileGrid.length; i++) {
            for (let j = 0; j < this.tileGrid[0].length; j++) {
                tileList.push(this.tileGrid[i][j])
            }
        }
        tileList = utils.shuffle(tileList)

        const circle = new Phaser.Geom.Circle(346, 346, 64)

        Phaser.Actions.PlaceOnCircle(tileList, circle)

        this.scene.tweens.add({
            targets: circle,
            radius: 228,
            ease: 'Quintic.easeInOut',
            duration: 2000,
            onUpdate: function () {
                Phaser.Actions.RotateAroundDistance(
                    tileList,
                    { x: 346, y: 346 },
                    0.1,
                    circle.radius
                )
            },
            onComplete: () => {
                for (let i = 0; i < this.tileGrid.length; i++) {
                    for (let j = 0; j < this.tileGrid[0].length; j++) {
                        this.tileGrid[i][j] = tileList[i * this.tileGrid.length + j]
                        this.scene.add.tween({
                            targets: tileList[i * this.tileGrid.length + j],
                            x: this.tilePosition[i][j].x,
                            y: this.tilePosition[i][j].y,
                            duration: 500,
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

    private getMatches(tileGrid: Tile[][]): MatchType[] {
        const matchTypes: MatchType[] = []

        const matches: Tile[][] = []
        let haveChecked: boolean[] = []

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
            for (let j = i + 1; j < matches.length; j++) {
                if (haveChecked[j]) continue
                const intersectMatch = utils.intersect(matches[i], matches[j])
                const unionMatch = utils.union(matches[i], matches[j])
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
                    break
                }
            }
        }

        for (let i = 0; i < matches.length; i++) {
            if (haveChecked[i]) continue
            if (this.firstSelectedTile && matches[i].indexOf(this.firstSelectedTile) > -1) {
                matchTypes.push(new MatchType(matches[i], this.firstSelectedTile))
            } else if (
                this.secondSelectedTile &&
                matches[i].indexOf(this.secondSelectedTile) > -1
            ) {
                matchTypes.push(new MatchType(matches[i], this.secondSelectedTile))
            } else {
                const len: number = matches[i].length
                matchTypes.push(new MatchType(matches[i], matches[i][Math.floor(len / 2)]))
            }
        }

        return matchTypes
    }

    public displayHint(): void {
        let flag: boolean = false
        for (let i = 0; i < this.tileGrid.length; i++) {
            for (let j = 0; j < this.tileGrid[0].length; j++) {
                if (this.hintSwap(i, j, i + 1, j)) {
                    this.firstSelectionFrame.setPosition(utils.j2x(j), utils.i2y(i))
                    this.secondSelectionFrame.setPosition(utils.j2x(j), utils.i2y(i + 1))
                    this.firstSelectionFrame.setVisible(true)
                    this.secondSelectionFrame.setVisible(true)
                    flag = true
                    break
                } else if (this.hintSwap(i, j, i - 1, j)) {
                    this.firstSelectionFrame.setPosition(utils.j2x(j), utils.i2y(i))
                    this.secondSelectionFrame.setPosition(utils.j2x(j), utils.i2y(i - 1))
                    this.firstSelectionFrame.setVisible(true)
                    this.secondSelectionFrame.setVisible(true)
                    flag = true
                    break
                } else if (this.hintSwap(i, j, i, j + 1)) {
                    this.firstSelectionFrame.setPosition(utils.j2x(j), utils.i2y(i))
                    this.secondSelectionFrame.setPosition(utils.j2x(j + 1), utils.i2y(i))
                    this.firstSelectionFrame.setVisible(true)
                    this.secondSelectionFrame.setVisible(true)
                    flag = true
                    break
                } else if (this.hintSwap(i, j, i, j - 1)) {
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
    }

    public hintSwap(x1: number, y1: number, x2: number, y2: number) {
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

    public update(time: number, timeInterval: number) {
        if (this.idlingTime > 5000) {
            this.displayHint()
            this.idlingTime = 0
            for (let i = 0; i < this.tileGrid.length; i++) {
                for (let j = 0; j < this.tileGrid[i].length; j++) {
                    this.scene.add.tween({
                        targets: this.tileGrid[i][j],
                        y: this.tileGrid[i][j].y - 10,
                        duration: 400,
                        delay: j * 20,
                        yoyo: true,
                        repeat: 0,
                        onComplete: () => {
                            this.scene.add.tween({
                                targets: this.tileGrid[i][j],
                                y: this.tileGrid[i][j].y + 10,
                                duration: 400,
                                delay: j * 20,
                                yoyo: true,
                                repeat: 0,
                            })
                        },
                    })
                }
            }
        } else {
            this.idlingTime += timeInterval
        }
    }

    private doExplosion(promises: Promise<void>[], tile: Tile): void {
        if (tile.getExplostionType() == consts.MATCH_TYPES[1]) {
            this.doMatchFourExplosion(promises, tile)
        } else {
            this.doMatchFiveExplosion(promises, tile)
        }
    }

    private doMatchFourExplosion(promises: Promise<void>[], tile: Tile): void {
        const tileI = utils.y2i(tile.y)
        const tileJ = utils.x2j(tile.x)

        // Do 3x3 explosion
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

    private doMatchFiveExplosion(promises: Promise<void>[], tile: Tile): void {
        const tileI = utils.y2i(tile.y)
        const tileJ = utils.x2j(tile.x)

        // Do horizontal explosion
        if (tile.getExplostionType() == consts.MATCH_TYPES[2]) {
            for (let j = 0; j < consts.GRID_WIDTH; j++) {
                promises.push(
                    this.tileGrid[tileI][j].doDestroyEffect(() => {
                        this.haveTile[tileI][j] = false
                    })
                )
            }
        } else if (tile.getExplostionType() == consts.MATCH_TYPES[3]) {
            for (let i = 0; i < consts.GRID_HEIGHT; i++) {
                promises.push(
                    this.tileGrid[i][tileJ].doDestroyEffect(() => {
                        this.haveTile[i][tileJ] = false
                    })
                )
            }
        } else if (tile.getExplostionType() == consts.MATCH_TYPES[4]) {
            let idList: number[] = []
            for (let i = 0; i < 64; i++) {
                idList.push(i)
            }
            idList = utils.shuffle(idList)
            for (let i = 0; i < 10; i++) {
                let tempI: number
                let tempJ: number
                tempI = Math.floor(idList[i] / 8)
                tempJ = idList[i] - tempI * 8
                promises.push(
                    this.tileGrid[tempI][tempJ].doDestroyEffect(() => {
                        this.haveTile[tempI][tempJ] = false
                    })
                )
            }
        }
    }
}
