(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helperFuncs_1 = require("../Utils/helperFuncs");
const main_1 = require("../main");
const reelsConfig_1 = require("../ReelSpinner/reelsConfig");
class BaseGameController {
    constructor(scene) {
        this.balance = 10000;
        this.totalWin = 100;
        this.currentStake = 100;
        this.scene = scene;
        // this.WinShowController = new WinShowController(scene);
        // this.scene.balanceField.addValue(this.balance);
        // this.stakes = scene.stakeButton.stakes;
        this.buttonStates = {
            'idle': [
                { 'button': this.scene.startButton, 'state': 'enable' }
                // {'button': this.scene.stopButton, 'state': 'hide'},
                // {'button': scene.collectButton, 'state': 'hide'},
                // {'button': scene.startBonusButton, 'state': 'hide'},
                // {'button': scene.maxBetButton, 'state': 'enable'},
                // {'button': scene.autoStartButton, 'state': 'enable'},
                // {'button': scene.cancelAutoStartButton, 'state': 'hide'},
                // {'button': scene.stakeButton, 'state': 'enable'},
                // {'button': scene.gambleButton, 'state': 'disable'},
                // {'button': scene.helpButton, 'state': 'enable'},
                // {'button': scene.menuButton, 'state': 'enable'},
            ],
            'round': [
                { 'button': this.scene.startButton, 'state': 'hide' }
                // {'button': this.scene.stopButton, 'state': 'enable'},
                // {'button': scene.collectButton, 'state': 'hide'},
                // {'button': scene.startBonusButton, 'state': 'hide'},
                // {'button': scene.maxBetButton, 'state': 'disable'},
                // {'button': scene.autoStartButton, 'state': 'disable'},
                // {'button': scene.cancelAutoStartButton, 'state': 'hide'},
                // {'button': scene.stakeButton, 'state': 'disable'},
                // {'button': scene.gambleButton, 'state': 'disable'},
                // {'button': scene.helpButton, 'state': 'disable'},
                // {'button': scene.menuButton, 'state': 'disable'},
            ],
            'collect': [
                { 'button': this.scene.startButton, 'state': 'hide' }
                // {'button': this.scene.stopButton, 'state': 'hide'},
                // {'button': scene.collectButton, 'state': 'enable'},
                // {'button': scene.startBonusButton, 'state': 'hide'},
                // {'button': scene.maxBetButton, 'state': 'disable'},
                // {'button': scene.autoStartButton, 'state': 'disable'},
                // {'button': scene.cancelAutoStartButton, 'state': 'hide'},
                // {'button': scene.stakeButton, 'state': 'disable'},
                // {'button': scene.gambleButton, 'state': 'enable'},
                // {'button': scene.helpButton, 'state': 'disable'},
                // {'button': scene.menuButton, 'state': 'disable'},
            ]
        };
        this.onStartButton = function () {
            this.onStartButtonFunc();
        }.bind(this);
        this.onReelsStop = function () {
            this.onReelsStopFunc();
        }.bind(this);
        this.onSlamOut = function () {
            this.onSlamOutFunc();
        }.bind(this);
        this.onStakeButton = function () {
            this.onStakeButtonFunc();
        }.bind(this);
        this.onChangeStake = function (e) {
            this.onChangeStakeFunc(e);
        }.bind(this);
        this.onMaxBet = function () {
            this.onMaxBetButtonFunc();
        }.bind(this);
        this.onGamble = function () {
            this.onGambleFunc();
        }.bind(this);
        this.setState('idle');
        this.addEventListeners();
    }
    setState(state) {
        this.state = state;
        if (state == 'idle') {
            this.enableWinLineButtons();
        }
        else {
            this.disableWinLineButtons();
        }
        // set button states:
        let buttonState = this.buttonStates[this.state];
        for (let i = 0; i < buttonState.length; i++) {
            if (buttonState[i].state == 'enable') {
                buttonState[i].button.enable();
            }
            else if (buttonState[i].state == 'disable') {
                buttonState[i].button.disable();
            }
            else if (buttonState[i].state == 'hide') {
                buttonState[i].button.hide();
            }
        }
    }
    addEventListeners() {
        document.addEventListener('StartButtonPressed', this.onStartButton);
        document.addEventListener('LastReelStopped', this.onReelsStop);
        document.addEventListener('StopButtonPressed', this.onSlamOut);
        document.addEventListener('BetButtonPressed', this.onStakeButton);
        document.addEventListener('changeStakeEvent', this.onChangeStake);
        document.addEventListener('MaxBetButtonPressed', this.onMaxBet);
        document.addEventListener('GambleButtonPressed', this.onGamble);
        document.addEventListener('MenuButtonPressed', function () {
            //GDKWrapper.GameExit();
            window.close();
        });
        document.addEventListener('StartBonusButtonPressed', function () {
            // SCENE_MANAGER.goToGameScene('bonusGame');
            // bonusController.startBonus();
        });
        document.addEventListener('HelpButtonPressed', function () {
            main_1.SCENE_MANAGER.goToGameScene('mainHelp');
        });
        document.addEventListener('ClickedOnBaseGameScene', function () {
            // if (this.scene.stakeButton.isShown){
            //     this.scene.stakeButton.hidePanel();
            // }
        }.bind(this));
        document.addEventListener('exitGambleEvent', function () {
            // this.totalWin = gambleController.bank;
            // this.onCollect();
        }.bind(this));
        document.addEventListener('CollectButtonPressed', function () {
            this.onCollect();
        }.bind(this));
    }
    removeEventListeners() {
        document.removeEventListener('StartButtonPressed', this.onStartButton);
    }
    onSlamOutFunc() {
        this.scene.REELS.slamout();
    }
    onStartButtonFunc() {
        this.setState('round');
        // this.scene.totalWinField.counter.reset();
        this.balance -= this.currentStake;
        // this.scene.balanceField.substractValue(this.currentStake);
        // this.WinShowController.updatePayouts(response);
        this.totalWin = reelsConfig_1.response.data.gameData.totalWinAmount;
        let stops = this.getStopsArray(reelsConfig_1.response);
        this.scene.REELS.spin(stops);
    }
    getStopsArray(roundResponse) {
        let symbolUpdates = roundResponse.data.gameData.playStack[0].lastPlayInModeData.slotsData.actions[0].transforms[0].symbolUpdates, result = [[], [], [], [], []];
        for (let i = 0; i < symbolUpdates.length; i++) {
            result[symbolUpdates[i].reelIndex][symbolUpdates[i].positionOnReel] = symbolUpdates[i].symbol;
        }
        return result;
    }
    onReelsStopFunc() {
        if (this.totalWin == 0) {
            this.setState('idle');
            this.checkIfBetPossible();
        }
        else {
            this.setState('collect');
            this.scene.interactive = true;
            this.WinShowController.playWinShow();
            // this.scene.totalWinField.addValue(this.totalWin);
        }
    }
    onStakeButtonFunc() {
        if (this.scene.stakeButton.isShown) {
            let currentStakeIndex = this.scene.stakeButton.stakes.indexOf(this.scene.stakeButton.currentStakeAmount), nextStake = helperFuncs_1.nextItem(this.scene.stakeButton.stakes, currentStakeIndex);
            this.scene.stakeButton.changeStake(nextStake);
        }
        else {
            this.scene.stakeButton.showPanel();
        }
    }
    checkIfBetPossible() {
        if (this.balance < this.currentStake) {
            this.scene.startButton.disable();
            // this.scene.autoStartButton.disable();
            return false;
        }
        else {
            this.scene.startButton.enable();
            // this.scene.autoStartButton.enable();
            return true;
        }
    }
    onChangeStakeFunc(event) {
        this.currentStake = event.detail.newStake;
        this.checkIfBetPossible();
    }
    onMaxBetButtonFunc() {
        for (let i = 0; i < this.stakes.length; i++) {
            if (this.balance < this.stakes[i]) {
                continue;
            }
            else {
                this.scene.stakeButton.changeStake(this.stakes[i]);
                break;
            }
        }
    }
    onGambleFunc() {
        // SCENE_MANAGER.goToGameScene('gamble');
        // gambleController.startGamble(this.totalWin);
    }
    onCollect() {
        this.scene.totalWinField.counter.reset();
        this.scene.balanceField.addValue(this.totalWin);
        this.balance += this.totalWin;
        this.totalWin = 0;
        this.setState('idle');
    }
    disableWinLineButtons() {
        // for (let i=0; i<this.scene.winLinesArray.length; i++) {
        //     this.scene.winLinesArray[i].disable();
        // }
    }
    enableWinLineButtons() {
        // for (let i=0; i<this.scene.winLinesArray.length; i++) {
        //     this.scene.winLinesArray[i].enable();
        // }
    }
}
exports.BaseGameController = BaseGameController;

},{"../ReelSpinner/reelsConfig":9,"../Utils/helperFuncs":12,"../main":13}],2:[function(require,module,exports){
/**
 * Created by tarasg on 9/25/2017.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let GambleRedPressed = new CustomEvent("GambleRedPressed"), GambleBlackPressed = new CustomEvent("GambleBlackPressed"), GambleCollectPressed = new CustomEvent("GambleCollectPressed"), ClickedOnBaseGameScene = new CustomEvent("ClickedOnBaseGameScene"), BetButtonPressed = new CustomEvent('BetButtonPressed'), GambleButtonPressed = new CustomEvent('GambleButtonPressed'), AutoStartButtonPressed = new CustomEvent('AutoStartButtonPressed'), MaxBetButtonPressed = new CustomEvent('MaxBetButtonPressed'), ExitHelpButtonPressed = new CustomEvent('ExitHelpButtonPressed'), PrevHelpPageButtonPressed = new CustomEvent('PrevHelpPageButtonPressed'), NextHelpPageButtonPressed = new CustomEvent('NextHelpPageButtonPressed'), HelpButtonPressed = new CustomEvent('HelpButtonPressed'), MenuButtonPressed = new CustomEvent('MenuButtonPressed'), StopButtonPressed = new CustomEvent('StopButtonPressed'), StartBonusButtonPressed = new CustomEvent('StartBonusButtonPressed'), CollectButtonPressed = new CustomEvent('CollectButtonPressed'), StartButtonPressed = new CustomEvent('StartButtonPressed'), CancelAutoStartButtonPressed = new CustomEvent('CancelAutoStartButtonPressed');
exports.ButtonEvents = {
    'ClickedOnBaseGameScene': ClickedOnBaseGameScene,
    'StartButtonPressed': StartButtonPressed,
    'StopButtonPressed': StopButtonPressed,
    'CollectButtonPressed': CollectButtonPressed,
    'StartBonusButtonPressed': StartBonusButtonPressed,
    'MenuButtonPressed': MenuButtonPressed,
    'HelpButtonPressed': HelpButtonPressed,
    'GambleButtonPressed': GambleButtonPressed,
    'BetButtonPressed': BetButtonPressed,
    'MaxBetButtonPressed': MaxBetButtonPressed,
    'AutoStartButtonPressed': AutoStartButtonPressed,
    'CancelAutoStartButtonPressed': CancelAutoStartButtonPressed,
    'NextHelpPageButtonPressed': NextHelpPageButtonPressed,
    'PrevHelpPageButtonPressed': PrevHelpPageButtonPressed,
    'ExitHelpButtonPressed': ExitHelpButtonPressed,
    'GambleCollectPressed': GambleCollectPressed,
    'GambleRedPressed': GambleRedPressed,
    'GambleBlackPressed': GambleBlackPressed,
};

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by tarasg on 9/22/2017.
 */
/**
 * Created by tarasg on 5/10/2017.
 */
const main_1 = require("../main");
const utils = require("../Utils/helperFuncs");
const buttonNames_1 = require("./buttonNames");
class Button {
    constructor(scene, x, y, buttonName, resources, action) {
        // enabled_img, dis_img, pressed_img:  PIXI.Textutre or string url to the image
        this.x = x;
        this.y = y;
        this.scene = scene;
        this.textureEnabled = resources[buttonNames_1.buttonResources[buttonName].enabled];
        this.textureDisabled = resources[buttonNames_1.buttonResources[buttonName].disabled];
        this.texturePressed = resources[buttonNames_1.buttonResources[buttonName].pressed];
        this.onButtonClick = action;
        this.sprite = new PIXI.Sprite(this.textureEnabled);
        this.sprite.interactive = true;
        this.sprite.buttonMode = true;
        this.isDown = false;
        this.state = 'enabled';
        this.sprite.anchor.set(0.5, 0.5);
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        this.sprite.on('pointerdown', function (e) {
            this.isDown = true;
            this.sprite.texture = this.texturePressed;
        }.bind(this));
        this.sprite.on('pointerup', function (e) {
            this.sprite.texture = this.textureEnabled;
            if (this.isDown)
                this.onButtonClick();
            this.isDown = false;
        }.bind(this));
        this.sprite.on('pointerout', function () {
            this.sprite.texture = this.textureEnabled;
            this.isDown = false;
        }.bind(this));
        this.scene.addChild(this.sprite);
        this.sprite.model = this;
    }
    hide() {
        this.sprite.visible = false;
    }
    show() {
        this.sprite.visible = true;
    }
    disable() {
        this.state = 'disabled';
        this.sprite.texture = this.textureDisabled;
        this.sprite.interactive = false;
    }
    enable() {
        this.state = 'enabled';
        this.sprite.visible = true;
        this.sprite.texture = this.textureEnabled;
        this.sprite.interactive = true;
    }
    click() {
        this.state = 'pressed';
        this.sprite.texture = this.texturePressed;
        this.sprite.interactive = false;
    }
}
exports.Button = Button;
class DenominationPanelButton extends Button {
    constructor(scene, x, y, fontStyle, stakeFontStyle, denomBottom, denomTop, denomMid, denomSelect, enabled_img, dis_img, pressed_img, sound, action) {
        super(scene, x, y, enabled_img, enabled_img, action);
        this.stakesYpos = [];
        this.isShown = false;
        this.selectedStake = new PIXI.Text('', fontStyle);
        this.fontStyle = fontStyle;
        this.stakeFontStyle = stakeFontStyle;
        this.denomPartContainers = [];
        if (typeof denomBottom === "string" && typeof denomTop === "string" && typeof denomMid === "string" && typeof denomSelect === "string") {
            this.denomBottom = PIXI.Texture.fromImage(denomBottom);
            this.denomTop = PIXI.Texture.fromImage(denomTop);
            this.denomMiddle = PIXI.Texture.fromImage(denomMid);
            this.denomSelected = PIXI.Texture.fromImage(denomSelect);
        }
        else {
            this.denomBottom = denomBottom;
            this.denomTop = denomTop;
            this.denomMiddle = denomMid;
            this.denomSelected = denomSelect;
        }
        this.enableEventPropagination();
        this.getStakes();
        this.initializeDenominationPanel();
        this.intitializeCurrentStake();
    }
    initializeDenominationPanel() {
        this.denomSpriteBottom = new PIXI.Sprite(this.denomBottom);
        this.denomSpriteMiddle = new PIXI.Sprite(this.denomMiddle);
        this.denomSpriteTop = new PIXI.Sprite(this.denomTop);
        this.denomSpriteSelected = new PIXI.Sprite(this.denomSelected);
        this.denomPanelContainer = new PIXI.Container();
        this.denomPanelContainer.visible = false;
        this.denomPanelContainer.alpha = 0;
        this.denomPanelContainer.x = this.sprite.x - this.sprite.width / 2;
        this.denomPanelContainer.y = (this.sprite.y - this.sprite.height / 2) - this.denomSpriteTop.height - (this.denomSpriteMiddle.height * (this.stakes.length - 2)) - this.denomSpriteBottom.height;
        for (let i = 0; i < this.stakes.length; i++) {
            this.addDenomPanelPart(i);
        }
        this.scene.addChild(this.denomPanelContainer);
    }
    addDenomPanelPart(index) {
        let partContainer = new PIXI.Container(), stake = new PIXI.Text(utils.formatStakeAmount(this.stakes[index]), this.fontStyle), partSprite;
        stake.anchor.set(0.5, 0.5);
        stake.x = this.denomSpriteMiddle.width / 2;
        stake.y = this.denomSpriteMiddle.height / 2;
        if (index == 0) {
            partSprite = this.denomSpriteTop;
            stake.y = partSprite.height - this.denomSpriteMiddle.height / 2;
            partContainer.y = 0;
        }
        else if (index == this.stakes.length - 1) {
            partSprite = this.denomSpriteBottom;
            partContainer.y = this.denomSpriteTop.height + (this.denomSpriteMiddle.height * (this.stakes.length - 2));
        }
        else {
            partSprite = new PIXI.Sprite(this.denomMiddle);
            partContainer.y = this.denomSpriteTop.height + (this.denomSpriteMiddle.height * (index - 1));
        }
        this.stakesYpos.push(partContainer.y + stake.y);
        partContainer.addChild(partSprite);
        partContainer.interactive = true;
        partContainer.on('pointerdown', function (e) {
            e.stopPropagation();
            this.changeStake(this.stakes[index]);
        }.bind(this));
        partContainer.addChild(stake);
        this.denomPartContainers.push(partContainer);
        this.denomPanelContainer.addChild(partContainer);
    }
    getStakes() {
        this.stakes = [20, 40, 60, 80, 100].reverse();
        this.currentStakeAmount = this.stakes[0];
    }
    intitializeCurrentStake() {
        this.selectedStake = new PIXI.Text(utils.formatStakeAmount(this.currentStakeAmount), this.stakeFontStyle);
        this.selectedStake.anchor.set(0.5, 0.5);
        this.selectedStake.x = this.sprite.x;
        this.selectedStake.y = this.sprite.y + 5; // +5 due to graphics issue
        this.scene.addChild(this.selectedStake);
        this.denomSpriteSelected.anchor.set(0.5, 0.5);
        this.denomSpriteSelected.alpha = 0.2;
        this.denomSpriteSelected.x = this.denomSpriteMiddle.width / 2;
        this.denomSpriteSelected.y = this.getSelectedStakeYpos();
        this.denomPanelContainer.addChild(this.denomSpriteSelected);
    }
    getSelectedStakeYpos() {
        let index = this.stakes.indexOf(this.currentStakeAmount);
        return this.stakesYpos[index];
    }
    enableEventPropagination() {
        this.sprite.on('pointerdown', function (e) {
            e.stopPropagation();
            this.isDown = true;
            this.sound.currentTime = 0;
            this.sound.play();
            this.sprite.texture = this.texturePressed;
        }.bind(this));
        this.sprite.on('pointerup', function (e) {
            e.stopPropagation();
            this.sprite.texture = this.textureEnabled;
            if (this.isDown)
                this.onClick();
            this.isDown = false;
        }.bind(this));
    }
    showPanel() {
        if (!this.isShown)
            main_1.app.ticker.add(showPanelAnimation, this);
        function showPanelAnimation(timedelta) {
            this.denomPanelContainer.visible = true;
            this.denomPanelContainer.alpha = Math.min((this.denomPanelContainer.alpha + (0.08 * timedelta)), 1);
            if (this.denomPanelContainer.alpha == 1) {
                this.isShown = true;
                this.scene.interactive = true;
                main_1.app.ticker.remove(showPanelAnimation, this);
            }
        }
    }
    hidePanel() {
        if (this.isShown)
            main_1.app.ticker.add(hidePanelAnimation, this);
        function hidePanelAnimation(timedelta) {
            this.denomPanelContainer.alpha = Math.max((this.denomPanelContainer.alpha - (0.08 * timedelta)), 0);
            if (this.denomPanelContainer.alpha == 0) {
                this.denomPanelContainer.visible = false;
                this.isShown = false;
                this.scene.interactive = false;
                main_1.app.ticker.remove(hidePanelAnimation, this);
            }
        }
    }
    changeStake(to) {
        let toY = this.stakesYpos[this.stakes.indexOf(to)];
        this.setInteractiveForPartContainers(false);
        this.selectedStake.text = utils.formatStakeAmount(to);
        let changeStakeEvent = new CustomEvent('changeStakeEvent', { 'detail': { 'newStake': to } });
        document.dispatchEvent(changeStakeEvent);
        main_1.app.ticker.add(changeStakeAnimation, this);
        function changeStakeAnimation(timedelta) {
            if (this.denomSpriteSelected.y < toY) {
                this.denomSpriteSelected.y = Math.min(this.denomSpriteSelected.y + timedelta * 30, toY);
            }
            else if (this.denomSpriteSelected.y > toY) {
                this.denomSpriteSelected.y = Math.max(this.denomSpriteSelected.y - timedelta * 30, toY);
            }
            else {
                this.currentStakeAmount = to;
                this.setInteractiveForPartContainers(true);
                main_1.app.ticker.remove(changeStakeAnimation, this);
            }
        }
    }
    setInteractiveForPartContainers(value) {
        for (let i = 0; i < this.denomPartContainers.length; i++) {
            this.denomPartContainers[i].interactive = value;
        }
    }
}
exports.DenominationPanelButton = DenominationPanelButton;

},{"../Utils/helperFuncs":12,"../main":13,"./buttonNames":4}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buttonResources = {
    'StartButton': {
        'enabled': 'BTN_Spin',
        'disabled': 'BTN_Spin_d',
        'pressed': 'BTN_Spin_d'
    },
    'StopButton': {
        'enabled': 'BTN_Spin',
        'disabled': 'BTN_Spin_d',
        'pressed': 'BTN_Spin_d'
    }
};

},{}],5:[function(require,module,exports){
/**
 * Created by tarasg on 10/11/2017.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Symbol1 = {
    name: 'SYM1',
    reelValue: 1
};
exports.Symbol3 = {
    name: 'SYM3',
    reelValue: 3
};
exports.Symbol4 = {
    name: 'SYM4',
    reelValue: 4
};
exports.Symbol5 = {
    name: 'SYM5',
    reelValue: 5
};
exports.Symbol6 = {
    name: 'SYM6',
    reelValue: 6
};
exports.Symbol7 = {
    name: 'SYM7',
    reelValue: 7
};
exports.SYMBOLS = [exports.Symbol1, exports.Symbol3, exports.Symbol4, exports.Symbol5, exports.Symbol6, exports.Symbol7];
exports.showSymbols = [exports.Symbol1, exports.Symbol3, exports.Symbol4, exports.Symbol5, exports.Symbol6, exports.Symbol7];

},{}],6:[function(require,module,exports){
/**
 * Created by tarasg on 10/13/2017.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = require("../ReelSpinner/reelsConfig");
const MainRoundSymbols_1 = require("./MainRoundSymbols");
const main_1 = require("../main");
const ReelSets_1 = require("./ReelSets");
class ReelN {
    constructor(x, y, index, reelsContainer, resources) {
        this.x = x;
        this.y = y;
        this.index = index;
        this.resources = resources;
        this.symbolsAmount = config.ReelsConfig.reels[index].symbolsAmount;
        this.SpinningTime = config.ReelsConfig.reels[index].SpinningTime;
        this.SpinningSpeed = config.ReelsConfig.spinningSpeed;
        this.reelsContainer = reelsContainer;
        this.reelMask = new PIXI.Graphics();
        this.visibleSymbolsArray = [];
        this.reelValuesMath = ReelSets_1.ReelSet[index];
        this.spinningIndex = 0;
        this.tempReel = [];
        this.visibleSprites = [];
        this.winShowTime = 2000;
        // this.reelStopSound = new Audio(resources.reelstop.url);
        this.isSlamout = false;
        this.InitializeReel();
        this.initializeMask();
    }
    getRandomSymbol() {
        return MainRoundSymbols_1.SYMBOLS[Math.floor(Math.random() * MainRoundSymbols_1.SYMBOLS.length)];
    }
    InitializeReel() {
        this.reelContainer = new PIXI.Container();
        this.reelContainer.x = this.x;
        this.reelContainer.y = this.y;
        this.y_delta = 0;
        this.reelSymbolsAmount = this.symbolsAmount + this.calculateSymbolsAmount();
        this.reelContStopY = (this.reelSymbolsAmount - this.symbolsAmount) * config.symbolHeight;
        for (let i = 0; i < this.reelSymbolsAmount; i++) {
            let symbol = this.getRandomSymbol(), sprite = new PIXI.Sprite(this.resources[symbol.name]);
            sprite.y = config.symbolHeight * (this.symbolsAmount - i - 1);
            this.tempReel.push(sprite);
            this.reelContainer.addChildAt(sprite, i);
        }
        this.reelContainer.y += this.reelContStopY;
        this.reelsContainer.addChild(this.reelContainer);
    }
    initializeMask() {
        // creates mask around the reelContainer
        this.reelsContainer.addChild(this.reelMask);
        this.reelMask.lineStyle(0);
        this.reelContainer.mask = this.reelMask;
        this.reelMask.beginFill(0x8bc5ff, 0.1);
        this.reelMask.moveTo(this.x, this.y);
        this.reelMask.lineTo(this.x + config.symbolWidth, this.y);
        this.reelMask.lineTo(this.x + config.symbolWidth, (this.y + config.symbolHeight) * this.symbolsAmount);
        this.reelMask.lineTo(this.x, (this.y + config.symbolHeight) * this.symbolsAmount);
        this.reelMask.lineTo(this.x, this.y);
    }
    startSpinAnimation(stopSymbols) {
        this.stopSymbols = stopSymbols;
        main_1.app.ticker.add(animateStarSpin, this);
        let position = this.reelContainer.y;
        function animateStarSpin(timedelta) {
            if (this.reelContainer.y > position - config.StartAnimDelta) {
                this.reelContainer.y -= Math.floor(config.StartAnimSpeed * timedelta);
            }
            else {
                main_1.app.ticker.remove(animateStarSpin, this);
                this.spinAnimation(stopSymbols);
            }
        }
    }
    calculateSymbolsAmount() {
        let distancePX = config.ReelsConfig.spinningSpeed * 60 * (this.SpinningTime / 1000);
        return Math.floor(distancePX / config.symbolHeight);
    }
    slamOut() {
        this.isSlamout = true;
        this.reelContainer.y = this.reelContStopY;
    }
    swapCurrentVisibleTextures() {
        for (let i = 0; i < this.symbolsAmount; i++) {
            let texture = this.tempReel[this.tempReel.length - 1 - i].texture;
            this.tempReel[this.symbolsAmount - 1 - i].texture = texture;
        }
    }
    setStopSymbols(stopSymbols) {
        for (let i = 0; i < stopSymbols.length; i++) {
            let texture = this.resources[MainRoundSymbols_1.SYMBOLS[stopSymbols[i]].name];
            this.tempReel[this.reelSymbolsAmount - i - 1].texture = texture;
        }
    }
    spinAnimation(stopSymbols) {
        let self = this;
        this.isSlamout = false;
        // swap visible elements
        this.swapCurrentVisibleTextures();
        this.reelContainer.y -= this.reelContStopY;
        this.setStopSymbols(stopSymbols);
        main_1.app.ticker.add(animateSpin, this);
        function smoothStop() {
            let down = true, startY = self.reelContainer.y, stopY = self.reelContainer.y + config.ReelsConfig.reelStopDelta;
            main_1.app.ticker.add(stopAnimation, self);
            function stopAnimation(timedelta) {
                if (self.reelContainer.y < stopY && down) {
                    self.reelContainer.y += config.ReelsConfig.reelStopSpeed * timedelta;
                }
                else if (self.reelContainer.y >= stopY && down) {
                    down = false;
                }
                else {
                    self.reelContainer.y = Math.max(self.reelContainer.y - Math.floor(config.ReelsConfig.reelStopDelta * timedelta * 0.1), startY);
                    if (self.reelContainer.y == startY) {
                        main_1.app.ticker.remove(stopAnimation, self);
                        if (self.index == config.ReelsConfig.reels.length - 1) {
                            let event = new CustomEvent('LastReelStopped');
                            document.dispatchEvent(event);
                        }
                    }
                }
            }
            `  `;
        }
        function animateSpin(timedelta) {
            if (this.reelContainer.y < this.reelContStopY) {
                this.reelContainer.y = Math.min(this.reelContainer.y + Math.floor(timedelta * this.SpinningSpeed), this.reelContStopY);
            }
            else {
                main_1.app.ticker.remove(animateSpin, this);
                smoothStop();
            }
        }
    }
    playWinShow(symbol, index) {
        // hide symbol sprite
        this.tempReel[this.reelSymbolsAmount - index - 1].visible = false;
        // get symbol winshow animation
        // let iSymbol = SYMBOLS[symbol];
        // this.WinShowAnimation = iSymbol.winShowAnimation();
        // this.reelContainer.addChild(this.WinShowAnimation);
        // this.WinShowAnimation.y = this.tempReel[this.reelSymbolsAmount-index-1].y;
        // this.WinShowAnimation.loop = true;
        // this.WinShowAnimation.play();
        // setTimeout(function () {
        //     let winShowEndEvent = new CustomEvent('ReelWinShowAnimEnd', {'detail': {'reelIndex': this.index}});
        //     document.dispatchEvent(winShowEndEvent);
        // }.bind(this), this.winShowTime)
    }
    stopWinShow(index) {
        // this.WinShowAnimation.stop();
        // this.WinShowAnimation.visible = false;
        // show symbol sprite
        this.tempReel[this.reelSymbolsAmount - index - 1].visible = true;
    }
}
exports.ReelN = ReelN;

},{"../ReelSpinner/reelsConfig":9,"../main":13,"./MainRoundSymbols":5,"./ReelSets":7}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by tarasg on 40/44/1041.
 */
exports.ReelSet = [
    [4, 1, 6, 6, 1, 3, 5, 4, 6, 3, 5, 7, 4, 5, 3, 4, 4, 3, 6, 7, 4, 5, 6, 7, 5, 4, 1, 5, 5, 3, 1, 4, 5, 3, 4, 1, 5, 4, 6, 1, 3, 6, 4, 4, 4, 4, 4, 7, 5, 3],
    [6, 4, 1, 5, 7, 3, 4, 6, 1, 4, 4, 3, 7, 4, 4, 6, 1, 4, 5, 6, 7, 4, 4, 1, 6, 4, 3, 4, 7, 0, 4, 6, 4, 4, 4, 4, 1, 3, 4, 4, 7, 6, 5, 4, 3, 1, 4, 4, 7, 5],
    [4, 4, 6, 1, 6, 3, 5, 4, 7, 3, 5, 1, 4, 5, 3, 4, 4, 3, 7, 6, 4, 5, 3, 1, 5, 4, 4, 5, 4, 3, 7, 5, 5, 3, 4, 1, 5, 4, 7, 6, 3, 1, 4, 0, 4, 4, 4, 7, 5, 3],
    [1, 4, 1, 5, 1, 3, 4, 5, 4, 4, 5, 3, 1, 4, 4, 1, 1, 4, 5, 1, 1, 4, 5, 4, 1, 4, 3, 4, 1, 0, 5, 1, 4, 4, 4, 4, 1, 3, 4, 4, 5, 1, 5, 4, 3, 1, 4, 4, 1, 5],
    [4, 4, 1, 1, 1, 1, 4, 4, 1, 3, 5, 1, 4, 1, 3, 4, 4, 1, 1, 1, 4, 3, 4, 1, 5, 4, 4, 5, 5, 3, 1, 4, 4, 3, 4, 1, 1, 4, 1, 1, 3, 1, 4, 4, 4, 4, 4, 1, 5, 3]
];

},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import {Reel} from "./Reel";
const reelsConfig_1 = require("./reelsConfig");
const NewReel_1 = require("./NewReel");
class ReelSpinner {
    constructor(scene, resources) {
        this.scene = scene;
        this.resources = resources;
        this.reelsArray = [];
        // this.reelSpinSound = new Audio(resources.reelspin.url);
        // this.reelStopSound = new Audio(resources.reelstop.url);
        this.initializeReels();
    }
    initializeReels() {
        this.reelsContainer = new PIXI.Container();
        this.reelsContainer.x = reelsConfig_1.ReelsConfig.x;
        this.reelsContainer.y = reelsConfig_1.ReelsConfig.y;
        this.reelsDelay = reelsConfig_1.ReelsConfig.reelsDelay;
        for (let i = 0; i < reelsConfig_1.ReelsConfig.reels.length; i++) {
            let x = reelsConfig_1.ReelsConfig.reels[i].x, y = reelsConfig_1.ReelsConfig.reels[i].y;
            let reel = new NewReel_1.ReelN(x, y, i, this.reelsContainer, this.resources);
            this.reelsArray.push(reel);
        }
        this.scene.addChild(this.reelsContainer);
    }
    spin(results) {
        let reelsDelay = this.reelsDelay;
        // this.reelSpinSound.currentTime = 0;
        // this.reelSpinSound.play();
        for (let i = 0; i < this.reelsArray.length; i++) {
            let animation = this.reelsArray[i].startSpinAnimation.bind(this.reelsArray[i]);
            (function (i) {
                setTimeout(animation, reelsDelay * i, results[i]);
            })(i);
        }
    }
    slamout() {
        let reelsDelay = this.reelsDelay;
        // this.reelSpinSound.pause();
        for (let i = 0; i < this.reelsArray.length; i++) {
            this.reelsArray[i].slamOut();
        }
    }
}
exports.ReelSpinner = ReelSpinner;

},{"./NewReel":6,"./reelsConfig":9}],9:[function(require,module,exports){
/**
 * Created by tarasg on 10/11/2017.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WinBoxWidth = 254;
exports.WinBoxHeight = 244;
exports.symbolWidth = 235;
exports.symbolHeight = 155;
exports.LineNumberWidth = 83;
exports.LineNumberHeight = 73;
exports.StartAnimDelta = 50;
exports.StartAnimSpeed = 10;
exports.ReelsConfig = {
    x: 50,
    y: 60,
    reelsDelay: 50,
    reels: [
        { 'x': 20, 'y': 10, 'symbolsAmount': 3, 'SpinningTime': 1500 },
        { 'x': 260, 'y': 10, 'symbolsAmount': 3, 'SpinningTime': 1700 },
        { 'x': 503, 'y': 10, 'symbolsAmount': 3, 'SpinningTime': 2200 }
    ],
    spinningSpeed: 20,
    slamOutAcceleration: 2.25,
    reelStopDelta: 15,
    reelStopSpeed: 5
};
exports.response = {
    "qualifier": "com.pt.casino.platform",
    "contextId": "r9tnvaajojyd3ni885mi",
    "correlationId": "9e0x7rl7nsi2z1y30udi",
    "data": {
        "_type": "com.pt.casino.platform.game.GameCommand",
        "windowId": "",
        "winAmount": 0,
        "gameData": {
            "_type": "ryota:GameResponse",
            "stake": 500,
            "totalWinAmount": 0,
            "playIndex": 1,
            "nextRound": "0",
            "winLineCount": 5,
            "isWinCapped": false,
            "playStack": [
                {
                    "round": "0",
                    "remainingPlayCount": 0,
                    "newPlayCount": 0,
                    "multiplier": 1,
                    "featureWinAmount": 400,
                    "gameWinAmount": 0,
                    "isLastPlayMode": true,
                    "isNextPlayMode": false,
                    "isWinCapped": false,
                    "lastPlayInModeData": {
                        "playWinAmount": 400,
                        "slotsData": {
                            "previousTransforms": [],
                            "actions": [
                                {
                                    "transforms": [
                                        {
                                            "ref": "spin",
                                            "symbolUpdates": [
                                                {
                                                    "symbol": 1,
                                                    "reelIndex": 0,
                                                    "positionOnReel": 0
                                                },
                                                {
                                                    "symbol": 3,
                                                    "reelIndex": 0,
                                                    "positionOnReel": 1
                                                },
                                                {
                                                    "symbol": 2,
                                                    "reelIndex": 0,
                                                    "positionOnReel": 2
                                                },
                                                {
                                                    "symbol": 3,
                                                    "reelIndex": 1,
                                                    "positionOnReel": 0
                                                },
                                                {
                                                    "symbol": 1,
                                                    "reelIndex": 1,
                                                    "positionOnReel": 1
                                                },
                                                {
                                                    "symbol": 2,
                                                    "reelIndex": 1,
                                                    "positionOnReel": 2
                                                },
                                                {
                                                    "symbol": 3,
                                                    "reelIndex": 2,
                                                    "positionOnReel": 0
                                                },
                                                {
                                                    "symbol": 5,
                                                    "reelIndex": 2,
                                                    "positionOnReel": 1
                                                },
                                                {
                                                    "symbol": 1,
                                                    "reelIndex": 2,
                                                    "positionOnReel": 2
                                                },
                                                {
                                                    "symbol": 3,
                                                    "reelIndex": 3,
                                                    "positionOnReel": 0
                                                },
                                                {
                                                    "symbol": 4,
                                                    "reelIndex": 3,
                                                    "positionOnReel": 1
                                                },
                                                {
                                                    "symbol": 0,
                                                    "reelIndex": 3,
                                                    "positionOnReel": 2
                                                },
                                                {
                                                    "symbol": 5,
                                                    "reelIndex": 4,
                                                    "positionOnReel": 0
                                                },
                                                {
                                                    "symbol": 0,
                                                    "reelIndex": 4,
                                                    "positionOnReel": 1
                                                },
                                                {
                                                    "symbol": 3,
                                                    "reelIndex": 4,
                                                    "positionOnReel": 2
                                                }
                                            ]
                                        }
                                    ],
                                    "payouts": []
                                },
                                {
                                    "transforms": [],
                                    "payouts": [
                                        {
                                            "payoutData": {
                                                "payoutWinAmount": 300,
                                                "payoutFreePlayResultsData": []
                                            },
                                            "context": {
                                                "winLineIndex": 4,
                                                "winningSymbols": [
                                                    {
                                                        "symbol": 1,
                                                        "reelIndex": 0,
                                                        "positionOnReel": 0
                                                    },
                                                    {
                                                        "symbol": 1,
                                                        "reelIndex": 1,
                                                        "positionOnReel": 1
                                                    },
                                                    {
                                                        "symbol": 1,
                                                        "reelIndex": 2,
                                                        "positionOnReel": 2
                                                    }
                                                ],
                                                "symbol": 1,
                                                "symbolPayoutType": "WinLine",
                                                "multiplier": 1
                                            }
                                        },
                                        {
                                            "payoutData": {
                                                "payoutWinAmount": 1000,
                                                "payoutFreePlayResultsData": []
                                            },
                                            "context": {
                                                "winLineIndex": 6,
                                                "winningSymbols": [
                                                    {
                                                        "symbol": 6,
                                                        "reelIndex": 0,
                                                        "positionOnReel": 1
                                                    },
                                                    {
                                                        "symbol": 6,
                                                        "reelIndex": 1,
                                                        "positionOnReel": 0
                                                    },
                                                    {
                                                        "symbol": 6,
                                                        "reelIndex": 2,
                                                        "positionOnReel": 0
                                                    },
                                                    {
                                                        "symbol": 6,
                                                        "reelIndex": 3,
                                                        "positionOnReel": 0
                                                    },
                                                    {
                                                        "symbol": 0,
                                                        "reelIndex": 4,
                                                        "positionOnReel": 1
                                                    }
                                                ],
                                                "symbol": 6,
                                                "symbolPayoutType": "WinLine",
                                                "multiplier": 1
                                            }
                                        },
                                        {
                                            "payoutData": {
                                                "payoutWinAmount": 1000,
                                                "payoutFreePlayResultsData": []
                                            },
                                            "context": {
                                                "winLineIndex": 19,
                                                "winningSymbols": [
                                                    {
                                                        "symbol": 2,
                                                        "reelIndex": 0,
                                                        "positionOnReel": 2
                                                    },
                                                    {
                                                        "symbol": 2,
                                                        "reelIndex": 1,
                                                        "positionOnReel": 2
                                                    },
                                                    {
                                                        "symbol": 2,
                                                        "reelIndex": 2,
                                                        "positionOnReel": 0
                                                    },
                                                    {
                                                        "symbol": 0,
                                                        "reelIndex": 3,
                                                        "positionOnReel": 2
                                                    }
                                                ],
                                                "symbol": 2,
                                                "symbolPayoutType": "WinLine",
                                                "multiplier": 1
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    },
                    "modeType": "SLOTS"
                }
            ]
        },
        "stakeAmount": 500
    }
};

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by tarasg on 9/25/2017.
 */
const Buttons_1 = require("../Layout/Buttons");
const ButtonEvents_1 = require("../Events/ButtonEvents");
const ReelSpinner_1 = require("../ReelSpinner/ReelSpinner");
class BaseGameScene extends PIXI.Container {
    constructor(resources) {
        super();
        this.resources = resources;
        // backgorund
        this.sceneBackground = new PIXI.Sprite(resources['BG']);
        this.addChild(this.sceneBackground);
        //Reels;
        this.REELS = new ReelSpinner_1.ReelSpinner(this, resources);
        // Control Buttons
        // let buttonSound = SoundsManager.allSounds.buttonPress;
        this.startButton = new Buttons_1.Button(this, 873, 267, 'StartButton', resources, this.onStartButton);
        // this.stopButton = new Button(this, 1635, 960, resources.stop.url, resources.stop_dis.url, resources.stop_pressed.url, buttonSound, function () {
        //     document.dispatchEvent(ButtonEvents.StopButtonPressed);
        // });
        // this.maxBetButton = new Button(this, 1420, 960, resources.maxbet.url, resources.maxbet_dis.url, resources.maxbet_pressed.url, buttonSound, function() {
        //     document.dispatchEvent(ButtonEvents.MaxBetButtonPressed);
        // });
        // this.balanceField = new BalanceFieldWithHideCreditsAnimation(this, FontStyles.counterFont, 200, 865, resources.balance_field.texture, buttonSound, resources.show_cr_img.texture, resources.hide_cr_img.texture);
        // this.totalWinField = new NumericField(this, FontStyles.counterFont, 620, 865, resources.total_win_field.texture, buttonSound);
        // this.stakeButton = new DenominationPanelButton(
        //     this,
        //     890,
        //     1005,
        //     FontStyles.counterFont,
        //     FontStyles.stakeFont,
        //     resources.denomBottom.texture,
        //     resources.denomTop.texture,
        //     resources.denomMiddle.texture,
        //     resources.denomSel.texture,
        //     resources.bet.texture,
        //     resources.bet_dis.texture,
        //     resources.bet_pressed.texture,
        //     buttonSound,
        //     function ()
        //     {
        //         document.dispatchEvent(ButtonEvents.BetButtonPressed);
        //     }
        // );
        this.interactive = true;
        this.on('pointerdown', function () {
            document.dispatchEvent(ButtonEvents_1.ButtonEvents.ClickedOnBaseGameScene);
            let skipWInshow = new CustomEvent('skipWinShow');
            document.dispatchEvent(skipWInshow);
        });
    }
    onStartButton() {
        document.dispatchEvent(ButtonEvents_1.ButtonEvents.StartButtonPressed);
    }
}
exports.BaseGameScene = BaseGameScene;

},{"../Events/ButtonEvents":2,"../Layout/Buttons":3,"../ReelSpinner/ReelSpinner":8}],11:[function(require,module,exports){
/**
 * Created by tarasg on 9/25/2017.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SceneManager {
    constructor(app) {
        this.containers = {};
        this.app = app;
    }
    AddGameScene(id, gameScene) {
        this.containers[id] = gameScene;
        gameScene.visible = false;
        this.app.stage.addChild(gameScene);
    }
    goToGameScene(id) {
        if (this.currentScene) {
            this.currentScene.visible = false;
        }
        this.containers[id].visible = true;
        this.currentScene = this.containers[id];
        this.currentSceneId = id;
    }
}
exports.SceneManager = SceneManager;

},{}],12:[function(require,module,exports){
/**
 * Created by tarasg on 9/29/2017.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function nextItem(arr, i) {
    i = i + 1;
    i = i % arr.length;
    return arr[i];
}
exports.nextItem = nextItem;
function prevItem(arr, i) {
    if (i === 0) {
        i = arr.length;
    }
    i = i - 1;
    return arr[i];
}
exports.prevItem = prevItem;
function formatStakeAmount(stake) {
    if (stake < 100) {
        return '0.' + stake + 'p';
    }
    else if (stake >= 100) {
        let x = stake / 100;
        return '$' + parseFloat(x.toString()).toFixed(2);
    }
}
exports.formatStakeAmount = formatStakeAmount;
function CreateAnimation(baseTexture, obj) {
    let len = obj.length, texture_array = [];
    for (let i = 0; i < len; i++) {
        let frame = obj[i], rect = new PIXI.Rectangle(frame.x, frame.y, frame.width, frame.height), texture = new PIXI.Texture(baseTexture, rect);
        texture_array.push({ texture: texture, time: 66 });
    }
    return new PIXI.extras.AnimatedSprite(texture_array);
}
exports.CreateAnimation = CreateAnimation;

},{}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Scenes = require("./Scenes/GameScenes");
const ScenesManager_1 = require("./Scenes/ScenesManager");
const BaseGame_1 = require("./Controllers/BaseGame");
exports.app = new PIXI.Application(960, 536);
exports.SCENE_MANAGER = new ScenesManager_1.SceneManager(exports.app);
const loader = PIXI.loader; // PixiJS exposes a premade instance for you to use.
loader
    .add('sheet', '../Media/sprites.json');
loader.load((loader, resources) => {
    // resources is an object where the key is the name of the resource loaded and the value is the resource object.
    // They have a couple default properties:
    // - `url`: The URL that the resource was loaded from
    // - `error`: The error that happened when trying to load (if any)
    // - `data`: The raw data that was loaded
    // also may contain other properties based on the middleware that runs.
    document.body.appendChild(exports.app.view);
    let textures = loader.resources.sheet.textures;
    // SoundsManager = new SoundsManagerClass(resources);
    exports.baseGameScene = new Scenes.BaseGameScene(textures);
    exports.SCENE_MANAGER.AddGameScene('baseGame', exports.baseGameScene);
    exports.baseGameController = new BaseGame_1.BaseGameController(exports.baseGameScene);
    exports.SCENE_MANAGER.goToGameScene('baseGame');
    hideSplash();
    // setTimeout(function () {
    //     // app.stage.scale.set(window.innerWidth/960, window.innerHeight/536);
    //     hideSplash();
    // }, 1000); 
});
function hideSplash() {
    document.getElementById('spin').style.display = 'none';
    let splash = document.getElementById('splash');
    splash.className = 'splashFadeOut';
    setTimeout(function () {
        splash.style.display = 'none';
    }, 1000);
}

},{"./Controllers/BaseGame":1,"./Scenes/GameScenes":10,"./Scenes/ScenesManager":11}]},{},[13])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQ29udHJvbGxlcnMvQmFzZUdhbWUudHMiLCJzcmMvRXZlbnRzL0J1dHRvbkV2ZW50cy50cyIsInNyYy9MYXlvdXQvQnV0dG9ucy50cyIsInNyYy9MYXlvdXQvYnV0dG9uTmFtZXMudHMiLCJzcmMvUmVlbFNwaW5uZXIvTWFpblJvdW5kU3ltYm9scy50cyIsInNyYy9SZWVsU3Bpbm5lci9OZXdSZWVsLnRzIiwic3JjL1JlZWxTcGlubmVyL1JlZWxTZXRzLnRzIiwic3JjL1JlZWxTcGlubmVyL1JlZWxTcGlubmVyLnRzIiwic3JjL1JlZWxTcGlubmVyL3JlZWxzQ29uZmlnLnRzIiwic3JjL1NjZW5lcy9HYW1lU2NlbmVzLnRzIiwic3JjL1NjZW5lcy9TY2VuZXNNYW5hZ2VyLnRzIiwic3JjL1V0aWxzL2hlbHBlckZ1bmNzLnRzIiwic3JjL21haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0tBLHNEQUFpRTtBQUNqRSxrQ0FBc0M7QUFDdEMsNERBQW9EO0FBV3BEO0lBb0JJLFlBQVksS0FBb0I7UUFmekIsWUFBTyxHQUFXLEtBQUssQ0FBQztRQUN4QixhQUFRLEdBQVcsR0FBRyxDQUFDO1FBQ3ZCLGlCQUFZLEdBQVcsR0FBRyxDQUFDO1FBYzlCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLHlEQUF5RDtRQUV6RCxrREFBa0Q7UUFDbEQsMENBQTBDO1FBQzFDLElBQUksQ0FBQyxZQUFZLEdBQUc7WUFDaEIsTUFBTSxFQUFHO2dCQUNMLEVBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUM7Z0JBQ3JELHNEQUFzRDtnQkFDdEQsb0RBQW9EO2dCQUNwRCx1REFBdUQ7Z0JBQ3ZELHFEQUFxRDtnQkFDckQsd0RBQXdEO2dCQUN4RCw0REFBNEQ7Z0JBQzVELG9EQUFvRDtnQkFDcEQs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LEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3RKLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN0SixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDdEosQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3RKLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUs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Q3JCO2dEQUNEO29EQUNJLFFBQVEsRUFBQyxDQUFDO29EQUNWLFdBQVcsRUFBQyxDQUFDO29EQUNiLGdCQUFnQixFQUFDLENBQUM7aURBQ3JCO2dEQUNEO29EQUNJLFFBQVEsRUFBQyxDQUFDO29EQUNWLFdBQVcsRUFBQyxDQUFDO29EQUNiLGdCQUFnQixFQUFDLENBQUM7aURBQ3JCO2dEQUNEO29EQUNJLFFBQVEsRUFBQyxDQUFDO29EQUNWLFdBQVcsRUFBQyxDQUFDO29EQUNiLGdCQUFnQixFQUFDLENBQUM7aURBQ3JCO2dEQUNEO29EQUNJLFFBQVEsRUFBQyxDQUFDO29EQUNWLFdBQVcsRUFBQyxDQUFDO29EQUNiLGdCQUFnQixFQUFDLENBQUM7aURBQ3JCO2dEQUNEO29EQUNJLFFBQVEsRUFBQyxDQUFDO29EQUNWLFdBQVcsRUFBQyxDQUFDO29EQUNiLGdCQUFnQixFQUFDLENBQUM7aURBQ3JCO2dEQUNEO29EQUNJLFFBQVEsRUFBQyxDQUFDO29EQUNWLFdBQVcsRUFBQyxDQUFDO29EQUNiLGdCQUFnQixFQUFDLENBQUM7aURBQ3JCO2dEQUNEO29EQUNJLFFBQVEsRUFBQyxDQUFDO29EQUNWLFdBQVcsRUFBQyxDQUFDO29EQUNiLGdCQUFnQixFQUFDLENBQUM7aURBQ3JCO2dEQUNEO29EQUNJLFFBQVEsRUFBQyxDQUFDO29EQUNWLFdBQVcsRUFBQyxDQUFDO29EQUNiLGdCQUFnQixFQUFDLENBQUM7aURBQ3JCO2dEQUNEO29EQUNJLFFBQVEsRUFBQyxDQUFDO29EQUNWLFdBQVcsRUFBQyxDQUFDO29EQUNiLGdCQUFnQixFQUFDLENBQUM7aURBQ3JCO2dEQUNEO29EQUNJLFFBQVEsRUFBQyxDQUFDO29EQUNWLFdBQVcsRUFBQyxDQUFDO29EQUNiLGdCQUFnQixFQUFDLENBQUM7aURBQ3JCO2dEQUNEO29EQUNJLFFBQVEsRUFBQyxDQUFDO29EQUNWLFdBQVcsRUFBQyxDQUFDO29EQUNiLGdCQUFnQixFQUFDLENBQUM7aURBQ3JCO2dEQUNEO29EQUNJLFFBQVEsRUFBQyxDQUFDO29EQUNWLFdBQVcs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QUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxTQUFTO0lBQzFCLGdIQUFnSDtJQUNoSCx5Q0FBeUM7SUFDekMscURBQXFEO0lBQ3JELGtFQUFrRTtJQUNsRSx5Q0FBeUM7SUFDekMsdUVBQXVFO0lBQ3ZFLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUVwQyxJQUFJLFFBQVEsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUM7SUFFL0MscURBQXFEO0lBRXJELHFCQUFhLEdBQUcsSUFBSSxNQUFNLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ25ELHFCQUFhLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxxQkFBYSxDQUFDLENBQUM7SUFDdEQsMEJBQWtCLEdBQUcsSUFBSSw2QkFBa0IsQ0FBQyxxQkFBYSxDQUFDLENBQUM7SUFFM0QscUJBQWEsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7SUFFeEMsVUFBVSxFQUFFLENBQUM7SUFFYiwyQkFBMkI7SUFDM0IsNkVBQTZFO0lBQzdFLG9CQUFvQjtJQUNwQixhQUFhO0FBR2pCLENBQUMsQ0FBQyxDQUFDO0FBR0g7SUFDSSxRQUFRLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0lBQ3ZELElBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDL0MsTUFBTSxDQUFDLFNBQVMsR0FBRSxlQUFlLENBQUM7SUFDbEMsVUFBVSxDQUFDO1FBQ1AsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0lBQ2xDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNiLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfXJldHVybiBlfSkoKSIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IHRhcmFzZyBvbiAxMC8xMS8yMDE3LlxyXG4gKi9cclxuLy8gaW1wb3J0IHtCdXR0b259IGZyb20gXCIuLi9MYXlvdXQvQnV0dG9uc1wiO1xyXG5pbXBvcnQge0Jhc2VHYW1lU2NlbmV9IGZyb20gXCIuLi9TY2VuZXMvR2FtZVNjZW5lc1wiO1xyXG5pbXBvcnQge2Zvcm1hdFN0YWtlQW1vdW50LCBuZXh0SXRlbX0gZnJvbSBcIi4uL1V0aWxzL2hlbHBlckZ1bmNzXCI7XHJcbmltcG9ydCB7U0NFTkVfTUFOQUdFUn0gZnJvbSBcIi4uL21haW5cIjtcclxuaW1wb3J0IHtyZXNwb25zZX0gZnJvbSBcIi4uL1JlZWxTcGlubmVyL3JlZWxzQ29uZmlnXCI7XHJcbmltcG9ydCB7V2luU2hvd0NvbnRyb2xsZXJ9IGZyb20gXCIuL1dpblNob3dcIjtcclxuLy8gaW1wb3J0IHtCdXR0b25FdmVudHN9IGZyb20gXCIuLi9FdmVudHMvQnV0dG9uRXZlbnRzXCI7XHJcbi8vIGltcG9ydCB7Rm9udFN0eWxlc30gZnJvbSBcIi4uL1V0aWxzL2ZvbnRTdHlsZXNcIjtcclxuLy8gaW1wb3J0IHthcHAsIGJhc2VHYW1lU2NlbmUsIGJvbnVzR2FtZVNjZW5lLCBTQ0VORV9NQU5BR0VSfSBmcm9tIFwiLi4vbWFpblwiXHJcbi8vIGltcG9ydCB7TGluZU9iamVjdH0gZnJvbSBcIi4uL0JvbnVzL0xpbmVPYmplY3RcIjtcclxuXHJcbmRlY2xhcmUgbGV0IEdES1dyYXBwZXI6IGFueTtcclxuXHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIEJhc2VHYW1lQ29udHJvbGxlciB7XHJcblxyXG4gICAgcHJpdmF0ZSBzY2VuZTogQmFzZUdhbWVTY2VuZTtcclxuICAgIHB1YmxpYyBzdGF0ZTogc3RyaW5nO1xyXG4gICAgcHVibGljIGJ1dHRvblN0YXRlczogYW55O1xyXG4gICAgcHVibGljIGJhbGFuY2U6IG51bWJlciA9IDEwMDAwO1xyXG4gICAgcHVibGljIHRvdGFsV2luOiBudW1iZXIgPSAxMDA7XHJcbiAgICBwdWJsaWMgY3VycmVudFN0YWtlOiBudW1iZXIgPSAxMDA7XHJcbiAgICBwdWJsaWMgc3Rha2VzOiBudW1iZXJbXTtcclxuICAgIHB1YmxpYyBXaW5TaG93Q29udHJvbGxlcjogV2luU2hvd0NvbnRyb2xsZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBvblN0YXJ0QnV0dG9uOiBhbnk7XHJcbiAgICBwcml2YXRlIG9uUmVlbHNTdG9wOiBhbnk7XHJcbiAgICBwcml2YXRlIG9uU2xhbU91dDogYW55O1xyXG4gICAgcHJpdmF0ZSBvblN0YWtlQnV0dG9uOiBhbnk7XHJcbiAgICBwcml2YXRlIG9uQ2hhbmdlU3Rha2U6IGFueTtcclxuICAgIHByaXZhdGUgb25NYXhCZXQ6IGFueTtcclxuICAgIHByaXZhdGUgb25HYW1ibGU6IGFueTtcclxuXHJcblxyXG4gICAgY29uc3RydWN0b3Ioc2NlbmU6IEJhc2VHYW1lU2NlbmUpIHtcclxuICAgICAgICB0aGlzLnNjZW5lID0gc2NlbmU7XHJcbiAgICAgICAgLy8gdGhpcy5XaW5TaG93Q29udHJvbGxlciA9IG5ldyBXaW5TaG93Q29udHJvbGxlcihzY2VuZSk7XHJcblxyXG4gICAgICAgIC8vIHRoaXMuc2NlbmUuYmFsYW5jZUZpZWxkLmFkZFZhbHVlKHRoaXMuYmFsYW5jZSk7XHJcbiAgICAgICAgLy8gdGhpcy5zdGFrZXMgPSBzY2VuZS5zdGFrZUJ1dHRvbi5zdGFrZXM7XHJcbiAgICAgICAgdGhpcy5idXR0b25TdGF0ZXMgPSB7XHJcbiAgICAgICAgICAgICdpZGxlJyA6IFtcclxuICAgICAgICAgICAgICAgIHsnYnV0dG9uJzogdGhpcy5zY2VuZS5zdGFydEJ1dHRvbiwgJ3N0YXRlJzogJ2VuYWJsZSd9XHJcbiAgICAgICAgICAgICAgICAvLyB7J2J1dHRvbic6IHRoaXMuc2NlbmUuc3RvcEJ1dHRvbiwgJ3N0YXRlJzogJ2hpZGUnfSxcclxuICAgICAgICAgICAgICAgIC8vIHsnYnV0dG9uJzogc2NlbmUuY29sbGVjdEJ1dHRvbiwgJ3N0YXRlJzogJ2hpZGUnfSxcclxuICAgICAgICAgICAgICAgIC8vIHsnYnV0dG9uJzogc2NlbmUuc3RhcnRCb251c0J1dHRvbiwgJ3N0YXRlJzogJ2hpZGUnfSxcclxuICAgICAgICAgICAgICAgIC8vIHsnYnV0dG9uJzogc2NlbmUubWF4QmV0QnV0dG9uLCAnc3RhdGUnOiAnZW5hYmxlJ30sXHJcbiAgICAgICAgICAgICAgICAvLyB7J2J1dHRvbic6IHNjZW5lLmF1dG9TdGFydEJ1dHRvbiwgJ3N0YXRlJzogJ2VuYWJsZSd9LFxyXG4gICAgICAgICAgICAgICAgLy8geydidXR0b24nOiBzY2VuZS5jYW5jZWxBdXRvU3RhcnRCdXR0b24sICdzdGF0ZSc6ICdoaWRlJ30sXHJcbiAgICAgICAgICAgICAgICAvLyB7J2J1dHRvbic6IHNjZW5lLnN0YWtlQnV0dG9uLCAnc3RhdGUnOiAnZW5hYmxlJ30sXHJcbiAgICAgICAgICAgICAgICAvLyB7J2J1dHRvbic6IHNjZW5lLmdhbWJsZUJ1dHRvbiwgJ3N0YXRlJzogJ2Rpc2FibGUnfSxcclxuICAgICAgICAgICAgICAgIC8vIHsnYnV0dG9uJzogc2NlbmUuaGVscEJ1dHRvbiwgJ3N0YXRlJzogJ2VuYWJsZSd9LFxyXG4gICAgICAgICAgICAgICAgLy8geydidXR0b24nOiBzY2VuZS5tZW51QnV0dG9uLCAnc3RhdGUnOiAnZW5hYmxlJ30sXHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICdyb3VuZCc6IFtcclxuICAgICAgICAgICAgICAgIHsnYnV0dG9uJzogdGhpcy5zY2VuZS5zdGFydEJ1dHRvbiwgJ3N0YXRlJzogJ2hpZGUnfVxyXG4gICAgICAgICAgICAgICAgLy8geydidXR0b24nOiB0aGlzLnNjZW5lLnN0b3BCdXR0b24sICdzdGF0ZSc6ICdlbmFibGUnfSxcclxuICAgICAgICAgICAgICAgIC8vIHsnYnV0dG9uJzogc2NlbmUuY29sbGVjdEJ1dHRvbiwgJ3N0YXRlJzogJ2hpZGUnfSxcclxuICAgICAgICAgICAgICAgIC8vIHsnYnV0dG9uJzogc2NlbmUuc3RhcnRCb251c0J1dHRvbiwgJ3N0YXRlJzogJ2hpZGUnfSxcclxuICAgICAgICAgICAgICAgIC8vIHsnYnV0dG9uJzogc2NlbmUubWF4QmV0QnV0dG9uLCAnc3RhdGUnOiAnZGlzYWJsZSd9LFxyXG4gICAgICAgICAgICAgICAgLy8geydidXR0b24nOiBzY2VuZS5hdXRvU3RhcnRCdXR0b24sICdzdGF0ZSc6ICdkaXNhYmxlJ30sXHJcbiAgICAgICAgICAgICAgICAvLyB7J2J1dHRvbic6IHNjZW5lLmNhbmNlbEF1dG9TdGFydEJ1dHRvbiwgJ3N0YXRlJzogJ2hpZGUnfSxcclxuICAgICAgICAgICAgICAgIC8vIHsnYnV0dG9uJzogc2NlbmUuc3Rha2VCdXR0b24sICdzdGF0ZSc6ICdkaXNhYmxlJ30sXHJcbiAgICAgICAgICAgICAgICAvLyB7J2J1dHRvbic6IHNjZW5lLmdhbWJsZUJ1dHRvbiwgJ3N0YXRlJzogJ2Rpc2FibGUnfSxcclxuICAgICAgICAgICAgICAgIC8vIHsnYnV0dG9uJzogc2NlbmUuaGVscEJ1dHRvbiwgJ3N0YXRlJzogJ2Rpc2FibGUnfSxcclxuICAgICAgICAgICAgICAgIC8vIHsnYnV0dG9uJzogc2NlbmUubWVudUJ1dHRvbiwgJ3N0YXRlJzogJ2Rpc2FibGUnfSxcclxuICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgJ2NvbGxlY3QnOiBbXHJcbiAgICAgICAgICAgICAgICB7J2J1dHRvbic6IHRoaXMuc2NlbmUuc3RhcnRCdXR0b24sICdzdGF0ZSc6ICdoaWRlJ31cclxuICAgICAgICAgICAgICAgIC8vIHsnYnV0dG9uJzogdGhpcy5zY2VuZS5zdG9wQnV0dG9uLCAnc3RhdGUnOiAnaGlkZSd9LFxyXG4gICAgICAgICAgICAgICAgLy8geydidXR0b24nOiBzY2VuZS5jb2xsZWN0QnV0dG9uLCAnc3RhdGUnOiAnZW5hYmxlJ30sXHJcbiAgICAgICAgICAgICAgICAvLyB7J2J1dHRvbic6IHNjZW5lLnN0YXJ0Qm9udXNCdXR0b24sICdzdGF0ZSc6ICdoaWRlJ30sXHJcbiAgICAgICAgICAgICAgICAvLyB7J2J1dHRvbic6IHNjZW5lLm1heEJldEJ1dHRvbiwgJ3N0YXRlJzogJ2Rpc2FibGUnfSxcclxuICAgICAgICAgICAgICAgIC8vIHsnYnV0dG9uJzogc2NlbmUuYXV0b1N0YXJ0QnV0dG9uLCAnc3RhdGUnOiAnZGlzYWJsZSd9LFxyXG4gICAgICAgICAgICAgICAgLy8geydidXR0b24nOiBzY2VuZS5jYW5jZWxBdXRvU3RhcnRCdXR0b24sICdzdGF0ZSc6ICdoaWRlJ30sXHJcbiAgICAgICAgICAgICAgICAvLyB7J2J1dHRvbic6IHNjZW5lLnN0YWtlQnV0dG9uLCAnc3RhdGUnOiAnZGlzYWJsZSd9LFxyXG4gICAgICAgICAgICAgICAgLy8geydidXR0b24nOiBzY2VuZS5nYW1ibGVCdXR0b24sICdzdGF0ZSc6ICdlbmFibGUnfSxcclxuICAgICAgICAgICAgICAgIC8vIHsnYnV0dG9uJzogc2NlbmUuaGVscEJ1dHRvbiwgJ3N0YXRlJzogJ2Rpc2FibGUnfSxcclxuICAgICAgICAgICAgICAgIC8vIHsnYnV0dG9uJzogc2NlbmUubWVudUJ1dHRvbiwgJ3N0YXRlJzogJ2Rpc2FibGUnfSxcclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMub25TdGFydEJ1dHRvbiA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHRoaXMub25TdGFydEJ1dHRvbkZ1bmMoKTtcclxuICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgIHRoaXMub25SZWVsc1N0b3AgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMub25SZWVsc1N0b3BGdW5jKCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICB0aGlzLm9uU2xhbU91dCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5vblNsYW1PdXRGdW5jKCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICB0aGlzLm9uU3Rha2VCdXR0b24gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMub25TdGFrZUJ1dHRvbkZ1bmMoKTtcclxuICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgIHRoaXMub25DaGFuZ2VTdGFrZSA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIHRoaXMub25DaGFuZ2VTdGFrZUZ1bmMoZSk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICB0aGlzLm9uTWF4QmV0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLm9uTWF4QmV0QnV0dG9uRnVuYygpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgdGhpcy5vbkdhbWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5vbkdhbWJsZUZ1bmMoKTtcclxuICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoJ2lkbGUnKTtcclxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXJzKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXRTdGF0ZShzdGF0ZTpzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLnN0YXRlID0gc3RhdGU7XHJcblxyXG4gICAgICAgIGlmIChzdGF0ZSA9PSAnaWRsZScpIHtcclxuICAgICAgICAgICAgdGhpcy5lbmFibGVXaW5MaW5lQnV0dG9ucygpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzYWJsZVdpbkxpbmVCdXR0b25zKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHNldCBidXR0b24gc3RhdGVzOlxyXG4gICAgICAgIGxldCBidXR0b25TdGF0ZSA9IHRoaXMuYnV0dG9uU3RhdGVzW3RoaXMuc3RhdGVdO1xyXG4gICAgICAgIGZvciAobGV0IGk9MDsgaTxidXR0b25TdGF0ZS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoYnV0dG9uU3RhdGVbaV0uc3RhdGUgPT0gJ2VuYWJsZScpe1xyXG4gICAgICAgICAgICAgICAgYnV0dG9uU3RhdGVbaV0uYnV0dG9uLmVuYWJsZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGJ1dHRvblN0YXRlW2ldLnN0YXRlID09ICdkaXNhYmxlJyl7XHJcbiAgICAgICAgICAgICAgICBidXR0b25TdGF0ZVtpXS5idXR0b24uZGlzYWJsZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGJ1dHRvblN0YXRlW2ldLnN0YXRlID09ICdoaWRlJyl7XHJcbiAgICAgICAgICAgICAgICBidXR0b25TdGF0ZVtpXS5idXR0b24uaGlkZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBwcml2YXRlIGFkZEV2ZW50TGlzdGVuZXJzKCkge1xyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ1N0YXJ0QnV0dG9uUHJlc3NlZCcsIHRoaXMub25TdGFydEJ1dHRvbik7XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignTGFzdFJlZWxTdG9wcGVkJywgdGhpcy5vblJlZWxzU3RvcCk7XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignU3RvcEJ1dHRvblByZXNzZWQnLCB0aGlzLm9uU2xhbU91dCk7XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignQmV0QnV0dG9uUHJlc3NlZCcsdGhpcy5vblN0YWtlQnV0dG9uKTtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2VTdGFrZUV2ZW50JywgdGhpcy5vbkNoYW5nZVN0YWtlKTtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdNYXhCZXRCdXR0b25QcmVzc2VkJywgdGhpcy5vbk1heEJldCk7XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignR2FtYmxlQnV0dG9uUHJlc3NlZCcsIHRoaXMub25HYW1ibGUpO1xyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ01lbnVCdXR0b25QcmVzc2VkJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvL0dES1dyYXBwZXIuR2FtZUV4aXQoKTtcclxuICAgICAgICAgICAgd2luZG93LmNsb3NlKClcclxuICAgICAgICB9KTtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdTdGFydEJvbnVzQnV0dG9uUHJlc3NlZCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gU0NFTkVfTUFOQUdFUi5nb1RvR2FtZVNjZW5lKCdib251c0dhbWUnKTtcclxuICAgICAgICAgICAgLy8gYm9udXNDb250cm9sbGVyLnN0YXJ0Qm9udXMoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdIZWxwQnV0dG9uUHJlc3NlZCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgU0NFTkVfTUFOQUdFUi5nb1RvR2FtZVNjZW5lKCdtYWluSGVscCcpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0NsaWNrZWRPbkJhc2VHYW1lU2NlbmUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIC8vIGlmICh0aGlzLnNjZW5lLnN0YWtlQnV0dG9uLmlzU2hvd24pe1xyXG4gICAgICAgICAgICAvLyAgICAgdGhpcy5zY2VuZS5zdGFrZUJ1dHRvbi5oaWRlUGFuZWwoKTtcclxuICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2V4aXRHYW1ibGVFdmVudCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gdGhpcy50b3RhbFdpbiA9IGdhbWJsZUNvbnRyb2xsZXIuYmFuaztcclxuICAgICAgICAgICAgLy8gdGhpcy5vbkNvbGxlY3QoKTtcclxuXHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignQ29sbGVjdEJ1dHRvblByZXNzZWQnLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB0aGlzLm9uQ29sbGVjdCgpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZW1vdmVFdmVudExpc3RlbmVycygpIHtcclxuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdTdGFydEJ1dHRvblByZXNzZWQnLCB0aGlzLm9uU3RhcnRCdXR0b24pXHJcblxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25TbGFtT3V0RnVuYygpe1xyXG4gICAgICAgIHRoaXMuc2NlbmUuUkVFTFMuc2xhbW91dCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25TdGFydEJ1dHRvbkZ1bmMoKXtcclxuICAgICAgICB0aGlzLnNldFN0YXRlKCdyb3VuZCcpO1xyXG4gICAgICAgIC8vIHRoaXMuc2NlbmUudG90YWxXaW5GaWVsZC5jb3VudGVyLnJlc2V0KCk7XHJcbiAgICAgICAgdGhpcy5iYWxhbmNlIC09IHRoaXMuY3VycmVudFN0YWtlO1xyXG4gICAgICAgIC8vIHRoaXMuc2NlbmUuYmFsYW5jZUZpZWxkLnN1YnN0cmFjdFZhbHVlKHRoaXMuY3VycmVudFN0YWtlKTtcclxuICAgICAgICAvLyB0aGlzLldpblNob3dDb250cm9sbGVyLnVwZGF0ZVBheW91dHMocmVzcG9uc2UpO1xyXG4gICAgICAgIHRoaXMudG90YWxXaW4gPSByZXNwb25zZS5kYXRhLmdhbWVEYXRhLnRvdGFsV2luQW1vdW50O1xyXG4gICAgICAgIGxldCBzdG9wcyA9IHRoaXMuZ2V0U3RvcHNBcnJheShyZXNwb25zZSk7XHJcbiAgICAgICAgdGhpcy5zY2VuZS5SRUVMUy5zcGluKHN0b3BzKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldFN0b3BzQXJyYXkocm91bmRSZXNwb25zZSk6IG51bWJlcltdW10ge1xyXG4gICAgICAgIGxldCBzeW1ib2xVcGRhdGVzID0gcm91bmRSZXNwb25zZS5kYXRhLmdhbWVEYXRhLnBsYXlTdGFja1swXS5sYXN0UGxheUluTW9kZURhdGEuc2xvdHNEYXRhLmFjdGlvbnNbMF0udHJhbnNmb3Jtc1swXS5zeW1ib2xVcGRhdGVzLFxyXG4gICAgICAgICAgICByZXN1bHQgPSBbW10sW10sW10sW10sW11dO1xyXG4gICAgICAgIGZvciAobGV0IGk9MDsgaTwgc3ltYm9sVXBkYXRlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICByZXN1bHRbc3ltYm9sVXBkYXRlc1tpXS5yZWVsSW5kZXhdW3N5bWJvbFVwZGF0ZXNbaV0ucG9zaXRpb25PblJlZWxdID0gc3ltYm9sVXBkYXRlc1tpXS5zeW1ib2w7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvblJlZWxzU3RvcEZ1bmMoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMudG90YWxXaW4gPT0gMCl7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoJ2lkbGUnKTtcclxuICAgICAgICAgICAgdGhpcy5jaGVja0lmQmV0UG9zc2libGUoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKCdjb2xsZWN0Jyk7XHJcbiAgICAgICAgICAgIHRoaXMuc2NlbmUuaW50ZXJhY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLldpblNob3dDb250cm9sbGVyLnBsYXlXaW5TaG93KCk7XHJcbiAgICAgICAgICAgIC8vIHRoaXMuc2NlbmUudG90YWxXaW5GaWVsZC5hZGRWYWx1ZSh0aGlzLnRvdGFsV2luKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSAgb25TdGFrZUJ1dHRvbkZ1bmMoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2NlbmUuc3Rha2VCdXR0b24uaXNTaG93bil7XHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50U3Rha2VJbmRleCA9IHRoaXMuc2NlbmUuc3Rha2VCdXR0b24uc3Rha2VzLmluZGV4T2YodGhpcy5zY2VuZS5zdGFrZUJ1dHRvbi5jdXJyZW50U3Rha2VBbW91bnQpLFxyXG4gICAgICAgICAgICAgICAgbmV4dFN0YWtlID0gbmV4dEl0ZW0odGhpcy5zY2VuZS5zdGFrZUJ1dHRvbi5zdGFrZXMsIGN1cnJlbnRTdGFrZUluZGV4KTtcclxuICAgICAgICAgICAgdGhpcy5zY2VuZS5zdGFrZUJ1dHRvbi5jaGFuZ2VTdGFrZShuZXh0U3Rha2UpO1xyXG5cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NlbmUuc3Rha2VCdXR0b24uc2hvd1BhbmVsKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY2hlY2tJZkJldFBvc3NpYmxlKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmJhbGFuY2UgPCB0aGlzLmN1cnJlbnRTdGFrZSkge1xyXG4gICAgICAgICAgICB0aGlzLnNjZW5lLnN0YXJ0QnV0dG9uLmRpc2FibGUoKTtcclxuICAgICAgICAgICAgLy8gdGhpcy5zY2VuZS5hdXRvU3RhcnRCdXR0b24uZGlzYWJsZSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zY2VuZS5zdGFydEJ1dHRvbi5lbmFibGUoKTtcclxuICAgICAgICAgICAgLy8gdGhpcy5zY2VuZS5hdXRvU3RhcnRCdXR0b24uZW5hYmxlKCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uQ2hhbmdlU3Rha2VGdW5jKGV2ZW50KSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50U3Rha2UgPSBldmVudC5kZXRhaWwubmV3U3Rha2U7XHJcbiAgICAgICAgdGhpcy5jaGVja0lmQmV0UG9zc2libGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uTWF4QmV0QnV0dG9uRnVuYygpIHtcclxuICAgICAgICBmb3IgKGxldCBpPTA7IGk8dGhpcy5zdGFrZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuYmFsYW5jZSA8IHRoaXMuc3Rha2VzW2ldKXtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zY2VuZS5zdGFrZUJ1dHRvbi5jaGFuZ2VTdGFrZSh0aGlzLnN0YWtlc1tpXSk7XHJcbiAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25HYW1ibGVGdW5jKCkge1xyXG4gICAgICAgIC8vIFNDRU5FX01BTkFHRVIuZ29Ub0dhbWVTY2VuZSgnZ2FtYmxlJyk7XHJcbiAgICAgICAgLy8gZ2FtYmxlQ29udHJvbGxlci5zdGFydEdhbWJsZSh0aGlzLnRvdGFsV2luKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uQ29sbGVjdCgpe1xyXG4gICAgICAgIHRoaXMuc2NlbmUudG90YWxXaW5GaWVsZC5jb3VudGVyLnJlc2V0KCk7XHJcbiAgICAgICAgdGhpcy5zY2VuZS5iYWxhbmNlRmllbGQuYWRkVmFsdWUodGhpcy50b3RhbFdpbik7XHJcbiAgICAgICAgdGhpcy5iYWxhbmNlICs9IHRoaXMudG90YWxXaW47XHJcbiAgICAgICAgdGhpcy50b3RhbFdpbiA9IDA7XHJcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSgnaWRsZScpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZGlzYWJsZVdpbkxpbmVCdXR0b25zKCk6IHZvaWQge1xyXG4gICAgICAgIC8vIGZvciAobGV0IGk9MDsgaTx0aGlzLnNjZW5lLndpbkxpbmVzQXJyYXkubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAvLyAgICAgdGhpcy5zY2VuZS53aW5MaW5lc0FycmF5W2ldLmRpc2FibGUoKTtcclxuICAgICAgICAvLyB9XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGVuYWJsZVdpbkxpbmVCdXR0b25zKCk6IHZvaWQge1xyXG4gICAgICAgIC8vIGZvciAobGV0IGk9MDsgaTx0aGlzLnNjZW5lLndpbkxpbmVzQXJyYXkubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAvLyAgICAgdGhpcy5zY2VuZS53aW5MaW5lc0FycmF5W2ldLmVuYWJsZSgpO1xyXG4gICAgICAgIC8vIH1cclxuICAgIH1cclxuXHJcblxyXG5cclxuXHJcbn0iLCIvKipcclxuICogQ3JlYXRlZCBieSB0YXJhc2cgb24gOS8yNS8yMDE3LlxyXG4gKi9cclxuXHJcblxyXG5sZXQgR2FtYmxlUmVkUHJlc3NlZCA9IG5ldyBDdXN0b21FdmVudChcIkdhbWJsZVJlZFByZXNzZWRcIiksXHJcbiAgICBHYW1ibGVCbGFja1ByZXNzZWQgPSBuZXcgQ3VzdG9tRXZlbnQoXCJHYW1ibGVCbGFja1ByZXNzZWRcIiksXHJcbiAgICBHYW1ibGVDb2xsZWN0UHJlc3NlZCA9IG5ldyBDdXN0b21FdmVudChcIkdhbWJsZUNvbGxlY3RQcmVzc2VkXCIpLFxyXG4gICAgQ2xpY2tlZE9uQmFzZUdhbWVTY2VuZSA9IG5ldyBDdXN0b21FdmVudChcIkNsaWNrZWRPbkJhc2VHYW1lU2NlbmVcIiksXHJcbiAgICBCZXRCdXR0b25QcmVzc2VkID0gbmV3IEN1c3RvbUV2ZW50KCdCZXRCdXR0b25QcmVzc2VkJyksXHJcbiAgICBHYW1ibGVCdXR0b25QcmVzc2VkID0gbmV3IEN1c3RvbUV2ZW50KCdHYW1ibGVCdXR0b25QcmVzc2VkJyksXHJcbiAgICBBdXRvU3RhcnRCdXR0b25QcmVzc2VkID0gbmV3IEN1c3RvbUV2ZW50KCdBdXRvU3RhcnRCdXR0b25QcmVzc2VkJyksXHJcbiAgICBNYXhCZXRCdXR0b25QcmVzc2VkID0gbmV3IEN1c3RvbUV2ZW50KCdNYXhCZXRCdXR0b25QcmVzc2VkJyksXHJcbiAgICBFeGl0SGVscEJ1dHRvblByZXNzZWQgPSBuZXcgQ3VzdG9tRXZlbnQoJ0V4aXRIZWxwQnV0dG9uUHJlc3NlZCcpLFxyXG4gICAgUHJldkhlbHBQYWdlQnV0dG9uUHJlc3NlZCA9IG5ldyBDdXN0b21FdmVudCgnUHJldkhlbHBQYWdlQnV0dG9uUHJlc3NlZCcpLFxyXG4gICAgTmV4dEhlbHBQYWdlQnV0dG9uUHJlc3NlZCA9IG5ldyBDdXN0b21FdmVudCgnTmV4dEhlbHBQYWdlQnV0dG9uUHJlc3NlZCcpLFxyXG4gICAgSGVscEJ1dHRvblByZXNzZWQgPSBuZXcgQ3VzdG9tRXZlbnQoJ0hlbHBCdXR0b25QcmVzc2VkJyksXHJcbiAgICBNZW51QnV0dG9uUHJlc3NlZCA9IG5ldyBDdXN0b21FdmVudCgnTWVudUJ1dHRvblByZXNzZWQnKSxcclxuICAgIFN0b3BCdXR0b25QcmVzc2VkID0gbmV3IEN1c3RvbUV2ZW50KCdTdG9wQnV0dG9uUHJlc3NlZCcpLFxyXG4gICAgU3RhcnRCb251c0J1dHRvblByZXNzZWQgPSBuZXcgQ3VzdG9tRXZlbnQoJ1N0YXJ0Qm9udXNCdXR0b25QcmVzc2VkJyksXHJcbiAgICBDb2xsZWN0QnV0dG9uUHJlc3NlZCA9IG5ldyBDdXN0b21FdmVudCgnQ29sbGVjdEJ1dHRvblByZXNzZWQnKSxcclxuICAgIFN0YXJ0QnV0dG9uUHJlc3NlZCA9IG5ldyBDdXN0b21FdmVudCgnU3RhcnRCdXR0b25QcmVzc2VkJyksXHJcbiAgICBDYW5jZWxBdXRvU3RhcnRCdXR0b25QcmVzc2VkID0gbmV3IEN1c3RvbUV2ZW50KCdDYW5jZWxBdXRvU3RhcnRCdXR0b25QcmVzc2VkJyk7XHJcblxyXG5cclxuZXhwb3J0IGxldCBCdXR0b25FdmVudHMgPSB7XHJcbiAgICAnQ2xpY2tlZE9uQmFzZUdhbWVTY2VuZSc6IENsaWNrZWRPbkJhc2VHYW1lU2NlbmUsXHJcblxyXG4gICAgJ1N0YXJ0QnV0dG9uUHJlc3NlZCc6IFN0YXJ0QnV0dG9uUHJlc3NlZCxcclxuICAgICdTdG9wQnV0dG9uUHJlc3NlZCcgOiBTdG9wQnV0dG9uUHJlc3NlZCxcclxuICAgICdDb2xsZWN0QnV0dG9uUHJlc3NlZCc6IENvbGxlY3RCdXR0b25QcmVzc2VkLFxyXG4gICAgJ1N0YXJ0Qm9udXNCdXR0b25QcmVzc2VkJzogU3RhcnRCb251c0J1dHRvblByZXNzZWQsXHJcblxyXG4gICAgJ01lbnVCdXR0b25QcmVzc2VkJyA6IE1lbnVCdXR0b25QcmVzc2VkLFxyXG4gICAgJ0hlbHBCdXR0b25QcmVzc2VkJyA6IEhlbHBCdXR0b25QcmVzc2VkLFxyXG4gICAgJ0dhbWJsZUJ1dHRvblByZXNzZWQnOiBHYW1ibGVCdXR0b25QcmVzc2VkLFxyXG4gICAgJ0JldEJ1dHRvblByZXNzZWQnOiBCZXRCdXR0b25QcmVzc2VkLFxyXG4gICAgJ01heEJldEJ1dHRvblByZXNzZWQnOiBNYXhCZXRCdXR0b25QcmVzc2VkLFxyXG5cclxuICAgICdBdXRvU3RhcnRCdXR0b25QcmVzc2VkJzogQXV0b1N0YXJ0QnV0dG9uUHJlc3NlZCxcclxuICAgICdDYW5jZWxBdXRvU3RhcnRCdXR0b25QcmVzc2VkJzogQ2FuY2VsQXV0b1N0YXJ0QnV0dG9uUHJlc3NlZCxcclxuXHJcbiAgICAnTmV4dEhlbHBQYWdlQnV0dG9uUHJlc3NlZCc6IE5leHRIZWxwUGFnZUJ1dHRvblByZXNzZWQsXHJcbiAgICAnUHJldkhlbHBQYWdlQnV0dG9uUHJlc3NlZCc6IFByZXZIZWxwUGFnZUJ1dHRvblByZXNzZWQsXHJcbiAgICAnRXhpdEhlbHBCdXR0b25QcmVzc2VkJyA6IEV4aXRIZWxwQnV0dG9uUHJlc3NlZCxcclxuXHJcbiAgICAnR2FtYmxlQ29sbGVjdFByZXNzZWQnOiBHYW1ibGVDb2xsZWN0UHJlc3NlZCxcclxuICAgICdHYW1ibGVSZWRQcmVzc2VkJzogR2FtYmxlUmVkUHJlc3NlZCxcclxuICAgICdHYW1ibGVCbGFja1ByZXNzZWQnOiBHYW1ibGVCbGFja1ByZXNzZWQsXHJcbn07IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgdGFyYXNnIG9uIDkvMjIvMjAxNy5cclxuICovXHJcbi8qKlxyXG4gKiBDcmVhdGVkIGJ5IHRhcmFzZyBvbiA1LzEwLzIwMTcuXHJcbiAqL1xyXG5pbXBvcnQge2FwcH0gZnJvbSBcIi4uL21haW5cIjtcclxuaW1wb3J0ICogYXMgdXRpbHMgZnJvbSBcIi4uL1V0aWxzL2hlbHBlckZ1bmNzXCI7XHJcbmltcG9ydCB7YnV0dG9uUmVzb3VyY2VzfSBmcm9tIFwiLi9idXR0b25OYW1lc1wiO1xyXG5cclxuZXhwb3J0IGNsYXNzIEJ1dHRvbiB7XHJcblxyXG4gICAgcHVibGljIHRleHR1cmVFbmFibGVkIDogUElYSS5UZXh0dXJlO1xyXG4gICAgcHVibGljIHRleHR1cmVEaXNhYmxlZDogUElYSS5UZXh0dXJlO1xyXG4gICAgcHVibGljIHRleHR1cmVQcmVzc2VkIDogUElYSS5UZXh0dXJlO1xyXG5cclxuICAgIHB1YmxpYyBzcHJpdGU6IFBJWEkuU3ByaXRlIHwgYW55O1xyXG5cclxuICAgIHB1YmxpYyB4OiBudW1iZXI7XHJcbiAgICBwdWJsaWMgeTogbnVtYmVyO1xyXG4gICAgcHVibGljIHNjZW5lOiBQSVhJLkNvbnRhaW5lcjtcclxuICAgIHB1YmxpYyBzb3VuZDogYW55O1xyXG5cclxuICAgIHB1YmxpYyBvbkJ1dHRvbkNsaWNrIDogRnVuY3Rpb247XHJcbiAgICBwcml2YXRlIGlzRG93bjogYm9vbGVhbjtcclxuICAgIHByaXZhdGUgc3RhdGU6IHN0cmluZztcclxuXHJcblxyXG4gICAgY29uc3RydWN0b3Ioc2NlbmU6IFBJWEkuQ29udGFpbmVyLCB4OiBudW1iZXIsIHk6IG51bWJlciwgYnV0dG9uTmFtZTogc3RyaW5nLCByZXNvdXJjZXM6YW55LCBhY3Rpb246IEZ1bmN0aW9uKSB7XHJcbiAgICAgICAgLy8gZW5hYmxlZF9pbWcsIGRpc19pbWcsIHByZXNzZWRfaW1nOiAgUElYSS5UZXh0dXRyZSBvciBzdHJpbmcgdXJsIHRvIHRoZSBpbWFnZVxyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy55ID0geTtcclxuICAgICAgICB0aGlzLnNjZW5lID0gc2NlbmU7XHJcbiAgICAgICAgdGhpcy50ZXh0dXJlRW5hYmxlZCAgPSAgcmVzb3VyY2VzW2J1dHRvblJlc291cmNlc1tidXR0b25OYW1lXS5lbmFibGVkXTtcclxuICAgICAgICB0aGlzLnRleHR1cmVEaXNhYmxlZCA9IHJlc291cmNlc1tidXR0b25SZXNvdXJjZXNbYnV0dG9uTmFtZV0uZGlzYWJsZWRdO1xyXG4gICAgICAgIHRoaXMudGV4dHVyZVByZXNzZWQgID0gcmVzb3VyY2VzW2J1dHRvblJlc291cmNlc1tidXR0b25OYW1lXS5wcmVzc2VkXTtcclxuICAgICAgICB0aGlzLm9uQnV0dG9uQ2xpY2sgPSBhY3Rpb247XHJcblxyXG4gICAgICAgIHRoaXMuc3ByaXRlID0gbmV3IFBJWEkuU3ByaXRlKHRoaXMudGV4dHVyZUVuYWJsZWQpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlLmludGVyYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnNwcml0ZS5idXR0b25Nb2RlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSAnZW5hYmxlZCc7XHJcblxyXG4gICAgICAgIHRoaXMuc3ByaXRlLmFuY2hvci5zZXQoMC41LCAwLjUpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlLnggPSB0aGlzLng7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUueSA9IHRoaXMueTtcclxuICAgICAgICB0aGlzLnNwcml0ZS5vbigncG9pbnRlcmRvd24nLCBmdW5jdGlvbihlKXtcclxuICAgICAgICAgICAgdGhpcy5pc0Rvd24gPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLnNwcml0ZS50ZXh0dXJlID0gdGhpcy50ZXh0dXJlUHJlc3NlZDtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICB0aGlzLnNwcml0ZS5vbigncG9pbnRlcnVwJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICB0aGlzLnNwcml0ZS50ZXh0dXJlID0gdGhpcy50ZXh0dXJlRW5hYmxlZDtcclxuICAgICAgICAgICAgaWYgKHRoaXMuaXNEb3duKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5vbkJ1dHRvbkNsaWNrKCk7XHJcbiAgICAgICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgdGhpcy5zcHJpdGUub24oJ3BvaW50ZXJvdXQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3ByaXRlLnRleHR1cmUgPSB0aGlzLnRleHR1cmVFbmFibGVkO1xyXG4gICAgICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHRoaXMuc2NlbmUuYWRkQ2hpbGQodGhpcy5zcHJpdGUpO1xyXG5cclxuICAgICAgICB0aGlzLnNwcml0ZS5tb2RlbCA9IHRoaXM7XHJcblxyXG5cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaGlkZSgpIHtcclxuICAgICAgICB0aGlzLnNwcml0ZS52aXNpYmxlID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNob3coKSB7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUudmlzaWJsZSA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGRpc2FibGUoKSB7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9ICdkaXNhYmxlZCc7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUudGV4dHVyZSA9IHRoaXMudGV4dHVyZURpc2FibGVkO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlLmludGVyYWN0aXZlID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGVuYWJsZSgpIHtcclxuICAgICAgICB0aGlzLnN0YXRlID0gJ2VuYWJsZWQnO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlLnRleHR1cmUgPSB0aGlzLnRleHR1cmVFbmFibGVkO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlLmludGVyYWN0aXZlID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY2xpY2soKSB7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9ICdwcmVzc2VkJztcclxuICAgICAgICB0aGlzLnNwcml0ZS50ZXh0dXJlID0gdGhpcy50ZXh0dXJlUHJlc3NlZDtcclxuICAgICAgICB0aGlzLnNwcml0ZS5pbnRlcmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxufVxyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBEZW5vbWluYXRpb25QYW5lbEJ1dHRvbiBleHRlbmRzIEJ1dHRvbiB7XHJcblxyXG4gICAgcHVibGljIHNlbGVjdGVkU3Rha2U6IFBJWEkuVGV4dDtcclxuICAgIHB1YmxpYyBzdGFrZXNZcG9zOiBudW1iZXJbXSA9IFtdO1xyXG4gICAgcHVibGljIGN1cnJlbnRTdGFrZUFtb3VudDogbnVtYmVyO1xyXG4gICAgcHVibGljIHN0YWtlRm9udFN0eWxlOiBhbnk7XHJcbiAgICBwdWJsaWMgZm9udFN0eWxlOiBhbnk7XHJcbiAgICBwdWJsaWMgc3Rha2VzOiBudW1iZXJbXTtcclxuICAgIHB1YmxpYyBkZW5vbVBhbmVsQ29udGFpbmVyOiBQSVhJLkNvbnRhaW5lcjtcclxuICAgIHB1YmxpYyBkZW5vbVNwcml0ZUJvdHRvbTogUElYSS5TcHJpdGU7XHJcbiAgICBwdWJsaWMgZGVub21TcHJpdGVUb3A6IFBJWEkuU3ByaXRlO1xyXG4gICAgcHVibGljIGRlbm9tU3ByaXRlTWlkZGxlOiBQSVhJLlNwcml0ZTtcclxuICAgIHB1YmxpYyBkZW5vbVNwcml0ZVNlbGVjdGVkOiBQSVhJLlNwcml0ZTtcclxuICAgIHB1YmxpYyBkZW5vbUJvdHRvbTogUElYSS5UZXh0dXJlO1xyXG4gICAgcHVibGljIGRlbm9tVG9wOiBQSVhJLlRleHR1cmU7XHJcbiAgICBwdWJsaWMgZGVub21NaWRkbGU6IFBJWEkuVGV4dHVyZTtcclxuICAgIHB1YmxpYyBkZW5vbVNlbGVjdGVkOiBQSVhJLlRleHR1cmU7XHJcbiAgICBwcml2YXRlIGRlbm9tUGFydENvbnRhaW5lcnM6IFBJWEkuQ29udGFpbmVyW107XHJcbiAgICBwdWJsaWMgaXNTaG93bjogYm9vbGVhbjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihzY2VuZTogUElYSS5Db250YWluZXIsIHg6IG51bWJlciwgeTogbnVtYmVyLCBmb250U3R5bGU6IGFueSxzdGFrZUZvbnRTdHlsZTogYW55LCBkZW5vbUJvdHRvbTphbnksIGRlbm9tVG9wOmFueSwgZGVub21NaWQ6YW55LCBkZW5vbVNlbGVjdDogYW55LCBlbmFibGVkX2ltZzogYW55LCBkaXNfaW1nOiAgYW55LCBwcmVzc2VkX2ltZzogYW55LCBzb3VuZDogYW55LCBhY3Rpb246IEZ1bmN0aW9uKXtcclxuICAgICAgICBzdXBlcihzY2VuZSwgeCwgeSwgZW5hYmxlZF9pbWcsIGVuYWJsZWRfaW1nLCBhY3Rpb24pO1xyXG4gICAgICAgIHRoaXMuaXNTaG93biA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRTdGFrZSA9IG5ldyBQSVhJLlRleHQoJycsIGZvbnRTdHlsZSk7XHJcbiAgICAgICAgdGhpcy5mb250U3R5bGUgPSBmb250U3R5bGU7XHJcbiAgICAgICAgdGhpcy5zdGFrZUZvbnRTdHlsZSA9IHN0YWtlRm9udFN0eWxlO1xyXG4gICAgICAgIHRoaXMuZGVub21QYXJ0Q29udGFpbmVycyA9IFtdO1xyXG4gICAgICAgIGlmICh0eXBlb2YgIGRlbm9tQm90dG9tID09PSBcInN0cmluZ1wiICYmIHR5cGVvZiBkZW5vbVRvcCA9PT0gXCJzdHJpbmdcIiAmJiB0eXBlb2YgZGVub21NaWQgPT09IFwic3RyaW5nXCIgJiYgdHlwZW9mIGRlbm9tU2VsZWN0ID09PSBcInN0cmluZ1wiICl7XHJcbiAgICAgICAgICAgIHRoaXMuZGVub21Cb3R0b20gPSBQSVhJLlRleHR1cmUuZnJvbUltYWdlKGRlbm9tQm90dG9tKTtcclxuICAgICAgICAgICAgdGhpcy5kZW5vbVRvcCAgICA9IFBJWEkuVGV4dHVyZS5mcm9tSW1hZ2UoZGVub21Ub3ApO1xyXG4gICAgICAgICAgICB0aGlzLmRlbm9tTWlkZGxlID0gUElYSS5UZXh0dXJlLmZyb21JbWFnZShkZW5vbU1pZCk7XHJcbiAgICAgICAgICAgIHRoaXMuZGVub21TZWxlY3RlZCA9IFBJWEkuVGV4dHVyZS5mcm9tSW1hZ2UoZGVub21TZWxlY3QpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVub21Cb3R0b20gICA9IGRlbm9tQm90dG9tO1xyXG4gICAgICAgICAgICB0aGlzLmRlbm9tVG9wICAgICAgPSBkZW5vbVRvcDtcclxuICAgICAgICAgICAgdGhpcy5kZW5vbU1pZGRsZSAgID0gZGVub21NaWQ7XHJcbiAgICAgICAgICAgIHRoaXMuZGVub21TZWxlY3RlZCA9IGRlbm9tU2VsZWN0O1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmVuYWJsZUV2ZW50UHJvcGFnaW5hdGlvbigpO1xyXG4gICAgICAgIHRoaXMuZ2V0U3Rha2VzKCk7XHJcbiAgICAgICAgdGhpcy5pbml0aWFsaXplRGVub21pbmF0aW9uUGFuZWwoKTtcclxuICAgICAgICB0aGlzLmludGl0aWFsaXplQ3VycmVudFN0YWtlKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaW5pdGlhbGl6ZURlbm9taW5hdGlvblBhbmVsKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuZGVub21TcHJpdGVCb3R0b20gPSBuZXcgUElYSS5TcHJpdGUodGhpcy5kZW5vbUJvdHRvbSk7XHJcbiAgICAgICAgdGhpcy5kZW5vbVNwcml0ZU1pZGRsZSA9IG5ldyBQSVhJLlNwcml0ZSh0aGlzLmRlbm9tTWlkZGxlKTtcclxuICAgICAgICB0aGlzLmRlbm9tU3ByaXRlVG9wICAgID0gbmV3IFBJWEkuU3ByaXRlKHRoaXMuZGVub21Ub3ApO1xyXG4gICAgICAgIHRoaXMuZGVub21TcHJpdGVTZWxlY3RlZCA9IG5ldyBQSVhJLlNwcml0ZSh0aGlzLmRlbm9tU2VsZWN0ZWQpO1xyXG5cclxuICAgICAgICB0aGlzLmRlbm9tUGFuZWxDb250YWluZXIgPSBuZXcgUElYSS5Db250YWluZXIoKTtcclxuICAgICAgICB0aGlzLmRlbm9tUGFuZWxDb250YWluZXIudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuZGVub21QYW5lbENvbnRhaW5lci5hbHBoYSA9IDA7XHJcbiAgICAgICAgdGhpcy5kZW5vbVBhbmVsQ29udGFpbmVyLnggPSB0aGlzLnNwcml0ZS54IC0gdGhpcy5zcHJpdGUud2lkdGgvMjtcclxuICAgICAgICB0aGlzLmRlbm9tUGFuZWxDb250YWluZXIueSA9ICh0aGlzLnNwcml0ZS55IC0gdGhpcy5zcHJpdGUuaGVpZ2h0LzIpIC0gdGhpcy5kZW5vbVNwcml0ZVRvcC5oZWlnaHQgLSAodGhpcy5kZW5vbVNwcml0ZU1pZGRsZS5oZWlnaHQqKHRoaXMuc3Rha2VzLmxlbmd0aC0yKSkgLSB0aGlzLmRlbm9tU3ByaXRlQm90dG9tLmhlaWdodDtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaT0wOyBpPHRoaXMuc3Rha2VzLmxlbmd0aDsgaSsrKXtcclxuICAgICAgICAgICAgdGhpcy5hZGREZW5vbVBhbmVsUGFydChpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zY2VuZS5hZGRDaGlsZCh0aGlzLmRlbm9tUGFuZWxDb250YWluZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYWRkRGVub21QYW5lbFBhcnQoaW5kZXgpIHtcclxuICAgICAgICBsZXQgcGFydENvbnRhaW5lciA9IG5ldyBQSVhJLkNvbnRhaW5lcigpLFxyXG4gICAgICAgICAgICBzdGFrZSA9IG5ldyBQSVhJLlRleHQodXRpbHMuZm9ybWF0U3Rha2VBbW91bnQodGhpcy5zdGFrZXNbaW5kZXhdKSwgdGhpcy5mb250U3R5bGUpLFxyXG4gICAgICAgICAgICBwYXJ0U3ByaXRlO1xyXG5cclxuICAgICAgICBzdGFrZS5hbmNob3Iuc2V0KDAuNSwgMC41KTtcclxuICAgICAgICBzdGFrZS54ID0gdGhpcy5kZW5vbVNwcml0ZU1pZGRsZS53aWR0aC8yO1xyXG4gICAgICAgIHN0YWtlLnkgPSB0aGlzLmRlbm9tU3ByaXRlTWlkZGxlLmhlaWdodC8yO1xyXG5cclxuICAgICAgICBpZiAoaW5kZXggPT0gMCl7XHJcbiAgICAgICAgICAgIHBhcnRTcHJpdGUgPSB0aGlzLmRlbm9tU3ByaXRlVG9wO1xyXG4gICAgICAgICAgICBzdGFrZS55ID0gcGFydFNwcml0ZS5oZWlnaHQgLSB0aGlzLmRlbm9tU3ByaXRlTWlkZGxlLmhlaWdodC8yO1xyXG4gICAgICAgICAgICBwYXJ0Q29udGFpbmVyLnkgPSAwO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoaW5kZXggPT0gdGhpcy5zdGFrZXMubGVuZ3RoLTEpIHtcclxuICAgICAgICAgICAgcGFydFNwcml0ZSA9IHRoaXMuZGVub21TcHJpdGVCb3R0b207XHJcbiAgICAgICAgICAgIHBhcnRDb250YWluZXIueSA9IHRoaXMuZGVub21TcHJpdGVUb3AuaGVpZ2h0ICsgKHRoaXMuZGVub21TcHJpdGVNaWRkbGUuaGVpZ2h0ICogKHRoaXMuc3Rha2VzLmxlbmd0aC0yKSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcGFydFNwcml0ZSA9IG5ldyBQSVhJLlNwcml0ZSh0aGlzLmRlbm9tTWlkZGxlKTtcclxuICAgICAgICAgICAgcGFydENvbnRhaW5lci55ID0gdGhpcy5kZW5vbVNwcml0ZVRvcC5oZWlnaHQgKyAodGhpcy5kZW5vbVNwcml0ZU1pZGRsZS5oZWlnaHQgKiAoaW5kZXgtMSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnN0YWtlc1lwb3MucHVzaChwYXJ0Q29udGFpbmVyLnkgKyBzdGFrZS55KTtcclxuICAgICAgICBwYXJ0Q29udGFpbmVyLmFkZENoaWxkKHBhcnRTcHJpdGUpO1xyXG5cclxuICAgICAgICBwYXJ0Q29udGFpbmVyLmludGVyYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICBwYXJ0Q29udGFpbmVyLm9uKCdwb2ludGVyZG93bicsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlU3Rha2UodGhpcy5zdGFrZXNbaW5kZXhdKTtcclxuXHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgcGFydENvbnRhaW5lci5hZGRDaGlsZChzdGFrZSk7XHJcbiAgICAgICAgdGhpcy5kZW5vbVBhcnRDb250YWluZXJzLnB1c2gocGFydENvbnRhaW5lcik7XHJcbiAgICAgICAgdGhpcy5kZW5vbVBhbmVsQ29udGFpbmVyLmFkZENoaWxkKHBhcnRDb250YWluZXIpXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRTdGFrZXMoKSB7XHJcbiAgICAgICAgdGhpcy5zdGFrZXMgPSBbMjAsIDQwLCA2MCwgODAsIDEwMF0ucmV2ZXJzZSgpO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFN0YWtlQW1vdW50ID0gdGhpcy5zdGFrZXNbMF07XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpbnRpdGlhbGl6ZUN1cnJlbnRTdGFrZSgpIHtcclxuICAgICAgICB0aGlzLnNlbGVjdGVkU3Rha2UgPSBuZXcgUElYSS5UZXh0KHV0aWxzLmZvcm1hdFN0YWtlQW1vdW50KHRoaXMuY3VycmVudFN0YWtlQW1vdW50KSwgdGhpcy5zdGFrZUZvbnRTdHlsZSk7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZFN0YWtlLmFuY2hvci5zZXQoMC41LCAwLjUpO1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRTdGFrZS54ID0gdGhpcy5zcHJpdGUueDtcclxuICAgICAgICB0aGlzLnNlbGVjdGVkU3Rha2UueSA9IHRoaXMuc3ByaXRlLnkrNTsgLy8gKzUgZHVlIHRvIGdyYXBoaWNzIGlzc3VlXHJcbiAgICAgICAgdGhpcy5zY2VuZS5hZGRDaGlsZCh0aGlzLnNlbGVjdGVkU3Rha2UpO1xyXG5cclxuICAgICAgICB0aGlzLmRlbm9tU3ByaXRlU2VsZWN0ZWQuYW5jaG9yLnNldCgwLjUsIDAuNSk7XHJcbiAgICAgICAgdGhpcy5kZW5vbVNwcml0ZVNlbGVjdGVkLmFscGhhID0gMC4yO1xyXG4gICAgICAgIHRoaXMuZGVub21TcHJpdGVTZWxlY3RlZC54ID0gdGhpcy5kZW5vbVNwcml0ZU1pZGRsZS53aWR0aC8yO1xyXG4gICAgICAgIHRoaXMuZGVub21TcHJpdGVTZWxlY3RlZC55ID0gdGhpcy5nZXRTZWxlY3RlZFN0YWtlWXBvcygpO1xyXG4gICAgICAgIHRoaXMuZGVub21QYW5lbENvbnRhaW5lci5hZGRDaGlsZCh0aGlzLmRlbm9tU3ByaXRlU2VsZWN0ZWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0U2VsZWN0ZWRTdGFrZVlwb3MoKTogbnVtYmVyIHtcclxuICAgICAgICBsZXQgaW5kZXggPSB0aGlzLnN0YWtlcy5pbmRleE9mKHRoaXMuY3VycmVudFN0YWtlQW1vdW50KTtcclxuICAgICAgICByZXR1cm4gdGhpcy5zdGFrZXNZcG9zW2luZGV4XTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBlbmFibGVFdmVudFByb3BhZ2luYXRpb24oKSB7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUub24oJ3BvaW50ZXJkb3duJywgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIHRoaXMuaXNEb3duID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5zb3VuZC5jdXJyZW50VGltZSA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuc291bmQucGxheSgpO1xyXG4gICAgICAgICAgICB0aGlzLnNwcml0ZS50ZXh0dXJlID0gdGhpcy50ZXh0dXJlUHJlc3NlZDtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICB0aGlzLnNwcml0ZS5vbigncG9pbnRlcnVwJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICB0aGlzLnNwcml0ZS50ZXh0dXJlID0gdGhpcy50ZXh0dXJlRW5hYmxlZDtcclxuICAgICAgICAgICAgaWYgKHRoaXMuaXNEb3duKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5vbkNsaWNrKCk7XHJcbiAgICAgICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2hvd1BhbmVsKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5pc1Nob3duKVxyXG4gICAgICAgICAgICBhcHAudGlja2VyLmFkZChzaG93UGFuZWxBbmltYXRpb24sIHRoaXMpO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBzaG93UGFuZWxBbmltYXRpb24odGltZWRlbHRhOiBudW1iZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5kZW5vbVBhbmVsQ29udGFpbmVyLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLmRlbm9tUGFuZWxDb250YWluZXIuYWxwaGEgPSBNYXRoLm1pbigodGhpcy5kZW5vbVBhbmVsQ29udGFpbmVyLmFscGhhKygwLjA4KnRpbWVkZWx0YSkpLCAxKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZGVub21QYW5lbENvbnRhaW5lci5hbHBoYSA9PSAxKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzU2hvd24gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zY2VuZS5pbnRlcmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBhcHAudGlja2VyLnJlbW92ZShzaG93UGFuZWxBbmltYXRpb24sIHRoaXMpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaGlkZVBhbmVsKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmlzU2hvd24pXHJcbiAgICAgICAgICAgIGFwcC50aWNrZXIuYWRkKGhpZGVQYW5lbEFuaW1hdGlvbiwgdGhpcyk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGhpZGVQYW5lbEFuaW1hdGlvbih0aW1lZGVsdGE6IG51bWJlcikge1xyXG4gICAgICAgICAgICB0aGlzLmRlbm9tUGFuZWxDb250YWluZXIuYWxwaGEgPSBNYXRoLm1heCgodGhpcy5kZW5vbVBhbmVsQ29udGFpbmVyLmFscGhhLSgwLjA4KnRpbWVkZWx0YSkpLCAwKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZGVub21QYW5lbENvbnRhaW5lci5hbHBoYSA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlbm9tUGFuZWxDb250YWluZXIudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc1Nob3duID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNjZW5lLmludGVyYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBhcHAudGlja2VyLnJlbW92ZShoaWRlUGFuZWxBbmltYXRpb24sIHRoaXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjaGFuZ2VTdGFrZSh0bykge1xyXG5cclxuICAgICAgICBsZXQgdG9ZID0gdGhpcy5zdGFrZXNZcG9zW3RoaXMuc3Rha2VzLmluZGV4T2YodG8pXTtcclxuICAgICAgICB0aGlzLnNldEludGVyYWN0aXZlRm9yUGFydENvbnRhaW5lcnMoZmFsc2UpO1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRTdGFrZS50ZXh0ID0gIHV0aWxzLmZvcm1hdFN0YWtlQW1vdW50KHRvKTtcclxuXHJcbiAgICAgICAgbGV0IGNoYW5nZVN0YWtlRXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQoJ2NoYW5nZVN0YWtlRXZlbnQnLCB7J2RldGFpbCc6eyduZXdTdGFrZSc6IHRvfX0pO1xyXG4gICAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoY2hhbmdlU3Rha2VFdmVudCk7XHJcblxyXG4gICAgICAgIGFwcC50aWNrZXIuYWRkKGNoYW5nZVN0YWtlQW5pbWF0aW9uLCB0aGlzKTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY2hhbmdlU3Rha2VBbmltYXRpb24odGltZWRlbHRhOiBudW1iZXIpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZGVub21TcHJpdGVTZWxlY3RlZC55IDwgdG9ZKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVub21TcHJpdGVTZWxlY3RlZC55ID0gTWF0aC5taW4odGhpcy5kZW5vbVNwcml0ZVNlbGVjdGVkLnkgKyB0aW1lZGVsdGEqMzAsIHRvWSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5kZW5vbVNwcml0ZVNlbGVjdGVkLnkgPiB0b1kpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVub21TcHJpdGVTZWxlY3RlZC55ID0gTWF0aC5tYXgodGhpcy5kZW5vbVNwcml0ZVNlbGVjdGVkLnkgLSB0aW1lZGVsdGEqMzAsIHRvWSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTdGFrZUFtb3VudCA9IHRvO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRJbnRlcmFjdGl2ZUZvclBhcnRDb250YWluZXJzKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgYXBwLnRpY2tlci5yZW1vdmUoY2hhbmdlU3Rha2VBbmltYXRpb24sIHRoaXMpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldEludGVyYWN0aXZlRm9yUGFydENvbnRhaW5lcnModmFsdWU6IGJvb2xlYW4pe1xyXG4gICAgICAgIGZvcihsZXQgaT0wOyBpPHRoaXMuZGVub21QYXJ0Q29udGFpbmVycy5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgICAgIHRoaXMuZGVub21QYXJ0Q29udGFpbmVyc1tpXS5pbnRlcmFjdGl2ZSA9IHZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn1cclxuXHJcbiIsImV4cG9ydCBsZXQgYnV0dG9uUmVzb3VyY2VzID0ge1xuICAgICdTdGFydEJ1dHRvbicgOiB7XG4gICAgICAgICdlbmFibGVkJzogJ0JUTl9TcGluJyxcbiAgICAgICAgJ2Rpc2FibGVkJzogJ0JUTl9TcGluX2QnLFxuICAgICAgICAncHJlc3NlZCc6ICdCVE5fU3Bpbl9kJ1xuICAgIH0sXG4gICAgJ1N0b3BCdXR0b24nIDoge1xuICAgICAgICAnZW5hYmxlZCc6ICdCVE5fU3BpbicsXG4gICAgICAgICdkaXNhYmxlZCc6ICdCVE5fU3Bpbl9kJyxcbiAgICAgICAgJ3ByZXNzZWQnOiAnQlROX1NwaW5fZCdcbiAgICB9XG59IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgdGFyYXNnIG9uIDEwLzExLzIwMTcuXHJcbiAqL1xyXG5cclxuLy8gaW1wb3J0ICogYXMgQW5pbWF0aW9ucyBmcm9tIFwiLi4vVXRpbHMvYW5pbWF0aW9uX29iamVjdHNcIjtcclxuaW1wb3J0ICogYXMgdXRpbHMgZnJvbSBcIi4uL1V0aWxzL2hlbHBlckZ1bmNzXCJcclxuaW1wb3J0ICogYXMgY29uZmlnIGZyb20gXCIuL3JlZWxzQ29uZmlnXCJcclxuXHJcblxyXG4vLyBleHBvcnQgbGV0IFN5bWJvbHNUZXh0dXJlOiAgICBQSVhJLkJhc2VUZXh0dXJlID0gUElYSS5CYXNlVGV4dHVyZS5mcm9tSW1hZ2UoJy4uL01lZGlhL3N5bWJvbHMucG5nJyksXHJcbi8vICAgICBCbGF6aW5nVGV4dHVyZTogICAgUElYSS5UZXh0dXJlICAgICA9IG5ldyBQSVhJLlRleHR1cmUoU3ltYm9sc1RleHR1cmUsIG5ldyBQSVhJLlJlY3RhbmdsZSgwLDAsIGNvbmZpZy5zeW1ib2xXaWR0aCwgY29uZmlnLnN5bWJvbEhlaWdodCkpLFxyXG4vLyAgICAgU2V2ZW5UZXh0dXJlOiAgICAgIFBJWEkuVGV4dHVyZSAgICAgPSBuZXcgUElYSS5UZXh0dXJlKFN5bWJvbHNUZXh0dXJlLCBuZXcgUElYSS5SZWN0YW5nbGUoMCwyMzcsIGNvbmZpZy5zeW1ib2xXaWR0aCwgY29uZmlnLnN5bWJvbEhlaWdodCkpLFxyXG4vLyAgICAgV2F0ZXJtZWxvblRleHR1cmU6IFBJWEkuVGV4dHVyZSAgICAgPSBuZXcgUElYSS5UZXh0dXJlKFN5bWJvbHNUZXh0dXJlLCBuZXcgUElYSS5SZWN0YW5nbGUoMCw0NzQsIGNvbmZpZy5zeW1ib2xXaWR0aCwgY29uZmlnLnN5bWJvbEhlaWdodCkpLFxyXG4vLyAgICAgUGx1bVRleHR1cmU6ICAgICAgIFBJWEkuVGV4dHVyZSAgICAgPSBuZXcgUElYSS5UZXh0dXJlKFN5bWJvbHNUZXh0dXJlLCBuZXcgUElYSS5SZWN0YW5nbGUoMCw3MTEsIGNvbmZpZy5zeW1ib2xXaWR0aCwgY29uZmlnLnN5bWJvbEhlaWdodCkpLFxyXG4vLyAgICAgT3JhbmdlVGV4dHVyZTogICAgIFBJWEkuVGV4dHVyZSAgICAgPSBuZXcgUElYSS5UZXh0dXJlKFN5bWJvbHNUZXh0dXJlLCBuZXcgUElYSS5SZWN0YW5nbGUoMCw5NDgsIGNvbmZpZy5zeW1ib2xXaWR0aCwgY29uZmlnLnN5bWJvbEhlaWdodCkpLFxyXG4vLyAgICAgTGVtb25UZXh0dXJlOiAgICAgIFBJWEkuVGV4dHVyZSAgICAgPSBuZXcgUElYSS5UZXh0dXJlKFN5bWJvbHNUZXh0dXJlLCBuZXcgUElYSS5SZWN0YW5nbGUoMCwxMTg1LCBjb25maWcuc3ltYm9sV2lkdGgsIGNvbmZpZy5zeW1ib2xIZWlnaHQpKSxcclxuLy8gICAgIENoZXJyeVRleHR1cmU6ICAgICBQSVhJLlRleHR1cmUgICAgID0gbmV3IFBJWEkuVGV4dHVyZShTeW1ib2xzVGV4dHVyZSwgbmV3IFBJWEkuUmVjdGFuZ2xlKDAsMTQyMiwgY29uZmlnLnN5bWJvbFdpZHRoLCBjb25maWcuc3ltYm9sSGVpZ2h0KSksXHJcbi8vICAgICBCb251c1RleHR1cmU6ICAgICAgUElYSS5UZXh0dXJlICAgICA9IG5ldyBQSVhJLlRleHR1cmUoU3ltYm9sc1RleHR1cmUsIG5ldyBQSVhJLlJlY3RhbmdsZSgwLDE2NTksIGNvbmZpZy5zeW1ib2xXaWR0aCwgY29uZmlnLnN5bWJvbEhlaWdodCkpLFxyXG4vLyAgICAgV2lsZFRleHR1cmU6ICAgICAgIFBJWEkuVGV4dHVyZSAgICAgPSBuZXcgUElYSS5UZXh0dXJlKFN5bWJvbHNUZXh0dXJlLCBuZXcgUElYSS5SZWN0YW5nbGUoMCwxODk2LCBjb25maWcuc3ltYm9sV2lkdGgsIGNvbmZpZy5zeW1ib2xIZWlnaHQpKSxcclxuLy8gICAgIEJsYXppbmdTcGl0ZSAgICAgICA9ICgpID0+IG5ldyBQSVhJLlNwcml0ZShCbGF6aW5nVGV4dHVyZSksXHJcbi8vICAgICBTZXZlblNwaXRlICAgICAgICAgPSAoKSA9PiBuZXcgUElYSS5TcHJpdGUoU2V2ZW5UZXh0dXJlKSxcclxuLy8gICAgIFdhdGVybWVsb25TcHJpdGUgICA9ICgpID0+IG5ldyBQSVhJLlNwcml0ZShXYXRlcm1lbG9uVGV4dHVyZSksXHJcbi8vICAgICBQbHVtU3ByaXRlICAgICAgICAgPSAoKSA9PiBuZXcgUElYSS5TcHJpdGUoUGx1bVRleHR1cmUpLFxyXG4vLyAgICAgT3JhbmdlU3ByaXRlICAgICAgID0gKCkgPT4gbmV3IFBJWEkuU3ByaXRlKE9yYW5nZVRleHR1cmUpLFxyXG4vLyAgICAgTGVtb25TcHJpdGUgICAgICAgID0gKCkgPT4gbmV3IFBJWEkuU3ByaXRlKExlbW9uVGV4dHVyZSksXHJcbi8vICAgICBDaGVycnlTcHJpdGUgICAgICAgPSAoKSA9PiBuZXcgUElYSS5TcHJpdGUoQ2hlcnJ5VGV4dHVyZSksXHJcbi8vICAgICBCb251c1Nwcml0ZSAgICAgICAgPSAoKSA9PiBuZXcgUElYSS5TcHJpdGUoQm9udXNUZXh0dXJlKSxcclxuLy8gICAgIFdpbGRTcHJpdGUgICAgICAgICA9ICgpID0+IG5ldyBQSVhJLlNwcml0ZShXaWxkVGV4dHVyZSksXHJcbi8vICAgICBCbGF6aW5nV2luU2hvdyAgICAgPSAoKSA9PiB1dGlscy5DcmVhdGVBbmltYXRpb24oUElYSS5CYXNlVGV4dHVyZS5mcm9tSW1hZ2UoJy4uL01lZGlhL2FuaW1hdGlvbnMvd2luc2hvdy9iZi93aW5zaG93QkYucG5nJyksIEFuaW1hdGlvbnMuYmZfd2luc2hvd19hbmltKSxcclxuLy8gICAgIFNldmVuV2luU2hvdyAgICAgICA9ICgpID0+IHV0aWxzLkNyZWF0ZUFuaW1hdGlvbihQSVhJLkJhc2VUZXh0dXJlLmZyb21JbWFnZSgnLi4vTWVkaWEvYW5pbWF0aW9ucy93aW5zaG93L3NldmVuL3dpbnNob3dTZXZlbi5wbmcnKSwgQW5pbWF0aW9ucy5zZXZlbl93aW5zaG93X2FuaW0pLFxyXG4vLyAgICAgV2F0ZXJtZWxvbldpblNob3cgID0gKCkgPT4gdXRpbHMuQ3JlYXRlQW5pbWF0aW9uKFBJWEkuQmFzZVRleHR1cmUuZnJvbUltYWdlKCcuLi9NZWRpYS9hbmltYXRpb25zL3dpbnNob3cvd20vd2luc2hvd1dNLnBuZycpLCBBbmltYXRpb25zLndtX3dpbnNob3dfYW5pbSksXHJcbi8vICAgICBQbHVtV2luU2hvdyAgICAgICAgPSAoKSA9PiB1dGlscy5DcmVhdGVBbmltYXRpb24oUElYSS5CYXNlVGV4dHVyZS5mcm9tSW1hZ2UoJy4uL01lZGlhL2FuaW1hdGlvbnMvd2luc2hvdy9wbHVtL3dpbnNob3dQbHVtLnBuZycpLCBBbmltYXRpb25zLnBsdW1fd2luc2hvd19hbmltKSxcclxuLy8gICAgIE9yYW5nZVdpblNob3cgICAgICA9ICgpID0+IHV0aWxzLkNyZWF0ZUFuaW1hdGlvbihQSVhJLkJhc2VUZXh0dXJlLmZyb21JbWFnZSgnLi4vTWVkaWEvYW5pbWF0aW9ucy93aW5zaG93L29yYW5nZS93aW5zaG93T3JhbmdlLnBuZycpLCBBbmltYXRpb25zLm9yYW5nZV93aW5zaG93X2FuaW0pLFxyXG4vLyAgICAgTGVtb25XaW5TaG93ICAgICAgID0gKCkgPT4gdXRpbHMuQ3JlYXRlQW5pbWF0aW9uKFBJWEkuQmFzZVRleHR1cmUuZnJvbUltYWdlKCcuLi9NZWRpYS9hbmltYXRpb25zL3dpbnNob3cvbGVtb24vd2luc2hvd0xlbW9uLnBuZycpLCBBbmltYXRpb25zLmxlbW9uX3dpbnNob3dfYW5pbSksXHJcbi8vICAgICBDaGVycnlXaW5TaG93ICAgICAgPSAoKSA9PiB1dGlscy5DcmVhdGVBbmltYXRpb24oUElYSS5CYXNlVGV4dHVyZS5mcm9tSW1hZ2UoJy4uL01lZGlhL2FuaW1hdGlvbnMvd2luc2hvdy9jaGVycnkvd2luc2hvd0NoZXJyeS5wbmcnKSwgQW5pbWF0aW9ucy5jaGVycnlfd2luc2hvd19hbmltKSxcclxuLy8gICAgIEJvbnVzV2luU2hvdyAgICAgICA9ICgpID0+IHV0aWxzLkNyZWF0ZUFuaW1hdGlvbihQSVhJLkJhc2VUZXh0dXJlLmZyb21JbWFnZSgnLi4vTWVkaWEvYW5pbWF0aW9ucy93aW5zaG93L2JvbnVzL3dpbnNob3dCb251cy5wbmcnKSwgQW5pbWF0aW9ucy5ib251c193aW5zaG93X2FuaW0pLFxyXG4vLyAgICAgV2lsZFdpblNob3cgICAgICAgID0gKCkgPT4gdXRpbHMuQ3JlYXRlQW5pbWF0aW9uKFBJWEkuQmFzZVRleHR1cmUuZnJvbUltYWdlKCcuLi9NZWRpYS9hbmltYXRpb25zL3dpbnNob3cvd2lsZC93aW5zaG93V2lsZC5wbmcnKSwgQW5pbWF0aW9ucy53aWxkX3dpbnNob3dfYW5pbSk7XHJcblxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJU3ltYm9sIHtcclxuICAgIG5hbWU6IHN0cmluZyxcclxuICAgIHJlZWxWYWx1ZTogbnVtYmVyLFxyXG5cclxufVxyXG5cclxuXHJcbmV4cG9ydCBjb25zdCBTeW1ib2wxOiBJU3ltYm9sID0ge1xyXG4gICAgbmFtZTogJ1NZTTEnLFxyXG4gICAgcmVlbFZhbHVlOiAxXHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgU3ltYm9sMzogSVN5bWJvbCA9IHtcclxuICAgIG5hbWU6ICdTWU0zJyxcclxuICAgIHJlZWxWYWx1ZTogM1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IFN5bWJvbDQ6IElTeW1ib2wgPSB7XHJcbiAgICBuYW1lOiAnU1lNNCcsXHJcbiAgICByZWVsVmFsdWU6IDRcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBTeW1ib2w1OiBJU3ltYm9sID0ge1xyXG4gICAgbmFtZTogJ1NZTTUnLFxyXG4gICAgcmVlbFZhbHVlOiA1XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgU3ltYm9sNjogSVN5bWJvbCA9IHtcclxuICAgIG5hbWU6ICdTWU02JyxcclxuICAgIHJlZWxWYWx1ZTogNlxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IFN5bWJvbDc6IElTeW1ib2wgPSB7XHJcbiAgICBuYW1lOiAnU1lNNycsXHJcbiAgICByZWVsVmFsdWU6IDdcclxufTtcclxuXHJcblxyXG5cclxuZXhwb3J0IGNvbnN0IFNZTUJPTFMgPSBbU3ltYm9sMSwgU3ltYm9sMywgU3ltYm9sNCwgU3ltYm9sNSwgU3ltYm9sNiwgU3ltYm9sN107XHJcbmV4cG9ydCBjb25zdCBzaG93U3ltYm9scyA9IFtTeW1ib2wxLCBTeW1ib2wzLCBTeW1ib2w0LCBTeW1ib2w1LCBTeW1ib2w2LCBTeW1ib2w3XTsiLCIvKipcclxuICogQ3JlYXRlZCBieSB0YXJhc2cgb24gMTAvMTMvMjAxNy5cclxuICovXHJcblxyXG5cclxuaW1wb3J0ICogYXMgY29uZmlnIGZyb20gXCIuLi9SZWVsU3Bpbm5lci9yZWVsc0NvbmZpZ1wiXHJcbmltcG9ydCB7SVN5bWJvbCwgU1lNQk9MU30gZnJvbSBcIi4vTWFpblJvdW5kU3ltYm9sc1wiO1xyXG5pbXBvcnQge2FwcH0gZnJvbSBcIi4uL21haW5cIjtcclxuaW1wb3J0IHtSZWVsU2V0fSBmcm9tIFwiLi9SZWVsU2V0c1wiO1xyXG5cclxuXHJcblxyXG5leHBvcnQgY2xhc3MgUmVlbE4ge1xyXG5cclxuICAgIHB1YmxpYyB4OiBudW1iZXI7XHJcbiAgICBwdWJsaWMgeTogbnVtYmVyO1xyXG4gICAgcHVibGljIGluZGV4OiBudW1iZXI7XHJcbiAgICBwdWJsaWMgcmVlbENvbnRhaW5lcjogUElYSS5Db250YWluZXI7XHJcbiAgICBwdWJsaWMgdmlzaWJsZVN5bWJvbHNBcnJheTogQXJyYXk8SVN5bWJvbD47XHJcbiAgICBwdWJsaWMgbmV4dFNwcml0ZTogUElYSS5TcHJpdGU7XHJcbiAgICBwdWJsaWMgbmV4dFN5bWJvbDogSVN5bWJvbDtcclxuICAgIHB1YmxpYyB2aXNpYmxlU3ByaXRlczogQXJyYXk8UElYSS5TcHJpdGUgfCBhbnk+O1xyXG4gICAgcHJpdmF0ZSByZXNvdXJjZXM6IEFycmF5PFBJWEkuVGV4dHVyZSB8IGFueT5cclxuXHJcbiAgICBwcml2YXRlIHJlZWxWYWx1ZXNNYXRoOiBBcnJheTxudW1iZXI+O1xyXG4gICAgcHJpdmF0ZSBzeW1ib2xzQW1vdW50OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHJlZWxzQ29udGFpbmVyOiBQSVhJLkNvbnRhaW5lcjtcclxuICAgIHByaXZhdGUgcmVlbE1hc2s6IFBJWEkuR3JhcGhpY3M7XHJcbiAgICBwcml2YXRlIFdpblNob3dBbmltYXRpb246IFBJWEkuZXh0cmFzLkFuaW1hdGVkU3ByaXRlO1xyXG4gICAgcHJpdmF0ZSB3aW5TaG93VGltZTogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBTcGlubmluZ1RpbWU6IG51bWJlcjtcclxuICAgIHByaXZhdGUgU3Bpbm5pbmdTcGVlZDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBzcGlubmluZ0luZGV4OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHlfZGVsdGE6IG51bWJlcjtcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgcHJpdmF0ZSByZWVsU3ltYm9sc0Ftb3VudDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBzdG9wU3ltYm9sczogbnVtYmVyW107XHJcbiAgICBwcml2YXRlIHRlbXBSZWVsOiBQSVhJLlNwcml0ZVtdO1xyXG4gICAgcHJpdmF0ZSByZWVsQ29udFN0b3BZOiBudW1iZXI7XHJcblxyXG4gICAgcHJpdmF0ZSByZWVsU3RvcFNvdW5kOiBhbnk7XHJcbiAgICBwcml2YXRlIGlzU2xhbW91dDogYm9vbGVhbjtcclxuXHJcblxyXG4gICAgY29uc3RydWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIsIGluZGV4Om51bWJlciwgcmVlbHNDb250YWluZXI6IFBJWEkuQ29udGFpbmVyLCByZXNvdXJjZXM6YW55KXtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICAgICAgdGhpcy5pbmRleCA9IGluZGV4O1xyXG4gICAgICAgIHRoaXMucmVzb3VyY2VzID0gcmVzb3VyY2VzO1xyXG4gICAgICAgIHRoaXMuc3ltYm9sc0Ftb3VudCA9IGNvbmZpZy5SZWVsc0NvbmZpZy5yZWVsc1tpbmRleF0uc3ltYm9sc0Ftb3VudDtcclxuICAgICAgICB0aGlzLlNwaW5uaW5nVGltZSA9IGNvbmZpZy5SZWVsc0NvbmZpZy5yZWVsc1tpbmRleF0uU3Bpbm5pbmdUaW1lO1xyXG4gICAgICAgIHRoaXMuU3Bpbm5pbmdTcGVlZCA9IGNvbmZpZy5SZWVsc0NvbmZpZy5zcGlubmluZ1NwZWVkO1xyXG4gICAgICAgIHRoaXMucmVlbHNDb250YWluZXIgPSByZWVsc0NvbnRhaW5lcjtcclxuICAgICAgICB0aGlzLnJlZWxNYXNrID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcclxuICAgICAgICB0aGlzLnZpc2libGVTeW1ib2xzQXJyYXkgPSBbXTtcclxuICAgICAgICB0aGlzLnJlZWxWYWx1ZXNNYXRoID0gUmVlbFNldFtpbmRleF07XHJcbiAgICAgICAgdGhpcy5zcGlubmluZ0luZGV4ID0gMDtcclxuICAgICAgICB0aGlzLnRlbXBSZWVsID0gW107XHJcbiAgICAgICAgdGhpcy52aXNpYmxlU3ByaXRlcyA9IFtdO1xyXG4gICAgICAgIHRoaXMud2luU2hvd1RpbWUgPSAyMDAwO1xyXG5cclxuICAgICAgICAvLyB0aGlzLnJlZWxTdG9wU291bmQgPSBuZXcgQXVkaW8ocmVzb3VyY2VzLnJlZWxzdG9wLnVybCk7XHJcbiAgICAgICAgdGhpcy5pc1NsYW1vdXQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5Jbml0aWFsaXplUmVlbCgpO1xyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZU1hc2soKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRSYW5kb21TeW1ib2woKTogSVN5bWJvbCB7XHJcbiAgICAgICAgcmV0dXJuIFNZTUJPTFNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogU1lNQk9MUy5sZW5ndGgpXTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIEluaXRpYWxpemVSZWVsKCk6dm9pZCB7XHJcbiAgICAgICAgdGhpcy5yZWVsQ29udGFpbmVyID0gbmV3IFBJWEkuQ29udGFpbmVyKCk7XHJcbiAgICAgICAgdGhpcy5yZWVsQ29udGFpbmVyLnggPSB0aGlzLng7XHJcbiAgICAgICAgdGhpcy5yZWVsQ29udGFpbmVyLnkgPSB0aGlzLnk7XHJcbiAgICAgICAgdGhpcy55X2RlbHRhID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5yZWVsU3ltYm9sc0Ftb3VudCA9IHRoaXMuc3ltYm9sc0Ftb3VudCArIHRoaXMuY2FsY3VsYXRlU3ltYm9sc0Ftb3VudCgpO1xyXG4gICAgICAgIHRoaXMucmVlbENvbnRTdG9wWSA9ICh0aGlzLnJlZWxTeW1ib2xzQW1vdW50LXRoaXMuc3ltYm9sc0Ftb3VudCkqY29uZmlnLnN5bWJvbEhlaWdodDtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaT0wOyBpPHRoaXMucmVlbFN5bWJvbHNBbW91bnQ7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgc3ltYm9sID0gdGhpcy5nZXRSYW5kb21TeW1ib2woKSxcclxuICAgICAgICAgICAgICAgIHNwcml0ZSA9IG5ldyBQSVhJLlNwcml0ZSh0aGlzLnJlc291cmNlc1tzeW1ib2wubmFtZV0pO1xyXG4gICAgICAgICAgICBzcHJpdGUueSA9IGNvbmZpZy5zeW1ib2xIZWlnaHQgKiAodGhpcy5zeW1ib2xzQW1vdW50IC0gaSAtIDEpO1xyXG4gICAgICAgICAgICB0aGlzLnRlbXBSZWVsLnB1c2goc3ByaXRlKTtcclxuICAgICAgICAgICAgdGhpcy5yZWVsQ29udGFpbmVyLmFkZENoaWxkQXQoc3ByaXRlLCBpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5yZWVsQ29udGFpbmVyLnkgKz0gdGhpcy5yZWVsQ29udFN0b3BZO1xyXG4gICAgICAgIHRoaXMucmVlbHNDb250YWluZXIuYWRkQ2hpbGQodGhpcy5yZWVsQ29udGFpbmVyKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgcHJpdmF0ZSBpbml0aWFsaXplTWFzaygpOiB2b2lkIHtcclxuICAgICAgICAvLyBjcmVhdGVzIG1hc2sgYXJvdW5kIHRoZSByZWVsQ29udGFpbmVyXHJcbiAgICAgICAgdGhpcy5yZWVsc0NvbnRhaW5lci5hZGRDaGlsZCh0aGlzLnJlZWxNYXNrKTtcclxuICAgICAgICB0aGlzLnJlZWxNYXNrLmxpbmVTdHlsZSgwKTtcclxuICAgICAgICB0aGlzLnJlZWxDb250YWluZXIubWFzayA9IHRoaXMucmVlbE1hc2s7XHJcblxyXG4gICAgICAgIHRoaXMucmVlbE1hc2suYmVnaW5GaWxsKDB4OGJjNWZmLCAwLjEpO1xyXG4gICAgICAgIHRoaXMucmVlbE1hc2subW92ZVRvKHRoaXMueCwgdGhpcy55KTtcclxuICAgICAgICB0aGlzLnJlZWxNYXNrLmxpbmVUbyh0aGlzLnggKyBjb25maWcuc3ltYm9sV2lkdGgsIHRoaXMueSk7XHJcbiAgICAgICAgdGhpcy5yZWVsTWFzay5saW5lVG8odGhpcy54ICsgY29uZmlnLnN5bWJvbFdpZHRoLCAodGhpcy55K2NvbmZpZy5zeW1ib2xIZWlnaHQpKnRoaXMuc3ltYm9sc0Ftb3VudCk7XHJcbiAgICAgICAgdGhpcy5yZWVsTWFzay5saW5lVG8odGhpcy54LCAodGhpcy55K2NvbmZpZy5zeW1ib2xIZWlnaHQpKnRoaXMuc3ltYm9sc0Ftb3VudCk7XHJcbiAgICAgICAgdGhpcy5yZWVsTWFzay5saW5lVG8odGhpcy54LCB0aGlzLnkpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBwdWJsaWMgc3RhcnRTcGluQW5pbWF0aW9uKHN0b3BTeW1ib2xzOiBudW1iZXJbXSk6IHZvaWQge1xyXG5cclxuICAgICAgICB0aGlzLnN0b3BTeW1ib2xzID0gc3RvcFN5bWJvbHM7XHJcbiAgICAgICAgYXBwLnRpY2tlci5hZGQoYW5pbWF0ZVN0YXJTcGluLCB0aGlzKTtcclxuXHJcbiAgICAgICAgbGV0IHBvc2l0aW9uID0gdGhpcy5yZWVsQ29udGFpbmVyLnk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFuaW1hdGVTdGFyU3Bpbih0aW1lZGVsdGE6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5yZWVsQ29udGFpbmVyLnkgPiBwb3NpdGlvbi1jb25maWcuU3RhcnRBbmltRGVsdGEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVlbENvbnRhaW5lci55IC09IE1hdGguZmxvb3IoY29uZmlnLlN0YXJ0QW5pbVNwZWVkICogdGltZWRlbHRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgYXBwLnRpY2tlci5yZW1vdmUoYW5pbWF0ZVN0YXJTcGluLCB0aGlzKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3BpbkFuaW1hdGlvbihzdG9wU3ltYm9scyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHByaXZhdGUgY2FsY3VsYXRlU3ltYm9sc0Ftb3VudCgpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCBkaXN0YW5jZVBYID0gY29uZmlnLlJlZWxzQ29uZmlnLnNwaW5uaW5nU3BlZWQgKiA2MCAqICh0aGlzLlNwaW5uaW5nVGltZS8xMDAwKTtcclxuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihkaXN0YW5jZVBYL2NvbmZpZy5zeW1ib2xIZWlnaHQpXHJcbiAgICB9XHJcblxyXG5cclxuICAgIHB1YmxpYyBzbGFtT3V0KCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuaXNTbGFtb3V0ID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnJlZWxDb250YWluZXIueSA9IHRoaXMucmVlbENvbnRTdG9wWTtcclxuXHJcbiAgICB9XHJcblxyXG5cclxuICAgIHByaXZhdGUgc3dhcEN1cnJlbnRWaXNpYmxlVGV4dHVyZXMoKTogdm9pZCB7XHJcbiAgICAgICAgZm9yIChsZXQgaT0wOyBpPHRoaXMuc3ltYm9sc0Ftb3VudDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCB0ZXh0dXJlID0gdGhpcy50ZW1wUmVlbFt0aGlzLnRlbXBSZWVsLmxlbmd0aC0xLWldLnRleHR1cmU7XHJcbiAgICAgICAgICAgIHRoaXMudGVtcFJlZWxbdGhpcy5zeW1ib2xzQW1vdW50LTEtaV0udGV4dHVyZSA9IHRleHR1cmU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0U3RvcFN5bWJvbHMoc3RvcFN5bWJvbHM6IG51bWJlcltdKTogdm9pZCB7XHJcbiAgICAgICAgZm9yIChsZXQgaT0wOyBpPHN0b3BTeW1ib2xzLmxlbmd0aDsgaSsrKXtcclxuICAgICAgICAgICAgbGV0IHRleHR1cmUgPSB0aGlzLnJlc291cmNlc1tTWU1CT0xTW3N0b3BTeW1ib2xzW2ldXS5uYW1lXTtcclxuICAgICAgICAgICAgdGhpcy50ZW1wUmVlbFt0aGlzLnJlZWxTeW1ib2xzQW1vdW50LWktMV0udGV4dHVyZSA9IHRleHR1cmU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBwdWJsaWMgc3BpbkFuaW1hdGlvbihzdG9wU3ltYm9sczogbnVtYmVyW10pIDogdm9pZCB7XHJcblxyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgICAgICB0aGlzLmlzU2xhbW91dCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvLyBzd2FwIHZpc2libGUgZWxlbWVudHNcclxuICAgICAgICB0aGlzLnN3YXBDdXJyZW50VmlzaWJsZVRleHR1cmVzKCk7XHJcbiAgICAgICAgdGhpcy5yZWVsQ29udGFpbmVyLnkgLT0gdGhpcy5yZWVsQ29udFN0b3BZO1xyXG4gICAgICAgIHRoaXMuc2V0U3RvcFN5bWJvbHMoc3RvcFN5bWJvbHMpO1xyXG5cclxuICAgICAgICBhcHAudGlja2VyLmFkZChhbmltYXRlU3BpbiwgdGhpcyk7XHJcblxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzbW9vdGhTdG9wKCk6IHZvaWQge1xyXG4gICAgICAgICAgICBsZXQgZG93biA9IHRydWUsXHJcbiAgICAgICAgICAgICAgICBzdGFydFkgPSBzZWxmLnJlZWxDb250YWluZXIueSxcclxuICAgICAgICAgICAgICAgIHN0b3BZID0gc2VsZi5yZWVsQ29udGFpbmVyLnkgKyBjb25maWcuUmVlbHNDb25maWcucmVlbFN0b3BEZWx0YTtcclxuXHJcbiAgICAgICAgICAgIGFwcC50aWNrZXIuYWRkKHN0b3BBbmltYXRpb24sIHNlbGYpO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gc3RvcEFuaW1hdGlvbih0aW1lZGVsdGE6IG51bWJlcikge1xyXG4gICAgICAgICAgICAgICAgaWYgKHNlbGYucmVlbENvbnRhaW5lci55IDwgc3RvcFkgJiYgZG93bikge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYucmVlbENvbnRhaW5lci55ICs9IGNvbmZpZy5SZWVsc0NvbmZpZy5yZWVsU3RvcFNwZWVkICogdGltZWRlbHRhO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzZWxmLnJlZWxDb250YWluZXIueSA+PSBzdG9wWSAmJiBkb3duKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZG93biA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLnJlZWxDb250YWluZXIueSA9IE1hdGgubWF4KHNlbGYucmVlbENvbnRhaW5lci55IC0gTWF0aC5mbG9vcihjb25maWcuUmVlbHNDb25maWcucmVlbFN0b3BEZWx0YSp0aW1lZGVsdGEqMC4xKSwgc3RhcnRZKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZi5yZWVsQ29udGFpbmVyLnkgPT0gc3RhcnRZKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcC50aWNrZXIucmVtb3ZlKHN0b3BBbmltYXRpb24sIHNlbGYpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZi5pbmRleCA9PSBjb25maWcuUmVlbHNDb25maWcucmVlbHMubGVuZ3RoLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBldmVudCA9IG5ldyBDdXN0b21FdmVudCgnTGFzdFJlZWxTdG9wcGVkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfWAgIGBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFuaW1hdGVTcGluKHRpbWVkZWx0YTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnJlZWxDb250YWluZXIueSA8IHRoaXMucmVlbENvbnRTdG9wWSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWVsQ29udGFpbmVyLnkgPSBNYXRoLm1pbih0aGlzLnJlZWxDb250YWluZXIueSArIE1hdGguZmxvb3IodGltZWRlbHRhKnRoaXMuU3Bpbm5pbmdTcGVlZCksIHRoaXMucmVlbENvbnRTdG9wWSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBhcHAudGlja2VyLnJlbW92ZShhbmltYXRlU3BpbiwgdGhpcyk7XHJcbiAgICAgICAgICAgICAgICBzbW9vdGhTdG9wKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgIH1cclxuXHJcblxyXG4gICAgcHVibGljIHBsYXlXaW5TaG93KHN5bWJvbDogbnVtYmVyLCBpbmRleDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgLy8gaGlkZSBzeW1ib2wgc3ByaXRlXHJcbiAgICAgICAgdGhpcy50ZW1wUmVlbFt0aGlzLnJlZWxTeW1ib2xzQW1vdW50LWluZGV4LTFdLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAvLyBnZXQgc3ltYm9sIHdpbnNob3cgYW5pbWF0aW9uXHJcbiAgICAgICAgLy8gbGV0IGlTeW1ib2wgPSBTWU1CT0xTW3N5bWJvbF07XHJcbiAgICAgICAgLy8gdGhpcy5XaW5TaG93QW5pbWF0aW9uID0gaVN5bWJvbC53aW5TaG93QW5pbWF0aW9uKCk7XHJcblxyXG4gICAgICAgIC8vIHRoaXMucmVlbENvbnRhaW5lci5hZGRDaGlsZCh0aGlzLldpblNob3dBbmltYXRpb24pO1xyXG4gICAgICAgIC8vIHRoaXMuV2luU2hvd0FuaW1hdGlvbi55ID0gdGhpcy50ZW1wUmVlbFt0aGlzLnJlZWxTeW1ib2xzQW1vdW50LWluZGV4LTFdLnk7XHJcbiAgICAgICAgLy8gdGhpcy5XaW5TaG93QW5pbWF0aW9uLmxvb3AgPSB0cnVlO1xyXG5cclxuICAgICAgICAvLyB0aGlzLldpblNob3dBbmltYXRpb24ucGxheSgpO1xyXG4gICAgICAgIC8vIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vICAgICBsZXQgd2luU2hvd0VuZEV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KCdSZWVsV2luU2hvd0FuaW1FbmQnLCB7J2RldGFpbCc6IHsncmVlbEluZGV4JzogdGhpcy5pbmRleH19KTtcclxuICAgICAgICAvLyAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudCh3aW5TaG93RW5kRXZlbnQpO1xyXG4gICAgICAgIC8vIH0uYmluZCh0aGlzKSwgdGhpcy53aW5TaG93VGltZSlcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RvcFdpblNob3coaW5kZXg6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIC8vIHRoaXMuV2luU2hvd0FuaW1hdGlvbi5zdG9wKCk7XHJcbiAgICAgICAgLy8gdGhpcy5XaW5TaG93QW5pbWF0aW9uLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAvLyBzaG93IHN5bWJvbCBzcHJpdGVcclxuICAgICAgICB0aGlzLnRlbXBSZWVsW3RoaXMucmVlbFN5bWJvbHNBbW91bnQtaW5kZXgtMV0udmlzaWJsZSA9IHRydWVcclxuICAgIH1cclxuXHJcblxyXG59XHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IHRhcmFzZyBvbiA0MC80NC8xMDQxLlxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IFJlZWxTZXQ6IG51bWJlcltdW10gPSBbXHJcbiAgICBbNCwgMSwgNiwgNiwgMSwgMywgNSwgNCwgNiwgMywgNSwgNywgNCwgNSwgMywgNCwgNCwgMywgNiwgNywgNCwgNSwgNiwgNywgNSwgNCwgMSwgNSwgNSwgMywgMSwgNCwgNSwgMywgNCwgMSwgNSwgNCwgNiwgMSwgMywgNiwgNCwgNCwgNCwgNCwgNCwgNywgNSwgM10sXHJcbiAgICBbNiwgNCwgMSwgNSwgNywgMywgNCwgNiwgMSwgNCwgNCwgMywgNywgNCwgNCwgNiwgMSwgNCwgNSwgNiwgNywgNCwgNCwgMSwgNiwgNCwgMywgNCwgNywgMCwgNCwgNiwgNCwgNCwgNCwgNCwgMSwgMywgNCwgNCwgNywgNiwgNSwgNCwgMywgMSwgNCwgNCwgNywgNV0sXHJcbiAgICBbNCwgNCwgNiwgMSwgNiwgMywgNSwgNCwgNywgMywgNSwgMSwgNCwgNSwgMywgNCwgNCwgMywgNywgNiwgNCwgNSwgMywgMSwgNSwgNCwgNCwgNSwgNCwgMywgNywgNSwgNSwgMywgNCwgMSwgNSwgNCwgNywgNiwgMywgMSwgNCwgMCwgNCwgNCwgNCwgNywgNSwgM10sXHJcbiAgICBbMSwgNCwgMSwgNSwgMSwgMywgNCwgNSwgNCwgNCwgNSwgMywgMSwgNCwgNCwgMSwgMSwgNCwgNSwgMSwgMSwgNCwgNSwgNCwgMSwgNCwgMywgNCwgMSwgMCwgNSwgMSwgNCwgNCwgNCwgNCwgMSwgMywgNCwgNCwgNSwgMSwgNSwgNCwgMywgMSwgNCwgNCwgMSwgNV0sXHJcbiAgICBbNCwgNCwgMSwgMSwgMSwgMSwgNCwgNCwgMSwgMywgNSwgMSwgNCwgMSwgMywgNCwgNCwgMSwgMSwgMSwgNCwgMywgNCwgMSwgNSwgNCwgNCwgNSwgNSwgMywgMSwgNCwgNCwgMywgNCwgMSwgMSwgNCwgMSwgMSwgMywgMSwgNCwgNCwgNCwgNCwgNCwgMSwgNSwgM11cclxuXTsiLCIvKipcclxuICogQ3JlYXRlZCBieSB0YXJhc2cgb24gMTAvMTEvMjAxNy5cclxuICovXHJcbmltcG9ydCB7QmFzZUdhbWVTY2VuZX0gZnJvbSBcIi4uL1NjZW5lcy9HYW1lU2NlbmVzXCI7XHJcbi8vIGltcG9ydCB7UmVlbH0gZnJvbSBcIi4vUmVlbFwiO1xyXG5pbXBvcnQge1JlZWxzQ29uZmlnfSBmcm9tIFwiLi9yZWVsc0NvbmZpZ1wiO1xyXG5pbXBvcnQge1JlZWxOfSBmcm9tIFwiLi9OZXdSZWVsXCI7XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIFJlZWxTcGlubmVyIHtcclxuICAgIHByaXZhdGUgcmVzb3VyY2VzOiBhbnk7XHJcbiAgICBwdWJsaWMgc2NlbmU6IEJhc2VHYW1lU2NlbmU7XHJcbiAgICBwdWJsaWMgcmVlbHNBcnJheTogUmVlbE5bXTtcclxuXHJcbiAgICBwdWJsaWMgcmVlbHNDb250YWluZXI6IFBJWEkuQ29udGFpbmVyO1xyXG4gICAgcHJpdmF0ZSByZWVsc0RlbGF5OiBudW1iZXI7XHJcblxyXG4gICAgcHJpdmF0ZSByZWVsU3BpblNvdW5kOiBhbnk7XHJcbiAgICBwcml2YXRlIHJlZWxTdG9wU291bmQ6IGFueTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihzY2VuZTogQmFzZUdhbWVTY2VuZSwgcmVzb3VyY2VzOiBhbnkpIHtcclxuICAgICAgICB0aGlzLnNjZW5lID0gc2NlbmU7XHJcbiAgICAgICAgdGhpcy5yZXNvdXJjZXMgPSByZXNvdXJjZXM7XHJcbiAgICAgICAgdGhpcy5yZWVsc0FycmF5ID0gW107XHJcbiAgICAgICAgLy8gdGhpcy5yZWVsU3BpblNvdW5kID0gbmV3IEF1ZGlvKHJlc291cmNlcy5yZWVsc3Bpbi51cmwpO1xyXG4gICAgICAgIC8vIHRoaXMucmVlbFN0b3BTb3VuZCA9IG5ldyBBdWRpbyhyZXNvdXJjZXMucmVlbHN0b3AudXJsKTtcclxuICAgICAgICB0aGlzLmluaXRpYWxpemVSZWVscygpO1xyXG5cclxuICAgIH1cclxuXHJcblxyXG4gICAgcHJpdmF0ZSBpbml0aWFsaXplUmVlbHMoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5yZWVsc0NvbnRhaW5lciA9IG5ldyBQSVhJLkNvbnRhaW5lcigpO1xyXG4gICAgICAgIHRoaXMucmVlbHNDb250YWluZXIueCA9IFJlZWxzQ29uZmlnLng7XHJcbiAgICAgICAgdGhpcy5yZWVsc0NvbnRhaW5lci55ID0gUmVlbHNDb25maWcueTtcclxuXHJcbiAgICAgICAgdGhpcy5yZWVsc0RlbGF5ID0gUmVlbHNDb25maWcucmVlbHNEZWxheTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaT0wOyBpPFJlZWxzQ29uZmlnLnJlZWxzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCB4OiBudW1iZXIgPSBSZWVsc0NvbmZpZy5yZWVsc1tpXS54LFxyXG4gICAgICAgICAgICAgICAgeTogbnVtYmVyID0gUmVlbHNDb25maWcucmVlbHNbaV0ueTtcclxuICAgICAgICAgICAgbGV0IHJlZWwgPSBuZXcgUmVlbE4oeCwgeSwgaSwgdGhpcy5yZWVsc0NvbnRhaW5lciwgdGhpcy5yZXNvdXJjZXMpO1xyXG4gICAgICAgICAgICB0aGlzLnJlZWxzQXJyYXkucHVzaChyZWVsKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc2NlbmUuYWRkQ2hpbGQodGhpcy5yZWVsc0NvbnRhaW5lcik7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNwaW4ocmVzdWx0czogbnVtYmVyW11bXSk6IHZvaWQge1xyXG5cclxuICAgICAgICBsZXQgcmVlbHNEZWxheTogbnVtYmVyID0gdGhpcy5yZWVsc0RlbGF5O1xyXG4gICAgICAgIC8vIHRoaXMucmVlbFNwaW5Tb3VuZC5jdXJyZW50VGltZSA9IDA7XHJcbiAgICAgICAgLy8gdGhpcy5yZWVsU3BpblNvdW5kLnBsYXkoKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaTx0aGlzLnJlZWxzQXJyYXkubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgICAgICBsZXQgYW5pbWF0aW9uID0gdGhpcy5yZWVsc0FycmF5W2ldLnN0YXJ0U3BpbkFuaW1hdGlvbi5iaW5kKHRoaXMucmVlbHNBcnJheVtpXSk7XHJcbiAgICAgICAgICAgIChmdW5jdGlvbiAoaSkge1xyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChhbmltYXRpb24sIHJlZWxzRGVsYXkqaSwgcmVzdWx0c1tpXSk7XHJcbiAgICAgICAgICAgIH0pKGkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2xhbW91dCgpOiB2b2lkIHtcclxuICAgICAgICBsZXQgcmVlbHNEZWxheTogbnVtYmVyID0gdGhpcy5yZWVsc0RlbGF5O1xyXG4gICAgICAgIC8vIHRoaXMucmVlbFNwaW5Tb3VuZC5wYXVzZSgpO1xyXG4gICAgICAgIGZvciAobGV0IGk9MDsgaTx0aGlzLnJlZWxzQXJyYXkubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5yZWVsc0FycmF5W2ldLnNsYW1PdXQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG59IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgdGFyYXNnIG9uIDEwLzExLzIwMTcuXHJcbiAqL1xyXG5cclxuZXhwb3J0IGNvbnN0IFdpbkJveFdpZHRoOiAgbnVtYmVyID0gMjU0O1xyXG5leHBvcnQgY29uc3QgV2luQm94SGVpZ2h0OiBudW1iZXIgPSAyNDQ7XHJcblxyXG5leHBvcnQgY29uc3Qgc3ltYm9sV2lkdGg6IG51bWJlciA9IDIzNTtcclxuZXhwb3J0IGNvbnN0IHN5bWJvbEhlaWdodDogbnVtYmVyID0gMTU1O1xyXG5cclxuZXhwb3J0IGNvbnN0IExpbmVOdW1iZXJXaWR0aDogIG51bWJlciA9IDgzO1xyXG5leHBvcnQgY29uc3QgTGluZU51bWJlckhlaWdodDogbnVtYmVyID0gNzM7XHJcblxyXG5cclxuZXhwb3J0IGNvbnN0IFN0YXJ0QW5pbURlbHRhOiBudW1iZXIgPSA1MDtcclxuZXhwb3J0IGNvbnN0IFN0YXJ0QW5pbVNwZWVkOiBudW1iZXIgPSAxMDtcclxuXHJcblxyXG5cclxuZXhwb3J0IGNvbnN0IFJlZWxzQ29uZmlnID0ge1xyXG4gICAgeDogNTAsXHJcbiAgICB5OiA2MCxcclxuXHJcbiAgICByZWVsc0RlbGF5OiA1MCwgLy8gbXMgYmV0d2VlbiBzcGluIGFuaW1hdGlvbiBvZiB0aGUgcmVlbHNcclxuXHJcbiAgICByZWVsczogW1xyXG4gICAgICAgIHsneCc6MjAsICd5JzoxMCwgJ3N5bWJvbHNBbW91bnQnOjMsICdTcGlubmluZ1RpbWUnOiAxNTAwfSxcclxuICAgICAgICB7J3gnOjI2MCwgJ3knOjEwLCAnc3ltYm9sc0Ftb3VudCc6MywgJ1NwaW5uaW5nVGltZSc6IDE3MDB9LFxyXG4gICAgICAgIHsneCc6NTAzLCAneSc6MTAsICdzeW1ib2xzQW1vdW50JzozLCAnU3Bpbm5pbmdUaW1lJzogMjIwMH1cclxuICAgIF0sXHJcblxyXG4gICAgc3Bpbm5pbmdTcGVlZDogMjAsXHJcbiAgICBzbGFtT3V0QWNjZWxlcmF0aW9uOiAyLjI1LFxyXG4gICAgcmVlbFN0b3BEZWx0YTogMTUsXHJcbiAgICByZWVsU3RvcFNwZWVkOiA1XHJcbn07XHJcblxyXG5cclxuZXhwb3J0IGNvbnN0IHJlc3BvbnNlID0ge1xyXG4gICAgXCJxdWFsaWZpZXJcIjpcImNvbS5wdC5jYXNpbm8ucGxhdGZvcm1cIixcclxuICAgIFwiY29udGV4dElkXCI6XCJyOXRudmFham9qeWQzbmk4ODVtaVwiLFxyXG4gICAgXCJjb3JyZWxhdGlvbklkXCI6XCI5ZTB4N3JsN25zaTJ6MXkzMHVkaVwiLFxyXG4gICAgXCJkYXRhXCI6e1xyXG4gICAgICAgIFwiX3R5cGVcIjpcImNvbS5wdC5jYXNpbm8ucGxhdGZvcm0uZ2FtZS5HYW1lQ29tbWFuZFwiLFxyXG4gICAgICAgIFwid2luZG93SWRcIjpcIlwiLFxyXG4gICAgICAgIFwid2luQW1vdW50XCI6MCxcclxuICAgICAgICBcImdhbWVEYXRhXCI6e1xyXG4gICAgICAgICAgICBcIl90eXBlXCI6XCJyeW90YTpHYW1lUmVzcG9uc2VcIixcclxuICAgICAgICAgICAgXCJzdGFrZVwiOjUwMCxcclxuICAgICAgICAgICAgXCJ0b3RhbFdpbkFtb3VudFwiOjAsXHJcbiAgICAgICAgICAgIFwicGxheUluZGV4XCI6MSxcclxuICAgICAgICAgICAgXCJuZXh0Um91bmRcIjpcIjBcIixcclxuICAgICAgICAgICAgXCJ3aW5MaW5lQ291bnRcIjo1LFxyXG4gICAgICAgICAgICBcImlzV2luQ2FwcGVkXCI6ZmFsc2UsXHJcbiAgICAgICAgICAgIFwicGxheVN0YWNrXCI6W1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicm91bmRcIjpcIjBcIixcclxuICAgICAgICAgICAgICAgICAgICBcInJlbWFpbmluZ1BsYXlDb3VudFwiOjAsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJuZXdQbGF5Q291bnRcIjowLFxyXG4gICAgICAgICAgICAgICAgICAgIFwibXVsdGlwbGllclwiOjEsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJmZWF0dXJlV2luQW1vdW50XCI6NDAwLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiZ2FtZVdpbkFtb3VudFwiOjAsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJpc0xhc3RQbGF5TW9kZVwiOnRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJpc05leHRQbGF5TW9kZVwiOmZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiaXNXaW5DYXBwZWRcIjpmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBcImxhc3RQbGF5SW5Nb2RlRGF0YVwiOntcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJwbGF5V2luQW1vdW50XCI6NDAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInNsb3RzRGF0YVwiOntcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicHJldmlvdXNUcmFuc2Zvcm1zXCI6W1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFjdGlvbnNcIjpbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInRyYW5zZm9ybXNcIjpbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZWZcIjpcInNwaW5cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN5bWJvbFVwZGF0ZXNcIjpbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3ltYm9sXCI6MSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVlbEluZGV4XCI6MCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicG9zaXRpb25PblJlZWxcIjowXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3ltYm9sXCI6MyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVlbEluZGV4XCI6MCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicG9zaXRpb25PblJlZWxcIjoxXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3ltYm9sXCI6MixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVlbEluZGV4XCI6MCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicG9zaXRpb25PblJlZWxcIjoyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3ltYm9sXCI6MyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVlbEluZGV4XCI6MSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicG9zaXRpb25PblJlZWxcIjowXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3ltYm9sXCI6MSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVlbEluZGV4XCI6MSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicG9zaXRpb25PblJlZWxcIjoxXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3ltYm9sXCI6MixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVlbEluZGV4XCI6MSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicG9zaXRpb25PblJlZWxcIjoyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3ltYm9sXCI6MyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVlbEluZGV4XCI6MixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicG9zaXRpb25PblJlZWxcIjowXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3ltYm9sXCI6NSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVlbEluZGV4XCI6MixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicG9zaXRpb25PblJlZWxcIjoxXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3ltYm9sXCI6MSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVlbEluZGV4XCI6MixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicG9zaXRpb25PblJlZWxcIjoyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3ltYm9sXCI6MyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVlbEluZGV4XCI6MyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicG9zaXRpb25PblJlZWxcIjowXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3ltYm9sXCI6NCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVlbEluZGV4XCI6MyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicG9zaXRpb25PblJlZWxcIjoxXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3ltYm9sXCI6MCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVlbEluZGV4XCI6MyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicG9zaXRpb25PblJlZWxcIjoyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3ltYm9sXCI6NSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVlbEluZGV4XCI6NCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicG9zaXRpb25PblJlZWxcIjowXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3ltYm9sXCI6MCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVlbEluZGV4XCI6NCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicG9zaXRpb25PblJlZWxcIjoxXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3ltYm9sXCI6MyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVlbEluZGV4XCI6NCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicG9zaXRpb25PblJlZWxcIjoyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGF5b3V0c1wiOltcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0cmFuc2Zvcm1zXCI6W1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwYXlvdXRzXCI6W1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGF5b3V0RGF0YVwiOntcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwYXlvdXRXaW5BbW91bnRcIjozMDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGF5b3V0RnJlZVBsYXlSZXN1bHRzRGF0YVwiOltcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY29udGV4dFwiOntcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ3aW5MaW5lSW5kZXhcIjo0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIndpbm5pbmdTeW1ib2xzXCI6W1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3ltYm9sXCI6MSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlZWxJbmRleFwiOjAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwb3NpdGlvbk9uUmVlbFwiOjBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzeW1ib2xcIjoxLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVlbEluZGV4XCI6MSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBvc2l0aW9uT25SZWVsXCI6MVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN5bWJvbFwiOjEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZWVsSW5kZXhcIjoyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicG9zaXRpb25PblJlZWxcIjoyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN5bWJvbFwiOjEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3ltYm9sUGF5b3V0VHlwZVwiOlwiV2luTGluZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm11bHRpcGxpZXJcIjoxXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBheW91dERhdGFcIjp7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGF5b3V0V2luQW1vdW50XCI6MTAwMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwYXlvdXRGcmVlUGxheVJlc3VsdHNEYXRhXCI6W1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjb250ZXh0XCI6e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIndpbkxpbmVJbmRleFwiOjYsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwid2lubmluZ1N5bWJvbHNcIjpbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzeW1ib2xcIjo2LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVlbEluZGV4XCI6MCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBvc2l0aW9uT25SZWVsXCI6MVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN5bWJvbFwiOjYsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZWVsSW5kZXhcIjoxLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicG9zaXRpb25PblJlZWxcIjowXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3ltYm9sXCI6NixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlZWxJbmRleFwiOjIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwb3NpdGlvbk9uUmVlbFwiOjBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzeW1ib2xcIjo2LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVlbEluZGV4XCI6MyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBvc2l0aW9uT25SZWVsXCI6MFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN5bWJvbFwiOjAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZWVsSW5kZXhcIjo0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicG9zaXRpb25PblJlZWxcIjoxXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN5bWJvbFwiOjYsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3ltYm9sUGF5b3V0VHlwZVwiOlwiV2luTGluZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm11bHRpcGxpZXJcIjoxXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBheW91dERhdGFcIjp7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGF5b3V0V2luQW1vdW50XCI6MTAwMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwYXlvdXRGcmVlUGxheVJlc3VsdHNEYXRhXCI6W1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjb250ZXh0XCI6e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIndpbkxpbmVJbmRleFwiOjE5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIndpbm5pbmdTeW1ib2xzXCI6W1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3ltYm9sXCI6MixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlZWxJbmRleFwiOjAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwb3NpdGlvbk9uUmVlbFwiOjJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzeW1ib2xcIjoyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVlbEluZGV4XCI6MSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBvc2l0aW9uT25SZWVsXCI6MlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN5bWJvbFwiOjIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZWVsSW5kZXhcIjoyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicG9zaXRpb25PblJlZWxcIjowXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3ltYm9sXCI6MCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlZWxJbmRleFwiOjMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwb3NpdGlvbk9uUmVlbFwiOjJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3ltYm9sXCI6MixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzeW1ib2xQYXlvdXRUeXBlXCI6XCJXaW5MaW5lXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibXVsdGlwbGllclwiOjFcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIFwibW9kZVR5cGVcIjpcIlNMT1RTXCJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJzdGFrZUFtb3VudFwiOjUwMFxyXG4gICAgfVxyXG59OyIsIi8qKlxuICogQ3JlYXRlZCBieSB0YXJhc2cgb24gOS8yNS8yMDE3LlxuICovXG5pbXBvcnQge0J1dHRvbiwgRGVub21pbmF0aW9uUGFuZWxCdXR0b259IGZyb20gXCIuLi9MYXlvdXQvQnV0dG9uc1wiO1xuaW1wb3J0IHtXaW5MaW5lQnV0dG9ufSBmcm9tIFwiLi4vTGF5b3V0L1dpbkxpbmVCdXR0b25cIjtcbmltcG9ydCB7QnV0dG9uRXZlbnRzfSBmcm9tIFwiLi4vRXZlbnRzL0J1dHRvbkV2ZW50c1wiO1xuaW1wb3J0IHtOdW1lcmljRmllbGQsIEJhbGFuY2VGaWVsZFdpdGhIaWRlQ3JlZGl0c0FuaW1hdGlvbn0gZnJvbSAgXCIuLi9MYXlvdXQvTnVtZXJpY0ZpZWxkXCI7XG5pbXBvcnQge0ZvbnRTdHlsZXN9IGZyb20gXCIuLi9VdGlscy9mb250U3R5bGVzXCI7XG5pbXBvcnQgKiBhcyB1dGlscyBmcm9tIFwiLi4vVXRpbHMvaGVscGVyRnVuY3NcIjtcbmltcG9ydCB7VGV4dENvbnRhaW5lcn0gZnJvbSBcIi4uL0xheW91dC9UZXh0Q29udGFpbmVyXCI7XG5pbXBvcnQge0NyZWF0ZUFuaW1hdGlvbn0gZnJvbSBcIi4uL1V0aWxzL2hlbHBlckZ1bmNzXCI7XG5pbXBvcnQgc2V0ID0gUmVmbGVjdC5zZXQ7XG5pbXBvcnQge1JlZWxTcGlubmVyfSBmcm9tIFwiLi4vUmVlbFNwaW5uZXIvUmVlbFNwaW5uZXJcIjtcbmltcG9ydCB7V2luTGluZX0gZnJvbSBcIi4uL0xheW91dC9XaW5MaW5lQ2xhc3NcIjtcbmltcG9ydCB7U291bmRzTWFuYWdlcn0gZnJvbSBcIi4uL21haW5cIjtcblxuXG5cblxuZXhwb3J0IGNsYXNzIEJhc2VHYW1lU2NlbmUgZXh0ZW5kcyBQSVhJLkNvbnRhaW5lciB7XG4gICAgcHVibGljIFJFRUxTOiBSZWVsU3Bpbm5lcjtcbiAgICBwdWJsaWMgc3RhcnRCdXR0b246IEJ1dHRvbjtcbiAgICBwdWJsaWMgc3RvcEJ1dHRvbjogQnV0dG9uO1xuICAgIHB1YmxpYyBtYXhCZXRCdXR0b246IEJ1dHRvbjtcbiAgICBwdWJsaWMgc3Rha2VCdXR0b246IERlbm9taW5hdGlvblBhbmVsQnV0dG9uO1xuICAgIHB1YmxpYyBiYWxhbmNlRmllbGQ6IE51bWVyaWNGaWVsZDtcbiAgICBwdWJsaWMgdG90YWxXaW5GaWVsZDogTnVtZXJpY0ZpZWxkO1xuXG4gICAgcHJpdmF0ZSBzY2VuZUJhY2tncm91bmQ6IFBJWEkuU3ByaXRlO1xuICAgIHByaXZhdGUgcmVzb3VyY2VzOiBhbnk7XG5cblxuICAgIGNvbnN0cnVjdG9yKHJlc291cmNlczphbnkpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5yZXNvdXJjZXMgPSByZXNvdXJjZXM7XG4gICAgICAgIC8vIGJhY2tnb3J1bmRcbiAgICAgICAgdGhpcy5zY2VuZUJhY2tncm91bmQgPSBuZXcgUElYSS5TcHJpdGUocmVzb3VyY2VzWydCRyddKTtcbiAgICAgICAgdGhpcy5hZGRDaGlsZCh0aGlzLnNjZW5lQmFja2dyb3VuZCk7XG5cbiAgICAgICAgLy9SZWVscztcbiAgICAgICAgdGhpcy5SRUVMUyA9IG5ldyBSZWVsU3Bpbm5lcih0aGlzLCByZXNvdXJjZXMpO1xuXG4gICAgICAgIC8vIENvbnRyb2wgQnV0dG9uc1xuICAgICAgICAvLyBsZXQgYnV0dG9uU291bmQgPSBTb3VuZHNNYW5hZ2VyLmFsbFNvdW5kcy5idXR0b25QcmVzcztcblxuICAgICAgICB0aGlzLnN0YXJ0QnV0dG9uID0gbmV3IEJ1dHRvbih0aGlzLCA4NzMsIDI2NywgJ1N0YXJ0QnV0dG9uJywgcmVzb3VyY2VzLCB0aGlzLm9uU3RhcnRCdXR0b24pO1xuICAgICAgICAvLyB0aGlzLnN0b3BCdXR0b24gPSBuZXcgQnV0dG9uKHRoaXMsIDE2MzUsIDk2MCwgcmVzb3VyY2VzLnN0b3AudXJsLCByZXNvdXJjZXMuc3RvcF9kaXMudXJsLCByZXNvdXJjZXMuc3RvcF9wcmVzc2VkLnVybCwgYnV0dG9uU291bmQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoQnV0dG9uRXZlbnRzLlN0b3BCdXR0b25QcmVzc2VkKTtcbiAgICAgICAgLy8gfSk7XG5cbiAgICAgICAgLy8gdGhpcy5tYXhCZXRCdXR0b24gPSBuZXcgQnV0dG9uKHRoaXMsIDE0MjAsIDk2MCwgcmVzb3VyY2VzLm1heGJldC51cmwsIHJlc291cmNlcy5tYXhiZXRfZGlzLnVybCwgcmVzb3VyY2VzLm1heGJldF9wcmVzc2VkLnVybCwgYnV0dG9uU291bmQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChCdXR0b25FdmVudHMuTWF4QmV0QnV0dG9uUHJlc3NlZCk7XG4gICAgICAgIC8vIH0pO1xuXG4gICAgICAgIC8vIHRoaXMuYmFsYW5jZUZpZWxkID0gbmV3IEJhbGFuY2VGaWVsZFdpdGhIaWRlQ3JlZGl0c0FuaW1hdGlvbih0aGlzLCBGb250U3R5bGVzLmNvdW50ZXJGb250LCAyMDAsIDg2NSwgcmVzb3VyY2VzLmJhbGFuY2VfZmllbGQudGV4dHVyZSwgYnV0dG9uU291bmQsIHJlc291cmNlcy5zaG93X2NyX2ltZy50ZXh0dXJlLCByZXNvdXJjZXMuaGlkZV9jcl9pbWcudGV4dHVyZSk7XG4gICAgICAgIC8vIHRoaXMudG90YWxXaW5GaWVsZCA9IG5ldyBOdW1lcmljRmllbGQodGhpcywgRm9udFN0eWxlcy5jb3VudGVyRm9udCwgNjIwLCA4NjUsIHJlc291cmNlcy50b3RhbF93aW5fZmllbGQudGV4dHVyZSwgYnV0dG9uU291bmQpO1xuXG4gICAgICAgIC8vIHRoaXMuc3Rha2VCdXR0b24gPSBuZXcgRGVub21pbmF0aW9uUGFuZWxCdXR0b24oXG4gICAgICAgIC8vICAgICB0aGlzLFxuICAgICAgICAvLyAgICAgODkwLFxuICAgICAgICAvLyAgICAgMTAwNSxcbiAgICAgICAgLy8gICAgIEZvbnRTdHlsZXMuY291bnRlckZvbnQsXG4gICAgICAgIC8vICAgICBGb250U3R5bGVzLnN0YWtlRm9udCxcbiAgICAgICAgLy8gICAgIHJlc291cmNlcy5kZW5vbUJvdHRvbS50ZXh0dXJlLFxuICAgICAgICAvLyAgICAgcmVzb3VyY2VzLmRlbm9tVG9wLnRleHR1cmUsXG4gICAgICAgIC8vICAgICByZXNvdXJjZXMuZGVub21NaWRkbGUudGV4dHVyZSxcbiAgICAgICAgLy8gICAgIHJlc291cmNlcy5kZW5vbVNlbC50ZXh0dXJlLFxuICAgICAgICAvLyAgICAgcmVzb3VyY2VzLmJldC50ZXh0dXJlLFxuICAgICAgICAvLyAgICAgcmVzb3VyY2VzLmJldF9kaXMudGV4dHVyZSxcbiAgICAgICAgLy8gICAgIHJlc291cmNlcy5iZXRfcHJlc3NlZC50ZXh0dXJlLFxuICAgICAgICAvLyAgICAgYnV0dG9uU291bmQsXG4gICAgICAgIC8vICAgICBmdW5jdGlvbiAoKVxuICAgICAgICAvLyAgICAge1xuICAgICAgICAvLyAgICAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoQnV0dG9uRXZlbnRzLkJldEJ1dHRvblByZXNzZWQpO1xuICAgICAgICAvLyAgICAgfVxuICAgICAgICAvLyApO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5pbnRlcmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIHRoaXMub24oJ3BvaW50ZXJkb3duJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChCdXR0b25FdmVudHMuQ2xpY2tlZE9uQmFzZUdhbWVTY2VuZSk7XG4gICAgICAgICAgICBsZXQgc2tpcFdJbnNob3cgPSBuZXcgQ3VzdG9tRXZlbnQoJ3NraXBXaW5TaG93Jyk7XG4gICAgICAgICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KHNraXBXSW5zaG93KTtcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uU3RhcnRCdXR0b24gKCkge1xuICAgICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KEJ1dHRvbkV2ZW50cy5TdGFydEJ1dHRvblByZXNzZWQpO1xuICAgIH1cbn1cbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IHRhcmFzZyBvbiA5LzI1LzIwMTcuXHJcbiAqL1xyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBTY2VuZU1hbmFnZXIge1xyXG4gICAgcHJpdmF0ZSBjb250YWluZXJzOiBhbnkgPSB7fTtcclxuICAgIHB1YmxpYyBjdXJyZW50U2NlbmU6IGFueTsgLy9QSVhJLkNvbnRhaW5lclxyXG4gICAgcHVibGljIGN1cnJlbnRTY2VuZUlkOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIGFwcDogUElYSS5BcHBsaWNhdGlvbjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihhcHA6IFBJWEkuQXBwbGljYXRpb24pIHtcclxuICAgICAgICB0aGlzLmFwcCA9IGFwcDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgQWRkR2FtZVNjZW5lKGlkOnN0cmluZywgZ2FtZVNjZW5lOmFueSkge1xyXG4gICAgICAgIHRoaXMuY29udGFpbmVyc1tpZF0gPSBnYW1lU2NlbmU7XHJcbiAgICAgICAgZ2FtZVNjZW5lLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmFwcC5zdGFnZS5hZGRDaGlsZChnYW1lU2NlbmUpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnb1RvR2FtZVNjZW5lKGlkKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFNjZW5lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNjZW5lLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jb250YWluZXJzW2lkXS52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmN1cnJlbnRTY2VuZSA9IHRoaXMuY29udGFpbmVyc1tpZF07XHJcbiAgICAgICAgdGhpcy5jdXJyZW50U2NlbmVJZCA9IGlkO1xyXG4gICAgfVxyXG5cclxuXHJcbn1cclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgdGFyYXNnIG9uIDkvMjkvMjAxNy5cclxuICovXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbmV4dEl0ZW0oYXJyLCBpKSB7XHJcbiAgICBpID0gaSArIDE7XHJcbiAgICBpID0gaSAlIGFyci5sZW5ndGg7XHJcbiAgICByZXR1cm4gYXJyW2ldO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcHJldkl0ZW0oYXJyLCBpKSB7XHJcbiAgICBpZiAoaSA9PT0gMCkge1xyXG4gICAgICAgIGkgPSBhcnIubGVuZ3RoO1xyXG4gICAgfVxyXG4gICAgaSA9IGkgLSAxO1xyXG4gICAgcmV0dXJuIGFycltpXTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdFN0YWtlQW1vdW50KHN0YWtlOiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgaWYgKHN0YWtlIDwgMTAwKXtcclxuICAgICAgICByZXR1cm4gJzAuJytzdGFrZSsncCc7XHJcbiAgICB9IGVsc2UgaWYoIHN0YWtlID49IDEwMCl7XHJcbiAgICAgICAgbGV0IHggPSBzdGFrZS8xMDA7XHJcbiAgICAgICAgcmV0dXJuICckJytwYXJzZUZsb2F0KHgudG9TdHJpbmcoKSkudG9GaXhlZCgyKTtcclxuICAgIH1cclxufVxyXG5cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBDcmVhdGVBbmltYXRpb24oYmFzZVRleHR1cmUsIG9iaikge1xyXG4gICAgbGV0IGxlbiA9IG9iai5sZW5ndGgsXHJcbiAgICAgICAgdGV4dHVyZV9hcnJheSA9IFtdO1xyXG5cclxuICAgIGZvciAobGV0IGk9MDsgaTxsZW47aSsrKVxyXG4gICAge1xyXG4gICAgICAgIGxldCBmcmFtZSA9IG9ialtpXSxcclxuICAgICAgICAgICAgcmVjdCA9IG5ldyBQSVhJLlJlY3RhbmdsZShmcmFtZS54LCBmcmFtZS55LCBmcmFtZS53aWR0aCwgZnJhbWUuaGVpZ2h0KSxcclxuICAgICAgICAgICAgdGV4dHVyZSA9IG5ldyBQSVhJLlRleHR1cmUoYmFzZVRleHR1cmUsIHJlY3QpO1xyXG4gICAgICAgIHRleHR1cmVfYXJyYXkucHVzaCh7dGV4dHVyZTp0ZXh0dXJlLCB0aW1lOjY2fSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV3IFBJWEkuZXh0cmFzLkFuaW1hdGVkU3ByaXRlKHRleHR1cmVfYXJyYXkpO1xyXG59IiwiaW1wb3J0ICogYXMgU2NlbmVzIGZyb20gXCIuL1NjZW5lcy9HYW1lU2NlbmVzXCI7XHJcbmltcG9ydCB7U2NlbmVNYW5hZ2VyfSBmcm9tIFwiLi9TY2VuZXMvU2NlbmVzTWFuYWdlclwiO1xyXG5pbXBvcnQge0Jhc2VHYW1lQ29udHJvbGxlcn0gZnJvbSBcIi4vQ29udHJvbGxlcnMvQmFzZUdhbWVcIjtcclxuaW1wb3J0IHtTb3VuZHNNYW5hZ2VyQ2xhc3N9IGZyb20gXCIuL1NvdW5kcy9zb3VuZHNcIjtcclxuXHJcblxyXG5leHBvcnQgY29uc3QgYXBwOiBQSVhJLkFwcGxpY2F0aW9uID0gbmV3IFBJWEkuQXBwbGljYXRpb24oOTYwLCA1MzYpO1xyXG5leHBvcnQgbGV0IFNDRU5FX01BTkFHRVIgPSBuZXcgU2NlbmVNYW5hZ2VyKGFwcCk7XHJcbmV4cG9ydCBsZXQgU291bmRzTWFuYWdlcjtcclxuZXhwb3J0IGxldCBiYXNlR2FtZVNjZW5lO1xyXG5leHBvcnQgbGV0IGJhc2VHYW1lQ29udHJvbGxlcjtcclxuXHJcbmNvbnN0IGxvYWRlciA9IFBJWEkubG9hZGVyOyAvLyBQaXhpSlMgZXhwb3NlcyBhIHByZW1hZGUgaW5zdGFuY2UgZm9yIHlvdSB0byB1c2UuXHJcblxyXG5sb2FkZXJcclxuICAgIC5hZGQoJ3NoZWV0JywgJy4uL01lZGlhL3Nwcml0ZXMuanNvbicpXHJcblxyXG5sb2FkZXIubG9hZCgobG9hZGVyLCByZXNvdXJjZXMpID0+IHtcclxuICAgIC8vIHJlc291cmNlcyBpcyBhbiBvYmplY3Qgd2hlcmUgdGhlIGtleSBpcyB0aGUgbmFtZSBvZiB0aGUgcmVzb3VyY2UgbG9hZGVkIGFuZCB0aGUgdmFsdWUgaXMgdGhlIHJlc291cmNlIG9iamVjdC5cclxuICAgIC8vIFRoZXkgaGF2ZSBhIGNvdXBsZSBkZWZhdWx0IHByb3BlcnRpZXM6XHJcbiAgICAvLyAtIGB1cmxgOiBUaGUgVVJMIHRoYXQgdGhlIHJlc291cmNlIHdhcyBsb2FkZWQgZnJvbVxyXG4gICAgLy8gLSBgZXJyb3JgOiBUaGUgZXJyb3IgdGhhdCBoYXBwZW5lZCB3aGVuIHRyeWluZyB0byBsb2FkIChpZiBhbnkpXHJcbiAgICAvLyAtIGBkYXRhYDogVGhlIHJhdyBkYXRhIHRoYXQgd2FzIGxvYWRlZFxyXG4gICAgLy8gYWxzbyBtYXkgY29udGFpbiBvdGhlciBwcm9wZXJ0aWVzIGJhc2VkIG9uIHRoZSBtaWRkbGV3YXJlIHRoYXQgcnVucy5cclxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYXBwLnZpZXcpO1xyXG5cclxuICAgIGxldCB0ZXh0dXJlcyA9IGxvYWRlci5yZXNvdXJjZXMuc2hlZXQudGV4dHVyZXM7XHJcblxyXG4gICAgLy8gU291bmRzTWFuYWdlciA9IG5ldyBTb3VuZHNNYW5hZ2VyQ2xhc3MocmVzb3VyY2VzKTtcclxuXHJcbiAgICBiYXNlR2FtZVNjZW5lID0gbmV3IFNjZW5lcy5CYXNlR2FtZVNjZW5lKHRleHR1cmVzKTtcclxuICAgIFNDRU5FX01BTkFHRVIuQWRkR2FtZVNjZW5lKCdiYXNlR2FtZScsIGJhc2VHYW1lU2NlbmUpO1xyXG4gICAgYmFzZUdhbWVDb250cm9sbGVyID0gbmV3IEJhc2VHYW1lQ29udHJvbGxlcihiYXNlR2FtZVNjZW5lKTtcclxuXHJcbiAgICBTQ0VORV9NQU5BR0VSLmdvVG9HYW1lU2NlbmUoJ2Jhc2VHYW1lJyk7XHJcblxyXG4gICAgaGlkZVNwbGFzaCgpO1xyXG5cclxuICAgIC8vIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgLy8gICAgIC8vIGFwcC5zdGFnZS5zY2FsZS5zZXQod2luZG93LmlubmVyV2lkdGgvOTYwLCB3aW5kb3cuaW5uZXJIZWlnaHQvNTM2KTtcclxuICAgIC8vICAgICBoaWRlU3BsYXNoKCk7XHJcbiAgICAvLyB9LCAxMDAwKTsgXHJcblxyXG5cclxufSk7XHJcblxyXG5cclxuZnVuY3Rpb24gaGlkZVNwbGFzaCgpe1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NwaW4nKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgbGV0IHNwbGFzaCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcGxhc2gnKTtcclxuICAgIHNwbGFzaC5jbGFzc05hbWUgPSdzcGxhc2hGYWRlT3V0JztcclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHNwbGFzaC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgfSwgMTAwMCk7XHJcbn1cclxuIl19
