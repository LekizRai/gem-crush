import consts from '../../consts/consts'
import Tile from './Tile'

export default class TileFactory {
    private scene: Phaser.Scene

    constructor(scene: Phaser.Scene) {
        this.scene = scene
    }

    public createTileId(id: number, x: number, y: number): Tile {
        return new Tile({
            scene: this.scene,
            x: x,
            y: y,
            texture: consts.TILE_TYPES[id],
        })
    }
 
    public createRandomTile(x: number, y: number): Tile {
        const tileType: string =
            consts.TILE_TYPES[Phaser.Math.RND.between(0, consts.TILE_TYPES.length - 4)]

        return new Tile({
            scene: this.scene,
            x: x,
            y: y,
            texture: tileType,
        })
    }
}
