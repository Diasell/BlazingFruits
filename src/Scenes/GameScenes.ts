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

        // this.startButton = new Button(this, 1635, 960, resources.start.url, resources.start_dis.url, resources.start_pressed.url, buttonSound, function () {
        //     document.dispatchEvent(ButtonEvents.StartButtonPressed);
        // });
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