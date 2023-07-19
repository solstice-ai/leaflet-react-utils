import { useEffect } from "react"
import mapCommon from "./map-common"

function AreaTileSelect(props) {
    if (props.setBox == null) {
        throw Error("Please provide a `setBox` property to the AreaTileSelect component")
    }
    // default grid size to 1
    const gridRound = props.gridSize || 1
    const { map } = props
    useEffect(() => {
        if (!map.selectArea) {
            return
        }
        map.selectArea.enable()
        map.on("areaselected", (e) => {
            const { bounds } = e
            const box = {
                topLeft: {
                    lat: bounds._northEast.lat,
                    lon: bounds._southWest.lng,
                },
                bottomRight: {
                    lat: bounds._southWest.lat,
                    lon: bounds._northEast.lng,
                },
            }
            // translate into x/y coordinates at zoom 20
            const tlXy = mapCommon.getTilesByLatLon(box.topLeft.lat, box.topLeft.lon) 
            const tlXyGrid = {
                x: mapCommon.gridRound(tlXy.x, false, gridRound),
                y: mapCommon.gridRound(tlXy.y, false, gridRound),
            } // shoehorn into 4x4 grid or what is provided
            // translate back into lat/lon
            const tlGrid = mapCommon.getLatLonByTiles(tlXyGrid.x, tlXyGrid.y) 
            // do the same for bottom right
            const brXy = mapCommon.getTilesByLatLon(box.bottomRight.lat, box.bottomRight.lon)
            const brXyGrid = {
                x: mapCommon.gridRound(brXy.x, true, gridRound),
                y: mapCommon.gridRound(brXy.y, true, gridRound),
            }
            const brGrid = mapCommon.getLatLonByTiles(brXyGrid.x, brXyGrid.y)
            // finally update box
            box.topLeft = tlGrid
            box.bottomRight = brGrid
            // inform parent
            props.setBox(box)
        })
    }, [])

    return null
}

export default AreaTileSelect
