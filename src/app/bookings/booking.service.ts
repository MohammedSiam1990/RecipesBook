import { Injectable } from '@angular/core';
import { Booking } from './booking.model';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { take, delay, tap, switchMap, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

interface BookingData {
  bookedFrom: string;
  bookedTo: string;
  firstName: string;
  guestNumber: number;
  lastName: string;
  placeId: string;
  placeImage: string;
  placeTitle: string;
  userId: string;
}


@Injectable({
  providedIn: 'root'
})
export class BookingService {
  // tslint:disable-next-line: variable-name
  private _bookings = new BehaviorSubject<Booking[]>([]);

  get bookings() {
    return this._bookings.asObservable();
  }
  constructor(private authService: AuthService, private http: HttpClient) {}
  addBooking(
    placeId: string,
    placeTitle: string,
    placeImage: string,
    firstName: string,
    lastName: string,
    guestNumber: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    let generatedId: string;
    let newBooking: Booking;
    return this.authService.userId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId) {
          throw new Error('No user id found!');
        }
        newBooking = new Booking(
          Math.random().toString(),
          placeId,
          userId,
          placeTitle,
          guestNumber,
          placeImage,
          firstName,
          lastName,
          dateFrom,
          dateTo
        );
        return this.http.post<{ name: string }>(
          'https://recipesbook-fb9fb.firebaseio.com/bookings.json',
          { ...newBooking, id: null }
        );
      }),
      switchMap(resData => {
        generatedId = resData.name;
        return this.bookings;
      }),
      take(1),
      tap(bookings => {
        newBooking.id = generatedId;
        this._bookings.next(bookings.concat(newBooking));
      })
    );
  }

  cancelBooking(bookingId: string) {
    return this.http
      .delete(
        `https://recipesbook-fb9fb.firebaseio.com/bookings/${bookingId}.json`
      )
      .pipe(
        switchMap(() => {
          return this.bookings;
        }),
        take(1),
        tap(bookings => {
          this._bookings.next(bookings.filter(b => b.id !== bookingId));
        })
      );
  }

  fetchBookings() {
    return this.authService.userId.pipe(switchMap(userId => {
      if (!userId) {
        console.log('User Not found');
        throw new Error('User not found');
      }
      return this.http
      .get<{ [key: string]: BookingData }>(
        `https://recipesbook-fb9fb.firebaseio.com/bookings.json?orderBy="userId"&equalTo="${
          userId
        }"`
      );
    }), map(bookingData => {
          const bookings = [];
          for (const key in bookingData) {
            if (bookingData.hasOwnProperty(key)) {
              bookings.push(
                new Booking(
                  key,
                  bookingData[key].placeId,
                  bookingData[key].userId,
                  bookingData[key].placeTitle,
                  bookingData[key].guestNumber,
                  bookingData[key].placeImage,
                  bookingData[key].firstName,
                  bookingData[key].lastName,
                  new Date(bookingData[key].bookedFrom),
                  new Date(bookingData[key].bookedTo)
                )
              );
            }
          }
          return bookings;
        }),
        tap(bookings => {
          this._bookings.next(bookings);
        }));
  }
}
