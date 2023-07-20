import React from "react"
import { PrivateMapType } from "./shared-types"

const style = {
    zoom: {
        textAlign: "center" as const,
        position: "absolute" as const,
        zIndex: "1500",
        bottom: "0px",
        right: "0px",
        background: "rgba(200, 200, 200, 0.5)",
        padding: "10px",
        width: "18px",
    }
}
export interface ZoomInfoProps {
    map: PrivateMapType,
}

const ZoomInfo = ({ map }: ZoomInfoProps) => (
    <div style={style.zoom}>{map.getZoom()}</div>
)

export default ZoomInfo