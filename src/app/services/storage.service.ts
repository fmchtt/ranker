import { Injectable } from '@angular/core';
import { Row } from '../../types/row';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor() {}

  public static DEFAULT_STATE = [
    { label: 'S', objects: [] },
    { label: 'A', objects: [] },
    { label: 'B', objects: [] },
    { label: 'C', objects: [] },
    { label: 'D', objects: [] },
  ];

  public getAppState(): Row[] {
    const data = sessionStorage.getItem('appState');
    if (!data) {
      return StorageService.DEFAULT_STATE;
    }
    return JSON.parse(data);
  }

  public saveAppState(state: Row[]) {
    sessionStorage.setItem('appState', JSON.stringify(state));
  }

  public resetAppState() {
    sessionStorage.removeItem('appState');
  }
}
