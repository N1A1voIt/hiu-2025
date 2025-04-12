import {ApplicationConfig, importProvidersFrom, provideZoneChangeDetection} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import {provideHttpClient} from '@angular/common/http';
import {FIREBASE_OPTIONS} from '@angular/fire/compat';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {AngularFirestoreModule} from '@angular/fire/compat/firestore';
import {getFirestore, provideFirestore} from '@angular/fire/firestore';

export const environment = {
  production: false,
  firebaseConfig : {
    apiKey: "AIzaSyA88bAvpNatzYW4dRPsvzjNiSjhRfjo_sM",
    authDomain: "hiu-selection.firebaseapp.com",
    projectId: "hiu-selection",
    storageBucket: "hiu-selection.firebasestorage.app",
    messagingSenderId: "1004834507721",
    appId: "1:1004834507721:web:a7ddf47b651d03ae03f618",
    measurementId: "G-CDYKGX66XT",
  }
};

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideClientHydration(),provideHttpClient(),
    { provide: FIREBASE_OPTIONS, useValue: environment.firebaseConfig },
    provideFirebaseApp(() => {
      console.log("Initializing Firebase...");
      return initializeApp(environment.firebaseConfig);
    }),
    importProvidersFrom(AngularFirestoreModule),
    provideFirestore(() => getFirestore()),
  ]
};

