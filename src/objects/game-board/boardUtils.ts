import consts from '../../consts/consts'
import Tile from '../tiles/Tile'

const utils = {
    j2x: (j: number) => {
        return Math.round((j + 1) * 20 + j * consts.TILE_WIDTH + consts.TILE_WIDTH / 2)
    },
    x2j: (x: number) => {
        return Math.round((x - consts.TILE_WIDTH / 2 - 20) / (20 + consts.TILE_WIDTH))
    },
    i2y: (i: number) => {
        return Math.round((i + 1) * 20 + i * consts.TILE_HEIGHT + consts.TILE_HEIGHT / 2)
    },
    y2i: (y: number) => {
        return Math.round((y - consts.TILE_HEIGHT / 2 - 20) / (20 + consts.TILE_HEIGHT))
    },
    intersect: (arr1: Tile[], arr2: Tile[]) => {
        return arr1.filter((value) => arr2.includes(value))
    },
    union: (arr1: Tile[], arr2: Tile[]) => {
        return Array.from(new Set([...arr1, ...arr2]))
    },
    shuffle: (arr: any[]) => {
        let currentIndex = arr.length
        while (currentIndex != 0) {
            let randomIndex = Math.floor(Math.random() * currentIndex)
            currentIndex--
            ;[arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]]
        }
        return arr
    },
}

export default utils
