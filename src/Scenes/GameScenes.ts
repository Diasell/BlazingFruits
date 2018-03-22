/**
 * Created by tarasg on 9/25/2017.
 */
import {Button, DenominationPanelButton} from "../Layout/Buttons";
import {WinLineButton} from "../Layout/WinLineButton";
import {ButtonEvents} from "../Events/ButtonEvents";
import {NumericField, BalanceFieldWithHideCreditsAnimation} from  "../Layout/NumericField";
import {GambleCard, GambleHistory} from "../Layout/GambleCard";
import {FontStyles} from "../Utils/fontStyles";
import * as utils from "../Utils/helperFuncs";
import {TextContainer} from "../Layout/TextContainer";
import {cherry_anim_obj} from "../Utils/animation_objects";
import {CreateAnimation} from "../Utils/helperFuncs";
import {FruitObject} from "../Bonus/FruitObject";
import {BonusFinalResultWindow} from "../Bonus/BonusFinalResult";
import {LineObject} from "../Bonus/LineObject";
import set = Reflect.set;
import {ReelSpinner} from "../ReelSpinner/ReelSpinner";
import {WinLine} from "../Layout/WinLineClass";
import {SoundsManager} from "../main";




export class BaseGameScene extends PIXI.Container {
    public REELS: ReelSpinner;
    public startButton: Button;
    public startBonusButton: Button;
    public collectButton: Button;
    public stopButton: Button;
    public maxBetButton: Button;
    public autoStartButton: Button;
    public cancelAutoStartButton: Button;
    public menuButton: Button;
    public helpButton: Button;
    public gambleButton: Button;
    public stakeButton: DenominationPanelButton;
    public balanceField: NumericField;
    public totalWinField: NumericField;

    public lineNumberWidth:  number = 83;
    public lineNumberHeight: number = 73;
    public winline1: WinLineButton;
    public winShowLine1: WinLine;
    public winline2: WinLineButton;
    public winShowLine2: WinLine;
    public winline3: WinLineButton;
    public winShowLine3: WinLine;
    public winline4: WinLineButton;
    public winShowLine4: WinLine;
    public winline5: WinLineButton;
    public winShowLine5: WinLine;
    public winline6: WinLineButton;
    public winShowLine6: WinLine;
    public winline7: WinLineButton;
    public winShowLine7: WinLine;
    public winline8: WinLineButton;
    public winShowLine8: WinLine;
    public winline9: WinLineButton;
    public winShowLine9: WinLine;
    public winline10: WinLineButton;
    public winShowLine10: WinLine;
    public winline11: WinLineButton;
    public winShowLine11: WinLine;
    public winline12: WinLineButton;
    public winShowLine12: WinLine;
    public winline13: WinLineButton;
    public winShowLine13: WinLine;
    public winline14: WinLineButton;
    public winShowLine14: WinLine;
    public winline15: WinLineButton;
    public winShowLine15: WinLine;
    public winline16: WinLineButton;
    public winShowLine16: WinLine;
    public winline17: WinLineButton;
    public winShowLine17: WinLine;
    public winline18: WinLineButton;
    public winShowLine18: WinLine;
    public winline19: WinLineButton;
    public winShowLine19: WinLine;
    public winline20: WinLineButton;
    public winShowLine20: WinLine;
    public winShowLineArray: WinLine[];
    public winLinesArray: WinLineButton[];


