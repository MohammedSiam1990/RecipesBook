import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { LocationPickerComponent } from './pickers/location-picker/location-picker.component';
import { MapModelComponent } from './map-model/map-model.component';
import { ImagePickerComponent } from './pickers/image-picker/image-picker.component';


@NgModule({
  declarations: [LocationPickerComponent, MapModelComponent, ImagePickerComponent],
  imports: [CommonModule, IonicModule],
  exports: [LocationPickerComponent, MapModelComponent, ImagePickerComponent],
  entryComponents: [MapModelComponent]
})
export class SharedModule {}
