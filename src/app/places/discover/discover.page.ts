import { Component, OnInit } from '@angular/core';
import { PlacesService } from '../places.service';
import { Place } from '../Place.model';
import { MenuController } from '@ionic/angular';
import { SegmentChangeEventDetail } from '@ionic/core';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit {
  loadPlaces: Place[];
  listedLoadedPlaces: Place[];

  constructor(private placesService: PlacesService, private menuCtrl: MenuController) { }

  ngOnInit() {
    this.loadPlaces = this.placesService.places;
    this.listedLoadedPlaces = this.loadPlaces.slice(1);
  }

  onOpenMenu() {
    this.menuCtrl.toggle();
  }

  onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail>) {
    console.log(event.detail);
  }

}
