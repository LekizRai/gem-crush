const utils = {
    getDirection: (vectorX: number, vectorY: number) => {
        let ratio: number
        if (vectorY == 0) {
            ratio = 2
        } else {
            ratio = Math.abs(vectorX / vectorY)
        }
        if (vectorX >= 0) {
            if (ratio > 1) {
                return 'E'
            } else {
                if (vectorY >= 0) {
                    return 'S'
                } else {
                    return 'N'
                }
            }
        } else {
            if (ratio > 1) {
                return 'W'
            } else {
                if (vectorY >= 0) {
                    return 'S'
                } else {
                    return 'N'
                }
            }
        }
    },
}

export default utils
