/**
 * Created by tarasg on 10/8/2017.
 */
import {Button} from "../Layout/Buttons";
import {BonusGameScene} from "../Scenes/GameScenes";
import {formatStakeAmount} from "../Utils/helperFuncs";
import {ButtonEvents} from "../Events/ButtonEvents";
import {FontStyles} from "../Utils/fontStyles";
import {app, bonusGameScene, SCENE_MANAGER} from "../main"
import {LineObject} from "../Bonus/LineObject";


export class BonusGameController {

    private scene: BonusGameScene;
    private pumpEndEventsCounter: any;
    public currentLine: number;
    private linesOrder: any;
    private onPumpSymbolEnd: any;
    private onShowPossibleWins: any;
    private setPossibleWinsDis: any;
    private onActivateNextLine: any;
    private onBonusEnd: any;
    private onFinalCounterEnd: any;
    private onCollect:any;

    constructor(scene: BonusGameScene) {
        this.scene = scene;
        this.pumpEndEventsCounter = {
            0:0,
            1:0,
            2:0,
            3:0,
            4:0
        };
        this.linesOrder = {
            0: this.scene.wmLine,
            1: this.scene.plumLine,
            2: this.scene.orangeLine,
            3: this.scene.lemonLine,
            4: this.scene.cherryLine,
        };

        let pumpCallback = function () {
            this.activateLine(4);
        }.bind(this);

        this.onPumpSymbolEnd = function (e) {
            this.introAnim(e, pumpCallback);
        }.bind(this);

        this.onActivateNextLine = function (e) {
            this.activateNextLine(e);
        }.bind(this);

        this.onShowPossibleWins = function () {
            this.showPossibleWins();
        }.bind(this);

        this.setPossibleWinsDis = function () {
            this.setPosWinsDis();
        }.bind(this);

        this.onBonusEnd = function () {
          this.endBonus();
        }.bind(this);

        this.onFinalCounterEnd = function () {
            this.scene.endBonusDialog.pumpAnim()
        }.bind(this);

        this.onCollect = function () {
            this.Collect();
        }.bind(this)

    }
    private addEventListeners() {
        document.addEventListener('userChoose', this.setPossibleWinsDis);
        document.addEventListener('showResults', this.onShowPossibleWins);
        document.addEventListener('FruitCounterEnded', this.onActivateNextLine);
        document.addEventListener('finalCounterEnd', this.onFinalCounterEnd);
        document.addEventListener('pumpWinAmountEnd', this.onBonusEnd);
        document.addEventListener('pumpSymbolEnd', this.onPumpSymbolEnd);
        document.addEventListener('collectBonusEvent', this.onCollect);
    }

    private removeEventListeners() {
        document.removeEventListener('userChoose', this.setPossibleWinsDis);
        document.removeEventListener('showResults', this.onShowPossibleWins);
        document.removeEventListener('FruitCounterEnded', this.onActivateNextLine);
        document.removeEventListener('finalCounterEnd', this.onFinalCounterEnd);
        document.removeEventListener('pumpWinAmountEnd', this.onBonusEnd);
        document.removeEventListener('pumpSymbolEnd', this.onPumpSymbolEnd);
        document.removeEventListener('collectBonusEvent', this.onCollect);
    }

    private getBonusResults(): void {
        for (let i=0; i<this.scene.cherryLine.elements.length; i++){
            this.scene.cherryLine.elements[i].result = Math.floor((Math.random() * 100));
        }
        for (let i=0; i<this.scene.lemonLine.elements.length; i++){
            this.scene.lemonLine.elements[i].result = Math.floor((Math.random() * 100));
        }
        for (let i=0; i<this.scene.orangeLine.elements.length; i++){
            this.scene.orangeLine.elements[i].result = Math.floor((Math.random() * 100));


        }
        for (let i=0; i<this.scene.plumLine.elements.length; i++){
            this.scene.plumLine.elements[i].result = Math.floor((Math.random() * 100));
        }
        for (let i=0; i<this.scene.wmLine.elements.length; i++){
            this.scene.wmLine.elements[i].result = Math.floor((Math.random() * 100));
        }

    }

