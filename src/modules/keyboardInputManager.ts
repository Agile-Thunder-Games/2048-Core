import { Direction } from "./direction";

import { injectable } from "inversify";
import "reflect-metadata";

@injectable()
export default class KeyboardInputManager {
    private events: string[];
    private eventTouchStart: string;
    private eventTouchMove: string;
    private eventTouchEnd: string;

    public constructor() {
        this.events = [];

      //  if (window.navigator.msPointerEnabled) {
            //Internet Explorer 10 style
       //     this.eventTouchStart = "MSPointerDown";
       //     this.eventTouchMove = "MSPointerMove";
       //     this.eventTouchEnd = "MSPointerUp";
      //  } else {
            this.eventTouchStart = "touchstart";
            this.eventTouchMove = "touchmove";
            this.eventTouchEnd = "touchend";
      //  }

        this.listen();
    }

    public on(event: string, callback: () => string): void {
        if (!this.events[event]) {
            this.events[event] = [];
        }

        this.events[event].push(callback);
    }

    public emit(event: string, data: any): void {
        let callbacks: Function[] = this.events[event];

        if (callbacks) {
            for(let callback of callbacks) {
                callback(data);
            }
        }
    }

    public listen(): void {
        let direction: Direction;

        document.addEventListener("keydown", (event: KeyboardEvent): void => {
            let modifiers: boolean = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;

            if(!modifiers) {
                switch(event.code) {
                    case "ArrowLeft":
                        direction = Direction.Left;
                        break;
                    case "ArrowUp":
                        direction = Direction.Up;
                        break;
                    case "ArrowRight":
                        direction = Direction.Right;
                        break;
                    case "ArrowDown":
                        direction = Direction.Down;
                        break;
                }
            }

            if (typeof direction !== undefined) {
                event.preventDefault();

                this.emit("move", direction);
            }
        });

        // Respond to button presses
        this.bindButtonPress(".retry-button", this.restart);
        this.bindButtonPress(".restart-button", this.restart);
        this.bindButtonPress(".keep-playing-button", this.keepPlaying);

        // Respond to swipe events
        let touchStartClientX: number;
        let touchStartClientY: number;
        let gameContainer: Element = document.querySelector(".game-container");

        gameContainer.addEventListener(this.eventTouchStart, (event: TouchEvent | any): void => {
            // if (window.navigator.msPointerEnabled) {
           //     touchStartClientX = event.pageX;
          //      touchStartClientY = event.pageY;
          //  } else {
                touchStartClientX = event.touches[0].clientX;
                touchStartClientY = event.touches[0].clientY;
          //  }

            event.preventDefault();
        });

        gameContainer.addEventListener(this.eventTouchMove, (event: Event): void => event.preventDefault());

        gameContainer.addEventListener(this.eventTouchEnd, (event: TouchEvent | any): void => {
            let touchEndClientX: number;
            let touchEndClientY: number;

           // if (window.navigator.msPointerEnabled) {
           //     touchEndClientX = event.pageX;
           //     touchEndClientY = event.pageY;
          //  } else {
                touchEndClientX = event.changedTouches[0].clientX;
                touchEndClientY = event.changedTouches[0].clientY;
          //  }

            let dx: number = touchEndClientX - touchStartClientX;
            let absDx: number = Math.abs(dx);

            let dy: number = touchEndClientY - touchStartClientY;
            let absDy: number = Math.abs(dy);

            if (Math.max(absDx, absDy) > 10) {
                // (right : left) : (down : up)
                this.emit("move", absDx > absDy ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
            }
        });
    }

    public restart(event: Event): void {
        event.preventDefault();

        this.emit("restart", null);
    }

    public keepPlaying(event: Event): void {
        event.preventDefault();

        this.emit("keepPlaying", null);
    }

    public bindButtonPress(selector: string, fn: Function): void {
        let button: Element = document.querySelector(selector);

        button.addEventListener("click", fn.bind(this));
        button.addEventListener(this.eventTouchEnd, fn.bind(this));
    }
}