    private sceneBackground: PIXI.Sprite;
    private resources: any;
    constructor(resources:any) {
        super();
        this.resources = resources;
        // backgorund
        this.sceneBackground = new PIXI.Sprite(resources.basegameBack.texture);
        this.addChild(this.sceneBackground);

        //Reels;
        this.REELS = new ReelSpinner(this, resources);

        // Control Buttons
        let buttonSound = SoundsManager.allSounds.buttonPress;

        this.startButton = new Button(this, 1635, 960, resources.start.url, resources.start_dis.url, resources.start_pressed.url, buttonSound, function () {
            document.dispatchEvent(ButtonEvents.StartButtonPressed);
        });
        this.stopButton = new Button(this, 1635, 960, resources.stop.url, resources.stop_dis.url, resources.stop_pressed.url, buttonSound, function () {
            document.dispatchEvent(ButtonEvents.StopButtonPressed);
        });
        this.collectButton = new Button(this, 1635, 960, resources.collect.url, resources.collect_dis.url, resources.collect_pressed.url, buttonSound, function () {
            document.dispatchEvent(ButtonEvents.CollectButtonPressed);
        });
        this.startBonusButton = new Button(this, 1635, 960, resources.start_bonus.url, resources.start_bonus_dis.url, resources.start_bonus_pressed.url, buttonSound, function () {
            document.dispatchEvent(ButtonEvents.StartBonusButtonPressed);
        });

        this.maxBetButton = new Button(this, 1420, 960, resources.maxbet.url, resources.maxbet_dis.url, resources.maxbet_pressed.url, buttonSound, function() {
            document.dispatchEvent(ButtonEvents.MaxBetButtonPressed);
        });
        this.autoStartButton = new Button(this, 1205, 960, resources.auto_start.url, resources.auto_start_dis.url, resources.auto_start_pressed.url, buttonSound, function() {
            document.dispatchEvent(ButtonEvents.AutoStartButtonPressed);
        });
        this.cancelAutoStartButton = new Button(this, 1205, 960, resources.auto_start_stop.url, resources.auto_start_stop_dis.url, resources.auto_start_stop_pressed.url, buttonSound, function() {
            document.dispatchEvent(ButtonEvents.CancelAutoStartButtonPressed);
        });
        this.menuButton = new Button(this, 285, 1000, resources.menu.url, resources.menu_dis.url, resources.menu_pressed.url, buttonSound, function() {
            document.dispatchEvent(ButtonEvents.MenuButtonPressed);
        });
        this.helpButton = new Button(this, 450, 1000, resources.help.url, resources.help_dis.url, resources.help_pressed.url, buttonSound, function() {
            document.dispatchEvent(ButtonEvents.HelpButtonPressed);
        });

        this.gambleButton = new Button(this, 615, 1000, resources.gamble.url, resources.gamble_dis.url, resources.gamble_pressed.url, buttonSound, function() {
            document.dispatchEvent(ButtonEvents.GambleButtonPressed);
        });

        this.balanceField = new BalanceFieldWithHideCreditsAnimation(this, FontStyles.counterFont, 200, 865, resources.balance_field.texture, buttonSound, resources.show_cr_img.texture, resources.hide_cr_img.texture);
        this.totalWinField = new NumericField(this, FontStyles.counterFont, 620, 865, resources.total_win_field.texture, buttonSound);

        this.stakeButton = new DenominationPanelButton(
            this,
            890,
            1005,
            FontStyles.counterFont,
            FontStyles.stakeFont,
            resources.denomBottom.texture,
            resources.denomTop.texture,
            resources.denomMiddle.texture,
            resources.denomSel.texture,
            resources.bet.texture,
            resources.bet_dis.texture,
            resources.bet_pressed.texture,
            buttonSound,
            function ()
            {
                document.dispatchEvent(ButtonEvents.BetButtonPressed);
            }
        );


        // Winlines Buttons
        let winlinesTexture: PIXI.BaseTexture = PIXI.BaseTexture.fromImage(resources.line_buttons_20.url),
            winlinesTogTexture: PIXI.BaseTexture = PIXI.BaseTexture.fromImage(resources.line_buttons_20_tog.url);


        let linebutton1 = new PIXI.Texture(winlinesTexture, new PIXI.Rectangle(0, this.lineNumberHeight*5, this.lineNumberWidth, this.lineNumberHeight)),
            linebutton1_tog = new PIXI.Texture(winlinesTogTexture, new PIXI.Rectangle(0, this.lineNumberHeight*5, this.lineNumberWidth, this.lineNumberHeight)),
            linebutton2 = new PIXI.Texture(winlinesTexture, new PIXI.Rectangle(0, this.lineNumberHeight, this.lineNumberWidth, this.lineNumberHeight)),
            linebutton2_tog = new PIXI.Texture(winlinesTogTexture, new PIXI.Rectangle(0, this.lineNumberHeight, this.lineNumberWidth, this.lineNumberHeight)),
            linebutton3 = new PIXI.Texture(winlinesTexture, new PIXI.Rectangle(0, this.lineNumberHeight*8, this.lineNumberWidth, this.lineNumberHeight)),
            linebutton3_tog = new PIXI.Texture(winlinesTogTexture, new PIXI.Rectangle(0, this.lineNumberHeight*8, this.lineNumberWidth, this.lineNumberHeight)),
            linebutton4 = new PIXI.Texture(winlinesTexture, new PIXI.Rectangle(0, 0, this.lineNumberWidth, this.lineNumberHeight)),
            linebutton4_tog = new PIXI.Texture(winlinesTogTexture, new PIXI.Rectangle(0, 0, this.lineNumberWidth, this.lineNumberHeight)),
            linebutton5 = new PIXI.Texture(winlinesTexture, new PIXI.Rectangle(0, this.lineNumberHeight*9, this.lineNumberWidth, this.lineNumberHeight)),
            linebutton5_tog = new PIXI.Texture(winlinesTogTexture, new PIXI.Rectangle(0, this.lineNumberHeight*9, this.lineNumberWidth, this.lineNumberHeight)),
            linebutton6 = new PIXI.Texture(winlinesTexture, new PIXI.Rectangle(this.lineNumberWidth, this.lineNumberHeight*4, this.lineNumberWidth, this.lineNumberHeight)),
            linebutton6_tog = new PIXI.Texture(winlinesTogTexture, new PIXI.Rectangle(this.lineNumberWidth, this.lineNumberHeight*4, this.lineNumberWidth, this.lineNumberHeight)),
            linebutton7 = new PIXI.Texture(winlinesTexture, new PIXI.Rectangle(this.lineNumberWidth, this.lineNumberHeight*5, this.lineNumberWidth, this.lineNumberHeight)),
            linebutton7_tog = new PIXI.Texture(winlinesTogTexture, new PIXI.Rectangle(this.lineNumberWidth, this.lineNumberHeight*5, this.lineNumberWidth, this.lineNumberHeight)),
            linebutton8 = new PIXI.Texture(winlinesTexture, new PIXI.Rectangle(this.lineNumberWidth, this.lineNumberHeight*7, this.lineNumberWidth, this.lineNumberHeight)),
            linebutton8_tog = new PIXI.Texture(winlinesTogTexture, new PIXI.Rectangle(this.lineNumberWidth, this.lineNumberHeight*7, this.lineNumberWidth, this.lineNumberHeight)),
            linebutton9 = new PIXI.Texture(winlinesTexture, new PIXI.Rectangle(this.lineNumberWidth, this.lineNumberHeight*2, this.lineNumberWidth, this.lineNumberHeight)),
            linebutton9_tog = new PIXI.Texture(winlinesTogTexture, new PIXI.Rectangle(this.lineNumberWidth, this.lineNumberHeight*2, this.lineNumberWidth, this.lineNumberHeight)),
            linebutton10 = new PIXI.Texture(winlinesTexture, new PIXI.Rectangle(0, this.lineNumberHeight*4, this.lineNumberWidth, this.lineNumberHeight)),
            linebutton10_tog = new PIXI.Texture(winlinesTogTexture, new PIXI.Rectangle(0, this.lineNumberHeight*4, this.lineNumberWidth, this.lineNumberHeight)),
            linebutton11 = new PIXI.Texture(winlinesTexture, new PIXI.Rectangle(0, this.lineNumberHeight*6, this.lineNumberWidth, this.lineNumberHeight)),
            linebutton11_tog = new PIXI.Texture(winlinesTogTexture, new PIXI.Rectangle(0, this.lineNumberHeight*6, this.lineNumberWidth, this.lineNumberHeight)),
            linebutton12 = new PIXI.Texture(winlinesTexture, new PIXI.Rectangle(this.lineNumberWidth, this.lineNumberHeight, this.lineNumberWidth, this.lineNumberHeight)),
            linebutton12_tog = new PIXI.Texture(winlinesTogTexture, new PIXI.Rectangle(this.lineNumberWidth, this.lineNumberHeight, this.lineNumberWidth, this.lineNumberHeight)),
            linebutton13 = new PIXI.Texture(winlinesTexture, new PIXI.Rectangle(this.lineNumberWidth, this.lineNumberHeight*8, this.lineNumberWidth, this.lineNumberHeight)),
            linebutton13_tog = new PIXI.Texture(winlinesTogTexture, new PIXI.Rectangle(this.lineNumberWidth, this.lineNumberHeight*8, this.lineNumberWidth, this.lineNumberHeight)),
            linebutton14 = new PIXI.Texture(winlinesTexture, new PIXI.Rectangle(this.lineNumberWidth, 0, this.lineNumberWidth, this.lineNumberHeight)),
            linebutton14_tog = new PIXI.Texture(winlinesTogTexture, new PIXI.Rectangle(this.lineNumberWidth, 0, this.lineNumberWidth, this.lineNumberHeight)),
            linebutton15 = new PIXI.Texture(winlinesTexture, new PIXI.Rectangle(this.lineNumberWidth, this.lineNumberHeight*9, this.lineNumberWidth, this.lineNumberHeight)),
            linebutton15_tog = new PIXI.Texture(winlinesTogTexture, new PIXI.Rectangle(this.lineNumberWidth, this.lineNumberHeight*9, this.lineNumberWidth, this.lineNumberHeight)),
            linebutton16 = new PIXI.Texture(winlinesTexture, new PIXI.Rectangle(0, this.lineNumberHeight*3, this.lineNumberWidth, this.lineNumberHeight)),
            linebutton16_tog = new PIXI.Texture(winlinesTogTexture, new PIXI.Rectangle(0, this.lineNumberHeight*3, this.lineNumberWidth, this.lineNumberHeight)),
            linebutton17 = new PIXI.Texture(winlinesTexture, new PIXI.Rectangle(0, this.lineNumberHeight*7, this.lineNumberWidth, this.lineNumberHeight)),
            linebutton17_tog = new PIXI.Texture(winlinesTogTexture, new PIXI.Rectangle(0, this.lineNumberHeight*7, this.lineNumberWidth, this.lineNumberHeight)),
            linebutton18 = new PIXI.Texture(winlinesTexture, new PIXI.Rectangle(this.lineNumberWidth, this.lineNumberHeight*3, this.lineNumberWidth, this.lineNumberHeight)),
            linebutton18_tog = new PIXI.Texture(winlinesTogTexture, new PIXI.Rectangle(this.lineNumberWidth, this.lineNumberHeight*3, this.lineNumberWidth, this.lineNumberHeight)),
            linebutton19 = new PIXI.Texture(winlinesTexture, new PIXI.Rectangle(this.lineNumberWidth, this.lineNumberHeight*6, this.lineNumberWidth, this.lineNumberHeight)),
            linebutton19_tog = new PIXI.Texture(winlinesTogTexture, new PIXI.Rectangle(this.lineNumberWidth, this.lineNumberHeight*6, this.lineNumberWidth, this.lineNumberHeight)),
            linebutton20 = new PIXI.Texture(winlinesTexture, new PIXI.Rectangle(0, this.lineNumberHeight*2, this.lineNumberWidth, this.lineNumberHeight)),
            linebutton20_tog = new PIXI.Texture(winlinesTogTexture, new PIXI.Rectangle(0, this.lineNumberHeight*2, this.lineNumberWidth, this.lineNumberHeight));


        this.winline1 = new WinLineButton(this, 1, 250, 525,resources.line1.texture, linebutton1, linebutton1, linebutton1_tog, buttonSound, function () {
            console.log("line1");
        });
        this.winShowLine1 = new WinLine(this, 0, resources.line1.texture,resources.box1.texture, resources.winline_amount_field.texture, resources);

        this.winline2 = new WinLineButton(this, 2, 250, 233,resources.line2.texture, linebutton2, linebutton2, linebutton2_tog, buttonSound, function () {
            console.log("line2");
        });
        this.winShowLine2 = new WinLine(this, 1, resources.line2.texture,resources.box2.texture, resources.winline_amount_field.texture, resources);

        this.winline3 = new WinLineButton(this, 3, 250, 744,resources.line3.texture, linebutton3, linebutton3, linebutton3_tog, buttonSound, function () {
            console.log("line3");
        });
        this.winShowLine3 = new WinLine(this, 2, resources.line3.texture,resources.box3.texture, resources.winline_amount_field.texture, resources);

        this.winline4 = new WinLineButton(this, 4, 250, 160,resources.line4.texture, linebutton4, linebutton4, linebutton4_tog, buttonSound, function () {
            console.log("line4");
        });
        this.winShowLine4 = new WinLine(this, 3, resources.line4.texture,resources.box4.texture, resources.winline_amount_field.texture, resources);

        this.winline5 = new WinLineButton(this, 5, 250, 817,resources.line5.texture, linebutton5, linebutton5, linebutton5_tog, buttonSound, function () {
            console.log("line5");
        });
        this.winShowLine5 = new WinLine(this, 4, resources.line5.texture,resources.box5.texture, resources.winline_amount_field.texture, resources);

        this.winline6 = new WinLineButton(this, 6, 1670, 452,resources.line6.texture, linebutton6, linebutton6, linebutton6_tog, buttonSound, function () {
            console.log("line6");
        });
        this.winShowLine6 = new WinLine(this, 5, resources.line6.texture,resources.box6.texture, resources.winline_amount_field.texture, resources);

        this.winline7 = new WinLineButton(this, 7, 1670, 525,resources.line7.texture, linebutton7, linebutton7, linebutton7_tog, buttonSound, function () {
            console.log("line7");
        });
        this.winShowLine7 = new WinLine(this, 6, resources.line7.texture,resources.box7.texture, resources.winline_amount_field.texture, resources);

        this.winline8 = new WinLineButton(this, 8, 1670, 671,resources.line8.texture, linebutton8, linebutton8, linebutton8_tog, buttonSound, function () {
            console.log("line8");
        });
        this.winShowLine8 = new WinLine(this, 7, resources.line8.texture,resources.box8.texture, resources.winline_amount_field.texture, resources);

        this.winline9 = new WinLineButton(this, 9, 1670, 306,resources.line9.texture, linebutton9, linebutton9, linebutton9_tog, buttonSound, function () {
            console.log("line9");
        });
        this.winShowLine9 = new WinLine(this, 8, resources.line9.texture,resources.box9.texture, resources.winline_amount_field.texture, resources);

        this.winline10 = new WinLineButton(this, 10, 250, 452,resources.line10.texture, linebutton10, linebutton10, linebutton10_tog, buttonSound, function () {
            console.log("line10");
        });
        this.winShowLine10 = new WinLine(this, 9, resources.line10.texture,resources.box10.texture, resources.winline_amount_field.texture, resources);

        this.winline11 = new WinLineButton(this, 11, 250, 598,resources.line11.texture, linebutton11, linebutton11, linebutton11_tog, buttonSound, function () {
            console.log("line11");
        });
        this.winShowLine11 = new WinLine(this, 10, resources.line11.texture,resources.box11.texture, resources.winline_amount_field.texture, resources);

        this.winline12 = new WinLineButton(this, 12, 1670, 233,resources.line12.texture, linebutton12, linebutton12, linebutton12_tog, buttonSound, function () {
            console.log("line12");
        });
        this.winShowLine12 = new WinLine(this, 11, resources.line12.texture,resources.box12.texture, resources.winline_amount_field.texture, resources);

        this.winline13 = new WinLineButton(this, 13, 1670, 745,resources.line13.texture, linebutton13, linebutton13, linebutton13_tog, buttonSound, function () {
            console.log("line13");
        });
        this.winShowLine13 = new WinLine(this, 12, resources.line13.texture,resources.box13.texture, resources.winline_amount_field.texture, resources);

        this.winline14 = new WinLineButton(this, 14, 1670, 161,resources.line14.texture, linebutton14, linebutton14, linebutton14_tog, buttonSound, function () {
            console.log("line14");
        });
        this.winShowLine14 = new WinLine(this, 13, resources.line14.texture,resources.box14.texture, resources.winline_amount_field.texture, resources);

        this.winline15 = new WinLineButton(this, 15, 1670, 817,resources.line15.texture, linebutton15, linebutton15, linebutton15_tog, buttonSound, function () {
            console.log("line15");
        });
        this.winShowLine15 = new WinLine(this, 14, resources.line15.texture,resources.box15.texture, resources.winline_amount_field.texture, resources);

        this.winline16 = new WinLineButton(this, 16, 250, 379,resources.line16.texture, linebutton16, linebutton16, linebutton16_tog, buttonSound, function () {
            console.log("line16");
        });
        this.winShowLine16 = new WinLine(this, 15, resources.line16.texture,resources.box16.texture, resources.winline_amount_field.texture, resources);

        this.winline17 = new WinLineButton(this, 17, 250, 671,resources.line17.texture, linebutton17, linebutton17, linebutton17_tog, buttonSound, function () {
            console.log("line17");
        });
        this.winShowLine17 = new WinLine(this, 16, resources.line17.texture,resources.box17.texture, resources.winline_amount_field.texture, resources);

        this.winline18 = new WinLineButton(this, 18, 1670, 379,resources.line18.texture, linebutton18, linebutton18, linebutton18_tog, buttonSound, function () {
            console.log("line18");
        });
        this.winShowLine18 = new WinLine(this, 17, resources.line18.texture,resources.box18.texture, resources.winline_amount_field.texture, resources);

        this.winline19 = new WinLineButton(this, 19, 1670, 598,resources.line19.texture, linebutton19, linebutton19, linebutton19_tog, buttonSound, function () {
            console.log("line19");
        });
        this.winShowLine19 = new WinLine(this, 18, resources.line19.texture,resources.box19.texture, resources.winline_amount_field.texture, resources);

        this.winline20 = new WinLineButton(this, 20, 250, 306,resources.line20.texture, linebutton20, linebutton20, linebutton20_tog, buttonSound, function () {
            console.log("line20");
        });
        this.winShowLine20 = new WinLine(this, 19, resources.line20.texture,resources.box20.texture, resources.winline_amount_field.texture, resources);

        this.winShowLineArray = [this.winShowLine1, this.winShowLine2, this.winShowLine3, this.winShowLine4, this.winShowLine5,
                                 this.winShowLine6, this.winShowLine7, this.winShowLine8, this.winShowLine9, this.winShowLine10, this.winShowLine11,
                                 this.winShowLine12, this.winShowLine13, this.winShowLine14, this.winShowLine15, this.winShowLine16, this.winShowLine17,
                                 this.winShowLine18, this.winShowLine19, this.winShowLine20];

        this.winLinesArray = [this.winline1, this.winline2, this.winline3, this.winline4, this.winline5, this.winline6,
                              this.winline7, this.winline8, this.winline9, this.winline10, this.winline11, this.winline12,
                              this.winline13, this.winline14, this.winline15, this.winline16, this.winline17, this.winline18,
                              this.winline19, this.winline20];

        this.interactive = true;
        this.on('pointerdown', function () {
            document.dispatchEvent(ButtonEvents.ClickedOnBaseGameScene);
            let skipWInshow = new CustomEvent('skipWinShow');
            document.dispatchEvent(skipWInshow);
        })

    }
}


