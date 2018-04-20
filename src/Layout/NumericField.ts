/**
 * Created by tarasg on 9/28/2017.
 */

import {CountUp} from "../Utils/counter";
import {app} from "../main";
import { buttonResources } from "./buttonNames";
export class NumericField {

    public fieldBackGround : PIXI.Texture;
    public fieldContainer: PIXI.Container;
    public sprite: PIXI.Sprite | any;
    public textStyle: any;
    public text: PIXI.Text;
    public counter: any;
    public x: number;
    public y: number;
    public scene: PIXI.Container;


    constructor(scene: PIXI.Container, name:string, x: number, y: number, resources: any, textStyle: any, x_delta=0) {
        // enabled_img, dis_img, pressed_img:  PIXI.Textutre or string url to the image
        this.x = x;
        this.y = y;
        this.textStyle = textStyle;
        this.scene = scene;
        this.fieldBackGround  =  resources[buttonResources[name].background];


        this.fieldContainer = new PIXI.Container();
        this.fieldContainer.x = this.x;
        this.fieldContainer.y = this.y;

        this.sprite = new PIXI.Sprite(this.fieldBackGround);
        this.sprite.anchor.set(0.5, 0.5);
        this.sprite.x = this.sprite.width/2;
        this.sprite.y = this.sprite.height/2;
        this.fieldContainer.addChild(this.sprite);

        // add text
        this.text = new PIXI.Text('', this.textStyle);
        this.fieldContainer.addChild(this.text);
        this.text.anchor.set(0.5, 0.5);
        this.text.x = this.sprite.x+x_delta;
        this.text.y = this.sprite.y;

        this.scene.addChild(this.fieldContainer);

        // counter
        this.counter = new CountUp(this.text, 0.0, 0.0, 2, 0.5, {});
        this.sprite.model = this;


    }

    public addValue(value: number): void {
        this.counter.update(this.counter.endVal+value/100);
    }

    public substractValue(value: number): void {
        this.counter.update(this.counter.endVal - value/100);
    }

    public countTill(value: number): void {
        this.counter.update(value/100);
    }

    public hide() {
        this.fieldContainer.visible = false;
    }

    public show() {
        this.fieldContainer.visible = true;
    }

}

export class BalanceFieldWithHideCreditsAnimation extends NumericField {

    public show_credits_sprite: PIXI.Sprite;
    public show_credits_texture : PIXI.Texture;
    public hide_credits_sprite: PIXI.Sprite;
    public hide_credits_texture: PIXI.Texture;
    private containerMask: PIXI.Graphics;

    constructor(scene: PIXI.Container, name:string, x: number, y: number, resources:any, textStyle: any){
        super(scene, name, x, y, resources, textStyle);

        this.show_credits_texture  =  resources[buttonResources[name].show_credits];
        this.hide_credits_texture = resources[buttonResources[name].hide_credits];

        // add press to hide img text
        this.hide_credits_sprite = new PIXI.Sprite(this.hide_credits_texture);
        this.hide_credits_sprite.anchor.set(0.5, 0.5);
        this.hide_credits_sprite.x = this.sprite.width/2;
        this.hide_credits_sprite.y = this.sprite.height/2 + 25;
        this.fieldContainer.addChild(this.hide_credits_sprite);

        // add show credit image
        this.show_credits_sprite = new PIXI.Sprite(this.show_credits_texture);
        this.show_credits_sprite.anchor.set(0.5, 0.5);
        this.show_credits_sprite.x = this.show_credits_sprite.width/2;
        this.show_credits_sprite.y = this.show_credits_sprite.height/2 - this.show_credits_sprite.height;
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

    private initializeMask() {
        this.scene.addChild(this.containerMask);
        this.fieldContainer.mask = this.containerMask;
        this.containerMask.lineStyle(0);
        this.containerMask.x = this.fieldContainer.x;
        this.containerMask.y = this.fieldContainer.y;



        this.containerMask.beginFill(0x8bc5ff);
        let mask_x = this.show_credits_sprite.x - (this.show_credits_sprite.width/2),
            mask_y = this.show_credits_sprite.y + (this.show_credits_sprite.height/2);
        this.containerMask.drawRect(mask_x, mask_y, this.fieldContainer.width, this.show_credits_sprite.height);

         this.containerMask.endFill();
    }

    public hideCredits() {

        app.ticker.add(hideCreditsAnimation, this);

         function hideCreditsAnimation(timedelta: number) {
             this.show_credits_sprite.interactive = false;
             this.sprite.interactive = false;
             if (this.show_credits_sprite.y < this.sprite.y) {
                 this.show_credits_sprite.y = Math.min((this.show_credits_sprite.y+ 5*timedelta), this.sprite.y)

             } else {
                 app.ticker.remove(hideCreditsAnimation, this);
                 this.show_credits_sprite.interactive = true;
                 this.sprite.interactive = true;
             }
        }
    }

    public showCredits() {

        app.ticker.add(showCreditsAnimation, this);

        function showCreditsAnimation(timedelta: number) {
            this.show_credits_sprite.interactive = false;
            this.sprite.interactive = false;
            if (this.show_credits_sprite.y+this.show_credits_sprite.height > this.sprite.y) {
                this.show_credits_sprite.y -= 5*timedelta

            } else {
                this.show_credits_sprite.y = this.sprite.y - this.show_credits_sprite.height;
                app.ticker.remove(showCreditsAnimation, this);
                this.isShown = true;
                this.show_credits_sprite.interactive = true;
                this.sprite.interactive = true;
            }
        }
    }
}
