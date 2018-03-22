/**
 * Created by tarasg on 10/6/2017.
 */
import {BonusGameScene} from "../Scenes/GameScenes";
import {FontStyles} from "../Utils/fontStyles";
import {CreateAnimation, formatStakeAmount} from "../Utils/helperFuncs";
import {CountUp} from "../Utils/counter";
import BaseTexture = PIXI.BaseTexture;
import {
    cherry_anim_obj,
    lemon_anim_obj,
    orange_anim_obj,
    plum_anim_obj,
    waterm_anim_obj
} from "../Utils/animation_objects";
import {app} from "../main";
import {AnimationEndEvent} from "../Events/AnimationEvents";



let typeMap = [
    {'sheet': 'wmBonusBurn', 'frames': waterm_anim_obj},
    {'sheet': 'plumBonusBurn', 'frames': plum_anim_obj},
    {'sheet': 'orangeBonusBurn', 'frames': orange_anim_obj},
    {'sheet': 'lemonBonusBurn', 'frames': lemon_anim_obj},
    {'sheet': 'cherryBonusBurn', 'frames': cherry_anim_obj}
];


export class FruitObject {
    public id: number;
    public fruitType: number; // wm=0; plum=1; orange=2; lemon=3; cherry=4
    public selected: boolean;
    public symbolEnable: PIXI.Texture;
    public symbolDisable: PIXI.Texture;
    public symbolMissed: PIXI.Texture;
    public symbolOver: PIXI.Texture;
    public symbol: PIXI.Sprite;
    public burnAnimation: PIXI.extras.AnimatedSprite;
    public collect: PIXI.Sprite;
    public collectSelected: PIXI.Texture;
    public collectMissed: PIXI.Texture;
    public amount: PIXI.Text;
    public counter: any;
    public x: number;
    public y: number;
    public fruitContainer: PIXI.Container;
    public scene: BonusGameScene;
    public resources: any;
    public fruitWidth: number = 240;
    public fruitHeight: number = 225;
    public result: number = 500;

    constructor(scene: BonusGameScene, x: number, y: number, id: number, type: number, resources: any) {
        this.x = x;
        this.y = y;
        this.id = id;
        this.fruitType = type;
        this.scene = scene;
        this.resources = resources;
        this.selected = false;

        this.fruitContainer = new PIXI.Container();
        this.fruitContainer.x = x;
        this.fruitContainer.y = y;

        // create textures:
        let DisabledFruitsBase = PIXI.BaseTexture.fromImage(resources.bonus_symbols_disabled.url),
            EnabledFruitsBase = PIXI.BaseTexture.fromImage(resources.bonus_symbols.url),
            MissedFruitsBase = PIXI.BaseTexture.fromImage(resources.bonus_symbols_missed.url),
            OverFruitsBase = PIXI.BaseTexture.fromImage(resources.bonus_symbols_over.url);

        let fruitRect = new PIXI.Rectangle(0, this.fruitHeight * this.fruitType, this.fruitWidth, this.fruitHeight);

        this.symbolDisable = new PIXI.Texture(DisabledFruitsBase, fruitRect);
        this.symbolEnable = new PIXI.Texture(EnabledFruitsBase, fruitRect);
        this.symbolMissed = new PIXI.Texture(MissedFruitsBase, fruitRect);
        this.symbolOver = new PIXI.Texture(OverFruitsBase, fruitRect);

        // Symbol
        this.symbol = new PIXI.Sprite(this.symbolDisable);
        this.symbol.anchor.set(0.5, 0.5);
        this.symbol.x = this.fruitWidth / 2;
        this.symbol.y = this.fruitHeight / 2;
        this.symbol.interactive = false;
        this.symbol.buttonMode = true;
        this.symbol.on('pointerdown', this.onUserClick.bind(this));
        this.fruitContainer.addChild(this.symbol);

        // Text
        this.amount = new PIXI.Text('', FontStyles.counterFont);
        this.amount.visible = false;
        this.amount.anchor.set(0.5, 0.5);
        this.amount.x = this.symbol.x;
        this.amount.y = this.symbol.y;
        this.fruitContainer.addChild(this.amount);

        // Burn Animation
        let animUrl: string = this.resources[typeMap[this.fruitType].sheet].url,
            animFrames = typeMap[this.fruitType].frames;
        this.burnAnimation = CreateAnimation(PIXI.BaseTexture.fromImage(animUrl), animFrames);
        this.burnAnimation.anchor.set(0.5, 0.5);
        this.burnAnimation.x = this.symbol.x - 5;
        this.burnAnimation.y = this.symbol.y - 20;
        this.burnAnimation.visible = false;
        this.burnAnimation.loop = false;
        this.burnAnimation.onComplete = this.onBurnComplete.bind(this);
        this.fruitContainer.addChild(this.burnAnimation);

        // Collect
        this.collectSelected = resources.collect_bonus.texture;
        this.collectMissed = resources.collect_bonus_missed.texture;
        this.collect = new PIXI.Sprite(this.collectSelected);
        this.collect.anchor.set(0.5, 0.5);
        this.collect.x = this.symbol.x;
        this.collect.y = this.symbol.y;
        this.collect.visible = false;
        this.fruitContainer.addChild(this.collect);

        // Count Up Result
        this.amount = new PIXI.Text('', FontStyles.counterFont);
        this.amount.anchor.set(0.5, 0.5);
        this.amount.x = this.symbol.x;
        this.amount.y = this.symbol.y;
        this.amount.visible = false;
        this.counter = new CountUp(this.amount, 0.0, 0.0, 2, 0.5, {});
        this.counter.start(function () {
            let event = new CustomEvent('FruitCounterEnded', {'detail': {'result': this.result}});
            document.dispatchEvent(event);
        }.bind(this));
        this.fruitContainer.addChild(this.amount);


        this.scene.addChild(this.fruitContainer);
    }

