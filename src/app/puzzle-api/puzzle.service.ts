import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import nytPuzzles from './data/nyt.json';
import origPuzzles from './data/orig.json';

export interface Identifiable {
  id: number;
}

export type PuzzleSource = 'nyt' | 'orig';

export interface CxnPuzzleCategory {
  commonality: string;
  level: number;
  members: string[];
}

export interface CxnPuzzle extends Identifiable {
  groups: CxnPuzzleCategory[];
  startingGroups: string[][];
}


export interface NytCxnPuzzleCategory {
  [index: string]: {
    level: number;
    members: string[]
  };
}
export interface NytCxnPuzzle extends Identifiable {
  groups: NytCxnPuzzleCategory;
  startingGroups: string[][];
}

export interface CxnPuzzle {
  id: number;
  groups: CxnPuzzleCategory[];
  startingGroups: string[][];
}

@Injectable({
  providedIn: 'root'
})
export class PuzzleService {

  constructor() { }

  fetchOne(id = 0, source: PuzzleSource = 'orig'): Observable<CxnPuzzle> {
    const puzzSet: Identifiable[] = source === 'nyt' ? nytPuzzles : origPuzzles;
    const puzz = puzzSet.find(p => p.id === id);
    const returnPuzz = source === 'nyt' ?
      this.normalizeNytPuzzle(puzz as NytCxnPuzzle) :
      puzz as CxnPuzzle;
    return of(returnPuzz);
  }

  getNumberPuzzles(puzzSrc = 'orig'): Observable<number> {
    return of(puzzSrc === 'nyt' ? nytPuzzles.length : origPuzzles.length);
  }

  private normalizeNytPuzzle(nytPuzz: NytCxnPuzzle): CxnPuzzle {
    const cxnPuzz: CxnPuzzle = {
      id: nytPuzz.id,
      groups: [],
      startingGroups: nytPuzz.startingGroups
    };

    const groups: CxnPuzzleCategory[] = [];
    const grps = nytPuzz.groups;
    Object.keys(grps).forEach(key => {
      // console.log('found key', key);
      const level = grps[key].level;
      const members = grps[key].members;
      const newCat: CxnPuzzleCategory = {
        commonality: key,
        level,
        members
      } as CxnPuzzleCategory;
      groups.push(newCat);
    });
    cxnPuzz.groups = groups;

    return cxnPuzz;
  }
}
