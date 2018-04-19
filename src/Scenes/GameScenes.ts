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
import {WinLine} from "../Layout/WinLineClass";
import {SoundsManager} from "../main";




export class BaseGameScene extends PIXI.Container {
    public REELS: ReelSpinner;
    public startButton: Button;
    public stopButton: Button;
    public maxBetButton: Button;
    public stakeButton: DenominationPanelButton;
    public balanceField: NumericField;
    public totalWinField: NumericField;

    private sceneBackground: PIXI.Sprite;
    private resources: any;


    constructor(resources:any) {
        super();
        this.resources = resources;
        // backgorund
        this.sceneBackground = new PIXI.Sprite(resources['BG']);
        this.addChild(this.sceneBackground);

        //Reels;
        this.REELS = new ReelSpinner(this, resources);

        // Control Buttons
        // let buttonSound = SoundsManager.allSounds.buttonPress;

        this.startButton = new Button(this, 873, 267, 'StartButton', resources, this.onStartButton);
        this.stopButton = new Button(this, 873, 267, 'StopButton', resources, this.onStopButton);
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
