/**
 * Created by tarasg on 10/6/2017.
 */


import {CountUp} from "../Utils/counter";
import {app} from "../main";
import {BonusGameScene} from "../Scenes/GameScenes";
export class BonusFinalResultWindow {


    public fieldContainer: PIXI.Container;
    public sprite: PIXI.Sprite | any;
    public textSprite: PIXI.Sprite;
    public textStyle: any;
    public text: PIXI.Text;
    public counter: any;
    public x: number;
    public y: number;
    public scene: BonusGameScene;
    public sound: any;
    private resources: any;
    public totalWin: number = 0;



    constructor(scene: BonusGameScene,textStyle: any, x: number, y: number, resources:any, sound: any, x_delta=0) {
        // enabled_img, dis_img, pressed_img:  PIXI.Textutre or string url to the image
        this.x = x;
        this.y = y;
        this.textStyle = textStyle;
        this.sound = sound;
        this.scene = scene;
        this.resources = resources;


        this.fieldContainer = new PIXI.Container();
        this.fieldContainer.x = x;
        this.fieldContainer.y = y;
        this.fieldContainer.visible = false;

        this.sprite = new PIXI.Sprite(resources.dialog_box.texture);
        this.fieldContainer.addChild(this.sprite);

        // bonus win text image
        this.textSprite = new PIXI.Sprite(resources.dialog_bonus_win.texture);
        this.textSprite.anchor.set(0.5, 0.5);
        this.textSprite.x = this.sprite.width/2;
        this.textSprite.y = (this.sprite.height/6)*2;
        this.fieldContainer.addChild(this.textSprite);

        // add text
        this.text = new PIXI.Text('', this.textStyle);
        this.fieldContainer.addChild(this.text);
        this.text.anchor.set(0.5, 0.5);
        this.text.x = this.sprite.width/2 + x_delta;
        this.text.y = (this.sprite.height/6)*4;

        this.scene.addChild(this.fieldContainer);

        // counter
        this.counter = new CountUp(this.text, 0.0, 0.0, 2, 3, {});
        this.counter.callback = function () {
            let finalCounterEnd = new CustomEvent('finalCounterEnd');
            document.dispatchEvent(finalCounterEnd);
        };
        this.sprite.model = this;


    }

    public addValue(value: number): void {
        this.counter.update(this.counter.endVal+value);
    }

    public substractValue(value: number): void {
        this.counter.updateStack(this.counter.endVal - value);
    }

    public countTill(value: number): void {
        this.counter.update(value);
    }

    public hide() {
        this.fieldContainer.visible = false;
        this.fieldContainer.y = 0 - this.sprite.height;
        this.countTill(0);
    }

    public show() {
        this.fieldContainer.visible = true;
        app.ticker.add(showAnim, this);

        function showAnim(timedelta:number) {
            if (this.fieldContainer.y < (this.scene.sceneBackground.height/2 - this.sprite.height/2)) {
                this.fieldContainer.y = Math.min((this.fieldContainer.y+20*timedelta), (this.scene.sceneBackground.height/2 - this.sprite.height/2))
            } else {
                app.ticker.remove(showAnim, this);
                setTimeout(function () {
                    this.countTill(this.totalWin);
                }.bind(this), 1000);
            }
        }
    }

    public pumpAnim(): void {
        let directionUp = true;
        let countCycle = 0;
        app.ticker.add(pumpAmount, this);

        function pumpAmount(timedelta: number): void {

            if (this.text.scale.x < 1.2 && directionUp) {
                this.text.scale.x = Math.min(this.text.scale.x+(0.01*timedelta), 1.2);
                this.text.scale.y = Math.min(this.text.scale.y+(0.01*timedelta), 1.2);
            } else if (this.text.scale.x == 1.2 && directionUp) {
                directionUp = false;
            } else {
                this.text.scale.x = Math.max(this.text.scale.x-(0.01*timedelta), 1);
                this.text.scale.y = Math.max(this.text.scale.y-(0.01*timedelta), 1);
                if (this.text.scale.x == 1 && countCycle == 5) {
                    let Event = new CustomEvent('pumpWinAmountEnd');
                    document.dispatchEvent(Event);
                    app.ticker.remove(pumpAmount, this);
                } else if (this.text.scale.x == 1) {
                    countCycle++;
                    directionUp = true;
                }
            }
        }
    }



}