export class BonusGameScene extends PIXI.Container {
    private sceneBackground: PIXI.Sprite;
    private resources: any;
    public cherry1: FruitObject;
    public cherry2: FruitObject;
    public lemon1: FruitObject;
    public lemon2: FruitObject;
    public lemon3: FruitObject;
    public orange1: FruitObject;
    public orange2: FruitObject;
    public orange3: FruitObject;
    public orange4: FruitObject;
    public plum1: FruitObject;
    public plum2: FruitObject;
    public plum3: FruitObject;
    public plum4: FruitObject;
    public plum5: FruitObject;
    public wm1: FruitObject;
    public wm2: FruitObject;
    public wm3: FruitObject;
    public wm4: FruitObject;
    public wm5: FruitObject;
    public wm6: FruitObject;

    public bonusWinField: NumericField;
    public endBonusDialog: BonusFinalResultWindow;

    public cherryLine: LineObject = new LineObject();
    public lemonLine: LineObject = new LineObject();
    public plumLine: LineObject = new LineObject();
    public orangeLine: LineObject = new LineObject();
    public wmLine: LineObject = new LineObject();



    constructor(resources:any) {
        super();
        this.resources = resources;
        this.sceneBackground = new PIXI.Sprite(resources.bonusback.texture);
        this.addChild(this.sceneBackground);
        let buttonSound = new Audio(resources.test.url);

        this.cherry1 = new FruitObject(this, 725, 750, 0,4, resources);
        this.cherry2 = new FruitObject(this, 945, 750, 0,4, resources);
        this.cherryLine.addElements(this.cherry1, this.cherry2);

        this.lemon1 = new FruitObject(this, 615, 600, 0,3, resources);
        this.lemon2 = new FruitObject(this, 835, 600, 0,3, resources);
        this.lemon3 = new FruitObject(this, 1055, 600, 0,3, resources);
        this.lemonLine.addElements(this.lemon1, this.lemon2, this.lemon3);

        this.orange1 = new FruitObject(this, 505, 450, 0,2, resources);
        this.orange2 = new FruitObject(this, 730, 450, 0,2, resources);
        this.orange3 = new FruitObject(this, 945, 450, 0,2, resources);
        this.orange4 = new FruitObject(this, 1165, 450, 0,2, resources);
        this.orangeLine.addElements(this.orange1, this.orange2, this.orange3, this.orange4);

        this.plum1 = new FruitObject(this, 395, 300, 0,1, resources);
        this.plum2 = new FruitObject(this, 615, 300, 0,1, resources);
        this.plum3 = new FruitObject(this, 835, 300, 0,1, resources);
        this.plum4 = new FruitObject(this, 1055, 300, 0,1, resources);
        this.plum5 = new FruitObject(this, 1275, 300, 0,1, resources);
        this.plumLine.addElements(this.plum1, this.plum2, this.plum3, this.plum4, this.plum5);

        this.wm1 = new FruitObject(this, 285, 150, 0,0, resources);
        this.wm2 = new FruitObject(this, 505, 150, 0,0, resources);
        this.wm3 = new FruitObject(this, 725, 150, 0,0, resources);
        this.wm4 = new FruitObject(this, 945, 150, 0,0, resources);
        this.wm5 = new FruitObject(this, 1165, 150, 0,0, resources);
        this.wm6 = new FruitObject(this, 1385, 150, 0,0, resources);
        this.wmLine.addElements(this.wm1, this.wm2, this.wm3, this.wm4, this.wm5, this.wm6);

        this.bonusWinField = new NumericField(this, FontStyles.BonusCounterFont, 960, 75, resources.bonusWinField.texture, buttonSound, 200); // TODO CHANGE x and y
        this.endBonusDialog = new BonusFinalResultWindow(this, FontStyles.BonusFinalCounterFont, 460, -600, resources, buttonSound); // TODO CHANGE x and y


    }
}


