# Leaflet React Utilities

This library provides commonly used components, functions and tools to handle Leaflet maps, area definitions, 
translation between WMS map tile coordinates and latitude/longitude geo-coordinates.

## Installation

```bash
npm i -S @solstice-ai/leaflet-react-utils
```

## Usage

```javascript
import React from "react"
import { MapContainer, Rectangle } from "react-leaflet"
import { AbstractMap, AreaTileSelect, mapCommon, MapClick } from "@solstice-ai/leaflet-react-utils"

class MyMap extends AbstractMap {
    constructor(props) {
        super(props)

        this.state = {
            ...this.state,
            myCustomState: true,
            myOtherState: [],
            currentBox: null,
        }

        this.tilesets = [this.getStandardOsmLayer()]
        this.setAreaSelect = this.setAreaSelect.bind(this)
        this.onClick = this.onClick.bind(this)
    }

    setAreaSelect(box) {
        console.log("Top left", box.topLeft.lat, ",", box.topLeft.lon)
        console.log("Bottom right", box.bottomRight.lat, ",", box.bottomRight.lon)
        this.setState({ currentBox: box })
    }

    onClick(lat, lon) {
        console.log("Clicked on point", lat, lon)
    }

    render() {
        return (
            <div>
                {/** clicking on this button moves the map to Melbourne */}
                <button onClick={() => { this.moveTo(-37.78, 144.97, 14)}}>

                {/** render the map container */}
                <MapContainer center={[0, 140.7]} zoom={2} style={{ width: "700px" height: "400px"}} whenReady={this.setMap}>
                    {/** render the OSM and allow the moveTo method */}
                    {this.renderMapInfo()}

                    {/** if we allow to click on the map and retrieve lat / lon */}
                    <MapClick map={this.state.map} onClick={this.onClick} />

                    {/** if we want to select an area (ctrl + drag) */}
                    <AreaTileSelect map={this.state.map} setBox={this.setAreaSelect} />

                    {/** once a rectangle is selected render it on the map */}
                    {this.state.currentBox != null ? (
                        <Rectangle
                            bounds={mapCommon.getBounds(this.props.currentBox)}
                            fillColor="#f00"
                            opacity={0.3}
                        />
                    ) : null}
                </MapContainer>
            </div>
        )
    }
}
```

The `this.renderMapInfo` call takes 2 boolean parameters, which by default both are `true`:
- `showZoom` - indicates whether to show the zoom level in the bottom right corner
- `showLocation` - indicates whether to show the current lat/lon of the cursor position in the bottom right corner
