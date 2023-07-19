import "leaflet-area-select"
import { useEffect } from "react"
import React from "react"
import mapCommon from "./map-common"

const AreaTileSelect = (props) => {
    const { map } = props
    useEffect(() => {
        if (!map.selectArea) {
            return
        }
        if (props.setBox == null) {
            throw Error("Please provide a `setBox` property to the AreaTileSelect component")
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
            // no gridsize provided, no need to snap to nearest tile grid
            if (props.gridSize == null) {
                props.setBox(box)
                return 
            }

            // translate into x/y coordinates at zoom 20
            const tlXy = mapCommon.getTilesByLatLon(box.topLeft.lat, box.topLeft.lon) 
            const tlXyGrid = {
                x: mapCommon.gridRound(tlXy.x, false, props.gridSize),
                y: mapCommon.gridRound(tlXy.y, false, props.gridSize),
            } // shoehorn into 4x4 grid or what is provided
            // translate back into lat/lon
            const tlGrid = mapCommon.getLatLonByTiles(tlXyGrid.x, tlXyGrid.y) 
            // do the same for bottom right
            const brXy = mapCommon.getTilesByLatLon(box.bottomRight.lat, box.bottomRight.lon)
            const brXyGrid = {
                x: mapCommon.gridRound(brXy.x, true, props.gridSize),
                y: mapCommon.gridRound(brXy.y, true, props.gridSize),
            }
            const brGrid = mapCommon.getLatLonByTiles(brXyGrid.x, brXyGrid.y)
            // finally update box
            box.topLeft = tlGrid
            box.bottomRight = brGrid
            // inform parent
            props.setBox(box)
        })
    })

    return null
}

export default AreaTileSelect
