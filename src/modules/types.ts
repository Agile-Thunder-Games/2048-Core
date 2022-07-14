export type Position = {
    x: number;
    y: number;
}

export type Traversal = {
    x: number[];
    y: number[];
}

export type Metadata = {
    score: number;
    bestScore: number | string;
    terminated: boolean;
    over: boolean;
    won: boolean;
}

/*export const TYPES = {
    Game: Symbol.for('Game'),
    HtmlActuator: Symbol.for('HtmlActuator'),
    KeyboardInputManager: Symbol.for('KeyboardInputManager'),
    LocalStorageManager: Symbol.for('LocalStorageManager'),
};*/

export enum Types {
    Game = "Game",
    HtmlActuator = "HtmlActuator",
    KeyboardInputManager = "KeyboardInputManager",
    LocalStorageManager = "LocalStorageManager",
}