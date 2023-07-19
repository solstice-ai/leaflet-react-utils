import L from "leaflet"

const mapCommon = {
    getBounds(box) {
        const northEast = L.latLng(box.topLeft.lat, box.bottomRight.lon)
        const southWest = L.latLng(box.bottomRight.lat, box.topLeft.lon)
        const bounds = L.latLngBounds(southWest, northEast)
        return bounds
    },
    getTilesByLatLon(lat, lon, zoom = 20) {
        const n = 2 ** zoom
        const latRadians = (lat * Math.PI) / 180.0
        const xTile = n * ((lon + 180) / 360)
        const yTile = (n * (1 - Math.log(Math.tan(latRadians) + 1 / Math.cos(latRadians)) / Math.PI)) / 2
        return { x: Math.round(xTile), y: Math.round(yTile) }
    },
    getLatLonByTiles(xTile, yTile, zoom = 20) {
        const n = 2 ** zoom
        const lon = (xTile / n) * 360.0 - 180.0
        const latRadians = Math.atan(Math.sinh(Math.PI * (1 - (2 * yTile) / n)))
        const lat = (latRadians * 180.0) / Math.PI
        return { lat, lon }
    },
    getXyDimension(topLeft, bottomRight, zoom = 20) {
        const tlXy = this.getTilesByLatLon(topLeft.lat, topLeft.lon, zoom)
        const brXy = this.getTilesByLatLon(bottomRight.lat, bottomRight.lon, zoom)
        return [brXy.x - tlXy.x, brXy.y - tlXy.y]
    },
    getPolygonPoints(box) {
        const bounds = this.getBounds(box)
        const points = [
            [box.topLeft.lat, box.topLeft.lon],
            [bounds._northEast.lat, bounds._northEast.lng],
            [box.bottomRight.lat, box.bottomRight.lon],
            [bounds._southWest.lat, bounds._southWest.lng],
        ]
        return points
    },
    isEqualBox(boxA, boxB) {
        if (boxA === boxB) {
            return true
        }
        if (boxA == null && boxB != null) {
            return false
        }
        if (boxA != null && boxB == null) {
            return false
        }
        if (boxA._northEast.lat !== boxB._northEast.lat) {
            return false
        }
        if (boxA._northEast.lng !== boxB._northEast.lng) {
            return false
        }
        if (boxA._southWest.lat !== boxB._southWest.lat) {
            return false
        }
        if (boxA._southWest.lng !== boxB._southWest.lng) {
            return false
        }
        return true
    },
    gridRound(value, preferRoundUp = true, gridSize = 4) {
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
