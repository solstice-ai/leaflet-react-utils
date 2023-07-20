import React, { useEffect } from "react"
import { tileLayer, LatLng, Layer } from "leaflet"
import { LatLngType, MapConfigType, PrivateMapType } from "./shared-types"
import ZoomInfo from "./ZoomInfo"
// import { useMap } from "react-leaflet"


const DEFAULT_MAP_CONFIG: MapConfigType = {
    center: {
        lat: -29.96, 
        lng: 146.139,
    },
    zoom: 5,
}

interface PrivateLayerType extends Layer {
    _url: string
}

interface MapInfoProps {
    currentTileset?: "map" | "sat",
    currentMapConfig: MapConfigType,
    minSatZoom: number,
    tilesets: PrivateLayerType[]
    setMapConfig: (zoom: number, center: LatLngType, bounds: any, minSatZoom: number) => void,
    map: PrivateMapType
}

const MapInfo = ({ currentTileset, currentMapConfig, minSatZoom, tilesets, setMapConfig, map }: MapInfoProps) => {
    // const map = useMap()
    
    // determine active and inactive tile set
    if (currentMapConfig.zoom === map.getZoom() && currentMapConfig.center === map.getCenter()) {
        // will not abort first time, since getCenter of map returns an object, but center of current state is a JSON to start with
        return null
    }

    if (currentTileset != null) {
        // only execute this part, if currentTileset is provided, otherwise we just have a simple map
        // create tile map of sat and osm layer/tileset
        const osmLayers = tilesets.filter(ts => ts._url.includes("openstreetmap") || ts._url.includes("osm"))
        const satLayers = tilesets.filter(ts => !ts._url.includes("openstreetmap") && !ts._url.includes("osm"))
        const tileMap = {
            map: osmLayers.length > 0 ? osmLayers[0] : null, // standard osm tileset
            sat: satLayers.length > 0 ? satLayers[0] : null, // custom tile set with satellite images
        }

        // find out active and inactive layers
        const activeLayer = tileMap[currentTileset]
        const inactiveLayer = currentTileset === "map" ? tileMap.sat : tileMap.map
        // only change active layer, if at least an active and inactive layer exist
        if (activeLayer != null || inactiveLayer != null) {
            // determine whether we need to remove or add layers
            let currentAlreadyThere = false
            let inactiveAlreadyRemoved = true
            if (tilesets.length > 0) {
                map.eachLayer((l: Layer) => {
                    if (activeLayer != null && (l as PrivateLayerType)._url === activeLayer._url) {
                        currentAlreadyThere = true
                    }
                    if (inactiveLayer != null && (l as PrivateLayerType)._url === inactiveLayer._url) {
                        inactiveAlreadyRemoved = false
                    }
                })

                // execute actions if required
                if (inactiveAlreadyRemoved === false && inactiveLayer != null) {
                    inactiveLayer.remove()
                }
                if (currentAlreadyThere === false && activeLayer != null) {
                    activeLayer.addTo(map)
                }
            }
        }
    }

    // event handlers for zoom and move
    const registerLength = tilesets.length === 0 ? 2 : 3
    if (map._events.moveend.length === registerLength) {
        // only register once!
        map.on("moveend", () => {
            // zoomend includes a moveend event (as the boundaries move)
            setMapConfig(map.getZoom(), map.getCenter(), map.getBounds(), minSatZoom)
        })
    }

    return null
}

export interface RecenterAutomaticallyProps { 
    map: PrivateMapType,
    mapConfig: {
        zoom: number,
        center: LatLngType,
    },
    changePosition?: boolean,
}

const RecenterAutomatically = ({ map, mapConfig, changePosition = false }: RecenterAutomaticallyProps) => {
    if (changePosition === false) {
        return null
    }
    // const map = useMap()
    useEffect(() => {
        map.setView(new LatLng(mapConfig.center.lat, mapConfig.center.lng), mapConfig.zoom)
    }, [new LatLng(mapConfig.center.lat, mapConfig.center.lng), mapConfig.zoom])
    return null
}

export interface AbstractMapProps {
    currentTileset: "map" | "sat"
    minSatZoom: number,
}
export interface AbstractMapState {
    map?: PrivateMapType | null,
    mapConfig: MapConfigType
    currentTileset?: "map" | "sat",
    showCacheConfig?: boolean,
    changePosition?: boolean,
}
export interface PrivateMapWrapperType {
    target: PrivateMapType,
}

class AbstractMap extends React.Component<AbstractMapProps, AbstractMapState> {
    
    private tilesets: PrivateLayerType[] = []

    constructor(props: AbstractMapProps) {
        super(props)
        // process map config
        const updatedMapConfig: MapConfigType = { ...DEFAULT_MAP_CONFIG }
        
        // init state
        this.state = {
            mapConfig: updatedMapConfig,
            currentTileset: props.currentTileset || "map",
            showCacheConfig: false,
            changePosition: false,
            map: null, // will be set by whenReady
        }

        this.getStandardOsmLayer = this.getStandardOsmLayer.bind(this)
        this.setMapConfig = this.setMapConfig.bind(this)
        this.setMap = this.setMap.bind(this)
        this.setCurrentTileset = this.setCurrentTileset.bind(this)
        this.moveTo = this.moveTo.bind(this)
        this.renderMapInfo = this.renderMapInfo.bind(this)
    }

    getStandardOsmLayer(maxZoom = 20) {
        return tileLayer("https://a.tile.openstreetmap.de/{z}/{x}/{y}.png", {
            maxZoom,
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        })
    }

    setMap(map: PrivateMapWrapperType) {
        this.setState({ map: map.target })
    }

    setCurrentTileset(tileset: "map" | "sat") {
        return () => {
            this.setState({ currentTileset: tileset })
        }
    }

    setMapConfig(zoom: number, center: LatLngType, bounds: any, minSatZoom: number) {
        return new Promise(resolve => {
            const stateUpdate: AbstractMapState = { mapConfig: { zoom, center, bounds } }
            if (minSatZoom != null && zoom < minSatZoom) {
                // force osm map, if we zoom out too far
                stateUpdate.currentTileset = "map"
            } else if (zoom > 18) {
                // osm stops at 18, if we are zoomed in too much, force the sat view
                stateUpdate.currentTileset = "sat"
            }
            this.setState({ ...stateUpdate }, () => {
                resolve(true)
            })
        })
    }

    setTilesets(tilesets: PrivateLayerType[]) {
        this.tilesets = tilesets
    }

    moveTo(lat: number, lon: number, zoom: number | null = null) {
        if (zoom == null) {
            this.moveTo(lat, lon, this.state.mapConfig.zoom)
            return
        }

        this.setState(
            {
                changePosition: true,
                mapConfig: {
                    center: { lat, lng: lon },
                    zoom,
                },
            },
            () => {
                this.setState({ changePosition: false })
            }
        )
    }

    renderMapInfo(showZoom = true) {
        if (this.state.map == null) {
            return null
        }
        const result = [
            <MapInfo
                setMapConfig={this.setMapConfig}
                currentMapConfig={this.state.mapConfig}
                currentTileset={this.state.currentTileset}
                tilesets={this.tilesets}
                minSatZoom={this.props.minSatZoom}
                key="mapinfo"
                map={this.state.map}
            />,
            <RecenterAutomatically
                mapConfig={this.state.mapConfig}
                key="recenter"
                changePosition={this.state.changePosition}
                map={this.state.map}
            />,
        ]

        if (showZoom) {
            result.push(<ZoomInfo map={this.state.map} />)
        }

        return result
    }
}

export default AbstractMap
