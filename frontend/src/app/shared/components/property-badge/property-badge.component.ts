import { Component, Input, OnInit } from '@angular/core';
import { PropertyType } from '../../enums/property';

@Component({
    selector: 'app-property-badge',
    templateUrl: './property-badge.component.html',
    styleUrls: ['./property-badge.component.css'],
    standalone: false
})
export class PropertyBadgeComponent implements OnInit {

  @Input() type = 'residential';
  constructor() { }

  ngOnInit() { }

  typeColor() {
    switch (this.type) {
      case PropertyType.residential:
        return 'danger';
      case PropertyType.land:
        return 'success';
      case PropertyType.warehouse:
        return 'warning';
      default:
        break;
    }
  }

  typeLabel() {
    switch (this.type) {
      case PropertyType.residential:
        return 'Residencial';
      case PropertyType.land:
        return 'Terrenos';
      case PropertyType.warehouse:
        return 'Bodegas';
      default:
        break;
    }
  }
}
