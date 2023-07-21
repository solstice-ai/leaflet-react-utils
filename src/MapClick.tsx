import React, { useEffect } from "react"
import { PrivateMapType } from "./shared-types"

export interface MapClickProps {
    map: PrivateMapType,
    onClick: (lat: number, lon: number) => void,
}

const MapClick = ({ map, onClick }: MapClickProps) => {
    useEffect(() => {
        map.on("click", e => {
            onClick(e.latlng.lat, e.latlng.lng)
        })
    })
    return null
}

export default MapClick