import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CxnPuzzle, CxnPuzzleCategory, PuzzleService, PuzzleSource } from '../puzzle-api/puzzle.service';

const ALREADY_GUESSED = "You've already guessed that combination";
const ONE_AWAY = "One away";
const SORRY = "Sorry";

@Component({
  selector: 'cxn-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnChanges, OnInit {

  @Input() public puzzleNumber: number = 0;
  @Input() public puzzleSource: PuzzleSource = 'orig';

  currentPuzzle: CxnPuzzle | undefined;
  remainingWords: string[][] = [];
  selectedCells: string[] = [];

  wrongGuesses: string[][] = [];
  correctGuesses: CxnPuzzleCategory[] = [];
  messageToUser = "";
  timer: any;

  constructor(private readonly puzzleService: PuzzleService) { }

  ngOnInit(): void {
    this.initPuzzle(this.puzzleNumber, this.puzzleSource);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.initPuzzle(this.puzzleNumber, this.puzzleSource);
  }

  initPuzzle(puzzleNumber: number, puzzleSource: PuzzleSource): void {
    this.puzzleService.fetchOne(puzzleNumber, puzzleSource).subscribe({
      next: (puzz) => {
        // console.log('service got me a puzzle', puzz);
        this.currentPuzzle = puzz;
        this.remainingWords = puzz.startingGroups;
        this.selectedCells = [];
        this.wrongGuesses = [];
        this.correctGuesses = [];
        this.messageToUser = "";
        clearTimeout(this.timer);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  onClickCell(cell: string): void {
    this.clearMessage();
    const pos = this.selectedCells.indexOf(cell);
    // If cell is already in selected, take it out, else add it but not more than 4
    if (pos >= 0) {
      this.selectedCells.splice(pos, 1);
    } else {
      if (this.selectedCells.length > 3) {
        return;
      }
      this.selectedCells.push(cell);
    }
  }

  isSelected(cell: string): boolean {
    return this.selectedCells.includes(cell);
  }

  guessSelected(): void {
    this.clearMessage();
    if (this.wrongGuesses.some(g => this.arrayEquals(g, this.selectedCells))) {
      this.alertUser(ALREADY_GUESSED);
      return;
    }
    let largestIntersection = 0;
    // @ts-ignore
    for (let grp of this.currentPuzzle?.groups) {
      const intersection = this.arraysIntersection(this.selectedCells, grp.members);
      largestIntersection = intersection.length > largestIntersection ? intersection.length : largestIntersection;
      if (intersection.length === 4) {
        // have a match - add the guessed category to correctGuesses
        this.correctGuesses.push(grp);
        // recreate the "remainingWords" string[][] in chunks of 4 after removing the guessed words
        const stillRem = this.remainingWords.flat().filter(el => !this.selectedCells.includes(el));
        this.remainingWords = [];
        for (let i = 0; i < stillRem.length; i += 4) {
          this.remainingWords.push(stillRem.slice(i, i + 4));
        }
        // reset the selectedCells
        this.selectedCells = [];
        break;
      }
    }
    // Done with the loop - did we find something?
    if (largestIntersection < 4) {
      this.wrongGuesses.push([ ...this.selectedCells ]); // spread op to make a copy
      this.alertUser(largestIntersection === 3 ? ONE_AWAY : SORRY);
    }
  }

  // recreate the "remainingWords" string[][] in chunks of 4
  shuffle(): void {
    this.clearMessage();
    const stillRem = this.remainingWords.flat();
    stillRem.sort(() => Math.random() - 0.5);
    this.remainingWords = [];
    for (let i = 0; i < stillRem.length; i += 4) {
      this.remainingWords.push(stillRem.slice(i, i + 4));
    }
  }

  deselectAll(): void {
    this.clearMessage();
    this.selectedCells = [];
  }

  /// Private methods
  private arrayEquals(a: string[], b: string[]): boolean {
    const aInB = a.every(aEl => b.some(bEl => aEl === bEl));
    return aInB && a.length === b.length;
  }

  private arraysIntersection(a: string[], b: string[]): string[] {
    return a.filter(aEl => b.includes(aEl));
  }

  private alertUser(msg: string) {
    this.messageToUser = msg;
    this.timer = setTimeout(() => {
      this.messageToUser = "";
    }, 5000);
  }

  private clearMessage() {
    this.messageToUser = "";
    clearTimeout(this.timer);
  }

}
