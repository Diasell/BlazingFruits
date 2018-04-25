/**
 * Created by tarasg on 10/11/2017.
 */
// import {Button} from "../Layout/Buttons";
import {BaseGameScene} from "../Scenes/GameScenes";
import {formatStakeAmount, nextItem} from "../Utils/helperFuncs";
import {SCENE_MANAGER} from "../main";
import {response} from "../ReelSpinner/reelsConfig";
import {WinShowController} from "./WinShow";
// import {ButtonEvents} from "../Events/ButtonEvents";
// import {FontStyles} from "../Utils/fontStyles";
// import {app, baseGameScene, bonusGameScene, SCENE_MANAGER} from "../main"
// import {LineObject} from "../Bonus/LineObject";

declare let GDKWrapper: any;



export class BaseGameController {

    private scene: BaseGameScene;
    public state: string;
    public buttonStates: any;
    public balance: number = 10000;
    public totalWin: number = 100;
    public currentStake: number = 100;
    public stakes: number[];
    public WinShowController: WinShowController;

    private onStartButton: any;
    private onReelsStop: any;
    private onSlamOut: any;
    private onStakeButton: any;
    private onChangeStake: any;
    private onMaxBet: any;
    private onGamble: any;


    constructor(scene: BaseGameScene) {
        this.scene = scene;
        this.WinShowController = new WinShowController(scene);

        this.scene.balanceField.addValue(this.balance);
        // this.stakes = scene.stakeButton.stakes;
        this.buttonStates = {
            'idle' : [
                {'button': this.scene.startButton, 'state': 'enable'},
                {'button': this.scene.stopButton, 'state': 'hide'},
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
                {'button': this.scene.startButton, 'state': 'hide'},
                {'button': this.scene.stopButton, 'state': 'enable'},
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
                {'button': this.scene.startButton, 'state': 'hide'},
                {'button': this.scene.stopButton, 'state': 'hide'},
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

        this.onStartButton = function(){
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

    public setState(state:string) {
        this.state = state;

        if (state == 'idle') {
            this.enableWinLineButtons();
        } else {
            this.disableWinLineButtons();
        }
        // set button states:
        let buttonState = this.buttonStates[this.state];
        for (let i=0; i<buttonState.length; i++) {
            if (buttonState[i].state == 'enable'){
                buttonState[i].button.enable();
            } else if (buttonState[i].state == 'disable'){
                buttonState[i].button.disable();
            } else if (buttonState[i].state == 'hide'){
                buttonState[i].button.hide();
            }
        }
    }


    private addEventListeners() {
        document.addEventListener('StartButtonPressed', this.onStartButton);
        document.addEventListener('LastReelStopped', this.onReelsStop);
        document.addEventListener('StopButtonPressed', this.onSlamOut);
        document.addEventListener('BetButtonPressed',this.onStakeButton);
        document.addEventListener('changeStakeEvent', this.onChangeStake);
        document.addEventListener('MaxBetButtonPressed', this.onMaxBet);
        document.addEventListener('GambleButtonPressed', this.onGamble);
        document.addEventListener('MenuButtonPressed', function () {
            window.close()
        });
        document.addEventListener('StartBonusButtonPressed', function () {
            // SCENE_MANAGER.goToGameScene('bonusGame');
            // bonusController.startBonus();
        });
        document.addEventListener('HelpButtonPressed', function () {
            SCENE_MANAGER.goToGameScene('mainHelp');
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

        document.addEventListener('CollectButtonPressed', function(){
            this.onCollect();
        }.bind(this));
    }

    private removeEventListeners() {
        document.removeEventListener('StartButtonPressed', this.onStartButton)

    }

    private onSlamOutFunc(){
        this.scene.REELS.slamout();
    }

    private onStartButtonFunc(){
        this.setState('round');
        this.scene.totalWinField.counter.reset();
        this.balance -= this.currentStake;
        this.scene.balanceField.substractValue(this.currentStake);
        this.WinShowController.updatePayouts(response);
        this.totalWin = response.data.gameData.totalWinAmount;
        let stops = this.getStopsArray(response);
        this.scene.REELS.spin(stops);
    }

    private getStopsArray(roundResponse): number[][] {
        let symbolUpdates = roundResponse.data.gameData.playStack[0].lastPlayInModeData.slotsData.actions[0].transforms[0].symbolUpdates,
            result = [[],[],[],[],[]];
        for (let i=0; i< symbolUpdates.length; i++) {
            result[symbolUpdates[i].reelIndex][symbolUpdates[i].positionOnReel] = symbolUpdates[i].symbol;
        }
        return result;
    }

    private onReelsStopFunc() {
        if (this.totalWin == 0){
            this.setState('idle');
            this.checkIfBetPossible();
        } else {
            this.setState('collect');
            this.scene.interactive = true;
            this.WinShowController.playWinShow();
            this.scene.totalWinField.addValue(this.totalWin);
        }
    }

    private  onStakeButtonFunc() {
        if (this.scene.stakeButton.isShown){
            let currentStakeIndex = this.scene.stakeButton.stakes.indexOf(this.scene.stakeButton.currentStakeAmount),
                nextStake = nextItem(this.scene.stakeButton.stakes, currentStakeIndex);
            this.scene.stakeButton.changeStake(nextStake);

        }
        else {
            this.scene.stakeButton.showPanel();
        }
    }

    private checkIfBetPossible() {
        if (this.balance < this.currentStake) {
            this.scene.startButton.disable();
            // this.scene.autoStartButton.disable();
            return false;
        } else {
            this.scene.startButton.enable();
            // this.scene.autoStartButton.enable();
            return true;
        }
    }

    private onChangeStakeFunc(event) {
        this.currentStake = event.detail.newStake;
        this.checkIfBetPossible();
    }

    private onMaxBetButtonFunc() {
        for (let i=0; i<this.stakes.length; i++) {
            if (this.balance < this.stakes[i]){
                continue;
            } else {
                this.scene.stakeButton.changeStake(this.stakes[i]);
                break
            }
        }
    }

    private onGambleFunc() {
        // SCENE_MANAGER.goToGameScene('gamble');
        // gambleController.startGamble(this.totalWin);
    }

    private onCollect(){
        this.scene.totalWinField.counter.reset();
        this.scene.balanceField.addValue(this.totalWin);
        this.balance += this.totalWin;
        this.totalWin = 0;
        this.setState('idle');
    }

    private disableWinLineButtons(): void {
        // for (let i=0; i<this.scene.winLinesArray.length; i++) {
        //     this.scene.winLinesArray[i].disable();
        // }
    }
    private enableWinLineButtons(): void {
        // for (let i=0; i<this.scene.winLinesArray.length; i++) {
        //     this.scene.winLinesArray[i].enable();
        // }
    }




}