(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helperFuncs_1 = require("../Utils/helperFuncs");
const main_1 = require("../main");
const reelsConfig_1 = require("../ReelSpinner/reelsConfig");
const WinShow_1 = require("./WinShow");
class BaseGameController {
    constructor(scene) {
        this.balance = 10000;
        this.totalWin = 100;
        this.currentStake = 100;
        this.scene = scene;
        this.WinShowController = new WinShow_1.WinShowController(scene);
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
        this.WinShowController.updatePayouts(reelsConfig_1.response);
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

},{"../ReelSpinner/reelsConfig":13,"../Utils/helperFuncs":18,"../main":19,"./WinShow":2}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ButtonEvents_1 = require("../Events/ButtonEvents");
/**
 * Created by tarasg on 10/17/2017.
 */
class WinShowController {
    constructor(scene) {
        this.scene = scene;
        this.currentWinLineIndex = 0;
        this.skipWinShow = false;
        this.onReelAnimEnd = function (e) {
            if (!this.skipWinShow)
                this.onWinShowEnd(e);
        }.bind(this);
        this.onSkipWinShow = function () {
            this.onSkipWinShowFunc();
        }.bind(this);
        document.addEventListener('ReelWinShowAnimEnd', this.onReelAnimEnd);
        document.addEventListener('skipWinShow', this.onSkipWinShow);
    }
    updatePayouts(response) {
        this.payouts = response.data.gameData.playStack[0].lastPlayInModeData.slotsData.actions[1].payouts;
    }
    playWinShow() {
        this.skipWinShow = false;
        this.playingWinShow = true;
        let payoutObj = this.payouts[this.currentWinLineIndex];
        if (payoutObj.context.symbolPayoutType == "WinLine" && !this.skipWinShow) {
            let winOnLine = payoutObj.payoutData.payoutWinAmount, winline = this.scene.WinLines[payoutObj.context.winLineIndex], winSymbols = this.parseWinSymbols(payoutObj), positionOnReel = this.parsePositionIndex(payoutObj);
            this.currentWinLine = winline;
            let symbol = payoutObj.context.symbol;
            winline.winShow(winSymbols, positionOnReel, winOnLine, symbol);
        }
    }
    onSkipWinShowFunc() {
        if (this.currentWinLine && this.playingWinShow) {
            this.skipWinShow = true;
            this.playingWinShow = false;
            this.currentWinLineIndex = 0;
            this.currentWinLine.stopWinShow();
            document.dispatchEvent(ButtonEvents_1.ButtonEvents.CollectButtonPressed);
        }
    }
    onWinShowEnd(event) {
        if (event.detail.reelIndex == (this.currentWinLine.currentWinSymbolsAmount - 1)) {
            this.currentWinLine.stopWinShow();
            this.updateWinlineIndex();
            this.playWinShow();
        }
    }
    parseWinSymbols(payoutObj) {
        let winSymbols = [];
        for (let i = 0; i < payoutObj.context.winningSymbols.length; i++) {
            winSymbols.push(payoutObj.context.winningSymbols[i].symbol);
        }
        return winSymbols;
    }
    parsePositionIndex(payoutObj) {
        let positions = [];
        for (let i = 0; i < payoutObj.context.winningSymbols.length; i++) {
            positions.push(payoutObj.context.winningSymbols[i].positionOnReel);
        }
        return positions;
    }
    updateWinlineIndex() {
        this.currentWinLineIndex++;
        if (this.currentWinLineIndex >= this.payouts.length)
            this.currentWinLineIndex = 0;
    }
}
exports.WinShowController = WinShowController;

},{"../Events/ButtonEvents":3}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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

},{"../Utils/helperFuncs":18,"../main":19,"./buttonNames":7}],5:[function(require,module,exports){
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

},{"../Utils/counter":16,"../main":19,"./buttonNames":7}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Lines_1 = require("../Math/Lines");
const reelsConfig_1 = require("../ReelSpinner/reelsConfig");
const NumericField_1 = require("./NumericField");
const fontStyles_1 = require("../Utils/fontStyles");
const helperFuncs_1 = require("../Utils/helperFuncs");
/**
 * Created by tarasg on 10/17/2017.
 */
class SimpleWinLine {
    constructor(scene, lineNumber, resources) {
        this.scene = scene;
        this.resources = resources;
        this.lineNumber = lineNumber;
        this.line = Lines_1.WinLinesArray[lineNumber];
        this.currentWinSymbolsAmount = 0;
        this.WinLineTexture = resources['Bet_Line'];
        this.WinLineSprite = new PIXI.Sprite(this.WinLineTexture);
        this.WinLineSprite.x = Lines_1.winLinesPos[this.lineNumber][0];
        this.WinLineSprite.y = Lines_1.winLinesPos[this.lineNumber][1];
        this.WinLineSprite.visible = false;
        this.scene.addChild(this.WinLineSprite);
    }
    winShow(symbols, indexes, win, mainSymbol) {
        this.WinLineSprite.visible = true;
        let amount = symbols.length;
        this.currentWinSymbolsAmount = amount;
        // Draw winning symbols and lines between them
        for (let i = 0; i < amount; i++) {
            // Draw animation
            this.scene.REELS.reelsArray[i].playWinShow(symbols[i], indexes[i]);
        }
    }
    stopWinShow() {
        this.WinLineSprite.visible = false;
        for (let i = 0; i < this.currentWinSymbolsAmount; i++) {
            this.scene.REELS.reelsArray[i].stopWinShow(this.line[i]);
        }
    }
}
exports.SimpleWinLine = SimpleWinLine;
class WinLine {
    constructor(scene, LineNumber, WinLineTexture, WinBoxTexture, WinAmountFieldTexture, resources) {
        this.scene = scene;
        this.resources = resources;
        this.lineNumber = LineNumber;
        this.linePoints = [];
        this.currentWinSymbolsAmount = 0;
        this.lineNumberSprite = new PIXI.Sprite();
        this.WinLineTexture = WinLineTexture;
        this.WinBoxTexture = WinBoxTexture;
        this.WinAmountFieldTexture = WinAmountFieldTexture;
        this.winAmountF_y = Lines_1.PointsMatrix[1][1].y + this.WinBoxTexture.height / 2;
        this.winAmountF_x = Lines_1.PointsMatrix[1][1].x - WinAmountFieldTexture.width / 2;
        this.winAmountField = new NumericField_1.NumericField(scene, 'WinLineAmountField', this.winAmountF_x, this.winAmountF_y, resources, fontStyles_1.FontStyles.stakeFont);
        this.winAmountField.hide();
        // this.winLineSounds = [
        //     new Audio(this.resources.bf_symbol.url),
        //     new Audio(this.resources.bf_symbol.url),
        //     new Audio(this.resources['7_symbol'].url),
        //     new Audio(this.resources.wm_symbol.url),
        //     new Audio(this.resources.plum_symbol.url),
        //     new Audio(this.resources.orange_symbol.url),
        //     new Audio(this.resources.lemon_symbol.url),
        //     new Audio(this.resources.cherry_symbol.url)
        // ];
        this.winBoxes = [
            new PIXI.Sprite(WinBoxTexture),
            new PIXI.Sprite(WinBoxTexture),
            new PIXI.Sprite(WinBoxTexture),
            new PIXI.Sprite(WinBoxTexture),
            new PIXI.Sprite(WinBoxTexture)
        ];
        this.WinRopes = [
            new PIXI.mesh.Rope(WinLineTexture, []),
            new PIXI.mesh.Rope(WinLineTexture, []),
            new PIXI.mesh.Rope(WinLineTexture, []),
            new PIXI.mesh.Rope(WinLineTexture, []),
            new PIXI.mesh.Rope(WinLineTexture, [])
        ];
        this.line = Lines_1.WinLinesArray[LineNumber];
        // this.initializeLineNumber(LineNumber);
        this.initializeLine();
        this.initializeLineRope();
    }
    // private initializeLineNumber(LineNumber: number): void {
    //     this.lineNumberSprite.texture = LineNumbers[LineNumber].IdleTexture;
    //     this.scene.addChild(this.lineNumberSprite);
    //     this.lineNumberSprite.x = LineNumbers[LineNumber].x;
    //     this.lineNumberSprite.y = LineNumbers[LineNumber].y;
    // }
    initializeLine() {
        for (let i = 0; i < this.line.length; i++) {
            this.linePoints.push(Lines_1.PointsMatrix[i][this.line[i]]);
        }
    }
    initializeLineRope() {
        this.LineRope = new PIXI.mesh.Rope(this.WinLineTexture, this.linePoints);
        this.scene.addChild(this.LineRope);
        this.LineRope.visible = false;
    }
    showWinLine() {
        this.LineRope.visible = true;
        // this.lineNumberSprite.texture = LineNumbers[this.lineNumber].SelectedTexture;
    }
    hideWinLine() {
        this.LineRope.visible = false;
        // this.lineNumberSprite.texture = LineNumbers[this.lineNumber].IdleTexture;
    }
    disableWinLine() {
        // this.lineNumberSprite.texture = LineNumbers[this.lineNumber].DisabledTexture;
    }
    winShow(symbols, indexes, win, mainSymbol) {
        this.scene.winLinesArray[this.lineNumber].setTextureToggled();
        let amount = symbols.length;
        this.currentWinSymbolsAmount = amount;
        this.mainSymbol = mainSymbol;
        this.winLineSounds[mainSymbol].play();
        // Draw the end of the line
        if (amount < this.scene.REELS.reelsArray.length) {
            this.drawWinLineEnd(amount);
        }
        // Draw winning symbols and lines between them
        for (let i = 0; i < amount; i++) {
            if (i < amount - 1) {
                this.drawRope(i);
            }
            // Draw animation
            this.scene.REELS.reelsArray[i].playWinShow(symbols[i], indexes[i]);
            // Draw WinBoxes around symbols
            this.winBoxes[i].anchor.set(0.5, 0.5);
            this.winBoxes[i].x = Lines_1.PointsMatrix[i][indexes[i]].x;
            this.winBoxes[i].y = Lines_1.PointsMatrix[i][indexes[i]].y;
            this.winBoxes[i].visible = true;
            this.scene.addChild(this.winBoxes[i]);
        }
        // Draw WinLine Amount Field
        if (amount == 2) {
            this.winAmountField.fieldContainer.x = Lines_1.PointsMatrix[1][1].x - this.WinAmountFieldTexture.width / 2;
            this.winAmountField.fieldContainer.y = Lines_1.PointsMatrix[1][amount - 1].y + this.WinBoxTexture.height / 2;
        }
        else {
            this.winAmountField.fieldContainer.x = Lines_1.PointsMatrix[2][1].x - this.WinAmountFieldTexture.width / 2;
            this.winAmountField.fieldContainer.y = Lines_1.PointsMatrix[2][indexes[2]].y + this.WinBoxTexture.height / 2;
        }
        this.winAmountField.text.text = helperFuncs_1.formatStakeAmount(win);
        this.winAmountField.show();
    }
    stopWinShow() {
        this.winLineSounds[this.mainSymbol].pause();
        this.winLineSounds[this.mainSymbol].currentTime = 0;
        this.scene.winLinesArray[this.lineNumber].setTextureDisabled();
        for (let i = 0; i < this.currentWinSymbolsAmount; i++) {
            this.WinRopes[i].destroy();
            this.scene.REELS.reelsArray[i].stopWinShow(this.line[i]);
            this.winBoxes[i].visible = false;
        }
        this.winAmountField.hide();
    }
    drawWinLineEnd(amount) {
        let points = this.linePoints.slice(amount - 1);
        // set first point to the end of the last WinBox
        points[0] = this.getStartEndPoints(this.linePoints[amount - 1], this.linePoints[amount])[0];
        this.WinRopes[amount - 1] = new PIXI.mesh.Rope(this.WinLineTexture, points);
        this.scene.addChild(this.WinRopes[amount - 1]);
    }
    drawRope(index) {
        let points = this.getStartEndPoints(this.linePoints[index], this.linePoints[index + 1]);
        this.WinRopes[index] = new PIXI.mesh.Rope(this.WinLineTexture, points);
        this.scene.addChild(this.WinRopes[index]);
    }
    getStartEndPoints(point1, point2) {
        let A, B, C, k, b, result = [];
        A = point2.y - point1.y;
        B = point1.x - point2.x;
        C = point1.y * point2.x - point1.x * point2.y;
        k = (A / B) == 0 ? 0 : -(A / B);
        b = (C / B) == 0 ? 0 : -(C / B);
        // get coordinates of places where winLine can possibly intersect with WinBox where it starts
        let possibleStarts = [
            new PIXI.Point(Math.floor(point1.x + reelsConfig_1.symbolWidth / 2), Math.floor(k * (point1.x + reelsConfig_1.symbolWidth / 2) + b)),
            new PIXI.Point(Math.floor(((point1.y + reelsConfig_1.symbolHeight / 2) - b) / k), Math.floor(point1.y + reelsConfig_1.symbolHeight / 2)),
            new PIXI.Point(Math.floor(((point1.y - reelsConfig_1.symbolHeight / 2) - b) / k), Math.floor(point1.y - reelsConfig_1.symbolHeight / 2))
        ];
        // choose the one that lies on the egde of the Winbox
        for (let i = 0; i < 3; i++) {
            let point = possibleStarts[i];
            if (point.x <= Math.floor(point1.x + reelsConfig_1.symbolWidth / 2) && point.x >= point1.x && point.y <= Math.floor(point1.y + reelsConfig_1.symbolHeight / 2) && point.y >= Math.floor(point1.y - reelsConfig_1.symbolHeight / 2)) {
                point.y += Math.floor((reelsConfig_1.WinBoxHeight - reelsConfig_1.symbolHeight) / 2);
                result.push(point);
            }
        }
        // get coordinates of places where winLine can possibly intersect with WinBox where it ends
        let possibleEnds = [
            new PIXI.Point(Math.floor(point2.x - reelsConfig_1.symbolWidth / 2), Math.floor(k * (point2.x - reelsConfig_1.symbolWidth / 2) + b)),
            new PIXI.Point(Math.floor(((point2.y + reelsConfig_1.symbolHeight / 2) - b) / k), Math.floor(point2.y + reelsConfig_1.symbolHeight / 2)),
            new PIXI.Point(Math.floor(((point2.y - reelsConfig_1.symbolHeight / 2) - b) / k), Math.floor(point2.y - reelsConfig_1.symbolHeight / 2))
        ];
        // choose the one that lies on the egde of the Winbox
        for (let i = 0; i < 3; i++) {
            let point = possibleEnds[i];
            if (point.x >= Math.floor(point2.x - reelsConfig_1.symbolWidth / 2) && point.x <= point2.x && point.y <= Math.floor(point2.y + reelsConfig_1.symbolHeight / 2) && point.y >= Math.floor(point2.y - reelsConfig_1.symbolHeight / 2)) {
                point.x += Math.floor((reelsConfig_1.WinBoxWidth - reelsConfig_1.symbolWidth) / 2);
                point.y += Math.floor((reelsConfig_1.WinBoxHeight - reelsConfig_1.symbolHeight) / 2);
                result.push(point);
            }
        }
        return result;
    }
}
exports.WinLine = WinLine;

},{"../Math/Lines":8,"../ReelSpinner/reelsConfig":13,"../Utils/fontStyles":17,"../Utils/helperFuncs":18,"./NumericField":5}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
/**
 * Created by tarasg on 4/25/2017.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LINE1 = [1, 1, 1], exports.LINE2 = [0, 0, 0], exports.LINE3 = [2, 2, 2];
// LINE4  = [0,1,2,1,0],
// LINE5  = [2,1,0,1,2],
// LINE6  = [1,0,0,0,1],
// LINE7  = [1,2,2,2,1],
// LINE8  = [0,0,1,2,2],
// LINE9  = [2,2,1,0,0],
// LINE10 = [1,2,1,0,1],
// LINE11 = [1,0,1,2,1],
// LINE12 = [0,1,1,1,0],
// LINE13 = [2,1,1,1,2],
// LINE14 = [0,1,0,1,0],
// LINE15 = [2,1,2,1,2],
// LINE16 = [1,1,0,1,1],
// LINE17 = [1,1,2,1,1],
// LINE18 = [0,0,2,0,0],
// LINE19 = [2,2,0,2,2],
// LINE20 = [0,2,2,2,0];
exports.WinLinesArray = [exports.LINE1, exports.LINE2, exports.LINE3];
exports.PointsMatrix = [
    [new PIXI.Point(100, 250), new PIXI.Point(100, 480), new PIXI.Point(100, 725)],
    [new PIXI.Point(350, 250), new PIXI.Point(350, 480), new PIXI.Point(350, 725)],
    [new PIXI.Point(600, 250), new PIXI.Point(600, 480), new PIXI.Point(600, 725)]
];
exports.winLinesPos = [
    [50, 280],
    [50, 130],
    [50, 430]
];

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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
        //for winshow
        this.scaleCount = 1;
        this.scaleStop = 5;
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
        let iSymbol = MainRoundSymbols_1.SYMBOLS[symbol];
        this.winshowSprite = new PIXI.Sprite(this.resources[iSymbol.name]);
        this.reelContainer.addChild(this.winshowSprite);
        this.winshowSprite.y = this.tempReel[this.reelSymbolsAmount - index - 1].y;
        this.winshowSprite.anchor.set(0.5, 0.5);
        this.winshowSprite.x += this.winshowSprite.width / 2;
        this.winshowSprite.y += this.winshowSprite.height / 2;
        this.scalex = this.winshowSprite.scale.x;
        this.scaley = this.winshowSprite.scale.y;
        main_1.app.ticker.add(this.winshow, this);
    }
    stopWinShow(index) {
        main_1.app.ticker.remove(this.winshow, self);
        this.scaleCount = 1;
        this.reelContainer.removeChild(this.winshowSprite);
        this.tempReel[this.reelSymbolsAmount - index - 1].visible = true;
    }
    winshow(timedelta) {
        let self = this;
        if (document.hasFocus()) {
            if (this.scaleCount != this.scaleStop) {
                if (this.scaleCount % 2 == 0) {
                    this.scaleDown(timedelta);
                }
                else {
                    this.scaleUp(timedelta);
                }
            }
            else {
                main_1.app.ticker.remove(this.winshow, self);
                this.scaleCount = 1;
                this.reelContainer.removeChild(this.winshowSprite);
                let winShowEndEvent = new CustomEvent('ReelWinShowAnimEnd', { 'detail': { 'reelIndex': this.index } });
                document.dispatchEvent(winShowEndEvent);
            }
        }
    }
    scaleUp(timedelta) {
        if (document.hasFocus()) {
            if (this.winshowSprite.scale.x < (this.scalex * 1.2)) {
                let newValue = [this.winshowSprite.scale.x + 0.008, this.winshowSprite.scale.y + 0.008];
                this.winshowSprite.scale.set(newValue[0] * timedelta, newValue[1] * timedelta);
            }
            else {
                this.scaleCount++;
            }
        }
    }
    scaleDown(timedelta) {
        if (document.hasFocus()) {
            if (this.winshowSprite.scale.x > this.scalex) {
                let newValue = [this.winshowSprite.scale.x - 0.008, this.winshowSprite.scale.y - 0.008];
                this.winshowSprite.scale.set(newValue[0] * timedelta, newValue[1] * timedelta);
            }
            else {
                this.winshowSprite.scale.x = this.scalex;
                this.winshowSprite.scale.y = this.scaley;
                this.scaleCount++;
            }
        }
    }
}
exports.ReelN = ReelN;

},{"../ReelSpinner/reelsConfig":13,"../main":19,"./MainRoundSymbols":9,"./ReelSets":11}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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

},{"./NewReel":10,"./reelsConfig":13}],13:[function(require,module,exports){
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
        "winAmount": 500,
        "gameData": {
            "_type": "ryota:GameResponse",
            "stake": 500,
            "totalWinAmount": 500,
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
                                                "winLineIndex": 0,
                                                "winningSymbols": [
                                                    {
                                                        "symbol": 3,
                                                        "reelIndex": 0,
                                                        "positionOnReel": 1
                                                    },
                                                    {
                                                        "symbol": 1,
                                                        "reelIndex": 1,
                                                        "positionOnReel": 1
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
                                                "winLineIndex": 1,
                                                "winningSymbols": [
                                                    {
                                                        "symbol": 1,
                                                        "reelIndex": 0,
                                                        "positionOnReel": 0
                                                    },
                                                    {
                                                        "symbol": 3,
                                                        "reelIndex": 1,
                                                        "positionOnReel": 0
                                                    },
                                                    {
                                                        "symbol": 3,
                                                        "reelIndex": 2,
                                                        "positionOnReel": 0
                                                    }
                                                ],
                                                "symbol": 3,
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
                                                "winLineIndex": 2,
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
                                                        "symbol": 1,
                                                        "reelIndex": 2,
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

},{}],14:[function(require,module,exports){
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
const WinLineClass_1 = require("../Layout/WinLineClass");
class BaseGameScene extends PIXI.Container {
    constructor(resources) {
        super();
        this.resources = resources;
        // backgorund
        this.sceneBackground = new PIXI.Sprite(resources['BG']);
        this.addChild(this.sceneBackground);
        this.winline0 = new WinLineClass_1.SimpleWinLine(this, 0, resources);
        this.winline1 = new WinLineClass_1.SimpleWinLine(this, 1, resources);
        this.winline2 = new WinLineClass_1.SimpleWinLine(this, 2, resources);
        this.WinLines = [this.winline0, this.winline1, this.winline2];
        //Reels;
        this.REELS = new ReelSpinner_1.ReelSpinner(this, resources);
        this.startButton = new Buttons_1.Button(this, 873, 267, 'StartButton', resources, this.onStartButton);
        this.stopButton = new Buttons_1.Button(this, 873, 267, 'StopButton', resources, this.onStopButton);
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

},{"../Events/ButtonEvents":3,"../Layout/Buttons":4,"../Layout/NumericField":5,"../Layout/WinLineClass":6,"../ReelSpinner/ReelSpinner":12,"../Utils/fontStyles":17}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Scenes = require("./Scenes/GameScenes");
const ScenesManager_1 = require("./Scenes/ScenesManager");
const BaseGame_1 = require("./Controllers/BaseGame");
let appSize = [960, 536];
exports.app = new PIXI.Application(window.innerWidth, window.innerHeight);
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
});
function hideSplash() {
    document.getElementById('spin').style.display = 'none';
    let splash = document.getElementById('splash');
    let scaleArray = getScaleArray();
    exports.app.stage.scale.set(scaleArray[0], scaleArray[1]);
    splash.className = 'splashFadeOut';
    setTimeout(function () {
        splash.style.display = 'none';
    }, 1000);
}
function getScaleArray() {
    let result = [];
    result[0] = window.innerWidth / appSize[0];
    result[1] = window.innerHeight / appSize[1];
    return result;
}

},{"./Controllers/BaseGame":1,"./Scenes/GameScenes":14,"./Scenes/ScenesManager":15}]},{},[19])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQ29udHJvbGxlcnMvQmFzZUdhbWUudHMiLCJzcmMvQ29udHJvbGxlcnMvV2luU2hvdy50cyIsInNyYy9FdmVudHMvQnV0dG9uRXZlbnRzLnRzIiwic3JjL0xheW91dC9CdXR0b25zLnRzIiwic3JjL0xheW91dC9OdW1lcmljRmllbGQudHMiLCJzcmMvTGF5b3V0L1dpbkxpbmVDbGFzcy50cyIsInNyYy9MYXlvdXQvYnV0dG9uTmFtZXMudHMiLCJzcmMvTWF0aC9MaW5lcy50cyIsInNyYy9SZWVsU3Bpbm5lci9NYWluUm91bmRTeW1ib2xzLnRzIiwic3JjL1JlZWxTcGlubmVyL05ld1JlZWwudHMiLCJzcmMvUmVlbFNwaW5uZXIvUmVlbFNldHMudHMiLCJzcmMvUmVlbFNwaW5uZXIvUmVlbFNwaW5uZXIudHMiLCJzcmMvUmVlbFNwaW5uZXIvcmVlbHNDb25maWcudHMiLCJzcmMvU2NlbmVzL0dhbWVTY2VuZXMudHMiLCJzcmMvU2NlbmVzL1NjZW5lc01hbmFnZXIudHMiLCJzcmMvVXRpbHMvY291bnRlci50cyIsInNyYy9VdGlscy9mb250U3R5bGVzLnRzIiwic3JjL1V0aWxzL2hlbHBlckZ1bmNzLnRzIiwic3JjL21haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0tBLHNEQUFpRTtBQUNqRSxrQ0FBc0M7QUFDdEMsNERBQW9EO0FBQ3BELHVDQUE0QztBQVU1QztJQW9CSSxZQUFZLEtBQW9CO1FBZnpCLFlBQU8sR0FBVyxLQUFLLENBQUM7UUFDeEIsYUFBUSxHQUFXLEdBQUcsQ0FBQztRQUN2QixpQkFBWSxHQUFXLEdBQUcsQ0FBQztRQWM5QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSwyQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUV0RCxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQy9DLDBDQUEwQztRQUMxQyxJQUFJLENBQUMsWUFBWSxHQUFHO1lBQ2hCLE1BQU0sRUFBRztnQkFDTCxFQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFDO2dCQUNyRCxFQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFDO2FBVXJEO1lBQ0QsT0FBTyxFQUFFO2dCQUNMLEVBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUM7Z0JBQ25ELEVBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUM7YUFVdkQ7WUFDRCxTQUFTLEVBQUU7Z0JBQ1AsRUFBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBQztnQkFDbkQsRUFBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBQzthQVVyRDtTQUNKLENBQUM7UUFFRixJQUFJLENBQUMsYUFBYSxHQUFHO1lBQ2pCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzdCLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFYixJQUFJLENBQUMsV0FBVyxHQUFHO1lBQ2YsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQzNCLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFYixJQUFJLENBQUMsU0FBUyxHQUFHO1lBQ2IsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3pCLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFYixJQUFJLENBQUMsYUFBYSxHQUFHO1lBQ2pCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzdCLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFYixJQUFJLENBQUMsYUFBYSxHQUFHLFVBQVUsQ0FBQztZQUM1QixJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDOUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUViLElBQUksQ0FBQyxRQUFRLEdBQUc7WUFDWixJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUM5QixDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRWIsSUFBSSxDQUFDLFFBQVEsR0FBRztZQUNaLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUN4QixDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRWIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN0QixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztJQUU3QixDQUFDO0lBRU0sUUFBUSxDQUFDLEtBQVk7UUFDeEIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFFbkIsRUFBRSxDQUFDLENBQUMsS0FBSyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDbEIsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFDaEMsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDakMsQ0FBQztRQUNELHFCQUFxQjtRQUNyQixJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNoRCxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUN0QyxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLFFBQVEsQ0FBQyxDQUFBLENBQUM7Z0JBQ2xDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDbkMsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLFNBQVMsQ0FBQyxDQUFBLENBQUM7Z0JBQzFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDcEMsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLE1BQU0sQ0FBQyxDQUFBLENBQUM7Z0JBQ3ZDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDakMsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBR08saUJBQWlCO1FBQ3JCLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDcEUsUUFBUSxDQUFDLGdCQUFnQixDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMvRCxRQUFRLENBQUMsZ0JBQWdCLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQy9ELFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDakUsUUFBUSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNsRSxRQUFRLENBQUMsZ0JBQWdCLENBQUMscUJBQXFCLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2hFLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxxQkFBcUIsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDaEUsUUFBUSxDQUFDLGdCQUFnQixDQUFDLG1CQUFtQixFQUFFO1lBQzNDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQTtRQUNsQixDQUFDLENBQUMsQ0FBQztRQUNILFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyx5QkFBeUIsRUFBRTtZQUNqRCw0Q0FBNEM7WUFDNUMsZ0NBQWdDO1FBQ3BDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsUUFBUSxDQUFDLGdCQUFnQixDQUFDLG1CQUFtQixFQUFFO1lBQzNDLG9CQUFhLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzVDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsUUFBUSxDQUFDLGdCQUFnQixDQUFDLHdCQUF3QixFQUFFO1lBQ2hELHVDQUF1QztZQUN2QywwQ0FBMEM7WUFDMUMsSUFBSTtRQUNSLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUVkLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxpQkFBaUIsRUFBRTtZQUN6Qyx5Q0FBeUM7WUFDekMsb0JBQW9CO1FBRXhCLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUVkLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxzQkFBc0IsRUFBRTtZQUM5QyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDckIsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFFTyxvQkFBb0I7UUFDeEIsUUFBUSxDQUFDLG1CQUFtQixDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQTtJQUUxRSxDQUFDO0lBRU8sYUFBYTtRQUNqQixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUMvQixDQUFDO0lBRU8saUJBQWlCO1FBQ3JCLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3pDLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQztRQUNsQyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsc0JBQVEsQ0FBQyxDQUFDO1FBQy9DLElBQUksQ0FBQyxRQUFRLEdBQUcsc0JBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQztRQUN0RCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLHNCQUFRLENBQUMsQ0FBQztRQUN6QyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUVPLGFBQWEsQ0FBQyxhQUFhO1FBQy9CLElBQUksYUFBYSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLEVBQzVILE1BQU0sR0FBRyxDQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLENBQUMsQ0FBQztRQUM5QixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFFLGFBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUN6QyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsR0FBRyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1FBQ2xHLENBQUM7UUFDRCxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFTyxlQUFlO1FBQ25CLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUEsQ0FBQztZQUNwQixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3RCLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzlCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDekIsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1lBQzlCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNyQyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3JELENBQUM7SUFDTCxDQUFDO0lBRVEsaUJBQWlCO1FBQ3RCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFBLENBQUM7WUFDaEMsSUFBSSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLGtCQUFrQixDQUFDLEVBQ3BHLFNBQVMsR0FBRyxzQkFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1lBQzNFLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUVsRCxDQUFDO1FBQ0QsSUFBSSxDQUFDLENBQUM7WUFDRixJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUN2QyxDQUFDO0lBQ0wsQ0FBQztJQUVPLGtCQUFrQjtRQUN0QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQ25DLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2pDLHdDQUF3QztZQUN4QyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2pCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2hDLHVDQUF1QztZQUN2QyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2hCLENBQUM7SUFDTCxDQUFDO0lBRU8saUJBQWlCLENBQUMsS0FBSztRQUMzQixJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO1FBQzFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0lBQzlCLENBQUM7SUFFTyxrQkFBa0I7UUFDdEIsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFFLENBQUMsR0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3RDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUM7Z0JBQy9CLFFBQVEsQ0FBQztZQUNiLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNuRCxLQUFLLENBQUE7WUFDVCxDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7SUFFTyxZQUFZO1FBQ2hCLHlDQUF5QztRQUN6QywrQ0FBK0M7SUFDbkQsQ0FBQztJQUVPLFNBQVM7UUFDYixJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDekMsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNoRCxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDOUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDbEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBRU8scUJBQXFCO1FBQ3pCLDBEQUEwRDtRQUMxRCw2Q0FBNkM7UUFDN0MsSUFBSTtJQUNSLENBQUM7SUFDTyxvQkFBb0I7UUFDeEIsMERBQTBEO1FBQzFELDRDQUE0QztRQUM1QyxJQUFJO0lBQ1IsQ0FBQztDQUtKO0FBMVFELGdEQTBRQzs7Ozs7QUMzUkQseURBQW1EO0FBQ25EOztHQUVHO0FBSUg7SUFZSSxZQUFZLEtBQVU7UUFDbEIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLG1CQUFtQixHQUFHLENBQUMsQ0FBQztRQUM3QixJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztRQUN6QixJQUFJLENBQUMsYUFBYSxHQUFHLFVBQVUsQ0FBQztZQUM1QixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUM7Z0JBQ2xCLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUViLElBQUksQ0FBQyxhQUFhLEdBQUc7WUFDakIsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDN0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUViLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDcEUsUUFBUSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDakUsQ0FBQztJQUVNLGFBQWEsQ0FBQyxRQUFRO1FBQ3pCLElBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO0lBQ3ZHLENBQUM7SUFFTSxXQUFXO1FBQ2QsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7UUFDekIsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7UUFDM0IsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUV2RCxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLGdCQUFnQixJQUFJLFNBQVMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ3ZFLElBQUksU0FBUyxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUMsZUFBZSxFQUNoRCxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsRUFDN0QsVUFBVSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLEVBQzVDLGNBQWMsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDeEQsSUFBSSxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUM7WUFDOUIsSUFBSSxNQUFNLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7WUFDdEMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsY0FBYyxFQUFHLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNwRSxDQUFDO0lBRUwsQ0FBQztJQUVPLGlCQUFpQjtRQUNyQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO1lBQzdDLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1lBQ3hCLElBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDO1lBQzVCLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxDQUFDLENBQUM7WUFDN0IsSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNsQyxRQUFRLENBQUMsYUFBYSxDQUFDLDJCQUFZLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtRQUM3RCxDQUFDO0lBR0wsQ0FBQztJQUVPLFlBQVksQ0FBQyxLQUFLO1FBQ3RCLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBUyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyx1QkFBdUIsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNsQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUMxQixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDdkIsQ0FBQztJQUVMLENBQUM7SUFFTyxlQUFlLENBQUMsU0FBYTtRQUNqQyxJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7UUFDcEIsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFFLENBQUMsR0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUMzRCxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQy9ELENBQUM7UUFDRCxNQUFNLENBQUMsVUFBVSxDQUFDO0lBQ3RCLENBQUM7SUFDTyxrQkFBa0IsQ0FBQyxTQUFhO1FBQ3BDLElBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUNuQixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQzNELFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUE7UUFDdEUsQ0FBQztRQUNELE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDckIsQ0FBQztJQUdPLGtCQUFrQjtRQUN0QixJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUMzQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7WUFDaEQsSUFBSSxDQUFDLG1CQUFtQixHQUFHLENBQUMsQ0FBQztJQUNyQyxDQUFDO0NBRUo7QUE3RkQsOENBNkZDOzs7QUNyR0Q7O0dBRUc7OztBQUdILElBQUksZ0JBQWdCLEdBQUcsSUFBSSxXQUFXLENBQUMsa0JBQWtCLENBQUMsRUFDdEQsa0JBQWtCLEdBQUcsSUFBSSxXQUFXLENBQUMsb0JBQW9CLENBQUMsRUFDMUQsb0JBQW9CLEdBQUcsSUFBSSxXQUFXLENBQUMsc0JBQXNCLENBQUMsRUFDOUQsc0JBQXNCLEdBQUcsSUFBSSxXQUFXLENBQUMsd0JBQXdCLENBQUMsRUFDbEUsZ0JBQWdCLEdBQUcsSUFBSSxXQUFXLENBQUMsa0JBQWtCLENBQUMsRUFDdEQsbUJBQW1CLEdBQUcsSUFBSSxXQUFXLENBQUMscUJBQXFCLENBQUMsRUFDNUQsc0JBQXNCLEdBQUcsSUFBSSxXQUFXLENBQUMsd0JBQXdCLENBQUMsRUFDbEUsbUJBQW1CLEdBQUcsSUFBSSxXQUFXLENBQUMscUJBQXFCLENBQUMsRUFDNUQscUJBQXFCLEdBQUcsSUFBSSxXQUFXLENBQUMsdUJBQXVCLENBQUMsRUFDaEUseUJBQXlCLEdBQUcsSUFBSSxXQUFXLENBQUMsMkJBQTJCLENBQUMsRUFDeEUseUJBQXlCLEdBQUcsSUFBSSxXQUFXLENBQUMsMkJBQTJCLENBQUMsRUFDeEUsaUJBQWlCLEdBQUcsSUFBSSxXQUFXLENBQUMsbUJBQW1CLENBQUMsRUFDeEQsaUJBQWlCLEdBQUcsSUFBSSxXQUFXLENBQUMsbUJBQW1CLENBQUMsRUFDeEQsaUJBQWlCLEdBQUcsSUFBSSxXQUFXLENBQUMsbUJBQW1CLENBQUMsRUFDeEQsdUJBQXVCLEdBQUcsSUFBSSxXQUFXLENBQUMseUJBQXlCLENBQUMsRUFDcEUsb0JBQW9CLEdBQUcsSUFBSSxXQUFXLENBQUMsc0JBQXNCLENBQUMsRUFDOUQsa0JBQWtCLEdBQUcsSUFBSSxXQUFXLENBQUMsb0JBQW9CLENBQUMsRUFDMUQsNEJBQTRCLEdBQUcsSUFBSSxXQUFXLENBQUMsOEJBQThCLENBQUMsQ0FBQztBQUd4RSxRQUFBLFlBQVksR0FBRztJQUN0Qix3QkFBd0IsRUFBRSxzQkFBc0I7SUFFaEQsb0JBQW9CLEVBQUUsa0JBQWtCO0lBQ3hDLG1CQUFtQixFQUFHLGlCQUFpQjtJQUN2QyxzQkFBc0IsRUFBRSxvQkFBb0I7SUFDNUMseUJBQXlCLEVBQUUsdUJBQXVCO0lBRWxELG1CQUFtQixFQUFHLGlCQUFpQjtJQUN2QyxtQkFBbUIsRUFBRyxpQkFBaUI7SUFDdkMscUJBQXFCLEVBQUUsbUJBQW1CO0lBQzFDLGtCQUFrQixFQUFFLGdCQUFnQjtJQUNwQyxxQkFBcUIsRUFBRSxtQkFBbUI7SUFFMUMsd0JBQXdCLEVBQUUsc0JBQXNCO0lBQ2hELDhCQUE4QixFQUFFLDRCQUE0QjtJQUU1RCwyQkFBMkIsRUFBRSx5QkFBeUI7SUFDdEQsMkJBQTJCLEVBQUUseUJBQXlCO0lBQ3RELHVCQUF1QixFQUFHLHFCQUFxQjtJQUUvQyxzQkFBc0IsRUFBRSxvQkFBb0I7SUFDNUMsa0JBQWtCLEVBQUUsZ0JBQWdCO0lBQ3BDLG9CQUFvQixFQUFFLGtCQUFrQjtDQUMzQyxDQUFDOzs7OztBQ2pERjs7R0FFRztBQUNIOztHQUVHO0FBQ0gsa0NBQTRCO0FBQzVCLDhDQUE4QztBQUM5QywrQ0FBOEM7QUFFOUM7SUFrQkksWUFBWSxLQUFxQixFQUFFLENBQVMsRUFBRSxDQUFTLEVBQUUsVUFBa0IsRUFBRSxTQUFhLEVBQUUsTUFBZ0I7UUFDeEcsK0VBQStFO1FBQy9FLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsY0FBYyxHQUFLLFNBQVMsQ0FBQyw2QkFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZFLElBQUksQ0FBQyxlQUFlLEdBQUcsU0FBUyxDQUFDLDZCQUFlLENBQUMsVUFBVSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdkUsSUFBSSxDQUFDLGNBQWMsR0FBSSxTQUFTLENBQUMsNkJBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN0RSxJQUFJLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQztRQUU1QixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDbkQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1FBQy9CLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztRQUM5QixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUNwQixJQUFJLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQztRQUV2QixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDdkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN2QixJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsVUFBUyxDQUFDO1lBQ3BDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1lBQ25CLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7UUFDOUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRWQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLFVBQVMsQ0FBQztZQUNsQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO1lBQzFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7Z0JBQ1osSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ3hCLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUVkLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRTtZQUN6QixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO1lBQzFDLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ3hCLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUVkLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUVqQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7SUFHN0IsQ0FBQztJQUVNLElBQUk7UUFDUCxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7SUFDaEMsQ0FBQztJQUVNLElBQUk7UUFDUCxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7SUFDL0IsQ0FBQztJQUVNLE9BQU87UUFDVixJQUFJLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQztRQUN4QixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDO1FBQzNDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztJQUNwQyxDQUFDO0lBRU0sTUFBTTtRQUNULElBQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUMzQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO1FBQzFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztJQUNuQyxDQUFDO0lBRU0sS0FBSztRQUNSLElBQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7UUFDMUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO0lBQ3BDLENBQUM7Q0FFSjtBQXhGRCx3QkF3RkM7QUFHRCw2QkFBcUMsU0FBUSxNQUFNO0lBb0IvQyxZQUFZLEtBQXFCLEVBQUUsQ0FBUyxFQUFFLENBQVMsRUFBRSxTQUFjLEVBQUMsY0FBbUIsRUFBRSxXQUFlLEVBQUUsUUFBWSxFQUFFLFFBQVksRUFBRSxXQUFnQixFQUFFLFdBQWdCLEVBQUUsT0FBYSxFQUFFLFdBQWdCLEVBQUUsS0FBVSxFQUFFLE1BQWdCO1FBQ3ZPLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBbEJsRCxlQUFVLEdBQWEsRUFBRSxDQUFDO1FBbUI3QixJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztRQUNyQixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDbEQsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDM0IsSUFBSSxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUM7UUFDckMsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEVBQUUsQ0FBQztRQUM5QixFQUFFLENBQUMsQ0FBQyxPQUFRLFdBQVcsS0FBSyxRQUFRLElBQUksT0FBTyxRQUFRLEtBQUssUUFBUSxJQUFJLE9BQU8sUUFBUSxLQUFLLFFBQVEsSUFBSSxPQUFPLFdBQVcsS0FBSyxRQUFTLENBQUMsQ0FBQSxDQUFDO1lBQ3RJLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDdkQsSUFBSSxDQUFDLFFBQVEsR0FBTSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNwRCxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3BELElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDN0QsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLFdBQVcsR0FBSyxXQUFXLENBQUM7WUFDakMsSUFBSSxDQUFDLFFBQVEsR0FBUSxRQUFRLENBQUM7WUFDOUIsSUFBSSxDQUFDLFdBQVcsR0FBSyxRQUFRLENBQUM7WUFDOUIsSUFBSSxDQUFDLGFBQWEsR0FBRyxXQUFXLENBQUM7UUFDckMsQ0FBQztRQUNELElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO1FBQ2hDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsMkJBQTJCLEVBQUUsQ0FBQztRQUNuQyxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztJQUVuQyxDQUFDO0lBRU8sMkJBQTJCO1FBQy9CLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzNELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzNELElBQUksQ0FBQyxjQUFjLEdBQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN4RCxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUUvRCxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDaEQsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFDekMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDbkMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBQyxDQUFDLENBQUM7UUFDakUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sR0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQztRQUUxTCxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFDLENBQUM7WUFDckMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlCLENBQUM7UUFDRCxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRU8saUJBQWlCLENBQUMsS0FBSztRQUMzQixJQUFJLGFBQWEsR0FBRyxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFDcEMsS0FBSyxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFDbEYsVUFBVSxDQUFDO1FBRWYsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzNCLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssR0FBQyxDQUFDLENBQUM7UUFDekMsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQztRQUUxQyxFQUFFLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUEsQ0FBQztZQUNaLFVBQVUsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO1lBQ2pDLEtBQUssQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQztZQUM5RCxhQUFhLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN4QixDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZDLFVBQVUsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUM7WUFDcEMsYUFBYSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVHLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLFVBQVUsR0FBRyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQy9DLGFBQWEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxHQUFHLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0YsQ0FBQztRQUNELElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hELGFBQWEsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFbkMsYUFBYSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7UUFDakMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsVUFBVSxDQUFDO1lBQ3ZDLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUNwQixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUV6QyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFFZCxhQUFhLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQTtJQUNwRCxDQUFDO0lBRU8sU0FBUztRQUNiLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDOUMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVPLHVCQUF1QjtRQUMzQixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzFHLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDeEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDckMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsMkJBQTJCO1FBQ25FLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUV4QyxJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssR0FBRyxHQUFHLENBQUM7UUFDckMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQztRQUM1RCxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1FBQ3pELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUVPLG9CQUFvQjtRQUN4QixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUN6RCxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUVsQyxDQUFDO0lBRU8sd0JBQXdCO1FBQzVCLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxVQUFTLENBQUM7WUFDcEMsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ3BCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1lBQ25CLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztZQUMzQixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2xCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7UUFDOUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRWQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLFVBQVMsQ0FBQztZQUNsQyxDQUFDLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDcEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztZQUMxQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO2dCQUNaLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNuQixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUN4QixDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDbEIsQ0FBQztJQUVNLFNBQVM7UUFDWixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7WUFDZCxVQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUU3Qyw0QkFBNEIsU0FBaUI7WUFDekMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7WUFDeEMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssR0FBQyxDQUFDLElBQUksR0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2hHLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7Z0JBQ3BCLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztnQkFDOUIsVUFBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDaEQsQ0FBQztRQUVMLENBQUM7SUFDTCxDQUFDO0lBRU0sU0FBUztRQUNaLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7WUFDYixVQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUU3Qyw0QkFBNEIsU0FBaUI7WUFDekMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssR0FBQyxDQUFDLElBQUksR0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2hHLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdEMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7Z0JBQ3pDLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO2dCQUNyQixJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7Z0JBQy9CLFVBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2hELENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztJQUVNLFdBQVcsQ0FBQyxFQUFFO1FBRWpCLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNuRCxJQUFJLENBQUMsK0JBQStCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDNUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEdBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRXZELElBQUksZ0JBQWdCLEdBQUcsSUFBSSxXQUFXLENBQUMsa0JBQWtCLEVBQUUsRUFBQyxRQUFRLEVBQUMsRUFBQyxVQUFVLEVBQUUsRUFBRSxFQUFDLEVBQUMsQ0FBQyxDQUFDO1FBQ3hGLFFBQVEsQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUV6QyxVQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUUzQyw4QkFBOEIsU0FBaUI7WUFDM0MsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQSxDQUFDO2dCQUNsQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsR0FBRyxTQUFTLEdBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQzFGLENBQUM7WUFDRCxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUN4QyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsR0FBRyxTQUFTLEdBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQzFGLENBQUM7WUFDRCxJQUFJLENBQUMsQ0FBQztnQkFDRixJQUFJLENBQUMsa0JBQWtCLEdBQUcsRUFBRSxDQUFDO2dCQUM3QixJQUFJLENBQUMsK0JBQStCLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzNDLFVBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2xELENBQUM7UUFFTCxDQUFDO0lBQ0wsQ0FBQztJQUVPLCtCQUErQixDQUFDLEtBQWM7UUFDbEQsR0FBRyxDQUFBLENBQUMsSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFFLENBQUMsR0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFDLENBQUM7WUFDakQsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7UUFDcEQsQ0FBQztJQUNMLENBQUM7Q0FFSjtBQTdNRCwwREE2TUM7OztBQ2xURDs7R0FFRzs7O0FBRUgsOENBQXlDO0FBQ3pDLGtDQUE0QjtBQUM1QiwrQ0FBZ0Q7QUFDaEQ7SUFhSSxZQUFZLEtBQXFCLEVBQUUsSUFBVyxFQUFFLENBQVMsRUFBRSxDQUFTLEVBQUUsU0FBYyxFQUFFLFNBQWMsRUFBRSxPQUFPLEdBQUMsQ0FBQztRQUMzRywrRUFBK0U7UUFDL0UsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxlQUFlLEdBQUssU0FBUyxDQUFDLDZCQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUM7UUFHckUsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUMzQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQy9CLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7UUFFL0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3BELElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDakMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUMsQ0FBQyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFMUMsV0FBVztRQUNYLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDL0IsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUMsT0FBTyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBRTVCLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUV6QyxVQUFVO1FBQ1YsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLGlCQUFPLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDNUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0lBRzdCLENBQUM7SUFFTSxRQUFRLENBQUMsS0FBYTtRQUN6QixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBQyxLQUFLLEdBQUMsR0FBRyxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUVNLGNBQWMsQ0FBQyxLQUFhO1FBQy9CLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLEtBQUssR0FBQyxHQUFHLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBRU0sU0FBUyxDQUFDLEtBQWE7UUFDMUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFTSxJQUFJO1FBQ1AsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0lBQ3hDLENBQUM7SUFFTSxJQUFJO1FBQ1AsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0lBQ3ZDLENBQUM7Q0FFSjtBQXBFRCxvQ0FvRUM7QUFFRCwwQ0FBa0QsU0FBUSxZQUFZO0lBUWxFLFlBQVksS0FBcUIsRUFBRSxJQUFXLEVBQUUsQ0FBUyxFQUFFLENBQVMsRUFBRSxTQUFhLEVBQUUsU0FBYztRQUMvRixLQUFLLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUUvQyxJQUFJLENBQUMsb0JBQW9CLEdBQUssU0FBUyxDQUFDLDZCQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDNUUsSUFBSSxDQUFDLG9CQUFvQixHQUFHLFNBQVMsQ0FBQyw2QkFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRTFFLDZCQUE2QjtRQUM3QixJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQ3RFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUM5QyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQztRQUNqRCxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDdkQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFFdkQsd0JBQXdCO1FBQ3hCLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDdEUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssR0FBQyxDQUFDLENBQUM7UUFDOUQsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxHQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDO1FBQ2pHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1FBQzVDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1FBQzNDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFO1lBQ3ZDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUN2QixDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDZCxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUV2RCxXQUFXO1FBQ1gsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUN6QyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFFdEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1FBQy9CLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztRQUM5QixJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUU7WUFDMUIsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUdsQixDQUFDO0lBRU8sY0FBYztRQUNsQixJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDeEMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztRQUM5QyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztRQUM3QyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztRQUk3QyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN2QyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsRUFDeEUsTUFBTSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlFLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRXZHLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDbEMsQ0FBQztJQUVNLFdBQVc7UUFFZCxVQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUUxQyw4QkFBOEIsU0FBaUI7WUFDM0MsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7WUFDN0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1lBQ2hDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM3QyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxHQUFFLENBQUMsR0FBQyxTQUFTLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBRW5HLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixVQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDOUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7Z0JBQzVDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztZQUNuQyxDQUFDO1FBQ04sQ0FBQztJQUNMLENBQUM7SUFFTSxXQUFXO1FBRWQsVUFBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFM0MsOEJBQThCLFNBQWlCO1lBQzNDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1lBQzdDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztZQUNoQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM3RSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBQyxTQUFTLENBQUE7WUFFN0MsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQztnQkFDN0UsVUFBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzlDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO2dCQUNwQixJQUFJLENBQUMsbUJBQW1CLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztnQkFDNUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1lBQ25DLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztDQUNKO0FBcEdELG9GQW9HQzs7Ozs7QUNqTEQseUNBQXVFO0FBQ3ZFLDREQUFnRztBQUNoRyxpREFBNEM7QUFDNUMsb0RBQStDO0FBQy9DLHNEQUF1RDtBQUN2RDs7R0FFRztBQUdGO0lBZ0JHLFlBQVksS0FBSyxFQUFFLFVBQWlCLEVBQUUsU0FBUztRQUMzQyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMzQixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUM3QixJQUFJLENBQUMsSUFBSSxHQUFHLHFCQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDdEMsSUFBSSxDQUFDLHVCQUF1QixHQUFHLENBQUMsQ0FBQztRQUNqQyxJQUFJLENBQUMsY0FBYyxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQTtRQUUzQyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUE7UUFDekQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsbUJBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDdEQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsbUJBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDdEQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ25DLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRU0sT0FBTyxDQUFDLE9BQWlCLEVBQUUsT0FBaUIsRUFBRSxHQUFXLEVBQUcsVUFBa0I7UUFDakYsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBRWxDLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFDNUIsSUFBSSxDQUFDLHVCQUF1QixHQUFHLE1BQU0sQ0FBQztRQUVyQyw4Q0FBOEM7UUFDOUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFFLENBQUMsR0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUMsQ0FBQztZQUMxQixpQkFBaUI7WUFDakIsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkUsQ0FBQztJQUNMLENBQUM7SUFFTSxXQUFXO1FBQ2QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFBO1FBQ2xDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDaEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0QsQ0FBQztJQUNMLENBQUM7Q0FFSDtBQW5ERCxzQ0FtREM7QUFHRjtJQXdCSSxZQUFZLEtBQUssRUFBRSxVQUFrQixFQUFFLGNBQTRCLEVBQUUsYUFBMEIsRUFBRSxxQkFBbUMsRUFBRSxTQUFjO1FBQ2hKLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzdCLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxDQUFDLENBQUM7UUFDakMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzFDLElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO1FBQ25DLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxxQkFBcUIsQ0FBQztRQUVuRCxJQUFJLENBQUMsWUFBWSxHQUFHLG9CQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQztRQUN2RSxJQUFJLENBQUMsWUFBWSxHQUFHLG9CQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLHFCQUFxQixDQUFDLEtBQUssR0FBQyxDQUFDLENBQUM7UUFDekUsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLDJCQUFZLENBQUMsS0FBSyxFQUFFLG9CQUFvQixFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxTQUFTLEVBQUUsdUJBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMzSSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxDQUFDO1FBRTNCLHlCQUF5QjtRQUN6QiwrQ0FBK0M7UUFDL0MsK0NBQStDO1FBQy9DLGlEQUFpRDtRQUNqRCwrQ0FBK0M7UUFDL0MsaURBQWlEO1FBQ2pELG1EQUFtRDtRQUNuRCxrREFBa0Q7UUFDbEQsa0RBQWtEO1FBQ2xELEtBQUs7UUFHTCxJQUFJLENBQUMsUUFBUSxHQUFHO1lBQ1osSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQztZQUM5QixJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDO1lBQzlCLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUM7WUFDOUIsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQztZQUM5QixJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDO1NBQ2pDLENBQUM7UUFFRixJQUFJLENBQUMsUUFBUSxHQUFHO1lBQ1osSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsRUFBRSxDQUFDO1lBQ3RDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLEVBQUUsQ0FBQztZQUN0QyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxFQUFFLENBQUM7WUFDdEMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsRUFBRSxDQUFDO1lBQ3RDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLEVBQUUsQ0FBQztTQUN6QyxDQUFDO1FBR0YsSUFBSSxDQUFDLElBQUksR0FBRyxxQkFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXRDLHlDQUF5QztRQUN6QyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdEIsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7SUFFOUIsQ0FBQztJQUdELDJEQUEyRDtJQUMzRCwyRUFBMkU7SUFDM0Usa0RBQWtEO0lBQ2xELDJEQUEyRDtJQUMzRCwyREFBMkQ7SUFDM0QsSUFBSTtJQUVJLGNBQWM7UUFDbEIsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFFLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3BDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLG9CQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEQsQ0FBQztJQUVMLENBQUM7SUFFTyxrQkFBa0I7UUFDdEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3pFLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNuQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7SUFDbEMsQ0FBQztJQUVNLFdBQVc7UUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDN0IsZ0ZBQWdGO0lBQ3BGLENBQUM7SUFFTSxXQUFXO1FBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQzlCLDRFQUE0RTtJQUNoRixDQUFDO0lBRU0sY0FBYztRQUNqQixnRkFBZ0Y7SUFDcEYsQ0FBQztJQUVNLE9BQU8sQ0FBQyxPQUFpQixFQUFFLE9BQWlCLEVBQUUsR0FBVyxFQUFHLFVBQWtCO1FBRWpGLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBRTlELElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFDNUIsSUFBSSxDQUFDLHVCQUF1QixHQUFHLE1BQU0sQ0FBQztRQUV0QyxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUM3QixJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3RDLDJCQUEyQjtRQUMzQixFQUFFLENBQUMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFBLENBQUM7WUFDN0MsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNoQyxDQUFDO1FBRUQsOENBQThDO1FBQzlDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFDLENBQUM7WUFDekIsRUFBRSxDQUFDLENBQUUsQ0FBQyxHQUFHLE1BQU0sR0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFDO2dCQUNmLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckIsQ0FBQztZQUNELGlCQUFpQjtZQUNqQixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUluRSwrQkFBK0I7WUFDL0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUN0QyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxvQkFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuRCxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxvQkFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuRCxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7WUFDaEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFDLENBQUM7UUFDRCw0QkFBNEI7UUFDNUIsRUFBRSxDQUFDLENBQUMsTUFBTSxJQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDWixJQUFJLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxDQUFDLEdBQUcsb0JBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEtBQUssR0FBQyxDQUFDLENBQUM7WUFDakcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxHQUFHLG9CQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBQyxDQUFDLENBQUM7UUFDckcsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxHQUFHLG9CQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLEdBQUMsQ0FBQyxDQUFDO1lBQ2pHLElBQUksQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLENBQUMsR0FBRyxvQkFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBQyxDQUFDLENBQUM7UUFDdkcsQ0FBQztRQUNELElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRywrQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUV2RCxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxDQUFDO0lBRy9CLENBQUM7SUFFTSxXQUFXO1FBRWQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDNUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztRQUVwRCxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUUvRCxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLEVBQUUsRUFDakQsQ0FBQztZQUNHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDM0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ3JDLENBQUM7UUFFRCxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQy9CLENBQUM7SUFJTyxjQUFjLENBQUMsTUFBYztRQUVqQyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0MsZ0RBQWdEO1FBQ2hELE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFGLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUMxRSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFFTyxRQUFRLENBQUMsS0FBYTtRQUUxQixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RGLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZFLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBR08saUJBQWlCLENBQUMsTUFBa0IsRUFBRSxNQUFrQjtRQUM1RCxJQUFJLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUUsTUFBTSxHQUFDLEVBQUUsQ0FBQztRQUV6QixDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3hCLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDeEIsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFFOUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QixDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTVCLDZGQUE2RjtRQUM3RixJQUFJLGNBQWMsR0FBRztZQUNqQixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLHlCQUFXLEdBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFDLHlCQUFXLEdBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDaEcsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsMEJBQVksR0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsMEJBQVksR0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0RyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRywwQkFBWSxHQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRywwQkFBWSxHQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3pHLENBQUM7UUFFRixxREFBcUQ7UUFDckQsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQztZQUNsQixJQUFJLEtBQUssR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUIsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcseUJBQVcsR0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsMEJBQVksR0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRywwQkFBWSxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQ25MLENBQUM7Z0JBQ0csS0FBSyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsMEJBQVksR0FBRywwQkFBWSxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZELE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7WUFDdEIsQ0FBQztRQUNMLENBQUM7UUFDRCwyRkFBMkY7UUFDM0YsSUFBSSxZQUFZLEdBQUc7WUFDZixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLHlCQUFXLEdBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLHlCQUFXLEdBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDbEcsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsMEJBQVksR0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsMEJBQVksR0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwRyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRywwQkFBWSxHQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyww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QUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDdEosQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3RKLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN0SixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDdEosQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FB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QUM7Z0RBQ1o7b0RBQ0ksUUFBUSxFQUFDLENBQUM7b0RBQ1YsV0FBVyxFQUFDLENBQUM7b0RBQ2IsZ0JBQWdCLEVBQUMsQ0FBQztpREFDckI7Z0RBQ0Q7b0RBQ0ksUUFBUSxFQUFDLENBQUM7b0RBQ1YsV0FBVyxFQUFDLENBQUM7b0RBQ2IsZ0JBQWdCLEVBQUMsQ0FBQztpREFDckI7Z0RBQ0Q7b0RBQ0ksUUFBUSxFQUFDLENBQUM7b0RBQ1YsV0FBVyxFQUFDLENBQUM7b0RBQ2IsZ0JBQWdCLEVBQUMsQ0FBQztpREFDckI7Z0RBQ0Q7b0RBQ0ksUUFBUSxFQUFDLENBQUM7b0RBQ1YsV0FBVyxFQUFDLENBQUM7b0RBQ2IsZ0JBQWdCLEVBQUMsQ0FBQztpREFDckI7Z0RBQ0Q7b0RBQ0ksUUFBUSxFQUFDLENBQUM7b0RBQ1YsV0FBVyxFQUFDLENBQUM7b0RBQ2IsZ0JBQWdCLEVBQUMsQ0FBQztpREFDckI7Z0RBQ0Q7b0RBQ0ksUUFBUSxFQUFDLENBQUM7b0RBQ1YsV0FBVyxFQUFDLENBQUM7b0RBQ2IsZ0JBQWdCLEVBQUMsQ0FBQztpREFDckI7Z0RBQ0Q7b0RBQ0ksUUFBUSxFQUFDLENBQUM7b0RBQ1YsV0FBVyxFQUFDLENBQUM7b0RBQ2IsZ0JBQWdCLEVBQUMsQ0FBQztpREFDckI7Z0RBQ0Q7b0RBQ0ksUUFBUSxFQUFDLENBQUM7b0RBQ1YsV0FBVyxFQUFDLENBQUM7b0RBQ2IsZ0JBQWdCLEVBQUMsQ0FBQztpREFDckI7Z0RBQ0Q7b0RBQ0ksUUFBUSxFQUFDLENBQUM7b0RBQ1YsV0FBVyxFQUFDLENBQUM7b0RBQ2IsZ0JBQWdCLEVBQUMsQ0FBQztpREFDckI7Z0RBQ0Q7b0RBQ0ksUUFBUSxFQUFDLENBQUM7b0RBQ1YsV0FBVyxFQUFDLENBQUM7b0RBQ2IsZ0JBQWdCLEVBQUMsQ0FBQztpREFDckI7Z0RBQ0Q7b0RBQ0ksUUFBUSxFQUFDLENBQUM7b0RBQ1YsV0FBVyxFQUFDLENBQUM7b0RBQ2IsZ0JBQWdCLEVBQUMsQ0FBQztpREFDckI7Z0RBQ0Q7b0RBQ0ksUUFBUSxFQUFDLENBQUM7b0RBQ1YsV0FBVyxF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QUFVLEVBQUUsQ0FBQztBQUVqQixDQUFDLENBQUMsQ0FBQztBQUdIO0lBQ0ksUUFBUSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztJQUN2RCxJQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQy9DLElBQUksVUFBVSxHQUFHLGFBQWEsRUFBRSxDQUFBO0lBQ2hDLFdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDakQsTUFBTSxDQUFDLFNBQVMsR0FBRSxlQUFlLENBQUM7SUFDbEMsVUFBVSxDQUFDO1FBQ1AsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0lBQ2xDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNiLENBQUM7QUFFRDtJQUNJLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztJQUNoQixNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLFVBQVUsR0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDeEMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxXQUFXLEdBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3pDLE1BQU0sQ0FBQyxNQUFNLENBQUE7QUFDakIsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9cmV0dXJuIGV9KSgpIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgdGFyYXNnIG9uIDEwLzExLzIwMTcuXHJcbiAqL1xyXG4vLyBpbXBvcnQge0J1dHRvbn0gZnJvbSBcIi4uL0xheW91dC9CdXR0b25zXCI7XHJcbmltcG9ydCB7QmFzZUdhbWVTY2VuZX0gZnJvbSBcIi4uL1NjZW5lcy9HYW1lU2NlbmVzXCI7XHJcbmltcG9ydCB7Zm9ybWF0U3Rha2VBbW91bnQsIG5leHRJdGVtfSBmcm9tIFwiLi4vVXRpbHMvaGVscGVyRnVuY3NcIjtcclxuaW1wb3J0IHtTQ0VORV9NQU5BR0VSfSBmcm9tIFwiLi4vbWFpblwiO1xyXG5pbXBvcnQge3Jlc3BvbnNlfSBmcm9tIFwiLi4vUmVlbFNwaW5uZXIvcmVlbHNDb25maWdcIjtcclxuaW1wb3J0IHtXaW5TaG93Q29udHJvbGxlcn0gZnJvbSBcIi4vV2luU2hvd1wiO1xyXG4vLyBpbXBvcnQge0J1dHRvbkV2ZW50c30gZnJvbSBcIi4uL0V2ZW50cy9CdXR0b25FdmVudHNcIjtcclxuLy8gaW1wb3J0IHtGb250U3R5bGVzfSBmcm9tIFwiLi4vVXRpbHMvZm9udFN0eWxlc1wiO1xyXG4vLyBpbXBvcnQge2FwcCwgYmFzZUdhbWVTY2VuZSwgYm9udXNHYW1lU2NlbmUsIFNDRU5FX01BTkFHRVJ9IGZyb20gXCIuLi9tYWluXCJcclxuLy8gaW1wb3J0IHtMaW5lT2JqZWN0fSBmcm9tIFwiLi4vQm9udXMvTGluZU9iamVjdFwiO1xyXG5cclxuZGVjbGFyZSBsZXQgR0RLV3JhcHBlcjogYW55O1xyXG5cclxuXHJcblxyXG5leHBvcnQgY2xhc3MgQmFzZUdhbWVDb250cm9sbGVyIHtcclxuXHJcbiAgICBwcml2YXRlIHNjZW5lOiBCYXNlR2FtZVNjZW5lO1xyXG4gICAgcHVibGljIHN0YXRlOiBzdHJpbmc7XHJcbiAgICBwdWJsaWMgYnV0dG9uU3RhdGVzOiBhbnk7XHJcbiAgICBwdWJsaWMgYmFsYW5jZTogbnVtYmVyID0gMTAwMDA7XHJcbiAgICBwdWJsaWMgdG90YWxXaW46IG51bWJlciA9IDEwMDtcclxuICAgIHB1YmxpYyBjdXJyZW50U3Rha2U6IG51bWJlciA9IDEwMDtcclxuICAgIHB1YmxpYyBzdGFrZXM6IG51bWJlcltdO1xyXG4gICAgcHVibGljIFdpblNob3dDb250cm9sbGVyOiBXaW5TaG93Q29udHJvbGxlcjtcclxuXHJcbiAgICBwcml2YXRlIG9uU3RhcnRCdXR0b246IGFueTtcclxuICAgIHByaXZhdGUgb25SZWVsc1N0b3A6IGFueTtcclxuICAgIHByaXZhdGUgb25TbGFtT3V0OiBhbnk7XHJcbiAgICBwcml2YXRlIG9uU3Rha2VCdXR0b246IGFueTtcclxuICAgIHByaXZhdGUgb25DaGFuZ2VTdGFrZTogYW55O1xyXG4gICAgcHJpdmF0ZSBvbk1heEJldDogYW55O1xyXG4gICAgcHJpdmF0ZSBvbkdhbWJsZTogYW55O1xyXG5cclxuXHJcbiAgICBjb25zdHJ1Y3RvcihzY2VuZTogQmFzZUdhbWVTY2VuZSkge1xyXG4gICAgICAgIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuICAgICAgICB0aGlzLldpblNob3dDb250cm9sbGVyID0gbmV3IFdpblNob3dDb250cm9sbGVyKHNjZW5lKTtcclxuXHJcbiAgICAgICAgdGhpcy5zY2VuZS5iYWxhbmNlRmllbGQuYWRkVmFsdWUodGhpcy5iYWxhbmNlKTtcclxuICAgICAgICAvLyB0aGlzLnN0YWtlcyA9IHNjZW5lLnN0YWtlQnV0dG9uLnN0YWtlcztcclxuICAgICAgICB0aGlzLmJ1dHRvblN0YXRlcyA9IHtcclxuICAgICAgICAgICAgJ2lkbGUnIDogW1xyXG4gICAgICAgICAgICAgICAgeydidXR0b24nOiB0aGlzLnNjZW5lLnN0YXJ0QnV0dG9uLCAnc3RhdGUnOiAnZW5hYmxlJ30sXHJcbiAgICAgICAgICAgICAgICB7J2J1dHRvbic6IHRoaXMuc2NlbmUuc3RvcEJ1dHRvbiwgJ3N0YXRlJzogJ2hpZGUnfSxcclxuICAgICAgICAgICAgICAgIC8vIHsnYnV0dG9uJzogc2NlbmUuY29sbGVjdEJ1dHRvbiwgJ3N0YXRlJzogJ2hpZGUnfSxcclxuICAgICAgICAgICAgICAgIC8vIHsnYnV0dG9uJzogc2NlbmUuc3RhcnRCb251c0J1dHRvbiwgJ3N0YXRlJzogJ2hpZGUnfSxcclxuICAgICAgICAgICAgICAgIC8vIHsnYnV0dG9uJzogc2NlbmUubWF4QmV0QnV0dG9uLCAnc3RhdGUnOiAnZW5hYmxlJ30sXHJcbiAgICAgICAgICAgICAgICAvLyB7J2J1dHRvbic6IHNjZW5lLmF1dG9TdGFydEJ1dHRvbiwgJ3N0YXRlJzogJ2VuYWJsZSd9LFxyXG4gICAgICAgICAgICAgICAgLy8geydidXR0b24nOiBzY2VuZS5jYW5jZWxBdXRvU3RhcnRCdXR0b24sICdzdGF0ZSc6ICdoaWRlJ30sXHJcbiAgICAgICAgICAgICAgICAvLyB7J2J1dHRvbic6IHNjZW5lLnN0YWtlQnV0dG9uLCAnc3RhdGUnOiAnZW5hYmxlJ30sXHJcbiAgICAgICAgICAgICAgICAvLyB7J2J1dHRvbic6IHNjZW5lLmdhbWJsZUJ1dHRvbiwgJ3N0YXRlJzogJ2Rpc2FibGUnfSxcclxuICAgICAgICAgICAgICAgIC8vIHsnYnV0dG9uJzogc2NlbmUuaGVscEJ1dHRvbiwgJ3N0YXRlJzogJ2VuYWJsZSd9LFxyXG4gICAgICAgICAgICAgICAgLy8geydidXR0b24nOiBzY2VuZS5tZW51QnV0dG9uLCAnc3RhdGUnOiAnZW5hYmxlJ30sXHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICdyb3VuZCc6IFtcclxuICAgICAgICAgICAgICAgIHsnYnV0dG9uJzogdGhpcy5zY2VuZS5zdGFydEJ1dHRvbiwgJ3N0YXRlJzogJ2hpZGUnfSxcclxuICAgICAgICAgICAgICAgIHsnYnV0dG9uJzogdGhpcy5zY2VuZS5zdG9wQnV0dG9uLCAnc3RhdGUnOiAnZW5hYmxlJ30sXHJcbiAgICAgICAgICAgICAgICAvLyB7J2J1dHRvbic6IHNjZW5lLmNvbGxlY3RCdXR0b24sICdzdGF0ZSc6ICdoaWRlJ30sXHJcbiAgICAgICAgICAgICAgICAvLyB7J2J1dHRvbic6IHNjZW5lLnN0YXJ0Qm9udXNCdXR0b24sICdzdGF0ZSc6ICdoaWRlJ30sXHJcbiAgICAgICAgICAgICAgICAvLyB7J2J1dHRvbic6IHNjZW5lLm1heEJldEJ1dHRvbiwgJ3N0YXRlJzogJ2Rpc2FibGUnfSxcclxuICAgICAgICAgICAgICAgIC8vIHsnYnV0dG9uJzogc2NlbmUuYXV0b1N0YXJ0QnV0dG9uLCAnc3RhdGUnOiAnZGlzYWJsZSd9LFxyXG4gICAgICAgICAgICAgICAgLy8geydidXR0b24nOiBzY2VuZS5jYW5jZWxBdXRvU3RhcnRCdXR0b24sICdzdGF0ZSc6ICdoaWRlJ30sXHJcbiAgICAgICAgICAgICAgICAvLyB7J2J1dHRvbic6IHNjZW5lLnN0YWtlQnV0dG9uLCAnc3RhdGUnOiAnZGlzYWJsZSd9LFxyXG4gICAgICAgICAgICAgICAgLy8geydidXR0b24nOiBzY2VuZS5nYW1ibGVCdXR0b24sICdzdGF0ZSc6ICdkaXNhYmxlJ30sXHJcbiAgICAgICAgICAgICAgICAvLyB7J2J1dHRvbic6IHNjZW5lLmhlbHBCdXR0b24sICdzdGF0ZSc6ICdkaXNhYmxlJ30sXHJcbiAgICAgICAgICAgICAgICAvLyB7J2J1dHRvbic6IHNjZW5lLm1lbnVCdXR0b24sICdzdGF0ZSc6ICdkaXNhYmxlJ30sXHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICdjb2xsZWN0JzogW1xyXG4gICAgICAgICAgICAgICAgeydidXR0b24nOiB0aGlzLnNjZW5lLnN0YXJ0QnV0dG9uLCAnc3RhdGUnOiAnaGlkZSd9LFxyXG4gICAgICAgICAgICAgICAgeydidXR0b24nOiB0aGlzLnNjZW5lLnN0b3BCdXR0b24sICdzdGF0ZSc6ICdoaWRlJ30sXHJcbiAgICAgICAgICAgICAgICAvLyB7J2J1dHRvbic6IHNjZW5lLmNvbGxlY3RCdXR0b24sICdzdGF0ZSc6ICdlbmFibGUnfSxcclxuICAgICAgICAgICAgICAgIC8vIHsnYnV0dG9uJzogc2NlbmUuc3RhcnRCb251c0J1dHRvbiwgJ3N0YXRlJzogJ2hpZGUnfSxcclxuICAgICAgICAgICAgICAgIC8vIHsnYnV0dG9uJzogc2NlbmUubWF4QmV0QnV0dG9uLCAnc3RhdGUnOiAnZGlzYWJsZSd9LFxyXG4gICAgICAgICAgICAgICAgLy8geydidXR0b24nOiBzY2VuZS5hdXRvU3RhcnRCdXR0b24sICdzdGF0ZSc6ICdkaXNhYmxlJ30sXHJcbiAgICAgICAgICAgICAgICAvLyB7J2J1dHRvbic6IHNjZW5lLmNhbmNlbEF1dG9TdGFydEJ1dHRvbiwgJ3N0YXRlJzogJ2hpZGUnfSxcclxuICAgICAgICAgICAgICAgIC8vIHsnYnV0dG9uJzogc2NlbmUuc3Rha2VCdXR0b24sICdzdGF0ZSc6ICdkaXNhYmxlJ30sXHJcbiAgICAgICAgICAgICAgICAvLyB7J2J1dHRvbic6IHNjZW5lLmdhbWJsZUJ1dHRvbiwgJ3N0YXRlJzogJ2VuYWJsZSd9LFxyXG4gICAgICAgICAgICAgICAgLy8geydidXR0b24nOiBzY2VuZS5oZWxwQnV0dG9uLCAnc3RhdGUnOiAnZGlzYWJsZSd9LFxyXG4gICAgICAgICAgICAgICAgLy8geydidXR0b24nOiBzY2VuZS5tZW51QnV0dG9uLCAnc3RhdGUnOiAnZGlzYWJsZSd9LFxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5vblN0YXJ0QnV0dG9uID0gZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdGhpcy5vblN0YXJ0QnV0dG9uRnVuYygpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgdGhpcy5vblJlZWxzU3RvcCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5vblJlZWxzU3RvcEZ1bmMoKTtcclxuICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgIHRoaXMub25TbGFtT3V0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLm9uU2xhbU91dEZ1bmMoKTtcclxuICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgIHRoaXMub25TdGFrZUJ1dHRvbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5vblN0YWtlQnV0dG9uRnVuYygpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgdGhpcy5vbkNoYW5nZVN0YWtlID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgdGhpcy5vbkNoYW5nZVN0YWtlRnVuYyhlKTtcclxuICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgIHRoaXMub25NYXhCZXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMub25NYXhCZXRCdXR0b25GdW5jKCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICB0aGlzLm9uR2FtYmxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLm9uR2FtYmxlRnVuYygpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSgnaWRsZScpO1xyXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcnMoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldFN0YXRlKHN0YXRlOnN0cmluZykge1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBzdGF0ZTtcclxuXHJcbiAgICAgICAgaWYgKHN0YXRlID09ICdpZGxlJykge1xyXG4gICAgICAgICAgICB0aGlzLmVuYWJsZVdpbkxpbmVCdXR0b25zKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5kaXNhYmxlV2luTGluZUJ1dHRvbnMoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gc2V0IGJ1dHRvbiBzdGF0ZXM6XHJcbiAgICAgICAgbGV0IGJ1dHRvblN0YXRlID0gdGhpcy5idXR0b25TdGF0ZXNbdGhpcy5zdGF0ZV07XHJcbiAgICAgICAgZm9yIChsZXQgaT0wOyBpPGJ1dHRvblN0YXRlLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChidXR0b25TdGF0ZVtpXS5zdGF0ZSA9PSAnZW5hYmxlJyl7XHJcbiAgICAgICAgICAgICAgICBidXR0b25TdGF0ZVtpXS5idXR0b24uZW5hYmxlKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYnV0dG9uU3RhdGVbaV0uc3RhdGUgPT0gJ2Rpc2FibGUnKXtcclxuICAgICAgICAgICAgICAgIGJ1dHRvblN0YXRlW2ldLmJ1dHRvbi5kaXNhYmxlKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYnV0dG9uU3RhdGVbaV0uc3RhdGUgPT0gJ2hpZGUnKXtcclxuICAgICAgICAgICAgICAgIGJ1dHRvblN0YXRlW2ldLmJ1dHRvbi5oaWRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHByaXZhdGUgYWRkRXZlbnRMaXN0ZW5lcnMoKSB7XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignU3RhcnRCdXR0b25QcmVzc2VkJywgdGhpcy5vblN0YXJ0QnV0dG9uKTtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdMYXN0UmVlbFN0b3BwZWQnLCB0aGlzLm9uUmVlbHNTdG9wKTtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdTdG9wQnV0dG9uUHJlc3NlZCcsIHRoaXMub25TbGFtT3V0KTtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdCZXRCdXR0b25QcmVzc2VkJyx0aGlzLm9uU3Rha2VCdXR0b24pO1xyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZVN0YWtlRXZlbnQnLCB0aGlzLm9uQ2hhbmdlU3Rha2UpO1xyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ01heEJldEJ1dHRvblByZXNzZWQnLCB0aGlzLm9uTWF4QmV0KTtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdHYW1ibGVCdXR0b25QcmVzc2VkJywgdGhpcy5vbkdhbWJsZSk7XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignTWVudUJ1dHRvblByZXNzZWQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5jbG9zZSgpXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignU3RhcnRCb251c0J1dHRvblByZXNzZWQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIC8vIFNDRU5FX01BTkFHRVIuZ29Ub0dhbWVTY2VuZSgnYm9udXNHYW1lJyk7XHJcbiAgICAgICAgICAgIC8vIGJvbnVzQ29udHJvbGxlci5zdGFydEJvbnVzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignSGVscEJ1dHRvblByZXNzZWQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIFNDRU5FX01BTkFHRVIuZ29Ub0dhbWVTY2VuZSgnbWFpbkhlbHAnKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdDbGlja2VkT25CYXNlR2FtZVNjZW5lJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvLyBpZiAodGhpcy5zY2VuZS5zdGFrZUJ1dHRvbi5pc1Nob3duKXtcclxuICAgICAgICAgICAgLy8gICAgIHRoaXMuc2NlbmUuc3Rha2VCdXR0b24uaGlkZVBhbmVsKCk7XHJcbiAgICAgICAgICAgIC8vIH1cclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdleGl0R2FtYmxlRXZlbnQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIC8vIHRoaXMudG90YWxXaW4gPSBnYW1ibGVDb250cm9sbGVyLmJhbms7XHJcbiAgICAgICAgICAgIC8vIHRoaXMub25Db2xsZWN0KCk7XHJcblxyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0NvbGxlY3RCdXR0b25QcmVzc2VkJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdGhpcy5vbkNvbGxlY3QoKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKSB7XHJcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignU3RhcnRCdXR0b25QcmVzc2VkJywgdGhpcy5vblN0YXJ0QnV0dG9uKVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uU2xhbU91dEZ1bmMoKXtcclxuICAgICAgICB0aGlzLnNjZW5lLlJFRUxTLnNsYW1vdXQoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uU3RhcnRCdXR0b25GdW5jKCl7XHJcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSgncm91bmQnKTtcclxuICAgICAgICB0aGlzLnNjZW5lLnRvdGFsV2luRmllbGQuY291bnRlci5yZXNldCgpO1xyXG4gICAgICAgIHRoaXMuYmFsYW5jZSAtPSB0aGlzLmN1cnJlbnRTdGFrZTtcclxuICAgICAgICB0aGlzLnNjZW5lLmJhbGFuY2VGaWVsZC5zdWJzdHJhY3RWYWx1ZSh0aGlzLmN1cnJlbnRTdGFrZSk7XHJcbiAgICAgICAgdGhpcy5XaW5TaG93Q29udHJvbGxlci51cGRhdGVQYXlvdXRzKHJlc3BvbnNlKTtcclxuICAgICAgICB0aGlzLnRvdGFsV2luID0gcmVzcG9uc2UuZGF0YS5nYW1lRGF0YS50b3RhbFdpbkFtb3VudDtcclxuICAgICAgICBsZXQgc3RvcHMgPSB0aGlzLmdldFN0b3BzQXJyYXkocmVzcG9uc2UpO1xyXG4gICAgICAgIHRoaXMuc2NlbmUuUkVFTFMuc3BpbihzdG9wcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRTdG9wc0FycmF5KHJvdW5kUmVzcG9uc2UpOiBudW1iZXJbXVtdIHtcclxuICAgICAgICBsZXQgc3ltYm9sVXBkYXRlcyA9IHJvdW5kUmVzcG9uc2UuZGF0YS5nYW1lRGF0YS5wbGF5U3RhY2tbMF0ubGFzdFBsYXlJbk1vZGVEYXRhLnNsb3RzRGF0YS5hY3Rpb25zWzBdLnRyYW5zZm9ybXNbMF0uc3ltYm9sVXBkYXRlcyxcclxuICAgICAgICAgICAgcmVzdWx0ID0gW1tdLFtdLFtdLFtdLFtdXTtcclxuICAgICAgICBmb3IgKGxldCBpPTA7IGk8IHN5bWJvbFVwZGF0ZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgcmVzdWx0W3N5bWJvbFVwZGF0ZXNbaV0ucmVlbEluZGV4XVtzeW1ib2xVcGRhdGVzW2ldLnBvc2l0aW9uT25SZWVsXSA9IHN5bWJvbFVwZGF0ZXNbaV0uc3ltYm9sO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb25SZWVsc1N0b3BGdW5jKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnRvdGFsV2luID09IDApe1xyXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKCdpZGxlJyk7XHJcbiAgICAgICAgICAgIHRoaXMuY2hlY2tJZkJldFBvc3NpYmxlKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSgnY29sbGVjdCcpO1xyXG4gICAgICAgICAgICB0aGlzLnNjZW5lLmludGVyYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5XaW5TaG93Q29udHJvbGxlci5wbGF5V2luU2hvdygpO1xyXG4gICAgICAgICAgICB0aGlzLnNjZW5lLnRvdGFsV2luRmllbGQuYWRkVmFsdWUodGhpcy50b3RhbFdpbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgIG9uU3Rha2VCdXR0b25GdW5jKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnNjZW5lLnN0YWtlQnV0dG9uLmlzU2hvd24pe1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudFN0YWtlSW5kZXggPSB0aGlzLnNjZW5lLnN0YWtlQnV0dG9uLnN0YWtlcy5pbmRleE9mKHRoaXMuc2NlbmUuc3Rha2VCdXR0b24uY3VycmVudFN0YWtlQW1vdW50KSxcclxuICAgICAgICAgICAgICAgIG5leHRTdGFrZSA9IG5leHRJdGVtKHRoaXMuc2NlbmUuc3Rha2VCdXR0b24uc3Rha2VzLCBjdXJyZW50U3Rha2VJbmRleCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2NlbmUuc3Rha2VCdXR0b24uY2hhbmdlU3Rha2UobmV4dFN0YWtlKTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnNjZW5lLnN0YWtlQnV0dG9uLnNob3dQYW5lbCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNoZWNrSWZCZXRQb3NzaWJsZSgpIHtcclxuICAgICAgICBpZiAodGhpcy5iYWxhbmNlIDwgdGhpcy5jdXJyZW50U3Rha2UpIHtcclxuICAgICAgICAgICAgdGhpcy5zY2VuZS5zdGFydEJ1dHRvbi5kaXNhYmxlKCk7XHJcbiAgICAgICAgICAgIC8vIHRoaXMuc2NlbmUuYXV0b1N0YXJ0QnV0dG9uLmRpc2FibGUoKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NlbmUuc3RhcnRCdXR0b24uZW5hYmxlKCk7XHJcbiAgICAgICAgICAgIC8vIHRoaXMuc2NlbmUuYXV0b1N0YXJ0QnV0dG9uLmVuYWJsZSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvbkNoYW5nZVN0YWtlRnVuYyhldmVudCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudFN0YWtlID0gZXZlbnQuZGV0YWlsLm5ld1N0YWtlO1xyXG4gICAgICAgIHRoaXMuY2hlY2tJZkJldFBvc3NpYmxlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvbk1heEJldEJ1dHRvbkZ1bmMoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaT0wOyBpPHRoaXMuc3Rha2VzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJhbGFuY2UgPCB0aGlzLnN0YWtlc1tpXSl7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2NlbmUuc3Rha2VCdXR0b24uY2hhbmdlU3Rha2UodGhpcy5zdGFrZXNbaV0pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uR2FtYmxlRnVuYygpIHtcclxuICAgICAgICAvLyBTQ0VORV9NQU5BR0VSLmdvVG9HYW1lU2NlbmUoJ2dhbWJsZScpO1xyXG4gICAgICAgIC8vIGdhbWJsZUNvbnRyb2xsZXIuc3RhcnRHYW1ibGUodGhpcy50b3RhbFdpbik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvbkNvbGxlY3QoKXtcclxuICAgICAgICB0aGlzLnNjZW5lLnRvdGFsV2luRmllbGQuY291bnRlci5yZXNldCgpO1xyXG4gICAgICAgIHRoaXMuc2NlbmUuYmFsYW5jZUZpZWxkLmFkZFZhbHVlKHRoaXMudG90YWxXaW4pO1xyXG4gICAgICAgIHRoaXMuYmFsYW5jZSArPSB0aGlzLnRvdGFsV2luO1xyXG4gICAgICAgIHRoaXMudG90YWxXaW4gPSAwO1xyXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoJ2lkbGUnKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGRpc2FibGVXaW5MaW5lQnV0dG9ucygpOiB2b2lkIHtcclxuICAgICAgICAvLyBmb3IgKGxldCBpPTA7IGk8dGhpcy5zY2VuZS53aW5MaW5lc0FycmF5Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgLy8gICAgIHRoaXMuc2NlbmUud2luTGluZXNBcnJheVtpXS5kaXNhYmxlKCk7XHJcbiAgICAgICAgLy8gfVxyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBlbmFibGVXaW5MaW5lQnV0dG9ucygpOiB2b2lkIHtcclxuICAgICAgICAvLyBmb3IgKGxldCBpPTA7IGk8dGhpcy5zY2VuZS53aW5MaW5lc0FycmF5Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgLy8gICAgIHRoaXMuc2NlbmUud2luTGluZXNBcnJheVtpXS5lbmFibGUoKTtcclxuICAgICAgICAvLyB9XHJcbiAgICB9XHJcblxyXG5cclxuXHJcblxyXG59IiwiaW1wb3J0IHtCYXNlR2FtZUNvbnRyb2xsZXJ9IGZyb20gXCIuL0Jhc2VHYW1lXCI7XHJcbmltcG9ydCB7QnV0dG9uRXZlbnRzfSBmcm9tIFwiLi4vRXZlbnRzL0J1dHRvbkV2ZW50c1wiXHJcbi8qKlxyXG4gKiBDcmVhdGVkIGJ5IHRhcmFzZyBvbiAxMC8xNy8yMDE3LlxyXG4gKi9cclxuXHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIFdpblNob3dDb250cm9sbGVyIHtcclxuICAgIHByaXZhdGUgc2NlbmU6IGFueTtcclxuICAgIHByaXZhdGUgcGF5b3V0czogYW55O1xyXG4gICAgcHJpdmF0ZSBjdXJyZW50V2luTGluZUluZGV4OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHNraXBXaW5TaG93OiBib29sZWFuO1xyXG4gICAgcHJpdmF0ZSBjdXJyZW50V2luTGluZTogYW55O1xyXG4gICAgcHJpdmF0ZSBwbGF5aW5nV2luU2hvdzogYm9vbGVhbjtcclxuXHJcblxyXG4gICAgcHJpdmF0ZSBvblJlZWxBbmltRW5kOiBhbnk7XHJcbiAgICBwcml2YXRlIG9uU2tpcFdpblNob3c6IGFueTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihzY2VuZTogYW55KSB7XHJcbiAgICAgICAgdGhpcy5zY2VuZSA9IHNjZW5lO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFdpbkxpbmVJbmRleCA9IDA7XHJcbiAgICAgICAgdGhpcy5za2lwV2luU2hvdyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMub25SZWVsQW5pbUVuZCA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5za2lwV2luU2hvdylcclxuICAgICAgICAgICAgICAgIHRoaXMub25XaW5TaG93RW5kKGUpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgdGhpcy5vblNraXBXaW5TaG93ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLm9uU2tpcFdpblNob3dGdW5jKCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdSZWVsV2luU2hvd0FuaW1FbmQnLCB0aGlzLm9uUmVlbEFuaW1FbmQpO1xyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3NraXBXaW5TaG93JywgdGhpcy5vblNraXBXaW5TaG93KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXBkYXRlUGF5b3V0cyhyZXNwb25zZSk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMucGF5b3V0cyA9IHJlc3BvbnNlLmRhdGEuZ2FtZURhdGEucGxheVN0YWNrWzBdLmxhc3RQbGF5SW5Nb2RlRGF0YS5zbG90c0RhdGEuYWN0aW9uc1sxXS5wYXlvdXRzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBwbGF5V2luU2hvdygpIHtcclxuICAgICAgICB0aGlzLnNraXBXaW5TaG93ID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5wbGF5aW5nV2luU2hvdyA9IHRydWU7XHJcbiAgICAgICAgbGV0IHBheW91dE9iaiA9IHRoaXMucGF5b3V0c1t0aGlzLmN1cnJlbnRXaW5MaW5lSW5kZXhdO1xyXG5cclxuICAgICAgICBpZiAocGF5b3V0T2JqLmNvbnRleHQuc3ltYm9sUGF5b3V0VHlwZSA9PSBcIldpbkxpbmVcIiAmJiAhdGhpcy5za2lwV2luU2hvdykge1xyXG4gICAgICAgICAgICBsZXQgd2luT25MaW5lID0gcGF5b3V0T2JqLnBheW91dERhdGEucGF5b3V0V2luQW1vdW50LFxyXG4gICAgICAgICAgICAgICAgd2lubGluZSA9IHRoaXMuc2NlbmUuV2luTGluZXNbcGF5b3V0T2JqLmNvbnRleHQud2luTGluZUluZGV4XSxcclxuICAgICAgICAgICAgICAgIHdpblN5bWJvbHMgPSB0aGlzLnBhcnNlV2luU3ltYm9scyhwYXlvdXRPYmopLFxyXG4gICAgICAgICAgICAgICAgcG9zaXRpb25PblJlZWwgPSB0aGlzLnBhcnNlUG9zaXRpb25JbmRleChwYXlvdXRPYmopO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRXaW5MaW5lID0gd2lubGluZTtcclxuICAgICAgICAgICAgbGV0IHN5bWJvbCA9IHBheW91dE9iai5jb250ZXh0LnN5bWJvbDtcclxuICAgICAgICAgICAgd2lubGluZS53aW5TaG93KHdpblN5bWJvbHMsIHBvc2l0aW9uT25SZWVsLCAgd2luT25MaW5lLCBzeW1ib2wpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvblNraXBXaW5TaG93RnVuYygpOnZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRXaW5MaW5lICYmIHRoaXMucGxheWluZ1dpblNob3cpIHtcclxuICAgICAgICAgICAgdGhpcy5za2lwV2luU2hvdyA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMucGxheWluZ1dpblNob3cgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50V2luTGluZUluZGV4ID0gMDtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50V2luTGluZS5zdG9wV2luU2hvdygpO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KEJ1dHRvbkV2ZW50cy5Db2xsZWN0QnV0dG9uUHJlc3NlZClcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uV2luU2hvd0VuZChldmVudCkge1xyXG4gICAgICAgIGlmIChldmVudC5kZXRhaWwucmVlbEluZGV4ID09ICh0aGlzLmN1cnJlbnRXaW5MaW5lLmN1cnJlbnRXaW5TeW1ib2xzQW1vdW50LTEpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFdpbkxpbmUuc3RvcFdpblNob3coKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVXaW5saW5lSW5kZXgoKTtcclxuICAgICAgICAgICAgdGhpcy5wbGF5V2luU2hvdygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBwYXJzZVdpblN5bWJvbHMocGF5b3V0T2JqOmFueSk6IG51bWJlcltdIHtcclxuICAgICAgICBsZXQgd2luU3ltYm9scyA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGk9MDsgaTxwYXlvdXRPYmouY29udGV4dC53aW5uaW5nU3ltYm9scy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB3aW5TeW1ib2xzLnB1c2gocGF5b3V0T2JqLmNvbnRleHQud2lubmluZ1N5bWJvbHNbaV0uc3ltYm9sKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gd2luU3ltYm9scztcclxuICAgIH1cclxuICAgIHByaXZhdGUgcGFyc2VQb3NpdGlvbkluZGV4KHBheW91dE9iajphbnkpOiBudW1iZXJbXSB7XHJcbiAgICAgICAgbGV0IHBvc2l0aW9ucyA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGk9MDsgaTxwYXlvdXRPYmouY29udGV4dC53aW5uaW5nU3ltYm9scy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBwb3NpdGlvbnMucHVzaChwYXlvdXRPYmouY29udGV4dC53aW5uaW5nU3ltYm9sc1tpXS5wb3NpdGlvbk9uUmVlbClcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHBvc2l0aW9ucztcclxuICAgIH1cclxuXHJcblxyXG4gICAgcHJpdmF0ZSB1cGRhdGVXaW5saW5lSW5kZXgoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50V2luTGluZUluZGV4Kys7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFdpbkxpbmVJbmRleCA+PSB0aGlzLnBheW91dHMubGVuZ3RoKVxyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRXaW5MaW5lSW5kZXggPSAwO1xyXG4gICAgfVxyXG5cclxufSIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IHRhcmFzZyBvbiA5LzI1LzIwMTcuXHJcbiAqL1xyXG5cclxuXHJcbmxldCBHYW1ibGVSZWRQcmVzc2VkID0gbmV3IEN1c3RvbUV2ZW50KFwiR2FtYmxlUmVkUHJlc3NlZFwiKSxcclxuICAgIEdhbWJsZUJsYWNrUHJlc3NlZCA9IG5ldyBDdXN0b21FdmVudChcIkdhbWJsZUJsYWNrUHJlc3NlZFwiKSxcclxuICAgIEdhbWJsZUNvbGxlY3RQcmVzc2VkID0gbmV3IEN1c3RvbUV2ZW50KFwiR2FtYmxlQ29sbGVjdFByZXNzZWRcIiksXHJcbiAgICBDbGlja2VkT25CYXNlR2FtZVNjZW5lID0gbmV3IEN1c3RvbUV2ZW50KFwiQ2xpY2tlZE9uQmFzZUdhbWVTY2VuZVwiKSxcclxuICAgIEJldEJ1dHRvblByZXNzZWQgPSBuZXcgQ3VzdG9tRXZlbnQoJ0JldEJ1dHRvblByZXNzZWQnKSxcclxuICAgIEdhbWJsZUJ1dHRvblByZXNzZWQgPSBuZXcgQ3VzdG9tRXZlbnQoJ0dhbWJsZUJ1dHRvblByZXNzZWQnKSxcclxuICAgIEF1dG9TdGFydEJ1dHRvblByZXNzZWQgPSBuZXcgQ3VzdG9tRXZlbnQoJ0F1dG9TdGFydEJ1dHRvblByZXNzZWQnKSxcclxuICAgIE1heEJldEJ1dHRvblByZXNzZWQgPSBuZXcgQ3VzdG9tRXZlbnQoJ01heEJldEJ1dHRvblByZXNzZWQnKSxcclxuICAgIEV4aXRIZWxwQnV0dG9uUHJlc3NlZCA9IG5ldyBDdXN0b21FdmVudCgnRXhpdEhlbHBCdXR0b25QcmVzc2VkJyksXHJcbiAgICBQcmV2SGVscFBhZ2VCdXR0b25QcmVzc2VkID0gbmV3IEN1c3RvbUV2ZW50KCdQcmV2SGVscFBhZ2VCdXR0b25QcmVzc2VkJyksXHJcbiAgICBOZXh0SGVscFBhZ2VCdXR0b25QcmVzc2VkID0gbmV3IEN1c3RvbUV2ZW50KCdOZXh0SGVscFBhZ2VCdXR0b25QcmVzc2VkJyksXHJcbiAgICBIZWxwQnV0dG9uUHJlc3NlZCA9IG5ldyBDdXN0b21FdmVudCgnSGVscEJ1dHRvblByZXNzZWQnKSxcclxuICAgIE1lbnVCdXR0b25QcmVzc2VkID0gbmV3IEN1c3RvbUV2ZW50KCdNZW51QnV0dG9uUHJlc3NlZCcpLFxyXG4gICAgU3RvcEJ1dHRvblByZXNzZWQgPSBuZXcgQ3VzdG9tRXZlbnQoJ1N0b3BCdXR0b25QcmVzc2VkJyksXHJcbiAgICBTdGFydEJvbnVzQnV0dG9uUHJlc3NlZCA9IG5ldyBDdXN0b21FdmVudCgnU3RhcnRCb251c0J1dHRvblByZXNzZWQnKSxcclxuICAgIENvbGxlY3RCdXR0b25QcmVzc2VkID0gbmV3IEN1c3RvbUV2ZW50KCdDb2xsZWN0QnV0dG9uUHJlc3NlZCcpLFxyXG4gICAgU3RhcnRCdXR0b25QcmVzc2VkID0gbmV3IEN1c3RvbUV2ZW50KCdTdGFydEJ1dHRvblByZXNzZWQnKSxcclxuICAgIENhbmNlbEF1dG9TdGFydEJ1dHRvblByZXNzZWQgPSBuZXcgQ3VzdG9tRXZlbnQoJ0NhbmNlbEF1dG9TdGFydEJ1dHRvblByZXNzZWQnKTtcclxuXHJcblxyXG5leHBvcnQgbGV0IEJ1dHRvbkV2ZW50cyA9IHtcclxuICAgICdDbGlja2VkT25CYXNlR2FtZVNjZW5lJzogQ2xpY2tlZE9uQmFzZUdhbWVTY2VuZSxcclxuXHJcbiAgICAnU3RhcnRCdXR0b25QcmVzc2VkJzogU3RhcnRCdXR0b25QcmVzc2VkLFxyXG4gICAgJ1N0b3BCdXR0b25QcmVzc2VkJyA6IFN0b3BCdXR0b25QcmVzc2VkLFxyXG4gICAgJ0NvbGxlY3RCdXR0b25QcmVzc2VkJzogQ29sbGVjdEJ1dHRvblByZXNzZWQsXHJcbiAgICAnU3RhcnRCb251c0J1dHRvblByZXNzZWQnOiBTdGFydEJvbnVzQnV0dG9uUHJlc3NlZCxcclxuXHJcbiAgICAnTWVudUJ1dHRvblByZXNzZWQnIDogTWVudUJ1dHRvblByZXNzZWQsXHJcbiAgICAnSGVscEJ1dHRvblByZXNzZWQnIDogSGVscEJ1dHRvblByZXNzZWQsXHJcbiAgICAnR2FtYmxlQnV0dG9uUHJlc3NlZCc6IEdhbWJsZUJ1dHRvblByZXNzZWQsXHJcbiAgICAnQmV0QnV0dG9uUHJlc3NlZCc6IEJldEJ1dHRvblByZXNzZWQsXHJcbiAgICAnTWF4QmV0QnV0dG9uUHJlc3NlZCc6IE1heEJldEJ1dHRvblByZXNzZWQsXHJcblxyXG4gICAgJ0F1dG9TdGFydEJ1dHRvblByZXNzZWQnOiBBdXRvU3RhcnRCdXR0b25QcmVzc2VkLFxyXG4gICAgJ0NhbmNlbEF1dG9TdGFydEJ1dHRvblByZXNzZWQnOiBDYW5jZWxBdXRvU3RhcnRCdXR0b25QcmVzc2VkLFxyXG5cclxuICAgICdOZXh0SGVscFBhZ2VCdXR0b25QcmVzc2VkJzogTmV4dEhlbHBQYWdlQnV0dG9uUHJlc3NlZCxcclxuICAgICdQcmV2SGVscFBhZ2VCdXR0b25QcmVzc2VkJzogUHJldkhlbHBQYWdlQnV0dG9uUHJlc3NlZCxcclxuICAgICdFeGl0SGVscEJ1dHRvblByZXNzZWQnIDogRXhpdEhlbHBCdXR0b25QcmVzc2VkLFxyXG5cclxuICAgICdHYW1ibGVDb2xsZWN0UHJlc3NlZCc6IEdhbWJsZUNvbGxlY3RQcmVzc2VkLFxyXG4gICAgJ0dhbWJsZVJlZFByZXNzZWQnOiBHYW1ibGVSZWRQcmVzc2VkLFxyXG4gICAgJ0dhbWJsZUJsYWNrUHJlc3NlZCc6IEdhbWJsZUJsYWNrUHJlc3NlZCxcclxufTsiLCIvKipcclxuICogQ3JlYXRlZCBieSB0YXJhc2cgb24gOS8yMi8yMDE3LlxyXG4gKi9cclxuLyoqXHJcbiAqIENyZWF0ZWQgYnkgdGFyYXNnIG9uIDUvMTAvMjAxNy5cclxuICovXHJcbmltcG9ydCB7YXBwfSBmcm9tIFwiLi4vbWFpblwiO1xyXG5pbXBvcnQgKiBhcyB1dGlscyBmcm9tIFwiLi4vVXRpbHMvaGVscGVyRnVuY3NcIjtcclxuaW1wb3J0IHtidXR0b25SZXNvdXJjZXN9IGZyb20gXCIuL2J1dHRvbk5hbWVzXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgQnV0dG9uIHtcclxuXHJcbiAgICBwdWJsaWMgdGV4dHVyZUVuYWJsZWQgOiBQSVhJLlRleHR1cmU7XHJcbiAgICBwdWJsaWMgdGV4dHVyZURpc2FibGVkOiBQSVhJLlRleHR1cmU7XHJcbiAgICBwdWJsaWMgdGV4dHVyZVByZXNzZWQgOiBQSVhJLlRleHR1cmU7XHJcblxyXG4gICAgcHVibGljIHNwcml0ZTogUElYSS5TcHJpdGUgfCBhbnk7XHJcblxyXG4gICAgcHVibGljIHg6IG51bWJlcjtcclxuICAgIHB1YmxpYyB5OiBudW1iZXI7XHJcbiAgICBwdWJsaWMgc2NlbmU6IFBJWEkuQ29udGFpbmVyO1xyXG4gICAgcHVibGljIHNvdW5kOiBhbnk7XHJcblxyXG4gICAgcHVibGljIG9uQnV0dG9uQ2xpY2sgOiBGdW5jdGlvbjtcclxuICAgIHByaXZhdGUgaXNEb3duOiBib29sZWFuO1xyXG4gICAgcHJpdmF0ZSBzdGF0ZTogc3RyaW5nO1xyXG5cclxuXHJcbiAgICBjb25zdHJ1Y3RvcihzY2VuZTogUElYSS5Db250YWluZXIsIHg6IG51bWJlciwgeTogbnVtYmVyLCBidXR0b25OYW1lOiBzdHJpbmcsIHJlc291cmNlczphbnksIGFjdGlvbjogRnVuY3Rpb24pIHtcclxuICAgICAgICAvLyBlbmFibGVkX2ltZywgZGlzX2ltZywgcHJlc3NlZF9pbWc6ICBQSVhJLlRleHR1dHJlIG9yIHN0cmluZyB1cmwgdG8gdGhlIGltYWdlXHJcbiAgICAgICAgdGhpcy54ID0geDtcclxuICAgICAgICB0aGlzLnkgPSB5O1xyXG4gICAgICAgIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuICAgICAgICB0aGlzLnRleHR1cmVFbmFibGVkICA9ICByZXNvdXJjZXNbYnV0dG9uUmVzb3VyY2VzW2J1dHRvbk5hbWVdLmVuYWJsZWRdO1xyXG4gICAgICAgIHRoaXMudGV4dHVyZURpc2FibGVkID0gcmVzb3VyY2VzW2J1dHRvblJlc291cmNlc1tidXR0b25OYW1lXS5kaXNhYmxlZF07XHJcbiAgICAgICAgdGhpcy50ZXh0dXJlUHJlc3NlZCAgPSByZXNvdXJjZXNbYnV0dG9uUmVzb3VyY2VzW2J1dHRvbk5hbWVdLnByZXNzZWRdO1xyXG4gICAgICAgIHRoaXMub25CdXR0b25DbGljayA9IGFjdGlvbjtcclxuXHJcbiAgICAgICAgdGhpcy5zcHJpdGUgPSBuZXcgUElYSS5TcHJpdGUodGhpcy50ZXh0dXJlRW5hYmxlZCk7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUuaW50ZXJhY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlLmJ1dHRvbk1vZGUgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9ICdlbmFibGVkJztcclxuXHJcbiAgICAgICAgdGhpcy5zcHJpdGUuYW5jaG9yLnNldCgwLjUsIDAuNSk7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUueCA9IHRoaXMueDtcclxuICAgICAgICB0aGlzLnNwcml0ZS55ID0gdGhpcy55O1xyXG4gICAgICAgIHRoaXMuc3ByaXRlLm9uKCdwb2ludGVyZG93bicsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgICAgICB0aGlzLmlzRG93biA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuc3ByaXRlLnRleHR1cmUgPSB0aGlzLnRleHR1cmVQcmVzc2VkO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHRoaXMuc3ByaXRlLm9uKCdwb2ludGVydXAnLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3ByaXRlLnRleHR1cmUgPSB0aGlzLnRleHR1cmVFbmFibGVkO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5pc0Rvd24pXHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uQnV0dG9uQ2xpY2soKTtcclxuICAgICAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICB0aGlzLnNwcml0ZS5vbigncG9pbnRlcm91dCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5zcHJpdGUudGV4dHVyZSA9IHRoaXMudGV4dHVyZUVuYWJsZWQ7XHJcbiAgICAgICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgdGhpcy5zY2VuZS5hZGRDaGlsZCh0aGlzLnNwcml0ZSk7XHJcblxyXG4gICAgICAgIHRoaXMuc3ByaXRlLm1vZGVsID0gdGhpcztcclxuXHJcblxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBoaWRlKCkge1xyXG4gICAgICAgIHRoaXMuc3ByaXRlLnZpc2libGUgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2hvdygpIHtcclxuICAgICAgICB0aGlzLnNwcml0ZS52aXNpYmxlID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZGlzYWJsZSgpIHtcclxuICAgICAgICB0aGlzLnN0YXRlID0gJ2Rpc2FibGVkJztcclxuICAgICAgICB0aGlzLnNwcml0ZS50ZXh0dXJlID0gdGhpcy50ZXh0dXJlRGlzYWJsZWQ7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUuaW50ZXJhY3RpdmUgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZW5hYmxlKCkge1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSAnZW5hYmxlZCc7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUudGV4dHVyZSA9IHRoaXMudGV4dHVyZUVuYWJsZWQ7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUuaW50ZXJhY3RpdmUgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjbGljaygpIHtcclxuICAgICAgICB0aGlzLnN0YXRlID0gJ3ByZXNzZWQnO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlLnRleHR1cmUgPSB0aGlzLnRleHR1cmVQcmVzc2VkO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlLmludGVyYWN0aXZlID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG59XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIERlbm9taW5hdGlvblBhbmVsQnV0dG9uIGV4dGVuZHMgQnV0dG9uIHtcclxuXHJcbiAgICBwdWJsaWMgc2VsZWN0ZWRTdGFrZTogUElYSS5UZXh0O1xyXG4gICAgcHVibGljIHN0YWtlc1lwb3M6IG51bWJlcltdID0gW107XHJcbiAgICBwdWJsaWMgY3VycmVudFN0YWtlQW1vdW50OiBudW1iZXI7XHJcbiAgICBwdWJsaWMgc3Rha2VGb250U3R5bGU6IGFueTtcclxuICAgIHB1YmxpYyBmb250U3R5bGU6IGFueTtcclxuICAgIHB1YmxpYyBzdGFrZXM6IG51bWJlcltdO1xyXG4gICAgcHVibGljIGRlbm9tUGFuZWxDb250YWluZXI6IFBJWEkuQ29udGFpbmVyO1xyXG4gICAgcHVibGljIGRlbm9tU3ByaXRlQm90dG9tOiBQSVhJLlNwcml0ZTtcclxuICAgIHB1YmxpYyBkZW5vbVNwcml0ZVRvcDogUElYSS5TcHJpdGU7XHJcbiAgICBwdWJsaWMgZGVub21TcHJpdGVNaWRkbGU6IFBJWEkuU3ByaXRlO1xyXG4gICAgcHVibGljIGRlbm9tU3ByaXRlU2VsZWN0ZWQ6IFBJWEkuU3ByaXRlO1xyXG4gICAgcHVibGljIGRlbm9tQm90dG9tOiBQSVhJLlRleHR1cmU7XHJcbiAgICBwdWJsaWMgZGVub21Ub3A6IFBJWEkuVGV4dHVyZTtcclxuICAgIHB1YmxpYyBkZW5vbU1pZGRsZTogUElYSS5UZXh0dXJlO1xyXG4gICAgcHVibGljIGRlbm9tU2VsZWN0ZWQ6IFBJWEkuVGV4dHVyZTtcclxuICAgIHByaXZhdGUgZGVub21QYXJ0Q29udGFpbmVyczogUElYSS5Db250YWluZXJbXTtcclxuICAgIHB1YmxpYyBpc1Nob3duOiBib29sZWFuO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHNjZW5lOiBQSVhJLkNvbnRhaW5lciwgeDogbnVtYmVyLCB5OiBudW1iZXIsIGZvbnRTdHlsZTogYW55LHN0YWtlRm9udFN0eWxlOiBhbnksIGRlbm9tQm90dG9tOmFueSwgZGVub21Ub3A6YW55LCBkZW5vbU1pZDphbnksIGRlbm9tU2VsZWN0OiBhbnksIGVuYWJsZWRfaW1nOiBhbnksIGRpc19pbWc6ICBhbnksIHByZXNzZWRfaW1nOiBhbnksIHNvdW5kOiBhbnksIGFjdGlvbjogRnVuY3Rpb24pe1xyXG4gICAgICAgIHN1cGVyKHNjZW5lLCB4LCB5LCBlbmFibGVkX2ltZywgZW5hYmxlZF9pbWcsIGFjdGlvbik7XHJcbiAgICAgICAgdGhpcy5pc1Nob3duID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZFN0YWtlID0gbmV3IFBJWEkuVGV4dCgnJywgZm9udFN0eWxlKTtcclxuICAgICAgICB0aGlzLmZvbnRTdHlsZSA9IGZvbnRTdHlsZTtcclxuICAgICAgICB0aGlzLnN0YWtlRm9udFN0eWxlID0gc3Rha2VGb250U3R5bGU7XHJcbiAgICAgICAgdGhpcy5kZW5vbVBhcnRDb250YWluZXJzID0gW107XHJcbiAgICAgICAgaWYgKHR5cGVvZiAgZGVub21Cb3R0b20gPT09IFwic3RyaW5nXCIgJiYgdHlwZW9mIGRlbm9tVG9wID09PSBcInN0cmluZ1wiICYmIHR5cGVvZiBkZW5vbU1pZCA9PT0gXCJzdHJpbmdcIiAmJiB0eXBlb2YgZGVub21TZWxlY3QgPT09IFwic3RyaW5nXCIgKXtcclxuICAgICAgICAgICAgdGhpcy5kZW5vbUJvdHRvbSA9IFBJWEkuVGV4dHVyZS5mcm9tSW1hZ2UoZGVub21Cb3R0b20pO1xyXG4gICAgICAgICAgICB0aGlzLmRlbm9tVG9wICAgID0gUElYSS5UZXh0dXJlLmZyb21JbWFnZShkZW5vbVRvcCk7XHJcbiAgICAgICAgICAgIHRoaXMuZGVub21NaWRkbGUgPSBQSVhJLlRleHR1cmUuZnJvbUltYWdlKGRlbm9tTWlkKTtcclxuICAgICAgICAgICAgdGhpcy5kZW5vbVNlbGVjdGVkID0gUElYSS5UZXh0dXJlLmZyb21JbWFnZShkZW5vbVNlbGVjdCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5kZW5vbUJvdHRvbSAgID0gZGVub21Cb3R0b207XHJcbiAgICAgICAgICAgIHRoaXMuZGVub21Ub3AgICAgICA9IGRlbm9tVG9wO1xyXG4gICAgICAgICAgICB0aGlzLmRlbm9tTWlkZGxlICAgPSBkZW5vbU1pZDtcclxuICAgICAgICAgICAgdGhpcy5kZW5vbVNlbGVjdGVkID0gZGVub21TZWxlY3Q7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZW5hYmxlRXZlbnRQcm9wYWdpbmF0aW9uKCk7XHJcbiAgICAgICAgdGhpcy5nZXRTdGFrZXMoKTtcclxuICAgICAgICB0aGlzLmluaXRpYWxpemVEZW5vbWluYXRpb25QYW5lbCgpO1xyXG4gICAgICAgIHRoaXMuaW50aXRpYWxpemVDdXJyZW50U3Rha2UoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpbml0aWFsaXplRGVub21pbmF0aW9uUGFuZWwoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5kZW5vbVNwcml0ZUJvdHRvbSA9IG5ldyBQSVhJLlNwcml0ZSh0aGlzLmRlbm9tQm90dG9tKTtcclxuICAgICAgICB0aGlzLmRlbm9tU3ByaXRlTWlkZGxlID0gbmV3IFBJWEkuU3ByaXRlKHRoaXMuZGVub21NaWRkbGUpO1xyXG4gICAgICAgIHRoaXMuZGVub21TcHJpdGVUb3AgICAgPSBuZXcgUElYSS5TcHJpdGUodGhpcy5kZW5vbVRvcCk7XHJcbiAgICAgICAgdGhpcy5kZW5vbVNwcml0ZVNlbGVjdGVkID0gbmV3IFBJWEkuU3ByaXRlKHRoaXMuZGVub21TZWxlY3RlZCk7XHJcblxyXG4gICAgICAgIHRoaXMuZGVub21QYW5lbENvbnRhaW5lciA9IG5ldyBQSVhJLkNvbnRhaW5lcigpO1xyXG4gICAgICAgIHRoaXMuZGVub21QYW5lbENvbnRhaW5lci52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5kZW5vbVBhbmVsQ29udGFpbmVyLmFscGhhID0gMDtcclxuICAgICAgICB0aGlzLmRlbm9tUGFuZWxDb250YWluZXIueCA9IHRoaXMuc3ByaXRlLnggLSB0aGlzLnNwcml0ZS53aWR0aC8yO1xyXG4gICAgICAgIHRoaXMuZGVub21QYW5lbENvbnRhaW5lci55ID0gKHRoaXMuc3ByaXRlLnkgLSB0aGlzLnNwcml0ZS5oZWlnaHQvMikgLSB0aGlzLmRlbm9tU3ByaXRlVG9wLmhlaWdodCAtICh0aGlzLmRlbm9tU3ByaXRlTWlkZGxlLmhlaWdodCoodGhpcy5zdGFrZXMubGVuZ3RoLTIpKSAtIHRoaXMuZGVub21TcHJpdGVCb3R0b20uaGVpZ2h0O1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpPTA7IGk8dGhpcy5zdGFrZXMubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgICAgICB0aGlzLmFkZERlbm9tUGFuZWxQYXJ0KGkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNjZW5lLmFkZENoaWxkKHRoaXMuZGVub21QYW5lbENvbnRhaW5lcik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhZGREZW5vbVBhbmVsUGFydChpbmRleCkge1xyXG4gICAgICAgIGxldCBwYXJ0Q29udGFpbmVyID0gbmV3IFBJWEkuQ29udGFpbmVyKCksXHJcbiAgICAgICAgICAgIHN0YWtlID0gbmV3IFBJWEkuVGV4dCh1dGlscy5mb3JtYXRTdGFrZUFtb3VudCh0aGlzLnN0YWtlc1tpbmRleF0pLCB0aGlzLmZvbnRTdHlsZSksXHJcbiAgICAgICAgICAgIHBhcnRTcHJpdGU7XHJcblxyXG4gICAgICAgIHN0YWtlLmFuY2hvci5zZXQoMC41LCAwLjUpO1xyXG4gICAgICAgIHN0YWtlLnggPSB0aGlzLmRlbm9tU3ByaXRlTWlkZGxlLndpZHRoLzI7XHJcbiAgICAgICAgc3Rha2UueSA9IHRoaXMuZGVub21TcHJpdGVNaWRkbGUuaGVpZ2h0LzI7XHJcblxyXG4gICAgICAgIGlmIChpbmRleCA9PSAwKXtcclxuICAgICAgICAgICAgcGFydFNwcml0ZSA9IHRoaXMuZGVub21TcHJpdGVUb3A7XHJcbiAgICAgICAgICAgIHN0YWtlLnkgPSBwYXJ0U3ByaXRlLmhlaWdodCAtIHRoaXMuZGVub21TcHJpdGVNaWRkbGUuaGVpZ2h0LzI7XHJcbiAgICAgICAgICAgIHBhcnRDb250YWluZXIueSA9IDA7XHJcbiAgICAgICAgfSBlbHNlIGlmIChpbmRleCA9PSB0aGlzLnN0YWtlcy5sZW5ndGgtMSkge1xyXG4gICAgICAgICAgICBwYXJ0U3ByaXRlID0gdGhpcy5kZW5vbVNwcml0ZUJvdHRvbTtcclxuICAgICAgICAgICAgcGFydENvbnRhaW5lci55ID0gdGhpcy5kZW5vbVNwcml0ZVRvcC5oZWlnaHQgKyAodGhpcy5kZW5vbVNwcml0ZU1pZGRsZS5oZWlnaHQgKiAodGhpcy5zdGFrZXMubGVuZ3RoLTIpKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwYXJ0U3ByaXRlID0gbmV3IFBJWEkuU3ByaXRlKHRoaXMuZGVub21NaWRkbGUpO1xyXG4gICAgICAgICAgICBwYXJ0Q29udGFpbmVyLnkgPSB0aGlzLmRlbm9tU3ByaXRlVG9wLmhlaWdodCArICh0aGlzLmRlbm9tU3ByaXRlTWlkZGxlLmhlaWdodCAqIChpbmRleC0xKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc3Rha2VzWXBvcy5wdXNoKHBhcnRDb250YWluZXIueSArIHN0YWtlLnkpO1xyXG4gICAgICAgIHBhcnRDb250YWluZXIuYWRkQ2hpbGQocGFydFNwcml0ZSk7XHJcblxyXG4gICAgICAgIHBhcnRDb250YWluZXIuaW50ZXJhY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgIHBhcnRDb250YWluZXIub24oJ3BvaW50ZXJkb3duJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgdGhpcy5jaGFuZ2VTdGFrZSh0aGlzLnN0YWtlc1tpbmRleF0pO1xyXG5cclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICBwYXJ0Q29udGFpbmVyLmFkZENoaWxkKHN0YWtlKTtcclxuICAgICAgICB0aGlzLmRlbm9tUGFydENvbnRhaW5lcnMucHVzaChwYXJ0Q29udGFpbmVyKTtcclxuICAgICAgICB0aGlzLmRlbm9tUGFuZWxDb250YWluZXIuYWRkQ2hpbGQocGFydENvbnRhaW5lcilcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldFN0YWtlcygpIHtcclxuICAgICAgICB0aGlzLnN0YWtlcyA9IFsyMCwgNDAsIDYwLCA4MCwgMTAwXS5yZXZlcnNlKCk7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50U3Rha2VBbW91bnQgPSB0aGlzLnN0YWtlc1swXTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGludGl0aWFsaXplQ3VycmVudFN0YWtlKCkge1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRTdGFrZSA9IG5ldyBQSVhJLlRleHQodXRpbHMuZm9ybWF0U3Rha2VBbW91bnQodGhpcy5jdXJyZW50U3Rha2VBbW91bnQpLCB0aGlzLnN0YWtlRm9udFN0eWxlKTtcclxuICAgICAgICB0aGlzLnNlbGVjdGVkU3Rha2UuYW5jaG9yLnNldCgwLjUsIDAuNSk7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZFN0YWtlLnggPSB0aGlzLnNwcml0ZS54O1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRTdGFrZS55ID0gdGhpcy5zcHJpdGUueSs1OyAvLyArNSBkdWUgdG8gZ3JhcGhpY3MgaXNzdWVcclxuICAgICAgICB0aGlzLnNjZW5lLmFkZENoaWxkKHRoaXMuc2VsZWN0ZWRTdGFrZSk7XHJcblxyXG4gICAgICAgIHRoaXMuZGVub21TcHJpdGVTZWxlY3RlZC5hbmNob3Iuc2V0KDAuNSwgMC41KTtcclxuICAgICAgICB0aGlzLmRlbm9tU3ByaXRlU2VsZWN0ZWQuYWxwaGEgPSAwLjI7XHJcbiAgICAgICAgdGhpcy5kZW5vbVNwcml0ZVNlbGVjdGVkLnggPSB0aGlzLmRlbm9tU3ByaXRlTWlkZGxlLndpZHRoLzI7XHJcbiAgICAgICAgdGhpcy5kZW5vbVNwcml0ZVNlbGVjdGVkLnkgPSB0aGlzLmdldFNlbGVjdGVkU3Rha2VZcG9zKCk7XHJcbiAgICAgICAgdGhpcy5kZW5vbVBhbmVsQ29udGFpbmVyLmFkZENoaWxkKHRoaXMuZGVub21TcHJpdGVTZWxlY3RlZCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRTZWxlY3RlZFN0YWtlWXBvcygpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCBpbmRleCA9IHRoaXMuc3Rha2VzLmluZGV4T2YodGhpcy5jdXJyZW50U3Rha2VBbW91bnQpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLnN0YWtlc1lwb3NbaW5kZXhdO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGVuYWJsZUV2ZW50UHJvcGFnaW5hdGlvbigpIHtcclxuICAgICAgICB0aGlzLnNwcml0ZS5vbigncG9pbnRlcmRvd24nLCBmdW5jdGlvbihlKXtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgdGhpcy5pc0Rvd24gPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLnNvdW5kLmN1cnJlbnRUaW1lID0gMDtcclxuICAgICAgICAgICAgdGhpcy5zb3VuZC5wbGF5KCk7XHJcbiAgICAgICAgICAgIHRoaXMuc3ByaXRlLnRleHR1cmUgPSB0aGlzLnRleHR1cmVQcmVzc2VkO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHRoaXMuc3ByaXRlLm9uKCdwb2ludGVydXAnLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIHRoaXMuc3ByaXRlLnRleHR1cmUgPSB0aGlzLnRleHR1cmVFbmFibGVkO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5pc0Rvd24pXHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uQ2xpY2soKTtcclxuICAgICAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzaG93UGFuZWwoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmlzU2hvd24pXHJcbiAgICAgICAgICAgIGFwcC50aWNrZXIuYWRkKHNob3dQYW5lbEFuaW1hdGlvbiwgdGhpcyk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNob3dQYW5lbEFuaW1hdGlvbih0aW1lZGVsdGE6IG51bWJlcikge1xyXG4gICAgICAgICAgICB0aGlzLmRlbm9tUGFuZWxDb250YWluZXIudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuZGVub21QYW5lbENvbnRhaW5lci5hbHBoYSA9IE1hdGgubWluKCh0aGlzLmRlbm9tUGFuZWxDb250YWluZXIuYWxwaGErKDAuMDgqdGltZWRlbHRhKSksIDEpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5kZW5vbVBhbmVsQ29udGFpbmVyLmFscGhhID09IDEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaXNTaG93biA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNjZW5lLmludGVyYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGFwcC50aWNrZXIucmVtb3ZlKHNob3dQYW5lbEFuaW1hdGlvbiwgdGhpcyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBoaWRlUGFuZWwoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNTaG93bilcclxuICAgICAgICAgICAgYXBwLnRpY2tlci5hZGQoaGlkZVBhbmVsQW5pbWF0aW9uLCB0aGlzKTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaGlkZVBhbmVsQW5pbWF0aW9uKHRpbWVkZWx0YTogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVub21QYW5lbENvbnRhaW5lci5hbHBoYSA9IE1hdGgubWF4KCh0aGlzLmRlbm9tUGFuZWxDb250YWluZXIuYWxwaGEtKDAuMDgqdGltZWRlbHRhKSksIDApO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5kZW5vbVBhbmVsQ29udGFpbmVyLmFscGhhID09IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVub21QYW5lbENvbnRhaW5lci52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzU2hvd24gPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2NlbmUuaW50ZXJhY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGFwcC50aWNrZXIucmVtb3ZlKGhpZGVQYW5lbEFuaW1hdGlvbiwgdGhpcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNoYW5nZVN0YWtlKHRvKSB7XHJcblxyXG4gICAgICAgIGxldCB0b1kgPSB0aGlzLnN0YWtlc1lwb3NbdGhpcy5zdGFrZXMuaW5kZXhPZih0byldO1xyXG4gICAgICAgIHRoaXMuc2V0SW50ZXJhY3RpdmVGb3JQYXJ0Q29udGFpbmVycyhmYWxzZSk7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZFN0YWtlLnRleHQgPSAgdXRpbHMuZm9ybWF0U3Rha2VBbW91bnQodG8pO1xyXG5cclxuICAgICAgICBsZXQgY2hhbmdlU3Rha2VFdmVudCA9IG5ldyBDdXN0b21FdmVudCgnY2hhbmdlU3Rha2VFdmVudCcsIHsnZGV0YWlsJzp7J25ld1N0YWtlJzogdG99fSk7XHJcbiAgICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChjaGFuZ2VTdGFrZUV2ZW50KTtcclxuXHJcbiAgICAgICAgYXBwLnRpY2tlci5hZGQoY2hhbmdlU3Rha2VBbmltYXRpb24sIHRoaXMpO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBjaGFuZ2VTdGFrZUFuaW1hdGlvbih0aW1lZGVsdGE6IG51bWJlcikge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5kZW5vbVNwcml0ZVNlbGVjdGVkLnkgPCB0b1kpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZW5vbVNwcml0ZVNlbGVjdGVkLnkgPSBNYXRoLm1pbih0aGlzLmRlbm9tU3ByaXRlU2VsZWN0ZWQueSArIHRpbWVkZWx0YSozMCwgdG9ZKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICh0aGlzLmRlbm9tU3ByaXRlU2VsZWN0ZWQueSA+IHRvWSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZW5vbVNwcml0ZVNlbGVjdGVkLnkgPSBNYXRoLm1heCh0aGlzLmRlbm9tU3ByaXRlU2VsZWN0ZWQueSAtIHRpbWVkZWx0YSozMCwgdG9ZKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFN0YWtlQW1vdW50ID0gdG87XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldEludGVyYWN0aXZlRm9yUGFydENvbnRhaW5lcnModHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICBhcHAudGlja2VyLnJlbW92ZShjaGFuZ2VTdGFrZUFuaW1hdGlvbiwgdGhpcyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0SW50ZXJhY3RpdmVGb3JQYXJ0Q29udGFpbmVycyh2YWx1ZTogYm9vbGVhbil7XHJcbiAgICAgICAgZm9yKGxldCBpPTA7IGk8dGhpcy5kZW5vbVBhcnRDb250YWluZXJzLmxlbmd0aDsgaSsrKXtcclxuICAgICAgICAgICAgdGhpcy5kZW5vbVBhcnRDb250YWluZXJzW2ldLmludGVyYWN0aXZlID0gdmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufVxyXG5cclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgdGFyYXNnIG9uIDkvMjgvMjAxNy5cclxuICovXHJcblxyXG5pbXBvcnQge0NvdW50VXB9IGZyb20gXCIuLi9VdGlscy9jb3VudGVyXCI7XHJcbmltcG9ydCB7YXBwfSBmcm9tIFwiLi4vbWFpblwiO1xyXG5pbXBvcnQgeyBidXR0b25SZXNvdXJjZXMgfSBmcm9tIFwiLi9idXR0b25OYW1lc1wiO1xyXG5leHBvcnQgY2xhc3MgTnVtZXJpY0ZpZWxkIHtcclxuXHJcbiAgICBwdWJsaWMgZmllbGRCYWNrR3JvdW5kIDogUElYSS5UZXh0dXJlO1xyXG4gICAgcHVibGljIGZpZWxkQ29udGFpbmVyOiBQSVhJLkNvbnRhaW5lcjtcclxuICAgIHB1YmxpYyBzcHJpdGU6IFBJWEkuU3ByaXRlIHwgYW55O1xyXG4gICAgcHVibGljIHRleHRTdHlsZTogYW55O1xyXG4gICAgcHVibGljIHRleHQ6IFBJWEkuVGV4dDtcclxuICAgIHB1YmxpYyBjb3VudGVyOiBhbnk7XHJcbiAgICBwdWJsaWMgeDogbnVtYmVyO1xyXG4gICAgcHVibGljIHk6IG51bWJlcjtcclxuICAgIHB1YmxpYyBzY2VuZTogUElYSS5Db250YWluZXI7XHJcblxyXG5cclxuICAgIGNvbnN0cnVjdG9yKHNjZW5lOiBQSVhJLkNvbnRhaW5lciwgbmFtZTpzdHJpbmcsIHg6IG51bWJlciwgeTogbnVtYmVyLCByZXNvdXJjZXM6IGFueSwgdGV4dFN0eWxlOiBhbnksIHhfZGVsdGE9MCkge1xyXG4gICAgICAgIC8vIGVuYWJsZWRfaW1nLCBkaXNfaW1nLCBwcmVzc2VkX2ltZzogIFBJWEkuVGV4dHV0cmUgb3Igc3RyaW5nIHVybCB0byB0aGUgaW1hZ2VcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICAgICAgdGhpcy50ZXh0U3R5bGUgPSB0ZXh0U3R5bGU7XHJcbiAgICAgICAgdGhpcy5zY2VuZSA9IHNjZW5lO1xyXG4gICAgICAgIHRoaXMuZmllbGRCYWNrR3JvdW5kICA9ICByZXNvdXJjZXNbYnV0dG9uUmVzb3VyY2VzW25hbWVdLmJhY2tncm91bmRdO1xyXG5cclxuXHJcbiAgICAgICAgdGhpcy5maWVsZENvbnRhaW5lciA9IG5ldyBQSVhJLkNvbnRhaW5lcigpO1xyXG4gICAgICAgIHRoaXMuZmllbGRDb250YWluZXIueCA9IHRoaXMueDtcclxuICAgICAgICB0aGlzLmZpZWxkQ29udGFpbmVyLnkgPSB0aGlzLnk7XHJcblxyXG4gICAgICAgIHRoaXMuc3ByaXRlID0gbmV3IFBJWEkuU3ByaXRlKHRoaXMuZmllbGRCYWNrR3JvdW5kKTtcclxuICAgICAgICB0aGlzLnNwcml0ZS5hbmNob3Iuc2V0KDAuNSwgMC41KTtcclxuICAgICAgICB0aGlzLnNwcml0ZS54ID0gdGhpcy5zcHJpdGUud2lkdGgvMjtcclxuICAgICAgICB0aGlzLnNwcml0ZS55ID0gdGhpcy5zcHJpdGUuaGVpZ2h0LzI7XHJcbiAgICAgICAgdGhpcy5maWVsZENvbnRhaW5lci5hZGRDaGlsZCh0aGlzLnNwcml0ZSk7XHJcblxyXG4gICAgICAgIC8vIGFkZCB0ZXh0XHJcbiAgICAgICAgdGhpcy50ZXh0ID0gbmV3IFBJWEkuVGV4dCgnJywgdGhpcy50ZXh0U3R5bGUpO1xyXG4gICAgICAgIHRoaXMuZmllbGRDb250YWluZXIuYWRkQ2hpbGQodGhpcy50ZXh0KTtcclxuICAgICAgICB0aGlzLnRleHQuYW5jaG9yLnNldCgwLjUsIDAuNSk7XHJcbiAgICAgICAgdGhpcy50ZXh0LnggPSB0aGlzLnNwcml0ZS54K3hfZGVsdGE7XHJcbiAgICAgICAgdGhpcy50ZXh0LnkgPSB0aGlzLnNwcml0ZS55O1xyXG5cclxuICAgICAgICB0aGlzLnNjZW5lLmFkZENoaWxkKHRoaXMuZmllbGRDb250YWluZXIpO1xyXG5cclxuICAgICAgICAvLyBjb3VudGVyXHJcbiAgICAgICAgdGhpcy5jb3VudGVyID0gbmV3IENvdW50VXAodGhpcy50ZXh0LCAwLjAsIDAuMCwgMiwgMC41LCB7fSk7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUubW9kZWwgPSB0aGlzO1xyXG5cclxuXHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFkZFZhbHVlKHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmNvdW50ZXIudXBkYXRlKHRoaXMuY291bnRlci5lbmRWYWwrdmFsdWUvMTAwKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3Vic3RyYWN0VmFsdWUodmFsdWU6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuY291bnRlci51cGRhdGUodGhpcy5jb3VudGVyLmVuZFZhbCAtIHZhbHVlLzEwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNvdW50VGlsbCh2YWx1ZTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5jb3VudGVyLnVwZGF0ZSh2YWx1ZS8xMDApO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBoaWRlKCkge1xyXG4gICAgICAgIHRoaXMuZmllbGRDb250YWluZXIudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzaG93KCkge1xyXG4gICAgICAgIHRoaXMuZmllbGRDb250YWluZXIudmlzaWJsZSA9IHRydWU7XHJcbiAgICB9XHJcblxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQmFsYW5jZUZpZWxkV2l0aEhpZGVDcmVkaXRzQW5pbWF0aW9uIGV4dGVuZHMgTnVtZXJpY0ZpZWxkIHtcclxuXHJcbiAgICBwdWJsaWMgc2hvd19jcmVkaXRzX3Nwcml0ZTogUElYSS5TcHJpdGU7XHJcbiAgICBwdWJsaWMgc2hvd19jcmVkaXRzX3RleHR1cmUgOiBQSVhJLlRleHR1cmU7XHJcbiAgICBwdWJsaWMgaGlkZV9jcmVkaXRzX3Nwcml0ZTogUElYSS5TcHJpdGU7XHJcbiAgICBwdWJsaWMgaGlkZV9jcmVkaXRzX3RleHR1cmU6IFBJWEkuVGV4dHVyZTtcclxuICAgIHByaXZhdGUgY29udGFpbmVyTWFzazogUElYSS5HcmFwaGljcztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihzY2VuZTogUElYSS5Db250YWluZXIsIG5hbWU6c3RyaW5nLCB4OiBudW1iZXIsIHk6IG51bWJlciwgcmVzb3VyY2VzOmFueSwgdGV4dFN0eWxlOiBhbnkpe1xyXG4gICAgICAgIHN1cGVyKHNjZW5lLCBuYW1lLCB4LCB5LCByZXNvdXJjZXMsIHRleHRTdHlsZSk7XHJcblxyXG4gICAgICAgIHRoaXMuc2hvd19jcmVkaXRzX3RleHR1cmUgID0gIHJlc291cmNlc1tidXR0b25SZXNvdXJjZXNbbmFtZV0uc2hvd19jcmVkaXRzXTtcclxuICAgICAgICB0aGlzLmhpZGVfY3JlZGl0c190ZXh0dXJlID0gcmVzb3VyY2VzW2J1dHRvblJlc291cmNlc1tuYW1lXS5oaWRlX2NyZWRpdHNdO1xyXG5cclxuICAgICAgICAvLyBhZGQgcHJlc3MgdG8gaGlkZSBpbWcgdGV4dFxyXG4gICAgICAgIHRoaXMuaGlkZV9jcmVkaXRzX3Nwcml0ZSA9IG5ldyBQSVhJLlNwcml0ZSh0aGlzLmhpZGVfY3JlZGl0c190ZXh0dXJlKTtcclxuICAgICAgICB0aGlzLmhpZGVfY3JlZGl0c19zcHJpdGUuYW5jaG9yLnNldCgwLjUsIDAuNSk7XHJcbiAgICAgICAgdGhpcy5oaWRlX2NyZWRpdHNfc3ByaXRlLnggPSB0aGlzLnNwcml0ZS53aWR0aC8yO1xyXG4gICAgICAgIHRoaXMuaGlkZV9jcmVkaXRzX3Nwcml0ZS55ID0gdGhpcy5zcHJpdGUuaGVpZ2h0LzIgKyAyNTtcclxuICAgICAgICB0aGlzLmZpZWxkQ29udGFpbmVyLmFkZENoaWxkKHRoaXMuaGlkZV9jcmVkaXRzX3Nwcml0ZSk7XHJcblxyXG4gICAgICAgIC8vIGFkZCBzaG93IGNyZWRpdCBpbWFnZVxyXG4gICAgICAgIHRoaXMuc2hvd19jcmVkaXRzX3Nwcml0ZSA9IG5ldyBQSVhJLlNwcml0ZSh0aGlzLnNob3dfY3JlZGl0c190ZXh0dXJlKTtcclxuICAgICAgICB0aGlzLnNob3dfY3JlZGl0c19zcHJpdGUuYW5jaG9yLnNldCgwLjUsIDAuNSk7XHJcbiAgICAgICAgdGhpcy5zaG93X2NyZWRpdHNfc3ByaXRlLnggPSB0aGlzLnNob3dfY3JlZGl0c19zcHJpdGUud2lkdGgvMjtcclxuICAgICAgICB0aGlzLnNob3dfY3JlZGl0c19zcHJpdGUueSA9IHRoaXMuc2hvd19jcmVkaXRzX3Nwcml0ZS5oZWlnaHQvMiAtIHRoaXMuc2hvd19jcmVkaXRzX3Nwcml0ZS5oZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5zaG93X2NyZWRpdHNfc3ByaXRlLmludGVyYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnNob3dfY3JlZGl0c19zcHJpdGUuYnV0dG9uTW9kZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5zaG93X2NyZWRpdHNfc3ByaXRlLm9uKCdwb2ludGVyZG93bicsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5zaG93Q3JlZGl0cygpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5maWVsZENvbnRhaW5lci5hZGRDaGlsZCh0aGlzLnNob3dfY3JlZGl0c19zcHJpdGUpO1xyXG5cclxuICAgICAgICAvLyAgICBNQVNLOlxyXG4gICAgICAgIHRoaXMuY29udGFpbmVyTWFzayA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XHJcbiAgICAgICAgdGhpcy5pbml0aWFsaXplTWFzaygpO1xyXG5cclxuICAgICAgICB0aGlzLnNwcml0ZS5pbnRlcmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUuYnV0dG9uTW9kZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUub24oJ3BvaW50ZXJkb3duJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLmhpZGVDcmVkaXRzKCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcblxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaW5pdGlhbGl6ZU1hc2soKSB7XHJcbiAgICAgICAgdGhpcy5zY2VuZS5hZGRDaGlsZCh0aGlzLmNvbnRhaW5lck1hc2spO1xyXG4gICAgICAgIHRoaXMuZmllbGRDb250YWluZXIubWFzayA9IHRoaXMuY29udGFpbmVyTWFzaztcclxuICAgICAgICB0aGlzLmNvbnRhaW5lck1hc2subGluZVN0eWxlKDApO1xyXG4gICAgICAgIHRoaXMuY29udGFpbmVyTWFzay54ID0gdGhpcy5maWVsZENvbnRhaW5lci54O1xyXG4gICAgICAgIHRoaXMuY29udGFpbmVyTWFzay55ID0gdGhpcy5maWVsZENvbnRhaW5lci55O1xyXG5cclxuXHJcblxyXG4gICAgICAgIHRoaXMuY29udGFpbmVyTWFzay5iZWdpbkZpbGwoMHg4YmM1ZmYpO1xyXG4gICAgICAgIGxldCBtYXNrX3ggPSB0aGlzLnNob3dfY3JlZGl0c19zcHJpdGUueCAtICh0aGlzLnNob3dfY3JlZGl0c19zcHJpdGUud2lkdGgvMiksXHJcbiAgICAgICAgICAgIG1hc2tfeSA9IHRoaXMuc2hvd19jcmVkaXRzX3Nwcml0ZS55ICsgKHRoaXMuc2hvd19jcmVkaXRzX3Nwcml0ZS5oZWlnaHQvMik7XHJcbiAgICAgICAgdGhpcy5jb250YWluZXJNYXNrLmRyYXdSZWN0KG1hc2tfeCwgbWFza195LCB0aGlzLmZpZWxkQ29udGFpbmVyLndpZHRoLCB0aGlzLnNob3dfY3JlZGl0c19zcHJpdGUuaGVpZ2h0KTtcclxuXHJcbiAgICAgICAgIHRoaXMuY29udGFpbmVyTWFzay5lbmRGaWxsKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGhpZGVDcmVkaXRzKCkge1xyXG5cclxuICAgICAgICBhcHAudGlja2VyLmFkZChoaWRlQ3JlZGl0c0FuaW1hdGlvbiwgdGhpcyk7XHJcblxyXG4gICAgICAgICBmdW5jdGlvbiBoaWRlQ3JlZGl0c0FuaW1hdGlvbih0aW1lZGVsdGE6IG51bWJlcikge1xyXG4gICAgICAgICAgICAgdGhpcy5zaG93X2NyZWRpdHNfc3ByaXRlLmludGVyYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICB0aGlzLnNwcml0ZS5pbnRlcmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgaWYgKHRoaXMuc2hvd19jcmVkaXRzX3Nwcml0ZS55IDwgdGhpcy5zcHJpdGUueSkge1xyXG4gICAgICAgICAgICAgICAgIHRoaXMuc2hvd19jcmVkaXRzX3Nwcml0ZS55ID0gTWF0aC5taW4oKHRoaXMuc2hvd19jcmVkaXRzX3Nwcml0ZS55KyA1KnRpbWVkZWx0YSksIHRoaXMuc3ByaXRlLnkpXHJcblxyXG4gICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICBhcHAudGlja2VyLnJlbW92ZShoaWRlQ3JlZGl0c0FuaW1hdGlvbiwgdGhpcyk7XHJcbiAgICAgICAgICAgICAgICAgdGhpcy5zaG93X2NyZWRpdHNfc3ByaXRlLmludGVyYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZS5pbnRlcmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzaG93Q3JlZGl0cygpIHtcclxuXHJcbiAgICAgICAgYXBwLnRpY2tlci5hZGQoc2hvd0NyZWRpdHNBbmltYXRpb24sIHRoaXMpO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBzaG93Q3JlZGl0c0FuaW1hdGlvbih0aW1lZGVsdGE6IG51bWJlcikge1xyXG4gICAgICAgICAgICB0aGlzLnNob3dfY3JlZGl0c19zcHJpdGUuaW50ZXJhY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5zcHJpdGUuaW50ZXJhY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc2hvd19jcmVkaXRzX3Nwcml0ZS55K3RoaXMuc2hvd19jcmVkaXRzX3Nwcml0ZS5oZWlnaHQgPiB0aGlzLnNwcml0ZS55KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dfY3JlZGl0c19zcHJpdGUueSAtPSA1KnRpbWVkZWx0YVxyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd19jcmVkaXRzX3Nwcml0ZS55ID0gdGhpcy5zcHJpdGUueSAtIHRoaXMuc2hvd19jcmVkaXRzX3Nwcml0ZS5oZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICBhcHAudGlja2VyLnJlbW92ZShzaG93Q3JlZGl0c0FuaW1hdGlvbiwgdGhpcyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzU2hvd24gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93X2NyZWRpdHNfc3ByaXRlLmludGVyYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlLmludGVyYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJpbXBvcnQge1BvaW50c01hdHJpeCwgV2luTGluZXNBcnJheSwgd2luTGluZXNQb3N9IGZyb20gXCIuLi9NYXRoL0xpbmVzXCI7XHJcbmltcG9ydCB7c3ltYm9sSGVpZ2h0LCBzeW1ib2xXaWR0aCwgV2luQm94SGVpZ2h0LCBXaW5Cb3hXaWR0aH0gZnJvbSBcIi4uL1JlZWxTcGlubmVyL3JlZWxzQ29uZmlnXCI7XHJcbmltcG9ydCB7TnVtZXJpY0ZpZWxkfSBmcm9tIFwiLi9OdW1lcmljRmllbGRcIjtcclxuaW1wb3J0IHtGb250U3R5bGVzfSBmcm9tIFwiLi4vVXRpbHMvZm9udFN0eWxlc1wiO1xyXG5pbXBvcnQge2Zvcm1hdFN0YWtlQW1vdW50fSBmcm9tIFwiLi4vVXRpbHMvaGVscGVyRnVuY3NcIjtcclxuLyoqXHJcbiAqIENyZWF0ZWQgYnkgdGFyYXNnIG9uIDEwLzE3LzIwMTcuXHJcbiAqL1xyXG5cclxuXHJcbiBleHBvcnQgY2xhc3MgU2ltcGxlV2luTGluZSB7XHJcbiAgICBwdWJsaWMgc2NlbmU7XHJcbiAgICBwcml2YXRlIHJlc291cmNlczogYW55O1xyXG4gICAgcHVibGljIGxpbmVOdW1iZXI6IG51bWJlcjtcclxuICAgIHByaXZhdGUgV2luTGluZVRleHR1cmUgOiBQSVhJLlRleHR1cmU7XHJcbiAgICBwdWJsaWMgV2luTGluZVNwcml0ZTogUElYSS5TcHJpdGU7XHJcbiAgICBwcml2YXRlIGN1cnJlbnRXaW5TeW1ib2xzQW1vdW50OiBudW1iZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBsaW5lOiBBcnJheTxudW1iZXI+O1xyXG5cclxuICAgIHByaXZhdGUgd2luQW1vdW50RmllbGQ6IE51bWVyaWNGaWVsZDtcclxuICAgIHByaXZhdGUgd2luQW1vdW50Rl94OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHdpbkFtb3VudEZfeTogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBtYWluU3ltYm9sIDogbnVtYmVyO1xyXG5cclxuXHJcbiAgICBjb25zdHJ1Y3RvcihzY2VuZSwgbGluZU51bWJlcjpudW1iZXIsIHJlc291cmNlcykge1xyXG4gICAgICAgIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuICAgICAgICB0aGlzLnJlc291cmNlcyA9IHJlc291cmNlcztcclxuICAgICAgICB0aGlzLmxpbmVOdW1iZXIgPSBsaW5lTnVtYmVyO1xyXG4gICAgICAgIHRoaXMubGluZSA9IFdpbkxpbmVzQXJyYXlbbGluZU51bWJlcl07XHJcbiAgICAgICAgdGhpcy5jdXJyZW50V2luU3ltYm9sc0Ftb3VudCA9IDA7XHJcbiAgICAgICAgdGhpcy5XaW5MaW5lVGV4dHVyZSA9IHJlc291cmNlc1snQmV0X0xpbmUnXVxyXG5cclxuICAgICAgICB0aGlzLldpbkxpbmVTcHJpdGUgPSBuZXcgUElYSS5TcHJpdGUodGhpcy5XaW5MaW5lVGV4dHVyZSlcclxuICAgICAgICB0aGlzLldpbkxpbmVTcHJpdGUueCA9IHdpbkxpbmVzUG9zW3RoaXMubGluZU51bWJlcl1bMF1cclxuICAgICAgICB0aGlzLldpbkxpbmVTcHJpdGUueSA9IHdpbkxpbmVzUG9zW3RoaXMubGluZU51bWJlcl1bMV1cclxuICAgICAgICB0aGlzLldpbkxpbmVTcHJpdGUudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuc2NlbmUuYWRkQ2hpbGQodGhpcy5XaW5MaW5lU3ByaXRlKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgd2luU2hvdyhzeW1ib2xzOiBudW1iZXJbXSwgaW5kZXhlczogbnVtYmVyW10sIHdpbjogbnVtYmVyLCAgbWFpblN5bWJvbDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5XaW5MaW5lU3ByaXRlLnZpc2libGUgPSB0cnVlO1xyXG5cclxuICAgICAgICBsZXQgYW1vdW50ID0gc3ltYm9scy5sZW5ndGg7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50V2luU3ltYm9sc0Ftb3VudCA9IGFtb3VudDtcclxuXHJcbiAgICAgICAgIC8vIERyYXcgd2lubmluZyBzeW1ib2xzIGFuZCBsaW5lcyBiZXR3ZWVuIHRoZW1cclxuICAgICAgICAgZm9yIChsZXQgaT0wOyBpPGFtb3VudDsgaSsrKXtcclxuICAgICAgICAgICAgLy8gRHJhdyBhbmltYXRpb25cclxuICAgICAgICAgICAgdGhpcy5zY2VuZS5SRUVMUy5yZWVsc0FycmF5W2ldLnBsYXlXaW5TaG93KHN5bWJvbHNbaV0sIGluZGV4ZXNbaV0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RvcFdpblNob3coKSB7XHJcbiAgICAgICAgdGhpcy5XaW5MaW5lU3ByaXRlLnZpc2libGUgPSBmYWxzZVxyXG4gICAgICAgIGZvciAobGV0IGk9MDsgaTx0aGlzLmN1cnJlbnRXaW5TeW1ib2xzQW1vdW50OyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5zY2VuZS5SRUVMUy5yZWVsc0FycmF5W2ldLnN0b3BXaW5TaG93KHRoaXMubGluZVtpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuIH1cclxuXHJcblxyXG5leHBvcnQgY2xhc3MgV2luTGluZSB7XHJcbiAgICBwdWJsaWMgc2NlbmU7XHJcbiAgICBwcml2YXRlIHJlc291cmNlczogYW55O1xyXG4gICAgcHVibGljIGxpbmVOdW1iZXJTcHJpdGU6IFBJWEkuU3ByaXRlO1xyXG4gICAgcHVibGljIGxpbmVOdW1iZXI6IG51bWJlcjtcclxuICAgIHB1YmxpYyBsaW5lUG9pbnRzOiBBcnJheTxQSVhJLlBvaW50PjtcclxuICAgIHByaXZhdGUgTGluZVJvcGU6IFBJWEkubWVzaC5Sb3BlO1xyXG4gICAgcHJpdmF0ZSBXaW5MaW5lVGV4dHVyZSA6IFBJWEkuVGV4dHVyZTtcclxuICAgIHByaXZhdGUgV2luQm94VGV4dHVyZTogUElYSS5UZXh0dXJlO1xyXG4gICAgcHJpdmF0ZSBjdXJyZW50V2luU3ltYm9sc0Ftb3VudDogbnVtYmVyO1xyXG5cclxuICAgIHByaXZhdGUgd2luQm94ZXM6IEFycmF5PFBJWEkuU3ByaXRlPjtcclxuICAgIHByaXZhdGUgV2luUm9wZXM6IEFycmF5PFBJWEkubWVzaC5Sb3BlPjtcclxuICAgIHByaXZhdGUgbGluZTogQXJyYXk8bnVtYmVyPjtcclxuXHJcbiAgICBwcml2YXRlIHdpbkFtb3VudEZpZWxkOiBOdW1lcmljRmllbGQ7XHJcbiAgICBwcml2YXRlIHdpbkFtb3VudEZfeDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSB3aW5BbW91bnRGX3k6IG51bWJlcjtcclxuICAgIHByaXZhdGUgV2luQW1vdW50RmllbGRUZXh0dXJlOiBQSVhJLlRleHR1cmU7XHJcblxyXG4gICAgcHJpdmF0ZSB3aW5MaW5lU291bmRzOiBhbnlbXTtcclxuICAgIHByaXZhdGUgbWFpblN5bWJvbCA6IG51bWJlcjtcclxuXHJcblxyXG4gICAgY29uc3RydWN0b3Ioc2NlbmUsIExpbmVOdW1iZXI6IG51bWJlciwgV2luTGluZVRleHR1cmU6IFBJWEkuVGV4dHVyZSwgV2luQm94VGV4dHVyZTpQSVhJLlRleHR1cmUsIFdpbkFtb3VudEZpZWxkVGV4dHVyZTogUElYSS5UZXh0dXJlLCByZXNvdXJjZXM6IGFueSkge1xyXG4gICAgICAgIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuICAgICAgICB0aGlzLnJlc291cmNlcyA9IHJlc291cmNlcztcclxuICAgICAgICB0aGlzLmxpbmVOdW1iZXIgPSBMaW5lTnVtYmVyO1xyXG4gICAgICAgIHRoaXMubGluZVBvaW50cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFdpblN5bWJvbHNBbW91bnQgPSAwO1xyXG4gICAgICAgIHRoaXMubGluZU51bWJlclNwcml0ZSA9IG5ldyBQSVhJLlNwcml0ZSgpO1xyXG4gICAgICAgIHRoaXMuV2luTGluZVRleHR1cmUgPSBXaW5MaW5lVGV4dHVyZTtcclxuICAgICAgICB0aGlzLldpbkJveFRleHR1cmUgPSBXaW5Cb3hUZXh0dXJlO1xyXG4gICAgICAgIHRoaXMuV2luQW1vdW50RmllbGRUZXh0dXJlID0gV2luQW1vdW50RmllbGRUZXh0dXJlO1xyXG5cclxuICAgICAgICB0aGlzLndpbkFtb3VudEZfeSA9IFBvaW50c01hdHJpeFsxXVsxXS55ICsgdGhpcy5XaW5Cb3hUZXh0dXJlLmhlaWdodC8yO1xyXG4gICAgICAgIHRoaXMud2luQW1vdW50Rl94ID0gUG9pbnRzTWF0cml4WzFdWzFdLnggLSBXaW5BbW91bnRGaWVsZFRleHR1cmUud2lkdGgvMjtcclxuICAgICAgICB0aGlzLndpbkFtb3VudEZpZWxkID0gbmV3IE51bWVyaWNGaWVsZChzY2VuZSwgJ1dpbkxpbmVBbW91bnRGaWVsZCcsIHRoaXMud2luQW1vdW50Rl94LCB0aGlzLndpbkFtb3VudEZfeSwgcmVzb3VyY2VzLCBGb250U3R5bGVzLnN0YWtlRm9udCk7XHJcbiAgICAgICAgdGhpcy53aW5BbW91bnRGaWVsZC5oaWRlKCk7XHJcblxyXG4gICAgICAgIC8vIHRoaXMud2luTGluZVNvdW5kcyA9IFtcclxuICAgICAgICAvLyAgICAgbmV3IEF1ZGlvKHRoaXMucmVzb3VyY2VzLmJmX3N5bWJvbC51cmwpLFxyXG4gICAgICAgIC8vICAgICBuZXcgQXVkaW8odGhpcy5yZXNvdXJjZXMuYmZfc3ltYm9sLnVybCksXHJcbiAgICAgICAgLy8gICAgIG5ldyBBdWRpbyh0aGlzLnJlc291cmNlc1snN19zeW1ib2wnXS51cmwpLFxyXG4gICAgICAgIC8vICAgICBuZXcgQXVkaW8odGhpcy5yZXNvdXJjZXMud21fc3ltYm9sLnVybCksXHJcbiAgICAgICAgLy8gICAgIG5ldyBBdWRpbyh0aGlzLnJlc291cmNlcy5wbHVtX3N5bWJvbC51cmwpLFxyXG4gICAgICAgIC8vICAgICBuZXcgQXVkaW8odGhpcy5yZXNvdXJjZXMub3JhbmdlX3N5bWJvbC51cmwpLFxyXG4gICAgICAgIC8vICAgICBuZXcgQXVkaW8odGhpcy5yZXNvdXJjZXMubGVtb25fc3ltYm9sLnVybCksXHJcbiAgICAgICAgLy8gICAgIG5ldyBBdWRpbyh0aGlzLnJlc291cmNlcy5jaGVycnlfc3ltYm9sLnVybClcclxuICAgICAgICAvLyBdO1xyXG5cclxuXHJcbiAgICAgICAgdGhpcy53aW5Cb3hlcyA9IFtcclxuICAgICAgICAgICAgbmV3IFBJWEkuU3ByaXRlKFdpbkJveFRleHR1cmUpLFxyXG4gICAgICAgICAgICBuZXcgUElYSS5TcHJpdGUoV2luQm94VGV4dHVyZSksXHJcbiAgICAgICAgICAgIG5ldyBQSVhJLlNwcml0ZShXaW5Cb3hUZXh0dXJlKSxcclxuICAgICAgICAgICAgbmV3IFBJWEkuU3ByaXRlKFdpbkJveFRleHR1cmUpLFxyXG4gICAgICAgICAgICBuZXcgUElYSS5TcHJpdGUoV2luQm94VGV4dHVyZSlcclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICB0aGlzLldpblJvcGVzID0gW1xyXG4gICAgICAgICAgICBuZXcgUElYSS5tZXNoLlJvcGUoV2luTGluZVRleHR1cmUsIFtdKSxcclxuICAgICAgICAgICAgbmV3IFBJWEkubWVzaC5Sb3BlKFdpbkxpbmVUZXh0dXJlLCBbXSksXHJcbiAgICAgICAgICAgIG5ldyBQSVhJLm1lc2guUm9wZShXaW5MaW5lVGV4dHVyZSwgW10pLFxyXG4gICAgICAgICAgICBuZXcgUElYSS5tZXNoLlJvcGUoV2luTGluZVRleHR1cmUsIFtdKSxcclxuICAgICAgICAgICAgbmV3IFBJWEkubWVzaC5Sb3BlKFdpbkxpbmVUZXh0dXJlLCBbXSlcclxuICAgICAgICBdO1xyXG5cclxuXHJcbiAgICAgICAgdGhpcy5saW5lID0gV2luTGluZXNBcnJheVtMaW5lTnVtYmVyXTtcclxuXHJcbiAgICAgICAgLy8gdGhpcy5pbml0aWFsaXplTGluZU51bWJlcihMaW5lTnVtYmVyKTtcclxuICAgICAgICB0aGlzLmluaXRpYWxpemVMaW5lKCk7XHJcbiAgICAgICAgdGhpcy5pbml0aWFsaXplTGluZVJvcGUoKTtcclxuXHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vIHByaXZhdGUgaW5pdGlhbGl6ZUxpbmVOdW1iZXIoTGluZU51bWJlcjogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAvLyAgICAgdGhpcy5saW5lTnVtYmVyU3ByaXRlLnRleHR1cmUgPSBMaW5lTnVtYmVyc1tMaW5lTnVtYmVyXS5JZGxlVGV4dHVyZTtcclxuICAgIC8vICAgICB0aGlzLnNjZW5lLmFkZENoaWxkKHRoaXMubGluZU51bWJlclNwcml0ZSk7XHJcbiAgICAvLyAgICAgdGhpcy5saW5lTnVtYmVyU3ByaXRlLnggPSBMaW5lTnVtYmVyc1tMaW5lTnVtYmVyXS54O1xyXG4gICAgLy8gICAgIHRoaXMubGluZU51bWJlclNwcml0ZS55ID0gTGluZU51bWJlcnNbTGluZU51bWJlcl0ueTtcclxuICAgIC8vIH1cclxuXHJcbiAgICBwcml2YXRlIGluaXRpYWxpemVMaW5lKCk6IHZvaWQge1xyXG4gICAgICAgIGZvciAobGV0IGk9MDsgaTx0aGlzLmxpbmUubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5saW5lUG9pbnRzLnB1c2goUG9pbnRzTWF0cml4W2ldW3RoaXMubGluZVtpXV0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpbml0aWFsaXplTGluZVJvcGUoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5MaW5lUm9wZSA9IG5ldyBQSVhJLm1lc2guUm9wZSh0aGlzLldpbkxpbmVUZXh0dXJlLCB0aGlzLmxpbmVQb2ludHMpO1xyXG4gICAgICAgIHRoaXMuc2NlbmUuYWRkQ2hpbGQodGhpcy5MaW5lUm9wZSk7XHJcbiAgICAgICAgdGhpcy5MaW5lUm9wZS52aXNpYmxlID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNob3dXaW5MaW5lKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuTGluZVJvcGUudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgLy8gdGhpcy5saW5lTnVtYmVyU3ByaXRlLnRleHR1cmUgPSBMaW5lTnVtYmVyc1t0aGlzLmxpbmVOdW1iZXJdLlNlbGVjdGVkVGV4dHVyZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaGlkZVdpbkxpbmUoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5MaW5lUm9wZS52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgLy8gdGhpcy5saW5lTnVtYmVyU3ByaXRlLnRleHR1cmUgPSBMaW5lTnVtYmVyc1t0aGlzLmxpbmVOdW1iZXJdLklkbGVUZXh0dXJlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBkaXNhYmxlV2luTGluZSgpOiB2b2lkIHtcclxuICAgICAgICAvLyB0aGlzLmxpbmVOdW1iZXJTcHJpdGUudGV4dHVyZSA9IExpbmVOdW1iZXJzW3RoaXMubGluZU51bWJlcl0uRGlzYWJsZWRUZXh0dXJlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB3aW5TaG93KHN5bWJvbHM6IG51bWJlcltdLCBpbmRleGVzOiBudW1iZXJbXSwgd2luOiBudW1iZXIsICBtYWluU3ltYm9sOiBudW1iZXIpOiB2b2lkIHtcclxuXHJcbiAgICAgICAgdGhpcy5zY2VuZS53aW5MaW5lc0FycmF5W3RoaXMubGluZU51bWJlcl0uc2V0VGV4dHVyZVRvZ2dsZWQoKTtcclxuXHJcbiAgICAgICAgbGV0IGFtb3VudCA9IHN5bWJvbHMubGVuZ3RoO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFdpblN5bWJvbHNBbW91bnQgPSBhbW91bnQ7XHJcblxyXG4gICAgICAgIHRoaXMubWFpblN5bWJvbCA9IG1haW5TeW1ib2w7XHJcbiAgICAgICAgdGhpcy53aW5MaW5lU291bmRzW21haW5TeW1ib2xdLnBsYXkoKTtcclxuICAgICAgICAvLyBEcmF3IHRoZSBlbmQgb2YgdGhlIGxpbmVcclxuICAgICAgICBpZiAoYW1vdW50IDwgdGhpcy5zY2VuZS5SRUVMUy5yZWVsc0FycmF5Lmxlbmd0aCl7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhd1dpbkxpbmVFbmQoYW1vdW50KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIERyYXcgd2lubmluZyBzeW1ib2xzIGFuZCBsaW5lcyBiZXR3ZWVuIHRoZW1cclxuICAgICAgICBmb3IgKGxldCBpPTA7IGk8YW1vdW50OyBpKyspe1xyXG4gICAgICAgICAgICBpZiAoIGkgPCBhbW91bnQtMSl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdSb3BlKGkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIERyYXcgYW5pbWF0aW9uXHJcbiAgICAgICAgICAgIHRoaXMuc2NlbmUuUkVFTFMucmVlbHNBcnJheVtpXS5wbGF5V2luU2hvdyhzeW1ib2xzW2ldLCBpbmRleGVzW2ldKTtcclxuXHJcblxyXG5cclxuICAgICAgICAgICAgLy8gRHJhdyBXaW5Cb3hlcyBhcm91bmQgc3ltYm9sc1xyXG4gICAgICAgICAgICB0aGlzLndpbkJveGVzW2ldLmFuY2hvci5zZXQoMC41LCAwLjUpO1xyXG4gICAgICAgICAgICB0aGlzLndpbkJveGVzW2ldLnggPSBQb2ludHNNYXRyaXhbaV1baW5kZXhlc1tpXV0ueDtcclxuICAgICAgICAgICAgdGhpcy53aW5Cb3hlc1tpXS55ID0gUG9pbnRzTWF0cml4W2ldW2luZGV4ZXNbaV1dLnk7XHJcbiAgICAgICAgICAgIHRoaXMud2luQm94ZXNbaV0udmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuc2NlbmUuYWRkQ2hpbGQodGhpcy53aW5Cb3hlc1tpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIERyYXcgV2luTGluZSBBbW91bnQgRmllbGRcclxuICAgICAgICBpZiAoYW1vdW50PT0yKSB7XHJcbiAgICAgICAgICAgIHRoaXMud2luQW1vdW50RmllbGQuZmllbGRDb250YWluZXIueCA9IFBvaW50c01hdHJpeFsxXVsxXS54IC0gdGhpcy5XaW5BbW91bnRGaWVsZFRleHR1cmUud2lkdGgvMjtcclxuICAgICAgICAgICAgdGhpcy53aW5BbW91bnRGaWVsZC5maWVsZENvbnRhaW5lci55ID0gUG9pbnRzTWF0cml4WzFdW2Ftb3VudC0xXS55ICsgdGhpcy5XaW5Cb3hUZXh0dXJlLmhlaWdodC8yO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMud2luQW1vdW50RmllbGQuZmllbGRDb250YWluZXIueCA9IFBvaW50c01hdHJpeFsyXVsxXS54IC0gdGhpcy5XaW5BbW91bnRGaWVsZFRleHR1cmUud2lkdGgvMjtcclxuICAgICAgICAgICAgdGhpcy53aW5BbW91bnRGaWVsZC5maWVsZENvbnRhaW5lci55ID0gUG9pbnRzTWF0cml4WzJdW2luZGV4ZXNbMl1dLnkgKyB0aGlzLldpbkJveFRleHR1cmUuaGVpZ2h0LzI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMud2luQW1vdW50RmllbGQudGV4dC50ZXh0ID0gZm9ybWF0U3Rha2VBbW91bnQod2luKTtcclxuXHJcbiAgICAgICAgdGhpcy53aW5BbW91bnRGaWVsZC5zaG93KCk7XHJcblxyXG5cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RvcFdpblNob3coKTogdm9pZCB7XHJcblxyXG4gICAgICAgIHRoaXMud2luTGluZVNvdW5kc1t0aGlzLm1haW5TeW1ib2xdLnBhdXNlKCk7XHJcbiAgICAgICAgdGhpcy53aW5MaW5lU291bmRzW3RoaXMubWFpblN5bWJvbF0uY3VycmVudFRpbWUgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLnNjZW5lLndpbkxpbmVzQXJyYXlbdGhpcy5saW5lTnVtYmVyXS5zZXRUZXh0dXJlRGlzYWJsZWQoKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaT0wOyBpPHRoaXMuY3VycmVudFdpblN5bWJvbHNBbW91bnQ7IGkrKylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuV2luUm9wZXNbaV0uZGVzdHJveSgpO1xyXG4gICAgICAgICAgICB0aGlzLnNjZW5lLlJFRUxTLnJlZWxzQXJyYXlbaV0uc3RvcFdpblNob3codGhpcy5saW5lW2ldKTtcclxuICAgICAgICAgICAgdGhpcy53aW5Cb3hlc1tpXS52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLndpbkFtb3VudEZpZWxkLmhpZGUoKTtcclxuICAgIH1cclxuXHJcblxyXG5cclxuICAgIHByaXZhdGUgZHJhd1dpbkxpbmVFbmQoYW1vdW50OiBudW1iZXIpOiB2b2lkIHtcclxuXHJcbiAgICAgICAgbGV0IHBvaW50cyA9IHRoaXMubGluZVBvaW50cy5zbGljZShhbW91bnQtMSk7XHJcbiAgICAgICAgLy8gc2V0IGZpcnN0IHBvaW50IHRvIHRoZSBlbmQgb2YgdGhlIGxhc3QgV2luQm94XHJcbiAgICAgICAgcG9pbnRzWzBdID0gdGhpcy5nZXRTdGFydEVuZFBvaW50cyh0aGlzLmxpbmVQb2ludHNbYW1vdW50LTFdLCB0aGlzLmxpbmVQb2ludHNbYW1vdW50XSlbMF07XHJcbiAgICAgICAgdGhpcy5XaW5Sb3Blc1thbW91bnQtMV0gPSBuZXcgUElYSS5tZXNoLlJvcGUodGhpcy5XaW5MaW5lVGV4dHVyZSwgcG9pbnRzKTtcclxuICAgICAgICB0aGlzLnNjZW5lLmFkZENoaWxkKHRoaXMuV2luUm9wZXNbYW1vdW50LTFdKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGRyYXdSb3BlKGluZGV4OiBudW1iZXIpOiB2b2lkIHtcclxuXHJcbiAgICAgICAgbGV0IHBvaW50cyA9IHRoaXMuZ2V0U3RhcnRFbmRQb2ludHModGhpcy5saW5lUG9pbnRzW2luZGV4XSwgdGhpcy5saW5lUG9pbnRzW2luZGV4KzFdKTtcclxuICAgICAgICB0aGlzLldpblJvcGVzW2luZGV4XSA9IG5ldyBQSVhJLm1lc2guUm9wZSh0aGlzLldpbkxpbmVUZXh0dXJlLCBwb2ludHMpO1xyXG4gICAgICAgIHRoaXMuc2NlbmUuYWRkQ2hpbGQodGhpcy5XaW5Sb3Blc1tpbmRleF0pO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBwcml2YXRlIGdldFN0YXJ0RW5kUG9pbnRzKHBvaW50MTogUElYSS5Qb2ludCwgcG9pbnQyOiBQSVhJLlBvaW50KTogUElYSS5Qb2ludFtde1xyXG4gICAgICAgIGxldCBBLEIsQyxrLGIsIHJlc3VsdD1bXTtcclxuXHJcbiAgICAgICAgQSA9IHBvaW50Mi55IC0gcG9pbnQxLnk7XHJcbiAgICAgICAgQiA9IHBvaW50MS54IC0gcG9pbnQyLng7XHJcbiAgICAgICAgQyA9IHBvaW50MS55ICogcG9pbnQyLnggLSBwb2ludDEueCAqIHBvaW50Mi55O1xyXG5cclxuICAgICAgICBrID0gKEEvQikgPT0gMCA/IDAgOiAtKEEvQik7XHJcbiAgICAgICAgYiA9IChDL0IpID09IDAgPyAwIDogLShDL0IpO1xyXG5cclxuICAgICAgICAvLyBnZXQgY29vcmRpbmF0ZXMgb2YgcGxhY2VzIHdoZXJlIHdpbkxpbmUgY2FuIHBvc3NpYmx5IGludGVyc2VjdCB3aXRoIFdpbkJveCB3aGVyZSBpdCBzdGFydHNcclxuICAgICAgICBsZXQgcG9zc2libGVTdGFydHMgPSBbXHJcbiAgICAgICAgICAgIG5ldyBQSVhJLlBvaW50KE1hdGguZmxvb3IocG9pbnQxLnggKyBzeW1ib2xXaWR0aC8yKSwgTWF0aC5mbG9vcihrKihwb2ludDEueCtzeW1ib2xXaWR0aC8yKSArIGIpKSxcclxuICAgICAgICAgICAgbmV3IFBJWEkuUG9pbnQoTWF0aC5mbG9vcigoKHBvaW50MS55ICsgc3ltYm9sSGVpZ2h0LzIpIC0gYikvayksIE1hdGguZmxvb3IocG9pbnQxLnkgKyBzeW1ib2xIZWlnaHQvMikpLFxyXG4gICAgICAgICAgICBuZXcgUElYSS5Qb2ludChNYXRoLmZsb29yKCgocG9pbnQxLnkgLSBzeW1ib2xIZWlnaHQvMikgLSBiKS9rKSwgTWF0aC5mbG9vcihwb2ludDEueSAtIHN5bWJvbEhlaWdodC8yKSlcclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICAvLyBjaG9vc2UgdGhlIG9uZSB0aGF0IGxpZXMgb24gdGhlIGVnZGUgb2YgdGhlIFdpbmJveFxyXG4gICAgICAgIGZvciAobGV0IGk9MDtpPDM7aSsrKXtcclxuICAgICAgICAgICAgbGV0IHBvaW50ID0gcG9zc2libGVTdGFydHNbaV07XHJcbiAgICAgICAgICAgIGlmIChwb2ludC54IDw9IE1hdGguZmxvb3IocG9pbnQxLnggKyBzeW1ib2xXaWR0aC8yKSAmJiBwb2ludC54ID49IHBvaW50MS54ICYmIHBvaW50LnkgPD0gTWF0aC5mbG9vcihwb2ludDEueSArIHN5bWJvbEhlaWdodC8yKSAmJiBwb2ludC55ID49IE1hdGguZmxvb3IocG9pbnQxLnkgLSBzeW1ib2xIZWlnaHQvMikpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHBvaW50LnkgKz0gTWF0aC5mbG9vcigoV2luQm94SGVpZ2h0IC0gc3ltYm9sSGVpZ2h0KS8yKTtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHBvaW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGdldCBjb29yZGluYXRlcyBvZiBwbGFjZXMgd2hlcmUgd2luTGluZSBjYW4gcG9zc2libHkgaW50ZXJzZWN0IHdpdGggV2luQm94IHdoZXJlIGl0IGVuZHNcclxuICAgICAgICBsZXQgcG9zc2libGVFbmRzID0gW1xyXG4gICAgICAgICAgICBuZXcgUElYSS5Qb2ludChNYXRoLmZsb29yKHBvaW50Mi54IC0gc3ltYm9sV2lkdGgvMiksIE1hdGguZmxvb3IoayoocG9pbnQyLnggLSBzeW1ib2xXaWR0aC8yKSArIGIpKSxcclxuICAgICAgICAgICAgbmV3IFBJWEkuUG9pbnQoTWF0aC5mbG9vcigoKHBvaW50Mi55ICsgc3ltYm9sSGVpZ2h0LzIpLWIpL2spLCBNYXRoLmZsb29yKHBvaW50Mi55ICsgc3ltYm9sSGVpZ2h0LzIpKSxcclxuICAgICAgICAgICAgbmV3IFBJWEkuUG9pbnQoTWF0aC5mbG9vcigoKHBvaW50Mi55IC0gc3ltYm9sSGVpZ2h0LzIpLWIpL2spLCBNYXRoLmZsb29yKHBvaW50Mi55IC0gc3ltYm9sSGVpZ2h0LzIpKVxyXG4gICAgICAgIF07XHJcbiAgICAgICAgLy8gY2hvb3NlIHRoZSBvbmUgdGhhdCBsaWVzIG9uIHRoZSBlZ2RlIG9mIHRoZSBXaW5ib3hcclxuICAgICAgICBmb3IgKGxldCBpPTA7aTwzO2krKyl7XHJcbiAgICAgICAgICAgIGxldCBwb2ludCA9IHBvc3NpYmxlRW5kc1tpXTtcclxuICAgICAgICAgICAgaWYgKHBvaW50LnggPj0gTWF0aC5mbG9vcihwb2ludDIueCAtIHN5bWJvbFdpZHRoLzIpICYmIHBvaW50LnggPD0gcG9pbnQyLnggJiYgcG9pbnQueSA8PSBNYXRoLmZsb29yKHBvaW50Mi55ICsgc3ltYm9sSGVpZ2h0LzIpICYmIHBvaW50LnkgPj0gTWF0aC5mbG9vcihwb2ludDIueSAtIHN5bWJvbEhlaWdodC8yKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcG9pbnQueCArPSBNYXRoLmZsb29yKChXaW5Cb3hXaWR0aCAtIHN5bWJvbFdpZHRoKS8yKTtcclxuICAgICAgICAgICAgICAgIHBvaW50LnkgKz0gTWF0aC5mbG9vcigoV2luQm94SGVpZ2h0IC0gc3ltYm9sSGVpZ2h0KS8yKTtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHBvaW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuXHJcblxyXG5cclxuXHJcbn0iLCJleHBvcnQgbGV0IGJ1dHRvblJlc291cmNlcyA9IHtcbiAgICAnU3RhcnRCdXR0b24nIDoge1xuICAgICAgICAnZW5hYmxlZCc6ICdCVE5fU3BpbicsXG4gICAgICAgICdkaXNhYmxlZCc6ICdCVE5fU3Bpbl9kJyxcbiAgICAgICAgJ3ByZXNzZWQnOiAnQlROX1NwaW5fZCdcbiAgICB9LFxuICAgICdTdG9wQnV0dG9uJyA6IHtcbiAgICAgICAgJ2VuYWJsZWQnOiAnQlROX1NwaW4nLFxuICAgICAgICAnZGlzYWJsZWQnOiAnQlROX1NwaW5fZCcsXG4gICAgICAgICdwcmVzc2VkJzogJ0JUTl9TcGluX2QnXG4gICAgfSxcbiAgICAnQmFsYW5jZUZpZWxkJzoge1xuICAgICAgICAnYmFja2dyb3VuZCc6ICdiYWxhbmNlJyxcbiAgICAgICAgJ3Nob3dfY3JlZGl0cyc6ICdzaG93X2NyZWRpdCcsXG4gICAgICAgICdoaWRlX2NyZWRpdHMnOiAnaGlkZV9jcmVkaXRzJ1xuICAgIH0sXG4gICAgJ1RvdGFsV2luJzoge1xuICAgICAgICAnYmFja2dyb3VuZCc6ICd0dydcbiAgICB9XG59IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgdGFyYXNnIG9uIDQvMjUvMjAxNy5cclxuICovXHJcblxyXG5leHBvcnQgY29uc3RcclxuICAgIExJTkUxICA9IFsxLDEsMV0sXHJcbiAgICBMSU5FMiAgPSBbMCwwLDBdLFxyXG4gICAgTElORTMgID0gWzIsMiwyXVxyXG4gICAgLy8gTElORTQgID0gWzAsMSwyLDEsMF0sXHJcbiAgICAvLyBMSU5FNSAgPSBbMiwxLDAsMSwyXSxcclxuICAgIC8vIExJTkU2ICA9IFsxLDAsMCwwLDFdLFxyXG4gICAgLy8gTElORTcgID0gWzEsMiwyLDIsMV0sXHJcbiAgICAvLyBMSU5FOCAgPSBbMCwwLDEsMiwyXSxcclxuICAgIC8vIExJTkU5ICA9IFsyLDIsMSwwLDBdLFxyXG4gICAgLy8gTElORTEwID0gWzEsMiwxLDAsMV0sXHJcbiAgICAvLyBMSU5FMTEgPSBbMSwwLDEsMiwxXSxcclxuICAgIC8vIExJTkUxMiA9IFswLDEsMSwxLDBdLFxyXG4gICAgLy8gTElORTEzID0gWzIsMSwxLDEsMl0sXHJcbiAgICAvLyBMSU5FMTQgPSBbMCwxLDAsMSwwXSxcclxuICAgIC8vIExJTkUxNSA9IFsyLDEsMiwxLDJdLFxyXG4gICAgLy8gTElORTE2ID0gWzEsMSwwLDEsMV0sXHJcbiAgICAvLyBMSU5FMTcgPSBbMSwxLDIsMSwxXSxcclxuICAgIC8vIExJTkUxOCA9IFswLDAsMiwwLDBdLFxyXG4gICAgLy8gTElORTE5ID0gWzIsMiwwLDIsMl0sXHJcbiAgICAvLyBMSU5FMjAgPSBbMCwyLDIsMiwwXTtcclxuXHJcbmV4cG9ydCBjb25zdFxyXG4gICAgV2luTGluZXNBcnJheSA9IFtMSU5FMSxMSU5FMixMSU5FM107XHJcblxyXG5cclxuZXhwb3J0IGNvbnN0IFBvaW50c01hdHJpeCA9IFtcclxuICAgIFtuZXcgUElYSS5Qb2ludCgxMDAsIDI1MCksICBuZXcgUElYSS5Qb2ludCgxMDAsIDQ4MCksICBuZXcgUElYSS5Qb2ludCgxMDAsIDcyNSldLFxyXG4gICAgW25ldyBQSVhJLlBvaW50KDM1MCwgMjUwKSwgIG5ldyBQSVhJLlBvaW50KDM1MCwgNDgwKSwgIG5ldyBQSVhJLlBvaW50KDM1MCwgNzI1KV0sXHJcbiAgICBbbmV3IFBJWEkuUG9pbnQoNjAwLCAyNTApLCAgbmV3IFBJWEkuUG9pbnQoNjAwLCA0ODApLCAgbmV3IFBJWEkuUG9pbnQoNjAwLCA3MjUpXVxyXG5dO1xyXG5cclxuZXhwb3J0IGNvbnN0IHdpbkxpbmVzUG9zID0gW1xyXG4gICAgWzUwLCAyODBdLFxyXG4gICAgWzUwLDEzMF0sXHJcbiAgICBbNTAsIDQzMF1cclxuXSIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IHRhcmFzZyBvbiAxMC8xMS8yMDE3LlxyXG4gKi9cclxuXHJcbi8vIGltcG9ydCAqIGFzIEFuaW1hdGlvbnMgZnJvbSBcIi4uL1V0aWxzL2FuaW1hdGlvbl9vYmplY3RzXCI7XHJcbmltcG9ydCAqIGFzIHV0aWxzIGZyb20gXCIuLi9VdGlscy9oZWxwZXJGdW5jc1wiXHJcbmltcG9ydCAqIGFzIGNvbmZpZyBmcm9tIFwiLi9yZWVsc0NvbmZpZ1wiXHJcblxyXG5cclxuLy8gZXhwb3J0IGxldCBTeW1ib2xzVGV4dHVyZTogICAgUElYSS5CYXNlVGV4dHVyZSA9IFBJWEkuQmFzZVRleHR1cmUuZnJvbUltYWdlKCcuLi9NZWRpYS9zeW1ib2xzLnBuZycpLFxyXG4vLyAgICAgQmxhemluZ1RleHR1cmU6ICAgIFBJWEkuVGV4dHVyZSAgICAgPSBuZXcgUElYSS5UZXh0dXJlKFN5bWJvbHNUZXh0dXJlLCBuZXcgUElYSS5SZWN0YW5nbGUoMCwwLCBjb25maWcuc3ltYm9sV2lkdGgsIGNvbmZpZy5zeW1ib2xIZWlnaHQpKSxcclxuLy8gICAgIFNldmVuVGV4dHVyZTogICAgICBQSVhJLlRleHR1cmUgICAgID0gbmV3IFBJWEkuVGV4dHVyZShTeW1ib2xzVGV4dHVyZSwgbmV3IFBJWEkuUmVjdGFuZ2xlKDAsMjM3LCBjb25maWcuc3ltYm9sV2lkdGgsIGNvbmZpZy5zeW1ib2xIZWlnaHQpKSxcclxuLy8gICAgIFdhdGVybWVsb25UZXh0dXJlOiBQSVhJLlRleHR1cmUgICAgID0gbmV3IFBJWEkuVGV4dHVyZShTeW1ib2xzVGV4dHVyZSwgbmV3IFBJWEkuUmVjdGFuZ2xlKDAsNDc0LCBjb25maWcuc3ltYm9sV2lkdGgsIGNvbmZpZy5zeW1ib2xIZWlnaHQpKSxcclxuLy8gICAgIFBsdW1UZXh0dXJlOiAgICAgICBQSVhJLlRleHR1cmUgICAgID0gbmV3IFBJWEkuVGV4dHVyZShTeW1ib2xzVGV4dHVyZSwgbmV3IFBJWEkuUmVjdGFuZ2xlKDAsNzExLCBjb25maWcuc3ltYm9sV2lkdGgsIGNvbmZpZy5zeW1ib2xIZWlnaHQpKSxcclxuLy8gICAgIE9yYW5nZVRleHR1cmU6ICAgICBQSVhJLlRleHR1cmUgICAgID0gbmV3IFBJWEkuVGV4dHVyZShTeW1ib2xzVGV4dHVyZSwgbmV3IFBJWEkuUmVjdGFuZ2xlKDAsOTQ4LCBjb25maWcuc3ltYm9sV2lkdGgsIGNvbmZpZy5zeW1ib2xIZWlnaHQpKSxcclxuLy8gICAgIExlbW9uVGV4dHVyZTogICAgICBQSVhJLlRleHR1cmUgICAgID0gbmV3IFBJWEkuVGV4dHVyZShTeW1ib2xzVGV4dHVyZSwgbmV3IFBJWEkuUmVjdGFuZ2xlKDAsMTE4NSwgY29uZmlnLnN5bWJvbFdpZHRoLCBjb25maWcuc3ltYm9sSGVpZ2h0KSksXHJcbi8vICAgICBDaGVycnlUZXh0dXJlOiAgICAgUElYSS5UZXh0dXJlICAgICA9IG5ldyBQSVhJLlRleHR1cmUoU3ltYm9sc1RleHR1cmUsIG5ldyBQSVhJLlJlY3RhbmdsZSgwLDE0MjIsIGNvbmZpZy5zeW1ib2xXaWR0aCwgY29uZmlnLnN5bWJvbEhlaWdodCkpLFxyXG4vLyAgICAgQm9udXNUZXh0dXJlOiAgICAgIFBJWEkuVGV4dHVyZSAgICAgPSBuZXcgUElYSS5UZXh0dXJlKFN5bWJvbHNUZXh0dXJlLCBuZXcgUElYSS5SZWN0YW5nbGUoMCwxNjU5LCBjb25maWcuc3ltYm9sV2lkdGgsIGNvbmZpZy5zeW1ib2xIZWlnaHQpKSxcclxuLy8gICAgIFdpbGRUZXh0dXJlOiAgICAgICBQSVhJLlRleHR1cmUgICAgID0gbmV3IFBJWEkuVGV4dHVyZShTeW1ib2xzVGV4dHVyZSwgbmV3IFBJWEkuUmVjdGFuZ2xlKDAsMTg5NiwgY29uZmlnLnN5bWJvbFdpZHRoLCBjb25maWcuc3ltYm9sSGVpZ2h0KSksXHJcbi8vICAgICBCbGF6aW5nU3BpdGUgICAgICAgPSAoKSA9PiBuZXcgUElYSS5TcHJpdGUoQmxhemluZ1RleHR1cmUpLFxyXG4vLyAgICAgU2V2ZW5TcGl0ZSAgICAgICAgID0gKCkgPT4gbmV3IFBJWEkuU3ByaXRlKFNldmVuVGV4dHVyZSksXHJcbi8vICAgICBXYXRlcm1lbG9uU3ByaXRlICAgPSAoKSA9PiBuZXcgUElYSS5TcHJpdGUoV2F0ZXJtZWxvblRleHR1cmUpLFxyXG4vLyAgICAgUGx1bVNwcml0ZSAgICAgICAgID0gKCkgPT4gbmV3IFBJWEkuU3ByaXRlKFBsdW1UZXh0dXJlKSxcclxuLy8gICAgIE9yYW5nZVNwcml0ZSAgICAgICA9ICgpID0+IG5ldyBQSVhJLlNwcml0ZShPcmFuZ2VUZXh0dXJlKSxcclxuLy8gICAgIExlbW9uU3ByaXRlICAgICAgICA9ICgpID0+IG5ldyBQSVhJLlNwcml0ZShMZW1vblRleHR1cmUpLFxyXG4vLyAgICAgQ2hlcnJ5U3ByaXRlICAgICAgID0gKCkgPT4gbmV3IFBJWEkuU3ByaXRlKENoZXJyeVRleHR1cmUpLFxyXG4vLyAgICAgQm9udXNTcHJpdGUgICAgICAgID0gKCkgPT4gbmV3IFBJWEkuU3ByaXRlKEJvbnVzVGV4dHVyZSksXHJcbi8vICAgICBXaWxkU3ByaXRlICAgICAgICAgPSAoKSA9PiBuZXcgUElYSS5TcHJpdGUoV2lsZFRleHR1cmUpLFxyXG4vLyAgICAgQmxhemluZ1dpblNob3cgICAgID0gKCkgPT4gdXRpbHMuQ3JlYXRlQW5pbWF0aW9uKFBJWEkuQmFzZVRleHR1cmUuZnJvbUltYWdlKCcuLi9NZWRpYS9hbmltYXRpb25zL3dpbnNob3cvYmYvd2luc2hvd0JGLnBuZycpLCBBbmltYXRpb25zLmJmX3dpbnNob3dfYW5pbSksXHJcbi8vICAgICBTZXZlbldpblNob3cgICAgICAgPSAoKSA9PiB1dGlscy5DcmVhdGVBbmltYXRpb24oUElYSS5CYXNlVGV4dHVyZS5mcm9tSW1hZ2UoJy4uL01lZGlhL2FuaW1hdGlvbnMvd2luc2hvdy9zZXZlbi93aW5zaG93U2V2ZW4ucG5nJyksIEFuaW1hdGlvbnMuc2V2ZW5fd2luc2hvd19hbmltKSxcclxuLy8gICAgIFdhdGVybWVsb25XaW5TaG93ICA9ICgpID0+IHV0aWxzLkNyZWF0ZUFuaW1hdGlvbihQSVhJLkJhc2VUZXh0dXJlLmZyb21JbWFnZSgnLi4vTWVkaWEvYW5pbWF0aW9ucy93aW5zaG93L3dtL3dpbnNob3dXTS5wbmcnKSwgQW5pbWF0aW9ucy53bV93aW5zaG93X2FuaW0pLFxyXG4vLyAgICAgUGx1bVdpblNob3cgICAgICAgID0gKCkgPT4gdXRpbHMuQ3JlYXRlQW5pbWF0aW9uKFBJWEkuQmFzZVRleHR1cmUuZnJvbUltYWdlKCcuLi9NZWRpYS9hbmltYXRpb25zL3dpbnNob3cvcGx1bS93aW5zaG93UGx1bS5wbmcnKSwgQW5pbWF0aW9ucy5wbHVtX3dpbnNob3dfYW5pbSksXHJcbi8vICAgICBPcmFuZ2VXaW5TaG93ICAgICAgPSAoKSA9PiB1dGlscy5DcmVhdGVBbmltYXRpb24oUElYSS5CYXNlVGV4dHVyZS5mcm9tSW1hZ2UoJy4uL01lZGlhL2FuaW1hdGlvbnMvd2luc2hvdy9vcmFuZ2Uvd2luc2hvd09yYW5nZS5wbmcnKSwgQW5pbWF0aW9ucy5vcmFuZ2Vfd2luc2hvd19hbmltKSxcclxuLy8gICAgIExlbW9uV2luU2hvdyAgICAgICA9ICgpID0+IHV0aWxzLkNyZWF0ZUFuaW1hdGlvbihQSVhJLkJhc2VUZXh0dXJlLmZyb21JbWFnZSgnLi4vTWVkaWEvYW5pbWF0aW9ucy93aW5zaG93L2xlbW9uL3dpbnNob3dMZW1vbi5wbmcnKSwgQW5pbWF0aW9ucy5sZW1vbl93aW5zaG93X2FuaW0pLFxyXG4vLyAgICAgQ2hlcnJ5V2luU2hvdyAgICAgID0gKCkgPT4gdXRpbHMuQ3JlYXRlQW5pbWF0aW9uKFBJWEkuQmFzZVRleHR1cmUuZnJvbUltYWdlKCcuLi9NZWRpYS9hbmltYXRpb25zL3dpbnNob3cvY2hlcnJ5L3dpbnNob3dDaGVycnkucG5nJyksIEFuaW1hdGlvbnMuY2hlcnJ5X3dpbnNob3dfYW5pbSksXHJcbi8vICAgICBCb251c1dpblNob3cgICAgICAgPSAoKSA9PiB1dGlscy5DcmVhdGVBbmltYXRpb24oUElYSS5CYXNlVGV4dHVyZS5mcm9tSW1hZ2UoJy4uL01lZGlhL2FuaW1hdGlvbnMvd2luc2hvdy9ib251cy93aW5zaG93Qm9udXMucG5nJyksIEFuaW1hdGlvbnMuYm9udXNfd2luc2hvd19hbmltKSxcclxuLy8gICAgIFdpbGRXaW5TaG93ICAgICAgICA9ICgpID0+IHV0aWxzLkNyZWF0ZUFuaW1hdGlvbihQSVhJLkJhc2VUZXh0dXJlLmZyb21JbWFnZSgnLi4vTWVkaWEvYW5pbWF0aW9ucy93aW5zaG93L3dpbGQvd2luc2hvd1dpbGQucG5nJyksIEFuaW1hdGlvbnMud2lsZF93aW5zaG93X2FuaW0pO1xyXG5cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSVN5bWJvbCB7XHJcbiAgICBuYW1lOiBzdHJpbmcsXHJcbiAgICByZWVsVmFsdWU6IG51bWJlcixcclxuXHJcbn1cclxuXHJcblxyXG5leHBvcnQgY29uc3QgU3ltYm9sMTogSVN5bWJvbCA9IHtcclxuICAgIG5hbWU6ICdTWU0xJyxcclxuICAgIHJlZWxWYWx1ZTogMVxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IFN5bWJvbDM6IElTeW1ib2wgPSB7XHJcbiAgICBuYW1lOiAnU1lNMycsXHJcbiAgICByZWVsVmFsdWU6IDNcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBTeW1ib2w0OiBJU3ltYm9sID0ge1xyXG4gICAgbmFtZTogJ1NZTTQnLFxyXG4gICAgcmVlbFZhbHVlOiA0XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgU3ltYm9sNTogSVN5bWJvbCA9IHtcclxuICAgIG5hbWU6ICdTWU01JyxcclxuICAgIHJlZWxWYWx1ZTogNVxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IFN5bWJvbDY6IElTeW1ib2wgPSB7XHJcbiAgICBuYW1lOiAnU1lNNicsXHJcbiAgICByZWVsVmFsdWU6IDZcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBTeW1ib2w3OiBJU3ltYm9sID0ge1xyXG4gICAgbmFtZTogJ1NZTTcnLFxyXG4gICAgcmVlbFZhbHVlOiA3XHJcbn07XHJcblxyXG5cclxuXHJcbmV4cG9ydCBjb25zdCBTWU1CT0xTID0gW1N5bWJvbDEsIFN5bWJvbDMsIFN5bWJvbDQsIFN5bWJvbDUsIFN5bWJvbDYsIFN5bWJvbDddO1xyXG5leHBvcnQgY29uc3Qgc2hvd1N5bWJvbHMgPSBbU3ltYm9sMSwgU3ltYm9sMywgU3ltYm9sNCwgU3ltYm9sNSwgU3ltYm9sNiwgU3ltYm9sN107IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgdGFyYXNnIG9uIDEwLzEzLzIwMTcuXHJcbiAqL1xyXG5cclxuXHJcbmltcG9ydCAqIGFzIGNvbmZpZyBmcm9tIFwiLi4vUmVlbFNwaW5uZXIvcmVlbHNDb25maWdcIlxyXG5pbXBvcnQge0lTeW1ib2wsIFNZTUJPTFN9IGZyb20gXCIuL01haW5Sb3VuZFN5bWJvbHNcIjtcclxuaW1wb3J0IHthcHB9IGZyb20gXCIuLi9tYWluXCI7XHJcbmltcG9ydCB7UmVlbFNldH0gZnJvbSBcIi4vUmVlbFNldHNcIjtcclxuXHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIFJlZWxOIHtcclxuXHJcbiAgICBwdWJsaWMgeDogbnVtYmVyO1xyXG4gICAgcHVibGljIHk6IG51bWJlcjtcclxuICAgIHB1YmxpYyBpbmRleDogbnVtYmVyO1xyXG4gICAgcHVibGljIHJlZWxDb250YWluZXI6IFBJWEkuQ29udGFpbmVyO1xyXG4gICAgcHVibGljIHZpc2libGVTeW1ib2xzQXJyYXk6IEFycmF5PElTeW1ib2w+O1xyXG4gICAgcHVibGljIG5leHRTcHJpdGU6IFBJWEkuU3ByaXRlO1xyXG4gICAgcHVibGljIG5leHRTeW1ib2w6IElTeW1ib2w7XHJcbiAgICBwdWJsaWMgdmlzaWJsZVNwcml0ZXM6IEFycmF5PFBJWEkuU3ByaXRlIHwgYW55PjtcclxuICAgIHByaXZhdGUgcmVzb3VyY2VzOiBBcnJheTxQSVhJLlRleHR1cmUgfCBhbnk+XHJcblxyXG4gICAgcHJpdmF0ZSByZWVsVmFsdWVzTWF0aDogQXJyYXk8bnVtYmVyPjtcclxuICAgIHByaXZhdGUgc3ltYm9sc0Ftb3VudDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSByZWVsc0NvbnRhaW5lcjogUElYSS5Db250YWluZXI7XHJcbiAgICBwcml2YXRlIHJlZWxNYXNrOiBQSVhJLkdyYXBoaWNzO1xyXG4gICAgcHJpdmF0ZSBXaW5TaG93QW5pbWF0aW9uOiBQSVhJLmV4dHJhcy5BbmltYXRlZFNwcml0ZTtcclxuICAgIHByaXZhdGUgd2luc2hvd1Nwcml0ZTogUElYSS5TcHJpdGU7XHJcbiAgICBwcml2YXRlIHdpblNob3dUaW1lOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIFNwaW5uaW5nVGltZTogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBTcGlubmluZ1NwZWVkOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHNwaW5uaW5nSW5kZXg6IG51bWJlcjtcclxuICAgIHByaXZhdGUgeV9kZWx0YTogbnVtYmVyO1xyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICBwcml2YXRlIHJlZWxTeW1ib2xzQW1vdW50OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHN0b3BTeW1ib2xzOiBudW1iZXJbXTtcclxuICAgIHByaXZhdGUgdGVtcFJlZWw6IFBJWEkuU3ByaXRlW107XHJcbiAgICBwcml2YXRlIHJlZWxDb250U3RvcFk6IG51bWJlcjtcclxuXHJcbiAgICBwcml2YXRlIHJlZWxTdG9wU291bmQ6IGFueTtcclxuICAgIHByaXZhdGUgaXNTbGFtb3V0OiBib29sZWFuO1xyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS1cclxuICAgIHByaXZhdGUgc2NhbGV4OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHNjYWxleTogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBzY2FsZUNvdW50OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHNjYWxlU3RvcDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBzcHJpdGV5OiBudW1iZXI7XHJcblxyXG5cclxuICAgIGNvbnN0cnVjdG9yKHg6IG51bWJlciwgeTogbnVtYmVyLCBpbmRleDpudW1iZXIsIHJlZWxzQ29udGFpbmVyOiBQSVhJLkNvbnRhaW5lciwgcmVzb3VyY2VzOmFueSl7XHJcbiAgICAgICAgdGhpcy54ID0geDtcclxuICAgICAgICB0aGlzLnkgPSB5O1xyXG4gICAgICAgIHRoaXMuaW5kZXggPSBpbmRleDtcclxuICAgICAgICB0aGlzLnJlc291cmNlcyA9IHJlc291cmNlcztcclxuICAgICAgICB0aGlzLnN5bWJvbHNBbW91bnQgPSBjb25maWcuUmVlbHNDb25maWcucmVlbHNbaW5kZXhdLnN5bWJvbHNBbW91bnQ7XHJcbiAgICAgICAgdGhpcy5TcGlubmluZ1RpbWUgPSBjb25maWcuUmVlbHNDb25maWcucmVlbHNbaW5kZXhdLlNwaW5uaW5nVGltZTtcclxuICAgICAgICB0aGlzLlNwaW5uaW5nU3BlZWQgPSBjb25maWcuUmVlbHNDb25maWcuc3Bpbm5pbmdTcGVlZDtcclxuICAgICAgICB0aGlzLnJlZWxzQ29udGFpbmVyID0gcmVlbHNDb250YWluZXI7XHJcbiAgICAgICAgdGhpcy5yZWVsTWFzayA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XHJcbiAgICAgICAgdGhpcy52aXNpYmxlU3ltYm9sc0FycmF5ID0gW107XHJcbiAgICAgICAgdGhpcy5yZWVsVmFsdWVzTWF0aCA9IFJlZWxTZXRbaW5kZXhdO1xyXG4gICAgICAgIHRoaXMuc3Bpbm5pbmdJbmRleCA9IDA7XHJcbiAgICAgICAgdGhpcy50ZW1wUmVlbCA9IFtdO1xyXG4gICAgICAgIHRoaXMudmlzaWJsZVNwcml0ZXMgPSBbXTtcclxuICAgICAgICB0aGlzLndpblNob3dUaW1lID0gMjAwMDtcclxuXHJcbiAgICAgICAgLy8gdGhpcy5yZWVsU3RvcFNvdW5kID0gbmV3IEF1ZGlvKHJlc291cmNlcy5yZWVsc3RvcC51cmwpO1xyXG4gICAgICAgIHRoaXMuaXNTbGFtb3V0ID0gZmFsc2U7XHJcblxyXG5cclxuICAgICAgICAvL2ZvciB3aW5zaG93XHJcbiAgICAgICAgdGhpcy5zY2FsZUNvdW50ID0gMVxyXG4gICAgICAgIHRoaXMuc2NhbGVTdG9wID0gNVxyXG5cclxuICAgICAgICB0aGlzLkluaXRpYWxpemVSZWVsKCk7XHJcbiAgICAgICAgdGhpcy5pbml0aWFsaXplTWFzaygpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldFJhbmRvbVN5bWJvbCgpOiBJU3ltYm9sIHtcclxuICAgICAgICByZXR1cm4gU1lNQk9MU1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBTWU1CT0xTLmxlbmd0aCldO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgSW5pdGlhbGl6ZVJlZWwoKTp2b2lkIHtcclxuICAgICAgICB0aGlzLnJlZWxDb250YWluZXIgPSBuZXcgUElYSS5Db250YWluZXIoKTtcclxuICAgICAgICB0aGlzLnJlZWxDb250YWluZXIueCA9IHRoaXMueDtcclxuICAgICAgICB0aGlzLnJlZWxDb250YWluZXIueSA9IHRoaXMueTtcclxuICAgICAgICB0aGlzLnlfZGVsdGEgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLnJlZWxTeW1ib2xzQW1vdW50ID0gdGhpcy5zeW1ib2xzQW1vdW50ICsgdGhpcy5jYWxjdWxhdGVTeW1ib2xzQW1vdW50KCk7XHJcbiAgICAgICAgdGhpcy5yZWVsQ29udFN0b3BZID0gKHRoaXMucmVlbFN5bWJvbHNBbW91bnQtdGhpcy5zeW1ib2xzQW1vdW50KSpjb25maWcuc3ltYm9sSGVpZ2h0O1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpPTA7IGk8dGhpcy5yZWVsU3ltYm9sc0Ftb3VudDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBzeW1ib2wgPSB0aGlzLmdldFJhbmRvbVN5bWJvbCgpLFxyXG4gICAgICAgICAgICAgICAgc3ByaXRlID0gbmV3IFBJWEkuU3ByaXRlKHRoaXMucmVzb3VyY2VzW3N5bWJvbC5uYW1lXSk7XHJcbiAgICAgICAgICAgIHNwcml0ZS55ID0gY29uZmlnLnN5bWJvbEhlaWdodCAqICh0aGlzLnN5bWJvbHNBbW91bnQgLSBpIC0gMSk7XHJcbiAgICAgICAgICAgIHRoaXMudGVtcFJlZWwucHVzaChzcHJpdGUpO1xyXG4gICAgICAgICAgICB0aGlzLnJlZWxDb250YWluZXIuYWRkQ2hpbGRBdChzcHJpdGUsIGkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnJlZWxDb250YWluZXIueSArPSB0aGlzLnJlZWxDb250U3RvcFk7XHJcbiAgICAgICAgdGhpcy5yZWVsc0NvbnRhaW5lci5hZGRDaGlsZCh0aGlzLnJlZWxDb250YWluZXIpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBwcml2YXRlIGluaXRpYWxpemVNYXNrKCk6IHZvaWQge1xyXG4gICAgICAgIC8vIGNyZWF0ZXMgbWFzayBhcm91bmQgdGhlIHJlZWxDb250YWluZXJcclxuICAgICAgICB0aGlzLnJlZWxzQ29udGFpbmVyLmFkZENoaWxkKHRoaXMucmVlbE1hc2spO1xyXG4gICAgICAgIHRoaXMucmVlbE1hc2subGluZVN0eWxlKDApO1xyXG4gICAgICAgIHRoaXMucmVlbENvbnRhaW5lci5tYXNrID0gdGhpcy5yZWVsTWFzaztcclxuXHJcbiAgICAgICAgdGhpcy5yZWVsTWFzay5iZWdpbkZpbGwoMHg4YmM1ZmYsIDAuMSk7XHJcbiAgICAgICAgdGhpcy5yZWVsTWFzay5tb3ZlVG8odGhpcy54LCB0aGlzLnkpO1xyXG4gICAgICAgIHRoaXMucmVlbE1hc2subGluZVRvKHRoaXMueCArIGNvbmZpZy5zeW1ib2xXaWR0aCwgdGhpcy55KTtcclxuICAgICAgICB0aGlzLnJlZWxNYXNrLmxpbmVUbyh0aGlzLnggKyBjb25maWcuc3ltYm9sV2lkdGgsICh0aGlzLnkrY29uZmlnLnN5bWJvbEhlaWdodCkqdGhpcy5zeW1ib2xzQW1vdW50KTtcclxuICAgICAgICB0aGlzLnJlZWxNYXNrLmxpbmVUbyh0aGlzLngsICh0aGlzLnkrY29uZmlnLnN5bWJvbEhlaWdodCkqdGhpcy5zeW1ib2xzQW1vdW50KTtcclxuICAgICAgICB0aGlzLnJlZWxNYXNrLmxpbmVUbyh0aGlzLngsIHRoaXMueSk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHB1YmxpYyBzdGFydFNwaW5BbmltYXRpb24oc3RvcFN5bWJvbHM6IG51bWJlcltdKTogdm9pZCB7XHJcblxyXG4gICAgICAgIHRoaXMuc3RvcFN5bWJvbHMgPSBzdG9wU3ltYm9scztcclxuICAgICAgICBhcHAudGlja2VyLmFkZChhbmltYXRlU3RhclNwaW4sIHRoaXMpO1xyXG5cclxuICAgICAgICBsZXQgcG9zaXRpb24gPSB0aGlzLnJlZWxDb250YWluZXIueTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYW5pbWF0ZVN0YXJTcGluKHRpbWVkZWx0YTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnJlZWxDb250YWluZXIueSA+IHBvc2l0aW9uLWNvbmZpZy5TdGFydEFuaW1EZWx0YSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWVsQ29udGFpbmVyLnkgLT0gTWF0aC5mbG9vcihjb25maWcuU3RhcnRBbmltU3BlZWQgKiB0aW1lZGVsdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICBhcHAudGlja2VyLnJlbW92ZShhbmltYXRlU3RhclNwaW4sIHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zcGluQW5pbWF0aW9uKHN0b3BTeW1ib2xzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcblxyXG4gICAgcHJpdmF0ZSBjYWxjdWxhdGVTeW1ib2xzQW1vdW50KCk6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IGRpc3RhbmNlUFggPSBjb25maWcuUmVlbHNDb25maWcuc3Bpbm5pbmdTcGVlZCAqIDYwICogKHRoaXMuU3Bpbm5pbmdUaW1lLzEwMDApO1xyXG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKGRpc3RhbmNlUFgvY29uZmlnLnN5bWJvbEhlaWdodClcclxuICAgIH1cclxuXHJcblxyXG4gICAgcHVibGljIHNsYW1PdXQoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5pc1NsYW1vdXQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMucmVlbENvbnRhaW5lci55ID0gdGhpcy5yZWVsQ29udFN0b3BZO1xyXG5cclxuICAgIH1cclxuXHJcblxyXG4gICAgcHJpdmF0ZSBzd2FwQ3VycmVudFZpc2libGVUZXh0dXJlcygpOiB2b2lkIHtcclxuICAgICAgICBmb3IgKGxldCBpPTA7IGk8dGhpcy5zeW1ib2xzQW1vdW50OyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHRleHR1cmUgPSB0aGlzLnRlbXBSZWVsW3RoaXMudGVtcFJlZWwubGVuZ3RoLTEtaV0udGV4dHVyZTtcclxuICAgICAgICAgICAgdGhpcy50ZW1wUmVlbFt0aGlzLnN5bWJvbHNBbW91bnQtMS1pXS50ZXh0dXJlID0gdGV4dHVyZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXRTdG9wU3ltYm9scyhzdG9wU3ltYm9sczogbnVtYmVyW10pOiB2b2lkIHtcclxuICAgICAgICBmb3IgKGxldCBpPTA7IGk8c3RvcFN5bWJvbHMubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgICAgICBsZXQgdGV4dHVyZSA9IHRoaXMucmVzb3VyY2VzW1NZTUJPTFNbc3RvcFN5bWJvbHNbaV1dLm5hbWVdO1xyXG4gICAgICAgICAgICB0aGlzLnRlbXBSZWVsW3RoaXMucmVlbFN5bWJvbHNBbW91bnQtaS0xXS50ZXh0dXJlID0gdGV4dHVyZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHB1YmxpYyBzcGluQW5pbWF0aW9uKHN0b3BTeW1ib2xzOiBudW1iZXJbXSkgOiB2b2lkIHtcclxuXHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuaXNTbGFtb3V0ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vIHN3YXAgdmlzaWJsZSBlbGVtZW50c1xyXG4gICAgICAgIHRoaXMuc3dhcEN1cnJlbnRWaXNpYmxlVGV4dHVyZXMoKTtcclxuICAgICAgICB0aGlzLnJlZWxDb250YWluZXIueSAtPSB0aGlzLnJlZWxDb250U3RvcFk7XHJcbiAgICAgICAgdGhpcy5zZXRTdG9wU3ltYm9scyhzdG9wU3ltYm9scyk7XHJcblxyXG4gICAgICAgIGFwcC50aWNrZXIuYWRkKGFuaW1hdGVTcGluLCB0aGlzKTtcclxuXHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNtb290aFN0b3AoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGxldCBkb3duID0gdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHN0YXJ0WSA9IHNlbGYucmVlbENvbnRhaW5lci55LFxyXG4gICAgICAgICAgICAgICAgc3RvcFkgPSBzZWxmLnJlZWxDb250YWluZXIueSArIGNvbmZpZy5SZWVsc0NvbmZpZy5yZWVsU3RvcERlbHRhO1xyXG5cclxuICAgICAgICAgICAgYXBwLnRpY2tlci5hZGQoc3RvcEFuaW1hdGlvbiwgc2VsZik7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBzdG9wQW5pbWF0aW9uKHRpbWVkZWx0YTogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5yZWVsQ29udGFpbmVyLnkgPCBzdG9wWSAmJiBkb3duKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5yZWVsQ29udGFpbmVyLnkgKz0gY29uZmlnLlJlZWxzQ29uZmlnLnJlZWxTdG9wU3BlZWQgKiB0aW1lZGVsdGE7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNlbGYucmVlbENvbnRhaW5lci55ID49IHN0b3BZICYmIGRvd24pIHtcclxuICAgICAgICAgICAgICAgICAgICBkb3duID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYucmVlbENvbnRhaW5lci55ID0gTWF0aC5tYXgoc2VsZi5yZWVsQ29udGFpbmVyLnkgLSBNYXRoLmZsb29yKGNvbmZpZy5SZWVsc0NvbmZpZy5yZWVsU3RvcERlbHRhKnRpbWVkZWx0YSowLjEpLCBzdGFydFkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWxmLnJlZWxDb250YWluZXIueSA9PSBzdGFydFkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwLnRpY2tlci5yZW1vdmUoc3RvcEFuaW1hdGlvbiwgc2VsZik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWxmLmluZGV4ID09IGNvbmZpZy5SZWVsc0NvbmZpZy5yZWVscy5sZW5ndGgtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KCdMYXN0UmVlbFN0b3BwZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9YCAgYFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYW5pbWF0ZVNwaW4odGltZWRlbHRhOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucmVlbENvbnRhaW5lci55IDwgdGhpcy5yZWVsQ29udFN0b3BZKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlZWxDb250YWluZXIueSA9IE1hdGgubWluKHRoaXMucmVlbENvbnRhaW5lci55ICsgTWF0aC5mbG9vcih0aW1lZGVsdGEqdGhpcy5TcGlubmluZ1NwZWVkKSwgdGhpcy5yZWVsQ29udFN0b3BZKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGFwcC50aWNrZXIucmVtb3ZlKGFuaW1hdGVTcGluLCB0aGlzKTtcclxuICAgICAgICAgICAgICAgIHNtb290aFN0b3AoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBwdWJsaWMgcGxheVdpblNob3coc3ltYm9sOiBudW1iZXIsIGluZGV4OiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICAvLyBoaWRlIHN5bWJvbCBzcHJpdGVcclxuICAgICAgICB0aGlzLnRlbXBSZWVsW3RoaXMucmVlbFN5bWJvbHNBbW91bnQtaW5kZXgtMV0udmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIGxldCBpU3ltYm9sID0gU1lNQk9MU1tzeW1ib2xdO1xyXG4gICAgICAgIHRoaXMud2luc2hvd1Nwcml0ZSA9IG5ldyBQSVhJLlNwcml0ZSh0aGlzLnJlc291cmNlc1tpU3ltYm9sLm5hbWVdKTtcclxuICAgICAgICB0aGlzLnJlZWxDb250YWluZXIuYWRkQ2hpbGQodGhpcy53aW5zaG93U3ByaXRlKTtcclxuICAgICAgICB0aGlzLndpbnNob3dTcHJpdGUueSA9IHRoaXMudGVtcFJlZWxbdGhpcy5yZWVsU3ltYm9sc0Ftb3VudC1pbmRleC0xXS55O1xyXG5cclxuICAgICAgICB0aGlzLndpbnNob3dTcHJpdGUuYW5jaG9yLnNldCgwLjUsIDAuNSk7XHJcbiAgICAgICAgdGhpcy53aW5zaG93U3ByaXRlLnggKz0gdGhpcy53aW5zaG93U3ByaXRlLndpZHRoLzI7XHJcbiAgICAgICAgdGhpcy53aW5zaG93U3ByaXRlLnkgKz0gdGhpcy53aW5zaG93U3ByaXRlLmhlaWdodC8yO1xyXG5cclxuICAgICAgICB0aGlzLnNjYWxleCA9IHRoaXMud2luc2hvd1Nwcml0ZS5zY2FsZS54O1xyXG4gICAgICAgIHRoaXMuc2NhbGV5ID0gdGhpcy53aW5zaG93U3ByaXRlLnNjYWxlLnk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgYXBwLnRpY2tlci5hZGQodGhpcy53aW5zaG93LCB0aGlzKVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdG9wV2luU2hvdyhpbmRleDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgYXBwLnRpY2tlci5yZW1vdmUodGhpcy53aW5zaG93LCBzZWxmKTtcclxuICAgICAgICB0aGlzLnNjYWxlQ291bnQgPSAxO1xyXG4gICAgICAgIHRoaXMucmVlbENvbnRhaW5lci5yZW1vdmVDaGlsZCh0aGlzLndpbnNob3dTcHJpdGUpO1xyXG4gICAgICAgIHRoaXMudGVtcFJlZWxbdGhpcy5yZWVsU3ltYm9sc0Ftb3VudC1pbmRleC0xXS52aXNpYmxlID0gdHJ1ZVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHdpbnNob3codGltZWRlbHRhKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIGlmIChkb2N1bWVudC5oYXNGb2N1cygpKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNjYWxlQ291bnQgIT0gdGhpcy5zY2FsZVN0b3ApIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNjYWxlQ291bnQgJSAyID09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNjYWxlRG93bih0aW1lZGVsdGEpXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2NhbGVVcCh0aW1lZGVsdGEpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBhcHAudGlja2VyLnJlbW92ZSh0aGlzLndpbnNob3csIHNlbGYpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zY2FsZUNvdW50ID0gMTtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVlbENvbnRhaW5lci5yZW1vdmVDaGlsZCh0aGlzLndpbnNob3dTcHJpdGUpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHdpblNob3dFbmRFdmVudCA9IG5ldyBDdXN0b21FdmVudCgnUmVlbFdpblNob3dBbmltRW5kJywgeydkZXRhaWwnOiB7J3JlZWxJbmRleCc6IHRoaXMuaW5kZXh9fSk7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KHdpblNob3dFbmRFdmVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHByaXZhdGUgc2NhbGVVcCh0aW1lZGVsdGEpIHtcclxuICAgICAgICBpZiAoZG9jdW1lbnQuaGFzRm9jdXMoKSl7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLndpbnNob3dTcHJpdGUuc2NhbGUueCA8ICh0aGlzLnNjYWxleCAqIDEuMikpIHtcclxuICAgICAgICAgICAgICAgIGxldCBuZXdWYWx1ZSA9IFt0aGlzLndpbnNob3dTcHJpdGUuc2NhbGUueCArIDAuMDA4LCB0aGlzLndpbnNob3dTcHJpdGUuc2NhbGUueSArIDAuMDA4XTtcclxuICAgICAgICAgICAgICAgIHRoaXMud2luc2hvd1Nwcml0ZS5zY2FsZS5zZXQobmV3VmFsdWVbMF0qdGltZWRlbHRhLCBuZXdWYWx1ZVsxXSp0aW1lZGVsdGEpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zY2FsZUNvdW50Kys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzY2FsZURvd24odGltZWRlbHRhKSB7XHJcbiAgICAgICAgaWYgKGRvY3VtZW50Lmhhc0ZvY3VzKCkpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMud2luc2hvd1Nwcml0ZS5zY2FsZS54ID4gdGhpcy5zY2FsZXgpIHtcclxuICAgICAgICAgICAgICAgIGxldCBuZXdWYWx1ZSA9IFt0aGlzLndpbnNob3dTcHJpdGUuc2NhbGUueCAtIDAuMDA4LCB0aGlzLndpbnNob3dTcHJpdGUuc2NhbGUueSAtIDAuMDA4XTtcclxuICAgICAgICAgICAgICAgIHRoaXMud2luc2hvd1Nwcml0ZS5zY2FsZS5zZXQobmV3VmFsdWVbMF0qdGltZWRlbHRhLCBuZXdWYWx1ZVsxXSp0aW1lZGVsdGEpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy53aW5zaG93U3ByaXRlLnNjYWxlLnggPSB0aGlzLnNjYWxleDtcclxuICAgICAgICAgICAgICAgIHRoaXMud2luc2hvd1Nwcml0ZS5zY2FsZS55ID0gdGhpcy5zY2FsZXk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNjYWxlQ291bnQrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcblxyXG59XHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IHRhcmFzZyBvbiA0MC80NC8xMDQxLlxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IFJlZWxTZXQ6IG51bWJlcltdW10gPSBbXHJcbiAgICBbNCwgMSwgNiwgNiwgMSwgMywgNSwgNCwgNiwgMywgNSwgNywgNCwgNSwgMywgNCwgNCwgMywgNiwgNywgNCwgNSwgNiwgNywgNSwgNCwgMSwgNSwgNSwgMywgMSwgNCwgNSwgMywgNCwgMSwgNSwgNCwgNiwgMSwgMywgNiwgNCwgNCwgNCwgNCwgNCwgNywgNSwgM10sXHJcbiAgICBbNiwgNCwgMSwgNSwgNywgMywgNCwgNiwgMSwgNCwgNCwgMywgNywgNCwgNCwgNiwgMSwgNCwgNSwgNiwgNywgNCwgNCwgMSwgNiwgNCwgMywgNCwgNywgMCwgNCwgNiwgNCwgNCwgNCwgNCwgMSwgMywgNCwgNCwgNywgNiwgNSwgNCwgMywgMSwgNCwgNCwgNywgNV0sXHJcbiAgICBbNCwgNCwgNiwgMSwgNiwgMywgNSwgNCwgNywgMywgNSwgMSwgNCwgNSwgMywgNCwgNCwgMywgNywgNiwgNCwgNSwgMywgMSwgNSwgNCwgNCwgNSwgNCwgMywgNywgNSwgNSwgMywgNCwgMSwgNSwgNCwgNywgNiwgMywgMSwgNCwgMCwgNCwgNCwgNCwgNywgNSwgM10sXHJcbiAgICBbMSwgNCwgMSwgNSwgMSwgMywgNCwgNSwgNCwgNCwgNSwgMywgMSwgNCwgNCwgMSwgMSwgNCwgNSwgMSwgMSwgNCwgNSwgNCwgMSwgNCwgMywgNCwgMSwgMCwgNSwgMSwgNCwgNCwgNCwgNCwgMSwgMywgNCwgNCwgNSwgMSwgNSwgNCwgMywgMSwgNCwgNCwgMSwgNV0sXHJcbiAgICBbNCwgNCwgMSwgMSwgMSwgMSwgNCwgNCwgMSwgMywgNSwgMSwgNCwgMSwgMywgNCwgNCwgMSwgMSwgMSwgNCwgMywgNCwgMSwgNSwgNCwgNCwgNSwgNSwgMywgMSwgNCwgNCwgMywgNCwgMSwgMSwgNCwgMSwgMSwgMywgMSwgNCwgNCwgNCwgNCwgNCwgMSwgNSwgM11cclxuXTsiLCIvKipcclxuICogQ3JlYXRlZCBieSB0YXJhc2cgb24gMTAvMTEvMjAxNy5cclxuICovXHJcbmltcG9ydCB7QmFzZUdhbWVTY2VuZX0gZnJvbSBcIi4uL1NjZW5lcy9HYW1lU2NlbmVzXCI7XHJcbi8vIGltcG9ydCB7UmVlbH0gZnJvbSBcIi4vUmVlbFwiO1xyXG5pbXBvcnQge1JlZWxzQ29uZmlnfSBmcm9tIFwiLi9yZWVsc0NvbmZpZ1wiO1xyXG5pbXBvcnQge1JlZWxOfSBmcm9tIFwiLi9OZXdSZWVsXCI7XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIFJlZWxTcGlubmVyIHtcclxuICAgIHByaXZhdGUgcmVzb3VyY2VzOiBhbnk7XHJcbiAgICBwdWJsaWMgc2NlbmU6IEJhc2VHYW1lU2NlbmU7XHJcbiAgICBwdWJsaWMgcmVlbHNBcnJheTogUmVlbE5bXTtcclxuXHJcbiAgICBwdWJsaWMgcmVlbHNDb250YWluZXI6IFBJWEkuQ29udGFpbmVyO1xyXG4gICAgcHJpdmF0ZSByZWVsc0RlbGF5OiBudW1iZXI7XHJcblxyXG4gICAgcHJpdmF0ZSByZWVsU3BpblNvdW5kOiBhbnk7XHJcbiAgICBwcml2YXRlIHJlZWxTdG9wU291bmQ6IGFueTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihzY2VuZTogQmFzZUdhbWVTY2VuZSwgcmVzb3VyY2VzOiBhbnkpIHtcclxuICAgICAgICB0aGlzLnNjZW5lID0gc2NlbmU7XHJcbiAgICAgICAgdGhpcy5yZXNvdXJjZXMgPSByZXNvdXJjZXM7XHJcbiAgICAgICAgdGhpcy5yZWVsc0FycmF5ID0gW107XHJcbiAgICAgICAgLy8gdGhpcy5yZWVsU3BpblNvdW5kID0gbmV3IEF1ZGlvKHJlc291cmNlcy5yZWVsc3Bpbi51cmwpO1xyXG4gICAgICAgIC8vIHRoaXMucmVlbFN0b3BTb3VuZCA9IG5ldyBBdWRpbyhyZXNvdXJjZXMucmVlbHN0b3AudXJsKTtcclxuICAgICAgICB0aGlzLmluaXRpYWxpemVSZWVscygpO1xyXG5cclxuICAgIH1cclxuXHJcblxyXG4gICAgcHJpdmF0ZSBpbml0aWFsaXplUmVlbHMoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5yZWVsc0NvbnRhaW5lciA9IG5ldyBQSVhJLkNvbnRhaW5lcigpO1xyXG4gICAgICAgIHRoaXMucmVlbHNDb250YWluZXIueCA9IFJlZWxzQ29uZmlnLng7XHJcbiAgICAgICAgdGhpcy5yZWVsc0NvbnRhaW5lci55ID0gUmVlbHNDb25maWcueTtcclxuXHJcbiAgICAgICAgdGhpcy5yZWVsc0RlbGF5ID0gUmVlbHNDb25maWcucmVlbHNEZWxheTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaT0wOyBpPFJlZWxzQ29uZmlnLnJlZWxzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCB4OiBudW1iZXIgPSBSZWVsc0NvbmZpZy5yZWVsc1tpXS54LFxyXG4gICAgICAgICAgICAgICAgeTogbnVtYmVyID0gUmVlbHNDb25maWcucmVlbHNbaV0ueTtcclxuICAgICAgICAgICAgbGV0IHJlZWwgPSBuZXcgUmVlbE4oeCwgeSwgaSwgdGhpcy5yZWVsc0NvbnRhaW5lciwgdGhpcy5yZXNvdXJjZXMpO1xyXG4gICAgICAgICAgICB0aGlzLnJlZWxzQXJyYXkucHVzaChyZWVsKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc2NlbmUuYWRkQ2hpbGQodGhpcy5yZWVsc0NvbnRhaW5lcik7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNwaW4ocmVzdWx0czogbnVtYmVyW11bXSk6IHZvaWQge1xyXG5cclxuICAgICAgICBsZXQgcmVlbHNEZWxheTogbnVtYmVyID0gdGhpcy5yZWVsc0RlbGF5O1xyXG4gICAgICAgIC8vIHRoaXMucmVlbFNwaW5Tb3VuZC5jdXJyZW50VGltZSA9IDA7XHJcbiAgICAgICAgLy8gdGhpcy5yZWVsU3BpblNvdW5kLnBsYXkoKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaTx0aGlzLnJlZWxzQXJyYXkubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgICAgICBsZXQgYW5pbWF0aW9uID0gdGhpcy5yZWVsc0FycmF5W2ldLnN0YXJ0U3BpbkFuaW1hdGlvbi5iaW5kKHRoaXMucmVlbHNBcnJheVtpXSk7XHJcbiAgICAgICAgICAgIChmdW5jdGlvbiAoaSkge1xyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChhbmltYXRpb24sIHJlZWxzRGVsYXkqaSwgcmVzdWx0c1tpXSk7XHJcbiAgICAgICAgICAgIH0pKGkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2xhbW91dCgpOiB2b2lkIHtcclxuICAgICAgICBsZXQgcmVlbHNEZWxheTogbnVtYmVyID0gdGhpcy5yZWVsc0RlbGF5O1xyXG4gICAgICAgIC8vIHRoaXMucmVlbFNwaW5Tb3VuZC5wYXVzZSgpO1xyXG4gICAgICAgIGZvciAobGV0IGk9MDsgaTx0aGlzLnJlZWxzQXJyYXkubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5yZWVsc0FycmF5W2ldLnNsYW1PdXQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG59IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgdGFyYXNnIG9uIDEwLzExLzIwMTcuXHJcbiAqL1xyXG5cclxuZXhwb3J0IGNvbnN0IFdpbkJveFdpZHRoOiAgbnVtYmVyID0gMjU0O1xyXG5leHBvcnQgY29uc3QgV2luQm94SGVpZ2h0OiBudW1iZXIgPSAyNDQ7XHJcblxyXG5leHBvcnQgY29uc3Qgc3ltYm9sV2lkdGg6IG51bWJlciA9IDIzNTtcclxuZXhwb3J0IGNvbnN0IHN5bWJvbEhlaWdodDogbnVtYmVyID0gMTU1O1xyXG5cclxuZXhwb3J0IGNvbnN0IExpbmVOdW1iZXJXaWR0aDogIG51bWJlciA9IDgzO1xyXG5leHBvcnQgY29uc3QgTGluZU51bWJlckhlaWdodDogbnVtYmVyID0gNzM7XHJcblxyXG5cclxuZXhwb3J0IGNvbnN0IFN0YXJ0QW5pbURlbHRhOiBudW1iZXIgPSA1MDtcclxuZXhwb3J0IGNvbnN0IFN0YXJ0QW5pbVNwZWVkOiBudW1iZXIgPSAxMDtcclxuXHJcblxyXG5cclxuZXhwb3J0IGNvbnN0IFJlZWxzQ29uZmlnID0ge1xyXG4gICAgeDogNTAsXHJcbiAgICB5OiA2MCxcclxuXHJcbiAgICByZWVsc0RlbGF5OiA1MCwgLy8gbXMgYmV0d2VlbiBzcGluIGFuaW1hdGlvbiBvZiB0aGUgcmVlbHNcclxuXHJcbiAgICByZWVsczogW1xyXG4gICAgICAgIHsneCc6MjAsICd5JzoxMCwgJ3N5bWJvbHNBbW91bnQnOjMsICdTcGlubmluZ1RpbWUnOiAxNTAwfSxcclxuICAgICAgICB7J3gnOjI2MCwgJ3knOjEwLCAnc3ltYm9sc0Ftb3VudCc6MywgJ1NwaW5uaW5nVGltZSc6IDE3MDB9LFxyXG4gICAgICAgIHsneCc6NTAzLCAneSc6MTAsICdzeW1ib2xzQW1vdW50JzozLCAnU3Bpbm5pbmdUaW1lJzogMjIwMH1cclxuICAgIF0sXHJcblxyXG4gICAgc3Bpbm5pbmdTcGVlZDogMjAsXHJcbiAgICBzbGFtT3V0QWNjZWxlcmF0aW9uOiAyLjI1LFxyXG4gICAgcmVlbFN0b3BEZWx0YTogMTUsXHJcbiAgICByZWVsU3RvcFNwZWVkOiA1XHJcbn07XHJcblxyXG5cclxuZXhwb3J0IGNvbnN0IHJlc3BvbnNlID0ge1xyXG4gICAgXCJxdWFsaWZpZXJcIjpcImNvbS5wdC5jYXNpbm8ucGxhdGZvcm1cIixcclxuICAgIFwiY29udGV4dElkXCI6XCJyOXRudmFham9qeWQzbmk4ODVtaVwiLFxyXG4gICAgXCJjb3JyZWxhdGlvbklkXCI6XCI5ZTB4N3JsN25zaTJ6MXkzMHVkaVwiLFxyXG4gICAgXCJkYXRhXCI6e1xyXG4gICAgICAgIFwiX3R5cGVcIjpcImNvbS5wdC5jYXNpbm8ucGxhdGZvcm0uZ2FtZS5HYW1lQ29tbWFuZFwiLFxyXG4gICAgICAgIFwid2luZG93SWRcIjpcIlwiLFxyXG4gICAgICAgIFwid2luQW1vdW50XCI6NTAwLFxyXG4gICAgICAgIFwiZ2FtZURhdGFcIjp7XHJcbiAgICAgICAgICAgIFwiX3R5cGVcIjpcInJ5b3RhOkdhbWVSZXNwb25zZVwiLFxyXG4gICAgICAgICAgICBcInN0YWtlXCI6NTAwLFxyXG4gICAgICAgICAgICBcInRvdGFsV2luQW1vdW50XCI6NTAwLFxyXG4gICAgICAgICAgICBcInBsYXlJbmRleFwiOjEsXHJcbiAgICAgICAgICAgIFwibmV4dFJvdW5kXCI6XCIwXCIsXHJcbiAgICAgICAgICAgIFwid2luTGluZUNvdW50XCI6NSxcclxuICAgICAgICAgICAgXCJpc1dpbkNhcHBlZFwiOmZhbHNlLFxyXG4gICAgICAgICAgICBcInBsYXlTdGFja1wiOltcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcInJvdW5kXCI6XCIwXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZW1haW5pbmdQbGF5Q291bnRcIjowLFxyXG4gICAgICAgICAgICAgICAgICAgIFwibmV3UGxheUNvdW50XCI6MCxcclxuICAgICAgICAgICAgICAgICAgICBcIm11bHRpcGxpZXJcIjoxLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiZmVhdHVyZVdpbkFtb3VudFwiOjQwMCxcclxuICAgICAgICAgICAgICAgICAgICBcImdhbWVXaW5BbW91bnRcIjowLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiaXNMYXN0UGxheU1vZGVcIjp0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiaXNOZXh0UGxheU1vZGVcIjpmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBcImlzV2luQ2FwcGVkXCI6ZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJsYXN0UGxheUluTW9kZURhdGFcIjp7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwicGxheVdpbkFtb3VudFwiOjQwMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJzbG90c0RhdGFcIjp7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInByZXZpb3VzVHJhbnNmb3Jtc1wiOltcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhY3Rpb25zXCI6W1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0cmFuc2Zvcm1zXCI6W1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVmXCI6XCJzcGluXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzeW1ib2xVcGRhdGVzXCI6W1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN5bWJvbFwiOjEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlZWxJbmRleFwiOjAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBvc2l0aW9uT25SZWVsXCI6MFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN5bWJvbFwiOjMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlZWxJbmRleFwiOjAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBvc2l0aW9uT25SZWVsXCI6MVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN5bWJvbFwiOjIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlZWxJbmRleFwiOjAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBvc2l0aW9uT25SZWVsXCI6MlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN5bWJvbFwiOjMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlZWxJbmRleFwiOjEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBvc2l0aW9uT25SZWVsXCI6MFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN5bWJvbFwiOjEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlZWxJbmRleFwiOjEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBvc2l0aW9uT25SZWVsXCI6MVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN5bWJvbFwiOjIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlZWxJbmRleFwiOjEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBvc2l0aW9uT25SZWVsXCI6MlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN5bWJvbFwiOjMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlZWxJbmRleFwiOjIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBvc2l0aW9uT25SZWVsXCI6MFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN5bWJvbFwiOjUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlZWxJbmRleFwiOjIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBvc2l0aW9uT25SZWVsXCI6MVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN5bWJvbFwiOjEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlZWxJbmRleFwiOjIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBvc2l0aW9uT25SZWVsXCI6MlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN5bWJvbFwiOjMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlZWxJbmRleFwiOjMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBvc2l0aW9uT25SZWVsXCI6MFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN5bWJvbFwiOjQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlZWxJbmRleFwiOjMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBvc2l0aW9uT25SZWVsXCI6MVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN5bWJvbFwiOjAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlZWxJbmRleFwiOjMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBvc2l0aW9uT25SZWVsXCI6MlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN5bWJvbFwiOjUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlZWxJbmRleFwiOjQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBvc2l0aW9uT25SZWVsXCI6MFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN5bWJvbFwiOjAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlZWxJbmRleFwiOjQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBvc2l0aW9uT25SZWVsXCI6MVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN5bWJvbFwiOjMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlZWxJbmRleFwiOjQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBvc2l0aW9uT25SZWVsXCI6MlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBheW91dHNcIjpbXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHJhbnNmb3Jtc1wiOltcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGF5b3V0c1wiOltcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBheW91dERhdGFcIjp7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGF5b3V0V2luQW1vdW50XCI6MzAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBheW91dEZyZWVQbGF5UmVzdWx0c0RhdGFcIjpbXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNvbnRleHRcIjp7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwid2luTGluZUluZGV4XCI6MCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ3aW5uaW5nU3ltYm9sc1wiOltcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN5bWJvbFwiOjMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZWVsSW5kZXhcIjowLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicG9zaXRpb25PblJlZWxcIjoxXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3ltYm9sXCI6MSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlZWxJbmRleFwiOjEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwb3NpdGlvbk9uUmVlbFwiOjFcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3ltYm9sXCI6MSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzeW1ib2xQYXlvdXRUeXBlXCI6XCJXaW5MaW5lXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibXVsdGlwbGllclwiOjFcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGF5b3V0RGF0YVwiOntcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwYXlvdXRXaW5BbW91bnRcIjoxMDAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBheW91dEZyZWVQbGF5UmVzdWx0c0RhdGFcIjpbXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNvbnRleHRcIjp7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwid2luTGluZUluZGV4XCI6MSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ3aW5uaW5nU3ltYm9sc1wiOltcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN5bWJvbFwiOjEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZWVsSW5kZXhcIjowLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicG9zaXRpb25PblJlZWxcIjowXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3ltYm9sXCI6MyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlZWxJbmRleFwiOjEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwb3NpdGlvbk9uUmVlbFwiOjBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzeW1ib2xcIjozLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVlbEluZGV4XCI6MixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBvc2l0aW9uT25SZWVsXCI6MFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzeW1ib2xcIjozLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN5bWJvbFBheW91dFR5cGVcIjpcIldpbkxpbmVcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtdWx0aXBsaWVyXCI6MVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwYXlvdXREYXRhXCI6e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBheW91dFdpbkFtb3VudFwiOjEwMDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGF5b3V0RnJlZVBsYXlSZXN1bHRzRGF0YVwiOltcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY29udGV4dFwiOntcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ3aW5MaW5lSW5kZXhcIjoyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIndpbm5pbmdTeW1ib2xzXCI6W1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3ltYm9sXCI6MixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlZWxJbmRleFwiOjAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwb3NpdGlvbk9uUmVlbFwiOjJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzeW1ib2xcIjoyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVlbEluZGV4XCI6MSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBvc2l0aW9uT25SZWVsXCI6MlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN5bWJvbFwiOjEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZWVsSW5kZXhcIjoyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicG9zaXRpb25PblJlZWxcIjoyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3ltYm9sXCI6MixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzeW1ib2xQYXlvdXRUeXBlXCI6XCJXaW5MaW5lXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibXVsdGlwbGllclwiOjFcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIFwibW9kZVR5cGVcIjpcIlNMT1RTXCJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJzdGFrZUFtb3VudFwiOjUwMFxyXG4gICAgfVxyXG59OyIsIi8qKlxuICogQ3JlYXRlZCBieSB0YXJhc2cgb24gOS8yNS8yMDE3LlxuICovXG5pbXBvcnQge0J1dHRvbiwgRGVub21pbmF0aW9uUGFuZWxCdXR0b259IGZyb20gXCIuLi9MYXlvdXQvQnV0dG9uc1wiO1xuaW1wb3J0IHtXaW5MaW5lQnV0dG9ufSBmcm9tIFwiLi4vTGF5b3V0L1dpbkxpbmVCdXR0b25cIjtcbmltcG9ydCB7QnV0dG9uRXZlbnRzfSBmcm9tIFwiLi4vRXZlbnRzL0J1dHRvbkV2ZW50c1wiO1xuaW1wb3J0IHtOdW1lcmljRmllbGQsIEJhbGFuY2VGaWVsZFdpdGhIaWRlQ3JlZGl0c0FuaW1hdGlvbn0gZnJvbSAgXCIuLi9MYXlvdXQvTnVtZXJpY0ZpZWxkXCI7XG5pbXBvcnQge0ZvbnRTdHlsZXN9IGZyb20gXCIuLi9VdGlscy9mb250U3R5bGVzXCI7XG5pbXBvcnQgKiBhcyB1dGlscyBmcm9tIFwiLi4vVXRpbHMvaGVscGVyRnVuY3NcIjtcbmltcG9ydCB7VGV4dENvbnRhaW5lcn0gZnJvbSBcIi4uL0xheW91dC9UZXh0Q29udGFpbmVyXCI7XG5pbXBvcnQge0NyZWF0ZUFuaW1hdGlvbn0gZnJvbSBcIi4uL1V0aWxzL2hlbHBlckZ1bmNzXCI7XG5pbXBvcnQgc2V0ID0gUmVmbGVjdC5zZXQ7XG5pbXBvcnQge1JlZWxTcGlubmVyfSBmcm9tIFwiLi4vUmVlbFNwaW5uZXIvUmVlbFNwaW5uZXJcIjtcbmltcG9ydCB7V2luTGluZSwgU2ltcGxlV2luTGluZX0gZnJvbSBcIi4uL0xheW91dC9XaW5MaW5lQ2xhc3NcIjtcbmltcG9ydCB7U291bmRzTWFuYWdlcn0gZnJvbSBcIi4uL21haW5cIjtcblxuXG5cblxuZXhwb3J0IGNsYXNzIEJhc2VHYW1lU2NlbmUgZXh0ZW5kcyBQSVhJLkNvbnRhaW5lciB7XG4gICAgcHVibGljIFJFRUxTOiBSZWVsU3Bpbm5lcjtcbiAgICBwdWJsaWMgc3RhcnRCdXR0b246IEJ1dHRvbjtcbiAgICBwdWJsaWMgc3RvcEJ1dHRvbjogQnV0dG9uO1xuICAgIHB1YmxpYyBtYXhCZXRCdXR0b246IEJ1dHRvbjtcbiAgICBwdWJsaWMgc3Rha2VCdXR0b246IERlbm9taW5hdGlvblBhbmVsQnV0dG9uO1xuICAgIHB1YmxpYyBiYWxhbmNlRmllbGQ6IE51bWVyaWNGaWVsZDtcbiAgICBwdWJsaWMgdG90YWxXaW5GaWVsZDogTnVtZXJpY0ZpZWxkO1xuXG4gICAgcHVibGljIHdpbmxpbmUwOiBTaW1wbGVXaW5MaW5lO1xuICAgIHB1YmxpYyB3aW5saW5lMTogU2ltcGxlV2luTGluZTtcbiAgICBwdWJsaWMgd2lubGluZTI6IFNpbXBsZVdpbkxpbmU7XG4gICAgcHVibGljIFdpbkxpbmVzOiBTaW1wbGVXaW5MaW5lW107XG5cbiAgICBwcml2YXRlIHNjZW5lQmFja2dyb3VuZDogUElYSS5TcHJpdGU7XG4gICAgcHJpdmF0ZSByZXNvdXJjZXM6IGFueTtcblxuXG4gICAgY29uc3RydWN0b3IocmVzb3VyY2VzOmFueSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLnJlc291cmNlcyA9IHJlc291cmNlcztcbiAgICAgICAgLy8gYmFja2dvcnVuZFxuICAgICAgICB0aGlzLnNjZW5lQmFja2dyb3VuZCA9IG5ldyBQSVhJLlNwcml0ZShyZXNvdXJjZXNbJ0JHJ10pO1xuICAgICAgICB0aGlzLmFkZENoaWxkKHRoaXMuc2NlbmVCYWNrZ3JvdW5kKTtcblxuICAgICAgICB0aGlzLndpbmxpbmUwID0gbmV3IFNpbXBsZVdpbkxpbmUodGhpcywgMCwgcmVzb3VyY2VzKTtcbiAgICAgICAgdGhpcy53aW5saW5lMSA9IG5ldyBTaW1wbGVXaW5MaW5lKHRoaXMsIDEsIHJlc291cmNlcyk7XG4gICAgICAgIHRoaXMud2lubGluZTIgPSBuZXcgU2ltcGxlV2luTGluZSh0aGlzLCAyLCByZXNvdXJjZXMpO1xuICAgICAgICB0aGlzLldpbkxpbmVzID0gW3RoaXMud2lubGluZTAsIHRoaXMud2lubGluZTEsIHRoaXMud2lubGluZTJdO1xuXG4gICAgICAgIC8vUmVlbHM7XG4gICAgICAgIHRoaXMuUkVFTFMgPSBuZXcgUmVlbFNwaW5uZXIodGhpcywgcmVzb3VyY2VzKTtcblxuICAgICAgICB0aGlzLnN0YXJ0QnV0dG9uID0gbmV3IEJ1dHRvbih0aGlzLCA4NzMsIDI2NywgJ1N0YXJ0QnV0dG9uJywgcmVzb3VyY2VzLCB0aGlzLm9uU3RhcnRCdXR0b24pO1xuICAgICAgICB0aGlzLnN0b3BCdXR0b24gPSBuZXcgQnV0dG9uKHRoaXMsIDg3MywgMjY3LCAnU3RvcEJ1dHRvbicsIHJlc291cmNlcywgdGhpcy5vblN0b3BCdXR0b24pO1xuXG4gICAgICAgIHRoaXMuYmFsYW5jZUZpZWxkID0gbmV3IEJhbGFuY2VGaWVsZFdpdGhIaWRlQ3JlZGl0c0FuaW1hdGlvbih0aGlzLCAnQmFsYW5jZUZpZWxkJywgNzY1LCA0NTUsIHJlc291cmNlcywgRm9udFN0eWxlcy5jb3VudGVyRm9udCk7XG4gICAgICAgIHRoaXMuYmFsYW5jZUZpZWxkLmZpZWxkQ29udGFpbmVyLnNjYWxlLnNldCgwLjUsIDEpOyAvLyB0aGlzIGFkZGVkIGNhdXNlIGFzc2V0cyB0YWtlbiBmcm9tIGFub3RlciBnYW1lIGFuZCBkb250IGZpdCB0aGUgc2l6ZVxuICAgICAgICB0aGlzLnRvdGFsV2luRmllbGQgPSBuZXcgTnVtZXJpY0ZpZWxkKHRoaXMsICdUb3RhbFdpbicsIDc2NSwgMCwgcmVzb3VyY2VzLCBGb250U3R5bGVzLmNvdW50ZXJGb250KTtcbiAgICAgICAgdGhpcy50b3RhbFdpbkZpZWxkLmZpZWxkQ29udGFpbmVyLnNjYWxlLnNldCgwLjUsIDEpO1xuXG4gICAgICAgIHRoaXMuaW50ZXJhY3RpdmUgPSB0cnVlO1xuICAgICAgICB0aGlzLm9uKCdwb2ludGVyZG93bicsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoQnV0dG9uRXZlbnRzLkNsaWNrZWRPbkJhc2VHYW1lU2NlbmUpO1xuICAgICAgICAgICAgbGV0IHNraXBXSW5zaG93ID0gbmV3IEN1c3RvbUV2ZW50KCdza2lwV2luU2hvdycpO1xuICAgICAgICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChza2lwV0luc2hvdyk7XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblN0YXJ0QnV0dG9uICgpIHtcbiAgICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChCdXR0b25FdmVudHMuU3RhcnRCdXR0b25QcmVzc2VkKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uU3RvcEJ1dHRvbiAoKSB7XG4gICAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoQnV0dG9uRXZlbnRzLlN0b3BCdXR0b25QcmVzc2VkKTtcbiAgICB9XG59XG4iLCIvKipcclxuICogQ3JlYXRlZCBieSB0YXJhc2cgb24gOS8yNS8yMDE3LlxyXG4gKi9cclxuXHJcblxyXG5leHBvcnQgY2xhc3MgU2NlbmVNYW5hZ2VyIHtcclxuICAgIHByaXZhdGUgY29udGFpbmVyczogYW55ID0ge307XHJcbiAgICBwdWJsaWMgY3VycmVudFNjZW5lOiBhbnk7IC8vUElYSS5Db250YWluZXJcclxuICAgIHB1YmxpYyBjdXJyZW50U2NlbmVJZDogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBhcHA6IFBJWEkuQXBwbGljYXRpb247XHJcblxyXG4gICAgY29uc3RydWN0b3IoYXBwOiBQSVhJLkFwcGxpY2F0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5hcHAgPSBhcHA7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIEFkZEdhbWVTY2VuZShpZDpzdHJpbmcsIGdhbWVTY2VuZTphbnkpIHtcclxuICAgICAgICB0aGlzLmNvbnRhaW5lcnNbaWRdID0gZ2FtZVNjZW5lO1xyXG4gICAgICAgIGdhbWVTY2VuZS52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5hcHAuc3RhZ2UuYWRkQ2hpbGQoZ2FtZVNjZW5lKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ29Ub0dhbWVTY2VuZShpZCkge1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRTY2VuZSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTY2VuZS52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY29udGFpbmVyc1tpZF0udmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50U2NlbmUgPSB0aGlzLmNvbnRhaW5lcnNbaWRdO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFNjZW5lSWQgPSBpZDtcclxuICAgIH1cclxuXHJcblxyXG59XHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IHRhcmFzZyBvbiA5LzI4LzIwMTcuXHJcbiAqL1xyXG5cclxuLy8gdGFyZ2V0ID0gaWQgb2YgaHRtbCBlbGVtZW50IG9yIHZhciBvZiBwcmV2aW91c2x5IHNlbGVjdGVkIGh0bWwgZWxlbWVudCB3aGVyZSBjb3VudGluZyBvY2N1cnNcclxuLy8gc3RhcnRWYWwgPSB0aGUgdmFsdWUgeW91IHdhbnQgdG8gYmVnaW4gYXRcclxuLy8gZW5kVmFsID0gdGhlIHZhbHVlIHlvdSB3YW50IHRvIGFycml2ZSBhdFxyXG4vLyBkZWNpbWFscyA9IG51bWJlciBvZiBkZWNpbWFsIHBsYWNlcywgZGVmYXVsdCAwXHJcbi8vIGR1cmF0aW9uID0gZHVyYXRpb24gb2YgYW5pbWF0aW9uIGluIHNlY29uZHMsIGRlZmF1bHQgMlxyXG4vLyBvcHRpb25zID0gb3B0aW9uYWwgb2JqZWN0IG9mIG9wdGlvbnMgKHNlZSBiZWxvdylcclxuXHJcbmV4cG9ydCB2YXIgQ291bnRVcCA9IGZ1bmN0aW9uKHRhcmdldCwgc3RhcnRWYWwsIGVuZFZhbCwgZGVjaW1hbHMsIGR1cmF0aW9uLCBvcHRpb25zKSB7XHJcblxyXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgc2VsZi52ZXJzaW9uID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJzEuOS4yJzsgfTtcclxuXHJcbiAgICAvLyBkZWZhdWx0IG9wdGlvbnNcclxuICAgIHNlbGYub3B0aW9ucyA9IHtcclxuICAgICAgICB1c2VFYXNpbmc6IHRydWUsIC8vIHRvZ2dsZSBlYXNpbmdcclxuICAgICAgICB1c2VHcm91cGluZzogdHJ1ZSwgLy8gMSwwMDAsMDAwIHZzIDEwMDAwMDBcclxuICAgICAgICBzZXBhcmF0b3I6ICcsJywgLy8gY2hhcmFjdGVyIHRvIHVzZSBhcyBhIHNlcGFyYXRvclxyXG4gICAgICAgIGRlY2ltYWw6ICcuJywgLy8gY2hhcmFjdGVyIHRvIHVzZSBhcyBhIGRlY2ltYWxcclxuICAgICAgICBlYXNpbmdGbjogZWFzZU91dEV4cG8sIC8vIG9wdGlvbmFsIGN1c3RvbSBlYXNpbmcgZnVuY3Rpb24sIGRlZmF1bHQgaXMgUm9iZXJ0IFBlbm5lcidzIGVhc2VPdXRFeHBvXHJcbiAgICAgICAgZm9ybWF0dGluZ0ZuOiBmb3JtYXROdW1iZXIsIC8vIG9wdGlvbmFsIGN1c3RvbSBmb3JtYXR0aW5nIGZ1bmN0aW9uLCBkZWZhdWx0IGlzIGZvcm1hdE51bWJlciBhYm92ZVxyXG4gICAgICAgIHByZWZpeDogJyQnLCAvLyBvcHRpb25hbCB0ZXh0IGJlZm9yZSB0aGUgcmVzdWx0XHJcbiAgICAgICAgc3VmZml4OiAnJywgLy8gb3B0aW9uYWwgdGV4dCBhZnRlciB0aGUgcmVzdWx0XHJcbiAgICAgICAgbnVtZXJhbHM6IFtdIC8vIG9wdGlvbmFsbHkgcGFzcyBhbiBhcnJheSBvZiBjdXN0b20gbnVtZXJhbHMgZm9yIDAtOVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBleHRlbmQgZGVmYXVsdCBvcHRpb25zIHdpdGggcGFzc2VkIG9wdGlvbnMgb2JqZWN0XHJcbiAgICBpZiAob3B0aW9ucyAmJiB0eXBlb2Ygb3B0aW9ucyA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gc2VsZi5vcHRpb25zKSB7XHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLmhhc093blByb3BlcnR5KGtleSkgJiYgb3B0aW9uc1trZXldICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLm9wdGlvbnNba2V5XSA9IG9wdGlvbnNba2V5XTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoc2VsZi5vcHRpb25zLnNlcGFyYXRvciA9PT0gJycpIHtcclxuICAgICAgICBzZWxmLm9wdGlvbnMudXNlR3JvdXBpbmcgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIC8vIGVuc3VyZSB0aGUgc2VwYXJhdG9yIGlzIGEgc3RyaW5nIChmb3JtYXROdW1iZXIgYXNzdW1lcyB0aGlzKVxyXG4gICAgICAgIHNlbGYub3B0aW9ucy5zZXBhcmF0b3IgPSAnJyArIHNlbGYub3B0aW9ucy5zZXBhcmF0b3I7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbWFrZSBzdXJlIHJlcXVlc3RBbmltYXRpb25GcmFtZSBhbmQgY2FuY2VsQW5pbWF0aW9uRnJhbWUgYXJlIGRlZmluZWRcclxuICAgIC8vIHBvbHlmaWxsIGZvciBicm93c2VycyB3aXRob3V0IG5hdGl2ZSBzdXBwb3J0XHJcbiAgICAvLyBieSBPcGVyYSBlbmdpbmVlciBFcmlrIE3DtmxsZXJcclxuICAgIHZhciBsYXN0VGltZSA9IDA7XHJcbiAgICB2YXIgdmVuZG9ycyA9IFsnd2Via2l0JywgJ21veicsICdtcycsICdvJ107XHJcbiAgICBmb3IodmFyIHggPSAwOyB4IDwgdmVuZG9ycy5sZW5ndGggJiYgIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU7ICsreCkge1xyXG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3dbdmVuZG9yc1t4XSsnUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ107XHJcbiAgICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gd2luZG93W3ZlbmRvcnNbeF0rJ0NhbmNlbEFuaW1hdGlvbkZyYW1lJ10gfHwgd2luZG93W3ZlbmRvcnNbeF0rJ0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZSddO1xyXG4gICAgfVxyXG4gICAgaWYgKCF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB7XHJcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIHZhciBjdXJyVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG4gICAgICAgICAgICB2YXIgdGltZVRvQ2FsbCA9IE1hdGgubWF4KDAsIDE2IC0gKGN1cnJUaW1lIC0gbGFzdFRpbWUpKTtcclxuICAgICAgICAgICAgdmFyIGlkID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IGNhbGxiYWNrKGN1cnJUaW1lICsgdGltZVRvQ2FsbCk7IH0sIHRpbWVUb0NhbGwpO1xyXG4gICAgICAgICAgICBsYXN0VGltZSA9IGN1cnJUaW1lICsgdGltZVRvQ2FsbDtcclxuICAgICAgICAgICAgcmV0dXJuIGlkO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICBpZiAoIXdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSkge1xyXG4gICAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uKGlkKSB7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChpZCk7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBmb3JtYXROdW1iZXIobnVtKSB7XHJcbiAgICAgICAgbnVtID0gbnVtLnRvRml4ZWQoc2VsZi5kZWNpbWFscyk7XHJcbiAgICAgICAgbnVtICs9ICcnO1xyXG4gICAgICAgIHZhciB4LCB4MSwgeDIsIHgzLCBpLCBsO1xyXG4gICAgICAgIHggPSBudW0uc3BsaXQoJy4nKTtcclxuICAgICAgICB4MSA9IHhbMF07XHJcbiAgICAgICAgeDIgPSB4Lmxlbmd0aCA+IDEgPyBzZWxmLm9wdGlvbnMuZGVjaW1hbCArIHhbMV0gOiAnJztcclxuICAgICAgICBpZiAoc2VsZi5vcHRpb25zLnVzZUdyb3VwaW5nKSB7XHJcbiAgICAgICAgICAgIHgzID0gJyc7XHJcbiAgICAgICAgICAgIGZvciAoaSA9IDAsIGwgPSB4MS5sZW5ndGg7IGkgPCBsOyArK2kpIHtcclxuICAgICAgICAgICAgICAgIGlmIChpICE9PSAwICYmICgoaSAlIDMpID09PSAwKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHgzID0gc2VsZi5vcHRpb25zLnNlcGFyYXRvciArIHgzO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgeDMgPSB4MVtsIC0gaSAtIDFdICsgeDM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgeDEgPSB4MztcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gb3B0aW9uYWwgbnVtZXJhbCBzdWJzdGl0dXRpb25cclxuICAgICAgICBpZiAoc2VsZi5vcHRpb25zLm51bWVyYWxzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB4MSA9IHgxLnJlcGxhY2UoL1swLTldL2csIGZ1bmN0aW9uKHcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLm9wdGlvbnMubnVtZXJhbHNbK3ddO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB4MiA9IHgyLnJlcGxhY2UoL1swLTldL2csIGZ1bmN0aW9uKHcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLm9wdGlvbnMubnVtZXJhbHNbK3ddO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc2VsZi5vcHRpb25zLnByZWZpeCArIHgxICsgeDIgKyBzZWxmLm9wdGlvbnMuc3VmZml4O1xyXG4gICAgfVxyXG4gICAgLy8gUm9iZXJ0IFBlbm5lcidzIGVhc2VPdXRFeHBvXHJcbiAgICBmdW5jdGlvbiBlYXNlT3V0RXhwbyh0LCBiLCBjLCBkKSB7XHJcbiAgICAgICAgcmV0dXJuIGMgKiAoLU1hdGgucG93KDIsIC0xMCAqIHQgLyBkKSArIDEpICogMTAyNCAvIDEwMjMgKyBiO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gZW5zdXJlTnVtYmVyKG4pIHtcclxuICAgICAgICByZXR1cm4gKHR5cGVvZiBuID09PSAnbnVtYmVyJyAmJiAhaXNOYU4obikpO1xyXG4gICAgfVxyXG5cclxuICAgIHNlbGYuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChzZWxmLmluaXRpYWxpemVkKSByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICAgICAgc2VsZi5lcnJvciA9ICcnO1xyXG4gICAgICAgIHNlbGYuZCA9ICh0eXBlb2YgdGFyZ2V0ID09PSAnc3RyaW5nJykgPyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0YXJnZXQpIDogdGFyZ2V0O1xyXG4gICAgICAgIGlmICghc2VsZi5kKSB7XHJcbiAgICAgICAgICAgIHNlbGYuZXJyb3IgPSAnW0NvdW50VXBdIHRhcmdldCBpcyBudWxsIG9yIHVuZGVmaW5lZCdcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzZWxmLnN0YXJ0VmFsID0gTnVtYmVyKHN0YXJ0VmFsKTtcclxuICAgICAgICBzZWxmLmVuZFZhbCA9IE51bWJlcihlbmRWYWwpO1xyXG4gICAgICAgIC8vIGVycm9yIGNoZWNrc1xyXG4gICAgICAgIGlmIChlbnN1cmVOdW1iZXIoc2VsZi5zdGFydFZhbCkgJiYgZW5zdXJlTnVtYmVyKHNlbGYuZW5kVmFsKSkge1xyXG4gICAgICAgICAgICBzZWxmLmRlY2ltYWxzID0gTWF0aC5tYXgoMCwgZGVjaW1hbHMgfHwgMCk7XHJcbiAgICAgICAgICAgIHNlbGYuZGVjID0gTWF0aC5wb3coMTAsIHNlbGYuZGVjaW1hbHMpO1xyXG4gICAgICAgICAgICBzZWxmLmR1cmF0aW9uID0gTnVtYmVyKGR1cmF0aW9uKSAqIDEwMDAgfHwgMjAwMDtcclxuICAgICAgICAgICAgc2VsZi5jb3VudERvd24gPSAoc2VsZi5zdGFydFZhbCA+IHNlbGYuZW5kVmFsKTtcclxuICAgICAgICAgICAgc2VsZi5mcmFtZVZhbCA9IHNlbGYuc3RhcnRWYWw7XHJcbiAgICAgICAgICAgIHNlbGYuaW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHNlbGYuZXJyb3IgPSAnW0NvdW50VXBdIHN0YXJ0VmFsICgnK3N0YXJ0VmFsKycpIG9yIGVuZFZhbCAoJytlbmRWYWwrJykgaXMgbm90IGEgbnVtYmVyJztcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8gUHJpbnQgdmFsdWUgdG8gdGFyZ2V0XHJcbiAgICBzZWxmLnByaW50VmFsdWUgPSBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgIHZhciByZXN1bHQgPSBzZWxmLm9wdGlvbnMuZm9ybWF0dGluZ0ZuKHZhbHVlKTtcclxuXHJcbiAgICAgICAgaWYgKHNlbGYuZC50YWdOYW1lID09PSAnSU5QVVQnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZC52YWx1ZSA9IHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoc2VsZi5kLnRhZ05hbWUgPT09ICd0ZXh0JyB8fCBzZWxmLmQudGFnTmFtZSA9PT0gJ3RzcGFuJykge1xyXG4gICAgICAgICAgICB0aGlzLmQudGV4dENvbnRlbnQgPSByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmQuaW5uZXJIVE1MID0gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBzZWxmLmQudGV4dCA9IHJlc3VsdDtcclxuICAgIH07XHJcblxyXG4gICAgc2VsZi5jb3VudCA9IGZ1bmN0aW9uKHRpbWVzdGFtcCkge1xyXG5cclxuICAgICAgICBpZiAoIXNlbGYuc3RhcnRUaW1lKSB7IHNlbGYuc3RhcnRUaW1lID0gdGltZXN0YW1wOyB9XHJcblxyXG4gICAgICAgIHNlbGYudGltZXN0YW1wID0gdGltZXN0YW1wO1xyXG4gICAgICAgIHZhciBwcm9ncmVzcyA9IHRpbWVzdGFtcCAtIHNlbGYuc3RhcnRUaW1lO1xyXG4gICAgICAgIHNlbGYucmVtYWluaW5nID0gc2VsZi5kdXJhdGlvbiAtIHByb2dyZXNzO1xyXG5cclxuICAgICAgICAvLyB0byBlYXNlIG9yIG5vdCB0byBlYXNlXHJcbiAgICAgICAgaWYgKHNlbGYub3B0aW9ucy51c2VFYXNpbmcpIHtcclxuICAgICAgICAgICAgaWYgKHNlbGYuY291bnREb3duKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmZyYW1lVmFsID0gc2VsZi5zdGFydFZhbCAtIHNlbGYub3B0aW9ucy5lYXNpbmdGbihwcm9ncmVzcywgMCwgc2VsZi5zdGFydFZhbCAtIHNlbGYuZW5kVmFsLCBzZWxmLmR1cmF0aW9uKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuZnJhbWVWYWwgPSBzZWxmLm9wdGlvbnMuZWFzaW5nRm4ocHJvZ3Jlc3MsIHNlbGYuc3RhcnRWYWwsIHNlbGYuZW5kVmFsIC0gc2VsZi5zdGFydFZhbCwgc2VsZi5kdXJhdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoc2VsZi5jb3VudERvd24pIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuZnJhbWVWYWwgPSBzZWxmLnN0YXJ0VmFsIC0gKChzZWxmLnN0YXJ0VmFsIC0gc2VsZi5lbmRWYWwpICogKHByb2dyZXNzIC8gc2VsZi5kdXJhdGlvbikpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5mcmFtZVZhbCA9IHNlbGYuc3RhcnRWYWwgKyAoc2VsZi5lbmRWYWwgLSBzZWxmLnN0YXJ0VmFsKSAqIChwcm9ncmVzcyAvIHNlbGYuZHVyYXRpb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBkb24ndCBnbyBwYXN0IGVuZFZhbCBzaW5jZSBwcm9ncmVzcyBjYW4gZXhjZWVkIGR1cmF0aW9uIGluIHRoZSBsYXN0IGZyYW1lXHJcbiAgICAgICAgaWYgKHNlbGYuY291bnREb3duKSB7XHJcbiAgICAgICAgICAgIHNlbGYuZnJhbWVWYWwgPSAoc2VsZi5mcmFtZVZhbCA8IHNlbGYuZW5kVmFsKSA/IHNlbGYuZW5kVmFsIDogc2VsZi5mcmFtZVZhbDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzZWxmLmZyYW1lVmFsID0gKHNlbGYuZnJhbWVWYWwgPiBzZWxmLmVuZFZhbCkgPyBzZWxmLmVuZFZhbCA6IHNlbGYuZnJhbWVWYWw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBkZWNpbWFsXHJcbiAgICAgICAgc2VsZi5mcmFtZVZhbCA9IE1hdGgucm91bmQoc2VsZi5mcmFtZVZhbCpzZWxmLmRlYykvc2VsZi5kZWM7XHJcblxyXG4gICAgICAgIC8vIGZvcm1hdCBhbmQgcHJpbnQgdmFsdWVcclxuICAgICAgICBzZWxmLnByaW50VmFsdWUoc2VsZi5mcmFtZVZhbCk7XHJcblxyXG4gICAgICAgIC8vIHdoZXRoZXIgdG8gY29udGludWVcclxuICAgICAgICBpZiAocHJvZ3Jlc3MgPCBzZWxmLmR1cmF0aW9uKSB7XHJcbiAgICAgICAgICAgIHNlbGYuckFGID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHNlbGYuY291bnQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChzZWxmLmNhbGxiYWNrKSBzZWxmLmNhbGxiYWNrKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8vIHN0YXJ0IHlvdXIgYW5pbWF0aW9uXHJcbiAgICBzZWxmLnN0YXJ0ID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcclxuICAgICAgICBpZiAoIXNlbGYuaW5pdGlhbGl6ZSgpKSByZXR1cm47XHJcbiAgICAgICAgc2VsZi5jYWxsYmFjayA9IGNhbGxiYWNrO1xyXG4gICAgICAgIHNlbGYuckFGID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHNlbGYuY291bnQpO1xyXG4gICAgfTtcclxuICAgIC8vIHRvZ2dsZXMgcGF1c2UvcmVzdW1lIGFuaW1hdGlvblxyXG4gICAgc2VsZi5wYXVzZVJlc3VtZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICghc2VsZi5wYXVzZWQpIHtcclxuICAgICAgICAgICAgc2VsZi5wYXVzZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZShzZWxmLnJBRik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc2VsZi5wYXVzZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgZGVsZXRlIHNlbGYuc3RhcnRUaW1lO1xyXG4gICAgICAgICAgICBzZWxmLmR1cmF0aW9uID0gc2VsZi5yZW1haW5pbmc7XHJcbiAgICAgICAgICAgIHNlbGYuc3RhcnRWYWwgPSBzZWxmLmZyYW1lVmFsO1xyXG4gICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoc2VsZi5jb3VudCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8vIHJlc2V0IHRvIHN0YXJ0VmFsIHNvIGFuaW1hdGlvbiBjYW4gYmUgcnVuIGFnYWluXHJcbiAgICBzZWxmLnJlc2V0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgc2VsZi5wYXVzZWQgPSBmYWxzZTtcclxuICAgICAgICBkZWxldGUgc2VsZi5zdGFydFRpbWU7XHJcbiAgICAgICAgc2VsZi5pbml0aWFsaXplZCA9IGZhbHNlO1xyXG4gICAgICAgIGlmIChzZWxmLmluaXRpYWxpemUoKSkge1xyXG4gICAgICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZShzZWxmLnJBRik7XHJcbiAgICAgICAgICAgIHNlbGYucHJpbnRWYWx1ZShzZWxmLnN0YXJ0VmFsKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLy8gcGFzcyBhIG5ldyBlbmRWYWwgYW5kIHN0YXJ0IGFuaW1hdGlvblxyXG4gICAgc2VsZi51cGRhdGUgPSBmdW5jdGlvbiAobmV3RW5kVmFsKSB7XHJcbiAgICAgICAgaWYgKCFzZWxmLmluaXRpYWxpemUoKSkgcmV0dXJuO1xyXG4gICAgICAgIG5ld0VuZFZhbCA9IE51bWJlcihuZXdFbmRWYWwpO1xyXG4gICAgICAgIGlmICghZW5zdXJlTnVtYmVyKG5ld0VuZFZhbCkpIHtcclxuICAgICAgICAgICAgc2VsZi5lcnJvciA9ICdbQ291bnRVcF0gdXBkYXRlKCkgLSBuZXcgZW5kVmFsIGlzIG5vdCBhIG51bWJlcjogJytuZXdFbmRWYWw7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2VsZi5lcnJvciA9ICcnO1xyXG4gICAgICAgIGlmIChuZXdFbmRWYWwgPT09IHNlbGYuZnJhbWVWYWwpIHJldHVybjtcclxuICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZShzZWxmLnJBRik7XHJcbiAgICAgICAgc2VsZi5wYXVzZWQgPSBmYWxzZTtcclxuICAgICAgICBkZWxldGUgc2VsZi5zdGFydFRpbWU7XHJcbiAgICAgICAgc2VsZi5zdGFydFZhbCA9IHNlbGYuZnJhbWVWYWw7XHJcbiAgICAgICAgc2VsZi5lbmRWYWwgPSBuZXdFbmRWYWw7XHJcbiAgICAgICAgc2VsZi5jb3VudERvd24gPSAoc2VsZi5zdGFydFZhbCA+IHNlbGYuZW5kVmFsKTtcclxuICAgICAgICBzZWxmLnJBRiA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShzZWxmLmNvdW50KTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gZm9ybWF0IHN0YXJ0VmFsIG9uIGluaXRpYWxpemF0aW9uXHJcbiAgICBpZiAoc2VsZi5pbml0aWFsaXplKCkpIHNlbGYucHJpbnRWYWx1ZShzZWxmLnN0YXJ0VmFsKTtcclxufTtcclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgdGFyYXNnIG9uIDkvMjgvMjAxNy5cclxuICovXHJcblxyXG5leHBvcnQgbGV0IEZvbnRTdHlsZXMgPSB7XHJcbiAgICAnY291bnRlckZvbnQnIDogbmV3IFBJWEkuVGV4dFN0eWxlKHtcclxuICAgICAgICBmb250RmFtaWx5OiAnQXJpYWwnLFxyXG4gICAgICAgIGZvbnRTaXplOiAzNixcclxuICAgICAgICBmb250U3R5bGU6ICdpdGFsaWMnLFxyXG4gICAgICAgIGZvbnRXZWlnaHQ6ICdib2xkJyxcclxuICAgICAgICBmaWxsOiBbJyNGRjNEMEQnLCAnI0ZGQ0MxMSddLCAvLyBncmFkaWVudFxyXG4gICAgICAgIHN0cm9rZTogJyM0YTE4NTAnLFxyXG4gICAgICAgIHN0cm9rZVRoaWNrbmVzczogNSxcclxuICAgICAgICBkcm9wU2hhZG93OiBmYWxzZSxcclxuICAgICAgICBkcm9wU2hhZG93Q29sb3I6ICcjMDAwMDAwJyxcclxuICAgICAgICBkcm9wU2hhZG93Qmx1cjogNCxcclxuICAgICAgICBkcm9wU2hhZG93QW5nbGU6IE1hdGguUEkgLyA2LFxyXG4gICAgICAgIGRyb3BTaGFkb3dEaXN0YW5jZTogNixcclxuICAgICAgICB3b3JkV3JhcDogdHJ1ZSxcclxuICAgICAgICB3b3JkV3JhcFdpZHRoOiA0NDBcclxuICAgIH0pLFxyXG4gICAgJ3Bvc3NpYmxlV2luY291bnRlckZvbnQnIDogbmV3IFBJWEkuVGV4dFN0eWxlKHtcclxuICAgICAgICBmb250RmFtaWx5OiAnQXJpYWwnLFxyXG4gICAgICAgIGZvbnRTaXplOiAzNixcclxuICAgICAgICBmb250U3R5bGU6ICdpdGFsaWMnLFxyXG4gICAgICAgIGZvbnRXZWlnaHQ6ICdib2xkJyxcclxuICAgICAgICBmaWxsOiBbJyNmOGY4ZmYnLCAnI2Y4ZjhmZiddLCAvLyBncmFkaWVudFxyXG4gICAgICAgIHN0cm9rZTogJyM0YTE4NTAnLFxyXG4gICAgICAgIHN0cm9rZVRoaWNrbmVzczogNSxcclxuICAgICAgICBkcm9wU2hhZG93OiBmYWxzZSxcclxuICAgICAgICBkcm9wU2hhZG93Q29sb3I6ICcjMDAwMDAwJyxcclxuICAgICAgICBkcm9wU2hhZG93Qmx1cjogNCxcclxuICAgICAgICBkcm9wU2hhZG93QW5nbGU6IE1hdGguUEkgLyA2LFxyXG4gICAgICAgIGRyb3BTaGFkb3dEaXN0YW5jZTogNixcclxuICAgICAgICB3b3JkV3JhcDogdHJ1ZSxcclxuICAgICAgICB3b3JkV3JhcFdpZHRoOiA0NDBcclxuICAgIH0pLFxyXG4gICAgJ3N0YWtlRm9udCc6IG5ldyBQSVhJLlRleHRTdHlsZSh7XHJcbiAgICAgICAgZm9udEZhbWlseTogJ0FyaWFsJyxcclxuICAgICAgICBmb250U2l6ZTogMjQsXHJcbiAgICAgICAgZm9udFN0eWxlOiAnaXRhbGljJyxcclxuICAgICAgICBmb250V2VpZ2h0OiAnYm9sZCcsXHJcbiAgICAgICAgZmlsbDogWycjRkYzRDBEJywgJyNGRkNDMTEnXSwgLy8gZ3JhZGllbnRcclxuICAgICAgICBzdHJva2U6ICcjNGExODUwJyxcclxuICAgICAgICBzdHJva2VUaGlja25lc3M6IDUsXHJcbiAgICAgICAgZHJvcFNoYWRvdzogZmFsc2UsXHJcbiAgICAgICAgZHJvcFNoYWRvd0NvbG9yOiAnIzAwMDAwMCcsXHJcbiAgICAgICAgZHJvcFNoYWRvd0JsdXI6IDQsXHJcbiAgICAgICAgZHJvcFNoYWRvd0FuZ2xlOiBNYXRoLlBJIC8gNixcclxuICAgICAgICBkcm9wU2hhZG93RGlzdGFuY2U6IDYsXHJcbiAgICAgICAgd29yZFdyYXA6IHRydWUsXHJcbiAgICAgICAgd29yZFdyYXBXaWR0aDogNDQwXHJcbiAgICB9KSxcclxuICAgICdHYW1ibGVUZXh0JyA6IG5ldyBQSVhJLlRleHRTdHlsZSh7XHJcbiAgICAgICAgZm9udEZhbWlseTogJ0FyaWFsJyxcclxuICAgICAgICBmb250U2l6ZTogMzYsXHJcbiAgICAgICAgZm9udFN0eWxlOiAnaXRhbGljJyxcclxuICAgICAgICBmb250V2VpZ2h0OiAnYm9sZCcsXHJcbiAgICAgICAgZmlsbDogWycjZjhmOGZmJywgJyNmOGY4ZmYnXSwgLy8gZ3JhZGllbnRcclxuICAgICAgICBzdHJva2U6ICcjNGExODUwJyxcclxuICAgICAgICBzdHJva2VUaGlja25lc3M6IDUsXHJcbiAgICAgICAgZHJvcFNoYWRvdzogZmFsc2UsXHJcbiAgICAgICAgZHJvcFNoYWRvd0NvbG9yOiAnIzAwMDAwMCcsXHJcbiAgICAgICAgZHJvcFNoYWRvd0JsdXI6IDQsXHJcbiAgICAgICAgZHJvcFNoYWRvd0FuZ2xlOiBNYXRoLlBJIC8gNixcclxuICAgICAgICBkcm9wU2hhZG93RGlzdGFuY2U6IDYsXHJcbiAgICAgICAgd29yZFdyYXA6IHRydWUsXHJcbiAgICAgICAgd29yZFdyYXBXaWR0aDogNDQwXHJcbiAgICB9KSxcclxuICAgICdCb251c0NvdW50ZXJGb250JyA6IG5ldyBQSVhJLlRleHRTdHlsZSh7XHJcbiAgICAgICAgZm9udEZhbWlseTogJ0FyaWFsJyxcclxuICAgICAgICBmb250U2l6ZTogNjAsXHJcbiAgICAgICAgZm9udFdlaWdodDogJ2JvbGQnLFxyXG4gICAgICAgIGZpbGw6IFsnI0ZGM0QwRCcsICcjRkZDQzExJ10sIC8vIGdyYWRpZW50XHJcbiAgICAgICAgc3Ryb2tlOiAnIzRhMTg1MCcsXHJcbiAgICAgICAgc3Ryb2tlVGhpY2tuZXNzOiA1LFxyXG4gICAgICAgIGRyb3BTaGFkb3c6IGZhbHNlLFxyXG4gICAgICAgIGRyb3BTaGFkb3dDb2xvcjogJyMwMDAwMDAnLFxyXG4gICAgICAgIGRyb3BTaGFkb3dCbHVyOiA0LFxyXG4gICAgICAgIGRyb3BTaGFkb3dBbmdsZTogTWF0aC5QSSAvIDYsXHJcbiAgICAgICAgZHJvcFNoYWRvd0Rpc3RhbmNlOiA2LFxyXG4gICAgICAgIHdvcmRXcmFwOiB0cnVlLFxyXG4gICAgICAgIHdvcmRXcmFwV2lkdGg6IDQ0MFxyXG4gICAgfSksXHJcbiAgICAnQm9udXNGaW5hbENvdW50ZXJGb250JyA6IG5ldyBQSVhJLlRleHRTdHlsZSh7XHJcbiAgICAgICAgZm9udEZhbWlseTogJ0FyaWFsJyxcclxuICAgICAgICBmb250U2l6ZTogMjAwLFxyXG4gICAgICAgIGZvbnRXZWlnaHQ6ICdib2xkJyxcclxuICAgICAgICBmaWxsOiBbJyNGRjNEMEQnLCAnI0ZGQ0MxMSddLCAvLyBncmFkaWVudFxyXG4gICAgICAgIHN0cm9rZTogJyM0YTE4NTAnLFxyXG4gICAgICAgIHN0cm9rZVRoaWNrbmVzczogNSxcclxuICAgICAgICBkcm9wU2hhZG93OiBmYWxzZSxcclxuICAgICAgICBkcm9wU2hhZG93Q29sb3I6ICcjMDAwMDAwJyxcclxuICAgICAgICBkcm9wU2hhZG93Qmx1cjogNCxcclxuICAgICAgICBkcm9wU2hhZG93QW5nbGU6IE1hdGguUEkgLyA2LFxyXG4gICAgICAgIGRyb3BTaGFkb3dEaXN0YW5jZTogNixcclxuICAgICAgICB3b3JkV3JhcDogdHJ1ZSxcclxuICAgICAgICB3b3JkV3JhcFdpZHRoOiA0NDBcclxuICAgIH0pLFxyXG59OyIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IHRhcmFzZyBvbiA5LzI5LzIwMTcuXHJcbiAqL1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG5leHRJdGVtKGFyciwgaSkge1xyXG4gICAgaSA9IGkgKyAxO1xyXG4gICAgaSA9IGkgJSBhcnIubGVuZ3RoO1xyXG4gICAgcmV0dXJuIGFycltpXTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHByZXZJdGVtKGFyciwgaSkge1xyXG4gICAgaWYgKGkgPT09IDApIHtcclxuICAgICAgICBpID0gYXJyLmxlbmd0aDtcclxuICAgIH1cclxuICAgIGkgPSBpIC0gMTtcclxuICAgIHJldHVybiBhcnJbaV07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRTdGFrZUFtb3VudChzdGFrZTogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgIGlmIChzdGFrZSA8IDEwMCl7XHJcbiAgICAgICAgcmV0dXJuICcwLicrc3Rha2UrJ3AnO1xyXG4gICAgfSBlbHNlIGlmKCBzdGFrZSA+PSAxMDApe1xyXG4gICAgICAgIGxldCB4ID0gc3Rha2UvMTAwO1xyXG4gICAgICAgIHJldHVybiAnJCcrcGFyc2VGbG9hdCh4LnRvU3RyaW5nKCkpLnRvRml4ZWQoMik7XHJcbiAgICB9XHJcbn1cclxuXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gQ3JlYXRlQW5pbWF0aW9uKGJhc2VUZXh0dXJlLCBvYmopIHtcclxuICAgIGxldCBsZW4gPSBvYmoubGVuZ3RoLFxyXG4gICAgICAgIHRleHR1cmVfYXJyYXkgPSBbXTtcclxuXHJcbiAgICBmb3IgKGxldCBpPTA7IGk8bGVuO2krKylcclxuICAgIHtcclxuICAgICAgICBsZXQgZnJhbWUgPSBvYmpbaV0sXHJcbiAgICAgICAgICAgIHJlY3QgPSBuZXcgUElYSS5SZWN0YW5nbGUoZnJhbWUueCwgZnJhbWUueSwgZnJhbWUud2lkdGgsIGZyYW1lLmhlaWdodCksXHJcbiAgICAgICAgICAgIHRleHR1cmUgPSBuZXcgUElYSS5UZXh0dXJlKGJhc2VUZXh0dXJlLCByZWN0KTtcclxuICAgICAgICB0ZXh0dXJlX2FycmF5LnB1c2goe3RleHR1cmU6dGV4dHVyZSwgdGltZTo2Nn0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ldyBQSVhJLmV4dHJhcy5BbmltYXRlZFNwcml0ZSh0ZXh0dXJlX2FycmF5KTtcclxufSIsImltcG9ydCAqIGFzIFNjZW5lcyBmcm9tIFwiLi9TY2VuZXMvR2FtZVNjZW5lc1wiO1xyXG5pbXBvcnQge1NjZW5lTWFuYWdlcn0gZnJvbSBcIi4vU2NlbmVzL1NjZW5lc01hbmFnZXJcIjtcclxuaW1wb3J0IHtCYXNlR2FtZUNvbnRyb2xsZXJ9IGZyb20gXCIuL0NvbnRyb2xsZXJzL0Jhc2VHYW1lXCI7XHJcbmltcG9ydCB7U291bmRzTWFuYWdlckNsYXNzfSBmcm9tIFwiLi9Tb3VuZHMvc291bmRzXCI7XHJcblxyXG5sZXQgYXBwU2l6ZSA9IFs5NjAsIDUzNl1cclxuZXhwb3J0IGNvbnN0IGFwcDogUElYSS5BcHBsaWNhdGlvbiA9IG5ldyBQSVhJLkFwcGxpY2F0aW9uKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xyXG5leHBvcnQgbGV0IFNDRU5FX01BTkFHRVIgPSBuZXcgU2NlbmVNYW5hZ2VyKGFwcCk7XHJcbmV4cG9ydCBsZXQgU291bmRzTWFuYWdlcjtcclxuZXhwb3J0IGxldCBiYXNlR2FtZVNjZW5lO1xyXG5leHBvcnQgbGV0IGJhc2VHYW1lQ29udHJvbGxlcjtcclxuXHJcbmNvbnN0IGxvYWRlciA9IFBJWEkubG9hZGVyOyAvLyBQaXhpSlMgZXhwb3NlcyBhIHByZW1hZGUgaW5zdGFuY2UgZm9yIHlvdSB0byB1c2UuXHJcblxyXG5sb2FkZXJcclxuICAgIC5hZGQoJ3NoZWV0JywgJy4uL01lZGlhL3Nwcml0ZXMuanNvbicpXHJcblxyXG5sb2FkZXIubG9hZCgobG9hZGVyLCByZXNvdXJjZXMpID0+IHtcclxuICAgIC8vIHJlc291cmNlcyBpcyBhbiBvYmplY3Qgd2hlcmUgdGhlIGtleSBpcyB0aGUgbmFtZSBvZiB0aGUgcmVzb3VyY2UgbG9hZGVkIGFuZCB0aGUgdmFsdWUgaXMgdGhlIHJlc291cmNlIG9iamVjdC5cclxuICAgIC8vIFRoZXkgaGF2ZSBhIGNvdXBsZSBkZWZhdWx0IHByb3BlcnRpZXM6XHJcbiAgICAvLyAtIGB1cmxgOiBUaGUgVVJMIHRoYXQgdGhlIHJlc291cmNlIHdhcyBsb2FkZWQgZnJvbVxyXG4gICAgLy8gLSBgZXJyb3JgOiBUaGUgZXJyb3IgdGhhdCBoYXBwZW5lZCB3aGVuIHRyeWluZyB0byBsb2FkIChpZiBhbnkpXHJcbiAgICAvLyAtIGBkYXRhYDogVGhlIHJhdyBkYXRhIHRoYXQgd2FzIGxvYWRlZFxyXG4gICAgLy8gYWxzbyBtYXkgY29udGFpbiBvdGhlciBwcm9wZXJ0aWVzIGJhc2VkIG9uIHRoZSBtaWRkbGV3YXJlIHRoYXQgcnVucy5cclxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYXBwLnZpZXcpO1xyXG5cclxuICAgIGxldCB0ZXh0dXJlcyA9IGxvYWRlci5yZXNvdXJjZXMuc2hlZXQudGV4dHVyZXM7XHJcblxyXG4gICAgLy8gU291bmRzTWFuYWdlciA9IG5ldyBTb3VuZHNNYW5hZ2VyQ2xhc3MocmVzb3VyY2VzKTtcclxuXHJcbiAgICBiYXNlR2FtZVNjZW5lID0gbmV3IFNjZW5lcy5CYXNlR2FtZVNjZW5lKHRleHR1cmVzKTtcclxuICAgIFNDRU5FX01BTkFHRVIuQWRkR2FtZVNjZW5lKCdiYXNlR2FtZScsIGJhc2VHYW1lU2NlbmUpO1xyXG4gICAgYmFzZUdhbWVDb250cm9sbGVyID0gbmV3IEJhc2VHYW1lQ29udHJvbGxlcihiYXNlR2FtZVNjZW5lKTtcclxuXHJcbiAgICBTQ0VORV9NQU5BR0VSLmdvVG9HYW1lU2NlbmUoJ2Jhc2VHYW1lJyk7XHJcblxyXG4gICAgaGlkZVNwbGFzaCgpO1xyXG5cclxufSk7XHJcblxyXG5cclxuZnVuY3Rpb24gaGlkZVNwbGFzaCgpOiB2b2lkIHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcGluJykuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgIGxldCBzcGxhc2ggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3BsYXNoJyk7XHJcbiAgICBsZXQgc2NhbGVBcnJheSA9IGdldFNjYWxlQXJyYXkoKVxyXG4gICAgYXBwLnN0YWdlLnNjYWxlLnNldChzY2FsZUFycmF5WzBdLCBzY2FsZUFycmF5WzFdKVxyXG4gICAgc3BsYXNoLmNsYXNzTmFtZSA9J3NwbGFzaEZhZGVPdXQnO1xyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgc3BsYXNoLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICB9LCAxMDAwKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0U2NhbGVBcnJheSgpOiBudW1iZXJbXSB7XHJcbiAgICBsZXQgcmVzdWx0ID0gW107XHJcbiAgICByZXN1bHRbMF0gPSB3aW5kb3cuaW5uZXJXaWR0aC9hcHBTaXplWzBdXHJcbiAgICByZXN1bHRbMV0gPSB3aW5kb3cuaW5uZXJIZWlnaHQvYXBwU2l6ZVsxXVxyXG4gICAgcmV0dXJuIHJlc3VsdFxyXG59XHJcbiJdfQ==