export class MainHelpScene extends PIXI.Container {
    public nextPageButton: Button;
    public prevPageButton: Button;
    public exitHelpButton: Button;
    private sceneBackground: PIXI.Sprite;
    private resources: any;

    constructor(resources: any) {
        super();
        this.resources = resources;
        //background
        this.sceneBackground = new PIXI.Sprite(resources.main_help_page.texture);
        this.addChild(this.sceneBackground);

        //buttons:
        let buttonSound = new Audio(resources.test.url);
        // enabled
        let buttonsBaseTexture: PIXI.BaseTexture = PIXI.BaseTexture.fromImage(resources.inhelp_buttons.url),

            exitHelpTexture: PIXI.Texture = new PIXI.Texture(buttonsBaseTexture, new PIXI.Rectangle(0, 3, 335, 115)),
            prevHelpTexture: PIXI.Texture = new PIXI.Texture(buttonsBaseTexture, new PIXI.Rectangle(3, 122, 178, 115)),
            nextHelpTexture: PIXI.Texture = new PIXI.Texture(buttonsBaseTexture, new PIXI.Rectangle(3, 240, 178, 115));
        //pressed
        let pr_buttonsBaseTexture: PIXI.BaseTexture = PIXI.BaseTexture.fromImage(resources.inhelp_buttons_pressed.url),

            pr_exitHelpTexture: PIXI.Texture = new PIXI.Texture(pr_buttonsBaseTexture, new PIXI.Rectangle(0, 3, 335, 115)),
            pr_prevHelpTexture: PIXI.Texture = new PIXI.Texture(pr_buttonsBaseTexture, new PIXI.Rectangle(3, 123, 178, 115)),
            pr_nextHelpTexture: PIXI.Texture = new PIXI.Texture(pr_buttonsBaseTexture, new PIXI.Rectangle(3, 240, 178, 115));

        this.nextPageButton = new Button(this, 1765, 1015, nextHelpTexture, nextHelpTexture, pr_nextHelpTexture, buttonSound, function () {
            document.dispatchEvent(ButtonEvents.NextHelpPageButtonPressed)
        });
        this.prevPageButton = new Button(this, 1570, 1015, prevHelpTexture, prevHelpTexture, pr_prevHelpTexture, buttonSound, function () {
            document.dispatchEvent(ButtonEvents.PrevHelpPageButtonPressed)
        });
        this.exitHelpButton = new Button(this, 220, 1015, exitHelpTexture, exitHelpTexture, pr_exitHelpTexture, buttonSound, function () {
            document.dispatchEvent(ButtonEvents.ExitHelpButtonPressed)
        });
    }
}