    private onUserClick() {
        this.symbol.visible = false;
        this.amount.visible = false;
        this.selected = true;
        let userChoose = new CustomEvent('userChoose');
        document.dispatchEvent(userChoose);
        this.burnAnimation.visible = true;
        this.burnAnimation.play()
    }

    private onBurnComplete() {
        this.burnAnimation.stop();
        this.burnAnimation.visible = false;
        this.showResult();
    }

    private showResult() {
        let userShowBonusResult = new CustomEvent('showResults');
        document.dispatchEvent(userShowBonusResult);
        if (this.result == 0) {
            this.collect.texture = this.collectSelected;
            this.collect.visible = true;
            let collectEvent = new CustomEvent('collectBonusEvent');
            document.dispatchEvent(collectEvent);
        } else {
            this.amount.style = FontStyles.counterFont;
            this.amount.visible = true;
            this.addValue(this.result);
        }
    }

    public addValue(value: number): void {
        this.counter.update(this.counter.endVal + value);
    }

    public substractValue(value: number): void {
        this.counter.updateStack(this.counter.endVal - value);
    }

    public countTill(value: number): void {
        this.counter.update(value);
    }

    public enable() {
        this.symbol.texture = this.symbolEnable;
        this.symbol.interactive = true;
    }

    public disable() {
        this.symbol.interactive = false;
        this.amount.visible = false;
        this.symbol.visible = true;
        this.symbol.texture = this.symbolDisable;
    }

    public over() {
        this.symbol.texture = this.symbolOver;
    }

    public showPossibleWin() {
        if (this.result == 0) {
            this.collect.texture = this.collectMissed;
            this.collect.visible = true;
        } else {
            this.amount.text = formatStakeAmount(this.result * 100);
            this.amount.style = FontStyles.possibleWincounterFont;
            this.amount.visible = true
        }
    }

    public setPossibleWinsDisabled() {
        this.symbol.interactive = false;
        this.symbol.texture = this.symbolMissed;
    }

    public reset() {
        this.disable();
        this.collect.visible = false;
        this.amount.style = FontStyles.counterFont;
        this.selected = false;
        this.countTill(0);
    }


    public pumpAnim(): void {
        this.over();
        let directionUp = true;
        app.ticker.add(pumpSymbol, this);

        function pumpSymbol(timedelta: number): void {

            if (this.symbol.scale.x < 1.2 && directionUp) {
                this.symbol.scale.x = Math.min(this.symbol.scale.x + (0.01 * timedelta), 1.2);
                this.symbol.scale.y = Math.min(this.symbol.scale.y + (0.01 * timedelta), 1.2);
            } else if (this.symbol.scale.x == 1.2 && directionUp) {
                directionUp = false;
            } else {
                this.symbol.scale.x = Math.max(this.symbol.scale.x - (0.01 * timedelta), 1);
                this.symbol.scale.y = Math.max(this.symbol.scale.y - (0.01 * timedelta), 1);
                if (this.symbol.scale.x == 1) {
                    this.disable();
                    let animEndEvent = new CustomEvent('pumpSymbolEnd', {'detail': {'fruitType': this.fruitType}});
                    document.dispatchEvent(animEndEvent);
                    app.ticker.remove(pumpSymbol, this);
                }
            }
        }
    }
}