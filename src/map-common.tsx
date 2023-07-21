import { AreaType, BoxType, LatLonType, MapConfigType, PolygonType, PrivateMapType, TileLocationType } from "./shared-types"

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
    getMapConfigForArea(map: PrivateMapType, area: AreaType | BoxType | LatLonType | PolygonType): MapConfigType {
        if ((area as BoxType).topLeft != null && (area as BoxType).bottomRight != null) {
            // convert to dummy area with box parameter
            return this.getMapConfigForArea(map, { box: { ...area }} as AreaType)
        }
        if ((area as LatLonType).lat != null && (area as LatLonType).lon != null) {
            // convert to dummy area with point parameter
            return this.getMapConfigForArea(map, { point: { ...area } } as AreaType)
        }
        // TODO: detect polygon points and convert to dummy area with polygon parameter
    
        const { width, height } = { width: map.getSize().x, height: map.getSize().y }
    
        if ((area as AreaType).point != null) {
            // area is a point of interest, default zoom level
            return { center: (area as AreaType).point as LatLonType, zoom: 16 }
        }
    
        if ((area as AreaType).box != null) {
            // area is a box, check boundaries and see what zoom level we need
            const [boxWidth, boxHeight] = this.getXyDimension((area as AreaType).box!.topLeft, (area as AreaType).box!.bottomRight)
            // ratio of the box vs. the map size
            const mainRatio = Math.min(height / boxHeight, width / boxWidth)
            let targetzoom = 17
            let zoomRatio = 29.44 // ratio for zoom 16 (17 above because we decrease once)
            while (zoomRatio > mainRatio && targetzoom > 1) {
                // half the zoom value and reduce zoom by 1
                zoomRatio /= 2
                targetzoom -= 1
            }
    
            // determine center
            const topLeftXy = this.getTilesByLatLon((area as AreaType).box!.topLeft.lat, (area as AreaType).box!.topLeft.lon)
            const centerXy = { x: topLeftXy.x + Math.round(boxWidth / 2), y: topLeftXy.y + Math.round(boxHeight / 2) }
            const center = Object.values(this.getLatLonByTiles(centerXy.x, centerXy.y))
            return { center, zoom: targetzoom }
        }
    
        // TODO: handle polygon (determine boundaries and fall back to box)
        return { center: [0, 0], zoom: 16 }
    }
}

export default mapCommon
