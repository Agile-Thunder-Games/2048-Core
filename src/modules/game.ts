import Tile from "./tile";
import Grid from "./grid";
import { Direction } from "./direction";

import HtmlActuator from "./htmlActuator";
import LocalStorageManager from "./localStorageManager";
import KeyboardInputManager from "./keyboardInputManager";

import { Position, Traversal } from "./types";

import { TYPES } from "./types";
import { inject, injectable } from "inversify";

@injectable()
export default class Game {
    private over: boolean;
    private won: boolean;
    private isPlaying: boolean;
    private grid: Grid;
    private score: number;

    private readonly size = 4;
    private readonly startCells = 2;

    constructor(
        @inject(TYPES.HtmlActuator) private readonly actuator: HtmlActuator,
        @inject(TYPES.KeyboardInputManager) private readonly input: KeyboardInputManager, 
        @inject(TYPES.LocalStorageManager) private readonly storage: LocalStorageManager,
    ) {}

    public run(): void {
        this.input.on("move", this.move.bind(this));
        this.input.on("restart", this.restart.bind(this));
        this.input.on("keepPlaying", this.keepPlaying.bind(this));
        
        this.setup();
    }

    private restart(): void {
        this.storage.clearGameState();
        this.actuator.continueGame(); // Clear the game won/lost message
        this.setup();
    }

    private keepPlaying(): void {
        this.isPlaying = true;
        this.actuator.continueGame(); // Clear the game won/lost message
    }

    private get isGameTerminated(): boolean {
        return this.over || (this.won && !this.isPlaying);
    }

    private setup(): void {
        let previousState: Game = this.storage.gameState;

        if (previousState) {
            this.grid = new Grid(previousState.grid.size, previousState.grid.cells);
            this.score = previousState.score;
            this.over = previousState.over;
            this.won = previousState.won;
            this.keepPlaying = previousState.keepPlaying;
        } else {
            this.grid = new Grid(this.size, null);
            this.score = 0;
            this.over = false;
            this.won = false;
            this.isPlaying = false;
            this.addStartTiles();
        }

        this.actuate();
    }

    private addStartTiles() {
        for (let i: number = 0; i < this.startCells; i++) {
            this.addRandomTile();
        }
    }

    private addRandomTile() {
        if (this.grid.isCellsAvailable()) {
            let value: number;

            if(Math.random() < 0.9) {
                value = 2;
            } else {
                value = 4;
            }

            let tile: Tile = new Tile(this.grid.randomAvailableCell(), value);

            this.grid.insertTile(tile);
        }
    }

    private actuate() {
        if (this.storage.bestScore < this.score) {
            this.storage.bestScore = this.score;
        }

        if (this.over) {
            this.storage.clearGameState();
        } else {
            this.storage.gameState = this.serialize();
        }

        this.actuator.actuate(this.grid, {
            score: this.score,
            over: this.over,
            won: this.won,
            bestScore: this.storage.bestScore,
            terminated: this.isGameTerminated
        });
    }

    private serialize() {
        return {
            grid: this.grid.serialize(),
            score: this.score,
            over: this.over,
            won: this.won,
            keepPlaying: this.keepPlaying,
        };
    }

    private prepareTiles(): void {
        this.grid.eachCell((x: number, y: number, tile: Tile): void => {
            if (tile) {
                tile.mergedFrom = null;
                tile.savePosition();
            }
        });
    }

    private moveTile(tile: Tile, position: Position) {
        this.grid.cells[tile.x][tile.y] = null;
        this.grid.cells[position.x][position.y] = tile;
    
        tile.updatePosition(position);
    }

    private move(direction: Direction) {
        // 0: up, 1: right, 2: down, 3: left
        if (this.isGameTerminated) {
            return; // Don't do anything if the game's over
        }

        let cell: Position;
        let tile: Tile;
        let vector: Position = this.getVector(direction);
        let traversals: Traversal = this.buildTraversals(vector);
        let moved: boolean = false;

        // Save the current tile positions and remove merger information
        this.prepareTiles();

        for(let x of traversals.x) {
            for(let y of traversals.y) {
                cell = {
                    x: x,
                    y: y
                };

                tile = this.grid.cellContent(cell);
                    
                if (tile) {
                    let positions: any = this.findFarthestPosition(cell, vector);
                    let next: Tile = this.grid.cellContent(positions.next);

                    // Only one merger per row traversal?
                    if (next && next.value === tile.value && !next.mergedFrom) {
                        let merged: Tile = new Tile(positions.next, tile.value * 2);

                        merged.mergedFrom = [tile, next];
                    
                        this.grid.insertTile(merged);
                        this.grid.removeTile(tile);

                        tile.updatePosition(positions.next);
                        
                        this.score += merged.value;

                        if (merged.value === 2048) {
                            this.won = true;
                        }
                    } else {
                        this.moveTile(tile, positions.farthest);
                    }

                    if (!this.positionsEquals(cell, tile)) {
                        moved = true; // The tile moved from its original cell!
                    }
                }
            }
        }

        if (moved) {
            this.addRandomTile();

            if (!this.isMovesAvailable()) {
                this.over = true; // Game over!
            }

            this.actuate();
        }
    }
    
    private getVector(direction: Direction): Position {
        const directions: Position[] = [
            { x: 0, y: -1 }, // Up
            { x: 1, y: 0 }, // Right
            { x: 0, y: 1 }, // Down
            { x: -1, y: 0 }, // Left
        ];

        return directions[direction];
    }    

    private buildTraversals(vector: Position): Traversal {
        let traversals: Traversal = {
            x: [],
            y: [],
        };

        for (let pos: number = 0; pos < this.size; pos++) {
            traversals.x.push(pos);
            traversals.y.push(pos);
        }

        // Always traverse from the farthest cell in the chosen direction
        if (vector.x === 1) {
            traversals.x = traversals.x.reverse();
        }

        if (vector.y === 1) {
            traversals.y = traversals.y.reverse();
        }

        return traversals;
    }

    private findFarthestPosition(cell: Position, vector: Position) {
        let previous: Position;

        do {
            previous = cell;
            cell = {
                x: previous.x + vector.x,
                y: previous.y + vector.y
            };
        } while (this.grid.withinBounds(cell) && this.grid.isCellAvailable(cell));

        return {
            farthest: previous,
            next: cell
        };
    }

    private isMovesAvailable() {
        return this.grid.isCellsAvailable() || this.isTileMatchesAvailable();
    }

    private isTileMatchesAvailable() {
        let tile: Tile;

        for (let x: number = 0; x < this.size; x++) {
            for (let y: number = 0; y < this.size; y++) {
                tile = this.grid.cellContent({
                    x: x,
                    y: y,
                });

                if (tile) {
                    for (let direction: number = 0; direction < 4; direction++) {
                        let vector: Position = this.getVector(direction);
                        let cell: Position  = {
                            x: x + vector.x, 
                            y: y + vector.y
                        };

                        let other: Tile = this.grid.cellContent(cell);

                        if (other && other.value === tile.value) {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }

    private positionsEquals(first: Position, second: Position): boolean {
        return (first.x === second.x) && (first.y === second.y);
    }
}