import { injectable } from "inversify";

@injectable()
export default class LocalStorageManager {
    private readonly bestScoreKey: string = "bestScore";
    private readonly gameStateKey: string = "gameState";
    private readonly storage: Storage  = window.localStorage;

    public clearGameState(): void {
        this.storage.removeItem(this.gameStateKey);
    }

    public get bestScore() : number {
        return Number.parseInt(this.storage.getItem(this.bestScoreKey)) || 0;
    }

    public set bestScore(value : string | number) {
        this.storage.setItem(this.bestScoreKey, value.toString());
    }

    public get gameState() : any {
        const jsonState: string = this.storage.getItem(this.gameStateKey);

        if (jsonState) {
            return JSON.parse(jsonState);
        } else {
            return null;
        }
    }

    public set gameState(value: any) {
        this.storage.setItem(this.gameStateKey, JSON.stringify(value));
    }
}