export class BonusHelpScene extends PIXI.Container {
    public nextPageButton: Button;
    public prevPageButton: Button;
    public exitHelpButton: Button;
    private sceneBackground: PIXI.Sprite;
    private resources: any;

    constructor(resources: any) {
        super();
        this.resources = resources;
        //background
        this.sceneBackground = new PIXI.Sprite(resources.bonus_help_page.texture);
        this.addChild(this.sceneBackground);

        //buttons:
        let buttonSound = new Audio(resources.test.url);
        // enabled
        let buttonsBaseTexture: PIXI.BaseTexture = PIXI.BaseTexture.fromImage(resources.inhelp_buttons.url),

            exitHelpTexture: PIXI.Texture = new PIXI.Texture(buttonsBaseTexture, new PIXI.Rectangle(0, 3, 335, 115)),
            prevHelpTexture: PIXI.Texture = new PIXI.Texture(buttonsBaseTexture, new PIXI.Rectangle(3, 122, 178, 115)),
            nextHelpTexture: PIXI.Texture = new PIXI.Texture(buttonsBaseTexture, new PIXI.Rectangle(3, 240, 178, 115));
        //pressed
        let pr_buttonsBaseTexture: PIXI.BaseTexture = PIXI.BaseTexture.fromImage(resources.inhelp_buttons_pressed.url),

            pr_exitHelpTexture: PIXI.Texture = new PIXI.Texture(pr_buttonsBaseTexture, new PIXI.Rectangle(0, 3, 335, 115)),
            pr_prevHelpTexture: PIXI.Texture = new PIXI.Texture(pr_buttonsBaseTexture, new PIXI.Rectangle(3, 123, 178, 115)),
            pr_nextHelpTexture: PIXI.Texture = new PIXI.Texture(pr_buttonsBaseTexture, new PIXI.Rectangle(3, 240, 178, 115));

        this.nextPageButton = new Button(this, 1765, 1015, nextHelpTexture, nextHelpTexture, pr_nextHelpTexture, buttonSound, function () {
            document.dispatchEvent(ButtonEvents.NextHelpPageButtonPressed)
        });
        this.prevPageButton = new Button(this, 1570, 1015, prevHelpTexture, prevHelpTexture, pr_prevHelpTexture, buttonSound, function () {
            document.dispatchEvent(ButtonEvents.PrevHelpPageButtonPressed)
        });
        this.exitHelpButton = new Button(this, 220, 1015, exitHelpTexture, exitHelpTexture, pr_exitHelpTexture, buttonSound, function () {
            document.dispatchEvent(ButtonEvents.ExitHelpButtonPressed)
        });
    }
}

