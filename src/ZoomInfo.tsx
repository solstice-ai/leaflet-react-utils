import React from "react"
import { PrivateMapType } from "./shared-types"

const style = {
    zoom: {
        textAlign: "center" as const,
        position: "absolute" as const,
        zIndex: "401",
        bottom: "0px",
        right: "0px",
        background: "rgba(200, 200, 200, 0.5)",
        padding: "10px",
        width: "18px",
    },
    zoomEmbedded: {
        textAlign: "center" as const,
        width: "18px",
        padding: "10px",
    },
}
export interface ZoomInfoProps {
    map: PrivateMapType,
    embedded?: boolean,
}

const ZoomInfo = ({ map, embedded }: ZoomInfoProps) => (
    <div style={embedded === true ? style.zoomEmbedded : style.zoom}>{map.getZoom()}</div>
)

export default ZoomInfo