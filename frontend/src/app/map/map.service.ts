import { Injectable, } from '@angular/core';
import * as L from 'leaflet';
import { Coord } from 'src/app/shared/interface/map';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MapService {

  constructor() { }

  addTiles(map: L.Map, isDark = false) {
    let mapTiles = isDark ? environment.map.tiles.dark : environment.map.tiles.default;
    console.log('Map tiles URL before key append:', mapTiles);
    if (mapTiles.includes('api_key=')) {
      mapTiles = mapTiles.replace('api_key=', 'api_key=' + environment.api.mapKey);
    }
    console.log('Map tiles URL after key append:', mapTiles);
    const tiles = L.tileLayer(mapTiles, {
      maxZoom: 20,
      attribution: `
      '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>,
      &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a>
      &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
      `
    });
    tiles.addTo(map);
  }

  addMarker(map: L.Map, coord: Coord, options = { icon: null, popup: null }): L.Marker {
    const marker = L.marker([coord.lat, coord.lng], { ...(options.icon ? { icon: options.icon } : '') });
    if (options.popup) {
      // marker.bindPopup(options.popup.location.nativeElement);
      marker.bindPopup(options.popup); // options.popup is already an HTMLElement
    }
    // add click event
    marker.on('click', () => {
      // console.log(coord);
      map.flyTo(coord, 19);
    });
    return marker;
  }
}