export class GambleHelpScene extends PIXI.Container {
    public nextPageButton: Button;
    public prevPageButton: Button;
    public exitHelpButton: Button;
    private sceneBackground: PIXI.Sprite;
    private resources: any;

    constructor(resources: any) {
        super();
        this.resources = resources;
        //background
        this.sceneBackground = new PIXI.Sprite(resources.gamble_help_page.texture);
        this.addChild(this.sceneBackground);

        //buttons:
        let buttonSound = new Audio(resources.test.url);
        // enabled
        let buttonsBaseTexture: PIXI.BaseTexture = PIXI.BaseTexture.fromImage(resources.inhelp_buttons.url),

            exitHelpTexture: PIXI.Texture = new PIXI.Texture(buttonsBaseTexture, new PIXI.Rectangle(0, 3, 335, 115)),
            prevHelpTexture: PIXI.Texture = new PIXI.Texture(buttonsBaseTexture, new PIXI.Rectangle(3, 122, 178, 115)),
            nextHelpTexture: PIXI.Texture = new PIXI.Texture(buttonsBaseTexture, new PIXI.Rectangle(3, 240, 178, 115));
        //pressed
        let pr_buttonsBaseTexture: PIXI.BaseTexture = PIXI.BaseTexture.fromImage(resources.inhelp_buttons_pressed.url),

            pr_exitHelpTexture: PIXI.Texture = new PIXI.Texture(pr_buttonsBaseTexture, new PIXI.Rectangle(0, 3, 335, 115)),
            pr_prevHelpTexture: PIXI.Texture = new PIXI.Texture(pr_buttonsBaseTexture, new PIXI.Rectangle(3, 123, 178, 115)),
            pr_nextHelpTexture: PIXI.Texture = new PIXI.Texture(pr_buttonsBaseTexture, new PIXI.Rectangle(3, 240, 178, 115));

        this.nextPageButton = new Button(this, 1765, 1015, nextHelpTexture, nextHelpTexture, pr_nextHelpTexture, buttonSound, function () {
            document.dispatchEvent(ButtonEvents.NextHelpPageButtonPressed)
        });
        this.prevPageButton = new Button(this, 1570, 1015, prevHelpTexture, prevHelpTexture, pr_prevHelpTexture, buttonSound, function () {
            document.dispatchEvent(ButtonEvents.PrevHelpPageButtonPressed)
        });
        this.exitHelpButton = new Button(this, 220, 1015, exitHelpTexture, exitHelpTexture, pr_exitHelpTexture, buttonSound, function () {
            document.dispatchEvent(ButtonEvents.ExitHelpButtonPressed)
        });


    }
}


