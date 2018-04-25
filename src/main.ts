import * as Scenes from "./Scenes/GameScenes";
import {SceneManager} from "./Scenes/ScenesManager";
import {BaseGameController} from "./Controllers/BaseGame";
import {SoundsManagerClass} from "./Sounds/sounds";

let appSize = [960, 536]
export const app: PIXI.Application = new PIXI.Application(window.innerWidth, window.innerHeight);
export let SCENE_MANAGER = new SceneManager(app);
export let SoundsManager;
export let baseGameScene;
export let baseGameController;

const loader = PIXI.loader; // PixiJS exposes a premade instance for you to use.

loader
    .add('sheet', '../Media/sprites.json')

loader.load((loader, resources) => {
    // resources is an object where the key is the name of the resource loaded and the value is the resource object.
    // They have a couple default properties:
    // - `url`: The URL that the resource was loaded from
    // - `error`: The error that happened when trying to load (if any)
    // - `data`: The raw data that was loaded
    // also may contain other properties based on the middleware that runs.
    document.body.appendChild(app.view);

    let textures = loader.resources.sheet.textures;

    // SoundsManager = new SoundsManagerClass(resources);

    baseGameScene = new Scenes.BaseGameScene(textures);
    SCENE_MANAGER.AddGameScene('baseGame', baseGameScene);
    baseGameController = new BaseGameController(baseGameScene);

    SCENE_MANAGER.goToGameScene('baseGame');

    hideSplash();

});


function hideSplash(): void {
    document.getElementById('spin').style.display = 'none';
    let splash = document.getElementById('splash');
    let scaleArray = getScaleArray()
    app.stage.scale.set(scaleArray[0], scaleArray[1])
    splash.className ='splashFadeOut';
    setTimeout(function () {
        splash.style.display = 'none';
    }, 1000);
}

function getScaleArray(): number[] {
    let result = [];
    result[0] = window.innerWidth/appSize[0]
    result[1] = window.innerHeight/appSize[1]
    return result
}
