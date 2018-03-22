/**
 * Created by tarasg on 9/25/2017.
 */


export class SceneManager {
    private containers: any = {};
    public currentScene: any; //PIXI.Container
    public currentSceneId: string;
    private app: PIXI.Application;

    constructor(app: PIXI.Application) {
        this.app = app;
    }

    public AddGameScene(id:string, gameScene:any) {
        this.containers[id] = gameScene;
        gameScene.visible = false;
        this.app.stage.addChild(gameScene);
    }

    public goToGameScene(id) {
        if (this.currentScene) {
            this.currentScene.visible = false;
        }
        this.containers[id].visible = true;
        this.currentScene = this.containers[id];
        this.currentSceneId = id;
    }


}