export class WinLinesHelpScene extends PIXI.Container {
    public nextPageButton: Button;
    public prevPageButton: Button;
    public exitHelpButton: Button;
    private sceneBackground: PIXI.Sprite;
    private resources: any;

    constructor(resources: any) {
        super();
        this.resources = resources;
        //background
        this.sceneBackground = new PIXI.Sprite(resources.lines_help_page.texture);
        this.addChild(this.sceneBackground);

        //buttons:
        let buttonSound = new Audio(resources.test.url);
        // enabled
        let buttonsBaseTexture: PIXI.BaseTexture = PIXI.BaseTexture.fromImage(resources.inhelp_buttons.url),

            exitHelpTexture: PIXI.Texture = new PIXI.Texture(buttonsBaseTexture, new PIXI.Rectangle(0, 3, 335, 115)),
            prevHelpTexture: PIXI.Texture = new PIXI.Texture(buttonsBaseTexture, new PIXI.Rectangle(3, 122, 178, 115)),
            nextHelpTexture: PIXI.Texture = new PIXI.Texture(buttonsBaseTexture, new PIXI.Rectangle(3, 240, 178, 115));
        //pressed
        let pr_buttonsBaseTexture: PIXI.BaseTexture = PIXI.BaseTexture.fromImage(resources.inhelp_buttons_pressed.url),

            pr_exitHelpTexture: PIXI.Texture = new PIXI.Texture(pr_buttonsBaseTexture, new PIXI.Rectangle(0, 3, 335, 115)),
            pr_prevHelpTexture: PIXI.Texture = new PIXI.Texture(pr_buttonsBaseTexture, new PIXI.Rectangle(3, 123, 178, 115)),
            pr_nextHelpTexture: PIXI.Texture = new PIXI.Texture(pr_buttonsBaseTexture, new PIXI.Rectangle(3, 240, 178, 115));

        this.nextPageButton = new Button(this, 1765, 1015, nextHelpTexture, nextHelpTexture, pr_nextHelpTexture, buttonSound, function () {
            document.dispatchEvent(ButtonEvents.NextHelpPageButtonPressed)
        });
        this.prevPageButton = new Button(this, 1570, 1015, prevHelpTexture, prevHelpTexture, pr_prevHelpTexture, buttonSound, function () {
            document.dispatchEvent(ButtonEvents.PrevHelpPageButtonPressed)
        });
        this.exitHelpButton = new Button(this, 220, 1015, exitHelpTexture, exitHelpTexture, pr_exitHelpTexture, buttonSound, function () {
            document.dispatchEvent(ButtonEvents.ExitHelpButtonPressed)
        });
    }
}


