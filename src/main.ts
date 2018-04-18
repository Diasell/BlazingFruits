import * as Scenes from "./Scenes/GameScenes";
import {SceneManager} from "./Scenes/ScenesManager";
import {GambleController} from "./Controllers/Gamble";
import * as helperFuncs from "./Utils/helperFuncs";
import {nextItem} from "./Utils/helperFuncs";
import {BonusGameScene} from "./Scenes/GameScenes";
import {BonusGameController} from "./Controllers/Bonus";
import {BaseGameController} from "./Controllers/BaseGame";
import {SoundsManagerClass} from "./Sounds/sounds";


export const app: PIXI.Application = new PIXI.Application(1920, 1080, '', false);
export let SCENE_MANAGER = new SceneManager(app);
export let SoundsManager;
export let baseGameScene, gambleScene, bonusGameScene;
export let gambleController, bonusController, baseGameController;
const loader = PIXI.loader; // PixiJS exposes a premade instance for you to use.

let helpPageOrder = ['mainHelp', 'bonusHelp', 'gambleHelp', 'linesHelp'];

// Chainable `add` to enqueue a resource
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
    let spr = new PIXI.Sprite(textures["BG"]);
    app.stage.addChild(spr);



    // SoundsManager = new SoundsManagerClass(resources);

    // let mainHelpScene = new Scenes.MainHelpScene(resources);
    // SCENE_MANAGER.AddGameScene('mainHelp', mainHelpScene);
    // let bonusHelpScene = new Scenes.BonusHelpScene(resources);
    // SCENE_MANAGER.AddGameScene('bonusHelp', bonusHelpScene);
    // let gambleHelpScene = new Scenes.GambleHelpScene(resources);
    // SCENE_MANAGER.AddGameScene('gambleHelp', gambleHelpScene);
    // let linesHelpScene = new Scenes.WinLinesHelpScene(resources);
    // SCENE_MANAGER.AddGameScene('linesHelp', linesHelpScene);

    // baseGameScene = new Scenes.BaseGameScene(resources);
    // SCENE_MANAGER.AddGameScene('baseGame', baseGameScene);
    // baseGameController = new BaseGameController(baseGameScene);

    // bonusGameScene = new Scenes.BonusGameScene(resources);
    // SCENE_MANAGER.AddGameScene('bonusGame', bonusGameScene);
    // bonusController = new BonusGameController(bonusGameScene);


    // gambleScene = new Scenes.GambleScene(resources);
    // gambleController = new GambleController(gambleScene);
    // SCENE_MANAGER.AddGameScene('gamble', gambleScene);

    // SCENE_MANAGER.goToGameScene('baseGame');



    setTimeout(function () {
        app.stage.scale.set(window.innerWidth/1920, window.innerHeight/1080);
        hideSplash();
    }, 1000);


});


function hideSplash(){
    document.getElementById('spin').style.display = 'none';
    let splash = document.getElementById('splash');
    splash.className ='splashFadeOut';
    setTimeout(function () {
        splash.style.display = 'none';
    }, 1000);
}

document.addEventListener('ExitHelpButtonPressed', function () {
    SCENE_MANAGER.goToGameScene('baseGame');
});

document.addEventListener('NextHelpPageButtonPressed', function () {
    let current_scene = SCENE_MANAGER.currentSceneId,
        index = helpPageOrder.indexOf(current_scene);
    SCENE_MANAGER.goToGameScene(helperFuncs.nextItem(helpPageOrder, index));
});

document.addEventListener('PrevHelpPageButtonPressed', function () {
    let current_scene = SCENE_MANAGER.currentSceneId,
        index = helpPageOrder.indexOf(current_scene);
    SCENE_MANAGER.goToGameScene(helperFuncs.prevItem(helpPageOrder, index));
});


document.addEventListener('AutoStartButtonPressed', function () {
    console.log('AutoStart Button pressed');
});


