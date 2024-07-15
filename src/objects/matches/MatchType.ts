import Tile from '../tiles/Tile'
import consts from '../../consts/consts'

export default class MatchType {
    private tileList: Tile[]
    private mergedIntoTile: Tile
    private type: string

    constructor(tileList: Tile[], mergedIntoTile: Tile, type?: string) {
        this.tileList = tileList
        this.mergedIntoTile = mergedIntoTile
        if (type) {
            this.type = type
            this.mergedIntoTile.setExplosionType(this.type)
        } else {
            this.type = this.calcMatchType()
            if (this.mergedIntoTile.getExplostionType() == consts.MATCH_TYPES[0]) {
                this.mergedIntoTile.setExplosionType(this.type)
            }
        }
    }

    public getMatchType(): string {
        return this.type
    }

    public getTileList(): Tile[] {
        return this.tileList
    }

    public getMergedIntoTile(): Tile {
        return this.mergedIntoTile
    }

    private calcMatchType(): string {
        for (let i = 0; i < this.tileList.length; i++) {
            if (this.tileList[i].getExplostionType() != consts.MATCH_TYPES[0]) {
                return consts.MATCH_TYPES[0]
            }
        }

        if (this.tileList.length >= 5) {
            // U, D, L, R
            let directionList: number[] = [0, 0, 0, 0]
            for (let i = 0; i < this.tileList.length; i++) {
                if (this.tileList[i].x - this.mergedIntoTile.x > 0) {
                    directionList[3] = 1
                } else if (this.tileList[i].x - this.mergedIntoTile.x < 0) {
                    directionList[2] = 1
                } else if (this.tileList[i].y - this.mergedIntoTile.y > 0) {
                    directionList[1] = 1
                } else if (this.tileList[i].y - this.mergedIntoTile.y < 0) {
                    directionList[0] = 1
                }
            }
            const sum: number =
                directionList[0] + directionList[1] + directionList[2] + directionList[3]
            if (sum == 4) {
                return consts.MATCH_TYPES[3]
            } else if (sum == 3) {
                return consts.MATCH_TYPES[3]
            } else if (sum == 2) {
                if (directionList[0] + directionList[1] != 1) {
                    return consts.MATCH_TYPES[2]
                } else {
                    return consts.MATCH_TYPES[3]
                }
            } else {
                return consts.MATCH_TYPES[2]
            }
        } else if (this.tileList.length >= 4) {
            return consts.MATCH_TYPES[1]
        } else if (this.tileList.length >= 3) {
            return consts.MATCH_TYPES[0]
        }
        return consts.MATCH_TYPES[0]
    }
}
