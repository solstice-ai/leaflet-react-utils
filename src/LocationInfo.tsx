import React from "react"
import { LatLonType } from "./shared-types"

const WIDTH = "110px"

const style = {
    location: {
        textAlign: "center" as const,
        position: "absolute" as const,
        zIndex: "401",
        bottom: "0px",
        right: "38px",  // enough space for zoom info (18 + 10 padding)
        background: "rgba(200, 200, 200, 0.5)",
        padding: "10px",
        width: WIDTH,
    },
    locationEmbedded: {
        textAlign: "center" as const,
        width: WIDTH,
        padding: "10px",
    },
}
export interface LocationInfoProps {
    location?: LatLonType | null,
    embedded?: boolean,
}

const LocationInfo = ({ location, embedded }: LocationInfoProps) => (
    <div style={embedded === true ? style.locationEmbedded : style.location}>
        {location != null ? (
            <span>{location.lat.toFixed(4)}, {location.lon.toFixed(4)}</span>
        ) : null}
    </div>
)

export default LocationInfo