import { Map } from "leaflet"

export interface LatLonType {
    lat: number,
    lon: number,
}

export interface BoxType {
    topLeft: LatLonType,
    bottomRight: LatLonType,
}

export type PolygonType = number[]

export interface TileLocationType {
    x: number,
    y: number,
    zoom?: number,
}

export type LatLngType = {
    lat: number,
    lng: number,
}

export interface MapConfigType {
    zoom: number,
    center: LatLngType | LatLonType | number[],
    bounds?: any,
}


export interface PrivateMapType extends Map {
    _events: any,
}

export interface AreaType {
    box?: BoxType,
    point?: LatLonType,
    polygon?: PolygonType[] | LatLonType[],
}
