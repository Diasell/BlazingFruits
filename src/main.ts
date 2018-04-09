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
    .add('basegameBack', '../Media/back.png')
    .add('base_game_symbols', '../Media/symbols.png')
    .add('reelspin', '../Media/sounds/reelspin.mp3')
    .add('reelstop', '../Media/sounds/reelstop.mp3')
    .add('7_symbol', '../Media/sounds/symbols/7_symbol.mp3')
    .add('bf_symbol', '../Media/sounds/symbols/blazing_fruit_symbol.mp3')
    .add('bonus_symbol', '../Media/sounds/symbols/bonus_symbol.mp3')
    .add('bonus_pending', '../Media/sounds/symbols/bonus_pending.mp3')
    .add('bonus_stop', '../Media/sounds/reels/bf_bonus_stop.mp3')
    .add('bonus_intro', '../Media/sounds/bonus/bonus_intro_fruits.mp3')
    .add('bonus_reveal_1', '../Media/sounds/bonus/bonus_reveal_1.mp3')
    .add('bonus_reveal_2', '../Media/sounds/bonus/bonus_reveal_2.mp3')
    .add('bonus_reveal_3', '../Media/sounds/bonus/bonus_reveal_3.mp3')
    .add('bonus_reveal_4', '../Media/sounds/bonus/bonus_reveal_4.mp3')
    .add('bonus_reveal_5', '../Media/sounds/bonus/bonus_reveal_5.mp3')
    .add('bonus_amb', '../Media/sounds/bonus_amb.mp3')
    .add('gamble_amb', '../Media/sounds/gamble_amb.mp3')
    .add('gamble_win1', '../Media/sounds/gamble/gamble_win1.mp3')
    .add('gamble_win2', '../Media/sounds/gamble/gamble_win2.mp3')
    .add('gamble_win3', '../Media/sounds/gamble/gamble_win3.mp3')
    .add('gamble_win4', '../Media/sounds/gamble/gamble_win4.mp3')
    .add('gamble_win5', '../Media/sounds/gamble/gamble_win5.mp3')
    .add('gamble_lose', '../Media/sounds/gamble/lose_card.mp3')
    .add('help_amb', '../Media/sounds/help_amb.mp3')
    .add('cherry_symbol', '../Media/sounds/symbols/cherry_symbol.mp3')
    .add('lemon_symbol', '../Media/sounds/symbols/lemon_symbol.mp3')
    .add('orange_symbol', '../Media/sounds/symbols/orange_symbol.mp3')
    .add('plum_symbol', '../Media/sounds/symbols/plum_symbol.mp3')
    .add('wm_symbol', '../Media/sounds/symbols/watermelon_symbol.mp3')

    // winlines
    .add('winline_amount_field', '../Media/denom_board.png')
    .add('line_buttons_20', '../Media/20_line_btns.png')
    .add('line_buttons_20_tog', '../Media/20_line_btns_toggle.png')
    .add('line1', '../Media/slotgames/lines20/l1.png')
    .add('line2', '../Media/slotgames/lines20/l2.png')
    .add('line3', '../Media/slotgames/lines20/l3.png')
    .add('line4', '../Media/slotgames/lines20/l4.png')
    .add('line5', '../Media/slotgames/lines20/l5.png')
    .add('line6', '../Media/slotgames/lines20/l6.png')
    .add('line7', '../Media/slotgames/lines20/l7.png')
    .add('line8', '../Media/slotgames/lines20/l8.png')
    .add('line9', '../Media/slotgames/lines20/l9.png')
    .add('line10', '../Media/slotgames/lines20/l10.png')
    .add('line11', '../Media/slotgames/lines20/l11.png')
    .add('line12', '../Media/slotgames/lines20/l12.png')
    .add('line13', '../Media/slotgames/lines20/l13.png')
    .add('line14', '../Media/slotgames/lines20/l14.png')
    .add('line15', '../Media/slotgames/lines20/l15.png')
    .add('line16', '../Media/slotgames/lines20/l16.png')
    .add('line17', '../Media/slotgames/lines20/l17.png')
    .add('line18', '../Media/slotgames/lines20/l18.png')
    .add('line19', '../Media/slotgames/lines20/l19.png')
    .add('line20', '../Media/slotgames/lines20/l20.png')
    // win boxes
    .add('box1', '../Media/slotgames/winboxes_20/box_1.png')
    .add('box2', '../Media/slotgames/winboxes_20/box_2.png')
    .add('box3', '../Media/slotgames/winboxes_20/box_3.png')
    .add('box4', '../Media/slotgames/winboxes_20/box_4.png')
    .add('box5', '../Media/slotgames/winboxes_20/box_5.png')
    .add('box6', '../Media/slotgames/winboxes_20/box_6.png')
    .add('box7', '../Media/slotgames/winboxes_20/box_7.png')
    .add('box8', '../Media/slotgames/winboxes_20/box_8.png')
    .add('box9', '../Media/slotgames/winboxes_20/box_9.png')
    .add('box10', '../Media/slotgames/winboxes_20/box_10.png')
    .add('box11', '../Media/slotgames/winboxes_20/box_11.png')
    .add('box12', '../Media/slotgames/winboxes_20/box_12.png')
    .add('box13', '../Media/slotgames/winboxes_20/box_13.png')
    .add('box14', '../Media/slotgames/winboxes_20/box_14.png')
    .add('box15', '../Media/slotgames/winboxes_20/box_15.png')
    .add('box16', '../Media/slotgames/winboxes_20/box_16.png')
    .add('box17', '../Media/slotgames/winboxes_20/box_17.png')
    .add('box18', '../Media/slotgames/winboxes_20/box_18.png')
    .add('box19', '../Media/slotgames/winboxes_20/box_19.png')
    .add('box20', '../Media/slotgames/winboxes_20/box_20.png')
    // winshow animations:
    .add('cherryWinShow', '../Media/animations/winshow/cherry/winshowCherry.png')
    .add('cherryWinShowJSON', '../Media/animations/winshow/cherry/winshowCherry.json')
    .add('lemonWinShow', '../Media/animations/winshow/lemon/winshowLemon.png')
    .add('lemonWinShowJSON', '../Media/animations/winshow/lemon/winshowLemon.json')
    .add('orangeWinShow', '../Media/animations/winshow/orange/winshowOrange.png')
    .add('orangeWinShowJSON', '../Media/animations/winshow/orange/winshowOrange.json')
    .add('plumWinShow', '../Media/animations/winshow/plum/winshowPlum.png')
    .add('plumWinShowJSON', '../Media/animations/winshow/plum/winshowPlum.json')
    .add('wmWinShow', '../Media/animations/winshow/wm/winshowWM.png')
    .add('wmWinShowJSON', '../Media/animations/winshow/wm/winshowWM.json')
    .add('sevenWinShow', '../Media/animations/winshow/seven/winshowSeven.png')
    .add('sevenWinShowJSON', '../Media/animations/winshow/seven/winshowSeven.json')
    .add('wildWinShow', '../Media/animations/winshow/wild/winshowWild.png')
    .add('wildWinShowJSON', '../Media/animations/winshow/wild/winshowWild.json')
    .add('bfWinShow', '../Media/animations/winshow/bf/winshowBF.png')
    .add('bfWinShowJSON', '../Media/animations/winshow/bf/winshowBF.json')
    .add('bonusWinShow', '../Media/animations/winshow/bonus/winshowBonus.png')
    .add('bonusWinShowJSON', '../Media/animations/winshow/bonus/winshowBonus.json')
    // bonus burn animations
    .add('cherryBonusBurn', '../Media/animations/bonus_burn/cherry/cherry_anim.png')
    .add('cherryBonusBurnJSON', '../Media/animations/bonus_burn/cherry/cherry_anim.json')
    .add('lemonBonusBurn', '../Media/animations/bonus_burn/lemon/lemon_anim.png')
    .add('lemonBonusBurnJSON', '../Media/animations/bonus_burn/lemon/lemon_anim.json')
    .add('orangeBonusBurn', '../Media/animations/bonus_burn/orange/orange_anim.png')
    .add('orangeBonusBurnJSON', '../Media/animations/bonus_burn/orange/orange_anim.json')
    .add('plumBonusBurn', '../Media/animations/bonus_burn/plum/plum_anim.png')
    .add('plumBonusBurnJSON', '../Media/animations/bonus_burn/plum/plum_anim.json')
    .add('wmBonusBurn', '../Media/animations/bonus_burn/watermelon/waterm_anim.png')
    .add('wmBonusBurnJSON', '../Media/animations/bonus_burn/watermelon/waterm_anim.json')
    // bonus images
    .add('bonusback', '../Media/bonus/back.jpg')
    .add('bonusWinField', '../Media/bonus/bonus_win.png')
    .add('collect_bonus', '../Media/bonus/collect.png')
    .add('collect_bonus_missed', '../Media/bonus/collect_missed.png')
    .add('dialog_bonus_win', '../Media/bonus/dialog_bonus_win.png')
    .add('dialog_box', '../Media/bonus/dialog_box.png')
    .add('bonus_symbols', '../Media/bonus/fruits.png')
    .add('bonus_symbols_disabled', '../Media/bonus/fruits_disabled.png')
    .add('bonus_symbols_missed', '../Media/bonus/fruits_missed.png')
    .add('bonus_symbols_over', '../Media/bonus/fruits_over.png')
    // buttons
    .add('auto_start', '../Media/interface_ro/autoplay.png')
    .add('auto_start_dis', '../Media/interface_ro/autoplay_disabled.png')
    .add('auto_start_pressed', '../Media/interface_ro/autoplay_pressed.png')
    .add('auto_start_stop', '../Media/interface_ro/autoplay_stop.png')
    .add('auto_start_stop_dis', '../Media/interface_ro/autoplay_stop_disabled.png')
    .add('auto_start_stop_pressed', '../Media/interface_ro/autoplay_stop_down.png')
    .add('stake_field', '../Media/interface_ro/bet.png')
    .add('stake_field_dis', '../Media/interface_ro/bet_disabled.png')
    .add('stake_field_pressed', '../Media/interface_ro/bet_pressed.png')
    .add('collect', '../Media/interface_ro/collect.png')
    .add('collect_dis', '../Media/interface_ro/collect_disabled.png')
    .add('collect_pressed', '../Media/interface_ro/collect_pressed.png')
    .add('gamble', '../Media/interface_ro/gamble.png')
    .add('gamble_dis', '../Media/interface_ro/gamble_disabled.png')
    .add('gamble_pressed', '../Media/interface_ro/gamble_pressed.png')
    .add('help', '../Media/interface_ro/help.png')
    .add('help_dis', '../Media/interface_ro/help_disabled.png')
    .add('help_pressed', '../Media/interface_ro/help_pressed.png')
    .add('maxbet', '../Media/interface_ro/max_bet.png')
    .add('maxbet_dis', '../Media/interface_ro/max_bet_disabled.png')
    .add('maxbet_pressed', '../Media/interface_ro/max_bet_pressed.png')
    .add('menu', '../Media/interface_ro/menu.png')
    .add('menu_dis', '../Media/interface_ro/menu_disabled.png')
    .add('menu_pressed', '../Media/interface_ro/menu_pressed.png')
    .add('start', '../Media/interface_ro/spin.png')
    .add('start_dis', '../Media/interface_ro/spin_disabled.png')
    .add('start_pressed', '../Media/interface_ro/spin_pressed.png')
    .add('start_bonus', '../Media/interface_ro/start_bonus.png')
    .add('start_bonus_dis', '../Media/interface_ro/start_bonus_disabled.png')
    .add('start_bonus_pressed', '../Media/interface_ro/start_bonus_pressed.png')
    .add('stop', '../Media/interface_ro/stop.png')
    .add('stop_dis', '../Media/interface_ro/stop_disabled.png')
    .add('stop_pressed', '../Media/interface_ro/stop_pressed.png')
    .add('test', '../Media/sounds/spin_button.mp3')
    // denom panel
    .add('bet', '../Media/interface_ro/bet.png')
    .add('bet_dis', '../Media/interface_ro/bet_disabled.png')
    .add('bet_pressed', '../Media/interface_ro/bet_pressed.png')
    .add('denomTop', '../Media/denomination_panel/top.png')
    .add('denomBottom', '../Media/denomination_panel/bottom.png')
    .add('denomMiddle', '../Media/denomination_panel/middle.png')
    .add('denomSel', '../Media/denomination_panel/active_stake.png')
    // Fields
    .add('balance_field', '../Media/interface_ro/balance1.png')
    .add('hide_cr_img', '../Media/interface_ro/hide_credits.png')
    .add('show_cr_img', '../Media/interface_ro/show_credit.png')
    .add('total_win_field', '../Media/interface_ro/total_win_field1.png')
    // help screens
    .add('main_help_page', '../Media/help/1.jpg')
    .add('bonus_help_page', '../Media/help/2.jpg')
    .add('gamble_help_page', '../Media/help/3.jpg')
    .add('lines_help_page', '../Media/help/25lines.jpg')
    .add('inhelp_buttons', '../Media/help/buttons.png')
    .add('inhelp_buttons_pressed', '../Media/help/buttons_down.png')
    // Gamble screen
    .add('gamble_bg', '../Media/gamblescreen/back_rob.jpg')
    .add('cardback', '../Media/gamblescreen/cardback.png')
    .add('cardback_small', '../Media/gamblescreen/cardback_small.png')
    .add('cards', '../Media/gamblescreen/cards_3.jpg')
    .add('gamble_collect', '../Media/gamblescreen/collect_btn.png')
    .add('gamble_collect_dis', '../Media/gamblescreen/collect_btn_disabled.png')
    .add('gamble_collect_pressed', '../Media/gamblescreen/collect_btn_down.png')
    .add('red_black', '../Media/gamblescreen/red_black.png')
    .add('red_black_dis', '../Media/gamblescreen/red_black_disabled.png')
    .add('red_black_pressed', '../Media/gamblescreen/red_black_down.png')
    .add('bank_bg', '../Media/gamblescreen/bank_bg.png')
    .add('gamble_text_bg', '../Media/gamblescreen/gamble_text_bg.png');


