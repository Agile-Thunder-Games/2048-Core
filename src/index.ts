import "./css/game.css";
import './css/game-mobile.css';

import Game from "./modules/game";
import HtmlActuator from "./modules/htmlActuator";
import LocalStorageManager from "./modules/localStorageManager";
import KeyboardInputManager from "./modules/keyboardInputManager";

import { Container } from "inversify";
import { Types } from "./modules/types";

const container = new Container();

container.bind<Game>(Types.Game).to(Game).inSingletonScope();
container.bind<HtmlActuator>(Types.HtmlActuator).to(HtmlActuator).inSingletonScope();
container.bind<KeyboardInputManager>(Types.KeyboardInputManager).to(KeyboardInputManager).inSingletonScope();
container.bind<LocalStorageManager>(Types.LocalStorageManager).to(LocalStorageManager).inSingletonScope();

window.requestAnimationFrame(() => container.resolve(Game).run());