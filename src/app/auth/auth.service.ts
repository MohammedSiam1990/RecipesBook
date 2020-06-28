import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map, tap } from 'rxjs/operators';
import { BehaviorSubject, from } from 'rxjs';
import { User } from './user.model';
import { Plugins } from '@capacitor/core';

export interface AuthResponseData  {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  localId: string;
  expiresIn: string;
  registered?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
//  // tslint:disable-next-line: variable-name
//  private _userIsAuthenticated = false;
//  // tslint:disable-next-line: variable-name
//  private _userId = null;
//  get userIsAuthenticated() {
//    return this._userIsAuthenticated;
//  }
//  get userId() {
//    return this._userId;
//  }

// tslint:disable-next-line: variable-name
private _user = new BehaviorSubject<User>(null);
private activeLogoutTimer: any;

get userIsAuthenticated() {
  return this._user.asObservable().pipe(
    map((user: { token: any; }) => {
      if (user) {
        return !!user.token;
      } else {
        return false;
      }
    })
  );
}

get userId() {
  return this._user.asObservable().pipe(
    map(user => {
      if (user) {
        return user.id;
      } else {
        return null;
      }
    })
  );
}

  constructor(private http: HttpClient) { }

  autoLogin() {
    // tslint:disable-next-line: no-debugger
    debugger;
    return from(Plugins.Storage.get({ key: 'authData' })).pipe(
      map(storedData => {
        if (!storedData || !storedData.value) {
          return null;
        }
        const parsedData = JSON.parse(storedData.value) as {
          token: string;
          tokenExpirationDate: string;
          userId: string;
          email: string;
        };
        const expirationTime = new Date(parsedData.tokenExpirationDate);
        if (expirationTime <= new Date()) {
          return null;
        }
        const user = new User(
          parsedData.userId,
          parsedData.email,
          parsedData.token,
          expirationTime
        );
        return user;
      }),
      tap(user => {
        if (user) {
          this._user.next(user);
          this.autoLogout(user.tokenDuration);
        }
      }),
      map(user => {
        return !!user;
      })
    );
  }
  signup(email: string, password: string) {
    return this.http.post<AuthResponseData>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${
        environment.firebaseAPIKey
      }`,
      // tslint:disable-next-line: object-literal-shorthand
      { email: email, password: password, returnSecureToken: true }
    ).pipe(tap(this.setUserData.bind(this)));
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponseData>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${
        environment.firebaseAPIKey
      }`,
      // tslint:disable-next-line: object-literal-shorthand
      { email: email, password: password, returnSecureToken: true }
    ).pipe(tap(this.setUserData.bind(this)));
  }

  logout() {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this._user.next(null);
    Plugins.Storage.remove({ key: 'authData' });
    // ' انا لم اتبعه موجود في الكورس Maximilian Schwarzmüller هناك حل اخر ل '
  }
  private autoLogout(duration: number) {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this.activeLogoutTimer = setTimeout(() => {
      this.logout();
    }, duration);
  }

  ngOnDestroy() {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
  }

  private setUserData(userData: AuthResponseData) {
    const expirationTime = new Date(
      new Date().getTime() + +userData.expiresIn * 1000
    );
    const user = new User(
      userData.localId,
      userData.email,
      userData.idToken,
      expirationTime
    );
    this._user.next(user);
    this.autoLogout(user.tokenDuration);
    this.storeAuthData(
      userData.localId,
      userData.idToken,
      expirationTime.toISOString(),
      userData.email );
  }

  private storeAuthData(
    userId: string,
    token: string,
    tokenExpirationDate: string,
    email: string
  ) {
    const data = JSON.stringify({
      // tslint:disable-next-line: object-literal-shorthand
      userId: userId,
      // tslint:disable-next-line: object-literal-shorthand
      token: token,
      // tslint:disable-next-line: object-literal-shorthand
      tokenExpirationDate: tokenExpirationDate,
      // tslint:disable-next-line: object-literal-shorthand
      email: email
    });
    Plugins.Storage.set({ key: 'authData', value: data });
  }
}
