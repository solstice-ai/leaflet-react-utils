import React from "react"
import { PrivateMapType  } from "./shared-types"


export interface MapCursorMoveProps {
    map: PrivateMapType,
    onMove: (lat: number, lon: number) => void,
}

class MapCursorMove extends React.Component<MapCursorMoveProps> {
    constructor(props: MapCursorMoveProps) {
        super(props)
    }

    componentWillUnmount(): void {
        // unregister the click event
        this.props.map._events.mousemove = []
    }

    componentDidMount(): void {
        // register the click event on mount
        this.props.map.on("mousemove", e => {
            this.props.onMove(e.latlng.lat, e.latlng.lng)
        })
    }

    render() {
        return null
    }
}

export default MapCursorMove
