import Tile from "./tile";
import Grid from "./grid";
import { Metadata, Position } from "./types";

import { injectable } from "inversify";
import "reflect-metadata";

@injectable()
export default class HtmlActuator {
    private tileContainer: Element = document.querySelector(".tile-container");
    private scoreContainer: Element = document.querySelector(".score-container");
    private bestContainer: Element = document.querySelector(".best-container");
    private gridContainer: Element = document.querySelector(".grid-container");
    private gameContainer: Element = document.querySelector(".game-message");
    
    private score: number = 0;

    public constructor() {
        this.createCells();
    }

    private createCells(): void {
        let gridRow: Element;
	    let gridCell: Element;

		for (let r = 0; r < 4; r++) {
			gridRow = document.createElement("div");
			gridRow.className = "grid-row";

			for (let c = 0; c < 4; c++) {
				gridCell = document.createElement("div");

				gridCell.className = "grid-cell";

				gridRow.appendChild(gridCell);
			}

			this.gridContainer.appendChild(gridRow);
		}
    }

    public actuate(grid: Grid, metadata: Metadata): void {
        window.requestAnimationFrame((): void => {
            this.clearContainer(this.tileContainer);

            for (let column of grid.cells) {
                for (let cell of column) {
                    if (cell) {
                        this.addTile(cell);
                    }
                }
            }

            this.updateScore(metadata.score);
            this.updateBestScore(metadata.bestScore);

            if (metadata.terminated) {
                if (metadata.won) {
                    this.message(true);
                } else {
                    this.message(false);
                }
            }
        });
    }

    public continueGame(): void {
        this.clearMessage();
    }

    public clearContainer(container: Element): void {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    }

    public addTile(tile: Tile): void {
        let wrapper: HTMLDivElement = document.createElement("div");
        let inner: HTMLDivElement = document.createElement("div");
        let position : Position = tile.previousPosition || { x: tile.x, y: tile.y };
        let positionClass: string = this.positionClass(position);
        let classes: string[] = ["tile", `tile-${tile.value}`, positionClass];

        if (tile.value > 2048) {
            classes.push("tile-super");
        }

        this.applyClasses(wrapper, classes);

        inner.classList.add("tile-inner");
        inner.innerHTML = tile.value.toString();

        if (tile.previousPosition) {
            window.requestAnimationFrame((): void => {
                classes[2] = this.positionClass({
                    x: tile.x,
                    y: tile.y
                });

                this.applyClasses(wrapper, classes);
            });
        } else if (tile.mergedFrom) {
            classes.push("tile-merged");

            this.applyClasses(wrapper, classes);

            for(let merged of tile.mergedFrom) {
                this.addTile(merged);
            }
        } else {
            classes.push("tile-new");

            this.applyClasses(wrapper, classes);
        }

        wrapper.appendChild(inner);

        this.tileContainer.appendChild(wrapper);
    }

    public applyClasses(element: HTMLElement, classes: string[]): void {
        element.className = classes.join(" ");
    }

    public normalizePosition(position: Position): Position {
        return {
            x: position.x + 1,
            y: position.y + 1
        };
    }

    public positionClass(position: Position): string {
        position = this.normalizePosition(position);

        return `tile-position-${position.x}-${position.y}`;
    }

    public updateScore(score: number): void {
        this.clearContainer(this.scoreContainer);

        this.score = score;
        this.scoreContainer.innerHTML = this.score.toString();
    }

    public updateBestScore(bestScore: number | string): void {
        this.bestContainer.innerHTML = bestScore.toString();
    }

    public message(won: boolean): void {
        let message: string;
        let type: string;

        if (won) {
            type = "game-won";
            message = "You win!";
        } else {
            type = "game-over";
            message = "Game over!";
        }

        this.gameContainer.classList.add(type);
        this.gameContainer.querySelector(".message").innerHTML = message;
    }

    public clearMessage(): void {
        this.gameContainer.classList.remove("game-won");
        this.gameContainer.classList.remove("game-over");
    }
}