    public activateLine(lineNumber: number) {
        let line = this.linesOrder[lineNumber];
        this.currentLine = lineNumber;
        line.enableLine();
    }

    private showPossibleWins() {
        this.linesOrder[this.currentLine].showPossibleWin();
    }

    private setPosWinsDis(): void {
        this.linesOrder[this.currentLine].setPossibleWinsDisabled();
    }

    private Collect(): void {
        this.scene.endBonusDialog.totalWin = this.scene.bonusWinField.counter.endVal;
        this.scene.endBonusDialog.show();
    }

    private activateNextLine(event){
        this.scene.bonusWinField.addValue(event.detail.result);
        if (this.currentLine == 0){
            // TODO: start final bonus anim;
            this.scene.endBonusDialog.totalWin = this.scene.bonusWinField.counter.endVal;
            this.scene.endBonusDialog.show();
        } else{
           this.activateLine(this.currentLine-1);
        }

    }

    public endBonus():void {
        //  update eventCounters:
        this.resetPumpSymbolCounters();
        // remove event listenters:
        this.removeEventListeners();
        // finalDialog
        this.scene.endBonusDialog.hide();
        this.scene.endBonusDialog.counter.reset();

        // bonus win field:
        this.scene.bonusWinField.counter.reset();

        // disable lines:
        this.scene.cherryLine.resetLine();
        this.scene.lemonLine.resetLine();
        this.scene.orangeLine.resetLine();
        this.scene.plumLine.resetLine();
        this.scene.wmLine.resetLine();

        SCENE_MANAGER.goToGameScene('baseGame');


    }

    private resetPumpSymbolCounters() {
        this.pumpEndEventsCounter = {
            0:0,
            1:0,
            2:0,
            3:0,
            4:0
        };
    }

    public startBonus(): void {
        this.addEventListeners();
        this.getBonusResults();
        this.playIntro();
    }

    private getNextLine(event): LineObject {
        if (event.detail.fruitType == 0)
            return this.scene.plumLine;
        else if (event.detail.fruitType == 1)
            return this.scene.orangeLine;
        else if (event.detail.fruitType == 2)
            return this.scene.lemonLine;
        else
            return this.scene.cherryLine;
    }

    private canMoveToNextLine(event) : boolean {
        if (event.detail.fruitType == 0){
            this.pumpEndEventsCounter[0] += 1;
            if (this.pumpEndEventsCounter[0] == 6)
                return true;
            return false;
        }
        else if (event.detail.fruitType == 1){
            this.pumpEndEventsCounter[1] += 1;
            if (this.pumpEndEventsCounter[1] == 5)
                return true;
            return false;
        }
        else if (event.detail.fruitType == 2){
            this.pumpEndEventsCounter[2] += 1;
            if (this.pumpEndEventsCounter[2] == 4)
                return true;
            return false;
        }
        else if (event.detail.fruitType == 3){
            this.pumpEndEventsCounter[3] += 1;
            if (this.pumpEndEventsCounter[3] == 3)
                return true;
            return false;
        } else {
            this.pumpEndEventsCounter[4] += 1;
            if (this.pumpEndEventsCounter[4] == 2) {
                return true;
            }
            return false
        }

    }

    private introAnim(event, callback) {
        let isNextLine = this.canMoveToNextLine(event);
        if (isNextLine && event.detail.fruitType == 4) {
            callback();
        }
        else if (isNextLine) {
            let line = this.getNextLine(event);
            for (let i=0; i<line.elements.length; i++) {
                line.elements[i].pumpAnim();
            }
        }
        else {
        }

    }

    private playIntro() {
        for (let i=0; i<this.scene.wmLine.elements.length; i++) {
            this.scene.wmLine.elements[i].pumpAnim();
        }
    }


}