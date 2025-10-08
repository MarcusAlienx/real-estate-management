import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { PropertyType } from 'src/app/shared/enums/property';

interface Markers {
  label: string;
  value: string;
  isChecked: boolean;
  icon: string;
}

@Component({
    selector: 'app-map-markers-legend',
    templateUrl: './map-markers-legend.component.html',
    styleUrls: ['./map-markers-legend.component.css'],
    standalone: false
})
export class MapMarkersLegendComponent implements OnInit {
  @Output() toggledMarker = new EventEmitter<{ type: string; isChecked: boolean }>();

  public markers: Markers[] = [
    {
      label: 'Residencial',
      value: PropertyType.residential,
      isChecked: true,
      icon: 'marker-residential.svg'
    },
    {
      label: 'Terrenos',
      value: PropertyType.land,
      isChecked: true,
      icon: 'marker-land.svg'
    },
    {
      label: 'Bodegas',
      value: PropertyType.warehouse,
      isChecked: true,
      icon: 'marker-warehouse.svg'
    }
  ];
  constructor() { }

  ngOnInit() { }

  markerSelected(marker: Markers) {
    this.toggledMarker.emit({ type: marker.value, isChecked: marker.isChecked });
  }
}
