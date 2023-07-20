import { Map } from "leaflet"

export interface LatLonType {
    lat: number,
    lon: number,
}

export interface BoxType {
    topLeft: LatLonType,
    bottomRight: LatLonType,
}

export type PolygonType = {
    [idx in number]: number[]
}

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
    center: LatLngType,
    bounds?: any,
}


export interface PrivateMapType extends Map {
    _events: any,
}
