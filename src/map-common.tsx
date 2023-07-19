import { BoxType, LatLonType, PolygonType, TileLocationType } from "./shared-types"

const mapCommon = {
    getBounds(box: BoxType): PolygonType {
        const northEast = [box.topLeft.lat, box.bottomRight.lon]
        const southWest = [box.bottomRight.lat, box.topLeft.lon]
        const bounds = [southWest, northEast]
        return bounds
    },
    getTilesByLatLon(lat: number, lon: number, zoom: number = 20): TileLocationType {
        const n = 2 ** zoom
        const latRadians = (lat * Math.PI) / 180.0
        const xTile = n * ((lon + 180) / 360)
        const yTile = (n * (1 - Math.log(Math.tan(latRadians) + 1 / Math.cos(latRadians)) / Math.PI)) / 2
        return { x: Math.round(xTile), y: Math.round(yTile) }
    },
    getLatLonByTiles(xTile: number, yTile: number, zoom = 20): LatLonType {
        const n = 2 ** zoom
        const lon = (xTile / n) * 360.0 - 180.0
        const latRadians = Math.atan(Math.sinh(Math.PI * (1 - (2 * yTile) / n)))
        const lat = (latRadians * 180.0) / Math.PI
        return { lat, lon }
    },
    getXyDimension(topLeft: LatLonType, bottomRight: LatLonType, zoom: number = 20): number[] {
        const tlXy = this.getTilesByLatLon(topLeft.lat, topLeft.lon, zoom)
        const brXy = this.getTilesByLatLon(bottomRight.lat, bottomRight.lon, zoom)
        return [brXy.x - tlXy.x, brXy.y - tlXy.y]
    },
    getPolygonPoints(box: BoxType): PolygonType {
        const bounds = this.getBounds(box)
        const northEast = bounds[0]
        const southWest = bounds[1]
        const points = [
            [box.topLeft.lat, box.topLeft.lon],
            [northEast[0], northEast[1]],
            [box.bottomRight.lat, box.bottomRight.lon],
            [southWest[0], southWest[1]],
        ]
        return points
    },
    isEqualBox(boxA?: BoxType, boxB?: BoxType): boolean {
        if (boxA === boxB) {
            return true
        }
        if (boxA == null && boxB != null) {
            return false
        }
        if (boxA != null && boxB == null) {
            return false
        }
        if (boxA!.topLeft.lat !== boxB!.topLeft.lat) {
            return false
        }
        if (boxA!.topLeft.lon !== boxB!.topLeft.lon) {
            return false
        }
        if (boxA!.bottomRight.lat !== boxB!.bottomRight.lat) {
            return false
        }
        if (boxA!.bottomRight.lon !== boxB!.bottomRight.lon) {
            return false
        }
        return true
    },
    gridRound(value: number, preferRoundUp: boolean = true, gridSize: number = 4): number {
        const diff = value % gridSize
        if (diff < gridSize / 2) {
            // round down
            return value - diff
        }
        if (diff > gridSize / 2) {
            // round up
            return value + (gridSize - diff)
        }
        // right in the middle
        if (preferRoundUp) {
            return value + diff
        }
        return value - diff
    },
}

export default mapCommon
