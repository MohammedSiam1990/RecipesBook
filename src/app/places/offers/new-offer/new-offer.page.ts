import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PlacesService } from '../../places.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { PlaceLocation } from '../../location.model';

@Component({
  selector: 'app-new-offer',
  templateUrl: './new-offer.page.html',
  styleUrls: ['./new-offer.page.scss']
})
export class NewOfferPage implements OnInit {
  form: FormGroup;
  constructor(
    private placeService: PlacesService,
    private router: Router,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.form = new FormGroup({
      title: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      description: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(180)]
      }),
      price: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.min(1)]
      }),
      dateFrom: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      dateTo: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      location: new FormControl(null, { validators: [Validators.required] })
    });
  }
  onLocationPicked(location: PlaceLocation) {
    // tslint:disable-next-line: object-literal-shorthand
    this.form.patchValue({ location: location });
  }
  onCreateOffer() {
    if (!this.form.valid) {
      return;
    }
    console.log(this.form);

    this.loadingCtrl
      .create({
        message: 'Creating place...'
      })
      .then(loadingEl => {
        loadingEl.present();
        // tslint:disable-next-line: max-line-length
        this.placeService
          .addPlace(
            this.form.value.title,
            this.form.value.description,
            +this.form.value.price,
            new Date(this.form.value.dateFrom),
            new Date(this.form.value.dateTo),
            this.form.value.location
          )
          .subscribe(() => {
            // tslint:disable-next-line: no-unused-expression
            loadingEl.dismiss();
            this.form.reset();
            this.router.navigate(['/places/tabs/offers']);
          });
      });
  }
}