export class GambleScene extends PIXI.Container {

    private sceneBackground: PIXI.Sprite;
    public resources: any;
    public collectButton: Button;
    public redButton: Button;
    public blackButton: Button;
    public  bankField: NumericField;
    public doubleToField: NumericField;
    public gambleCard: GambleCard;
    public gambleHistory: GambleHistory;
    public textField: TextContainer;


    constructor(resources: any) {
        super();
        this.resources = resources;
        //background
        this.sceneBackground = new PIXI.Sprite(resources.gamble_bg.texture);
        this.addChild(this.sceneBackground);

        //buttons:
        let buttonSound = new Audio(resources.test.url);
        // enabled

        this.collectButton = new Button(this, 960, 1000, resources.gamble_collect.texture, resources.gamble_collect_dis.texture, resources.gamble_collect_pressed.texture, buttonSound, function () {
            document.dispatchEvent(ButtonEvents.GambleCollectPressed)
        });
        //enabled RedBlack
        let redBlackBase = PIXI.BaseTexture.fromImage(resources.red_black.url),
            red: PIXI.Texture = new PIXI.Texture(redBlackBase, new PIXI.Rectangle(0,0,303,303)),
            black: PIXI.Texture = new PIXI.Texture(redBlackBase, new PIXI.Rectangle(0,303,303,303));
        //dis RedBlack
        let redBlackDisBase = PIXI.BaseTexture.fromImage(resources.red_black_dis.url),
            red_dis: PIXI.Texture = new PIXI.Texture(redBlackDisBase, new PIXI.Rectangle(0,0,303,303)),
            black_dis: PIXI.Texture = new PIXI.Texture(redBlackDisBase, new PIXI.Rectangle(0,303,303,303));
        let redBlackPresBase = PIXI.BaseTexture.fromImage(resources.red_black_pressed.url),
            red_pressed: PIXI.Texture = new PIXI.Texture(redBlackPresBase, new PIXI.Rectangle(0,0,303,303)),
            black_pressed: PIXI.Texture = new PIXI.Texture(redBlackPresBase, new PIXI.Rectangle(0,303,303,303));

        this.redButton = new Button(this, 600,550, red_pressed, red_dis, red, buttonSound, function () {
            document.dispatchEvent(ButtonEvents.GambleRedPressed);
        });
        this.blackButton = new Button(this, 1300,550, black_pressed, black_dis, black, buttonSound, function () {
            document.dispatchEvent(ButtonEvents.GambleBlackPressed);
        });

        this.bankField = new NumericField(this, FontStyles.GambleText, 632, 851, resources.bank_bg.texture, buttonSound);
        this.doubleToField = new NumericField(this, FontStyles.GambleText, 962, 851, resources.bank_bg.texture, buttonSound);

        this.gambleCard = new GambleCard(this, 950, 550, resources.cardback.url, resources.cards.url);

        this.gambleHistory = new GambleHistory(this, 840, 250, 0.2, 5,resources.cardback.url, resources.cards.url);

        this.textField = new TextContainer(this, FontStyles.GambleText, 960,760, resources.gamble_text_bg.texture);



    }

}