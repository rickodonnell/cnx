import { Component } from '@angular/core';
import { PuzzleService, PuzzleSource } from './puzzle-api/puzzle.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  puzzleSource: PuzzleSource = 'orig';
  puzzleNumber = 1; // Note - this is indexed at 1, so subtract 1 for the board

  numPuzzles = 1;

  constructor(private readonly puzzleService: PuzzleService) { }

  updatePuzzleSrc(): void {
    this.updateNumPuzzles();
    this.puzzleNumber = 1;
  }

  updateNumPuzzles(): void {
    this.puzzleService.getNumberPuzzles(this.puzzleSource).subscribe({
      next: (value) => {
        this.numPuzzles = value;
      }
    });
  }

}
