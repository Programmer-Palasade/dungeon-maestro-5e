import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    importProvidersFrom(provideFirebaseApp(() => initializeApp({"projectId":"dungeonmaestro5e","appId":"1:771197907114:web:d4713f3ee0339af15d60d3","storageBucket":"dungeonmaestro5e.appspot.com","apiKey":"AIzaSyAkcrnnSNEf6r_xuZvnR1hI0qjCm7l3Nyg","authDomain":"dungeonmaestro5e.firebaseapp.com","messagingSenderId":"771197907114","measurementId":"G-FTVGCM2H1L"}))), 
    importProvidersFrom(provideAuth(() => getAuth())), importProvidersFrom(provideFirestore(() => getFirestore()))
  ]
};
