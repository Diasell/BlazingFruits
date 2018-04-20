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
        this.scene.balanceField.addValue(this.balance);
        // this.stakes = scene.stakeButton.stakes;
        this.buttonStates = {
            'idle': [
                { 'button': this.scene.startButton, 'state': 'enable' },
                { 'button': this.scene.stopButton, 'state': 'hide' },
            ],
            'round': [
                { 'button': this.scene.startButton, 'state': 'hide' },
                { 'button': this.scene.stopButton, 'state': 'enable' },
            ],
            'collect': [
                { 'button': this.scene.startButton, 'state': 'hide' },
                { 'button': this.scene.stopButton, 'state': 'hide' },
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
        this.scene.totalWinField.counter.reset();
        this.balance -= this.currentStake;
        this.scene.balanceField.substractValue(this.currentStake);
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
            this.scene.totalWinField.addValue(this.totalWin);
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

},{"../ReelSpinner/reelsConfig":10,"../Utils/helperFuncs":15,"../main":16}],2:[function(require,module,exports){
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

},{"../Utils/helperFuncs":15,"../main":16,"./buttonNames":5}],4:[function(require,module,exports){
/**
 * Created by tarasg on 9/28/2017.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const counter_1 = require("../Utils/counter");
const main_1 = require("../main");
const buttonNames_1 = require("./buttonNames");
class NumericField {
    constructor(scene, name, x, y, resources, textStyle, x_delta = 0) {
        // enabled_img, dis_img, pressed_img:  PIXI.Textutre or string url to the image
        this.x = x;
        this.y = y;
        this.textStyle = textStyle;
        this.scene = scene;
        this.fieldBackGround = resources[buttonNames_1.buttonResources[name].background];
        this.fieldContainer = new PIXI.Container();
        this.fieldContainer.x = this.x;
        this.fieldContainer.y = this.y;
        this.sprite = new PIXI.Sprite(this.fieldBackGround);
        this.sprite.anchor.set(0.5, 0.5);
        this.sprite.x = this.sprite.width / 2;
        this.sprite.y = this.sprite.height / 2;
        this.fieldContainer.addChild(this.sprite);
        // add text
        this.text = new PIXI.Text('', this.textStyle);
        this.fieldContainer.addChild(this.text);
        this.text.anchor.set(0.5, 0.5);
        this.text.x = this.sprite.x + x_delta;
        this.text.y = this.sprite.y;
        this.scene.addChild(this.fieldContainer);
        // counter
        this.counter = new counter_1.CountUp(this.text, 0.0, 0.0, 2, 0.5, {});
        this.sprite.model = this;
    }
    addValue(value) {
        this.counter.update(this.counter.endVal + value / 100);
    }
    substractValue(value) {
        this.counter.update(this.counter.endVal - value / 100);
    }
    countTill(value) {
        this.counter.update(value / 100);
    }
    hide() {
        this.fieldContainer.visible = false;
    }
    show() {
        this.fieldContainer.visible = true;
    }
}
exports.NumericField = NumericField;
class BalanceFieldWithHideCreditsAnimation extends NumericField {
    constructor(scene, name, x, y, resources, textStyle) {
        super(scene, name, x, y, resources, textStyle);
        this.show_credits_texture = resources[buttonNames_1.buttonResources[name].show_credits];
        this.hide_credits_texture = resources[buttonNames_1.buttonResources[name].hide_credits];
        // add press to hide img text
        this.hide_credits_sprite = new PIXI.Sprite(this.hide_credits_texture);
        this.hide_credits_sprite.anchor.set(0.5, 0.5);
        this.hide_credits_sprite.x = this.sprite.width / 2;
        this.hide_credits_sprite.y = this.sprite.height / 2 + 25;
        this.fieldContainer.addChild(this.hide_credits_sprite);
        // add show credit image
        this.show_credits_sprite = new PIXI.Sprite(this.show_credits_texture);
        this.show_credits_sprite.anchor.set(0.5, 0.5);
        this.show_credits_sprite.x = this.show_credits_sprite.width / 2;
        this.show_credits_sprite.y = this.show_credits_sprite.height / 2 - this.show_credits_sprite.height;
        this.show_credits_sprite.interactive = true;
        this.show_credits_sprite.buttonMode = true;
        this.show_credits_sprite.on('pointerdown', function () {
            this.showCredits();
        }.bind(this));
        this.fieldContainer.addChild(this.show_credits_sprite);
        //    MASK:
        this.containerMask = new PIXI.Graphics();
        this.initializeMask();
        this.sprite.interactive = true;
        this.sprite.buttonMode = true;
        this.sprite.on('pointerdown', function () {
            this.hideCredits();
        }.bind(this));
    }
    initializeMask() {
        this.scene.addChild(this.containerMask);
        this.fieldContainer.mask = this.containerMask;
        this.containerMask.lineStyle(0);
        this.containerMask.x = this.fieldContainer.x;
        this.containerMask.y = this.fieldContainer.y;
        this.containerMask.beginFill(0x8bc5ff);
        let mask_x = this.show_credits_sprite.x - (this.show_credits_sprite.width / 2), mask_y = this.show_credits_sprite.y + (this.show_credits_sprite.height / 2);
        this.containerMask.drawRect(mask_x, mask_y, this.fieldContainer.width, this.show_credits_sprite.height);
        this.containerMask.endFill();
    }
    hideCredits() {
        main_1.app.ticker.add(hideCreditsAnimation, this);
        function hideCreditsAnimation(timedelta) {
            this.show_credits_sprite.interactive = false;
            this.sprite.interactive = false;
            if (this.show_credits_sprite.y < this.sprite.y) {
                this.show_credits_sprite.y = Math.min((this.show_credits_sprite.y + 5 * timedelta), this.sprite.y);
            }
            else {
                main_1.app.ticker.remove(hideCreditsAnimation, this);
                this.show_credits_sprite.interactive = true;
                this.sprite.interactive = true;
            }
        }
    }
    showCredits() {
        main_1.app.ticker.add(showCreditsAnimation, this);
        function showCreditsAnimation(timedelta) {
            this.show_credits_sprite.interactive = false;
            this.sprite.interactive = false;
            if (this.show_credits_sprite.y + this.show_credits_sprite.height > this.sprite.y) {
                this.show_credits_sprite.y -= 5 * timedelta;
            }
            else {
                this.show_credits_sprite.y = this.sprite.y - this.show_credits_sprite.height;
                main_1.app.ticker.remove(showCreditsAnimation, this);
                this.isShown = true;
                this.show_credits_sprite.interactive = true;
                this.sprite.interactive = true;
            }
        }
    }
}
exports.BalanceFieldWithHideCreditsAnimation = BalanceFieldWithHideCreditsAnimation;

},{"../Utils/counter":13,"../main":16,"./buttonNames":5}],5:[function(require,module,exports){
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
    },
    'BalanceField': {
        'background': 'balance',
        'show_credits': 'show_credit',
        'hide_credits': 'hide_credits'
    },
    'TotalWin': {
        'background': 'tw'
    }
};

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{"../ReelSpinner/reelsConfig":10,"../main":16,"./MainRoundSymbols":6,"./ReelSets":8}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

},{"./NewReel":7,"./reelsConfig":10}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by tarasg on 9/25/2017.
 */
const Buttons_1 = require("../Layout/Buttons");
const ButtonEvents_1 = require("../Events/ButtonEvents");
const NumericField_1 = require("../Layout/NumericField");
const fontStyles_1 = require("../Utils/fontStyles");
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
        this.stopButton = new Buttons_1.Button(this, 873, 267, 'StopButton', resources, this.onStopButton);
        // this.maxBetButton = new Button(this, 1420, 960, resources.maxbet.url, resources.maxbet_dis.url, resources.maxbet_pressed.url, buttonSound, function() {
        //     document.dispatchEvent(ButtonEvents.MaxBetButtonPressed);
        // });
        this.balanceField = new NumericField_1.BalanceFieldWithHideCreditsAnimation(this, 'BalanceField', 765, 455, resources, fontStyles_1.FontStyles.counterFont);
        this.balanceField.fieldContainer.scale.set(0.5, 1); // this added cause assets taken from anoter game and dont fit the size
        this.totalWinField = new NumericField_1.NumericField(this, 'TotalWin', 765, 0, resources, fontStyles_1.FontStyles.counterFont);
        this.totalWinField.fieldContainer.scale.set(0.5, 1);
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
    onStopButton() {
        document.dispatchEvent(ButtonEvents_1.ButtonEvents.StopButtonPressed);
    }
}
exports.BaseGameScene = BaseGameScene;

},{"../Events/ButtonEvents":2,"../Layout/Buttons":3,"../Layout/NumericField":4,"../ReelSpinner/ReelSpinner":9,"../Utils/fontStyles":14}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
/**
 * Created by tarasg on 9/28/2017.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// target = id of html element or var of previously selected html element where counting occurs
// startVal = the value you want to begin at
// endVal = the value you want to arrive at
// decimals = number of decimal places, default 0
// duration = duration of animation in seconds, default 2
// options = optional object of options (see below)
exports.CountUp = function (target, startVal, endVal, decimals, duration, options) {
    var self = this;
    self.version = function () { return '1.9.2'; };
    // default options
    self.options = {
        useEasing: true,
        useGrouping: true,
        separator: ',',
        decimal: '.',
        easingFn: easeOutExpo,
        formattingFn: formatNumber,
        prefix: '$',
        suffix: '',
        numerals: [] // optionally pass an array of custom numerals for 0-9
    };
    // extend default options with passed options object
    if (options && typeof options === 'object') {
        for (var key in self.options) {
            if (options.hasOwnProperty(key) && options[key] !== null) {
                self.options[key] = options[key];
            }
        }
    }
    if (self.options.separator === '') {
        self.options.useGrouping = false;
    }
    else {
        // ensure the separator is a string (formatNumber assumes this)
        self.options.separator = '' + self.options.separator;
    }
    // make sure requestAnimationFrame and cancelAnimationFrame are defined
    // polyfill for browsers without native support
    // by Opera engineer Erik Möller
    var lastTime = 0;
    var vendors = ['webkit', 'moz', 'ms', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function (callback) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () { callback(currTime + timeToCall); }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
    }
    function formatNumber(num) {
        num = num.toFixed(self.decimals);
        num += '';
        var x, x1, x2, x3, i, l;
        x = num.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? self.options.decimal + x[1] : '';
        if (self.options.useGrouping) {
            x3 = '';
            for (i = 0, l = x1.length; i < l; ++i) {
                if (i !== 0 && ((i % 3) === 0)) {
                    x3 = self.options.separator + x3;
                }
                x3 = x1[l - i - 1] + x3;
            }
            x1 = x3;
        }
        // optional numeral substitution
        if (self.options.numerals.length) {
            x1 = x1.replace(/[0-9]/g, function (w) {
                return self.options.numerals[+w];
            });
            x2 = x2.replace(/[0-9]/g, function (w) {
                return self.options.numerals[+w];
            });
        }
        return self.options.prefix + x1 + x2 + self.options.suffix;
    }
    // Robert Penner's easeOutExpo
    function easeOutExpo(t, b, c, d) {
        return c * (-Math.pow(2, -10 * t / d) + 1) * 1024 / 1023 + b;
    }
    function ensureNumber(n) {
        return (typeof n === 'number' && !isNaN(n));
    }
    self.initialize = function () {
        if (self.initialized)
            return true;
        self.error = '';
        self.d = (typeof target === 'string') ? document.getElementById(target) : target;
        if (!self.d) {
            self.error = '[CountUp] target is null or undefined';
            return false;
        }
        self.startVal = Number(startVal);
        self.endVal = Number(endVal);
        // error checks
        if (ensureNumber(self.startVal) && ensureNumber(self.endVal)) {
            self.decimals = Math.max(0, decimals || 0);
            self.dec = Math.pow(10, self.decimals);
            self.duration = Number(duration) * 1000 || 2000;
            self.countDown = (self.startVal > self.endVal);
            self.frameVal = self.startVal;
            self.initialized = true;
            return true;
        }
        else {
            self.error = '[CountUp] startVal (' + startVal + ') or endVal (' + endVal + ') is not a number';
            return false;
        }
    };
    // Print value to target
    self.printValue = function (value) {
        var result = self.options.formattingFn(value);
        if (self.d.tagName === 'INPUT') {
            this.d.value = result;
        }
        else if (self.d.tagName === 'text' || self.d.tagName === 'tspan') {
            this.d.textContent = result;
        }
        else {
            this.d.innerHTML = result;
        }
        self.d.text = result;
    };
    self.count = function (timestamp) {
        if (!self.startTime) {
            self.startTime = timestamp;
        }
        self.timestamp = timestamp;
        var progress = timestamp - self.startTime;
        self.remaining = self.duration - progress;
        // to ease or not to ease
        if (self.options.useEasing) {
            if (self.countDown) {
                self.frameVal = self.startVal - self.options.easingFn(progress, 0, self.startVal - self.endVal, self.duration);
            }
            else {
                self.frameVal = self.options.easingFn(progress, self.startVal, self.endVal - self.startVal, self.duration);
            }
        }
        else {
            if (self.countDown) {
                self.frameVal = self.startVal - ((self.startVal - self.endVal) * (progress / self.duration));
            }
            else {
                self.frameVal = self.startVal + (self.endVal - self.startVal) * (progress / self.duration);
            }
        }
        // don't go past endVal since progress can exceed duration in the last frame
        if (self.countDown) {
            self.frameVal = (self.frameVal < self.endVal) ? self.endVal : self.frameVal;
        }
        else {
            self.frameVal = (self.frameVal > self.endVal) ? self.endVal : self.frameVal;
        }
        // decimal
        self.frameVal = Math.round(self.frameVal * self.dec) / self.dec;
        // format and print value
        self.printValue(self.frameVal);
        // whether to continue
        if (progress < self.duration) {
            self.rAF = requestAnimationFrame(self.count);
        }
        else {
            if (self.callback)
                self.callback();
        }
    };
    // start your animation
    self.start = function (callback) {
        if (!self.initialize())
            return;
        self.callback = callback;
        self.rAF = requestAnimationFrame(self.count);
    };
    // toggles pause/resume animation
    self.pauseResume = function () {
        if (!self.paused) {
            self.paused = true;
            cancelAnimationFrame(self.rAF);
        }
        else {
            self.paused = false;
            delete self.startTime;
            self.duration = self.remaining;
            self.startVal = self.frameVal;
            requestAnimationFrame(self.count);
        }
    };
    // reset to startVal so animation can be run again
    self.reset = function () {
        self.paused = false;
        delete self.startTime;
        self.initialized = false;
        if (self.initialize()) {
            cancelAnimationFrame(self.rAF);
            self.printValue(self.startVal);
        }
    };
    // pass a new endVal and start animation
    self.update = function (newEndVal) {
        if (!self.initialize())
            return;
        newEndVal = Number(newEndVal);
        if (!ensureNumber(newEndVal)) {
            self.error = '[CountUp] update() - new endVal is not a number: ' + newEndVal;
            return;
        }
        self.error = '';
        if (newEndVal === self.frameVal)
            return;
        cancelAnimationFrame(self.rAF);
        self.paused = false;
        delete self.startTime;
        self.startVal = self.frameVal;
        self.endVal = newEndVal;
        self.countDown = (self.startVal > self.endVal);
        self.rAF = requestAnimationFrame(self.count);
    };
    // format startVal on initialization
    if (self.initialize())
        self.printValue(self.startVal);
};

},{}],14:[function(require,module,exports){
/**
 * Created by tarasg on 9/28/2017.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FontStyles = {
    'counterFont': new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 36,
        fontStyle: 'italic',
        fontWeight: 'bold',
        fill: ['#FF3D0D', '#FFCC11'],
        stroke: '#4a1850',
        strokeThickness: 5,
        dropShadow: false,
        dropShadowColor: '#000000',
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
        wordWrap: true,
        wordWrapWidth: 440
    }),
    'possibleWincounterFont': new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 36,
        fontStyle: 'italic',
        fontWeight: 'bold',
        fill: ['#f8f8ff', '#f8f8ff'],
        stroke: '#4a1850',
        strokeThickness: 5,
        dropShadow: false,
        dropShadowColor: '#000000',
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
        wordWrap: true,
        wordWrapWidth: 440
    }),
    'stakeFont': new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 24,
        fontStyle: 'italic',
        fontWeight: 'bold',
        fill: ['#FF3D0D', '#FFCC11'],
        stroke: '#4a1850',
        strokeThickness: 5,
        dropShadow: false,
        dropShadowColor: '#000000',
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
        wordWrap: true,
        wordWrapWidth: 440
    }),
    'GambleText': new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 36,
        fontStyle: 'italic',
        fontWeight: 'bold',
        fill: ['#f8f8ff', '#f8f8ff'],
        stroke: '#4a1850',
        strokeThickness: 5,
        dropShadow: false,
        dropShadowColor: '#000000',
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
        wordWrap: true,
        wordWrapWidth: 440
    }),
    'BonusCounterFont': new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 60,
        fontWeight: 'bold',
        fill: ['#FF3D0D', '#FFCC11'],
        stroke: '#4a1850',
        strokeThickness: 5,
        dropShadow: false,
        dropShadowColor: '#000000',
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
        wordWrap: true,
        wordWrapWidth: 440
    }),
    'BonusFinalCounterFont': new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 200,
        fontWeight: 'bold',
        fill: ['#FF3D0D', '#FFCC11'],
        stroke: '#4a1850',
        strokeThickness: 5,
        dropShadow: false,
        dropShadowColor: '#000000',
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
        wordWrap: true,
        wordWrapWidth: 440
    }),
};

},{}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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

},{"./Controllers/BaseGame":1,"./Scenes/GameScenes":11,"./Scenes/ScenesManager":12}]},{},[16])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQ29udHJvbGxlcnMvQmFzZUdhbWUudHMiLCJzcmMvRXZlbnRzL0J1dHRvbkV2ZW50cy50cyIsInNyYy9MYXlvdXQvQnV0dG9ucy50cyIsInNyYy9MYXlvdXQvTnVtZXJpY0ZpZWxkLnRzIiwic3JjL0xheW91dC9idXR0b25OYW1lcy50cyIsInNyYy9SZWVsU3Bpbm5lci9NYWluUm91bmRTeW1ib2xzLnRzIiwic3JjL1JlZWxTcGlubmVyL05ld1JlZWwudHMiLCJzcmMvUmVlbFNwaW5uZXIvUmVlbFNldHMudHMiLCJzcmMvUmVlbFNwaW5uZXIvUmVlbFNwaW5uZXIudHMiLCJzcmMvUmVlbFNwaW5uZXIvcmVlbHNDb25maWcudHMiLCJzcmMvU2NlbmVzL0dhbWVTY2VuZXMudHMiLCJzcmMvU2NlbmVzL1NjZW5lc01hbmFnZXIudHMiLCJzcmMvVXRpbHMvY291bnRlci50cyIsInNyYy9VdGlscy9mb250U3R5bGVzLnRzIiwic3JjL1V0aWxzL2hlbHBlckZ1bmNzLnRzIiwic3JjL21haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0tBLHNEQUFpRTtBQUNqRSxrQ0FBc0M7QUFDdEMsNERBQW9EO0FBV3BEO0lBb0JJLFlBQVksS0FBb0I7UUFmekIsWUFBTyxHQUFXLEtBQUssQ0FBQztRQUN4QixhQUFRLEdBQVcsR0FBRyxDQUFDO1FBQ3ZCLGlCQUFZLEdBQVcsR0FBRyxDQUFDO1FBYzlCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLHlEQUF5RDtRQUV6RCxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQy9DLDBDQUEwQztRQUMxQyxJQUFJLENBQUMsWUFBWSxHQUFHO1lBQ2hCLE1BQU0sRUFBRztnQkFDTCxFQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFD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LEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN0SixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDdEosQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3RKLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxD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QUFDO29EQUNWLFdBQVcsRUFBQyxDQUFDO29EQUNiLGdCQUFnQixFQUFDLENBQUM7aURBQ3JCO2dEQUNEO29EQUNJLFFBQVEsRUFBQyxDQUFDO29EQUNWLFdBQVcsRUFBQyxDQUFDO29EQUNiLGdCQUFnQixFQUFDLENBQUM7aURBQ3JCO2dEQUNEO29EQUNJLFFBQVEsRUFBQyxDQUFDO29EQUNWLFdBQVcsRUFBQyxDQUFDO29EQUNiLGdCQUFnQixFQUFDLENBQUM7aURBQ3JCO2dEQUNEO29EQUNJLFFBQVEsRUFBQyxDQUFDO29EQUNWLFdBQVcsRUFBQyxDQUFDO29EQUNiLGdCQUFnQixFQUFDLENBQUM7aURBQ3JCO2dEQUNEO29EQUNJLFFBQVEsRUFBQyxDQUFDO29EQUNWLFdBQVcsRUFBQyxDQUFDO29EQUNiLGdCQUFnQixFQUFDLENBQUM7aURBQ3JCO2dEQUNEO29EQUNJLFFBQVEsRUFBQyxDQUFDO29EQUNWLFdBQVcsRUFBQyxDQUFDO29EQUNiLGdCQUFnQixFQUFDLENBQUM7aURBQ3JCO2dEQUNEO29EQUNJLFFBQVEsRUFBQyxDQUFDO29EQUNWLFdBQVcsRUFBQyxDQUFDO29EQUNiLGdCQUFnQixFQUFDLENBQUM7aURBQ3JCO2dEQUNEO29EQUNJLFFBQVEsRUFBQyxDQUFDO29EQUNWLFdBQVcsRUFBQyxDQUFDO29EQUNiLGdCQUFnQixFQUFDLENBQUM7aURBQ3JCO2dEQUNEO29EQUNJLFFBQVEsRUFBQyxDQUFDO29EQUNWLFdBQVcsRUFBQyxDQUFDO29EQUNiLGdCQUFnQixFQUFDLENBQUM7aURBQ3JCO2dEQUNEO29EQUNJLFFBQVEsRUFBQyxDQUFDO29EQUNWLFdBQVcsRUFBQyxDQUFDO29EQUNiLGdCQUFnQixFQUFDLENBQUM7aURBQ3JCO2dEQUNEO29EQUNJLFFBQVEsRUFBQyxDQUFDO29EQUNWLFdBQVcsRUFBQyxDQUFDO29EQUNiLGdCQUFnQixFQUFDLENBQUM7aURBQ3JCOzZDQUNKO3lDQUNKO3FDQUNKO29DQUNELFNBQVMsRUFBQyxFQUVUO2lDQUNKO2dDQUNEO29DQUNJLFlBQVksRUFB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LCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9cmV0dXJuIGV9KSgpIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgdGFyYXNnIG9uIDEwLzExLzIwMTcuXHJcbiAqL1xyXG4vLyBpbXBvcnQge0J1dHRvbn0gZnJvbSBcIi4uL0xheW91dC9CdXR0b25zXCI7XHJcbmltcG9ydCB7QmFzZUdhbWVTY2VuZX0gZnJvbSBcIi4uL1NjZW5lcy9HYW1lU2NlbmVzXCI7XHJcbmltcG9ydCB7Zm9ybWF0U3Rha2VBbW91bnQsIG5leHRJdGVtfSBmcm9tIFwiLi4vVXRpbHMvaGVscGVyRnVuY3NcIjtcclxuaW1wb3J0IHtTQ0VORV9NQU5BR0VSfSBmcm9tIFwiLi4vbWFpblwiO1xyXG5pbXBvcnQge3Jlc3BvbnNlfSBmcm9tIFwiLi4vUmVlbFNwaW5uZXIvcmVlbHNDb25maWdcIjtcclxuaW1wb3J0IHtXaW5TaG93Q29udHJvbGxlcn0gZnJvbSBcIi4vV2luU2hvd1wiO1xyXG4vLyBpbXBvcnQge0J1dHRvbkV2ZW50c30gZnJvbSBcIi4uL0V2ZW50cy9CdXR0b25FdmVudHNcIjtcclxuLy8gaW1wb3J0IHtGb250U3R5bGVzfSBmcm9tIFwiLi4vVXRpbHMvZm9udFN0eWxlc1wiO1xyXG4vLyBpbXBvcnQge2FwcCwgYmFzZUdhbWVTY2VuZSwgYm9udXNHYW1lU2NlbmUsIFNDRU5FX01BTkFHRVJ9IGZyb20gXCIuLi9tYWluXCJcclxuLy8gaW1wb3J0IHtMaW5lT2JqZWN0fSBmcm9tIFwiLi4vQm9udXMvTGluZU9iamVjdFwiO1xyXG5cclxuZGVjbGFyZSBsZXQgR0RLV3JhcHBlcjogYW55O1xyXG5cclxuXHJcblxyXG5leHBvcnQgY2xhc3MgQmFzZUdhbWVDb250cm9sbGVyIHtcclxuXHJcbiAgICBwcml2YXRlIHNjZW5lOiBCYXNlR2FtZVNjZW5lO1xyXG4gICAgcHVibGljIHN0YXRlOiBzdHJpbmc7XHJcbiAgICBwdWJsaWMgYnV0dG9uU3RhdGVzOiBhbnk7XHJcbiAgICBwdWJsaWMgYmFsYW5jZTogbnVtYmVyID0gMTAwMDA7XHJcbiAgICBwdWJsaWMgdG90YWxXaW46IG51bWJlciA9IDEwMDtcclxuICAgIHB1YmxpYyBjdXJyZW50U3Rha2U6IG51bWJlciA9IDEwMDtcclxuICAgIHB1YmxpYyBzdGFrZXM6IG51bWJlcltdO1xyXG4gICAgcHVibGljIFdpblNob3dDb250cm9sbGVyOiBXaW5TaG93Q29udHJvbGxlcjtcclxuXHJcbiAgICBwcml2YXRlIG9uU3RhcnRCdXR0b246IGFueTtcclxuICAgIHByaXZhdGUgb25SZWVsc1N0b3A6IGFueTtcclxuICAgIHByaXZhdGUgb25TbGFtT3V0OiBhbnk7XHJcbiAgICBwcml2YXRlIG9uU3Rha2VCdXR0b246IGFueTtcclxuICAgIHByaXZhdGUgb25DaGFuZ2VTdGFrZTogYW55O1xyXG4gICAgcHJpdmF0ZSBvbk1heEJldDogYW55O1xyXG4gICAgcHJpdmF0ZSBvbkdhbWJsZTogYW55O1xyXG5cclxuXHJcbiAgICBjb25zdHJ1Y3RvcihzY2VuZTogQmFzZUdhbWVTY2VuZSkge1xyXG4gICAgICAgIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuICAgICAgICAvLyB0aGlzLldpblNob3dDb250cm9sbGVyID0gbmV3IFdpblNob3dDb250cm9sbGVyKHNjZW5lKTtcclxuXHJcbiAgICAgICAgdGhpcy5zY2VuZS5iYWxhbmNlRmllbGQuYWRkVmFsdWUodGhpcy5iYWxhbmNlKTtcclxuICAgICAgICAvLyB0aGlzLnN0YWtlcyA9IHNjZW5lLnN0YWtlQnV0dG9uLnN0YWtlcztcclxuICAgICAgICB0aGlzLmJ1dHRvblN0YXRlcyA9IHtcclxuICAgICAgICAgICAgJ2lkbGUnIDogW1xyXG4gICAgICAgICAgICAgICAgeydidXR0b24nOiB0aGlzLnNjZW5lLnN0YXJ0QnV0dG9uLCAnc3RhdGUnOiAnZW5hYmxlJ30sXHJcbiAgICAgICAgICAgICAgICB7J2J1dHRvbic6IHRoaXMuc2NlbmUuc3RvcEJ1dHRvbiwgJ3N0YXRlJzogJ2hpZGUnfSxcclxuICAgICAgICAgICAgICAgIC8vIHsnYnV0dG9uJzogc2NlbmUuY29sbGVjdEJ1dHRvbiwgJ3N0YXRlJzogJ2hpZGUnfSxcclxuICAgICAgICAgICAgICAgIC8vIHsnYnV0dG9uJzogc2NlbmUuc3RhcnRCb251c0J1dHRvbiwgJ3N0YXRlJzogJ2hpZGUnfSxcclxuICAgICAgICAgICAgICAgIC8vIHsnYnV0dG9uJzogc2NlbmUubWF4QmV0QnV0dG9uLCAnc3RhdGUnOiAnZW5hYmxlJ30sXHJcbiAgICAgICAgICAgICAgICAvLyB7J2J1dHRvbic6IHNjZW5lLmF1dG9TdGFydEJ1dHRvbiwgJ3N0YXRlJzogJ2VuYWJsZSd9LFxyXG4gICAgICAgICAgICAgICAgLy8geydidXR0b24nOiBzY2VuZS5jYW5jZWxBdXRvU3RhcnRCdXR0b24sICdzdGF0ZSc6ICdoaWRlJ30sXHJcbiAgICAgICAgICAgICAgICAvLyB7J2J1dHRvbic6IHNjZW5lLnN0YWtlQnV0dG9uLCAnc3RhdGUnOiAnZW5hYmxlJ30sXHJcbiAgICAgICAgICAgICAgICAvLyB7J2J1dHRvbic6IHNjZW5lLmdhbWJsZUJ1dHRvbiwgJ3N0YXRlJzogJ2Rpc2FibGUnfSxcclxuICAgICAgICAgICAgICAgIC8vIHsnYnV0dG9uJzogc2NlbmUuaGVscEJ1dHRvbiwgJ3N0YXRlJzogJ2VuYWJsZSd9LFxyXG4gICAgICAgICAgICAgICAgLy8geydidXR0b24nOiBzY2VuZS5tZW51QnV0dG9uLCAnc3RhdGUnOiAnZW5hYmxlJ30sXHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICdyb3VuZCc6IFtcclxuICAgICAgICAgICAgICAgIHsnYnV0dG9uJzogdGhpcy5zY2VuZS5zdGFydEJ1dHRvbiwgJ3N0YXRlJzogJ2hpZGUnfSxcclxuICAgICAgICAgICAgICAgIHsnYnV0dG9uJzogdGhpcy5zY2VuZS5zdG9wQnV0dG9uLCAnc3RhdGUnOiAnZW5hYmxlJ30sXHJcbiAgICAgICAgICAgICAgICAvLyB7J2J1dHRvbic6IHNjZW5lLmNvbGxlY3RCdXR0b24sICdzdGF0ZSc6ICdoaWRlJ30sXHJcbiAgICAgICAgICAgICAgICAvLyB7J2J1dHRvbic6IHNjZW5lLnN0YXJ0Qm9udXNCdXR0b24sICdzdGF0ZSc6ICdoaWRlJ30sXHJcbiAgICAgICAgICAgICAgICAvLyB7J2J1dHRvbic6IHNjZW5lLm1heEJldEJ1dHRvbiwgJ3N0YXRlJzogJ2Rpc2FibGUnfSxcclxuICAgICAgICAgICAgICAgIC8vIHsnYnV0dG9uJzogc2NlbmUuYXV0b1N0YXJ0QnV0dG9uLCAnc3RhdGUnOiAnZGlzYWJsZSd9LFxyXG4gICAgICAgICAgICAgICAgLy8geydidXR0b24nOiBzY2VuZS5jYW5jZWxBdXRvU3RhcnRCdXR0b24sICdzdGF0ZSc6ICdoaWRlJ30sXHJcbiAgICAgICAgICAgICAgICAvLyB7J2J1dHRvbic6IHNjZW5lLnN0YWtlQnV0dG9uLCAnc3RhdGUnOiAnZGlzYWJsZSd9LFxyXG4gICAgICAgICAgICAgICAgLy8geydidXR0b24nOiBzY2VuZS5nYW1ibGVCdXR0b24sICdzdGF0ZSc6ICdkaXNhYmxlJ30sXHJcbiAgICAgICAgICAgICAgICAvLyB7J2J1dHRvbic6IHNjZW5lLmhlbHBCdXR0b24sICdzdGF0ZSc6ICdkaXNhYmxlJ30sXHJcbiAgICAgICAgICAgICAgICAvLyB7J2J1dHRvbic6IHNjZW5lLm1lbnVCdXR0b24sICdzdGF0ZSc6ICdkaXNhYmxlJ30sXHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICdjb2xsZWN0JzogW1xyXG4gICAgICAgICAgICAgICAgeydidXR0b24nOiB0aGlzLnNjZW5lLnN0YXJ0QnV0dG9uLCAnc3RhdGUnOiAnaGlkZSd9LFxyXG4gICAgICAgICAgICAgICAgeydidXR0b24nOiB0aGlzLnNjZW5lLnN0b3BCdXR0b24sICdzdGF0ZSc6ICdoaWRlJ30sXHJcbiAgICAgICAgICAgICAgICAvLyB7J2J1dHRvbic6IHNjZW5lLmNvbGxlY3RCdXR0b24sICdzdGF0ZSc6ICdlbmFibGUnfSxcclxuICAgICAgICAgICAgICAgIC8vIHsnYnV0dG9uJzogc2NlbmUuc3RhcnRCb251c0J1dHRvbiwgJ3N0YXRlJzogJ2hpZGUnfSxcclxuICAgICAgICAgICAgICAgIC8vIHsnYnV0dG9uJzogc2NlbmUubWF4QmV0QnV0dG9uLCAnc3RhdGUnOiAnZGlzYWJsZSd9LFxyXG4gICAgICAgICAgICAgICAgLy8geydidXR0b24nOiBzY2VuZS5hdXRvU3RhcnRCdXR0b24sICdzdGF0ZSc6ICdkaXNhYmxlJ30sXHJcbiAgICAgICAgICAgICAgICAvLyB7J2J1dHRvbic6IHNjZW5lLmNhbmNlbEF1dG9TdGFydEJ1dHRvbiwgJ3N0YXRlJzogJ2hpZGUnfSxcclxuICAgICAgICAgICAgICAgIC8vIHsnYnV0dG9uJzogc2NlbmUuc3Rha2VCdXR0b24sICdzdGF0ZSc6ICdkaXNhYmxlJ30sXHJcbiAgICAgICAgICAgICAgICAvLyB7J2J1dHRvbic6IHNjZW5lLmdhbWJsZUJ1dHRvbiwgJ3N0YXRlJzogJ2VuYWJsZSd9LFxyXG4gICAgICAgICAgICAgICAgLy8geydidXR0b24nOiBzY2VuZS5oZWxwQnV0dG9uLCAnc3RhdGUnOiAnZGlzYWJsZSd9LFxyXG4gICAgICAgICAgICAgICAgLy8geydidXR0b24nOiBzY2VuZS5tZW51QnV0dG9uLCAnc3RhdGUnOiAnZGlzYWJsZSd9LFxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5vblN0YXJ0QnV0dG9uID0gZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdGhpcy5vblN0YXJ0QnV0dG9uRnVuYygpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgdGhpcy5vblJlZWxzU3RvcCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5vblJlZWxzU3RvcEZ1bmMoKTtcclxuICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgIHRoaXMub25TbGFtT3V0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLm9uU2xhbU91dEZ1bmMoKTtcclxuICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgIHRoaXMub25TdGFrZUJ1dHRvbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5vblN0YWtlQnV0dG9uRnVuYygpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgdGhpcy5vbkNoYW5nZVN0YWtlID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgdGhpcy5vbkNoYW5nZVN0YWtlRnVuYyhlKTtcclxuICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgIHRoaXMub25NYXhCZXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMub25NYXhCZXRCdXR0b25GdW5jKCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICB0aGlzLm9uR2FtYmxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLm9uR2FtYmxlRnVuYygpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSgnaWRsZScpO1xyXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcnMoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldFN0YXRlKHN0YXRlOnN0cmluZykge1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBzdGF0ZTtcclxuXHJcbiAgICAgICAgaWYgKHN0YXRlID09ICdpZGxlJykge1xyXG4gICAgICAgICAgICB0aGlzLmVuYWJsZVdpbkxpbmVCdXR0b25zKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5kaXNhYmxlV2luTGluZUJ1dHRvbnMoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gc2V0IGJ1dHRvbiBzdGF0ZXM6XHJcbiAgICAgICAgbGV0IGJ1dHRvblN0YXRlID0gdGhpcy5idXR0b25TdGF0ZXNbdGhpcy5zdGF0ZV07XHJcbiAgICAgICAgZm9yIChsZXQgaT0wOyBpPGJ1dHRvblN0YXRlLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChidXR0b25TdGF0ZVtpXS5zdGF0ZSA9PSAnZW5hYmxlJyl7XHJcbiAgICAgICAgICAgICAgICBidXR0b25TdGF0ZVtpXS5idXR0b24uZW5hYmxlKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYnV0dG9uU3RhdGVbaV0uc3RhdGUgPT0gJ2Rpc2FibGUnKXtcclxuICAgICAgICAgICAgICAgIGJ1dHRvblN0YXRlW2ldLmJ1dHRvbi5kaXNhYmxlKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYnV0dG9uU3RhdGVbaV0uc3RhdGUgPT0gJ2hpZGUnKXtcclxuICAgICAgICAgICAgICAgIGJ1dHRvblN0YXRlW2ldLmJ1dHRvbi5oaWRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHByaXZhdGUgYWRkRXZlbnRMaXN0ZW5lcnMoKSB7XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignU3RhcnRCdXR0b25QcmVzc2VkJywgdGhpcy5vblN0YXJ0QnV0dG9uKTtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdMYXN0UmVlbFN0b3BwZWQnLCB0aGlzLm9uUmVlbHNTdG9wKTtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdTdG9wQnV0dG9uUHJlc3NlZCcsIHRoaXMub25TbGFtT3V0KTtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdCZXRCdXR0b25QcmVzc2VkJyx0aGlzLm9uU3Rha2VCdXR0b24pO1xyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZVN0YWtlRXZlbnQnLCB0aGlzLm9uQ2hhbmdlU3Rha2UpO1xyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ01heEJldEJ1dHRvblByZXNzZWQnLCB0aGlzLm9uTWF4QmV0KTtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdHYW1ibGVCdXR0b25QcmVzc2VkJywgdGhpcy5vbkdhbWJsZSk7XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignTWVudUJ1dHRvblByZXNzZWQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5jbG9zZSgpXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignU3RhcnRCb251c0J1dHRvblByZXNzZWQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIC8vIFNDRU5FX01BTkFHRVIuZ29Ub0dhbWVTY2VuZSgnYm9udXNHYW1lJyk7XHJcbiAgICAgICAgICAgIC8vIGJvbnVzQ29udHJvbGxlci5zdGFydEJvbnVzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignSGVscEJ1dHRvblByZXNzZWQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIFNDRU5FX01BTkFHRVIuZ29Ub0dhbWVTY2VuZSgnbWFpbkhlbHAnKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdDbGlja2VkT25CYXNlR2FtZVNjZW5lJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvLyBpZiAodGhpcy5zY2VuZS5zdGFrZUJ1dHRvbi5pc1Nob3duKXtcclxuICAgICAgICAgICAgLy8gICAgIHRoaXMuc2NlbmUuc3Rha2VCdXR0b24uaGlkZVBhbmVsKCk7XHJcbiAgICAgICAgICAgIC8vIH1cclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdleGl0R2FtYmxlRXZlbnQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIC8vIHRoaXMudG90YWxXaW4gPSBnYW1ibGVDb250cm9sbGVyLmJhbms7XHJcbiAgICAgICAgICAgIC8vIHRoaXMub25Db2xsZWN0KCk7XHJcblxyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0NvbGxlY3RCdXR0b25QcmVzc2VkJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdGhpcy5vbkNvbGxlY3QoKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKSB7XHJcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignU3RhcnRCdXR0b25QcmVzc2VkJywgdGhpcy5vblN0YXJ0QnV0dG9uKVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uU2xhbU91dEZ1bmMoKXtcclxuICAgICAgICB0aGlzLnNjZW5lLlJFRUxTLnNsYW1vdXQoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uU3RhcnRCdXR0b25GdW5jKCl7XHJcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSgncm91bmQnKTtcclxuICAgICAgICB0aGlzLnNjZW5lLnRvdGFsV2luRmllbGQuY291bnRlci5yZXNldCgpO1xyXG4gICAgICAgIHRoaXMuYmFsYW5jZSAtPSB0aGlzLmN1cnJlbnRTdGFrZTtcclxuICAgICAgICB0aGlzLnNjZW5lLmJhbGFuY2VGaWVsZC5zdWJzdHJhY3RWYWx1ZSh0aGlzLmN1cnJlbnRTdGFrZSk7XHJcbiAgICAgICAgLy8gdGhpcy5XaW5TaG93Q29udHJvbGxlci51cGRhdGVQYXlvdXRzKHJlc3BvbnNlKTtcclxuICAgICAgICB0aGlzLnRvdGFsV2luID0gcmVzcG9uc2UuZGF0YS5nYW1lRGF0YS50b3RhbFdpbkFtb3VudDtcclxuICAgICAgICBsZXQgc3RvcHMgPSB0aGlzLmdldFN0b3BzQXJyYXkocmVzcG9uc2UpO1xyXG4gICAgICAgIHRoaXMuc2NlbmUuUkVFTFMuc3BpbihzdG9wcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRTdG9wc0FycmF5KHJvdW5kUmVzcG9uc2UpOiBudW1iZXJbXVtdIHtcclxuICAgICAgICBsZXQgc3ltYm9sVXBkYXRlcyA9IHJvdW5kUmVzcG9uc2UuZGF0YS5nYW1lRGF0YS5wbGF5U3RhY2tbMF0ubGFzdFBsYXlJbk1vZGVEYXRhLnNsb3RzRGF0YS5hY3Rpb25zWzBdLnRyYW5zZm9ybXNbMF0uc3ltYm9sVXBkYXRlcyxcclxuICAgICAgICAgICAgcmVzdWx0ID0gW1tdLFtdLFtdLFtdLFtdXTtcclxuICAgICAgICBmb3IgKGxldCBpPTA7IGk8IHN5bWJvbFVwZGF0ZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgcmVzdWx0W3N5bWJvbFVwZGF0ZXNbaV0ucmVlbEluZGV4XVtzeW1ib2xVcGRhdGVzW2ldLnBvc2l0aW9uT25SZWVsXSA9IHN5bWJvbFVwZGF0ZXNbaV0uc3ltYm9sO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25SZWVsc1N0b3BGdW5jKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnRvdGFsV2luID09IDApe1xyXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKCdpZGxlJyk7XHJcbiAgICAgICAgICAgIHRoaXMuY2hlY2tJZkJldFBvc3NpYmxlKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSgnY29sbGVjdCcpO1xyXG4gICAgICAgICAgICB0aGlzLnNjZW5lLmludGVyYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5XaW5TaG93Q29udHJvbGxlci5wbGF5V2luU2hvdygpO1xyXG4gICAgICAgICAgICB0aGlzLnNjZW5lLnRvdGFsV2luRmllbGQuYWRkVmFsdWUodGhpcy50b3RhbFdpbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgIG9uU3Rha2VCdXR0b25GdW5jKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnNjZW5lLnN0YWtlQnV0dG9uLmlzU2hvd24pe1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudFN0YWtlSW5kZXggPSB0aGlzLnNjZW5lLnN0YWtlQnV0dG9uLnN0YWtlcy5pbmRleE9mKHRoaXMuc2NlbmUuc3Rha2VCdXR0b24uY3VycmVudFN0YWtlQW1vdW50KSxcclxuICAgICAgICAgICAgICAgIG5leHRTdGFrZSA9IG5leHRJdGVtKHRoaXMuc2NlbmUuc3Rha2VCdXR0b24uc3Rha2VzLCBjdXJyZW50U3Rha2VJbmRleCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2NlbmUuc3Rha2VCdXR0b24uY2hhbmdlU3Rha2UobmV4dFN0YWtlKTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnNjZW5lLnN0YWtlQnV0dG9uLnNob3dQYW5lbCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNoZWNrSWZCZXRQb3NzaWJsZSgpIHtcclxuICAgICAgICBpZiAodGhpcy5iYWxhbmNlIDwgdGhpcy5jdXJyZW50U3Rha2UpIHtcclxuICAgICAgICAgICAgdGhpcy5zY2VuZS5zdGFydEJ1dHRvbi5kaXNhYmxlKCk7XHJcbiAgICAgICAgICAgIC8vIHRoaXMuc2NlbmUuYXV0b1N0YXJ0QnV0dG9uLmRpc2FibGUoKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NlbmUuc3RhcnRCdXR0b24uZW5hYmxlKCk7XHJcbiAgICAgICAgICAgIC8vIHRoaXMuc2NlbmUuYXV0b1N0YXJ0QnV0dG9uLmVuYWJsZSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvbkNoYW5nZVN0YWtlRnVuYyhldmVudCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudFN0YWtlID0gZXZlbnQuZGV0YWlsLm5ld1N0YWtlO1xyXG4gICAgICAgIHRoaXMuY2hlY2tJZkJldFBvc3NpYmxlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvbk1heEJldEJ1dHRvbkZ1bmMoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaT0wOyBpPHRoaXMuc3Rha2VzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJhbGFuY2UgPCB0aGlzLnN0YWtlc1tpXSl7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2NlbmUuc3Rha2VCdXR0b24uY2hhbmdlU3Rha2UodGhpcy5zdGFrZXNbaV0pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uR2FtYmxlRnVuYygpIHtcclxuICAgICAgICAvLyBTQ0VORV9NQU5BR0VSLmdvVG9HYW1lU2NlbmUoJ2dhbWJsZScpO1xyXG4gICAgICAgIC8vIGdhbWJsZUNvbnRyb2xsZXIuc3RhcnRHYW1ibGUodGhpcy50b3RhbFdpbik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvbkNvbGxlY3QoKXtcclxuICAgICAgICB0aGlzLnNjZW5lLnRvdGFsV2luRmllbGQuY291bnRlci5yZXNldCgpO1xyXG4gICAgICAgIHRoaXMuc2NlbmUuYmFsYW5jZUZpZWxkLmFkZFZhbHVlKHRoaXMudG90YWxXaW4pO1xyXG4gICAgICAgIHRoaXMuYmFsYW5jZSArPSB0aGlzLnRvdGFsV2luO1xyXG4gICAgICAgIHRoaXMudG90YWxXaW4gPSAwO1xyXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoJ2lkbGUnKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGRpc2FibGVXaW5MaW5lQnV0dG9ucygpOiB2b2lkIHtcclxuICAgICAgICAvLyBmb3IgKGxldCBpPTA7IGk8dGhpcy5zY2VuZS53aW5MaW5lc0FycmF5Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgLy8gICAgIHRoaXMuc2NlbmUud2luTGluZXNBcnJheVtpXS5kaXNhYmxlKCk7XHJcbiAgICAgICAgLy8gfVxyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBlbmFibGVXaW5MaW5lQnV0dG9ucygpOiB2b2lkIHtcclxuICAgICAgICAvLyBmb3IgKGxldCBpPTA7IGk8dGhpcy5zY2VuZS53aW5MaW5lc0FycmF5Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgLy8gICAgIHRoaXMuc2NlbmUud2luTGluZXNBcnJheVtpXS5lbmFibGUoKTtcclxuICAgICAgICAvLyB9XHJcbiAgICB9XHJcblxyXG5cclxuXHJcblxyXG59IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgdGFyYXNnIG9uIDkvMjUvMjAxNy5cclxuICovXHJcblxyXG5cclxubGV0IEdhbWJsZVJlZFByZXNzZWQgPSBuZXcgQ3VzdG9tRXZlbnQoXCJHYW1ibGVSZWRQcmVzc2VkXCIpLFxyXG4gICAgR2FtYmxlQmxhY2tQcmVzc2VkID0gbmV3IEN1c3RvbUV2ZW50KFwiR2FtYmxlQmxhY2tQcmVzc2VkXCIpLFxyXG4gICAgR2FtYmxlQ29sbGVjdFByZXNzZWQgPSBuZXcgQ3VzdG9tRXZlbnQoXCJHYW1ibGVDb2xsZWN0UHJlc3NlZFwiKSxcclxuICAgIENsaWNrZWRPbkJhc2VHYW1lU2NlbmUgPSBuZXcgQ3VzdG9tRXZlbnQoXCJDbGlja2VkT25CYXNlR2FtZVNjZW5lXCIpLFxyXG4gICAgQmV0QnV0dG9uUHJlc3NlZCA9IG5ldyBDdXN0b21FdmVudCgnQmV0QnV0dG9uUHJlc3NlZCcpLFxyXG4gICAgR2FtYmxlQnV0dG9uUHJlc3NlZCA9IG5ldyBDdXN0b21FdmVudCgnR2FtYmxlQnV0dG9uUHJlc3NlZCcpLFxyXG4gICAgQXV0b1N0YXJ0QnV0dG9uUHJlc3NlZCA9IG5ldyBDdXN0b21FdmVudCgnQXV0b1N0YXJ0QnV0dG9uUHJlc3NlZCcpLFxyXG4gICAgTWF4QmV0QnV0dG9uUHJlc3NlZCA9IG5ldyBDdXN0b21FdmVudCgnTWF4QmV0QnV0dG9uUHJlc3NlZCcpLFxyXG4gICAgRXhpdEhlbHBCdXR0b25QcmVzc2VkID0gbmV3IEN1c3RvbUV2ZW50KCdFeGl0SGVscEJ1dHRvblByZXNzZWQnKSxcclxuICAgIFByZXZIZWxwUGFnZUJ1dHRvblByZXNzZWQgPSBuZXcgQ3VzdG9tRXZlbnQoJ1ByZXZIZWxwUGFnZUJ1dHRvblByZXNzZWQnKSxcclxuICAgIE5leHRIZWxwUGFnZUJ1dHRvblByZXNzZWQgPSBuZXcgQ3VzdG9tRXZlbnQoJ05leHRIZWxwUGFnZUJ1dHRvblByZXNzZWQnKSxcclxuICAgIEhlbHBCdXR0b25QcmVzc2VkID0gbmV3IEN1c3RvbUV2ZW50KCdIZWxwQnV0dG9uUHJlc3NlZCcpLFxyXG4gICAgTWVudUJ1dHRvblByZXNzZWQgPSBuZXcgQ3VzdG9tRXZlbnQoJ01lbnVCdXR0b25QcmVzc2VkJyksXHJcbiAgICBTdG9wQnV0dG9uUHJlc3NlZCA9IG5ldyBDdXN0b21FdmVudCgnU3RvcEJ1dHRvblByZXNzZWQnKSxcclxuICAgIFN0YXJ0Qm9udXNCdXR0b25QcmVzc2VkID0gbmV3IEN1c3RvbUV2ZW50KCdTdGFydEJvbnVzQnV0dG9uUHJlc3NlZCcpLFxyXG4gICAgQ29sbGVjdEJ1dHRvblByZXNzZWQgPSBuZXcgQ3VzdG9tRXZlbnQoJ0NvbGxlY3RCdXR0b25QcmVzc2VkJyksXHJcbiAgICBTdGFydEJ1dHRvblByZXNzZWQgPSBuZXcgQ3VzdG9tRXZlbnQoJ1N0YXJ0QnV0dG9uUHJlc3NlZCcpLFxyXG4gICAgQ2FuY2VsQXV0b1N0YXJ0QnV0dG9uUHJlc3NlZCA9IG5ldyBDdXN0b21FdmVudCgnQ2FuY2VsQXV0b1N0YXJ0QnV0dG9uUHJlc3NlZCcpO1xyXG5cclxuXHJcbmV4cG9ydCBsZXQgQnV0dG9uRXZlbnRzID0ge1xyXG4gICAgJ0NsaWNrZWRPbkJhc2VHYW1lU2NlbmUnOiBDbGlja2VkT25CYXNlR2FtZVNjZW5lLFxyXG5cclxuICAgICdTdGFydEJ1dHRvblByZXNzZWQnOiBTdGFydEJ1dHRvblByZXNzZWQsXHJcbiAgICAnU3RvcEJ1dHRvblByZXNzZWQnIDogU3RvcEJ1dHRvblByZXNzZWQsXHJcbiAgICAnQ29sbGVjdEJ1dHRvblByZXNzZWQnOiBDb2xsZWN0QnV0dG9uUHJlc3NlZCxcclxuICAgICdTdGFydEJvbnVzQnV0dG9uUHJlc3NlZCc6IFN0YXJ0Qm9udXNCdXR0b25QcmVzc2VkLFxyXG5cclxuICAgICdNZW51QnV0dG9uUHJlc3NlZCcgOiBNZW51QnV0dG9uUHJlc3NlZCxcclxuICAgICdIZWxwQnV0dG9uUHJlc3NlZCcgOiBIZWxwQnV0dG9uUHJlc3NlZCxcclxuICAgICdHYW1ibGVCdXR0b25QcmVzc2VkJzogR2FtYmxlQnV0dG9uUHJlc3NlZCxcclxuICAgICdCZXRCdXR0b25QcmVzc2VkJzogQmV0QnV0dG9uUHJlc3NlZCxcclxuICAgICdNYXhCZXRCdXR0b25QcmVzc2VkJzogTWF4QmV0QnV0dG9uUHJlc3NlZCxcclxuXHJcbiAgICAnQXV0b1N0YXJ0QnV0dG9uUHJlc3NlZCc6IEF1dG9TdGFydEJ1dHRvblByZXNzZWQsXHJcbiAgICAnQ2FuY2VsQXV0b1N0YXJ0QnV0dG9uUHJlc3NlZCc6IENhbmNlbEF1dG9TdGFydEJ1dHRvblByZXNzZWQsXHJcblxyXG4gICAgJ05leHRIZWxwUGFnZUJ1dHRvblByZXNzZWQnOiBOZXh0SGVscFBhZ2VCdXR0b25QcmVzc2VkLFxyXG4gICAgJ1ByZXZIZWxwUGFnZUJ1dHRvblByZXNzZWQnOiBQcmV2SGVscFBhZ2VCdXR0b25QcmVzc2VkLFxyXG4gICAgJ0V4aXRIZWxwQnV0dG9uUHJlc3NlZCcgOiBFeGl0SGVscEJ1dHRvblByZXNzZWQsXHJcblxyXG4gICAgJ0dhbWJsZUNvbGxlY3RQcmVzc2VkJzogR2FtYmxlQ29sbGVjdFByZXNzZWQsXHJcbiAgICAnR2FtYmxlUmVkUHJlc3NlZCc6IEdhbWJsZVJlZFByZXNzZWQsXHJcbiAgICAnR2FtYmxlQmxhY2tQcmVzc2VkJzogR2FtYmxlQmxhY2tQcmVzc2VkLFxyXG59OyIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IHRhcmFzZyBvbiA5LzIyLzIwMTcuXHJcbiAqL1xyXG4vKipcclxuICogQ3JlYXRlZCBieSB0YXJhc2cgb24gNS8xMC8yMDE3LlxyXG4gKi9cclxuaW1wb3J0IHthcHB9IGZyb20gXCIuLi9tYWluXCI7XHJcbmltcG9ydCAqIGFzIHV0aWxzIGZyb20gXCIuLi9VdGlscy9oZWxwZXJGdW5jc1wiO1xyXG5pbXBvcnQge2J1dHRvblJlc291cmNlc30gZnJvbSBcIi4vYnV0dG9uTmFtZXNcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBCdXR0b24ge1xyXG5cclxuICAgIHB1YmxpYyB0ZXh0dXJlRW5hYmxlZCA6IFBJWEkuVGV4dHVyZTtcclxuICAgIHB1YmxpYyB0ZXh0dXJlRGlzYWJsZWQ6IFBJWEkuVGV4dHVyZTtcclxuICAgIHB1YmxpYyB0ZXh0dXJlUHJlc3NlZCA6IFBJWEkuVGV4dHVyZTtcclxuXHJcbiAgICBwdWJsaWMgc3ByaXRlOiBQSVhJLlNwcml0ZSB8IGFueTtcclxuXHJcbiAgICBwdWJsaWMgeDogbnVtYmVyO1xyXG4gICAgcHVibGljIHk6IG51bWJlcjtcclxuICAgIHB1YmxpYyBzY2VuZTogUElYSS5Db250YWluZXI7XHJcbiAgICBwdWJsaWMgc291bmQ6IGFueTtcclxuXHJcbiAgICBwdWJsaWMgb25CdXR0b25DbGljayA6IEZ1bmN0aW9uO1xyXG4gICAgcHJpdmF0ZSBpc0Rvd246IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIHN0YXRlOiBzdHJpbmc7XHJcblxyXG5cclxuICAgIGNvbnN0cnVjdG9yKHNjZW5lOiBQSVhJLkNvbnRhaW5lciwgeDogbnVtYmVyLCB5OiBudW1iZXIsIGJ1dHRvbk5hbWU6IHN0cmluZywgcmVzb3VyY2VzOmFueSwgYWN0aW9uOiBGdW5jdGlvbikge1xyXG4gICAgICAgIC8vIGVuYWJsZWRfaW1nLCBkaXNfaW1nLCBwcmVzc2VkX2ltZzogIFBJWEkuVGV4dHV0cmUgb3Igc3RyaW5nIHVybCB0byB0aGUgaW1hZ2VcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICAgICAgdGhpcy5zY2VuZSA9IHNjZW5lO1xyXG4gICAgICAgIHRoaXMudGV4dHVyZUVuYWJsZWQgID0gIHJlc291cmNlc1tidXR0b25SZXNvdXJjZXNbYnV0dG9uTmFtZV0uZW5hYmxlZF07XHJcbiAgICAgICAgdGhpcy50ZXh0dXJlRGlzYWJsZWQgPSByZXNvdXJjZXNbYnV0dG9uUmVzb3VyY2VzW2J1dHRvbk5hbWVdLmRpc2FibGVkXTtcclxuICAgICAgICB0aGlzLnRleHR1cmVQcmVzc2VkICA9IHJlc291cmNlc1tidXR0b25SZXNvdXJjZXNbYnV0dG9uTmFtZV0ucHJlc3NlZF07XHJcbiAgICAgICAgdGhpcy5vbkJ1dHRvbkNsaWNrID0gYWN0aW9uO1xyXG5cclxuICAgICAgICB0aGlzLnNwcml0ZSA9IG5ldyBQSVhJLlNwcml0ZSh0aGlzLnRleHR1cmVFbmFibGVkKTtcclxuICAgICAgICB0aGlzLnNwcml0ZS5pbnRlcmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUuYnV0dG9uTW9kZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnN0YXRlID0gJ2VuYWJsZWQnO1xyXG5cclxuICAgICAgICB0aGlzLnNwcml0ZS5hbmNob3Iuc2V0KDAuNSwgMC41KTtcclxuICAgICAgICB0aGlzLnNwcml0ZS54ID0gdGhpcy54O1xyXG4gICAgICAgIHRoaXMuc3ByaXRlLnkgPSB0aGlzLnk7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUub24oJ3BvaW50ZXJkb3duJywgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICAgIHRoaXMuaXNEb3duID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5zcHJpdGUudGV4dHVyZSA9IHRoaXMudGV4dHVyZVByZXNzZWQ7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgdGhpcy5zcHJpdGUub24oJ3BvaW50ZXJ1cCcsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgdGhpcy5zcHJpdGUudGV4dHVyZSA9IHRoaXMudGV4dHVyZUVuYWJsZWQ7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmlzRG93bilcclxuICAgICAgICAgICAgICAgIHRoaXMub25CdXR0b25DbGljaygpO1xyXG4gICAgICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHRoaXMuc3ByaXRlLm9uKCdwb2ludGVyb3V0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLnNwcml0ZS50ZXh0dXJlID0gdGhpcy50ZXh0dXJlRW5hYmxlZDtcclxuICAgICAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICB0aGlzLnNjZW5lLmFkZENoaWxkKHRoaXMuc3ByaXRlKTtcclxuXHJcbiAgICAgICAgdGhpcy5zcHJpdGUubW9kZWwgPSB0aGlzO1xyXG5cclxuXHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGhpZGUoKSB7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzaG93KCkge1xyXG4gICAgICAgIHRoaXMuc3ByaXRlLnZpc2libGUgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBkaXNhYmxlKCkge1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSAnZGlzYWJsZWQnO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlLnRleHR1cmUgPSB0aGlzLnRleHR1cmVEaXNhYmxlZDtcclxuICAgICAgICB0aGlzLnNwcml0ZS5pbnRlcmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBlbmFibGUoKSB7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9ICdlbmFibGVkJztcclxuICAgICAgICB0aGlzLnNwcml0ZS52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnNwcml0ZS50ZXh0dXJlID0gdGhpcy50ZXh0dXJlRW5hYmxlZDtcclxuICAgICAgICB0aGlzLnNwcml0ZS5pbnRlcmFjdGl2ZSA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNsaWNrKCkge1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSAncHJlc3NlZCc7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUudGV4dHVyZSA9IHRoaXMudGV4dHVyZVByZXNzZWQ7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUuaW50ZXJhY3RpdmUgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbn1cclxuXHJcblxyXG5leHBvcnQgY2xhc3MgRGVub21pbmF0aW9uUGFuZWxCdXR0b24gZXh0ZW5kcyBCdXR0b24ge1xyXG5cclxuICAgIHB1YmxpYyBzZWxlY3RlZFN0YWtlOiBQSVhJLlRleHQ7XHJcbiAgICBwdWJsaWMgc3Rha2VzWXBvczogbnVtYmVyW10gPSBbXTtcclxuICAgIHB1YmxpYyBjdXJyZW50U3Rha2VBbW91bnQ6IG51bWJlcjtcclxuICAgIHB1YmxpYyBzdGFrZUZvbnRTdHlsZTogYW55O1xyXG4gICAgcHVibGljIGZvbnRTdHlsZTogYW55O1xyXG4gICAgcHVibGljIHN0YWtlczogbnVtYmVyW107XHJcbiAgICBwdWJsaWMgZGVub21QYW5lbENvbnRhaW5lcjogUElYSS5Db250YWluZXI7XHJcbiAgICBwdWJsaWMgZGVub21TcHJpdGVCb3R0b206IFBJWEkuU3ByaXRlO1xyXG4gICAgcHVibGljIGRlbm9tU3ByaXRlVG9wOiBQSVhJLlNwcml0ZTtcclxuICAgIHB1YmxpYyBkZW5vbVNwcml0ZU1pZGRsZTogUElYSS5TcHJpdGU7XHJcbiAgICBwdWJsaWMgZGVub21TcHJpdGVTZWxlY3RlZDogUElYSS5TcHJpdGU7XHJcbiAgICBwdWJsaWMgZGVub21Cb3R0b206IFBJWEkuVGV4dHVyZTtcclxuICAgIHB1YmxpYyBkZW5vbVRvcDogUElYSS5UZXh0dXJlO1xyXG4gICAgcHVibGljIGRlbm9tTWlkZGxlOiBQSVhJLlRleHR1cmU7XHJcbiAgICBwdWJsaWMgZGVub21TZWxlY3RlZDogUElYSS5UZXh0dXJlO1xyXG4gICAgcHJpdmF0ZSBkZW5vbVBhcnRDb250YWluZXJzOiBQSVhJLkNvbnRhaW5lcltdO1xyXG4gICAgcHVibGljIGlzU2hvd246IGJvb2xlYW47XHJcblxyXG4gICAgY29uc3RydWN0b3Ioc2NlbmU6IFBJWEkuQ29udGFpbmVyLCB4OiBudW1iZXIsIHk6IG51bWJlciwgZm9udFN0eWxlOiBhbnksc3Rha2VGb250U3R5bGU6IGFueSwgZGVub21Cb3R0b206YW55LCBkZW5vbVRvcDphbnksIGRlbm9tTWlkOmFueSwgZGVub21TZWxlY3Q6IGFueSwgZW5hYmxlZF9pbWc6IGFueSwgZGlzX2ltZzogIGFueSwgcHJlc3NlZF9pbWc6IGFueSwgc291bmQ6IGFueSwgYWN0aW9uOiBGdW5jdGlvbil7XHJcbiAgICAgICAgc3VwZXIoc2NlbmUsIHgsIHksIGVuYWJsZWRfaW1nLCBlbmFibGVkX2ltZywgYWN0aW9uKTtcclxuICAgICAgICB0aGlzLmlzU2hvd24gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnNlbGVjdGVkU3Rha2UgPSBuZXcgUElYSS5UZXh0KCcnLCBmb250U3R5bGUpO1xyXG4gICAgICAgIHRoaXMuZm9udFN0eWxlID0gZm9udFN0eWxlO1xyXG4gICAgICAgIHRoaXMuc3Rha2VGb250U3R5bGUgPSBzdGFrZUZvbnRTdHlsZTtcclxuICAgICAgICB0aGlzLmRlbm9tUGFydENvbnRhaW5lcnMgPSBbXTtcclxuICAgICAgICBpZiAodHlwZW9mICBkZW5vbUJvdHRvbSA9PT0gXCJzdHJpbmdcIiAmJiB0eXBlb2YgZGVub21Ub3AgPT09IFwic3RyaW5nXCIgJiYgdHlwZW9mIGRlbm9tTWlkID09PSBcInN0cmluZ1wiICYmIHR5cGVvZiBkZW5vbVNlbGVjdCA9PT0gXCJzdHJpbmdcIiApe1xyXG4gICAgICAgICAgICB0aGlzLmRlbm9tQm90dG9tID0gUElYSS5UZXh0dXJlLmZyb21JbWFnZShkZW5vbUJvdHRvbSk7XHJcbiAgICAgICAgICAgIHRoaXMuZGVub21Ub3AgICAgPSBQSVhJLlRleHR1cmUuZnJvbUltYWdlKGRlbm9tVG9wKTtcclxuICAgICAgICAgICAgdGhpcy5kZW5vbU1pZGRsZSA9IFBJWEkuVGV4dHVyZS5mcm9tSW1hZ2UoZGVub21NaWQpO1xyXG4gICAgICAgICAgICB0aGlzLmRlbm9tU2VsZWN0ZWQgPSBQSVhJLlRleHR1cmUuZnJvbUltYWdlKGRlbm9tU2VsZWN0KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmRlbm9tQm90dG9tICAgPSBkZW5vbUJvdHRvbTtcclxuICAgICAgICAgICAgdGhpcy5kZW5vbVRvcCAgICAgID0gZGVub21Ub3A7XHJcbiAgICAgICAgICAgIHRoaXMuZGVub21NaWRkbGUgICA9IGRlbm9tTWlkO1xyXG4gICAgICAgICAgICB0aGlzLmRlbm9tU2VsZWN0ZWQgPSBkZW5vbVNlbGVjdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5lbmFibGVFdmVudFByb3BhZ2luYXRpb24oKTtcclxuICAgICAgICB0aGlzLmdldFN0YWtlcygpO1xyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZURlbm9taW5hdGlvblBhbmVsKCk7XHJcbiAgICAgICAgdGhpcy5pbnRpdGlhbGl6ZUN1cnJlbnRTdGFrZSgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGluaXRpYWxpemVEZW5vbWluYXRpb25QYW5lbCgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmRlbm9tU3ByaXRlQm90dG9tID0gbmV3IFBJWEkuU3ByaXRlKHRoaXMuZGVub21Cb3R0b20pO1xyXG4gICAgICAgIHRoaXMuZGVub21TcHJpdGVNaWRkbGUgPSBuZXcgUElYSS5TcHJpdGUodGhpcy5kZW5vbU1pZGRsZSk7XHJcbiAgICAgICAgdGhpcy5kZW5vbVNwcml0ZVRvcCAgICA9IG5ldyBQSVhJLlNwcml0ZSh0aGlzLmRlbm9tVG9wKTtcclxuICAgICAgICB0aGlzLmRlbm9tU3ByaXRlU2VsZWN0ZWQgPSBuZXcgUElYSS5TcHJpdGUodGhpcy5kZW5vbVNlbGVjdGVkKTtcclxuXHJcbiAgICAgICAgdGhpcy5kZW5vbVBhbmVsQ29udGFpbmVyID0gbmV3IFBJWEkuQ29udGFpbmVyKCk7XHJcbiAgICAgICAgdGhpcy5kZW5vbVBhbmVsQ29udGFpbmVyLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmRlbm9tUGFuZWxDb250YWluZXIuYWxwaGEgPSAwO1xyXG4gICAgICAgIHRoaXMuZGVub21QYW5lbENvbnRhaW5lci54ID0gdGhpcy5zcHJpdGUueCAtIHRoaXMuc3ByaXRlLndpZHRoLzI7XHJcbiAgICAgICAgdGhpcy5kZW5vbVBhbmVsQ29udGFpbmVyLnkgPSAodGhpcy5zcHJpdGUueSAtIHRoaXMuc3ByaXRlLmhlaWdodC8yKSAtIHRoaXMuZGVub21TcHJpdGVUb3AuaGVpZ2h0IC0gKHRoaXMuZGVub21TcHJpdGVNaWRkbGUuaGVpZ2h0Kih0aGlzLnN0YWtlcy5sZW5ndGgtMikpIC0gdGhpcy5kZW5vbVNwcml0ZUJvdHRvbS5oZWlnaHQ7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGk9MDsgaTx0aGlzLnN0YWtlcy5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkRGVub21QYW5lbFBhcnQoaSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2NlbmUuYWRkQ2hpbGQodGhpcy5kZW5vbVBhbmVsQ29udGFpbmVyKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFkZERlbm9tUGFuZWxQYXJ0KGluZGV4KSB7XHJcbiAgICAgICAgbGV0IHBhcnRDb250YWluZXIgPSBuZXcgUElYSS5Db250YWluZXIoKSxcclxuICAgICAgICAgICAgc3Rha2UgPSBuZXcgUElYSS5UZXh0KHV0aWxzLmZvcm1hdFN0YWtlQW1vdW50KHRoaXMuc3Rha2VzW2luZGV4XSksIHRoaXMuZm9udFN0eWxlKSxcclxuICAgICAgICAgICAgcGFydFNwcml0ZTtcclxuXHJcbiAgICAgICAgc3Rha2UuYW5jaG9yLnNldCgwLjUsIDAuNSk7XHJcbiAgICAgICAgc3Rha2UueCA9IHRoaXMuZGVub21TcHJpdGVNaWRkbGUud2lkdGgvMjtcclxuICAgICAgICBzdGFrZS55ID0gdGhpcy5kZW5vbVNwcml0ZU1pZGRsZS5oZWlnaHQvMjtcclxuXHJcbiAgICAgICAgaWYgKGluZGV4ID09IDApe1xyXG4gICAgICAgICAgICBwYXJ0U3ByaXRlID0gdGhpcy5kZW5vbVNwcml0ZVRvcDtcclxuICAgICAgICAgICAgc3Rha2UueSA9IHBhcnRTcHJpdGUuaGVpZ2h0IC0gdGhpcy5kZW5vbVNwcml0ZU1pZGRsZS5oZWlnaHQvMjtcclxuICAgICAgICAgICAgcGFydENvbnRhaW5lci55ID0gMDtcclxuICAgICAgICB9IGVsc2UgaWYgKGluZGV4ID09IHRoaXMuc3Rha2VzLmxlbmd0aC0xKSB7XHJcbiAgICAgICAgICAgIHBhcnRTcHJpdGUgPSB0aGlzLmRlbm9tU3ByaXRlQm90dG9tO1xyXG4gICAgICAgICAgICBwYXJ0Q29udGFpbmVyLnkgPSB0aGlzLmRlbm9tU3ByaXRlVG9wLmhlaWdodCArICh0aGlzLmRlbm9tU3ByaXRlTWlkZGxlLmhlaWdodCAqICh0aGlzLnN0YWtlcy5sZW5ndGgtMikpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBhcnRTcHJpdGUgPSBuZXcgUElYSS5TcHJpdGUodGhpcy5kZW5vbU1pZGRsZSk7XHJcbiAgICAgICAgICAgIHBhcnRDb250YWluZXIueSA9IHRoaXMuZGVub21TcHJpdGVUb3AuaGVpZ2h0ICsgKHRoaXMuZGVub21TcHJpdGVNaWRkbGUuaGVpZ2h0ICogKGluZGV4LTEpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zdGFrZXNZcG9zLnB1c2gocGFydENvbnRhaW5lci55ICsgc3Rha2UueSk7XHJcbiAgICAgICAgcGFydENvbnRhaW5lci5hZGRDaGlsZChwYXJ0U3ByaXRlKTtcclxuXHJcbiAgICAgICAgcGFydENvbnRhaW5lci5pbnRlcmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgcGFydENvbnRhaW5lci5vbigncG9pbnRlcmRvd24nLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICB0aGlzLmNoYW5nZVN0YWtlKHRoaXMuc3Rha2VzW2luZGV4XSk7XHJcblxyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHBhcnRDb250YWluZXIuYWRkQ2hpbGQoc3Rha2UpO1xyXG4gICAgICAgIHRoaXMuZGVub21QYXJ0Q29udGFpbmVycy5wdXNoKHBhcnRDb250YWluZXIpO1xyXG4gICAgICAgIHRoaXMuZGVub21QYW5lbENvbnRhaW5lci5hZGRDaGlsZChwYXJ0Q29udGFpbmVyKVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0U3Rha2VzKCkge1xyXG4gICAgICAgIHRoaXMuc3Rha2VzID0gWzIwLCA0MCwgNjAsIDgwLCAxMDBdLnJldmVyc2UoKTtcclxuICAgICAgICB0aGlzLmN1cnJlbnRTdGFrZUFtb3VudCA9IHRoaXMuc3Rha2VzWzBdO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaW50aXRpYWxpemVDdXJyZW50U3Rha2UoKSB7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZFN0YWtlID0gbmV3IFBJWEkuVGV4dCh1dGlscy5mb3JtYXRTdGFrZUFtb3VudCh0aGlzLmN1cnJlbnRTdGFrZUFtb3VudCksIHRoaXMuc3Rha2VGb250U3R5bGUpO1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRTdGFrZS5hbmNob3Iuc2V0KDAuNSwgMC41KTtcclxuICAgICAgICB0aGlzLnNlbGVjdGVkU3Rha2UueCA9IHRoaXMuc3ByaXRlLng7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZFN0YWtlLnkgPSB0aGlzLnNwcml0ZS55KzU7IC8vICs1IGR1ZSB0byBncmFwaGljcyBpc3N1ZVxyXG4gICAgICAgIHRoaXMuc2NlbmUuYWRkQ2hpbGQodGhpcy5zZWxlY3RlZFN0YWtlKTtcclxuXHJcbiAgICAgICAgdGhpcy5kZW5vbVNwcml0ZVNlbGVjdGVkLmFuY2hvci5zZXQoMC41LCAwLjUpO1xyXG4gICAgICAgIHRoaXMuZGVub21TcHJpdGVTZWxlY3RlZC5hbHBoYSA9IDAuMjtcclxuICAgICAgICB0aGlzLmRlbm9tU3ByaXRlU2VsZWN0ZWQueCA9IHRoaXMuZGVub21TcHJpdGVNaWRkbGUud2lkdGgvMjtcclxuICAgICAgICB0aGlzLmRlbm9tU3ByaXRlU2VsZWN0ZWQueSA9IHRoaXMuZ2V0U2VsZWN0ZWRTdGFrZVlwb3MoKTtcclxuICAgICAgICB0aGlzLmRlbm9tUGFuZWxDb250YWluZXIuYWRkQ2hpbGQodGhpcy5kZW5vbVNwcml0ZVNlbGVjdGVkKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldFNlbGVjdGVkU3Rha2VZcG9zKCk6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IGluZGV4ID0gdGhpcy5zdGFrZXMuaW5kZXhPZih0aGlzLmN1cnJlbnRTdGFrZUFtb3VudCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc3Rha2VzWXBvc1tpbmRleF07XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZW5hYmxlRXZlbnRQcm9wYWdpbmF0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuc3ByaXRlLm9uKCdwb2ludGVyZG93bicsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICB0aGlzLmlzRG93biA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuc291bmQuY3VycmVudFRpbWUgPSAwO1xyXG4gICAgICAgICAgICB0aGlzLnNvdW5kLnBsYXkoKTtcclxuICAgICAgICAgICAgdGhpcy5zcHJpdGUudGV4dHVyZSA9IHRoaXMudGV4dHVyZVByZXNzZWQ7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgdGhpcy5zcHJpdGUub24oJ3BvaW50ZXJ1cCcsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgdGhpcy5zcHJpdGUudGV4dHVyZSA9IHRoaXMudGV4dHVyZUVuYWJsZWQ7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmlzRG93bilcclxuICAgICAgICAgICAgICAgIHRoaXMub25DbGljaygpO1xyXG4gICAgICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNob3dQYW5lbCgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuaXNTaG93bilcclxuICAgICAgICAgICAgYXBwLnRpY2tlci5hZGQoc2hvd1BhbmVsQW5pbWF0aW9uLCB0aGlzKTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2hvd1BhbmVsQW5pbWF0aW9uKHRpbWVkZWx0YTogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVub21QYW5lbENvbnRhaW5lci52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5kZW5vbVBhbmVsQ29udGFpbmVyLmFscGhhID0gTWF0aC5taW4oKHRoaXMuZGVub21QYW5lbENvbnRhaW5lci5hbHBoYSsoMC4wOCp0aW1lZGVsdGEpKSwgMSk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRlbm9tUGFuZWxDb250YWluZXIuYWxwaGEgPT0gMSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc1Nob3duID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2NlbmUuaW50ZXJhY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYXBwLnRpY2tlci5yZW1vdmUoc2hvd1BhbmVsQW5pbWF0aW9uLCB0aGlzKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGhpZGVQYW5lbCgpIHtcclxuICAgICAgICBpZiAodGhpcy5pc1Nob3duKVxyXG4gICAgICAgICAgICBhcHAudGlja2VyLmFkZChoaWRlUGFuZWxBbmltYXRpb24sIHRoaXMpO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBoaWRlUGFuZWxBbmltYXRpb24odGltZWRlbHRhOiBudW1iZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5kZW5vbVBhbmVsQ29udGFpbmVyLmFscGhhID0gTWF0aC5tYXgoKHRoaXMuZGVub21QYW5lbENvbnRhaW5lci5hbHBoYS0oMC4wOCp0aW1lZGVsdGEpKSwgMCk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRlbm9tUGFuZWxDb250YWluZXIuYWxwaGEgPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZW5vbVBhbmVsQ29udGFpbmVyLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaXNTaG93biA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zY2VuZS5pbnRlcmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgYXBwLnRpY2tlci5yZW1vdmUoaGlkZVBhbmVsQW5pbWF0aW9uLCB0aGlzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY2hhbmdlU3Rha2UodG8pIHtcclxuXHJcbiAgICAgICAgbGV0IHRvWSA9IHRoaXMuc3Rha2VzWXBvc1t0aGlzLnN0YWtlcy5pbmRleE9mKHRvKV07XHJcbiAgICAgICAgdGhpcy5zZXRJbnRlcmFjdGl2ZUZvclBhcnRDb250YWluZXJzKGZhbHNlKTtcclxuICAgICAgICB0aGlzLnNlbGVjdGVkU3Rha2UudGV4dCA9ICB1dGlscy5mb3JtYXRTdGFrZUFtb3VudCh0byk7XHJcblxyXG4gICAgICAgIGxldCBjaGFuZ2VTdGFrZUV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KCdjaGFuZ2VTdGFrZUV2ZW50JywgeydkZXRhaWwnOnsnbmV3U3Rha2UnOiB0b319KTtcclxuICAgICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KGNoYW5nZVN0YWtlRXZlbnQpO1xyXG5cclxuICAgICAgICBhcHAudGlja2VyLmFkZChjaGFuZ2VTdGFrZUFuaW1hdGlvbiwgdGhpcyk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNoYW5nZVN0YWtlQW5pbWF0aW9uKHRpbWVkZWx0YTogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRlbm9tU3ByaXRlU2VsZWN0ZWQueSA8IHRvWSl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlbm9tU3ByaXRlU2VsZWN0ZWQueSA9IE1hdGgubWluKHRoaXMuZGVub21TcHJpdGVTZWxlY3RlZC55ICsgdGltZWRlbHRhKjMwLCB0b1kpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuZGVub21TcHJpdGVTZWxlY3RlZC55ID4gdG9ZKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlbm9tU3ByaXRlU2VsZWN0ZWQueSA9IE1hdGgubWF4KHRoaXMuZGVub21TcHJpdGVTZWxlY3RlZC55IC0gdGltZWRlbHRhKjMwLCB0b1kpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U3Rha2VBbW91bnQgPSB0bztcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0SW50ZXJhY3RpdmVGb3JQYXJ0Q29udGFpbmVycyh0cnVlKTtcclxuICAgICAgICAgICAgICAgIGFwcC50aWNrZXIucmVtb3ZlKGNoYW5nZVN0YWtlQW5pbWF0aW9uLCB0aGlzKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXRJbnRlcmFjdGl2ZUZvclBhcnRDb250YWluZXJzKHZhbHVlOiBib29sZWFuKXtcclxuICAgICAgICBmb3IobGV0IGk9MDsgaTx0aGlzLmRlbm9tUGFydENvbnRhaW5lcnMubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgICAgICB0aGlzLmRlbm9tUGFydENvbnRhaW5lcnNbaV0uaW50ZXJhY3RpdmUgPSB2YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59XHJcblxyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSB0YXJhc2cgb24gOS8yOC8yMDE3LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7Q291bnRVcH0gZnJvbSBcIi4uL1V0aWxzL2NvdW50ZXJcIjtcclxuaW1wb3J0IHthcHB9IGZyb20gXCIuLi9tYWluXCI7XHJcbmltcG9ydCB7IGJ1dHRvblJlc291cmNlcyB9IGZyb20gXCIuL2J1dHRvbk5hbWVzXCI7XHJcbmV4cG9ydCBjbGFzcyBOdW1lcmljRmllbGQge1xyXG5cclxuICAgIHB1YmxpYyBmaWVsZEJhY2tHcm91bmQgOiBQSVhJLlRleHR1cmU7XHJcbiAgICBwdWJsaWMgZmllbGRDb250YWluZXI6IFBJWEkuQ29udGFpbmVyO1xyXG4gICAgcHVibGljIHNwcml0ZTogUElYSS5TcHJpdGUgfCBhbnk7XHJcbiAgICBwdWJsaWMgdGV4dFN0eWxlOiBhbnk7XHJcbiAgICBwdWJsaWMgdGV4dDogUElYSS5UZXh0O1xyXG4gICAgcHVibGljIGNvdW50ZXI6IGFueTtcclxuICAgIHB1YmxpYyB4OiBudW1iZXI7XHJcbiAgICBwdWJsaWMgeTogbnVtYmVyO1xyXG4gICAgcHVibGljIHNjZW5lOiBQSVhJLkNvbnRhaW5lcjtcclxuXHJcblxyXG4gICAgY29uc3RydWN0b3Ioc2NlbmU6IFBJWEkuQ29udGFpbmVyLCBuYW1lOnN0cmluZywgeDogbnVtYmVyLCB5OiBudW1iZXIsIHJlc291cmNlczogYW55LCB0ZXh0U3R5bGU6IGFueSwgeF9kZWx0YT0wKSB7XHJcbiAgICAgICAgLy8gZW5hYmxlZF9pbWcsIGRpc19pbWcsIHByZXNzZWRfaW1nOiAgUElYSS5UZXh0dXRyZSBvciBzdHJpbmcgdXJsIHRvIHRoZSBpbWFnZVxyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy55ID0geTtcclxuICAgICAgICB0aGlzLnRleHRTdHlsZSA9IHRleHRTdHlsZTtcclxuICAgICAgICB0aGlzLnNjZW5lID0gc2NlbmU7XHJcbiAgICAgICAgdGhpcy5maWVsZEJhY2tHcm91bmQgID0gIHJlc291cmNlc1tidXR0b25SZXNvdXJjZXNbbmFtZV0uYmFja2dyb3VuZF07XHJcblxyXG5cclxuICAgICAgICB0aGlzLmZpZWxkQ29udGFpbmVyID0gbmV3IFBJWEkuQ29udGFpbmVyKCk7XHJcbiAgICAgICAgdGhpcy5maWVsZENvbnRhaW5lci54ID0gdGhpcy54O1xyXG4gICAgICAgIHRoaXMuZmllbGRDb250YWluZXIueSA9IHRoaXMueTtcclxuXHJcbiAgICAgICAgdGhpcy5zcHJpdGUgPSBuZXcgUElYSS5TcHJpdGUodGhpcy5maWVsZEJhY2tHcm91bmQpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlLmFuY2hvci5zZXQoMC41LCAwLjUpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlLnggPSB0aGlzLnNwcml0ZS53aWR0aC8yO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlLnkgPSB0aGlzLnNwcml0ZS5oZWlnaHQvMjtcclxuICAgICAgICB0aGlzLmZpZWxkQ29udGFpbmVyLmFkZENoaWxkKHRoaXMuc3ByaXRlKTtcclxuXHJcbiAgICAgICAgLy8gYWRkIHRleHRcclxuICAgICAgICB0aGlzLnRleHQgPSBuZXcgUElYSS5UZXh0KCcnLCB0aGlzLnRleHRTdHlsZSk7XHJcbiAgICAgICAgdGhpcy5maWVsZENvbnRhaW5lci5hZGRDaGlsZCh0aGlzLnRleHQpO1xyXG4gICAgICAgIHRoaXMudGV4dC5hbmNob3Iuc2V0KDAuNSwgMC41KTtcclxuICAgICAgICB0aGlzLnRleHQueCA9IHRoaXMuc3ByaXRlLngreF9kZWx0YTtcclxuICAgICAgICB0aGlzLnRleHQueSA9IHRoaXMuc3ByaXRlLnk7XHJcblxyXG4gICAgICAgIHRoaXMuc2NlbmUuYWRkQ2hpbGQodGhpcy5maWVsZENvbnRhaW5lcik7XHJcblxyXG4gICAgICAgIC8vIGNvdW50ZXJcclxuICAgICAgICB0aGlzLmNvdW50ZXIgPSBuZXcgQ291bnRVcCh0aGlzLnRleHQsIDAuMCwgMC4wLCAyLCAwLjUsIHt9KTtcclxuICAgICAgICB0aGlzLnNwcml0ZS5tb2RlbCA9IHRoaXM7XHJcblxyXG5cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWRkVmFsdWUodmFsdWU6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuY291bnRlci51cGRhdGUodGhpcy5jb3VudGVyLmVuZFZhbCt2YWx1ZS8xMDApO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdWJzdHJhY3RWYWx1ZSh2YWx1ZTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5jb3VudGVyLnVwZGF0ZSh0aGlzLmNvdW50ZXIuZW5kVmFsIC0gdmFsdWUvMTAwKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY291bnRUaWxsKHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmNvdW50ZXIudXBkYXRlKHZhbHVlLzEwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGhpZGUoKSB7XHJcbiAgICAgICAgdGhpcy5maWVsZENvbnRhaW5lci52aXNpYmxlID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNob3coKSB7XHJcbiAgICAgICAgdGhpcy5maWVsZENvbnRhaW5lci52aXNpYmxlID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBCYWxhbmNlRmllbGRXaXRoSGlkZUNyZWRpdHNBbmltYXRpb24gZXh0ZW5kcyBOdW1lcmljRmllbGQge1xyXG5cclxuICAgIHB1YmxpYyBzaG93X2NyZWRpdHNfc3ByaXRlOiBQSVhJLlNwcml0ZTtcclxuICAgIHB1YmxpYyBzaG93X2NyZWRpdHNfdGV4dHVyZSA6IFBJWEkuVGV4dHVyZTtcclxuICAgIHB1YmxpYyBoaWRlX2NyZWRpdHNfc3ByaXRlOiBQSVhJLlNwcml0ZTtcclxuICAgIHB1YmxpYyBoaWRlX2NyZWRpdHNfdGV4dHVyZTogUElYSS5UZXh0dXJlO1xyXG4gICAgcHJpdmF0ZSBjb250YWluZXJNYXNrOiBQSVhJLkdyYXBoaWNzO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHNjZW5lOiBQSVhJLkNvbnRhaW5lciwgbmFtZTpzdHJpbmcsIHg6IG51bWJlciwgeTogbnVtYmVyLCByZXNvdXJjZXM6YW55LCB0ZXh0U3R5bGU6IGFueSl7XHJcbiAgICAgICAgc3VwZXIoc2NlbmUsIG5hbWUsIHgsIHksIHJlc291cmNlcywgdGV4dFN0eWxlKTtcclxuXHJcbiAgICAgICAgdGhpcy5zaG93X2NyZWRpdHNfdGV4dHVyZSAgPSAgcmVzb3VyY2VzW2J1dHRvblJlc291cmNlc1tuYW1lXS5zaG93X2NyZWRpdHNdO1xyXG4gICAgICAgIHRoaXMuaGlkZV9jcmVkaXRzX3RleHR1cmUgPSByZXNvdXJjZXNbYnV0dG9uUmVzb3VyY2VzW25hbWVdLmhpZGVfY3JlZGl0c107XHJcblxyXG4gICAgICAgIC8vIGFkZCBwcmVzcyB0byBoaWRlIGltZyB0ZXh0XHJcbiAgICAgICAgdGhpcy5oaWRlX2NyZWRpdHNfc3ByaXRlID0gbmV3IFBJWEkuU3ByaXRlKHRoaXMuaGlkZV9jcmVkaXRzX3RleHR1cmUpO1xyXG4gICAgICAgIHRoaXMuaGlkZV9jcmVkaXRzX3Nwcml0ZS5hbmNob3Iuc2V0KDAuNSwgMC41KTtcclxuICAgICAgICB0aGlzLmhpZGVfY3JlZGl0c19zcHJpdGUueCA9IHRoaXMuc3ByaXRlLndpZHRoLzI7XHJcbiAgICAgICAgdGhpcy5oaWRlX2NyZWRpdHNfc3ByaXRlLnkgPSB0aGlzLnNwcml0ZS5oZWlnaHQvMiArIDI1O1xyXG4gICAgICAgIHRoaXMuZmllbGRDb250YWluZXIuYWRkQ2hpbGQodGhpcy5oaWRlX2NyZWRpdHNfc3ByaXRlKTtcclxuXHJcbiAgICAgICAgLy8gYWRkIHNob3cgY3JlZGl0IGltYWdlXHJcbiAgICAgICAgdGhpcy5zaG93X2NyZWRpdHNfc3ByaXRlID0gbmV3IFBJWEkuU3ByaXRlKHRoaXMuc2hvd19jcmVkaXRzX3RleHR1cmUpO1xyXG4gICAgICAgIHRoaXMuc2hvd19jcmVkaXRzX3Nwcml0ZS5hbmNob3Iuc2V0KDAuNSwgMC41KTtcclxuICAgICAgICB0aGlzLnNob3dfY3JlZGl0c19zcHJpdGUueCA9IHRoaXMuc2hvd19jcmVkaXRzX3Nwcml0ZS53aWR0aC8yO1xyXG4gICAgICAgIHRoaXMuc2hvd19jcmVkaXRzX3Nwcml0ZS55ID0gdGhpcy5zaG93X2NyZWRpdHNfc3ByaXRlLmhlaWdodC8yIC0gdGhpcy5zaG93X2NyZWRpdHNfc3ByaXRlLmhlaWdodDtcclxuICAgICAgICB0aGlzLnNob3dfY3JlZGl0c19zcHJpdGUuaW50ZXJhY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuc2hvd19jcmVkaXRzX3Nwcml0ZS5idXR0b25Nb2RlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnNob3dfY3JlZGl0c19zcHJpdGUub24oJ3BvaW50ZXJkb3duJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLnNob3dDcmVkaXRzKCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLmZpZWxkQ29udGFpbmVyLmFkZENoaWxkKHRoaXMuc2hvd19jcmVkaXRzX3Nwcml0ZSk7XHJcblxyXG4gICAgICAgIC8vICAgIE1BU0s6XHJcbiAgICAgICAgdGhpcy5jb250YWluZXJNYXNrID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcclxuICAgICAgICB0aGlzLmluaXRpYWxpemVNYXNrKCk7XHJcblxyXG4gICAgICAgIHRoaXMuc3ByaXRlLmludGVyYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnNwcml0ZS5idXR0b25Nb2RlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnNwcml0ZS5vbigncG9pbnRlcmRvd24nLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGlkZUNyZWRpdHMoKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpbml0aWFsaXplTWFzaygpIHtcclxuICAgICAgICB0aGlzLnNjZW5lLmFkZENoaWxkKHRoaXMuY29udGFpbmVyTWFzayk7XHJcbiAgICAgICAgdGhpcy5maWVsZENvbnRhaW5lci5tYXNrID0gdGhpcy5jb250YWluZXJNYXNrO1xyXG4gICAgICAgIHRoaXMuY29udGFpbmVyTWFzay5saW5lU3R5bGUoMCk7XHJcbiAgICAgICAgdGhpcy5jb250YWluZXJNYXNrLnggPSB0aGlzLmZpZWxkQ29udGFpbmVyLng7XHJcbiAgICAgICAgdGhpcy5jb250YWluZXJNYXNrLnkgPSB0aGlzLmZpZWxkQ29udGFpbmVyLnk7XHJcblxyXG5cclxuXHJcbiAgICAgICAgdGhpcy5jb250YWluZXJNYXNrLmJlZ2luRmlsbCgweDhiYzVmZik7XHJcbiAgICAgICAgbGV0IG1hc2tfeCA9IHRoaXMuc2hvd19jcmVkaXRzX3Nwcml0ZS54IC0gKHRoaXMuc2hvd19jcmVkaXRzX3Nwcml0ZS53aWR0aC8yKSxcclxuICAgICAgICAgICAgbWFza195ID0gdGhpcy5zaG93X2NyZWRpdHNfc3ByaXRlLnkgKyAodGhpcy5zaG93X2NyZWRpdHNfc3ByaXRlLmhlaWdodC8yKTtcclxuICAgICAgICB0aGlzLmNvbnRhaW5lck1hc2suZHJhd1JlY3QobWFza194LCBtYXNrX3ksIHRoaXMuZmllbGRDb250YWluZXIud2lkdGgsIHRoaXMuc2hvd19jcmVkaXRzX3Nwcml0ZS5oZWlnaHQpO1xyXG5cclxuICAgICAgICAgdGhpcy5jb250YWluZXJNYXNrLmVuZEZpbGwoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaGlkZUNyZWRpdHMoKSB7XHJcblxyXG4gICAgICAgIGFwcC50aWNrZXIuYWRkKGhpZGVDcmVkaXRzQW5pbWF0aW9uLCB0aGlzKTtcclxuXHJcbiAgICAgICAgIGZ1bmN0aW9uIGhpZGVDcmVkaXRzQW5pbWF0aW9uKHRpbWVkZWx0YTogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgICB0aGlzLnNob3dfY3JlZGl0c19zcHJpdGUuaW50ZXJhY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgIHRoaXMuc3ByaXRlLmludGVyYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICBpZiAodGhpcy5zaG93X2NyZWRpdHNfc3ByaXRlLnkgPCB0aGlzLnNwcml0ZS55KSB7XHJcbiAgICAgICAgICAgICAgICAgdGhpcy5zaG93X2NyZWRpdHNfc3ByaXRlLnkgPSBNYXRoLm1pbigodGhpcy5zaG93X2NyZWRpdHNfc3ByaXRlLnkrIDUqdGltZWRlbHRhKSwgdGhpcy5zcHJpdGUueSlcclxuXHJcbiAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgIGFwcC50aWNrZXIucmVtb3ZlKGhpZGVDcmVkaXRzQW5pbWF0aW9uLCB0aGlzKTtcclxuICAgICAgICAgICAgICAgICB0aGlzLnNob3dfY3JlZGl0c19zcHJpdGUuaW50ZXJhY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlLmludGVyYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNob3dDcmVkaXRzKCkge1xyXG5cclxuICAgICAgICBhcHAudGlja2VyLmFkZChzaG93Q3JlZGl0c0FuaW1hdGlvbiwgdGhpcyk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNob3dDcmVkaXRzQW5pbWF0aW9uKHRpbWVkZWx0YTogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd19jcmVkaXRzX3Nwcml0ZS5pbnRlcmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLnNwcml0ZS5pbnRlcmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zaG93X2NyZWRpdHNfc3ByaXRlLnkrdGhpcy5zaG93X2NyZWRpdHNfc3ByaXRlLmhlaWdodCA+IHRoaXMuc3ByaXRlLnkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd19jcmVkaXRzX3Nwcml0ZS55IC09IDUqdGltZWRlbHRhXHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93X2NyZWRpdHNfc3ByaXRlLnkgPSB0aGlzLnNwcml0ZS55IC0gdGhpcy5zaG93X2NyZWRpdHNfc3ByaXRlLmhlaWdodDtcclxuICAgICAgICAgICAgICAgIGFwcC50aWNrZXIucmVtb3ZlKHNob3dDcmVkaXRzQW5pbWF0aW9uLCB0aGlzKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaXNTaG93biA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dfY3JlZGl0c19zcHJpdGUuaW50ZXJhY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zcHJpdGUuaW50ZXJhY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsImV4cG9ydCBsZXQgYnV0dG9uUmVzb3VyY2VzID0ge1xuICAgICdTdGFydEJ1dHRvbicgOiB7XG4gICAgICAgICdlbmFibGVkJzogJ0JUTl9TcGluJyxcbiAgICAgICAgJ2Rpc2FibGVkJzogJ0JUTl9TcGluX2QnLFxuICAgICAgICAncHJlc3NlZCc6ICdCVE5fU3Bpbl9kJ1xuICAgIH0sXG4gICAgJ1N0b3BCdXR0b24nIDoge1xuICAgICAgICAnZW5hYmxlZCc6ICdCVE5fU3BpbicsXG4gICAgICAgICdkaXNhYmxlZCc6ICdCVE5fU3Bpbl9kJyxcbiAgICAgICAgJ3ByZXNzZWQnOiAnQlROX1NwaW5fZCdcbiAgICB9LFxuICAgICdCYWxhbmNlRmllbGQnOiB7XG4gICAgICAgICdiYWNrZ3JvdW5kJzogJ2JhbGFuY2UnLFxuICAgICAgICAnc2hvd19jcmVkaXRzJzogJ3Nob3dfY3JlZGl0JyxcbiAgICAgICAgJ2hpZGVfY3JlZGl0cyc6ICdoaWRlX2NyZWRpdHMnXG4gICAgfSxcbiAgICAnVG90YWxXaW4nOiB7XG4gICAgICAgICdiYWNrZ3JvdW5kJzogJ3R3J1xuICAgIH1cbn0iLCIvKipcclxuICogQ3JlYXRlZCBieSB0YXJhc2cgb24gMTAvMTEvMjAxNy5cclxuICovXHJcblxyXG4vLyBpbXBvcnQgKiBhcyBBbmltYXRpb25zIGZyb20gXCIuLi9VdGlscy9hbmltYXRpb25fb2JqZWN0c1wiO1xyXG5pbXBvcnQgKiBhcyB1dGlscyBmcm9tIFwiLi4vVXRpbHMvaGVscGVyRnVuY3NcIlxyXG5pbXBvcnQgKiBhcyBjb25maWcgZnJvbSBcIi4vcmVlbHNDb25maWdcIlxyXG5cclxuXHJcbi8vIGV4cG9ydCBsZXQgU3ltYm9sc1RleHR1cmU6ICAgIFBJWEkuQmFzZVRleHR1cmUgPSBQSVhJLkJhc2VUZXh0dXJlLmZyb21JbWFnZSgnLi4vTWVkaWEvc3ltYm9scy5wbmcnKSxcclxuLy8gICAgIEJsYXppbmdUZXh0dXJlOiAgICBQSVhJLlRleHR1cmUgICAgID0gbmV3IFBJWEkuVGV4dHVyZShTeW1ib2xzVGV4dHVyZSwgbmV3IFBJWEkuUmVjdGFuZ2xlKDAsMCwgY29uZmlnLnN5bWJvbFdpZHRoLCBjb25maWcuc3ltYm9sSGVpZ2h0KSksXHJcbi8vICAgICBTZXZlblRleHR1cmU6ICAgICAgUElYSS5UZXh0dXJlICAgICA9IG5ldyBQSVhJLlRleHR1cmUoU3ltYm9sc1RleHR1cmUsIG5ldyBQSVhJLlJlY3RhbmdsZSgwLDIzNywgY29uZmlnLnN5bWJvbFdpZHRoLCBjb25maWcuc3ltYm9sSGVpZ2h0KSksXHJcbi8vICAgICBXYXRlcm1lbG9uVGV4dHVyZTogUElYSS5UZXh0dXJlICAgICA9IG5ldyBQSVhJLlRleHR1cmUoU3ltYm9sc1RleHR1cmUsIG5ldyBQSVhJLlJlY3RhbmdsZSgwLDQ3NCwgY29uZmlnLnN5bWJvbFdpZHRoLCBjb25maWcuc3ltYm9sSGVpZ2h0KSksXHJcbi8vICAgICBQbHVtVGV4dHVyZTogICAgICAgUElYSS5UZXh0dXJlICAgICA9IG5ldyBQSVhJLlRleHR1cmUoU3ltYm9sc1RleHR1cmUsIG5ldyBQSVhJLlJlY3RhbmdsZSgwLDcxMSwgY29uZmlnLnN5bWJvbFdpZHRoLCBjb25maWcuc3ltYm9sSGVpZ2h0KSksXHJcbi8vICAgICBPcmFuZ2VUZXh0dXJlOiAgICAgUElYSS5UZXh0dXJlICAgICA9IG5ldyBQSVhJLlRleHR1cmUoU3ltYm9sc1RleHR1cmUsIG5ldyBQSVhJLlJlY3RhbmdsZSgwLDk0OCwgY29uZmlnLnN5bWJvbFdpZHRoLCBjb25maWcuc3ltYm9sSGVpZ2h0KSksXHJcbi8vICAgICBMZW1vblRleHR1cmU6ICAgICAgUElYSS5UZXh0dXJlICAgICA9IG5ldyBQSVhJLlRleHR1cmUoU3ltYm9sc1RleHR1cmUsIG5ldyBQSVhJLlJlY3RhbmdsZSgwLDExODUsIGNvbmZpZy5zeW1ib2xXaWR0aCwgY29uZmlnLnN5bWJvbEhlaWdodCkpLFxyXG4vLyAgICAgQ2hlcnJ5VGV4dHVyZTogICAgIFBJWEkuVGV4dHVyZSAgICAgPSBuZXcgUElYSS5UZXh0dXJlKFN5bWJvbHNUZXh0dXJlLCBuZXcgUElYSS5SZWN0YW5nbGUoMCwxNDIyLCBjb25maWcuc3ltYm9sV2lkdGgsIGNvbmZpZy5zeW1ib2xIZWlnaHQpKSxcclxuLy8gICAgIEJvbnVzVGV4dHVyZTogICAgICBQSVhJLlRleHR1cmUgICAgID0gbmV3IFBJWEkuVGV4dHVyZShTeW1ib2xzVGV4dHVyZSwgbmV3IFBJWEkuUmVjdGFuZ2xlKDAsMTY1OSwgY29uZmlnLnN5bWJvbFdpZHRoLCBjb25maWcuc3ltYm9sSGVpZ2h0KSksXHJcbi8vICAgICBXaWxkVGV4dHVyZTogICAgICAgUElYSS5UZXh0dXJlICAgICA9IG5ldyBQSVhJLlRleHR1cmUoU3ltYm9sc1RleHR1cmUsIG5ldyBQSVhJLlJlY3RhbmdsZSgwLDE4OTYsIGNvbmZpZy5zeW1ib2xXaWR0aCwgY29uZmlnLnN5bWJvbEhlaWdodCkpLFxyXG4vLyAgICAgQmxhemluZ1NwaXRlICAgICAgID0gKCkgPT4gbmV3IFBJWEkuU3ByaXRlKEJsYXppbmdUZXh0dXJlKSxcclxuLy8gICAgIFNldmVuU3BpdGUgICAgICAgICA9ICgpID0+IG5ldyBQSVhJLlNwcml0ZShTZXZlblRleHR1cmUpLFxyXG4vLyAgICAgV2F0ZXJtZWxvblNwcml0ZSAgID0gKCkgPT4gbmV3IFBJWEkuU3ByaXRlKFdhdGVybWVsb25UZXh0dXJlKSxcclxuLy8gICAgIFBsdW1TcHJpdGUgICAgICAgICA9ICgpID0+IG5ldyBQSVhJLlNwcml0ZShQbHVtVGV4dHVyZSksXHJcbi8vICAgICBPcmFuZ2VTcHJpdGUgICAgICAgPSAoKSA9PiBuZXcgUElYSS5TcHJpdGUoT3JhbmdlVGV4dHVyZSksXHJcbi8vICAgICBMZW1vblNwcml0ZSAgICAgICAgPSAoKSA9PiBuZXcgUElYSS5TcHJpdGUoTGVtb25UZXh0dXJlKSxcclxuLy8gICAgIENoZXJyeVNwcml0ZSAgICAgICA9ICgpID0+IG5ldyBQSVhJLlNwcml0ZShDaGVycnlUZXh0dXJlKSxcclxuLy8gICAgIEJvbnVzU3ByaXRlICAgICAgICA9ICgpID0+IG5ldyBQSVhJLlNwcml0ZShCb251c1RleHR1cmUpLFxyXG4vLyAgICAgV2lsZFNwcml0ZSAgICAgICAgID0gKCkgPT4gbmV3IFBJWEkuU3ByaXRlKFdpbGRUZXh0dXJlKSxcclxuLy8gICAgIEJsYXppbmdXaW5TaG93ICAgICA9ICgpID0+IHV0aWxzLkNyZWF0ZUFuaW1hdGlvbihQSVhJLkJhc2VUZXh0dXJlLmZyb21JbWFnZSgnLi4vTWVkaWEvYW5pbWF0aW9ucy93aW5zaG93L2JmL3dpbnNob3dCRi5wbmcnKSwgQW5pbWF0aW9ucy5iZl93aW5zaG93X2FuaW0pLFxyXG4vLyAgICAgU2V2ZW5XaW5TaG93ICAgICAgID0gKCkgPT4gdXRpbHMuQ3JlYXRlQW5pbWF0aW9uKFBJWEkuQmFzZVRleHR1cmUuZnJvbUltYWdlKCcuLi9NZWRpYS9hbmltYXRpb25zL3dpbnNob3cvc2V2ZW4vd2luc2hvd1NldmVuLnBuZycpLCBBbmltYXRpb25zLnNldmVuX3dpbnNob3dfYW5pbSksXHJcbi8vICAgICBXYXRlcm1lbG9uV2luU2hvdyAgPSAoKSA9PiB1dGlscy5DcmVhdGVBbmltYXRpb24oUElYSS5CYXNlVGV4dHVyZS5mcm9tSW1hZ2UoJy4uL01lZGlhL2FuaW1hdGlvbnMvd2luc2hvdy93bS93aW5zaG93V00ucG5nJyksIEFuaW1hdGlvbnMud21fd2luc2hvd19hbmltKSxcclxuLy8gICAgIFBsdW1XaW5TaG93ICAgICAgICA9ICgpID0+IHV0aWxzLkNyZWF0ZUFuaW1hdGlvbihQSVhJLkJhc2VUZXh0dXJlLmZyb21JbWFnZSgnLi4vTWVkaWEvYW5pbWF0aW9ucy93aW5zaG93L3BsdW0vd2luc2hvd1BsdW0ucG5nJyksIEFuaW1hdGlvbnMucGx1bV93aW5zaG93X2FuaW0pLFxyXG4vLyAgICAgT3JhbmdlV2luU2hvdyAgICAgID0gKCkgPT4gdXRpbHMuQ3JlYXRlQW5pbWF0aW9uKFBJWEkuQmFzZVRleHR1cmUuZnJvbUltYWdlKCcuLi9NZWRpYS9hbmltYXRpb25zL3dpbnNob3cvb3JhbmdlL3dpbnNob3dPcmFuZ2UucG5nJyksIEFuaW1hdGlvbnMub3JhbmdlX3dpbnNob3dfYW5pbSksXHJcbi8vICAgICBMZW1vbldpblNob3cgICAgICAgPSAoKSA9PiB1dGlscy5DcmVhdGVBbmltYXRpb24oUElYSS5CYXNlVGV4dHVyZS5mcm9tSW1hZ2UoJy4uL01lZGlhL2FuaW1hdGlvbnMvd2luc2hvdy9sZW1vbi93aW5zaG93TGVtb24ucG5nJyksIEFuaW1hdGlvbnMubGVtb25fd2luc2hvd19hbmltKSxcclxuLy8gICAgIENoZXJyeVdpblNob3cgICAgICA9ICgpID0+IHV0aWxzLkNyZWF0ZUFuaW1hdGlvbihQSVhJLkJhc2VUZXh0dXJlLmZyb21JbWFnZSgnLi4vTWVkaWEvYW5pbWF0aW9ucy93aW5zaG93L2NoZXJyeS93aW5zaG93Q2hlcnJ5LnBuZycpLCBBbmltYXRpb25zLmNoZXJyeV93aW5zaG93X2FuaW0pLFxyXG4vLyAgICAgQm9udXNXaW5TaG93ICAgICAgID0gKCkgPT4gdXRpbHMuQ3JlYXRlQW5pbWF0aW9uKFBJWEkuQmFzZVRleHR1cmUuZnJvbUltYWdlKCcuLi9NZWRpYS9hbmltYXRpb25zL3dpbnNob3cvYm9udXMvd2luc2hvd0JvbnVzLnBuZycpLCBBbmltYXRpb25zLmJvbnVzX3dpbnNob3dfYW5pbSksXHJcbi8vICAgICBXaWxkV2luU2hvdyAgICAgICAgPSAoKSA9PiB1dGlscy5DcmVhdGVBbmltYXRpb24oUElYSS5CYXNlVGV4dHVyZS5mcm9tSW1hZ2UoJy4uL01lZGlhL2FuaW1hdGlvbnMvd2luc2hvdy93aWxkL3dpbnNob3dXaWxkLnBuZycpLCBBbmltYXRpb25zLndpbGRfd2luc2hvd19hbmltKTtcclxuXHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElTeW1ib2wge1xyXG4gICAgbmFtZTogc3RyaW5nLFxyXG4gICAgcmVlbFZhbHVlOiBudW1iZXIsXHJcblxyXG59XHJcblxyXG5cclxuZXhwb3J0IGNvbnN0IFN5bWJvbDE6IElTeW1ib2wgPSB7XHJcbiAgICBuYW1lOiAnU1lNMScsXHJcbiAgICByZWVsVmFsdWU6IDFcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBTeW1ib2wzOiBJU3ltYm9sID0ge1xyXG4gICAgbmFtZTogJ1NZTTMnLFxyXG4gICAgcmVlbFZhbHVlOiAzXHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgU3ltYm9sNDogSVN5bWJvbCA9IHtcclxuICAgIG5hbWU6ICdTWU00JyxcclxuICAgIHJlZWxWYWx1ZTogNFxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IFN5bWJvbDU6IElTeW1ib2wgPSB7XHJcbiAgICBuYW1lOiAnU1lNNScsXHJcbiAgICByZWVsVmFsdWU6IDVcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBTeW1ib2w2OiBJU3ltYm9sID0ge1xyXG4gICAgbmFtZTogJ1NZTTYnLFxyXG4gICAgcmVlbFZhbHVlOiA2XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgU3ltYm9sNzogSVN5bWJvbCA9IHtcclxuICAgIG5hbWU6ICdTWU03JyxcclxuICAgIHJlZWxWYWx1ZTogN1xyXG59O1xyXG5cclxuXHJcblxyXG5leHBvcnQgY29uc3QgU1lNQk9MUyA9IFtTeW1ib2wxLCBTeW1ib2wzLCBTeW1ib2w0LCBTeW1ib2w1LCBTeW1ib2w2LCBTeW1ib2w3XTtcclxuZXhwb3J0IGNvbnN0IHNob3dTeW1ib2xzID0gW1N5bWJvbDEsIFN5bWJvbDMsIFN5bWJvbDQsIFN5bWJvbDUsIFN5bWJvbDYsIFN5bWJvbDddOyIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IHRhcmFzZyBvbiAxMC8xMy8yMDE3LlxyXG4gKi9cclxuXHJcblxyXG5pbXBvcnQgKiBhcyBjb25maWcgZnJvbSBcIi4uL1JlZWxTcGlubmVyL3JlZWxzQ29uZmlnXCJcclxuaW1wb3J0IHtJU3ltYm9sLCBTWU1CT0xTfSBmcm9tIFwiLi9NYWluUm91bmRTeW1ib2xzXCI7XHJcbmltcG9ydCB7YXBwfSBmcm9tIFwiLi4vbWFpblwiO1xyXG5pbXBvcnQge1JlZWxTZXR9IGZyb20gXCIuL1JlZWxTZXRzXCI7XHJcblxyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBSZWVsTiB7XHJcblxyXG4gICAgcHVibGljIHg6IG51bWJlcjtcclxuICAgIHB1YmxpYyB5OiBudW1iZXI7XHJcbiAgICBwdWJsaWMgaW5kZXg6IG51bWJlcjtcclxuICAgIHB1YmxpYyByZWVsQ29udGFpbmVyOiBQSVhJLkNvbnRhaW5lcjtcclxuICAgIHB1YmxpYyB2aXNpYmxlU3ltYm9sc0FycmF5OiBBcnJheTxJU3ltYm9sPjtcclxuICAgIHB1YmxpYyBuZXh0U3ByaXRlOiBQSVhJLlNwcml0ZTtcclxuICAgIHB1YmxpYyBuZXh0U3ltYm9sOiBJU3ltYm9sO1xyXG4gICAgcHVibGljIHZpc2libGVTcHJpdGVzOiBBcnJheTxQSVhJLlNwcml0ZSB8IGFueT47XHJcbiAgICBwcml2YXRlIHJlc291cmNlczogQXJyYXk8UElYSS5UZXh0dXJlIHwgYW55PlxyXG5cclxuICAgIHByaXZhdGUgcmVlbFZhbHVlc01hdGg6IEFycmF5PG51bWJlcj47XHJcbiAgICBwcml2YXRlIHN5bWJvbHNBbW91bnQ6IG51bWJlcjtcclxuICAgIHByaXZhdGUgcmVlbHNDb250YWluZXI6IFBJWEkuQ29udGFpbmVyO1xyXG4gICAgcHJpdmF0ZSByZWVsTWFzazogUElYSS5HcmFwaGljcztcclxuICAgIHByaXZhdGUgV2luU2hvd0FuaW1hdGlvbjogUElYSS5leHRyYXMuQW5pbWF0ZWRTcHJpdGU7XHJcbiAgICBwcml2YXRlIHdpblNob3dUaW1lOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIFNwaW5uaW5nVGltZTogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBTcGlubmluZ1NwZWVkOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHNwaW5uaW5nSW5kZXg6IG51bWJlcjtcclxuICAgIHByaXZhdGUgeV9kZWx0YTogbnVtYmVyO1xyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICBwcml2YXRlIHJlZWxTeW1ib2xzQW1vdW50OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHN0b3BTeW1ib2xzOiBudW1iZXJbXTtcclxuICAgIHByaXZhdGUgdGVtcFJlZWw6IFBJWEkuU3ByaXRlW107XHJcbiAgICBwcml2YXRlIHJlZWxDb250U3RvcFk6IG51bWJlcjtcclxuXHJcbiAgICBwcml2YXRlIHJlZWxTdG9wU291bmQ6IGFueTtcclxuICAgIHByaXZhdGUgaXNTbGFtb3V0OiBib29sZWFuO1xyXG5cclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlciwgaW5kZXg6bnVtYmVyLCByZWVsc0NvbnRhaW5lcjogUElYSS5Db250YWluZXIsIHJlc291cmNlczphbnkpe1xyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy55ID0geTtcclxuICAgICAgICB0aGlzLmluZGV4ID0gaW5kZXg7XHJcbiAgICAgICAgdGhpcy5yZXNvdXJjZXMgPSByZXNvdXJjZXM7XHJcbiAgICAgICAgdGhpcy5zeW1ib2xzQW1vdW50ID0gY29uZmlnLlJlZWxzQ29uZmlnLnJlZWxzW2luZGV4XS5zeW1ib2xzQW1vdW50O1xyXG4gICAgICAgIHRoaXMuU3Bpbm5pbmdUaW1lID0gY29uZmlnLlJlZWxzQ29uZmlnLnJlZWxzW2luZGV4XS5TcGlubmluZ1RpbWU7XHJcbiAgICAgICAgdGhpcy5TcGlubmluZ1NwZWVkID0gY29uZmlnLlJlZWxzQ29uZmlnLnNwaW5uaW5nU3BlZWQ7XHJcbiAgICAgICAgdGhpcy5yZWVsc0NvbnRhaW5lciA9IHJlZWxzQ29udGFpbmVyO1xyXG4gICAgICAgIHRoaXMucmVlbE1hc2sgPSBuZXcgUElYSS5HcmFwaGljcygpO1xyXG4gICAgICAgIHRoaXMudmlzaWJsZVN5bWJvbHNBcnJheSA9IFtdO1xyXG4gICAgICAgIHRoaXMucmVlbFZhbHVlc01hdGggPSBSZWVsU2V0W2luZGV4XTtcclxuICAgICAgICB0aGlzLnNwaW5uaW5nSW5kZXggPSAwO1xyXG4gICAgICAgIHRoaXMudGVtcFJlZWwgPSBbXTtcclxuICAgICAgICB0aGlzLnZpc2libGVTcHJpdGVzID0gW107XHJcbiAgICAgICAgdGhpcy53aW5TaG93VGltZSA9IDIwMDA7XHJcblxyXG4gICAgICAgIC8vIHRoaXMucmVlbFN0b3BTb3VuZCA9IG5ldyBBdWRpbyhyZXNvdXJjZXMucmVlbHN0b3AudXJsKTtcclxuICAgICAgICB0aGlzLmlzU2xhbW91dCA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLkluaXRpYWxpemVSZWVsKCk7XHJcbiAgICAgICAgdGhpcy5pbml0aWFsaXplTWFzaygpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldFJhbmRvbVN5bWJvbCgpOiBJU3ltYm9sIHtcclxuICAgICAgICByZXR1cm4gU1lNQk9MU1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBTWU1CT0xTLmxlbmd0aCldO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgSW5pdGlhbGl6ZVJlZWwoKTp2b2lkIHtcclxuICAgICAgICB0aGlzLnJlZWxDb250YWluZXIgPSBuZXcgUElYSS5Db250YWluZXIoKTtcclxuICAgICAgICB0aGlzLnJlZWxDb250YWluZXIueCA9IHRoaXMueDtcclxuICAgICAgICB0aGlzLnJlZWxDb250YWluZXIueSA9IHRoaXMueTtcclxuICAgICAgICB0aGlzLnlfZGVsdGEgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLnJlZWxTeW1ib2xzQW1vdW50ID0gdGhpcy5zeW1ib2xzQW1vdW50ICsgdGhpcy5jYWxjdWxhdGVTeW1ib2xzQW1vdW50KCk7XHJcbiAgICAgICAgdGhpcy5yZWVsQ29udFN0b3BZID0gKHRoaXMucmVlbFN5bWJvbHNBbW91bnQtdGhpcy5zeW1ib2xzQW1vdW50KSpjb25maWcuc3ltYm9sSGVpZ2h0O1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpPTA7IGk8dGhpcy5yZWVsU3ltYm9sc0Ftb3VudDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBzeW1ib2wgPSB0aGlzLmdldFJhbmRvbVN5bWJvbCgpLFxyXG4gICAgICAgICAgICAgICAgc3ByaXRlID0gbmV3IFBJWEkuU3ByaXRlKHRoaXMucmVzb3VyY2VzW3N5bWJvbC5uYW1lXSk7XHJcbiAgICAgICAgICAgIHNwcml0ZS55ID0gY29uZmlnLnN5bWJvbEhlaWdodCAqICh0aGlzLnN5bWJvbHNBbW91bnQgLSBpIC0gMSk7XHJcbiAgICAgICAgICAgIHRoaXMudGVtcFJlZWwucHVzaChzcHJpdGUpO1xyXG4gICAgICAgICAgICB0aGlzLnJlZWxDb250YWluZXIuYWRkQ2hpbGRBdChzcHJpdGUsIGkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnJlZWxDb250YWluZXIueSArPSB0aGlzLnJlZWxDb250U3RvcFk7XHJcbiAgICAgICAgdGhpcy5yZWVsc0NvbnRhaW5lci5hZGRDaGlsZCh0aGlzLnJlZWxDb250YWluZXIpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBwcml2YXRlIGluaXRpYWxpemVNYXNrKCk6IHZvaWQge1xyXG4gICAgICAgIC8vIGNyZWF0ZXMgbWFzayBhcm91bmQgdGhlIHJlZWxDb250YWluZXJcclxuICAgICAgICB0aGlzLnJlZWxzQ29udGFpbmVyLmFkZENoaWxkKHRoaXMucmVlbE1hc2spO1xyXG4gICAgICAgIHRoaXMucmVlbE1hc2subGluZVN0eWxlKDApO1xyXG4gICAgICAgIHRoaXMucmVlbENvbnRhaW5lci5tYXNrID0gdGhpcy5yZWVsTWFzaztcclxuXHJcbiAgICAgICAgdGhpcy5yZWVsTWFzay5iZWdpbkZpbGwoMHg4YmM1ZmYsIDAuMSk7XHJcbiAgICAgICAgdGhpcy5yZWVsTWFzay5tb3ZlVG8odGhpcy54LCB0aGlzLnkpO1xyXG4gICAgICAgIHRoaXMucmVlbE1hc2subGluZVRvKHRoaXMueCArIGNvbmZpZy5zeW1ib2xXaWR0aCwgdGhpcy55KTtcclxuICAgICAgICB0aGlzLnJlZWxNYXNrLmxpbmVUbyh0aGlzLnggKyBjb25maWcuc3ltYm9sV2lkdGgsICh0aGlzLnkrY29uZmlnLnN5bWJvbEhlaWdodCkqdGhpcy5zeW1ib2xzQW1vdW50KTtcclxuICAgICAgICB0aGlzLnJlZWxNYXNrLmxpbmVUbyh0aGlzLngsICh0aGlzLnkrY29uZmlnLnN5bWJvbEhlaWdodCkqdGhpcy5zeW1ib2xzQW1vdW50KTtcclxuICAgICAgICB0aGlzLnJlZWxNYXNrLmxpbmVUbyh0aGlzLngsIHRoaXMueSk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHB1YmxpYyBzdGFydFNwaW5BbmltYXRpb24oc3RvcFN5bWJvbHM6IG51bWJlcltdKTogdm9pZCB7XHJcblxyXG4gICAgICAgIHRoaXMuc3RvcFN5bWJvbHMgPSBzdG9wU3ltYm9scztcclxuICAgICAgICBhcHAudGlja2VyLmFkZChhbmltYXRlU3RhclNwaW4sIHRoaXMpO1xyXG5cclxuICAgICAgICBsZXQgcG9zaXRpb24gPSB0aGlzLnJlZWxDb250YWluZXIueTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYW5pbWF0ZVN0YXJTcGluKHRpbWVkZWx0YTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnJlZWxDb250YWluZXIueSA+IHBvc2l0aW9uLWNvbmZpZy5TdGFydEFuaW1EZWx0YSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWVsQ29udGFpbmVyLnkgLT0gTWF0aC5mbG9vcihjb25maWcuU3RhcnRBbmltU3BlZWQgKiB0aW1lZGVsdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICBhcHAudGlja2VyLnJlbW92ZShhbmltYXRlU3RhclNwaW4sIHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zcGluQW5pbWF0aW9uKHN0b3BTeW1ib2xzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcblxyXG4gICAgcHJpdmF0ZSBjYWxjdWxhdGVTeW1ib2xzQW1vdW50KCk6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IGRpc3RhbmNlUFggPSBjb25maWcuUmVlbHNDb25maWcuc3Bpbm5pbmdTcGVlZCAqIDYwICogKHRoaXMuU3Bpbm5pbmdUaW1lLzEwMDApO1xyXG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKGRpc3RhbmNlUFgvY29uZmlnLnN5bWJvbEhlaWdodClcclxuICAgIH1cclxuXHJcblxyXG4gICAgcHVibGljIHNsYW1PdXQoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5pc1NsYW1vdXQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMucmVlbENvbnRhaW5lci55ID0gdGhpcy5yZWVsQ29udFN0b3BZO1xyXG5cclxuICAgIH1cclxuXHJcblxyXG4gICAgcHJpdmF0ZSBzd2FwQ3VycmVudFZpc2libGVUZXh0dXJlcygpOiB2b2lkIHtcclxuICAgICAgICBmb3IgKGxldCBpPTA7IGk8dGhpcy5zeW1ib2xzQW1vdW50OyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHRleHR1cmUgPSB0aGlzLnRlbXBSZWVsW3RoaXMudGVtcFJlZWwubGVuZ3RoLTEtaV0udGV4dHVyZTtcclxuICAgICAgICAgICAgdGhpcy50ZW1wUmVlbFt0aGlzLnN5bWJvbHNBbW91bnQtMS1pXS50ZXh0dXJlID0gdGV4dHVyZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXRTdG9wU3ltYm9scyhzdG9wU3ltYm9sczogbnVtYmVyW10pOiB2b2lkIHtcclxuICAgICAgICBmb3IgKGxldCBpPTA7IGk8c3RvcFN5bWJvbHMubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgICAgICBsZXQgdGV4dHVyZSA9IHRoaXMucmVzb3VyY2VzW1NZTUJPTFNbc3RvcFN5bWJvbHNbaV1dLm5hbWVdO1xyXG4gICAgICAgICAgICB0aGlzLnRlbXBSZWVsW3RoaXMucmVlbFN5bWJvbHNBbW91bnQtaS0xXS50ZXh0dXJlID0gdGV4dHVyZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHB1YmxpYyBzcGluQW5pbWF0aW9uKHN0b3BTeW1ib2xzOiBudW1iZXJbXSkgOiB2b2lkIHtcclxuXHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuaXNTbGFtb3V0ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vIHN3YXAgdmlzaWJsZSBlbGVtZW50c1xyXG4gICAgICAgIHRoaXMuc3dhcEN1cnJlbnRWaXNpYmxlVGV4dHVyZXMoKTtcclxuICAgICAgICB0aGlzLnJlZWxDb250YWluZXIueSAtPSB0aGlzLnJlZWxDb250U3RvcFk7XHJcbiAgICAgICAgdGhpcy5zZXRTdG9wU3ltYm9scyhzdG9wU3ltYm9scyk7XHJcblxyXG4gICAgICAgIGFwcC50aWNrZXIuYWRkKGFuaW1hdGVTcGluLCB0aGlzKTtcclxuXHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNtb290aFN0b3AoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGxldCBkb3duID0gdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHN0YXJ0WSA9IHNlbGYucmVlbENvbnRhaW5lci55LFxyXG4gICAgICAgICAgICAgICAgc3RvcFkgPSBzZWxmLnJlZWxDb250YWluZXIueSArIGNvbmZpZy5SZWVsc0NvbmZpZy5yZWVsU3RvcERlbHRhO1xyXG5cclxuICAgICAgICAgICAgYXBwLnRpY2tlci5hZGQoc3RvcEFuaW1hdGlvbiwgc2VsZik7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBzdG9wQW5pbWF0aW9uKHRpbWVkZWx0YTogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5yZWVsQ29udGFpbmVyLnkgPCBzdG9wWSAmJiBkb3duKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5yZWVsQ29udGFpbmVyLnkgKz0gY29uZmlnLlJlZWxzQ29uZmlnLnJlZWxTdG9wU3BlZWQgKiB0aW1lZGVsdGE7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNlbGYucmVlbENvbnRhaW5lci55ID49IHN0b3BZICYmIGRvd24pIHtcclxuICAgICAgICAgICAgICAgICAgICBkb3duID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYucmVlbENvbnRhaW5lci55ID0gTWF0aC5tYXgoc2VsZi5yZWVsQ29udGFpbmVyLnkgLSBNYXRoLmZsb29yKGNvbmZpZy5SZWVsc0NvbmZpZy5yZWVsU3RvcERlbHRhKnRpbWVkZWx0YSowLjEpLCBzdGFydFkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWxmLnJlZWxDb250YWluZXIueSA9PSBzdGFydFkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwLnRpY2tlci5yZW1vdmUoc3RvcEFuaW1hdGlvbiwgc2VsZik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWxmLmluZGV4ID09IGNvbmZpZy5SZWVsc0NvbmZpZy5yZWVscy5sZW5ndGgtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KCdMYXN0UmVlbFN0b3BwZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9YCAgYFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYW5pbWF0ZVNwaW4odGltZWRlbHRhOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucmVlbENvbnRhaW5lci55IDwgdGhpcy5yZWVsQ29udFN0b3BZKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlZWxDb250YWluZXIueSA9IE1hdGgubWluKHRoaXMucmVlbENvbnRhaW5lci55ICsgTWF0aC5mbG9vcih0aW1lZGVsdGEqdGhpcy5TcGlubmluZ1NwZWVkKSwgdGhpcy5yZWVsQ29udFN0b3BZKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGFwcC50aWNrZXIucmVtb3ZlKGFuaW1hdGVTcGluLCB0aGlzKTtcclxuICAgICAgICAgICAgICAgIHNtb290aFN0b3AoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBwdWJsaWMgcGxheVdpblNob3coc3ltYm9sOiBudW1iZXIsIGluZGV4OiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICAvLyBoaWRlIHN5bWJvbCBzcHJpdGVcclxuICAgICAgICB0aGlzLnRlbXBSZWVsW3RoaXMucmVlbFN5bWJvbHNBbW91bnQtaW5kZXgtMV0udmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIC8vIGdldCBzeW1ib2wgd2luc2hvdyBhbmltYXRpb25cclxuICAgICAgICAvLyBsZXQgaVN5bWJvbCA9IFNZTUJPTFNbc3ltYm9sXTtcclxuICAgICAgICAvLyB0aGlzLldpblNob3dBbmltYXRpb24gPSBpU3ltYm9sLndpblNob3dBbmltYXRpb24oKTtcclxuXHJcbiAgICAgICAgLy8gdGhpcy5yZWVsQ29udGFpbmVyLmFkZENoaWxkKHRoaXMuV2luU2hvd0FuaW1hdGlvbik7XHJcbiAgICAgICAgLy8gdGhpcy5XaW5TaG93QW5pbWF0aW9uLnkgPSB0aGlzLnRlbXBSZWVsW3RoaXMucmVlbFN5bWJvbHNBbW91bnQtaW5kZXgtMV0ueTtcclxuICAgICAgICAvLyB0aGlzLldpblNob3dBbmltYXRpb24ubG9vcCA9IHRydWU7XHJcblxyXG4gICAgICAgIC8vIHRoaXMuV2luU2hvd0FuaW1hdGlvbi5wbGF5KCk7XHJcbiAgICAgICAgLy8gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8gICAgIGxldCB3aW5TaG93RW5kRXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQoJ1JlZWxXaW5TaG93QW5pbUVuZCcsIHsnZGV0YWlsJzogeydyZWVsSW5kZXgnOiB0aGlzLmluZGV4fX0pO1xyXG4gICAgICAgIC8vICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KHdpblNob3dFbmRFdmVudCk7XHJcbiAgICAgICAgLy8gfS5iaW5kKHRoaXMpLCB0aGlzLndpblNob3dUaW1lKVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdG9wV2luU2hvdyhpbmRleDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgLy8gdGhpcy5XaW5TaG93QW5pbWF0aW9uLnN0b3AoKTtcclxuICAgICAgICAvLyB0aGlzLldpblNob3dBbmltYXRpb24udmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIC8vIHNob3cgc3ltYm9sIHNwcml0ZVxyXG4gICAgICAgIHRoaXMudGVtcFJlZWxbdGhpcy5yZWVsU3ltYm9sc0Ftb3VudC1pbmRleC0xXS52aXNpYmxlID0gdHJ1ZVxyXG4gICAgfVxyXG5cclxuXHJcbn1cclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgdGFyYXNnIG9uIDQwLzQ0LzEwNDEuXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgUmVlbFNldDogbnVtYmVyW11bXSA9IFtcclxuICAgIFs0LCAxLCA2LCA2LCAxLCAzLCA1LCA0LCA2LCAzLCA1LCA3LCA0LCA1LCAzLCA0LCA0LCAzLCA2LCA3LCA0LCA1LCA2LCA3LCA1LCA0LCAxLCA1LCA1LCAzLCAxLCA0LCA1LCAzLCA0LCAxLCA1LCA0LCA2LCAxLCAzLCA2LCA0LCA0LCA0LCA0LCA0LCA3LCA1LCAzXSxcclxuICAgIFs2LCA0LCAxLCA1LCA3LCAzLCA0LCA2LCAxLCA0LCA0LCAzLCA3LCA0LCA0LCA2LCAxLCA0LCA1LCA2LCA3LCA0LCA0LCAxLCA2LCA0LCAzLCA0LCA3LCAwLCA0LCA2LCA0LCA0LCA0LCA0LCAxLCAzLCA0LCA0LCA3LCA2LCA1LCA0LCAzLCAxLCA0LCA0LCA3LCA1XSxcclxuICAgIFs0LCA0LCA2LCAxLCA2LCAzLCA1LCA0LCA3LCAzLCA1LCAxLCA0LCA1LCAzLCA0LCA0LCAzLCA3LCA2LCA0LCA1LCAzLCAxLCA1LCA0LCA0LCA1LCA0LCAzLCA3LCA1LCA1LCAzLCA0LCAxLCA1LCA0LCA3LCA2LCAzLCAxLCA0LCAwLCA0LCA0LCA0LCA3LCA1LCAzXSxcclxuICAgIFsxLCA0LCAxLCA1LCAxLCAzLCA0LCA1LCA0LCA0LCA1LCAzLCAxLCA0LCA0LCAxLCAxLCA0LCA1LCAxLCAxLCA0LCA1LCA0LCAxLCA0LCAzLCA0LCAxLCAwLCA1LCAxLCA0LCA0LCA0LCA0LCAxLCAzLCA0LCA0LCA1LCAxLCA1LCA0LCAzLCAxLCA0LCA0LCAxLCA1XSxcclxuICAgIFs0LCA0LCAxLCAxLCAxLCAxLCA0LCA0LCAxLCAzLCA1LCAxLCA0LCAxLCAzLCA0LCA0LCAxLCAxLCAxLCA0LCAzLCA0LCAxLCA1LCA0LCA0LCA1LCA1LCAzLCAxLCA0LCA0LCAzLCA0LCAxLCAxLCA0LCAxLCAxLCAzLCAxLCA0LCA0LCA0LCA0LCA0LCAxLCA1LCAzXVxyXG5dOyIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IHRhcmFzZyBvbiAxMC8xMS8yMDE3LlxyXG4gKi9cclxuaW1wb3J0IHtCYXNlR2FtZVNjZW5lfSBmcm9tIFwiLi4vU2NlbmVzL0dhbWVTY2VuZXNcIjtcclxuLy8gaW1wb3J0IHtSZWVsfSBmcm9tIFwiLi9SZWVsXCI7XHJcbmltcG9ydCB7UmVlbHNDb25maWd9IGZyb20gXCIuL3JlZWxzQ29uZmlnXCI7XHJcbmltcG9ydCB7UmVlbE59IGZyb20gXCIuL05ld1JlZWxcIjtcclxuXHJcblxyXG5leHBvcnQgY2xhc3MgUmVlbFNwaW5uZXIge1xyXG4gICAgcHJpdmF0ZSByZXNvdXJjZXM6IGFueTtcclxuICAgIHB1YmxpYyBzY2VuZTogQmFzZUdhbWVTY2VuZTtcclxuICAgIHB1YmxpYyByZWVsc0FycmF5OiBSZWVsTltdO1xyXG5cclxuICAgIHB1YmxpYyByZWVsc0NvbnRhaW5lcjogUElYSS5Db250YWluZXI7XHJcbiAgICBwcml2YXRlIHJlZWxzRGVsYXk6IG51bWJlcjtcclxuXHJcbiAgICBwcml2YXRlIHJlZWxTcGluU291bmQ6IGFueTtcclxuICAgIHByaXZhdGUgcmVlbFN0b3BTb3VuZDogYW55O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHNjZW5lOiBCYXNlR2FtZVNjZW5lLCByZXNvdXJjZXM6IGFueSkge1xyXG4gICAgICAgIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuICAgICAgICB0aGlzLnJlc291cmNlcyA9IHJlc291cmNlcztcclxuICAgICAgICB0aGlzLnJlZWxzQXJyYXkgPSBbXTtcclxuICAgICAgICAvLyB0aGlzLnJlZWxTcGluU291bmQgPSBuZXcgQXVkaW8ocmVzb3VyY2VzLnJlZWxzcGluLnVybCk7XHJcbiAgICAgICAgLy8gdGhpcy5yZWVsU3RvcFNvdW5kID0gbmV3IEF1ZGlvKHJlc291cmNlcy5yZWVsc3RvcC51cmwpO1xyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZVJlZWxzKCk7XHJcblxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBwcml2YXRlIGluaXRpYWxpemVSZWVscygpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnJlZWxzQ29udGFpbmVyID0gbmV3IFBJWEkuQ29udGFpbmVyKCk7XHJcbiAgICAgICAgdGhpcy5yZWVsc0NvbnRhaW5lci54ID0gUmVlbHNDb25maWcueDtcclxuICAgICAgICB0aGlzLnJlZWxzQ29udGFpbmVyLnkgPSBSZWVsc0NvbmZpZy55O1xyXG5cclxuICAgICAgICB0aGlzLnJlZWxzRGVsYXkgPSBSZWVsc0NvbmZpZy5yZWVsc0RlbGF5O1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpPTA7IGk8UmVlbHNDb25maWcucmVlbHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHg6IG51bWJlciA9IFJlZWxzQ29uZmlnLnJlZWxzW2ldLngsXHJcbiAgICAgICAgICAgICAgICB5OiBudW1iZXIgPSBSZWVsc0NvbmZpZy5yZWVsc1tpXS55O1xyXG4gICAgICAgICAgICBsZXQgcmVlbCA9IG5ldyBSZWVsTih4LCB5LCBpLCB0aGlzLnJlZWxzQ29udGFpbmVyLCB0aGlzLnJlc291cmNlcyk7XHJcbiAgICAgICAgICAgIHRoaXMucmVlbHNBcnJheS5wdXNoKHJlZWwpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5zY2VuZS5hZGRDaGlsZCh0aGlzLnJlZWxzQ29udGFpbmVyKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3BpbihyZXN1bHRzOiBudW1iZXJbXVtdKTogdm9pZCB7XHJcblxyXG4gICAgICAgIGxldCByZWVsc0RlbGF5OiBudW1iZXIgPSB0aGlzLnJlZWxzRGVsYXk7XHJcbiAgICAgICAgLy8gdGhpcy5yZWVsU3BpblNvdW5kLmN1cnJlbnRUaW1lID0gMDtcclxuICAgICAgICAvLyB0aGlzLnJlZWxTcGluU291bmQucGxheSgpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpPHRoaXMucmVlbHNBcnJheS5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgICAgIGxldCBhbmltYXRpb24gPSB0aGlzLnJlZWxzQXJyYXlbaV0uc3RhcnRTcGluQW5pbWF0aW9uLmJpbmQodGhpcy5yZWVsc0FycmF5W2ldKTtcclxuICAgICAgICAgICAgKGZ1bmN0aW9uIChpKSB7XHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGFuaW1hdGlvbiwgcmVlbHNEZWxheSppLCByZXN1bHRzW2ldKTtcclxuICAgICAgICAgICAgfSkoaSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzbGFtb3V0KCk6IHZvaWQge1xyXG4gICAgICAgIGxldCByZWVsc0RlbGF5OiBudW1iZXIgPSB0aGlzLnJlZWxzRGVsYXk7XHJcbiAgICAgICAgLy8gdGhpcy5yZWVsU3BpblNvdW5kLnBhdXNlKCk7XHJcbiAgICAgICAgZm9yIChsZXQgaT0wOyBpPHRoaXMucmVlbHNBcnJheS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLnJlZWxzQXJyYXlbaV0uc2xhbU91dCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcbn0iLCIvKipcclxuICogQ3JlYXRlZCBieSB0YXJhc2cgb24gMTAvMTEvMjAxNy5cclxuICovXHJcblxyXG5leHBvcnQgY29uc3QgV2luQm94V2lkdGg6ICBudW1iZXIgPSAyNTQ7XHJcbmV4cG9ydCBjb25zdCBXaW5Cb3hIZWlnaHQ6IG51bWJlciA9IDI0NDtcclxuXHJcbmV4cG9ydCBjb25zdCBzeW1ib2xXaWR0aDogbnVtYmVyID0gMjM1O1xyXG5leHBvcnQgY29uc3Qgc3ltYm9sSGVpZ2h0OiBudW1iZXIgPSAxNTU7XHJcblxyXG5leHBvcnQgY29uc3QgTGluZU51bWJlcldpZHRoOiAgbnVtYmVyID0gODM7XHJcbmV4cG9ydCBjb25zdCBMaW5lTnVtYmVySGVpZ2h0OiBudW1iZXIgPSA3MztcclxuXHJcblxyXG5leHBvcnQgY29uc3QgU3RhcnRBbmltRGVsdGE6IG51bWJlciA9IDUwO1xyXG5leHBvcnQgY29uc3QgU3RhcnRBbmltU3BlZWQ6IG51bWJlciA9IDEwO1xyXG5cclxuXHJcblxyXG5leHBvcnQgY29uc3QgUmVlbHNDb25maWcgPSB7XHJcbiAgICB4OiA1MCxcclxuICAgIHk6IDYwLFxyXG5cclxuICAgIHJlZWxzRGVsYXk6IDUwLCAvLyBtcyBiZXR3ZWVuIHNwaW4gYW5pbWF0aW9uIG9mIHRoZSByZWVsc1xyXG5cclxuICAgIHJlZWxzOiBbXHJcbiAgICAgICAgeyd4JzoyMCwgJ3knOjEwLCAnc3ltYm9sc0Ftb3VudCc6MywgJ1NwaW5uaW5nVGltZSc6IDE1MDB9LFxyXG4gICAgICAgIHsneCc6MjYwLCAneSc6MTAsICdzeW1ib2xzQW1vdW50JzozLCAnU3Bpbm5pbmdUaW1lJzogMTcwMH0sXHJcbiAgICAgICAgeyd4Jzo1MDMsICd5JzoxMCwgJ3N5bWJvbHNBbW91bnQnOjMsICdTcGlubmluZ1RpbWUnOiAyMjAwfVxyXG4gICAgXSxcclxuXHJcbiAgICBzcGlubmluZ1NwZWVkOiAyMCxcclxuICAgIHNsYW1PdXRBY2NlbGVyYXRpb246IDIuMjUsXHJcbiAgICByZWVsU3RvcERlbHRhOiAxNSxcclxuICAgIHJlZWxTdG9wU3BlZWQ6IDVcclxufTtcclxuXHJcblxyXG5leHBvcnQgY29uc3QgcmVzcG9uc2UgPSB7XHJcbiAgICBcInF1YWxpZmllclwiOlwiY29tLnB0LmNhc2luby5wbGF0Zm9ybVwiLFxyXG4gICAgXCJjb250ZXh0SWRcIjpcInI5dG52YWFqb2p5ZDNuaTg4NW1pXCIsXHJcbiAgICBcImNvcnJlbGF0aW9uSWRcIjpcIjllMHg3cmw3bnNpMnoxeTMwdWRpXCIsXHJcbiAgICBcImRhdGFcIjp7XHJcbiAgICAgICAgXCJfdHlwZVwiOlwiY29tLnB0LmNhc2luby5wbGF0Zm9ybS5nYW1lLkdhbWVDb21tYW5kXCIsXHJcbiAgICAgICAgXCJ3aW5kb3dJZFwiOlwiXCIsXHJcbiAgICAgICAgXCJ3aW5BbW91bnRcIjowLFxyXG4gICAgICAgIFwiZ2FtZURhdGFcIjp7XHJcbiAgICAgICAgICAgIFwiX3R5cGVcIjpcInJ5b3RhOkdhbWVSZXNwb25zZVwiLFxyXG4gICAgICAgICAgICBcInN0YWtlXCI6NTAwLFxyXG4gICAgICAgICAgICBcInRvdGFsV2luQW1vdW50XCI6MCxcclxuICAgICAgICAgICAgXCJwbGF5SW5kZXhcIjoxLFxyXG4gICAgICAgICAgICBcIm5leHRSb3VuZFwiOlwiMFwiLFxyXG4gICAgICAgICAgICBcIndpbkxpbmVDb3VudFwiOjUsXHJcbiAgICAgICAgICAgIFwiaXNXaW5DYXBwZWRcIjpmYWxzZSxcclxuICAgICAgICAgICAgXCJwbGF5U3RhY2tcIjpbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyb3VuZFwiOlwiMFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwicmVtYWluaW5nUGxheUNvdW50XCI6MCxcclxuICAgICAgICAgICAgICAgICAgICBcIm5ld1BsYXlDb3VudFwiOjAsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJtdWx0aXBsaWVyXCI6MSxcclxuICAgICAgICAgICAgICAgICAgICBcImZlYXR1cmVXaW5BbW91bnRcIjo0MDAsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJnYW1lV2luQW1vdW50XCI6MCxcclxuICAgICAgICAgICAgICAgICAgICBcImlzTGFzdFBsYXlNb2RlXCI6dHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBcImlzTmV4dFBsYXlNb2RlXCI6ZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJpc1dpbkNhcHBlZFwiOmZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIFwibGFzdFBsYXlJbk1vZGVEYXRhXCI6e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInBsYXlXaW5BbW91bnRcIjo0MDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic2xvdHNEYXRhXCI6e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwcmV2aW91c1RyYW5zZm9ybXNcIjpbXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYWN0aW9uc1wiOltcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHJhbnNmb3Jtc1wiOltcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlZlwiOlwic3BpblwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3ltYm9sVXBkYXRlc1wiOltcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzeW1ib2xcIjoxLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZWVsSW5kZXhcIjowLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwb3NpdGlvbk9uUmVlbFwiOjBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzeW1ib2xcIjozLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZWVsSW5kZXhcIjowLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwb3NpdGlvbk9uUmVlbFwiOjFcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzeW1ib2xcIjoyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZWVsSW5kZXhcIjowLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwb3NpdGlvbk9uUmVlbFwiOjJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzeW1ib2xcIjozLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZWVsSW5kZXhcIjoxLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwb3NpdGlvbk9uUmVlbFwiOjBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzeW1ib2xcIjoxLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZWVsSW5kZXhcIjoxLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwb3NpdGlvbk9uUmVlbFwiOjFcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzeW1ib2xcIjoyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZWVsSW5kZXhcIjoxLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwb3NpdGlvbk9uUmVlbFwiOjJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzeW1ib2xcIjozLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZWVsSW5kZXhcIjoyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwb3NpdGlvbk9uUmVlbFwiOjBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzeW1ib2xcIjo1LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZWVsSW5kZXhcIjoyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwb3NpdGlvbk9uUmVlbFwiOjFcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzeW1ib2xcIjoxLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZWVsSW5kZXhcIjoyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwb3NpdGlvbk9uUmVlbFwiOjJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzeW1ib2xcIjozLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZWVsSW5kZXhcIjozLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwb3NpdGlvbk9uUmVlbFwiOjBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzeW1ib2xcIjo0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZWVsSW5kZXhcIjozLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwb3NpdGlvbk9uUmVlbFwiOjFcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzeW1ib2xcIjowLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZWVsSW5kZXhcIjozLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwb3NpdGlvbk9uUmVlbFwiOjJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzeW1ib2xcIjo1LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZWVsSW5kZXhcIjo0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwb3NpdGlvbk9uUmVlbFwiOjBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzeW1ib2xcIjowLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZWVsSW5kZXhcIjo0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwb3NpdGlvbk9uUmVlbFwiOjFcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzeW1ib2xcIjozLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZWVsSW5kZXhcIjo0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwb3NpdGlvbk9uUmVlbFwiOjJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwYXlvdXRzXCI6W1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInRyYW5zZm9ybXNcIjpbXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBheW91dHNcIjpbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwYXlvdXREYXRhXCI6e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBheW91dFdpbkFtb3VudFwiOjMwMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwYXlvdXRGcmVlUGxheVJlc3VsdHNEYXRhXCI6W1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjb250ZXh0XCI6e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIndpbkxpbmVJbmRleFwiOjQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwid2lubmluZ1N5bWJvbHNcIjpbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzeW1ib2xcIjoxLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVlbEluZGV4XCI6MCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBvc2l0aW9uT25SZWVsXCI6MFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN5bWJvbFwiOjEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZWVsSW5kZXhcIjoxLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicG9zaXRpb25PblJlZWxcIjoxXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3ltYm9sXCI6MSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlZWxJbmRleFwiOjIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwb3NpdGlvbk9uUmVlbFwiOjJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3ltYm9sXCI6MSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzeW1ib2xQYXlvdXRUeXBlXCI6XCJXaW5MaW5lXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibXVsdGlwbGllclwiOjFcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGF5b3V0RGF0YVwiOntcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwYXlvdXRXaW5BbW91bnRcIjoxMDAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBheW91dEZyZWVQbGF5UmVzdWx0c0RhdGFcIjpbXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNvbnRleHRcIjp7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwid2luTGluZUluZGV4XCI6NixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ3aW5uaW5nU3ltYm9sc1wiOltcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN5bWJvbFwiOjYsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZWVsSW5kZXhcIjowLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicG9zaXRpb25PblJlZWxcIjoxXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3ltYm9sXCI6NixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlZWxJbmRleFwiOjEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwb3NpdGlvbk9uUmVlbFwiOjBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzeW1ib2xcIjo2LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVlbEluZGV4XCI6MixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBvc2l0aW9uT25SZWVsXCI6MFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN5bWJvbFwiOjYsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZWVsSW5kZXhcIjozLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicG9zaXRpb25PblJlZWxcIjowXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3ltYm9sXCI6MCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlZWxJbmRleFwiOjQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwb3NpdGlvbk9uUmVlbFwiOjFcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3ltYm9sXCI6NixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzeW1ib2xQYXlvdXRUeXBlXCI6XCJXaW5MaW5lXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibXVsdGlwbGllclwiOjFcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGF5b3V0RGF0YVwiOntcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwYXlvdXRXaW5BbW91bnRcIjoxMDAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBheW91dEZyZWVQbGF5UmVzdWx0c0RhdGFcIjpbXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNvbnRleHRcIjp7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwid2luTGluZUluZGV4XCI6MTksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwid2lubmluZ1N5bWJvbHNcIjpbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzeW1ib2xcIjoyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVlbEluZGV4XCI6MCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBvc2l0aW9uT25SZWVsXCI6MlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN5bWJvbFwiOjIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZWVsSW5kZXhcIjoxLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicG9zaXRpb25PblJlZWxcIjoyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3ltYm9sXCI6MixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlZWxJbmRleFwiOjIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwb3NpdGlvbk9uUmVlbFwiOjBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzeW1ib2xcIjowLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVlbEluZGV4XCI6MyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBvc2l0aW9uT25SZWVsXCI6MlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzeW1ib2xcIjoyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN5bWJvbFBheW91dFR5cGVcIjpcIldpbkxpbmVcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtdWx0aXBsaWVyXCI6MVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJtb2RlVHlwZVwiOlwiU0xPVFNcIlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcInN0YWtlQW1vdW50XCI6NTAwXHJcbiAgICB9XHJcbn07IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IHRhcmFzZyBvbiA5LzI1LzIwMTcuXG4gKi9cbmltcG9ydCB7QnV0dG9uLCBEZW5vbWluYXRpb25QYW5lbEJ1dHRvbn0gZnJvbSBcIi4uL0xheW91dC9CdXR0b25zXCI7XG5pbXBvcnQge1dpbkxpbmVCdXR0b259IGZyb20gXCIuLi9MYXlvdXQvV2luTGluZUJ1dHRvblwiO1xuaW1wb3J0IHtCdXR0b25FdmVudHN9IGZyb20gXCIuLi9FdmVudHMvQnV0dG9uRXZlbnRzXCI7XG5pbXBvcnQge051bWVyaWNGaWVsZCwgQmFsYW5jZUZpZWxkV2l0aEhpZGVDcmVkaXRzQW5pbWF0aW9ufSBmcm9tICBcIi4uL0xheW91dC9OdW1lcmljRmllbGRcIjtcbmltcG9ydCB7Rm9udFN0eWxlc30gZnJvbSBcIi4uL1V0aWxzL2ZvbnRTdHlsZXNcIjtcbmltcG9ydCAqIGFzIHV0aWxzIGZyb20gXCIuLi9VdGlscy9oZWxwZXJGdW5jc1wiO1xuaW1wb3J0IHtUZXh0Q29udGFpbmVyfSBmcm9tIFwiLi4vTGF5b3V0L1RleHRDb250YWluZXJcIjtcbmltcG9ydCB7Q3JlYXRlQW5pbWF0aW9ufSBmcm9tIFwiLi4vVXRpbHMvaGVscGVyRnVuY3NcIjtcbmltcG9ydCBzZXQgPSBSZWZsZWN0LnNldDtcbmltcG9ydCB7UmVlbFNwaW5uZXJ9IGZyb20gXCIuLi9SZWVsU3Bpbm5lci9SZWVsU3Bpbm5lclwiO1xuaW1wb3J0IHtXaW5MaW5lfSBmcm9tIFwiLi4vTGF5b3V0L1dpbkxpbmVDbGFzc1wiO1xuaW1wb3J0IHtTb3VuZHNNYW5hZ2VyfSBmcm9tIFwiLi4vbWFpblwiO1xuXG5cblxuXG5leHBvcnQgY2xhc3MgQmFzZUdhbWVTY2VuZSBleHRlbmRzIFBJWEkuQ29udGFpbmVyIHtcbiAgICBwdWJsaWMgUkVFTFM6IFJlZWxTcGlubmVyO1xuICAgIHB1YmxpYyBzdGFydEJ1dHRvbjogQnV0dG9uO1xuICAgIHB1YmxpYyBzdG9wQnV0dG9uOiBCdXR0b247XG4gICAgcHVibGljIG1heEJldEJ1dHRvbjogQnV0dG9uO1xuICAgIHB1YmxpYyBzdGFrZUJ1dHRvbjogRGVub21pbmF0aW9uUGFuZWxCdXR0b247XG4gICAgcHVibGljIGJhbGFuY2VGaWVsZDogTnVtZXJpY0ZpZWxkO1xuICAgIHB1YmxpYyB0b3RhbFdpbkZpZWxkOiBOdW1lcmljRmllbGQ7XG5cbiAgICBwcml2YXRlIHNjZW5lQmFja2dyb3VuZDogUElYSS5TcHJpdGU7XG4gICAgcHJpdmF0ZSByZXNvdXJjZXM6IGFueTtcblxuXG4gICAgY29uc3RydWN0b3IocmVzb3VyY2VzOmFueSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLnJlc291cmNlcyA9IHJlc291cmNlcztcbiAgICAgICAgLy8gYmFja2dvcnVuZFxuICAgICAgICB0aGlzLnNjZW5lQmFja2dyb3VuZCA9IG5ldyBQSVhJLlNwcml0ZShyZXNvdXJjZXNbJ0JHJ10pO1xuICAgICAgICB0aGlzLmFkZENoaWxkKHRoaXMuc2NlbmVCYWNrZ3JvdW5kKTtcblxuICAgICAgICAvL1JlZWxzO1xuICAgICAgICB0aGlzLlJFRUxTID0gbmV3IFJlZWxTcGlubmVyKHRoaXMsIHJlc291cmNlcyk7XG5cbiAgICAgICAgLy8gQ29udHJvbCBCdXR0b25zXG4gICAgICAgIC8vIGxldCBidXR0b25Tb3VuZCA9IFNvdW5kc01hbmFnZXIuYWxsU291bmRzLmJ1dHRvblByZXNzO1xuXG4gICAgICAgIHRoaXMuc3RhcnRCdXR0b24gPSBuZXcgQnV0dG9uKHRoaXMsIDg3MywgMjY3LCAnU3RhcnRCdXR0b24nLCByZXNvdXJjZXMsIHRoaXMub25TdGFydEJ1dHRvbik7XG4gICAgICAgIHRoaXMuc3RvcEJ1dHRvbiA9IG5ldyBCdXR0b24odGhpcywgODczLCAyNjcsICdTdG9wQnV0dG9uJywgcmVzb3VyY2VzLCB0aGlzLm9uU3RvcEJ1dHRvbik7XG5cbiAgICAgICAgLy8gdGhpcy5tYXhCZXRCdXR0b24gPSBuZXcgQnV0dG9uKHRoaXMsIDE0MjAsIDk2MCwgcmVzb3VyY2VzLm1heGJldC51cmwsIHJlc291cmNlcy5tYXhiZXRfZGlzLnVybCwgcmVzb3VyY2VzLm1heGJldF9wcmVzc2VkLnVybCwgYnV0dG9uU291bmQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChCdXR0b25FdmVudHMuTWF4QmV0QnV0dG9uUHJlc3NlZCk7XG4gICAgICAgIC8vIH0pO1xuXG4gICAgICAgIHRoaXMuYmFsYW5jZUZpZWxkID0gbmV3IEJhbGFuY2VGaWVsZFdpdGhIaWRlQ3JlZGl0c0FuaW1hdGlvbih0aGlzLCAnQmFsYW5jZUZpZWxkJywgNzY1LCA0NTUsIHJlc291cmNlcywgRm9udFN0eWxlcy5jb3VudGVyRm9udCk7XG4gICAgICAgIHRoaXMuYmFsYW5jZUZpZWxkLmZpZWxkQ29udGFpbmVyLnNjYWxlLnNldCgwLjUsIDEpOyAvLyB0aGlzIGFkZGVkIGNhdXNlIGFzc2V0cyB0YWtlbiBmcm9tIGFub3RlciBnYW1lIGFuZCBkb250IGZpdCB0aGUgc2l6ZVxuICAgICAgICB0aGlzLnRvdGFsV2luRmllbGQgPSBuZXcgTnVtZXJpY0ZpZWxkKHRoaXMsICdUb3RhbFdpbicsIDc2NSwgMCwgcmVzb3VyY2VzLCBGb250U3R5bGVzLmNvdW50ZXJGb250KTtcbiAgICAgICAgdGhpcy50b3RhbFdpbkZpZWxkLmZpZWxkQ29udGFpbmVyLnNjYWxlLnNldCgwLjUsIDEpO1xuXG4gICAgICAgIFxuICAgICAgICB0aGlzLmludGVyYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5vbigncG9pbnRlcmRvd24nLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KEJ1dHRvbkV2ZW50cy5DbGlja2VkT25CYXNlR2FtZVNjZW5lKTtcbiAgICAgICAgICAgIGxldCBza2lwV0luc2hvdyA9IG5ldyBDdXN0b21FdmVudCgnc2tpcFdpblNob3cnKTtcbiAgICAgICAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoc2tpcFdJbnNob3cpO1xuICAgICAgICB9KVxuICAgIH1cblxuICAgIHByaXZhdGUgb25TdGFydEJ1dHRvbiAoKSB7XG4gICAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoQnV0dG9uRXZlbnRzLlN0YXJ0QnV0dG9uUHJlc3NlZCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblN0b3BCdXR0b24gKCkge1xuICAgICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KEJ1dHRvbkV2ZW50cy5TdG9wQnV0dG9uUHJlc3NlZCk7XG4gICAgfVxufVxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgdGFyYXNnIG9uIDkvMjUvMjAxNy5cclxuICovXHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIFNjZW5lTWFuYWdlciB7XHJcbiAgICBwcml2YXRlIGNvbnRhaW5lcnM6IGFueSA9IHt9O1xyXG4gICAgcHVibGljIGN1cnJlbnRTY2VuZTogYW55OyAvL1BJWEkuQ29udGFpbmVyXHJcbiAgICBwdWJsaWMgY3VycmVudFNjZW5lSWQ6IHN0cmluZztcclxuICAgIHByaXZhdGUgYXBwOiBQSVhJLkFwcGxpY2F0aW9uO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGFwcDogUElYSS5BcHBsaWNhdGlvbikge1xyXG4gICAgICAgIHRoaXMuYXBwID0gYXBwO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBBZGRHYW1lU2NlbmUoaWQ6c3RyaW5nLCBnYW1lU2NlbmU6YW55KSB7XHJcbiAgICAgICAgdGhpcy5jb250YWluZXJzW2lkXSA9IGdhbWVTY2VuZTtcclxuICAgICAgICBnYW1lU2NlbmUudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuYXBwLnN0YWdlLmFkZENoaWxkKGdhbWVTY2VuZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdvVG9HYW1lU2NlbmUoaWQpIHtcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50U2NlbmUpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50U2NlbmUudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNvbnRhaW5lcnNbaWRdLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFNjZW5lID0gdGhpcy5jb250YWluZXJzW2lkXTtcclxuICAgICAgICB0aGlzLmN1cnJlbnRTY2VuZUlkID0gaWQ7XHJcbiAgICB9XHJcblxyXG5cclxufVxyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSB0YXJhc2cgb24gOS8yOC8yMDE3LlxyXG4gKi9cclxuXHJcbi8vIHRhcmdldCA9IGlkIG9mIGh0bWwgZWxlbWVudCBvciB2YXIgb2YgcHJldmlvdXNseSBzZWxlY3RlZCBodG1sIGVsZW1lbnQgd2hlcmUgY291bnRpbmcgb2NjdXJzXHJcbi8vIHN0YXJ0VmFsID0gdGhlIHZhbHVlIHlvdSB3YW50IHRvIGJlZ2luIGF0XHJcbi8vIGVuZFZhbCA9IHRoZSB2YWx1ZSB5b3Ugd2FudCB0byBhcnJpdmUgYXRcclxuLy8gZGVjaW1hbHMgPSBudW1iZXIgb2YgZGVjaW1hbCBwbGFjZXMsIGRlZmF1bHQgMFxyXG4vLyBkdXJhdGlvbiA9IGR1cmF0aW9uIG9mIGFuaW1hdGlvbiBpbiBzZWNvbmRzLCBkZWZhdWx0IDJcclxuLy8gb3B0aW9ucyA9IG9wdGlvbmFsIG9iamVjdCBvZiBvcHRpb25zIChzZWUgYmVsb3cpXHJcblxyXG5leHBvcnQgdmFyIENvdW50VXAgPSBmdW5jdGlvbih0YXJnZXQsIHN0YXJ0VmFsLCBlbmRWYWwsIGRlY2ltYWxzLCBkdXJhdGlvbiwgb3B0aW9ucykge1xyXG5cclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgIHNlbGYudmVyc2lvbiA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcxLjkuMic7IH07XHJcblxyXG4gICAgLy8gZGVmYXVsdCBvcHRpb25zXHJcbiAgICBzZWxmLm9wdGlvbnMgPSB7XHJcbiAgICAgICAgdXNlRWFzaW5nOiB0cnVlLCAvLyB0b2dnbGUgZWFzaW5nXHJcbiAgICAgICAgdXNlR3JvdXBpbmc6IHRydWUsIC8vIDEsMDAwLDAwMCB2cyAxMDAwMDAwXHJcbiAgICAgICAgc2VwYXJhdG9yOiAnLCcsIC8vIGNoYXJhY3RlciB0byB1c2UgYXMgYSBzZXBhcmF0b3JcclxuICAgICAgICBkZWNpbWFsOiAnLicsIC8vIGNoYXJhY3RlciB0byB1c2UgYXMgYSBkZWNpbWFsXHJcbiAgICAgICAgZWFzaW5nRm46IGVhc2VPdXRFeHBvLCAvLyBvcHRpb25hbCBjdXN0b20gZWFzaW5nIGZ1bmN0aW9uLCBkZWZhdWx0IGlzIFJvYmVydCBQZW5uZXIncyBlYXNlT3V0RXhwb1xyXG4gICAgICAgIGZvcm1hdHRpbmdGbjogZm9ybWF0TnVtYmVyLCAvLyBvcHRpb25hbCBjdXN0b20gZm9ybWF0dGluZyBmdW5jdGlvbiwgZGVmYXVsdCBpcyBmb3JtYXROdW1iZXIgYWJvdmVcclxuICAgICAgICBwcmVmaXg6ICckJywgLy8gb3B0aW9uYWwgdGV4dCBiZWZvcmUgdGhlIHJlc3VsdFxyXG4gICAgICAgIHN1ZmZpeDogJycsIC8vIG9wdGlvbmFsIHRleHQgYWZ0ZXIgdGhlIHJlc3VsdFxyXG4gICAgICAgIG51bWVyYWxzOiBbXSAvLyBvcHRpb25hbGx5IHBhc3MgYW4gYXJyYXkgb2YgY3VzdG9tIG51bWVyYWxzIGZvciAwLTlcclxuICAgIH07XHJcblxyXG4gICAgLy8gZXh0ZW5kIGRlZmF1bHQgb3B0aW9ucyB3aXRoIHBhc3NlZCBvcHRpb25zIG9iamVjdFxyXG4gICAgaWYgKG9wdGlvbnMgJiYgdHlwZW9mIG9wdGlvbnMgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgZm9yICh2YXIga2V5IGluIHNlbGYub3B0aW9ucykge1xyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIG9wdGlvbnNba2V5XSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5vcHRpb25zW2tleV0gPSBvcHRpb25zW2tleV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHNlbGYub3B0aW9ucy5zZXBhcmF0b3IgPT09ICcnKSB7XHJcbiAgICAgICAgc2VsZi5vcHRpb25zLnVzZUdyb3VwaW5nID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICAvLyBlbnN1cmUgdGhlIHNlcGFyYXRvciBpcyBhIHN0cmluZyAoZm9ybWF0TnVtYmVyIGFzc3VtZXMgdGhpcylcclxuICAgICAgICBzZWxmLm9wdGlvbnMuc2VwYXJhdG9yID0gJycgKyBzZWxmLm9wdGlvbnMuc2VwYXJhdG9yO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIG1ha2Ugc3VyZSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgYW5kIGNhbmNlbEFuaW1hdGlvbkZyYW1lIGFyZSBkZWZpbmVkXHJcbiAgICAvLyBwb2x5ZmlsbCBmb3IgYnJvd3NlcnMgd2l0aG91dCBuYXRpdmUgc3VwcG9ydFxyXG4gICAgLy8gYnkgT3BlcmEgZW5naW5lZXIgRXJpayBNw7ZsbGVyXHJcbiAgICB2YXIgbGFzdFRpbWUgPSAwO1xyXG4gICAgdmFyIHZlbmRvcnMgPSBbJ3dlYmtpdCcsICdtb3onLCAnbXMnLCAnbyddO1xyXG4gICAgZm9yKHZhciB4ID0gMDsgeCA8IHZlbmRvcnMubGVuZ3RoICYmICF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lOyArK3gpIHtcclxuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93W3ZlbmRvcnNbeF0rJ1JlcXVlc3RBbmltYXRpb25GcmFtZSddO1xyXG4gICAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9IHdpbmRvd1t2ZW5kb3JzW3hdKydDYW5jZWxBbmltYXRpb25GcmFtZSddIHx8IHdpbmRvd1t2ZW5kb3JzW3hdKydDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXTtcclxuICAgIH1cclxuICAgIGlmICghd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSkge1xyXG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihjYWxsYmFjaykge1xyXG4gICAgICAgICAgICB2YXIgY3VyclRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICAgICAgICAgICAgdmFyIHRpbWVUb0NhbGwgPSBNYXRoLm1heCgwLCAxNiAtIChjdXJyVGltZSAtIGxhc3RUaW1lKSk7XHJcbiAgICAgICAgICAgIHZhciBpZCA9IHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBjYWxsYmFjayhjdXJyVGltZSArIHRpbWVUb0NhbGwpOyB9LCB0aW1lVG9DYWxsKTtcclxuICAgICAgICAgICAgbGFzdFRpbWUgPSBjdXJyVGltZSArIHRpbWVUb0NhbGw7XHJcbiAgICAgICAgICAgIHJldHVybiBpZDtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgaWYgKCF3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUpIHtcclxuICAgICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihpZCkge1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoaWQpO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZm9ybWF0TnVtYmVyKG51bSkge1xyXG4gICAgICAgIG51bSA9IG51bS50b0ZpeGVkKHNlbGYuZGVjaW1hbHMpO1xyXG4gICAgICAgIG51bSArPSAnJztcclxuICAgICAgICB2YXIgeCwgeDEsIHgyLCB4MywgaSwgbDtcclxuICAgICAgICB4ID0gbnVtLnNwbGl0KCcuJyk7XHJcbiAgICAgICAgeDEgPSB4WzBdO1xyXG4gICAgICAgIHgyID0geC5sZW5ndGggPiAxID8gc2VsZi5vcHRpb25zLmRlY2ltYWwgKyB4WzFdIDogJyc7XHJcbiAgICAgICAgaWYgKHNlbGYub3B0aW9ucy51c2VHcm91cGluZykge1xyXG4gICAgICAgICAgICB4MyA9ICcnO1xyXG4gICAgICAgICAgICBmb3IgKGkgPSAwLCBsID0geDEubGVuZ3RoOyBpIDwgbDsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaSAhPT0gMCAmJiAoKGkgJSAzKSA9PT0gMCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB4MyA9IHNlbGYub3B0aW9ucy5zZXBhcmF0b3IgKyB4MztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHgzID0geDFbbCAtIGkgLSAxXSArIHgzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHgxID0geDM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIG9wdGlvbmFsIG51bWVyYWwgc3Vic3RpdHV0aW9uXHJcbiAgICAgICAgaWYgKHNlbGYub3B0aW9ucy5udW1lcmFscy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgeDEgPSB4MS5yZXBsYWNlKC9bMC05XS9nLCBmdW5jdGlvbih3KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5vcHRpb25zLm51bWVyYWxzWyt3XTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgeDIgPSB4Mi5yZXBsYWNlKC9bMC05XS9nLCBmdW5jdGlvbih3KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5vcHRpb25zLm51bWVyYWxzWyt3XTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHNlbGYub3B0aW9ucy5wcmVmaXggKyB4MSArIHgyICsgc2VsZi5vcHRpb25zLnN1ZmZpeDtcclxuICAgIH1cclxuICAgIC8vIFJvYmVydCBQZW5uZXIncyBlYXNlT3V0RXhwb1xyXG4gICAgZnVuY3Rpb24gZWFzZU91dEV4cG8odCwgYiwgYywgZCkge1xyXG4gICAgICAgIHJldHVybiBjICogKC1NYXRoLnBvdygyLCAtMTAgKiB0IC8gZCkgKyAxKSAqIDEwMjQgLyAxMDIzICsgYjtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGVuc3VyZU51bWJlcihuKSB7XHJcbiAgICAgICAgcmV0dXJuICh0eXBlb2YgbiA9PT0gJ251bWJlcicgJiYgIWlzTmFOKG4pKTtcclxuICAgIH1cclxuXHJcbiAgICBzZWxmLmluaXRpYWxpemUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoc2VsZi5pbml0aWFsaXplZCkgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgICAgIHNlbGYuZXJyb3IgPSAnJztcclxuICAgICAgICBzZWxmLmQgPSAodHlwZW9mIHRhcmdldCA9PT0gJ3N0cmluZycpID8gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGFyZ2V0KSA6IHRhcmdldDtcclxuICAgICAgICBpZiAoIXNlbGYuZCkge1xyXG4gICAgICAgICAgICBzZWxmLmVycm9yID0gJ1tDb3VudFVwXSB0YXJnZXQgaXMgbnVsbCBvciB1bmRlZmluZWQnXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2VsZi5zdGFydFZhbCA9IE51bWJlcihzdGFydFZhbCk7XHJcbiAgICAgICAgc2VsZi5lbmRWYWwgPSBOdW1iZXIoZW5kVmFsKTtcclxuICAgICAgICAvLyBlcnJvciBjaGVja3NcclxuICAgICAgICBpZiAoZW5zdXJlTnVtYmVyKHNlbGYuc3RhcnRWYWwpICYmIGVuc3VyZU51bWJlcihzZWxmLmVuZFZhbCkpIHtcclxuICAgICAgICAgICAgc2VsZi5kZWNpbWFscyA9IE1hdGgubWF4KDAsIGRlY2ltYWxzIHx8IDApO1xyXG4gICAgICAgICAgICBzZWxmLmRlYyA9IE1hdGgucG93KDEwLCBzZWxmLmRlY2ltYWxzKTtcclxuICAgICAgICAgICAgc2VsZi5kdXJhdGlvbiA9IE51bWJlcihkdXJhdGlvbikgKiAxMDAwIHx8IDIwMDA7XHJcbiAgICAgICAgICAgIHNlbGYuY291bnREb3duID0gKHNlbGYuc3RhcnRWYWwgPiBzZWxmLmVuZFZhbCk7XHJcbiAgICAgICAgICAgIHNlbGYuZnJhbWVWYWwgPSBzZWxmLnN0YXJ0VmFsO1xyXG4gICAgICAgICAgICBzZWxmLmluaXRpYWxpemVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBzZWxmLmVycm9yID0gJ1tDb3VudFVwXSBzdGFydFZhbCAoJytzdGFydFZhbCsnKSBvciBlbmRWYWwgKCcrZW5kVmFsKycpIGlzIG5vdCBhIG51bWJlcic7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIFByaW50IHZhbHVlIHRvIHRhcmdldFxyXG4gICAgc2VsZi5wcmludFZhbHVlID0gZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gc2VsZi5vcHRpb25zLmZvcm1hdHRpbmdGbih2YWx1ZSk7XHJcblxyXG4gICAgICAgIGlmIChzZWxmLmQudGFnTmFtZSA9PT0gJ0lOUFVUJykge1xyXG4gICAgICAgICAgICB0aGlzLmQudmFsdWUgPSByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHNlbGYuZC50YWdOYW1lID09PSAndGV4dCcgfHwgc2VsZi5kLnRhZ05hbWUgPT09ICd0c3BhbicpIHtcclxuICAgICAgICAgICAgdGhpcy5kLnRleHRDb250ZW50ID0gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5kLmlubmVySFRNTCA9IHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2VsZi5kLnRleHQgPSByZXN1bHQ7XHJcbiAgICB9O1xyXG5cclxuICAgIHNlbGYuY291bnQgPSBmdW5jdGlvbih0aW1lc3RhbXApIHtcclxuXHJcbiAgICAgICAgaWYgKCFzZWxmLnN0YXJ0VGltZSkgeyBzZWxmLnN0YXJ0VGltZSA9IHRpbWVzdGFtcDsgfVxyXG5cclxuICAgICAgICBzZWxmLnRpbWVzdGFtcCA9IHRpbWVzdGFtcDtcclxuICAgICAgICB2YXIgcHJvZ3Jlc3MgPSB0aW1lc3RhbXAgLSBzZWxmLnN0YXJ0VGltZTtcclxuICAgICAgICBzZWxmLnJlbWFpbmluZyA9IHNlbGYuZHVyYXRpb24gLSBwcm9ncmVzcztcclxuXHJcbiAgICAgICAgLy8gdG8gZWFzZSBvciBub3QgdG8gZWFzZVxyXG4gICAgICAgIGlmIChzZWxmLm9wdGlvbnMudXNlRWFzaW5nKSB7XHJcbiAgICAgICAgICAgIGlmIChzZWxmLmNvdW50RG93bikge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5mcmFtZVZhbCA9IHNlbGYuc3RhcnRWYWwgLSBzZWxmLm9wdGlvbnMuZWFzaW5nRm4ocHJvZ3Jlc3MsIDAsIHNlbGYuc3RhcnRWYWwgLSBzZWxmLmVuZFZhbCwgc2VsZi5kdXJhdGlvbik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmZyYW1lVmFsID0gc2VsZi5vcHRpb25zLmVhc2luZ0ZuKHByb2dyZXNzLCBzZWxmLnN0YXJ0VmFsLCBzZWxmLmVuZFZhbCAtIHNlbGYuc3RhcnRWYWwsIHNlbGYuZHVyYXRpb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHNlbGYuY291bnREb3duKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmZyYW1lVmFsID0gc2VsZi5zdGFydFZhbCAtICgoc2VsZi5zdGFydFZhbCAtIHNlbGYuZW5kVmFsKSAqIChwcm9ncmVzcyAvIHNlbGYuZHVyYXRpb24pKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuZnJhbWVWYWwgPSBzZWxmLnN0YXJ0VmFsICsgKHNlbGYuZW5kVmFsIC0gc2VsZi5zdGFydFZhbCkgKiAocHJvZ3Jlc3MgLyBzZWxmLmR1cmF0aW9uKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gZG9uJ3QgZ28gcGFzdCBlbmRWYWwgc2luY2UgcHJvZ3Jlc3MgY2FuIGV4Y2VlZCBkdXJhdGlvbiBpbiB0aGUgbGFzdCBmcmFtZVxyXG4gICAgICAgIGlmIChzZWxmLmNvdW50RG93bikge1xyXG4gICAgICAgICAgICBzZWxmLmZyYW1lVmFsID0gKHNlbGYuZnJhbWVWYWwgPCBzZWxmLmVuZFZhbCkgPyBzZWxmLmVuZFZhbCA6IHNlbGYuZnJhbWVWYWw7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc2VsZi5mcmFtZVZhbCA9IChzZWxmLmZyYW1lVmFsID4gc2VsZi5lbmRWYWwpID8gc2VsZi5lbmRWYWwgOiBzZWxmLmZyYW1lVmFsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gZGVjaW1hbFxyXG4gICAgICAgIHNlbGYuZnJhbWVWYWwgPSBNYXRoLnJvdW5kKHNlbGYuZnJhbWVWYWwqc2VsZi5kZWMpL3NlbGYuZGVjO1xyXG5cclxuICAgICAgICAvLyBmb3JtYXQgYW5kIHByaW50IHZhbHVlXHJcbiAgICAgICAgc2VsZi5wcmludFZhbHVlKHNlbGYuZnJhbWVWYWwpO1xyXG5cclxuICAgICAgICAvLyB3aGV0aGVyIHRvIGNvbnRpbnVlXHJcbiAgICAgICAgaWYgKHByb2dyZXNzIDwgc2VsZi5kdXJhdGlvbikge1xyXG4gICAgICAgICAgICBzZWxmLnJBRiA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShzZWxmLmNvdW50KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoc2VsZi5jYWxsYmFjaykgc2VsZi5jYWxsYmFjaygpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvLyBzdGFydCB5b3VyIGFuaW1hdGlvblxyXG4gICAgc2VsZi5zdGFydCA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgaWYgKCFzZWxmLmluaXRpYWxpemUoKSkgcmV0dXJuO1xyXG4gICAgICAgIHNlbGYuY2FsbGJhY2sgPSBjYWxsYmFjaztcclxuICAgICAgICBzZWxmLnJBRiA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShzZWxmLmNvdW50KTtcclxuICAgIH07XHJcbiAgICAvLyB0b2dnbGVzIHBhdXNlL3Jlc3VtZSBhbmltYXRpb25cclxuICAgIHNlbGYucGF1c2VSZXN1bWUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoIXNlbGYucGF1c2VkKSB7XHJcbiAgICAgICAgICAgIHNlbGYucGF1c2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUoc2VsZi5yQUYpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNlbGYucGF1c2VkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBzZWxmLnN0YXJ0VGltZTtcclxuICAgICAgICAgICAgc2VsZi5kdXJhdGlvbiA9IHNlbGYucmVtYWluaW5nO1xyXG4gICAgICAgICAgICBzZWxmLnN0YXJ0VmFsID0gc2VsZi5mcmFtZVZhbDtcclxuICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHNlbGYuY291bnQpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvLyByZXNldCB0byBzdGFydFZhbCBzbyBhbmltYXRpb24gY2FuIGJlIHJ1biBhZ2FpblxyXG4gICAgc2VsZi5yZXNldCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHNlbGYucGF1c2VkID0gZmFsc2U7XHJcbiAgICAgICAgZGVsZXRlIHNlbGYuc3RhcnRUaW1lO1xyXG4gICAgICAgIHNlbGYuaW5pdGlhbGl6ZWQgPSBmYWxzZTtcclxuICAgICAgICBpZiAoc2VsZi5pbml0aWFsaXplKCkpIHtcclxuICAgICAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUoc2VsZi5yQUYpO1xyXG4gICAgICAgICAgICBzZWxmLnByaW50VmFsdWUoc2VsZi5zdGFydFZhbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8vIHBhc3MgYSBuZXcgZW5kVmFsIGFuZCBzdGFydCBhbmltYXRpb25cclxuICAgIHNlbGYudXBkYXRlID0gZnVuY3Rpb24gKG5ld0VuZFZhbCkge1xyXG4gICAgICAgIGlmICghc2VsZi5pbml0aWFsaXplKCkpIHJldHVybjtcclxuICAgICAgICBuZXdFbmRWYWwgPSBOdW1iZXIobmV3RW5kVmFsKTtcclxuICAgICAgICBpZiAoIWVuc3VyZU51bWJlcihuZXdFbmRWYWwpKSB7XHJcbiAgICAgICAgICAgIHNlbGYuZXJyb3IgPSAnW0NvdW50VXBdIHVwZGF0ZSgpIC0gbmV3IGVuZFZhbCBpcyBub3QgYSBudW1iZXI6ICcrbmV3RW5kVmFsO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNlbGYuZXJyb3IgPSAnJztcclxuICAgICAgICBpZiAobmV3RW5kVmFsID09PSBzZWxmLmZyYW1lVmFsKSByZXR1cm47XHJcbiAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUoc2VsZi5yQUYpO1xyXG4gICAgICAgIHNlbGYucGF1c2VkID0gZmFsc2U7XHJcbiAgICAgICAgZGVsZXRlIHNlbGYuc3RhcnRUaW1lO1xyXG4gICAgICAgIHNlbGYuc3RhcnRWYWwgPSBzZWxmLmZyYW1lVmFsO1xyXG4gICAgICAgIHNlbGYuZW5kVmFsID0gbmV3RW5kVmFsO1xyXG4gICAgICAgIHNlbGYuY291bnREb3duID0gKHNlbGYuc3RhcnRWYWwgPiBzZWxmLmVuZFZhbCk7XHJcbiAgICAgICAgc2VsZi5yQUYgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoc2VsZi5jb3VudCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGZvcm1hdCBzdGFydFZhbCBvbiBpbml0aWFsaXphdGlvblxyXG4gICAgaWYgKHNlbGYuaW5pdGlhbGl6ZSgpKSBzZWxmLnByaW50VmFsdWUoc2VsZi5zdGFydFZhbCk7XHJcbn07XHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IHRhcmFzZyBvbiA5LzI4LzIwMTcuXHJcbiAqL1xyXG5cclxuZXhwb3J0IGxldCBGb250U3R5bGVzID0ge1xyXG4gICAgJ2NvdW50ZXJGb250JyA6IG5ldyBQSVhJLlRleHRTdHlsZSh7XHJcbiAgICAgICAgZm9udEZhbWlseTogJ0FyaWFsJyxcclxuICAgICAgICBmb250U2l6ZTogMzYsXHJcbiAgICAgICAgZm9udFN0eWxlOiAnaXRhbGljJyxcclxuICAgICAgICBmb250V2VpZ2h0OiAnYm9sZCcsXHJcbiAgICAgICAgZmlsbDogWycjRkYzRDBEJywgJyNGRkNDMTEnXSwgLy8gZ3JhZGllbnRcclxuICAgICAgICBzdHJva2U6ICcjNGExODUwJyxcclxuICAgICAgICBzdHJva2VUaGlja25lc3M6IDUsXHJcbiAgICAgICAgZHJvcFNoYWRvdzogZmFsc2UsXHJcbiAgICAgICAgZHJvcFNoYWRvd0NvbG9yOiAnIzAwMDAwMCcsXHJcbiAgICAgICAgZHJvcFNoYWRvd0JsdXI6IDQsXHJcbiAgICAgICAgZHJvcFNoYWRvd0FuZ2xlOiBNYXRoLlBJIC8gNixcclxuICAgICAgICBkcm9wU2hhZG93RGlzdGFuY2U6IDYsXHJcbiAgICAgICAgd29yZFdyYXA6IHRydWUsXHJcbiAgICAgICAgd29yZFdyYXBXaWR0aDogNDQwXHJcbiAgICB9KSxcclxuICAgICdwb3NzaWJsZVdpbmNvdW50ZXJGb250JyA6IG5ldyBQSVhJLlRleHRTdHlsZSh7XHJcbiAgICAgICAgZm9udEZhbWlseTogJ0FyaWFsJyxcclxuICAgICAgICBmb250U2l6ZTogMzYsXHJcbiAgICAgICAgZm9udFN0eWxlOiAnaXRhbGljJyxcclxuICAgICAgICBmb250V2VpZ2h0OiAnYm9sZCcsXHJcbiAgICAgICAgZmlsbDogWycjZjhmOGZmJywgJyNmOGY4ZmYnXSwgLy8gZ3JhZGllbnRcclxuICAgICAgICBzdHJva2U6ICcjNGExODUwJyxcclxuICAgICAgICBzdHJva2VUaGlja25lc3M6IDUsXHJcbiAgICAgICAgZHJvcFNoYWRvdzogZmFsc2UsXHJcbiAgICAgICAgZHJvcFNoYWRvd0NvbG9yOiAnIzAwMDAwMCcsXHJcbiAgICAgICAgZHJvcFNoYWRvd0JsdXI6IDQsXHJcbiAgICAgICAgZHJvcFNoYWRvd0FuZ2xlOiBNYXRoLlBJIC8gNixcclxuICAgICAgICBkcm9wU2hhZG93RGlzdGFuY2U6IDYsXHJcbiAgICAgICAgd29yZFdyYXA6IHRydWUsXHJcbiAgICAgICAgd29yZFdyYXBXaWR0aDogNDQwXHJcbiAgICB9KSxcclxuICAgICdzdGFrZUZvbnQnOiBuZXcgUElYSS5UZXh0U3R5bGUoe1xyXG4gICAgICAgIGZvbnRGYW1pbHk6ICdBcmlhbCcsXHJcbiAgICAgICAgZm9udFNpemU6IDI0LFxyXG4gICAgICAgIGZvbnRTdHlsZTogJ2l0YWxpYycsXHJcbiAgICAgICAgZm9udFdlaWdodDogJ2JvbGQnLFxyXG4gICAgICAgIGZpbGw6IFsnI0ZGM0QwRCcsICcjRkZDQzExJ10sIC8vIGdyYWRpZW50XHJcbiAgICAgICAgc3Ryb2tlOiAnIzRhMTg1MCcsXHJcbiAgICAgICAgc3Ryb2tlVGhpY2tuZXNzOiA1LFxyXG4gICAgICAgIGRyb3BTaGFkb3c6IGZhbHNlLFxyXG4gICAgICAgIGRyb3BTaGFkb3dDb2xvcjogJyMwMDAwMDAnLFxyXG4gICAgICAgIGRyb3BTaGFkb3dCbHVyOiA0LFxyXG4gICAgICAgIGRyb3BTaGFkb3dBbmdsZTogTWF0aC5QSSAvIDYsXHJcbiAgICAgICAgZHJvcFNoYWRvd0Rpc3RhbmNlOiA2LFxyXG4gICAgICAgIHdvcmRXcmFwOiB0cnVlLFxyXG4gICAgICAgIHdvcmRXcmFwV2lkdGg6IDQ0MFxyXG4gICAgfSksXHJcbiAgICAnR2FtYmxlVGV4dCcgOiBuZXcgUElYSS5UZXh0U3R5bGUoe1xyXG4gICAgICAgIGZvbnRGYW1pbHk6ICdBcmlhbCcsXHJcbiAgICAgICAgZm9udFNpemU6IDM2LFxyXG4gICAgICAgIGZvbnRTdHlsZTogJ2l0YWxpYycsXHJcbiAgICAgICAgZm9udFdlaWdodDogJ2JvbGQnLFxyXG4gICAgICAgIGZpbGw6IFsnI2Y4ZjhmZicsICcjZjhmOGZmJ10sIC8vIGdyYWRpZW50XHJcbiAgICAgICAgc3Ryb2tlOiAnIzRhMTg1MCcsXHJcbiAgICAgICAgc3Ryb2tlVGhpY2tuZXNzOiA1LFxyXG4gICAgICAgIGRyb3BTaGFkb3c6IGZhbHNlLFxyXG4gICAgICAgIGRyb3BTaGFkb3dDb2xvcjogJyMwMDAwMDAnLFxyXG4gICAgICAgIGRyb3BTaGFkb3dCbHVyOiA0LFxyXG4gICAgICAgIGRyb3BTaGFkb3dBbmdsZTogTWF0aC5QSSAvIDYsXHJcbiAgICAgICAgZHJvcFNoYWRvd0Rpc3RhbmNlOiA2LFxyXG4gICAgICAgIHdvcmRXcmFwOiB0cnVlLFxyXG4gICAgICAgIHdvcmRXcmFwV2lkdGg6IDQ0MFxyXG4gICAgfSksXHJcbiAgICAnQm9udXNDb3VudGVyRm9udCcgOiBuZXcgUElYSS5UZXh0U3R5bGUoe1xyXG4gICAgICAgIGZvbnRGYW1pbHk6ICdBcmlhbCcsXHJcbiAgICAgICAgZm9udFNpemU6IDYwLFxyXG4gICAgICAgIGZvbnRXZWlnaHQ6ICdib2xkJyxcclxuICAgICAgICBmaWxsOiBbJyNGRjNEMEQnLCAnI0ZGQ0MxMSddLCAvLyBncmFkaWVudFxyXG4gICAgICAgIHN0cm9rZTogJyM0YTE4NTAnLFxyXG4gICAgICAgIHN0cm9rZVRoaWNrbmVzczogNSxcclxuICAgICAgICBkcm9wU2hhZG93OiBmYWxzZSxcclxuICAgICAgICBkcm9wU2hhZG93Q29sb3I6ICcjMDAwMDAwJyxcclxuICAgICAgICBkcm9wU2hhZG93Qmx1cjogNCxcclxuICAgICAgICBkcm9wU2hhZG93QW5nbGU6IE1hdGguUEkgLyA2LFxyXG4gICAgICAgIGRyb3BTaGFkb3dEaXN0YW5jZTogNixcclxuICAgICAgICB3b3JkV3JhcDogdHJ1ZSxcclxuICAgICAgICB3b3JkV3JhcFdpZHRoOiA0NDBcclxuICAgIH0pLFxyXG4gICAgJ0JvbnVzRmluYWxDb3VudGVyRm9udCcgOiBuZXcgUElYSS5UZXh0U3R5bGUoe1xyXG4gICAgICAgIGZvbnRGYW1pbHk6ICdBcmlhbCcsXHJcbiAgICAgICAgZm9udFNpemU6IDIwMCxcclxuICAgICAgICBmb250V2VpZ2h0OiAnYm9sZCcsXHJcbiAgICAgICAgZmlsbDogWycjRkYzRDBEJywgJyNGRkNDMTEnXSwgLy8gZ3JhZGllbnRcclxuICAgICAgICBzdHJva2U6ICcjNGExODUwJyxcclxuICAgICAgICBzdHJva2VUaGlja25lc3M6IDUsXHJcbiAgICAgICAgZHJvcFNoYWRvdzogZmFsc2UsXHJcbiAgICAgICAgZHJvcFNoYWRvd0NvbG9yOiAnIzAwMDAwMCcsXHJcbiAgICAgICAgZHJvcFNoYWRvd0JsdXI6IDQsXHJcbiAgICAgICAgZHJvcFNoYWRvd0FuZ2xlOiBNYXRoLlBJIC8gNixcclxuICAgICAgICBkcm9wU2hhZG93RGlzdGFuY2U6IDYsXHJcbiAgICAgICAgd29yZFdyYXA6IHRydWUsXHJcbiAgICAgICAgd29yZFdyYXBXaWR0aDogNDQwXHJcbiAgICB9KSxcclxufTsiLCIvKipcclxuICogQ3JlYXRlZCBieSB0YXJhc2cgb24gOS8yOS8yMDE3LlxyXG4gKi9cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBuZXh0SXRlbShhcnIsIGkpIHtcclxuICAgIGkgPSBpICsgMTtcclxuICAgIGkgPSBpICUgYXJyLmxlbmd0aDtcclxuICAgIHJldHVybiBhcnJbaV07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBwcmV2SXRlbShhcnIsIGkpIHtcclxuICAgIGlmIChpID09PSAwKSB7XHJcbiAgICAgICAgaSA9IGFyci5sZW5ndGg7XHJcbiAgICB9XHJcbiAgICBpID0gaSAtIDE7XHJcbiAgICByZXR1cm4gYXJyW2ldO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0U3Rha2VBbW91bnQoc3Rha2U6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICBpZiAoc3Rha2UgPCAxMDApe1xyXG4gICAgICAgIHJldHVybiAnMC4nK3N0YWtlKydwJztcclxuICAgIH0gZWxzZSBpZiggc3Rha2UgPj0gMTAwKXtcclxuICAgICAgICBsZXQgeCA9IHN0YWtlLzEwMDtcclxuICAgICAgICByZXR1cm4gJyQnK3BhcnNlRmxvYXQoeC50b1N0cmluZygpKS50b0ZpeGVkKDIpO1xyXG4gICAgfVxyXG59XHJcblxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIENyZWF0ZUFuaW1hdGlvbihiYXNlVGV4dHVyZSwgb2JqKSB7XHJcbiAgICBsZXQgbGVuID0gb2JqLmxlbmd0aCxcclxuICAgICAgICB0ZXh0dXJlX2FycmF5ID0gW107XHJcblxyXG4gICAgZm9yIChsZXQgaT0wOyBpPGxlbjtpKyspXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IGZyYW1lID0gb2JqW2ldLFxyXG4gICAgICAgICAgICByZWN0ID0gbmV3IFBJWEkuUmVjdGFuZ2xlKGZyYW1lLngsIGZyYW1lLnksIGZyYW1lLndpZHRoLCBmcmFtZS5oZWlnaHQpLFxyXG4gICAgICAgICAgICB0ZXh0dXJlID0gbmV3IFBJWEkuVGV4dHVyZShiYXNlVGV4dHVyZSwgcmVjdCk7XHJcbiAgICAgICAgdGV4dHVyZV9hcnJheS5wdXNoKHt0ZXh0dXJlOnRleHR1cmUsIHRpbWU6NjZ9KTtcclxuICAgIH1cclxuICAgIHJldHVybiBuZXcgUElYSS5leHRyYXMuQW5pbWF0ZWRTcHJpdGUodGV4dHVyZV9hcnJheSk7XHJcbn0iLCJpbXBvcnQgKiBhcyBTY2VuZXMgZnJvbSBcIi4vU2NlbmVzL0dhbWVTY2VuZXNcIjtcclxuaW1wb3J0IHtTY2VuZU1hbmFnZXJ9IGZyb20gXCIuL1NjZW5lcy9TY2VuZXNNYW5hZ2VyXCI7XHJcbmltcG9ydCB7QmFzZUdhbWVDb250cm9sbGVyfSBmcm9tIFwiLi9Db250cm9sbGVycy9CYXNlR2FtZVwiO1xyXG5pbXBvcnQge1NvdW5kc01hbmFnZXJDbGFzc30gZnJvbSBcIi4vU291bmRzL3NvdW5kc1wiO1xyXG5cclxuXHJcbmV4cG9ydCBjb25zdCBhcHA6IFBJWEkuQXBwbGljYXRpb24gPSBuZXcgUElYSS5BcHBsaWNhdGlvbig5NjAsIDUzNik7XHJcbmV4cG9ydCBsZXQgU0NFTkVfTUFOQUdFUiA9IG5ldyBTY2VuZU1hbmFnZXIoYXBwKTtcclxuZXhwb3J0IGxldCBTb3VuZHNNYW5hZ2VyO1xyXG5leHBvcnQgbGV0IGJhc2VHYW1lU2NlbmU7XHJcbmV4cG9ydCBsZXQgYmFzZUdhbWVDb250cm9sbGVyO1xyXG5cclxuY29uc3QgbG9hZGVyID0gUElYSS5sb2FkZXI7IC8vIFBpeGlKUyBleHBvc2VzIGEgcHJlbWFkZSBpbnN0YW5jZSBmb3IgeW91IHRvIHVzZS5cclxuXHJcbmxvYWRlclxyXG4gICAgLmFkZCgnc2hlZXQnLCAnLi4vTWVkaWEvc3ByaXRlcy5qc29uJylcclxuXHJcbmxvYWRlci5sb2FkKChsb2FkZXIsIHJlc291cmNlcykgPT4ge1xyXG4gICAgLy8gcmVzb3VyY2VzIGlzIGFuIG9iamVjdCB3aGVyZSB0aGUga2V5IGlzIHRoZSBuYW1lIG9mIHRoZSByZXNvdXJjZSBsb2FkZWQgYW5kIHRoZSB2YWx1ZSBpcyB0aGUgcmVzb3VyY2Ugb2JqZWN0LlxyXG4gICAgLy8gVGhleSBoYXZlIGEgY291cGxlIGRlZmF1bHQgcHJvcGVydGllczpcclxuICAgIC8vIC0gYHVybGA6IFRoZSBVUkwgdGhhdCB0aGUgcmVzb3VyY2Ugd2FzIGxvYWRlZCBmcm9tXHJcbiAgICAvLyAtIGBlcnJvcmA6IFRoZSBlcnJvciB0aGF0IGhhcHBlbmVkIHdoZW4gdHJ5aW5nIHRvIGxvYWQgKGlmIGFueSlcclxuICAgIC8vIC0gYGRhdGFgOiBUaGUgcmF3IGRhdGEgdGhhdCB3YXMgbG9hZGVkXHJcbiAgICAvLyBhbHNvIG1heSBjb250YWluIG90aGVyIHByb3BlcnRpZXMgYmFzZWQgb24gdGhlIG1pZGRsZXdhcmUgdGhhdCBydW5zLlxyXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChhcHAudmlldyk7XHJcblxyXG4gICAgbGV0IHRleHR1cmVzID0gbG9hZGVyLnJlc291cmNlcy5zaGVldC50ZXh0dXJlcztcclxuXHJcbiAgICAvLyBTb3VuZHNNYW5hZ2VyID0gbmV3IFNvdW5kc01hbmFnZXJDbGFzcyhyZXNvdXJjZXMpO1xyXG5cclxuICAgIGJhc2VHYW1lU2NlbmUgPSBuZXcgU2NlbmVzLkJhc2VHYW1lU2NlbmUodGV4dHVyZXMpO1xyXG4gICAgU0NFTkVfTUFOQUdFUi5BZGRHYW1lU2NlbmUoJ2Jhc2VHYW1lJywgYmFzZUdhbWVTY2VuZSk7XHJcbiAgICBiYXNlR2FtZUNvbnRyb2xsZXIgPSBuZXcgQmFzZUdhbWVDb250cm9sbGVyKGJhc2VHYW1lU2NlbmUpO1xyXG5cclxuICAgIFNDRU5FX01BTkFHRVIuZ29Ub0dhbWVTY2VuZSgnYmFzZUdhbWUnKTtcclxuXHJcbiAgICBoaWRlU3BsYXNoKCk7XHJcblxyXG4gICAgLy8gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAvLyAgICAgLy8gYXBwLnN0YWdlLnNjYWxlLnNldCh3aW5kb3cuaW5uZXJXaWR0aC85NjAsIHdpbmRvdy5pbm5lckhlaWdodC81MzYpO1xyXG4gICAgLy8gICAgIGhpZGVTcGxhc2goKTtcclxuICAgIC8vIH0sIDEwMDApOyBcclxuXHJcblxyXG59KTtcclxuXHJcblxyXG5mdW5jdGlvbiBoaWRlU3BsYXNoKCl7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3BpbicpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICBsZXQgc3BsYXNoID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NwbGFzaCcpO1xyXG4gICAgc3BsYXNoLmNsYXNzTmFtZSA9J3NwbGFzaEZhZGVPdXQnO1xyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgc3BsYXNoLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICB9LCAxMDAwKTtcclxufVxyXG4iXX0=
