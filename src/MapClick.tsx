import React from "react"
import { PrivateMapType } from "./shared-types"

export interface MapClickProps {
    map: PrivateMapType,
    onClick: (lat: number, lon: number) => void,
}

class MapClick extends React.Component<MapClickProps> {
    constructor(props: MapClickProps) {
        super(props)
    }

    componentWillUnmount(): void {
        // unregister the click event
        this.props.map._events.click = []
    }

    componentDidMount(): void {
        // register the click event on mount
        this.props.map.on("click", e => {
            this.props.onClick(e.latlng.lat, e.latlng.lng)
        })
    }

    render() {
        return null
    }
}


export default MapClick