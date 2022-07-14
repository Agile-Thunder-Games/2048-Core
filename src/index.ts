import "./css/game.css";
import './css/game-mobile.css';

import Game from "./modules/game";
import HtmlActuator from "./modules/htmlActuator";
import KeyboardInputManager from "./modules/keyboardInputManager";
import LocalStorageManager from "./modules/localStorageManager";
/*
const size: number = 4;
const inputManager: KeyboardInputManager = new KeyboardInputManager();
const storageManager: LocalStorageManager = new LocalStorageManager();
const actuator: HtmlActuator = new HtmlActuator();*/

import { Container } from "inversify";
import { TYPES } from "./modules/types";

/*
window.requestAnimationFrame(() : void => {
    //const game  = new Game(inputManager, storageManager, actuator);

   // game.run();
});
*/

const container = new Container();

container.bind<Game>(TYPES.Game).to(Game).inSingletonScope();
container.bind<HtmlActuator>(TYPES.HtmlActuator).to(HtmlActuator).inSingletonScope();
container.bind<KeyboardInputManager>(TYPES.KeyboardInputManager).to(KeyboardInputManager).inSingletonScope();
container.bind<LocalStorageManager>(TYPES. LocalStorageManager).to(LocalStorageManager).inSingletonScope();

window.requestAnimationFrame(() => container.resolve(Game).run());