loader.load((loader, resources) => {
    // resources is an object where the key is the name of the resource loaded and the value is the resource object.
    // They have a couple default properties:
    // - `url`: The URL that the resource was loaded from
    // - `error`: The error that happened when trying to load (if any)
    // - `data`: The raw data that was loaded
    // also may contain other properties based on the middleware that runs.
    document.body.appendChild(app.view);

    SoundsManager = new SoundsManagerClass(resources);

    let mainHelpScene = new Scenes.MainHelpScene(resources);
    SCENE_MANAGER.AddGameScene('mainHelp', mainHelpScene);
    let bonusHelpScene = new Scenes.BonusHelpScene(resources);
    SCENE_MANAGER.AddGameScene('bonusHelp', bonusHelpScene);
    let gambleHelpScene = new Scenes.GambleHelpScene(resources);
    SCENE_MANAGER.AddGameScene('gambleHelp', gambleHelpScene);
    let linesHelpScene = new Scenes.WinLinesHelpScene(resources);
    SCENE_MANAGER.AddGameScene('linesHelp', linesHelpScene);

    baseGameScene = new Scenes.BaseGameScene(resources);
    SCENE_MANAGER.AddGameScene('baseGame', baseGameScene);
    baseGameController = new BaseGameController(baseGameScene);

    bonusGameScene = new Scenes.BonusGameScene(resources);
    SCENE_MANAGER.AddGameScene('bonusGame', bonusGameScene);
    bonusController = new BonusGameController(bonusGameScene);


    gambleScene = new Scenes.GambleScene(resources);
    gambleController = new GambleController(gambleScene);
    SCENE_MANAGER.AddGameScene('gamble', gambleScene);

    SCENE_MANAGER.goToGameScene('baseGame');



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


