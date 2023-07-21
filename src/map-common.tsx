import { AreaType, BoxType, LatLngType, LatLonType, MapConfigType, PolygonType, PrivateMapType, TileLocationType } from "./shared-types"

const mapCommon = {
    getBounds(box: BoxType): PolygonType[] {
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
    getPolygonPoints(box: BoxType): PolygonType[] {
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
    getMapConfigForArea(map: PrivateMapType, area: AreaType | BoxType | LatLonType | LatLonType[] | LatLngType[] | PolygonType[], defaultZoom: number = 16): MapConfigType {
        const defaultReturn = { center: [0, 0], zoom: defaultZoom }
        if ((area as BoxType).topLeft != null && (area as BoxType).bottomRight != null) {
            // convert to dummy area with box parameter
            return this.getMapConfigForArea(map, { box: { ...area }} as AreaType, defaultZoom)
        }
        if ((area as LatLonType).lat != null && (area as LatLonType).lon != null) {
            // convert to dummy area with point parameter
            return this.getMapConfigForArea(map, { point: { ...area } } as AreaType, defaultZoom)
        }
        if (Array.isArray(area)) {
            // potentially array of coordinates
            if (area.length === 0) {
                // empty array
                return defaultReturn
            }
            if ((area[0] as LatLonType).lat != null) {
                // array of lat/lon values
                const polygon = area.map(p => [(p as LatLonType).lat, (p as LatLonType).lon != null ? (p as LatLonType).lon : (p as LatLngType).lng])
                return this.getMapConfigForArea(map, { polygon }, defaultZoom)
            }
            if (!Number.isNaN(area[0])) {
                // array of [lat, lon] array values
                return this.getMapConfigForArea(map, { polygon: (area as PolygonType[]) }, defaultZoom)
            }
        }
    
        const { width, height } = { width: map.getSize().x, height: map.getSize().y }
    
        if ((area as AreaType).point != null) {
            // area is a point of interest, default zoom level
            const point: LatLonType = (area as AreaType).point!
            return { center: [point.lat, point.lon], zoom: defaultZoom }
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

        if ((area as AreaType).polygon != null) {
            // we have a polygon, convert to box and call the box handler
            const polygon = (area as AreaType).polygon
            if (polygon!.length === 0) {
                // empty coordinates
                return defaultReturn
            }

            // convert to box
            let tiles = []
            if ((polygon![0] as LatLonType).lat != null) {
                // provided as lat / lon
                tiles = polygon!.map(p => this.getTilesByLatLon((p as LatLonType).lat, (p as LatLonType).lon))
            } else {
                // already as numbers
                tiles = polygon!.map(p => this.getTilesByLatLon((p as PolygonType)[0], (p as PolygonType)[1]))
            }
            
            // find min max of tiles
            const minX = Math.min(...tiles.map(t => t.x))
            const minY = Math.min(...tiles.map(t => t.y))
            const maxX = Math.max(...tiles.map(t => t.x))
            const maxY = Math.max(...tiles.map(t => t.y))

            const box = {
                topLeft: this.getLatLonByTiles(minX, minY),
                bottomRight: this.getLatLonByTiles(maxX, maxY),
            }
            // call with box of outer boundaries
            return this.getMapConfigForArea(map, { box }, defaultZoom)
        }

        return defaultReturn
    }
}

export default mapCommon
