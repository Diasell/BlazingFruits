/**
 * Created by tarasg on 9/25/2017.
 */
import {Button, DenominationPanelButton} from "../Layout/Buttons";
import {WinLineButton} from "../Layout/WinLineButton";
import {ButtonEvents} from "../Events/ButtonEvents";
import {NumericField, BalanceFieldWithHideCreditsAnimation} from  "../Layout/NumericField";
import {FontStyles} from "../Utils/fontStyles";
import * as utils from "../Utils/helperFuncs";
import {TextContainer} from "../Layout/TextContainer";
import {CreateAnimation} from "../Utils/helperFuncs";
import set = Reflect.set;
import {ReelSpinner} from "../ReelSpinner/ReelSpinner";
import {WinLine, SimpleWinLine} from "../Layout/WinLineClass";
import {SoundsManager} from "../main";




export class BaseGameScene extends PIXI.Container {
    public REELS: ReelSpinner;
    public startButton: Button;
    public stopButton: Button;
    public maxBetButton: Button;
    public stakeButton: DenominationPanelButton;
    public balanceField: NumericField;
    public totalWinField: NumericField;

    public winline0: SimpleWinLine;
    public winline1: SimpleWinLine;
    public winline2: SimpleWinLine;
    public WinLines: SimpleWinLine[];

    private sceneBackground: PIXI.Sprite;
    private resources: any;


    constructor(resources:any) {
        super();
        this.resources = resources;
        // backgorund
        this.sceneBackground = new PIXI.Sprite(resources['BG']);
        this.addChild(this.sceneBackground);

        this.winline0 = new SimpleWinLine(this, 0, resources);
        this.winline1 = new SimpleWinLine(this, 1, resources);
        this.winline2 = new SimpleWinLine(this, 2, resources);
        this.WinLines = [this.winline0, this.winline1, this.winline2];

        //Reels;
        this.REELS = new ReelSpinner(this, resources);

        this.startButton = new Button(this, 873, 267, 'StartButton', resources, this.onStartButton);
        this.stopButton = new Button(this, 873, 267, 'StopButton', resources, this.onStopButton);

        this.balanceField = new BalanceFieldWithHideCreditsAnimation(this, 'BalanceField', 765, 455, resources, FontStyles.counterFont);
        this.balanceField.fieldContainer.scale.set(0.5, 1); // this added cause assets taken from anoter game and dont fit the size
        this.totalWinField = new NumericField(this, 'TotalWin', 765, 0, resources, FontStyles.counterFont);
        this.totalWinField.fieldContainer.scale.set(0.5, 1);

        this.interactive = true;
        this.on('pointerdown', function () {
            document.dispatchEvent(ButtonEvents.ClickedOnBaseGameScene);
            let skipWInshow = new CustomEvent('skipWinShow');
            document.dispatchEvent(skipWInshow);
        })
    }

    private onStartButton () {
        document.dispatchEvent(ButtonEvents.StartButtonPressed);
    }

    private onStopButton () {
        document.dispatchEvent(ButtonEvents.StopButtonPressed);
    }
}
